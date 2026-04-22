import React from "react";
import { Card } from "./researchPrimitives";
import { providerLabel, titleCase } from "./researchUtils";

function providerHealthTone(entry) {
  if (!entry?.configured) return { color: "#8a94a6", label: "Not configured" };
  if (entry?.reachable) return { color: "#2fd67b", label: "Reachable" };
  if (entry?.lastCheckStatus === "degraded") return { color: "#ffb020", label: "Degraded" };
  return { color: "#ff6b6b", label: "Unreachable" };
}

export default function ProviderHealthPanel({ providerHealth, providerHealthLoading, providerHealthError, styles }) {
  const providerEntries = [
    ["coingecko", providerHealth?.providers?.coingecko],
    ["dexscreener", providerHealth?.providers?.dexscreener],
    ["goplus", providerHealth?.providers?.goplus],
    ["anthropic", providerHealth?.providers?.anthropic],
    ["postgres", providerHealth?.providers?.postgres],
  ];

  return (
    <Card title="Provider health" subtitle="Compact upstream visibility for analysis quality" styles={styles}>
      {providerHealthLoading && !providerHealth ? (
        <p style={styles.timelineEmptyText}>Checking provider health...</p>
      ) : null}

      {providerHealthError ? (
        <div style={styles.inlineErrorBox}>
          <div style={styles.inlineErrorTitle}>Provider health unavailable</div>
          <div style={styles.inlineErrorText}>{providerHealthError}</div>
        </div>
      ) : null}

      {providerHealth ? (
        <div style={styles.providerHealthGrid}>
          {providerEntries.map(([key, entry]) => {
            const tone = providerHealthTone(entry);
            return (
              <div key={key} style={styles.providerHealthCard}>
                <div style={styles.timelineTitleRow}>
                  <strong style={{ color: "#f4f7ff" }}>
                    {key === "anthropic" ? "Decision memo service" : providerLabel(key)}
                  </strong>
                  <span style={{ ...styles.riskChip, borderColor: tone.color, color: tone.color }}>
                    {tone.label}
                  </span>
                </div>
                <div style={styles.timelineMeta}>
                  Configured: {entry?.configured ? "Yes" : "No"}
                </div>
                <div style={styles.timelineMeta}>
                  Last check: {entry?.lastCheckStatus ? titleCase(entry.lastCheckStatus) : "Unavailable"}
                </div>
                <div style={styles.timelineMeta}>
                  Latency: {entry?.latencyMs !== null && entry?.latencyMs !== undefined ? `${entry.latencyMs} ms` : "Unavailable"}
                </div>
                {entry?.error ? (
                  <div style={styles.providerHealthError}>{entry.error}</div>
                ) : (
                  <div style={styles.providerHealthOk}>No active provider error reported.</div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </Card>
  );
}
