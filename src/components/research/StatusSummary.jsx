import React from "react";
import { ScorePill, TabButton } from "./researchPrimitives";
import { confidenceColor, confidenceLabel } from "./researchUtils";

export default function StatusSummary({
  confidence,
  meta,
  activeTab,
  researchTabs,
  setActiveTab,
  scores,
  styles,
}) {
  return (
    <>
      <div style={styles.metaGrid}>
        <div style={styles.metaCard}>
          <div style={styles.metaLabel}>Confidence</div>
          <div style={{ ...styles.metaValue, color: confidenceColor(confidence?.level) }}>
            {confidence ? `${confidenceLabel(confidence.level)} | ${confidence.score}/100` : "Unavailable"}
          </div>
          <div style={styles.metaText}>{confidence?.summary || "Confidence unavailable."}</div>
          <div style={styles.metaSubtext}>
            Data quality: {meta?.dataQuality || confidence?.dataQuality || "unknown"} | Source agreement: {confidence?.sourceAgreement || "unknown"}
          </div>
        </div>

        <div style={styles.metaCard}>
          <div style={styles.metaLabel}>Source clarity</div>
          <div style={styles.metaValue}>How this analysis was built</div>
          <div style={styles.metaText}>{confidence?.sourceAgreementSummary || "Source agreement summary unavailable."}</div>
          <div style={styles.providerList}>
            {(meta?.providerNotes || []).slice(0, 4).map((note) => (
              <div key={note} style={styles.providerNote}>{note}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.tabRow}>
        {researchTabs.map((tab) => (
          <TabButton key={tab.key} label={tab.label} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} styles={styles} />
        ))}
      </div>

      <div style={styles.summaryStrip}>
        <ScorePill label="Overall" score={scores?.overallScore || 0} styles={styles} />
        <ScorePill label="Liquidity" score={scores?.liquidityScore || 0} styles={styles} />
        <ScorePill label="Tokenomics" score={scores?.tokenomicsScore || 0} styles={styles} />
        <ScorePill label="Security" score={scores?.securityScore || 0} styles={styles} />
        <ScorePill label="Technical" score={scores?.technicalScore || 0} styles={styles} />
      </div>

      <div style={styles.explainerRow}>
        <div style={styles.explainerCard}>
          <div style={styles.explainerTitle}>How to read this</div>
          <div style={styles.explainerText}>
            Treat the overall score as a screening signal, not a buy or sell signal. Unavailable data means the backend could not confirm it, weak coverage means provider support was thin, and negative signals come from actual returned risk evidence.
          </div>
        </div>
        <div style={styles.explainerCard}>
          <div style={styles.explainerTitle}>Best use case</div>
          <div style={styles.explainerText}>
            Use this terminal to filter candidates quickly, then verify tokenomics, unlocks, governance, and official docs manually before acting.
          </div>
        </div>
      </div>
    </>
  );
}
