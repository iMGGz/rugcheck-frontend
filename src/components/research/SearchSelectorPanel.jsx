import React, { useMemo, useState } from "react";
import { shortenAddress, titleCase } from "./researchUtils";

function sectorFilter(candidate) {
  const labelSource = `${candidate?.chain || ""} ${candidate?.category || ""} ${candidate?.name || ""}`.toLowerCase();
  if (labelSource.includes("layer 1") || ["ethereum", "bitcoin", "solana", "avalanche"].some((entry) => labelSource.includes(entry))) return "layer1";
  if (labelSource.includes("defi")) return "defi";
  if (labelSource.includes("meme")) return "meme";
  if (labelSource.includes("rwa")) return "rwa";
  if (labelSource.includes("stable")) return "stablecoins";
  return "all";
}

function normalizeMatchValue(value) {
  return String(value || "").trim().toLowerCase();
}

function buildCandidateMatchLabels(candidate, query) {
  const normalizedQuery = normalizeMatchValue(query);
  const symbol = normalizeMatchValue(candidate?.symbol);
  const name = normalizeMatchValue(candidate?.name);
  const labels = ["Candidate Match"];

  if (normalizedQuery && symbol === normalizedQuery) {
    labels.push("Exact Symbol Match");
  } else if (normalizedQuery && name === normalizedQuery) {
    labels.push("Name Match");
  } else if (candidate?.chain || candidate?.category) {
    labels.push("Network / Project Match");
  } else {
    labels.push("Requires Selection");
  }

  if (candidate?.coingeckoId || candidate?.coinmarketcapId || candidate?.contractAddress) {
    labels.push("Use Existing Metadata");
  }

  return labels.slice(0, 4);
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
  hasExistingAnalysis = false,
  styles,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const filterOptions = [
    { key: "all", label: "All" },
    { key: "layer1", label: "Network metadata" },
    { key: "defi", label: "Project metadata" },
    { key: "meme", label: "Name/theme match" },
    { key: "rwa", label: "RWA text match" },
    { key: "stablecoins", label: "USD text match" },
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
          <div style={styles.selectorTitle}>Select the exact asset to continue</div>
          <div style={styles.selectorText}>
            Multiple assets can share a ticker. Choose the exact asset before analysis updates.
            {pendingResolution?.ambiguityReason ? ` ${pendingResolution.ambiguityReason}` : ` Multiple plausible assets matched "${pendingResolution?.query || "your query"}".`}
            {" "}Candidate labels help identify search results only. Final institutional asset classification appears after analysis.
          </div>
        </div>
        <button onClick={onDismiss} style={styles.ghostButton}>Dismiss</button>
      </div>

      <div style={styles.selectorNotice}>
        <div style={styles.selectorNoticeTitle}>New query pending: select the exact asset before the analysis updates.</div>
        <div style={styles.selectorNoticeText}>
          {hasExistingAnalysis
            ? "Displayed analysis remains the last completed run until a new asset is selected."
            : "Search query pending selection. No allocation memo will run until you choose one of the matched assets."}
        </div>
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
          const matchLabels = buildCandidateMatchLabels(candidate, pendingResolution?.query);
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
                {matchLabels.map((label) => (
                  <span key={label} style={styles.selectorChip}>{label}</span>
                ))}
              </div>

              <div style={styles.selectorMeta}>
                Canonical identity:
                {candidate.coingeckoId ? ` gecko:${candidate.coingeckoId}` : ""}
                {candidate.coinmarketcapId ? ` | cmc:${candidate.coinmarketcapId}` : ""}
              </div>

              <button onClick={() => onSelectCandidate(candidate)} style={styles.selectorPrimaryButton}>
                Use this asset
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
