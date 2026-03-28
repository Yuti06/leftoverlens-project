const express = require("express");
const router = express.Router();

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function generateRecipes(ingredients, filters = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const ingredientList = ingredients
    .map((i) => `- ${i.name} (${i.quantity || "some"}, ${i.freshness || "good"})`)
    .join("\n");

  const filterText = [
    filters.dietary && filters.dietary !== "none" ? `Dietary: ${filters.dietary}` : "",
    filters.maxTime ? `Max cooking time: ${filters.maxTime} minutes` : "",
    filters.cuisine && filters.cuisine !== "any" ? `Cuisine style: ${filters.cuisine}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const prompt = `You are a creative chef specializing in zero-waste cooking. Given these available ingredients, suggest recipes that minimize waste.

Available ingredients:
${ingredientList}

${filterText ? `Constraints: ${filterText}` : ""}

Return EXACTLY 5 recipe suggestions as a JSON array with this structure:
{
  "recipes": [
    {
      "id": "unique_id",
      "name": "Recipe Name",
      "description": "2-sentence description of the dish",
      "cuisine": "cuisine type",
      "time_minutes": 25,
      "difficulty": "easy|medium|hard",
      "servings": 2,
      "match_score": 92,
      "ingredients_used": ["ingredient names from the list"],
      "missing_ingredients": [
        {"name": "item", "substitute": "what can replace it or null"}
      ],
      "steps": [
        "Step 1: ...",
        "Step 2: ..."
      ],
      "waste_tip": "specific tip on using ALL ingredients to minimize waste",
      "nutrition_highlights": "brief nutrition note",
      "tags": ["quick", "vegetarian", etc]
    }
  ]
}

Rank by match_score (how many available ingredients are used, higher is better).
Prioritize recipes that use the most available ingredients especially those marked use_soon or questionable.
Return ONLY the JSON, no other text.`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
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
    throw new Error("Failed to parse recipe response");
  }
}

// POST /api/recipes/suggest
router.post("/suggest", async (req, res) => {
  try {
    const { ingredients, filters } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "At least one ingredient required" });
    }

    const result = await generateRecipes(ingredients, filters || {});

    res.json({
      success: true,
      ...result,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Recipe generation error:", err.message);
    res.status(500).json({ error: err.message || "Recipe generation failed" });
  }
});

// POST /api/recipes/shopping-list
router.post("/shopping-list", async (req, res) => {
  try {
    const { recipe, availableIngredients } = req.body;
    if (!recipe) return res.status(400).json({ error: "Recipe required" });

    const missing = recipe.missing_ingredients || [];
    const list = missing.map((item) => ({
      item: item.name,
      substitute: item.substitute,
      note: item.substitute ? `Can substitute with ${item.substitute}` : "Required",
    }));

    res.json({
      success: true,
      recipe_name: recipe.name,
      shopping_list: list,
      tip: "Buy smaller quantities to avoid future waste!",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
