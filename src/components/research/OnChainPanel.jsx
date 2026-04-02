import React from "react";
import { Box, Card, ListBlock, SectionRow } from "./researchPrimitives";
import { buildSectionQualityHint, formatCompact, formatPct, moduleAvailabilityTone, titleCase } from "./researchUtils";
import PanelStatusRow from "./PanelStatusRow";

export default function OnChainPanel({ onChainMetrics, onChainFundamentals, aiReport, marketData, sourceStatus, providerDiagnostics, providerHealth, freshnessEntry, styles }) {
  const hint = buildSectionQualityHint("onchain", {
    providerDiagnostics,
    providerHealth,
    sourceStatus,
    availability: onChainMetrics?.availability || onChainFundamentals?.availability,
  });

  return (
    <div style={styles.advancedGrid}>
      <Card
        title="On-chain summary"
        score={onChainMetrics?.score}
        subtitle={onChainFundamentals ? `${moduleAvailabilityTone(onChainFundamentals.availability).label} | Holder coverage: ${titleCase(onChainFundamentals.holderCoverage)}` : "On-chain analysis"}
        styles={styles}
      >
        <PanelStatusRow hint={hint} freshnessEntry={freshnessEntry} styles={styles} />
        <SectionRow label="Summary" value={onChainMetrics?.summary || onChainFundamentals?.summary || "Unavailable"} styles={styles} />
        <div style={styles.inlineGrid}>
          <Box label="Availability" value={moduleAvailabilityTone(onChainMetrics?.availability).label} styles={styles} />
          <Box label="Holder count" value={formatCompact(onChainMetrics?.holderCount)} styles={styles} />
          <Box label="Holder count status" value={titleCase(onChainMetrics?.holderCountStatus || "unavailable")} styles={styles} />
          <Box label="Top 10 holder rate" value={formatPct(onChainMetrics?.top10HolderRatePercent)} styles={styles} />
          <Box label="Owner %" value={formatPct(onChainMetrics?.ownerPercent)} styles={styles} />
          <Box label="Creator %" value={formatPct(onChainMetrics?.creatorPercent)} styles={styles} />
          <Box label="Concentration risk" value={titleCase(onChainMetrics?.concentrationRisk || "unknown")} styles={styles} />
          <Box label="Wallet distribution" value={titleCase(onChainMetrics?.walletDistribution || "unknown")} styles={styles} />
          <Box label="Exchange flows" value={titleCase(onChainMetrics?.exchangeFlowStatus || "unavailable")} styles={styles} />
        </div>
        <ListBlock title="On-chain strengths" items={onChainFundamentals?.strengths || []} emptyText="No on-chain strengths were surfaced." color="#a6f3c2" styles={styles} />
        <ListBlock title="On-chain concerns" items={[...(onChainFundamentals?.concerns || []), ...(onChainMetrics?.notes || [])]} emptyText="No major on-chain concerns were surfaced." color="#ffb6b6" styles={styles} />
      </Card>

      <Card title="Technical / price context" score={aiReport?.technicalAnalysis?.score} subtitle={aiReport?.technicalAnalysis?.trend || "Market behavior context"} styles={styles}>
        <SectionRow label="Summary" value={aiReport?.technicalAnalysis?.summary || "Unavailable"} styles={styles} />
        <SectionRow label="Key levels" value={aiReport?.technicalAnalysis?.keyLevels || "Unavailable"} styles={styles} />
        <div style={styles.inlineGrid}>
          <Box label="1h Change" value={formatPct(marketData?.priceChange1h)} styles={styles} />
          <Box label="6h Change" value={formatPct(marketData?.priceChange6h)} styles={styles} />
          <Box label="24h Change" value={formatPct(marketData?.priceChange24h)} styles={styles} />
          <Box label="DEX" value={marketData?.dexId || "Unknown"} styles={styles} />
        </div>
      </Card>
    </div>
  );
}
