const express = require("express");
const multer = require("multer");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function analyzeImageWithClaude(base64Image, mediaType) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const prompt = `You are an expert food analyst. Analyze this image of food ingredients/leftovers.

Identify ALL visible food items and return a JSON response with this exact structure:
{
  "ingredients": [
    {
      "id": "unique_short_id",
      "name": "Ingredient Name",
      "category": "vegetable|fruit|protein|dairy|grain|condiment|herb|other",
      "freshness": "fresh|good|use_soon|questionable",
      "quantity": "estimated amount (e.g., '2 cups', '3 pieces', 'small bunch')",
      "notes": "brief observation about state or preparation"
    }
  ],
  "scene_description": "brief 1-sentence description of what you see",
  "confidence": "high|medium|low"
}

Be thorough - identify every visible food item. Focus on common household ingredients.
Return ONLY the JSON, no other text.`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
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
    throw new Error("Failed to parse ingredient analysis response");
  }
}

// POST /api/analyze - analyze uploaded image
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const base64 = req.file.buffer.toString("base64");
    const mediaType = req.file.mimetype;

    const result = await analyzeImageWithClaude(base64, mediaType);

    // Add unique IDs if missing
    result.ingredients = (result.ingredients || []).map((item, i) => ({
      ...item,
      id: item.id || `ing_${i}_${Date.now()}`,
    }));

    res.json({
      success: true,
      ...result,
      analyzed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: err.message || "Analysis failed" });
  }
});

// POST /api/analyze/base64 - analyze base64 encoded image (for frontend camera capture)
router.post("/base64", express.json({ limit: "15mb" }), async (req, res) => {
  try {
    const { image, mediaType = "image/jpeg" } = req.body;
    if (!image) return res.status(400).json({ error: "No image data provided" });

    const base64 = image.replace(/^data:image\/\w+;base64,/, "");
    const result = await analyzeImageWithClaude(base64, mediaType);

    result.ingredients = (result.ingredients || []).map((item, i) => ({
      ...item,
      id: item.id || `ing_${i}_${Date.now()}`,
    }));

    res.json({
      success: true,
      ...result,
      analyzed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Analyze base64 error:", err.message);
    res.status(500).json({ error: err.message || "Analysis failed" });
  }
});

module.exports = router;
