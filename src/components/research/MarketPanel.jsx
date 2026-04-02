import React from "react";
import { Box, Card, ListBlock, SectionRow } from "./researchPrimitives";
import { buildSectionQualityHint, formatUsd } from "./researchUtils";
import PanelStatusRow from "./PanelStatusRow";

export default function MarketPanel({ aiReport, marketData, sourceStatus, providerDiagnostics, providerHealth, freshnessEntry, styles }) {
  const hint = buildSectionQualityHint("market", {
    providerDiagnostics,
    providerHealth,
    sourceStatus,
  });

  return (
    <div style={styles.advancedGridSingle}>
      <Card title="Market structure" score={aiReport?.marketStructure?.score} subtitle={aiReport?.marketStructure?.marketCapTier || "Market analysis"} styles={styles}>
        <PanelStatusRow hint={hint} freshnessEntry={freshnessEntry} styles={styles} />
        <SectionRow label="Summary" value={aiReport?.marketStructure?.summary || "Unavailable"} styles={styles} />
        <SectionRow label="Liquidity assessment" value={aiReport?.marketStructure?.liquidityAssessment || "Unavailable"} styles={styles} />
        <SectionRow label="Volume quality" value={aiReport?.marketStructure?.volumeQuality || "Unavailable"} styles={styles} />
        <div style={styles.inlineGrid}>
          <Box label="Price" value={formatUsd(marketData?.priceUsd)} styles={styles} />
          <Box label="24h Volume" value={formatUsd(marketData?.volume24h)} styles={styles} />
          <Box label="Market Cap" value={formatUsd(marketData?.marketCap)} styles={styles} />
          <Box label="FDV" value={formatUsd(marketData?.fdv)} styles={styles} />
          <Box label="DEX Liquidity" value={formatUsd(marketData?.dexLiquidityUsd)} styles={styles} />
          <Box label="Turnover Ratio" value={marketData?.turnoverRatio ?? "Unknown"} styles={styles} />
        </div>
        <ListBlock title="Top exchanges" items={marketData?.topExchanges || []} emptyText="No exchange data available." color="#9bd7ff" styles={styles} />
      </Card>
    </div>
  );
}
