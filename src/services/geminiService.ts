import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateArticles() {
  const prompt = `
    Generate 3 professional blog article summaries for a gaming rewards platform called "NovaRewards".
    Each article should build trust and authority.
    
    Format as a JSON array of objects:
    [
      {
        "title": "...",
        "category": "Guides|Earnings|Crypto|Security",
        "excerpt": "...",
        "date": "..."
      }
    ]
    
    Topics: 
    1. A strategy guide for reaching the $5 cashout fast.
    2. Transparency around Bitcoin payouts and processing.
    3. Security measures to protect user data and earnings.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    // In @google/genai, the result has a candidates array or simplified properties
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Basic cleanup to extract JSON
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
