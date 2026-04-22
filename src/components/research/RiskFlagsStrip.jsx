import React from "react";

export default function RiskFlagsStrip({ items, title = "Dominant risk and support flags", styles }) {
  if (!items?.length) return null;

  return (
    <div style={styles.flagStripWrap}>
      <div style={styles.flagStripTitle}>{title}</div>
      <div style={styles.flagStripRow}>
        {items.map((item) => (
          <span key={item} style={styles.flagStripChip}>{item}</span>
        ))}
      </div>
    </div>
  );
}
