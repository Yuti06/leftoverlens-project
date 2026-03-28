import React from "react";
import { Camera, Leaf, Sparkles, Clock, ShoppingBag } from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "Snap your fridge", desc: "Take a photo of any ingredients — leftovers, pantry staples, or a mix of both." },
  { icon: Sparkles, title: "AI detects ingredients", desc: "Claude AI identifies every item and estimates freshness from visual cues." },
  { icon: Clock, title: "Get instant recipes", desc: "Receive ranked recipes based on what you have, with substitutes for anything missing." },
  { icon: Leaf, title: "Reduce food waste", desc: "Preservation tips and storage guides keep your food fresh longer." },
];

const STATS = [
  { value: "1.3B", label: "tons of food wasted annually" },
  { value: "30%", label: "occurs at household level" },
  { value: "~$1,500", label: "average family wastes per year" },
];

export default function LandingPage({ onStart }) {
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(160deg, var(--forest) 0%, var(--moss) 50%, var(--sage) 100%)",
        color: "white",
        padding: "80px 24px 100px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 400, height: 400,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 280, height: 280,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 40,
            padding: "6px 16px",
            marginBottom: 28,
            fontSize: "0.82rem",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.03em",
          }}>
            <Leaf size={13} />
            Zero-waste cooking, powered by AI
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 7vw, 4.8rem)",
            fontWeight: 900,
            lineHeight: 1.08,
            marginBottom: 24,
            letterSpacing: "-0.02em",
          }}>
            Turn your leftovers<br />
            <em style={{ fontStyle: "italic", color: "rgba(168, 216, 74, 0.9)" }}>into tonight's dinner.</em>
          </h1>

          <p style={{
            fontSize: "1.1rem",
            opacity: 0.85,
            maxWidth: 480,
            margin: "0 auto 40px",
            lineHeight: 1.7,
            fontWeight: 300,
          }}>
            Snap a photo of your fridge or pantry. LeftoverLens identifies your ingredients, estimates freshness, and suggests recipes — in seconds.
          </p>

          <button
            onClick={onStart}
            className="btn btn-primary"
            style={{
              fontSize: "1.05rem",
              padding: "16px 36px",
              borderRadius: 40,
              background: "white",
              color: "var(--forest)",
              fontWeight: 600,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <Camera size={20} />
            Scan my ingredients
          </button>

          <p style={{ marginTop: 16, opacity: 0.55, fontSize: "0.82rem", fontFamily: "var(--font-mono)" }}>
            No account required · Free to use
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        background: "var(--parchment)",
        padding: "32px 24px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          maxWidth: 700,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          gap: "clamp(24px, 5vw, 64px)",
          flexWrap: "wrap",
        }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 900,
                color: "var(--forest)",
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--smoke)", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            color: "var(--forest)",
            marginBottom: 56,
          }}>
            How it works
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="card fade-in"
                style={{
                  padding: 28,
                  animationDelay: `${i * 80}ms`,
                  borderTop: "3px solid var(--moss)",
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  background: "var(--cream)",
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <f.icon size={22} color="var(--moss)" />
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  color: "var(--forest)",
                  marginBottom: 8,
                }}>
                  {f.title}
                </h3>
                <p style={{ color: "var(--smoke)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "var(--cream)",
        padding: "60px 24px",
        textAlign: "center",
        borderTop: "1px solid var(--border)",
      }}>
        <ShoppingBag size={36} color="var(--moss)" style={{ marginBottom: 16 }} />
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "2rem",
          color: "var(--forest)",
          marginBottom: 12,
        }}>
          Ready to rescue your leftovers?
        </h2>
        <p style={{ color: "var(--smoke)", marginBottom: 28 }}>
          It only takes a photo and 6 seconds.
        </p>
        <button
          onClick={onStart}
          className="btn btn-primary"
          style={{ padding: "14px 32px", fontSize: "1rem", borderRadius: 40 }}
        >
          <Camera size={18} />
          Get started — it's free
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "24px",
        textAlign: "center",
        color: "var(--mist)",
        fontSize: "0.8rem",
        borderTop: "1px solid var(--border)",
        fontFamily: "var(--font-mono)",
      }}>
        <Leaf size={12} style={{ display: "inline", marginRight: 6 }} />
        LeftoverLens — Built for a zero-waste world
      </footer>
    </div>
  );
}
