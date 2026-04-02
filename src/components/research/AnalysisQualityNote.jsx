import React from "react";

export default function AnalysisQualityNote({ explanation, styles }) {
  if (!explanation) return null;

  const toneStyles = {
    warning: {
      background: "rgba(255,176,32,0.1)",
      border: "1px solid rgba(255,176,32,0.24)",
      title: "#ffd789",
      text: "#f3e4bf",
    },
    info: {
      background: "rgba(70,184,255,0.08)",
      border: "1px solid rgba(70,184,255,0.2)",
      title: "#9bd7ff",
      text: "#d8ebff",
    },
    neutral: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(138,148,166,0.18)",
      title: "#d5dcec",
      text: "#b9c7d8",
    },
  };

  const tone = toneStyles[explanation.tone] || toneStyles.neutral;

  return (
    <div style={{ ...styles.analysisQualityNote, background: tone.background, border: tone.border }}>
      <div style={{ ...styles.analysisQualityTitle, color: tone.title }}>{explanation.title}</div>
      <div style={{ ...styles.analysisQualityText, color: tone.text }}>{explanation.message}</div>
    </div>
  );
}
