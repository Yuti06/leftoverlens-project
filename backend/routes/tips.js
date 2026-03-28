const express = require("express");
const router = express.Router();

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function generatePreservationTips(ingredients) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const ingredientList = ingredients
    .map((i) => `- ${i.name} (freshness: ${i.freshness || "unknown"}, quantity: ${i.quantity || "some"})`)
    .join("\n");

  const prompt = `You are a food preservation expert. Provide actionable storage and preservation tips for these ingredients.

Ingredients:
${ingredientList}

Return a JSON object:
{
  "tips": [
    {
      "ingredient": "ingredient name",
      "shelf_life": "e.g., '3-5 days in fridge'",
      "storage_method": "brief storage instruction",
      "preservation_options": [
        {"method": "freeze", "instruction": "how to freeze it"},
        {"method": "pickle", "instruction": "if applicable"}
      ],
      "urgency": "use_today|use_this_week|good_for_now",
      "quick_tip": "one sentence tip to avoid waste"
    }
  ],
  "general_advice": "one overall tip for this collection of ingredients"
}

Return ONLY the JSON, no other text.`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse tips response");
  }
}

// POST /api/tips/preservation
router.post("/preservation", async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredients required" });
    }

    const result = await generatePreservationTips(ingredients);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Tips error:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate tips" });
  }
});

module.exports = router;
