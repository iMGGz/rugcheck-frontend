import React from "react";
import { ScorePill, TabButton } from "./researchPrimitives";
import { confidenceColor, confidenceLabel } from "./researchUtils";

export default function StatusSummary({
  confidence,
  activeTab,
  researchTabs,
  setActiveTab,
  scores,
  styles,
}) {
  return (
    <>
      <div style={styles.metaGridCompact}>
        <div style={styles.metaCard}>
          <div style={styles.metaLabel}>Confidence</div>
          <div style={{ ...styles.metaValue, color: confidenceColor(confidence?.level) }}>
            {confidence ? `${confidenceLabel(confidence.level)} | ${confidence.score}/100` : "Unavailable"}
          </div>
          <div style={styles.metaText}>{confidence?.summary || "Confidence unavailable."}</div>
          <div style={styles.metaSubtext}>
            Data quality: {confidence?.dataQuality || confidence?.marketDataStatus || "unknown"} | Source agreement: {confidence?.sourceAgreement || "unknown"}
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
    </>
  );
}
