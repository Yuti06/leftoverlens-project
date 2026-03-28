import React from "react";
import { RotateCcw, Leaf } from "lucide-react";

const STEPS = [
  { num: 1, label: "Scan" },
  { num: 2, label: "Ingredients" },
  { num: 3, label: "Recipes" },
  { num: 4, label: "Tips" },
];

export default function Header({ onReset, currentPage, step }) {
  return (
    <header style={{
      background: "white",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "0 20px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32,
            background: "var(--moss)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Leaf size={18} color="white" />
          </div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "var(--forest)",
          }}>
            LeftoverLens
          </span>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, justifyContent: "center" }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 26, height: 26,
                  borderRadius: "50%",
                  background: step >= s.num ? "var(--moss)" : step === s.num - 1 ? "var(--parchment)" : "var(--parchment)",
                  border: `2px solid ${step >= s.num ? "var(--moss)" : step === s.num - 1 ? "var(--border)" : "var(--border)"}`,
                  color: step >= s.num ? "white" : "var(--mist)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  transition: "all var(--transition)",
                  fontFamily: "var(--font-mono)",
                }}>
                  {s.num}
                </div>
                <span style={{
                  fontSize: "0.78rem",
                  color: step >= s.num ? "var(--moss)" : "var(--mist)",
                  fontWeight: step === s.num ? 600 : 400,
                  display: window.innerWidth < 500 ? "none" : "block",
                  transition: "color var(--transition)",
                }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 20, height: 2,
                  background: step > s.num ? "var(--moss)" : "var(--border)",
                  borderRadius: 1,
                  transition: "background var(--transition)",
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="btn btn-ghost"
          style={{ padding: "6px 12px", fontSize: "0.82rem", flexShrink: 0 }}
          title="Start over"
        >
          <RotateCcw size={14} />
          <span style={{ display: window.innerWidth < 500 ? "none" : "inline" }}>Start over</span>
        </button>
      </div>
    </header>
  );
}
