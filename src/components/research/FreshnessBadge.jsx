import React from "react";
import { buildFreshnessBadge } from "./researchUtils";

export default function FreshnessBadge({ entry, styles }) {
  const badge = buildFreshnessBadge(entry);
  if (!badge) return null;

  return (
    <div style={styles.freshnessWrap}>
      <span style={{ ...styles.freshnessBadge, borderColor: badge.color, color: badge.color }}>
        {badge.label}
      </span>
      {badge.detail ? <span style={styles.freshnessDetail}>{badge.detail}</span> : null}
    </div>
  );
}
