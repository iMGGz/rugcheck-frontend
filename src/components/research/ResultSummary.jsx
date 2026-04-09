import React from "react";
import { Box } from "./researchPrimitives";
import {
  confidenceColor,
  confidenceLabel,
  formatCompact,
  formatPct,
  formatUsd,
  verdictColor,
} from "./researchUtils";

export default function ResultSummary({
  asset,
  marketData,
  riskVerdict,
  scores,
  confidence,
  isFavorite,
  toggleFavorite,
  copyShareLink,
  copyMessage,
  styles,
}) {
  return (
    <div style={styles.resultCard}>
      <div style={styles.resultHeader}>
        <div>
          <h2 style={{ margin: "0 0 6px 0" }}>{asset?.name || "Unknown token"}</h2>
          <div style={{ color: "#8a94a6" }}>
            {asset?.symbol || "?"}
            {asset?.chain ? ` | ${asset.chain}` : ""}
            {marketData?.dexId ? ` | ${marketData.dexId}` : ""}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: verdictColor(riskVerdict), fontWeight: 800, fontSize: 22 }}>{riskVerdict}</div>
          <div style={{ color: "#d5dcec" }}>Overall Score: {scores?.overallScore ?? "Unknown"}/100</div>
          {confidence ? (
            <div style={{ color: confidenceColor(confidence.level), fontWeight: 700, marginTop: 6 }}>
              {confidenceLabel(confidence.level)} | {confidence.score}/100
            </div>
          ) : null}
        </div>
      </div>

      <div style={styles.resultActions}>
        <button onClick={toggleFavorite} style={styles.actionButton}>
          {isFavorite ? "Remove from watchlist" : "Save to watchlist"}
        </button>
        <button onClick={copyShareLink} style={styles.actionButton}>
          Copy share link
        </button>
        {copyMessage ? <div style={styles.copyMessage}>{copyMessage}</div> : null}
      </div>

      <div style={styles.metricsGrid}>
        <Box label="Price" value={formatUsd(marketData?.priceUsd)} styles={styles} />
        <Box label="Market Cap" value={formatUsd(marketData?.marketCap)} styles={styles} />
        <Box label="FDV" value={formatUsd(marketData?.fdv)} styles={styles} />
        <Box label="24h Volume" value={formatUsd(marketData?.volume24h)} styles={styles} />
        <Box label="DEX Liquidity" value={formatUsd(marketData?.dexLiquidityUsd)} styles={styles} />
        <Box label="24h Change" value={formatPct(marketData?.priceChange24h)} styles={styles} />
        <Box label="Circulating Supply" value={formatCompact(marketData?.circulatingSupply)} styles={styles} />
        <Box label="Total Supply" value={formatCompact(marketData?.totalSupply)} styles={styles} />
      </div>
    </div>
  );
}
