import React from "react";
import { Card } from "./researchPrimitives";

const severityColors = {
  supported: "#2fd67b",
  info: "#7dd3fc",
  neutral: "#8a94a6",
  warning: "#ffb020",
  review: "#ffb020",
  critical: "#ff6b6b",
};

function toneColor(severity) {
  return severityColors[severity] || "#8a94a6";
}

function ProxyBadge({ label, color, styles }) {
  return (
    <span
      style={{
        ...styles.evidenceProxyBadge,
        color,
        borderColor: `${color}55`,
        background: `${color}14`,
      }}
    >
      {label}
    </span>
  );
}

export default function EvidenceStatusSummaryCard({ proxy, styles }) {
  const items = proxy?.items || [];
  const warnings = proxy?.warnings || [];
  const unavailable = proxy?.unavailable || [];

  return (
    <div style={styles.evidenceStatusWrap}>
      <Card
        title="Evidence Status"
        subtitle="Derived from the current analysis response. Not the full institutional evidence map."
        styles={styles}
      >
        <div style={styles.evidenceStatusHeaderRow}>
          <ProxyBadge label={proxy?.label || "Live Evidence Proxy"} color="#7dd3fc" styles={styles} />
          <div style={styles.evidenceStatusHeaderCopy}>
            Live proxy, not full institutional evidence map. Report-only source overlays are not connected to live scoring.
          </div>
        </div>

        {items.length ? (
          <>
            <div style={styles.evidenceStatusSegmentRow} aria-label="Live evidence proxy status indicators">
              {items.map((item) => {
                const color = toneColor(item.severity);
                return (
                  <div
                    key={item.key}
                    title={`${item.label}: ${item.valueLabel}`}
                    style={{
                      ...styles.evidenceStatusSegment,
                      background: color,
                      boxShadow: `0 0 0 1px ${color}55`,
                    }}
                  />
                );
              })}
            </div>
            <div style={styles.evidenceStatusSegmentNote}>
              Qualitative signal view only - not a count distribution.
            </div>
          </>
        ) : (
          <div style={styles.evidenceStatusUnavailablePanel}>
            No live evidence-status proxy signals were detected.
          </div>
        )}

        <div style={styles.evidenceStatusGrid}>
          {items.map((item) => {
            const color = toneColor(item.severity);
            return (
              <div key={item.key} style={{ ...styles.evidenceStatusItem, borderColor: `${color}36` }}>
                <div style={styles.evidenceStatusItemTopline}>
                  <span style={{ ...styles.evidenceStatusDot, background: color }} />
                  <div style={styles.evidenceStatusItemTitle}>{item.label}</div>
                  <ProxyBadge label={item.valueLabel} color={color} styles={styles} />
                </div>
                <div style={styles.evidenceStatusItemDescription}>{item.description}</div>
                <div style={styles.evidenceStatusSourceLine}>
                  Source: {item.sourceLabel} - Proxy only
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.evidenceStatusBoundaryBox}>
          <div style={styles.evidenceStatusBoundaryTitle}>Boundary Notice</div>
          <div style={styles.evidenceStatusBoundaryGrid}>
            {warnings.map((warning) => (
              <div key={warning} style={styles.evidenceStatusBoundaryItem}>{warning}</div>
            ))}
          </div>
        </div>

        {unavailable.length ? (
          <div style={styles.evidenceStatusUnavailableList}>
            {unavailable.map((entry) => (
              <span key={entry} style={styles.evidenceStatusUnavailableChip}>
                {entry}
              </span>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
