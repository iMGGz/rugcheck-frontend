import React, { useMemo, useState } from "react";
import { shortenAddress, titleCase } from "./researchUtils";

function classifyCandidate(candidate) {
  const labelSource = `${candidate?.symbol || ""} ${candidate?.name || ""} ${candidate?.category || ""}`.toLowerCase();

  if (["btc", "bitcoin"].some((entry) => labelSource.includes(entry))) return "benchmark";
  if (["eth", "ethereum", "sol", "solana", "arb", "optimism"].some((entry) => labelSource.includes(entry))) return "protocol";
  if (["usd", "usdt", "usdc", "dai", "stable"].some((entry) => labelSource.includes(entry))) return "stablecoin";
  if (["wrapped", "wbtc", "weth"].some((entry) => labelSource.includes(entry))) return "wrapped";
  if (["pepe", "doge", "wif", "meme", "dogelon", "floki"].some((entry) => labelSource.includes(entry))) return "meme";
  return "high-risk";
}

function sectorFilter(candidate) {
  const labelSource = `${candidate?.chain || ""} ${candidate?.category || ""} ${candidate?.name || ""}`.toLowerCase();
  if (labelSource.includes("layer 1") || ["ethereum", "bitcoin", "solana", "avalanche"].some((entry) => labelSource.includes(entry))) return "layer1";
  if (labelSource.includes("defi")) return "defi";
  if (labelSource.includes("meme")) return "meme";
  if (labelSource.includes("rwa")) return "rwa";
  if (labelSource.includes("stable")) return "stablecoins";
  return "all";
}

function badgeLabel(kind) {
  const labels = {
    benchmark: "Benchmark",
    protocol: "Protocol",
    meme: "Meme",
    stablecoin: "Stablecoin",
    wrapped: "Wrapped",
    "high-risk": "High-Risk",
  };

  return labels[kind] || titleCase(kind);
}

function CandidateLogo({ candidate, styles }) {
  if (candidate?.logo) {
    return <img src={candidate.logo} alt={`${candidate.name || candidate.symbol || "Token"} logo`} style={styles.selectorLogo} />;
  }

  return (
    <div style={styles.selectorLogoFallback}>
      {(candidate?.symbol || candidate?.name || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function SearchSelectorPanel({
  pendingResolution,
  onSelectCandidate,
  onDismiss,
  styles,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const filterOptions = [
    { key: "all", label: "All" },
    { key: "layer1", label: "Layer1" },
    { key: "defi", label: "DeFi" },
    { key: "meme", label: "Meme" },
    { key: "rwa", label: "RWA" },
    { key: "stablecoins", label: "Stablecoins" },
  ];

  const filteredCandidates = useMemo(() => {
    const candidates = pendingResolution?.candidates || [];
    if (activeFilter === "all") return candidates;
    return candidates.filter((candidate) => sectorFilter(candidate) === activeFilter);
  }, [activeFilter, pendingResolution]);

  return (
    <div style={styles.selectorPanel}>
      <div style={styles.selectorHeader}>
        <div>
          <div style={styles.selectorEyebrow}>Canonical identity check</div>
          <div style={styles.selectorTitle}>Select the exact asset before allocation analysis</div>
          <div style={styles.selectorText}>
            {pendingResolution?.ambiguityReason || `Multiple plausible assets matched "${pendingResolution?.query || "your query"}".`}
          </div>
        </div>
        <button onClick={onDismiss} style={styles.ghostButton}>Dismiss</button>
      </div>

      <div style={styles.selectorFilterRow}>
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setActiveFilter(option.key)}
            style={{
              ...styles.selectorFilterButton,
              ...(activeFilter === option.key ? styles.selectorFilterButtonActive : null),
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div style={styles.selectorGrid}>
        {filteredCandidates.map((candidate, index) => {
          const taxonomy = classifyCandidate(candidate);
          return (
            <div
              key={`${candidate.coingeckoId || candidate.coinmarketcapId || candidate.contractAddress || `${candidate.symbol}-${candidate.name}-${index}`}`}
              style={styles.selectorCard}
            >
              <div style={styles.selectorIdentity}>
                <CandidateLogo candidate={candidate} styles={styles} />
                <div>
                  <div style={styles.selectorName}>
                    {candidate.name || "Unknown"} {candidate.symbol ? `(${candidate.symbol})` : ""}
                  </div>
                  <div style={styles.selectorMeta}>
                    {titleCase(candidate.chain || "unknown")}
                    {candidate.contractAddress ? ` | ${shortenAddress(candidate.contractAddress)}` : ""}
                  </div>
                </div>
              </div>

              <div style={styles.selectorChipRow}>
                <span style={styles.selectorChip}>{badgeLabel(taxonomy)}</span>
                {candidate.category ? <span style={styles.selectorChip}>{candidate.category}</span> : null}
                {candidate.coingeckoId ? <span style={styles.selectorChip}>Gecko ID</span> : null}
                {candidate.coinmarketcapId ? <span style={styles.selectorChip}>CMC ID</span> : null}
              </div>

              <div style={styles.selectorMeta}>
                Canonical identity:
                {candidate.coingeckoId ? ` gecko:${candidate.coingeckoId}` : ""}
                {candidate.coinmarketcapId ? ` | cmc:${candidate.coinmarketcapId}` : ""}
              </div>

              <button onClick={() => onSelectCandidate(candidate)} style={styles.primaryButton}>
                Use this asset
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
