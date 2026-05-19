import React from "react";
import { Card } from "./researchPrimitives";
import { normalizeProviderHealth, providerHealthDisplayTone, providerLabel, safeArray, titleCase } from "./researchUtils";

export default function ProviderHealthPanel({ providerHealth, providerHealthLoading, providerHealthError, styles }) {
  const normalizedProviderHealth = normalizeProviderHealth(providerHealth);
  const providerEntries = safeArray(normalizedProviderHealth?.providersList);

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
        <>
          <div style={styles.evidenceMapBoundaryStrip}>
            <span style={styles.evidenceMapBoundaryChip}>
              Provider availability is diagnostic context, not thesis evidence quality.
            </span>
          </div>
          <div style={styles.providerHealthGrid}>
          {providerEntries.map((entry) => {
            const key = entry?.provider || "provider";
            const tone = providerHealthDisplayTone(entry);
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
                  Configured: {tone.configuredLabel}
                </div>
                <div style={styles.timelineMeta}>
                  Status: {tone.statusLabel}
                </div>
                <div style={styles.timelineMeta}>
                  Latency: {entry?.latencyMs !== null && entry?.latencyMs !== undefined ? `${entry.latencyMs} ms` : "Unavailable"}
                </div>
                {entry?.reason ? (
                  <div style={styles.providerHealthError}>{titleCase(entry.reason)}</div>
                ) : (
                  <div style={styles.providerHealthOk}>No active provider error reported.</div>
                )}
              </div>
            );
          })}
          </div>
        </>
      ) : null}
    </Card>
  );
}
