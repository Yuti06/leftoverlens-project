import React, { useState, useCallback } from "react";
import {
  Clock, Users, ChefHat, ArrowLeft, Star, RefreshCw,
  ShoppingBag, Loader, AlertCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", tag: "tag-green" },
  medium: { label: "Medium", tag: "tag-amber" },
  hard: { label: "Hard", tag: "tag-red" },
};

function MatchBar({ score }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1,
        height: 6,
        background: "var(--parchment)",
        borderRadius: 3,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${score}%`,
          height: "100%",
          background: score >= 80 ? "var(--moss)" : score >= 60 ? "var(--earth)" : "var(--mist)",
          borderRadius: 3,
          transition: "width 0.8s ease",
        }} />
      </div>
      <span style={{
        fontSize: "0.78rem",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        color: score >= 80 ? "var(--moss)" : score >= 60 ? "var(--earth)" : "var(--smoke)",
        minWidth: 36,
        textAlign: "right",
      }}>
        {score}%
      </span>
    </div>
  );
}

function RecipeCard({ recipe, onSelect, index }) {
  const dc = DIFFICULTY_CONFIG[recipe.difficulty] || DIFFICULTY_CONFIG.easy;
  const missingCount = recipe.missing_ingredients?.length || 0;

  return (
    <div
      className="card fade-in"
      style={{
        padding: 0,
        cursor: "pointer",
        animationDelay: `${index * 80}ms`,
        transition: "transform var(--transition), box-shadow var(--transition)",
      }}
      onClick={() => onSelect(recipe)}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Top accent bar */}
      <div style={{
        height: 4,
        background: recipe.match_score >= 80
          ? "linear-gradient(90deg, var(--moss), var(--fern))"
          : recipe.match_score >= 60
          ? "linear-gradient(90deg, var(--earth), var(--amber))"
          : "var(--border)",
      }} />

      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          <h3 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.2rem",
            color: "var(--forest)",
            lineHeight: 1.25,
          }}>
            {recipe.name}
          </h3>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "var(--smoke)",
            padding: "3px 8px",
            background: "var(--parchment)",
            borderRadius: 20,
            flexShrink: 0,
          }}>
            {recipe.cuisine}
          </span>
        </div>

        <p style={{ color: "var(--smoke)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: 14 }}>
          {recipe.description}
        </p>

        {/* Match bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--smoke)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
            INGREDIENT MATCH
          </div>
          <MatchBar score={recipe.match_score} />
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--smoke)", fontSize: "0.85rem" }}>
            <Clock size={13} /> {recipe.time_minutes} min
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--smoke)", fontSize: "0.85rem" }}>
            <Users size={13} /> {recipe.servings} servings
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span className={`tag ${dc.tag}`} style={{ fontSize: "0.75rem" }}>
              {dc.label}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {(recipe.tags || []).slice(0, 4).map((tag) => (
            <span key={tag} className="tag tag-grey" style={{ fontSize: "0.74rem" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Missing items */}
        {missingCount > 0 && (
          <div style={{
            padding: "8px 12px",
            background: "var(--parchment)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.82rem",
            color: "var(--smoke)",
          }}>
            <span style={{ color: "var(--earth)", fontWeight: 600 }}>{missingCount} missing: </span>
            {recipe.missing_ingredients.map((m) => m.name).join(", ")}
            {recipe.missing_ingredients.some((m) => m.substitute) && (
              <span style={{ color: "var(--moss)" }}> · substitutes available</span>
            )}
          </div>
        )}

        <div style={{ marginTop: 14, color: "var(--moss)", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          View recipe & steps →
        </div>
      </div>
    </div>
  );
}

export default function RecipesPage({
  recipes,
  ingredients,
  filters,
  setFilters,
  onSelectRecipe,
  onBack,
  onRegenerate,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const regenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/recipes/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, filters }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate recipes");
      }
      const data = await res.json();
      onRegenerate(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ingredients, filters, onRegenerate]);

  const sorted = [...recipes].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <button onClick={onBack} className="btn btn-ghost" style={{ paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Ingredients
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--forest)", marginBottom: 4 }}>
            Recipe suggestions
          </h1>
          <p style={{ color: "var(--smoke)", fontSize: "0.9rem" }}>
            {sorted.length} recipes ranked by how many of your ingredients they use
          </p>
        </div>
        <button
          onClick={regenerate}
          disabled={loading}
          className="btn btn-secondary"
          style={{ fontSize: "0.85rem" }}
        >
          {loading ? <Loader size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <RefreshCw size={15} />}
          Regenerate
        </button>
      </div>

      {error && (
        <div style={{ background: "#fde8e0", border: "1px solid #f4b8a0", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center", color: "var(--rust)", fontSize: "0.9rem" }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div className="spinner" style={{ margin: "0 auto 16px", width: 32, height: 32 }} />
          <p style={{ color: "var(--smoke)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            Generating new recipe ideas...
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sorted.map((recipe, i) => (
            <RecipeCard
              key={recipe.id || i}
              recipe={recipe}
              onSelect={onSelectRecipe}
              index={i}
            />
          ))}
        </div>
      )}

      <div style={{
        marginTop: 32,
        padding: "16px 20px",
        background: "var(--cream)",
        borderRadius: "var(--radius)",
        fontSize: "0.85rem",
        color: "var(--smoke)",
        textAlign: "center",
        border: "1px solid var(--border)",
      }}>
        <ChefHat size={16} style={{ display: "inline", marginRight: 6, color: "var(--moss)" }} />
        Recipes are AI-generated and ranked by ingredient match. Always use your judgment on food safety.
      </div>
    </div>
  );
}
