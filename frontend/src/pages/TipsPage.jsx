import React, { useState, useEffect } from "react";
import { ArrowLeft, Leaf, AlertTriangle, Snowflake, Clock, Loader, AlertCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const URGENCY_CONFIG = {
  use_today: { label: "Use Today", tag: "tag-red", icon: AlertTriangle, color: "var(--rust)" },
  use_this_week: { label: "Use This Week", tag: "tag-amber", icon: Clock, color: "var(--earth)" },
  good_for_now: { label: "Good for Now", tag: "tag-green", icon: Leaf, color: "var(--moss)" },
};

const PRESERVE_ICONS = {
  freeze: "❄️",
  pickle: "🫙",
  dehydrate: "🌞",
  blanch: "🥣",
  ferment: "🧪",
  cure: "🧂",
  juice: "🥤",
};

function TipCard({ tip, index }) {
  const uc = URGENCY_CONFIG[tip.urgency] || URGENCY_CONFIG.good_for_now;
  const Icon = uc.icon;

  return (
    <div
      className="card fade-in"
      style={{
        padding: "20px 22px",
        animationDelay: `${index * 60}ms`,
        borderTop: `3px solid ${uc.color}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--forest)" }}>
          {tip.ingredient}
        </h3>
        <span className={`tag ${uc.tag}`} style={{ flexShrink: 0 }}>
          <Icon size={11} /> {uc.label}
        </span>
      </div>

      {tip.quick_tip && (
        <p style={{ color: "var(--smoke)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: 14, fontStyle: "italic" }}>
          "{tip.quick_tip}"
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tip.storage_method && (
          <div style={{
            display: "flex", gap: 10,
            padding: "10px 14px",
            background: "var(--cream)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.86rem",
          }}>
            <span>📦</span>
            <div>
              <strong style={{ color: "var(--ink)", fontSize: "0.8rem" }}>Storage: </strong>
              <span style={{ color: "var(--smoke)" }}>{tip.storage_method}</span>
              {tip.shelf_life && (
                <span style={{
                  marginLeft: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--moss)",
                  fontWeight: 600,
                }}>
                  ({tip.shelf_life})
                </span>
              )}
            </div>
          </div>
        )}

        {(tip.preservation_options || []).map((opt, i) => (
          <div key={i} style={{
            display: "flex", gap: 10,
            padding: "10px 14px",
            background: "var(--parchment)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.86rem",
          }}>
            <span>{PRESERVE_ICONS[opt.method] || "💡"}</span>
            <div>
              <strong style={{ color: "var(--ink)", fontSize: "0.8rem", textTransform: "capitalize" }}>
                {opt.method}:{" "}
              </strong>
              <span style={{ color: "var(--smoke)" }}>{opt.instruction}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TipsPage({ ingredients, onBack }) {
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ingredients?.length) {
      setLoading(false);
      return;
    }

    async function fetchTips() {
      try {
        const res = await fetch(`${API_BASE}/api/tips/preservation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load tips");
        }
        const data = await res.json();
        setTips(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTips();
  }, []);

  const sortedTips = tips?.tips?.slice().sort((a, b) => {
    const order = { use_today: 0, use_this_week: 1, good_for_now: 2 };
    return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3);
  }) || [];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onBack} className="btn btn-ghost" style={{ marginBottom: 24, paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back to ingredients
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--forest)", marginBottom: 8 }}>
          Preservation tips
        </h1>
        <p style={{ color: "var(--smoke)", lineHeight: 1.6 }}>
          How to store and preserve your ingredients to minimize waste and maximize freshness.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div className="spinner" style={{ margin: "0 auto 16px", width: 32, height: 32 }} />
          <p style={{ color: "var(--smoke)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            Generating preservation tips...
          </p>
        </div>
      )}

      {error && (
        <div style={{
          background: "#fde8e0",
          border: "1px solid #f4b8a0",
          borderRadius: "var(--radius)",
          padding: "14px 18px",
          display: "flex", gap: 10, alignItems: "center",
          color: "var(--rust)", fontSize: "0.9rem",
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {tips?.general_advice && (
            <div style={{
              padding: "16px 20px",
              background: "#e8f5e0",
              border: "1px solid #c0e4a0",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              gap: 12,
              marginBottom: 24,
            }}>
              <Leaf size={20} color="var(--moss)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: "var(--forest)", fontSize: "0.9rem", display: "block", marginBottom: 4 }}>
                  General advice
                </strong>
                <p style={{ color: "var(--moss)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  {tips.general_advice}
                </p>
              </div>
            </div>
          )}

          {sortedTips.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "var(--smoke)" }}>
              <Leaf size={32} color="var(--border)" style={{ marginBottom: 12 }} />
              <p>No preservation tips available. Make sure ingredients are detected first.</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sortedTips.map((tip, i) => (
              <TipCard key={tip.ingredient || i} tip={tip} index={i} />
            ))}
          </div>

          {sortedTips.length > 0 && (
            <div style={{
              marginTop: 24,
              padding: "12px 16px",
              background: "var(--parchment)",
              borderRadius: "var(--radius)",
              fontSize: "0.8rem",
              color: "var(--smoke)",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
            }}>
              ⚠️ Always use your own judgment — when in doubt, throw it out.
            </div>
          )}
        </>
      )}
    </div>
  );
}
