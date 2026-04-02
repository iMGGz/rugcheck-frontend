import React from "react";
import { Card } from "./researchPrimitives";
import { diagnosticTone, providerLabel, sourceColor, titleCase } from "./researchUtils";

export default function ProviderDiagnosticsPanel({ notableDiagnostics, styles }) {
  return (
    <Card
      title="Provider diagnostics"
      subtitle="Why data may be partial, unavailable, or trustworthy"
      styles={styles}
    >
      {notableDiagnostics.length ? (
        notableDiagnostics.map((entry) => {
          const tone = diagnosticTone(entry);
          return (
            <div key={`${entry.provider}-${entry.status}-${entry.reason || "ok"}`} style={styles.timelineEntry}>
              <div style={styles.timelineEntryHeader}>
                <div style={styles.timelineTitleRow}>
                  <strong style={{ color: "#f4f7ff" }}>{providerLabel(entry.provider)}</strong>
                  <span style={{ ...styles.riskChip, borderColor: tone.color, color: tone.color }}>
                    {tone.label}
                  </span>
                  {entry.coverage ? (
                    <span style={{ ...styles.riskChip, borderColor: sourceColor(entry.coverage), color: sourceColor(entry.coverage) }}>
                      {titleCase(entry.coverage)}
                    </span>
                  ) : null}
                </div>
                <div style={styles.timelineMeta}>
                  {entry.latencyMs !== null && entry.latencyMs !== undefined ? `${entry.latencyMs} ms` : "Latency unavailable"}
                </div>
              </div>
              <div style={styles.timelineSummary}>
                {entry.reason || "Provider completed without a notable issue."}
              </div>
              {entry.errorClass ? (
                <div style={styles.timelineMeta}>Error class: {titleCase(entry.errorClass)}</div>
              ) : null}
            </div>
          );
        })
      ) : (
        <p style={{ color: "#8a94a6" }}>No notable provider failures or weak coverage were reported for this analysis.</p>
      )}
    </Card>
  );
}
