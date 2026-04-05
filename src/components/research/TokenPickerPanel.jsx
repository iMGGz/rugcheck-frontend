import React from "react";
import { shortenAddress, titleCase } from "./researchUtils";

function CandidateLogo({ candidate, styles }) {
  if (candidate.logo) {
    return <img src={candidate.logo} alt={`${candidate.name || candidate.symbol || "Token"} logo`} style={styles.pickerLogo} />;
  }

  return (
    <div style={styles.pickerLogoFallback}>
      {(candidate.symbol || candidate.name || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function TokenPickerPanel({
  pendingResolution,
  onSelectCandidate,
  onDismiss,
  styles,
}) {
  if (!pendingResolution?.candidates?.length) return null;

  return (
    <div style={styles.pickerPanel}>
      <div style={styles.pickerTitle}>Choose the correct token before analysis</div>
      <div style={styles.pickerText}>
        {pendingResolution.ambiguityReason || `Multiple plausible assets matched "${pendingResolution.query}".`}
      </div>

      <div style={styles.pickerGrid}>
        {pendingResolution.candidates.map((candidate, index) => (
          <div key={`${candidate.coingeckoId || candidate.coinmarketcapId || candidate.contractAddress || `${candidate.symbol}-${candidate.name}-${index}`}`} style={styles.pickerCard}>
            <CandidateLogo candidate={candidate} styles={styles} />

            <div>
              <div style={styles.pickerName}>
                {candidate.name || "Unknown"} {candidate.symbol ? `(${candidate.symbol})` : ""}
              </div>
              <div style={styles.pickerMeta}>
                Chain: {titleCase(candidate.chain || "unknown")}
                {candidate.contractAddress ? ` | Contract: ${shortenAddress(candidate.contractAddress)}` : ""}
              </div>
              <div style={styles.pickerChipRow}>
                {candidate.coingeckoId ? <span style={styles.pickerChip}>CoinGecko: {candidate.coingeckoId}</span> : null}
                {candidate.coinmarketcapId ? <span style={styles.pickerChip}>CMC: {candidate.coinmarketcapId}</span> : null}
                {candidate.category ? <span style={styles.pickerChip}>{candidate.category}</span> : null}
                <span style={styles.pickerChip}>Match: {titleCase(candidate.relevanceLabel || "medium")}</span>
              </div>
            </div>

            <div style={styles.pickerActionCol}>
              <button onClick={() => onSelectCandidate(candidate)} style={styles.primaryButton}>
                Analyze
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={onDismiss} style={styles.ghostButton}>Dismiss</button>
      </div>
    </div>
  );
}
