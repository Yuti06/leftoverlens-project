import React, { useState } from "react";
import {
  ArrowLeft, Clock, Users, ChefHat, Check, ShoppingBag,
  Leaf, Share2, RotateCcw, CheckCircle, Circle
} from "lucide-react";

export default function RecipeDetailPage({ recipe, onBack, onReset }) {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [madeIt, setMadeIt] = useState(false);
  const [showShopping, setShowShopping] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!recipe) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <p style={{ color: "var(--smoke)" }}>No recipe selected.</p>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: 16 }}>Go back</button>
      </div>
    );
  }

  const toggleStep = (idx) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const missingItems = recipe.missing_ingredients || [];
  const usedItems = recipe.ingredients_used || [];
  const allSteps = recipe.steps || [];
  const progress = allSteps.length > 0 ? Math.round((completedSteps.size / allSteps.length) * 100) : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `LeftoverLens: ${recipe.name}`,
        text: recipe.description,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${recipe.name}\n\n${recipe.description}`).then(() => {
        alert("Recipe name copied to clipboard!");
      });
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
      {/* Back */}
      <button onClick={onBack} className="btn btn-ghost" style={{ marginBottom: 24, paddingLeft: 0 }}>
        <ArrowLeft size={16} /> All recipes
      </button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--forest), var(--moss))",
        borderRadius: "var(--radius-xl)",
        padding: "32px 28px",
        color: "white",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "0.75rem",
              opacity: 0.7, marginBottom: 8, letterSpacing: "0.08em",
            }}>
              {recipe.cuisine?.toUpperCase()} · {recipe.difficulty?.toUpperCase()}
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 12,
            }}>
              {recipe.name}
            </h1>
            <p style={{ opacity: 0.85, fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 480 }}>
              {recipe.description}
            </p>
          </div>

          <button
            onClick={handleShare}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
              borderRadius: "var(--radius)",
              padding: "8px 14px",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              fontSize: "0.85rem",
              flexShrink: 0,
              height: "fit-content",
            }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
          {[
            { icon: Clock, label: `${recipe.time_minutes} min` },
            { icon: Users, label: `${recipe.servings} servings` },
            { icon: ChefHat, label: recipe.difficulty },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9, fontSize: "0.9rem" }}>
              <Icon size={15} /> {label}
            </div>
          ))}
          {recipe.match_score && (
            <div style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: "0.82rem",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}>
              {recipe.match_score}% match
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {allSteps.length > 0 && completedSteps.size > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.82rem", color: "var(--smoke)" }}>
            <span>Cooking progress</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--moss)", fontWeight: 600 }}>
              {completedSteps.size}/{allSteps.length} steps
            </span>
          </div>
          <div style={{ height: 6, background: "var(--parchment)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--moss), var(--fern))",
              borderRadius: 3,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

        {/* Ingredients used */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--forest)", marginBottom: 14 }}>
            Ingredients you're using
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {usedItems.map((item) => (
              <span key={item} className="tag tag-green">
                <Check size={11} /> {item}
              </span>
            ))}
          </div>
        </div>

        {/* Missing ingredients */}
        {missingItems.length > 0 && (
          <div className="card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--forest)" }}>
                Missing items
              </h2>
              <button
                onClick={() => setShowShopping(!showShopping)}
                className="btn btn-secondary"
                style={{ fontSize: "0.8rem", padding: "6px 14px" }}
              >
                <ShoppingBag size={13} /> Shopping list
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {missingItems.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px",
                  background: "var(--parchment)",
                  borderRadius: "var(--radius-sm)",
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    {item.substitute && (
                      <span style={{ color: "var(--moss)", fontSize: "0.82rem", marginLeft: 8 }}>
                        → substitute: {item.substitute}
                      </span>
                    )}
                  </div>
                  {!item.substitute && (
                    <span className="tag tag-amber" style={{ fontSize: "0.72rem" }}>Required</span>
                  )}
                </div>
              ))}
            </div>

            {showShopping && (
              <div style={{
                marginTop: 14,
                padding: "14px 16px",
                background: "#e8f5e0",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
              }}>
                <strong style={{ color: "var(--moss)", display: "block", marginBottom: 8 }}>
                  🛒 Shopping list for {recipe.name}
                </strong>
                {missingItems.map((item, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    • {item.name}
                    {item.substitute && <em style={{ color: "var(--smoke)" }}> (or: {item.substitute})</em>}
                  </div>
                ))}
                <p style={{ marginTop: 10, color: "var(--moss)", fontSize: "0.8rem" }}>
                  💡 Tip: Buy smaller quantities to reduce future waste!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Steps */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--forest)", marginBottom: 16 }}>
            Instructions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allSteps.map((step, i) => {
              const done = completedSteps.has(i);
              return (
                <div
                  key={i}
                  onClick={() => toggleStep(i)}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "12px 16px",
                    borderRadius: "var(--radius)",
                    background: done ? "#e8f5e0" : "var(--parchment)",
                    cursor: "pointer",
                    transition: "background var(--transition)",
                    border: done ? "1px solid #c0e4a0" : "1px solid transparent",
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    {done
                      ? <CheckCircle size={20} color="var(--moss)" />
                      : <Circle size={20} color="var(--mist)" />}
                  </div>
                  <div>
                    <div style={{
                      fontSize: "0.72rem",
                      color: done ? "var(--moss)" : "var(--smoke)",
                      fontFamily: "var(--font-mono)",
                      marginBottom: 3,
                      fontWeight: 600,
                    }}>
                      STEP {i + 1}
                    </div>
                    <p style={{
                      color: done ? "var(--smoke)" : "var(--ink)",
                      lineHeight: 1.6,
                      fontSize: "0.92rem",
                      textDecoration: done ? "line-through" : "none",
                      textDecorationColor: "var(--mist)",
                    }}>
                      {step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waste tip */}
        {recipe.waste_tip && (
          <div style={{
            padding: "18px 20px",
            background: "#e8f5e0",
            border: "1px solid #c0e4a0",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            gap: 12,
          }}>
            <Leaf size={20} color="var(--moss)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: "var(--forest)", fontSize: "0.9rem" }}>Zero-waste tip</strong>
              <p style={{ color: "var(--moss)", fontSize: "0.88rem", lineHeight: 1.6, marginTop: 4 }}>
                {recipe.waste_tip}
              </p>
            </div>
          </div>
        )}

        {/* Nutrition */}
        {recipe.nutrition_highlights && (
          <div style={{
            padding: "14px 18px",
            background: "var(--cream)",
            borderRadius: "var(--radius)",
            fontSize: "0.85rem",
            color: "var(--smoke)",
            border: "1px solid var(--border)",
          }}>
            <strong style={{ color: "var(--ink)" }}>Nutrition highlights: </strong>
            {recipe.nutrition_highlights}
          </div>
        )}

        {/* Made it */}
        {!madeIt ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => { setMadeIt(true); setFeedback("made"); }}
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center", padding: "14px", borderRadius: 40 }}
            >
              <CheckCircle size={18} /> I made this!
            </button>
            <button
              onClick={onReset}
              className="btn btn-secondary"
              style={{ borderRadius: 40 }}
            >
              <RotateCcw size={16} /> Start over
            </button>
          </div>
        ) : (
          <div style={{
            padding: "24px",
            background: "linear-gradient(135deg, var(--forest), var(--moss))",
            borderRadius: "var(--radius-xl)",
            textAlign: "center",
            color: "white",
          }}>
            <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>🎉</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", marginBottom: 8 }}>
              Awesome! Less food wasted.
            </h3>
            <p style={{ opacity: 0.8, fontSize: "0.9rem", marginBottom: 20 }}>
              Every meal made from leftovers makes a difference. Want to scan more ingredients?
            </p>
            <button
              onClick={onReset}
              className="btn"
              style={{ background: "white", color: "var(--forest)", borderRadius: 40, fontWeight: 600 }}
            >
              Scan more ingredients
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
