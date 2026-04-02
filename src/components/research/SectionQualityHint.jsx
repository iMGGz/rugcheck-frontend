import React from "react";

export default function SectionQualityHint({ hint, styles }) {
  if (!hint) return null;

  const toneStyles = {
    warning: {
      background: "rgba(255,176,32,0.08)",
      border: "1px solid rgba(255,176,32,0.18)",
      color: "#f3e4bf",
    },
    info: {
      background: "rgba(70,184,255,0.06)",
      border: "1px solid rgba(70,184,255,0.16)",
      color: "#d8ebff",
    },
    neutral: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(138,148,166,0.16)",
      color: "#c8d3e3",
    },
  };

  const tone = toneStyles[hint.tone] || toneStyles.neutral;

  return (
    <div style={{ ...styles.sectionHint, background: tone.background, border: tone.border, color: tone.color }}>
      {hint.message}
    </div>
  );
}
