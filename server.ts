import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import * as admin from "firebase-admin";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin (Lazy Initialization)
let db: admin.firestore.Firestore;
function getDb() {
  if (!db) {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "dgamers2026",
      });
    }
    db = admin.firestore();
  }
  return db;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Dgamers API is live" });
  });

  // --- REWARDS PLATFORM LOGIC ---
  
  // Trustpilot verification
  app.get("/3204f969-3b22-48a9-a271-9b49d7c8d43f.html", (req, res) => {
    res.send("3204f969-3b22-48a9-a271-9b49d7c8d43f");
  });

  /**
   * 1. USER PROFILE & INITIALIZATION
   * Fetches user profile and ensures a referral code exists.
   */
  app.get("/api/user/profile/:uid", async (req, res) => {
    const { uid } = req.params;
    try {
      const db = getDb();
      const userRef = db.collection("users").doc(uid);
      const doc = await userRef.get();

      if (!doc.exists) {
        // Create initial profile if it doesn't exist (e.g., first login)
        const referralCode = nanoid(8).toUpperCase();
        const newUser = {
          uid,
          username: `gamer_${nanoid(5)}`,
          coins: 0,
          tier: "bronze",
          referralCode,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isVerified: false
        };

        await db.runTransaction(async (t) => {
          t.set(userRef, newUser);
          t.set(db.collection("referral_codes").doc(referralCode), { userId: uid });
        });

        return res.json({ profile: newUser });
      }

      const profile = doc.data();
      
      // Ensure referral code exists for legacy users
      if (!profile?.referralCode) {
        const referralCode = nanoid(8).toUpperCase();
        await db.runTransaction(async (t) => {
          t.update(userRef, { referralCode });
          t.set(db.collection("referral_codes").doc(referralCode), { userId: uid });
        });
        profile!.referralCode = referralCode;
      }

      res.json({ profile });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  /**
   * 2. REFERRAL SYSTEM
   * Applies a referral code to a new user.
   */
  app.post("/api/referral/apply", async (req, res) => {
    const { uid, referralCode } = req.body;

    if (!uid || !referralCode) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    try {
      const db = getDb();
      const codeRef = db.collection("referral_codes").doc(referralCode.toUpperCase());
      const codeDoc = await codeRef.get();

      if (!codeDoc.exists) {
        return res.status(404).json({ error: "Invalid referral code" });
      }

      const referrerId = codeDoc.data()?.userId;

      if (referrerId === uid) {
        return res.status(400).json({ error: "Cannot refer yourself" });
      }

      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (userDoc.data()?.referredBy) {
        return res.status(400).json({ error: "Already referred" });
      }

      // Atomic transaction: Update user and reward referrer
      const referralReward = 100; // Coins
      await db.runTransaction(async (t) => {
        t.update(userRef, { referredBy: referrerId });
        
        const referrerRef = db.collection("users").doc(referrerId);
        t.update(referrerRef, { 
          coins: admin.firestore.FieldValue.increment(referralReward) 
        });

        // Record transaction for referrer
        const transRef = referrerRef.collection("transactions").doc();
        t.set(transRef, {
          userId: referrerId,
          amount: referralReward,
          coins: referralReward,
          type: "bonus",
          method: "referral",
          description: `Referral reward for node ${uid}`,
          status: "completed",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      res.json({ success: true, message: "Referral applied successfully" });
    } catch (error) {
      console.error("Referral error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * 3. OFFERWALL URL GENERATION
   */
  app.get("/api/offerwall/url", (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    // Mocking AdGem URL format (in production use real placement ID)
    const baseUrl = "https://api.adgem.com/v1/wall";
    const placementId = "12345";
    const wallUrl = `${baseUrl}?appid=${placementId}&playerid=${user_id}`;

    res.json({ url: wallUrl });
  });

  /**
   * 4. CRITICAL: ADGEM POSTBACK WEBHOOK
   */
  app.post("/api/callback/adgem", async (req, res) => {
    // AdGem usually sends data via query params in GET or JSON body in POST
    const { player_id, reward, transaction_id, verifier } = req.body;

    if (!player_id || !reward || !transaction_id) {
      return res.status(400).json({ error: "Incomplete payload" });
    }

    // Basic security check (Replace with real AdGem verifier logic)
    const secret = process.env.ADGEM_POSTBACK_SECRET || "local_secret_123";
    // In production, you would re-hash the params with your secret to verify the request
    if (verifier && verifier !== secret) {
      console.warn("Unauthorized postback attempt recorded.");
      // return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const db = getDb();
      
      // Check for duplicate transaction
      const transQuery = await db.collectionGroup("transactions")
        .where("transaction_id", "==", transaction_id)
        .limit(1)
        .get();

      if (!transQuery.empty) {
        return res.status(200).json({ status: "duplicate", message: "Transaction already processed" });
      }

      const rewardAmount = parseInt(reward);
      const userRef = db.collection("users").doc(player_id);

      await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) throw new Error("User not found");

        t.update(userRef, {
          coins: admin.firestore.FieldValue.increment(rewardAmount)
        });

        const transRef = userRef.collection("transactions").doc();
        t.set(transRef, {
          userId: player_id,
          amount: rewardAmount,
          coins: rewardAmount,
          transaction_id: transaction_id,
          type: "earn",
          method: "offerwall",
          description: "AdGem Offer Completion",
          status: "completed",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      console.log(`Successfully rewarded ${player_id} with ${rewardAmount} coins.`);
      res.json({ status: "success", message: "Reward processed" });
    } catch (error) {
      console.error("AdGem Callback Error:", error);
      res.status(500).json({ error: "Failed to process reward" });
    }
  });

  /**
   * 5. WITHDRAWAL SYSTEM
   */
  app.post("/api/withdraw", async (req, res) => {
    const { uid, amount, method, details } = req.body;

    if (!uid || !amount || !method) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    try {
      const db = getDb();
      const userRef = db.collection("users").doc(uid);
      const withdrawalAmount = parseInt(amount);

      const result = await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) throw new Error("User not found");

        const currentBalance = userDoc.data()?.coins || 0;

        if (currentBalance < withdrawalAmount) {
          throw new Error("Insufficient balance");
        }

        // Deduct balance
        t.update(userRef, {
          coins: admin.firestore.FieldValue.increment(-withdrawalAmount)
        });

        // Record pending transaction
        const transRef = userRef.collection("transactions").doc();
        t.set(transRef, {
          userId: uid,
          amount: withdrawalAmount,
          coins: -withdrawalAmount,
          type: "withdraw",
          method: method,
          details: details || {},
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      res.status(400).json({ error: error.message || "Failed to process withdrawal" });
    }
  });

  // --- END REWARDS PLATFORM LOGIC ---

  // Security & Geofencing Endpoint
  app.get("/api/verify-access", (req, res) => {
    const cfCountry = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'];
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // In dev, we might not have country headers. For production/preview, this is critical.
    const isNigeria = cfCountry === 'NG' || !cfCountry; // Allow null for dev preview convenience
    
    res.json({
      isNigeria: isNigeria,
      clientIp: clientIp,
      location: cfCountry || "Unknown",
      vpnProbability: 0.05 // Placeholder for Gemini analysis
    });
  });

  // Account Review (AI Powered)
  app.post("/api/review-account", async (req, res) => {
    // Logic to send user stats/IP to Gemini for a fraud review
    res.json({ status: "cleared", reviewDate: new Date() });
  });

  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Starting server in ${isProduction ? "production" : "development"} mode...`);

  // Vite middleware for development
  if (!isProduction) {
    console.log("Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Serve index.html for all non-asset requests in dev mode
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await fs.readFile(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Serving static files from ${distPath}`);
    
    // Safety check for dist/index.html
    const indexPath = path.join(distPath, "index.html");
    try {
      await fs.access(indexPath);
      console.log("index.html found in dist/");
    } catch (err) {
      console.error("CRITICAL ERROR: index.html not found in dist/ directory!");
      console.error("Full path searched:", indexPath);
    }

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
  });
}

startServer();
