import React from "react";
import { Box, Card, ListBlock, SectionRow } from "./researchPrimitives";
import { formatCompact, formatPct, formatUsd, riskLevelLabel } from "./researchUtils";

export default function FundamentalsPanel({ fundamentals, aiReport, marketData, styles }) {
  return (
    <div style={styles.advancedGrid}>
      <Card
        title="Tokenomics engine"
        score={fundamentals?.tokenomics?.overallScore ?? aiReport?.tokenomics?.score}
        subtitle={fundamentals?.tokenomics ? `Upcoming unlock impact: ${riskLevelLabel(fundamentals.tokenomics.upcomingUnlockImpact)}` : (aiReport?.tokenomics?.inflationRisk || "Tokenomics analysis")}
        styles={styles}
      >
        <SectionRow label="Summary" value={aiReport?.tokenomics?.summary || "Unavailable"} styles={styles} />
        <SectionRow label="Supply pressure" value={aiReport?.tokenomics?.supplyPressure || "Unavailable"} styles={styles} />
        <SectionRow label="Market cap / FDV view" value={aiReport?.tokenomics?.mcapToFdvRatio || "Unavailable"} styles={styles} />
        <div style={styles.inlineGrid}>
          <Box label="Circulating Supply" value={formatCompact(marketData?.circulatingSupply)} styles={styles} />
          <Box label="Total Supply" value={formatCompact(marketData?.totalSupply)} styles={styles} />
          <Box label="Max Supply" value={formatCompact(marketData?.maxSupply)} styles={styles} />
          <Box label="Market Cap" value={formatUsd(marketData?.marketCap)} styles={styles} />
          <Box label="FDV" value={formatUsd(marketData?.fdv)} styles={styles} />
          <Box label="MC / FDV" value={fundamentals?.tokenomics?.breakdown?.mcToFdvRatio ?? "Unknown"} tone="Closer to 1.0 is healthier." styles={styles} />
          <Box
            label="Float %"
            value={fundamentals?.tokenomics?.breakdown?.floatPercent !== null && fundamentals?.tokenomics?.breakdown?.floatPercent !== undefined
              ? formatPct(fundamentals.tokenomics.breakdown.floatPercent)
              : "Unknown"}
            tone="Higher float usually means lower dilution overhang."
            styles={styles}
          />
        </div>
        <div style={styles.inlineGrid}>
          <Box label="Supply Health" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.supplyHealth}/100` : "Unavailable"} styles={styles} />
          <Box label="Unlock Risk" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.unlockRisk}/100` : "Unavailable"} styles={styles} />
          <Box label="Inflation Health" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.inflationHealth}/100` : "Unavailable"} styles={styles} />
          <Box label="Insider Concentration" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.insiderConcentration}/100` : "Unavailable"} styles={styles} />
          <Box label="FDV Pressure" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.fdvPressure}/100` : "Unavailable"} styles={styles} />
          <Box label="Value Accrual Quality" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.valueAccrualQuality}/100` : "Unavailable"} styles={styles} />
        </div>
        <ListBlock title="Strengths" items={fundamentals?.tokenomics?.strengths || []} emptyText="No clear strengths were extracted." color="#a6f3c2" styles={styles} />
        <ListBlock title="Concerns" items={fundamentals?.tokenomics?.concerns || []} emptyText="No major tokenomics concerns were extracted." color="#ffb6b6" styles={styles} />
      </Card>

      <Card title="Why the tokenomics score looks like this" subtitle="Scoring explanations from the backend evaluator" styles={styles}>
        <SectionRow label="Supply health" value={fundamentals?.tokenomics?.explanations?.supplyHealth || "Unavailable"} styles={styles} />
        <SectionRow label="Unlock risk" value={fundamentals?.tokenomics?.explanations?.unlockRisk || "Unavailable"} styles={styles} />
        <SectionRow label="Inflation health" value={fundamentals?.tokenomics?.explanations?.inflationHealth || "Unavailable"} styles={styles} />
        <SectionRow label="Insider concentration" value={fundamentals?.tokenomics?.explanations?.insiderConcentration || "Unavailable"} styles={styles} />
        <SectionRow label="FDV pressure" value={fundamentals?.tokenomics?.explanations?.fdvPressure || "Unavailable"} styles={styles} />
        <SectionRow label="Value accrual quality" value={fundamentals?.tokenomics?.explanations?.valueAccrualQuality || "Unavailable"} styles={styles} />
        <ListBlock
          title="Still worth checking manually"
          items={[
            "Exact vesting and unlock schedule.",
            "Team or treasury allocation.",
            "Value accrual mechanism from official docs.",
          ]}
          emptyText=""
          color="#9bd7ff"
          styles={styles}
        />
      </Card>
    </div>
  );
}
