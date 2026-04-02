import React from "react";
import { Box, Card, ListBlock, SectionRow } from "./researchPrimitives";
import { riskLevelColor, riskLevelLabel } from "./researchUtils";
import SecurityPanel from "./SecurityPanel";

export default function RisksPanel({ aiReport, fundamentals, security, scores, styles }) {
  return (
    <div style={styles.advancedGrid}>
      <Card title="Risk matrix" score={aiReport?.riskMatrix?.overallScore} subtitle="AI plus backend risk view" styles={styles}>
        <SectionRow label="Liquidity risk" value={aiReport?.riskMatrix?.liquidityRisk || "Unavailable"} styles={styles} />
        <SectionRow label="Contract risk" value={aiReport?.riskMatrix?.contractRisk || "Unavailable"} styles={styles} />
        <SectionRow label="Market risk" value={aiReport?.riskMatrix?.marketRisk || "Unavailable"} styles={styles} />
        <SectionRow label="Concentration risk" value={aiReport?.riskMatrix?.concentrationRisk || "Unavailable"} styles={styles} />
        <ListBlock title="Red flags" items={aiReport?.riskMatrix?.redFlags || []} emptyText="No explicit red flags returned." color="#ffb6b6" styles={styles} />
        <ListBlock title="Green flags" items={aiReport?.riskMatrix?.greenFlags || []} emptyText="No explicit green flags returned." color="#a6f3c2" styles={styles} />
      </Card>

      <Card title="Backend risk engine" subtitle="Machine-readable product and token risk posture" styles={styles}>
        <div style={styles.inlineGrid}>
          <Box label="Tokenomics Risk" value={riskLevelLabel(fundamentals?.risks?.tokenomicsRisk)} tone="Covers dilution, float, and supply-overhang risk." styles={styles} />
          <Box label="Product Risk" value={riskLevelLabel(fundamentals?.risks?.productRisk)} tone="Reflects how measurable the product and usage look from available data." styles={styles} />
          <Box label="Execution Risk" value={riskLevelLabel(fundamentals?.risks?.executionRisk)} tone="Raised when warnings and missing confirmations start to stack up." styles={styles} />
          <Box label="Governance Risk" value={riskLevelLabel(fundamentals?.risks?.governanceRisk)} tone="Higher when governance transparency is still weak." styles={styles} />
          <Box label="Security Risk" value={riskLevelLabel(fundamentals?.risks?.securityRisk)} tone="Combines contract support and hard red flags like honeypot or mintability." styles={styles} />
          <Box label="Liquidity Risk" value={riskLevelLabel(fundamentals?.risks?.liquidityRisk)} tone="Based on how much usable market liquidity the token appears to have." styles={styles} />
        </div>
        <div style={styles.riskLevelRow}>
          {[
            ["Tokenomics", fundamentals?.risks?.tokenomicsRisk],
            ["Product", fundamentals?.risks?.productRisk],
            ["Execution", fundamentals?.risks?.executionRisk],
            ["Governance", fundamentals?.risks?.governanceRisk],
            ["Security", fundamentals?.risks?.securityRisk],
            ["Liquidity", fundamentals?.risks?.liquidityRisk],
          ].map(([label, level]) => (
            <div key={label} style={{ ...styles.riskChip, borderColor: riskLevelColor(level), color: riskLevelColor(level) }}>
              {label}: {riskLevelLabel(level)}
            </div>
          ))}
        </div>
        <ListBlock title="Key alerts" items={fundamentals?.risks?.keyAlerts || []} emptyText="No critical alerts were raised by the backend risk engine." color="#ffb6b6" styles={styles} />
      </Card>

      <SecurityPanel security={security} scores={scores} styles={styles} />
    </div>
  );
}
