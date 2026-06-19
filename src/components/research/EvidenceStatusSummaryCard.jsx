import React from "react";
import { Card } from "./researchPrimitives";
import { normalizeEvidenceProxyDisplayLabel } from "./researchUtils";

const severityColors = {
  supported: "#aab7cc",
  info: "#aab7cc",
  neutral: "#8a94a6",
  warning: "#d5dcec",
  review: "#d5dcec",
  critical: "#d5dcec",
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

function BoundaryPill({ children, styles }) {
  return <span style={styles.evidenceStatusBoundaryPill}>{children}</span>;
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
            Qualitative review signals only. Not a count distribution, evidence score, or institutional support rating.
          </div>
        </div>

        <div style={styles.evidenceStatusBoundaryPillRow}>
          <BoundaryPill styles={styles}>Not the full institutional evidence map</BoundaryPill>
          <BoundaryPill styles={styles}>Qualitative review signals only</BoundaryPill>
          <BoundaryPill styles={styles}>Not a count distribution</BoundaryPill>
          <BoundaryPill styles={styles}>Report-only overlays are not connected to live scoring</BoundaryPill>
        </div>

        {!items.length ? (
          <div style={styles.evidenceStatusUnavailablePanel}>
            No live evidence-status proxy signals were detected.
          </div>
        ) : null}

        <div style={styles.evidenceStatusGrid}>
          {items.map((item) => {
            const display = normalizeEvidenceProxyDisplayLabel(item);
            const color = display.tone || toneColor(item.severity);
            return (
              <div key={item.key} style={{ ...styles.evidenceStatusItem, borderColor: `${color}36` }}>
                <div style={styles.evidenceStatusItemTopline}>
                  <span style={{ ...styles.evidenceStatusDot, borderColor: `${color}88` }} />
                  <div style={styles.evidenceStatusItemTitle}>{item.label}</div>
                  <ProxyBadge label={display.statusLabel} color={color} styles={styles} />
                </div>
                <div style={styles.evidenceStatusSignalType}>{display.signalType}</div>
                <div style={styles.evidenceStatusItemDescription}>{item.description}</div>
                <div style={styles.evidenceStatusMeaningLine}>{display.meaning}</div>
                <div style={styles.evidenceStatusSourceLine}>
                  Source basis: {item.sourceLabel} - Live response proxy only
                </div>
                <div style={styles.evidenceStatusSourceLine}>
                  Boundary: {display.boundaryLabel}; explanation support before calibrated score integration.
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
