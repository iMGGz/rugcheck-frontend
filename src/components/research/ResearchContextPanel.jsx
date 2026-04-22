import React from "react";
import { Card } from "./researchPrimitives";
import AnalysisQualityNote from "./AnalysisQualityNote";
import ProviderDiagnosticsPanel from "./ProviderDiagnosticsPanel";
import ProviderHealthPanel from "./ProviderHealthPanel";
import { extractRenderableText, safeArray, sourceColor, titleCase } from "./researchUtils";

export default function ResearchContextPanel({
  analysisQualityExplanation,
  confidence,
  meta,
  sourceStatus,
  notableDiagnostics,
  providerHealth,
  providerHealthLoading,
  providerHealthError,
  styles,
}) {
  const providerNotes = safeArray(meta?.providerNotes).slice(0, 4);
  const coverageEntries = Object.entries(sourceStatus || {});

  return (
    <Card
      title="Research context"
      subtitle="Secondary detail about data quality, provider coverage, and upstream visibility."
      styles={styles}
    >
      <AnalysisQualityNote explanation={analysisQualityExplanation} styles={styles} />

      <div style={styles.contextGrid}>
        <div style={styles.contextCard}>
          <div style={styles.metaLabel}>Source clarity</div>
          <div style={styles.contextLead}>
            {extractRenderableText(confidence?.sourceAgreementSummary, "Source agreement summary unavailable.")}
          </div>
          <div style={styles.providerList}>
            {providerNotes.length ? providerNotes.map((note) => (
              <div key={note} style={styles.providerNote}>{note}</div>
            )) : (
              <div style={styles.providerNote}>No provider notes were recorded for this analysis.</div>
            )}
          </div>
        </div>

        <div style={styles.contextCard}>
          <div style={styles.metaLabel}>How to read this</div>
          <div style={styles.contextLead}>
            Treat the score as a screening signal. Missing data means the backend could not confirm it, and unsupported sections are not treated as negatives.
          </div>
          <div style={styles.contextMuted}>
            Best use: filter candidates quickly, then verify tokenomics, unlocks, governance, and official docs manually before acting.
          </div>
        </div>
      </div>

      <details style={styles.contextDetails}>
        <summary style={styles.contextSummary}>Coverage matrix</summary>
        <div style={styles.contextDetailsBody}>
          {coverageEntries.length ? coverageEntries.map(([key, value]) => (
            <div key={key} style={styles.scoreRow}>
              <div style={{ color: "#d5dcec", textTransform: "capitalize" }}>{key}</div>
              <div style={{ color: sourceColor(value), fontWeight: 800 }}>{titleCase(value)}</div>
            </div>
          )) : (
            <div style={styles.timelineEmptyText}>No source coverage data was returned for this analysis.</div>
          )}
        </div>
      </details>

      <details style={styles.contextDetails}>
        <summary style={styles.contextSummary}>Provider visibility</summary>
        <div style={styles.contextDetailsBody}>
          <ProviderDiagnosticsPanel notableDiagnostics={notableDiagnostics} styles={styles} />
          <ProviderHealthPanel
            providerHealth={providerHealth}
            providerHealthLoading={providerHealthLoading}
            providerHealthError={providerHealthError}
            styles={styles}
          />
        </div>
      </details>
    </Card>
  );
}
