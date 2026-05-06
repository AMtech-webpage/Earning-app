import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
