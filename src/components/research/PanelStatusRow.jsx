import React from "react";
import { buildFreshnessBadge } from "./researchUtils";

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

export default function PanelStatusRow({ hint, freshnessEntry, styles }) {
  const badge = buildFreshnessBadge(freshnessEntry);
  const tone = hint ? (toneStyles[hint.tone] || toneStyles.neutral) : null;

  if (!badge && !hint) return null;

  return (
    <div style={styles.panelStatusRow}>
      {badge ? (
        <div style={styles.freshnessWrap}>
          <span style={{ ...styles.freshnessBadge, borderColor: badge.color, color: badge.color }}>
            {badge.label}
          </span>
          {badge.detail ? <span style={styles.freshnessDetail}>{badge.detail}</span> : null}
        </div>
      ) : null}

      {hint ? (
        <div style={{ ...styles.panelStatusHint, background: tone.background, border: tone.border, color: tone.color }}>
          {hint.message}
        </div>
      ) : null}
    </div>
  );
}
