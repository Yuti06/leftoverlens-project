import React, { useState, useCallback } from "react";
import {
  Plus, X, Edit2, Check, ChevronDown, ChevronUp, Loader,
  Leaf, AlertTriangle, Clock, ShoppingBag
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const FRESHNESS_CONFIG = {
  fresh: { label: "Fresh", color: "var(--sage)", tag: "tag-green", icon: "✓" },
  good: { label: "Good", color: "var(--fern)", tag: "tag-green", icon: "✓" },
  use_soon: { label: "Use Soon", color: "var(--earth)", tag: "tag-amber", icon: "⚡" },
  questionable: { label: "Questionable", color: "var(--rust)", tag: "tag-red", icon: "⚠" },
};

const DIETARY = ["none", "vegetarian", "vegan", "gluten-free", "dairy-free", "keto"];
const TIMES = [null, 15, 30, 60];
const CUISINES = ["any", "Italian", "Asian", "Mexican", "Mediterranean", "American", "Indian"];

export default function IngredientsPage({
  ingredients,
  setIngredients,
  sceneDescription,
  filters,
  setFilters,
  onGetRecipes,
  onScanAgain,
  onViewTips,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const urgentItems = ingredients.filter(
    (i) => i.freshness === "use_soon" || i.freshness === "questionable"
  );

  const removeIngredient = useCallback((id) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }, [setIngredients]);

  const startEdit = useCallback((item) => {
    setEditingId(item.id);
    setEditValue(item.name);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editValue.trim()) return;
    setIngredients((prev) =>
      prev.map((i) => i.id === editingId ? { ...i, name: editValue.trim() } : i)
    );
    setEditingId(null);
  }, [editingId, editValue, setIngredients]);

  const addIngredient = useCallback(() => {
    if (!newItem.trim()) return;
    const newIng = {
      id: `manual_${Date.now()}`,
      name: newItem.trim(),
      category: "other",
      freshness: "good",
      quantity: "some",
      notes: "Manually added",
    };
    setIngredients((prev) => [...prev, newIng]);
    setNewItem("");
    setAdding(false);
  }, [newItem, setIngredients]);

  const getSuggestions = useCallback(async () => {
    if (ingredients.length === 0) return;
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
      if (!data.recipes?.length) throw new Error("No recipes found for these ingredients.");
      onGetRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ingredients, filters, onGetRecipes]);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--forest)", marginBottom: 6 }}>
              Your ingredients
            </h1>
            {sceneDescription && (
              <p style={{ color: "var(--smoke)", fontSize: "0.9rem", fontStyle: "italic" }}>
                "{sceneDescription}"
              </p>
            )}
          </div>
          <button onClick={onScanAgain} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            Scan again
          </button>
        </div>

        {/* Urgency banner */}
        {urgentItems.length > 0 && (
          <div style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "#fef3d0",
            border: "1px solid #f4d88a",
            borderRadius: "var(--radius)",
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontSize: "0.88rem",
          }}>
            <AlertTriangle size={16} color="var(--earth)" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: "var(--earth)" }}>{urgentItems.length} item{urgentItems.length > 1 ? "s" : ""}</strong>
              {" "}need to be used soon: {urgentItems.map(i => i.name).join(", ")}.{" "}
              <button
                onClick={onViewTips}
                style={{ background: "none", border: "none", color: "var(--earth)", cursor: "pointer", fontWeight: 600, padding: 0, textDecoration: "underline" }}
              >
                View preservation tips →
              </button>
            </span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: "#fde8e0", border: "1px solid #f4b8a0", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, color: "var(--rust)", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      {/* Ingredient list */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            {ingredients.length} ITEMS DETECTED
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ingredients.map((item) => {
            const fc = FRESHNESS_CONFIG[item.freshness] || FRESHNESS_CONFIG.good;
            const isEditing = editingId === item.id;
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderLeft: `3px solid ${fc.color}`,
                  borderRadius: "var(--radius)",
                  transition: "box-shadow var(--transition)",
                }}
              >
                {isEditing ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                    style={{
                      flex: 1,
                      border: "1.5px solid var(--moss)",
                      borderRadius: "var(--radius-sm)",
                      padding: "4px 10px",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.95rem",
                      outline: "none",
                      color: "var(--ink)",
                    }}
                  />
                ) : (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 500, color: "var(--ink)" }}>{item.name}</span>
                      <span className={`tag ${fc.tag}`}>
                        {fc.icon} {fc.label}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--smoke)", marginTop: 2 }}>
                      {[item.quantity, item.category, item.notes].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {isEditing ? (
                    <button onClick={saveEdit} className="btn btn-ghost" style={{ padding: "4px 8px", color: "var(--moss)" }}>
                      <Check size={16} />
                    </button>
                  ) : (
                    <button onClick={() => startEdit(item)} className="btn btn-ghost" style={{ padding: "4px 8px" }}>
                      <Edit2 size={14} />
                    </button>
                  )}
                  <button onClick={() => removeIngredient(item.id)} className="btn btn-ghost" style={{ padding: "4px 8px", color: "var(--mist)" }}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add ingredient */}
        {adding ? (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
              placeholder="e.g. broccoli, leftover pasta..."
              autoFocus
              style={{
                flex: 1,
                border: "1.5px solid var(--moss)",
                borderRadius: "var(--radius)",
                padding: "10px 14px",
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                outline: "none",
                color: "var(--ink)",
              }}
            />
            <button onClick={addIngredient} className="btn btn-primary">Add</button>
            <button onClick={() => setAdding(false)} className="btn btn-ghost"><X size={16} /></button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="btn btn-ghost"
            style={{ marginTop: 8, color: "var(--moss)", width: "100%", justifyContent: "center", border: "1.5px dashed var(--border)", borderRadius: "var(--radius)" }}
          >
            <Plus size={16} /> Add missing ingredient
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 24 }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "space-between" }}
        >
          <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.9rem" }}>
            Recipe filters
          </span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showFilters && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: "0.82rem", color: "var(--smoke)", fontFamily: "var(--font-mono)", marginBottom: 8, display: "block" }}>DIETARY</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DIETARY.map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilters(f => ({ ...f, dietary: d }))}
                    className={`tag ${filters.dietary === d ? "tag-green" : "tag-grey"}`}
                    style={{ cursor: "pointer", border: "none", padding: "6px 14px" }}
                  >
                    {d === "none" ? "Any diet" : d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", color: "var(--smoke)", fontFamily: "var(--font-mono)", marginBottom: 8, display: "block" }}>MAX COOK TIME</label>
              <div style={{ display: "flex", gap: 8 }}>
                {TIMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilters(f => ({ ...f, maxTime: t }))}
                    className={`tag ${filters.maxTime === t ? "tag-green" : "tag-grey"}`}
                    style={{ cursor: "pointer", border: "none", padding: "6px 14px" }}
                  >
                    {t ? `≤${t}min` : "Any"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", color: "var(--smoke)", fontFamily: "var(--font-mono)", marginBottom: 8, display: "block" }}>CUISINE</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CUISINES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilters(f => ({ ...f, cuisine: c }))}
                    className={`tag ${filters.cuisine === c ? "tag-green" : "tag-grey"}`}
                    style={{ cursor: "pointer", border: "none", padding: "6px 14px" }}
                  >
                    {c === "any" ? "Any cuisine" : c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={getSuggestions}
          disabled={loading || ingredients.length === 0}
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: "center", padding: "16px", fontSize: "1rem", borderRadius: 40 }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 20, height: 20, borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
              Generating recipes...
            </>
          ) : (
            <>
              <ShoppingBag size={18} />
              Get recipe suggestions ({ingredients.length} items)
            </>
          )}
        </button>
        <button
          onClick={onViewTips}
          className="btn btn-secondary"
          style={{ borderRadius: 40, flexShrink: 0 }}
        >
          <Leaf size={16} /> Preservation tips
        </button>
      </div>

      {loading && (
        <p style={{ textAlign: "center", marginTop: 12, color: "var(--smoke)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
          AI is crafting recipes for your ingredients — ~10 seconds
        </p>
      )}
    </div>
  );
}
