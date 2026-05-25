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

function buildCandidateMeta(candidate) {
  const parts = [];
  if (candidate?.symbol) parts.push(candidate.symbol);
  if (candidate?.chain) parts.push(titleCase(candidate.chain));
  if (!candidate?.chain && candidate?.category) parts.push(titleCase(candidate.category));
  if (candidate?.contractAddress) parts.push(shortenAddress(candidate.contractAddress));
  return parts.length ? parts.join(" - ") : "Metadata available after selection";
}

function candidateIdentityChips(candidate) {
  const summary = candidate?.identitySummary || {};
  return [
    ...(summary.badges || []),
    summary.networkLabel ? `Network: ${summary.networkLabel}` : null,
    summary.confidence ? `Identity confidence: ${summary.confidence}` : null,
  ].filter(Boolean).slice(0, 5);
}

function SelectorActionButton({
  children,
  onClick,
  baseStyle,
  hoverStyle,
  focusStyle,
  pressedStyle,
  activeStyle,
  disabledStyle,
  active = false,
  disabled = false,
  ariaPressed,
}) {
  const [interactiveState, setInteractiveState] = useState({
    hover: false,
    focus: false,
    pressed: false,
  });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      onMouseEnter={() => setInteractiveState((state) => ({ ...state, hover: true }))}
      onMouseLeave={() => setInteractiveState((state) => ({ ...state, hover: false, pressed: false }))}
      onMouseDown={() => setInteractiveState((state) => ({ ...state, pressed: true }))}
      onMouseUp={() => setInteractiveState((state) => ({ ...state, pressed: false }))}
      onFocus={() => setInteractiveState((state) => ({ ...state, focus: true }))}
      onBlur={() => setInteractiveState({ hover: false, focus: false, pressed: false })}
      style={{
        ...baseStyle,
        ...(active ? activeStyle : null),
        ...(interactiveState.hover && !disabled ? hoverStyle : null),
        ...(interactiveState.focus && !disabled ? focusStyle : null),
        ...(interactiveState.pressed && !disabled ? pressedStyle : null),
        ...(disabled ? disabledStyle : null),
      }}
    >
      {children}
    </button>
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
          <div style={styles.selectorTitle}>Select exact asset</div>
          <div style={styles.selectorText}>
            Multiple assets can share a ticker. Pick one to continue.
          </div>
          <div style={styles.selectorBoundaryText}>
            Candidate labels help matching only. Final institutional classification appears after analysis.
          </div>
        </div>
        <SelectorActionButton
          onClick={onDismiss}
          baseStyle={styles.ghostButton}
          hoverStyle={styles.ghostButtonHover}
          focusStyle={styles.ghostButtonFocus}
          pressedStyle={styles.ghostButtonPressed}
          disabledStyle={styles.selectorButtonDisabled}
        >
          Dismiss
        </SelectorActionButton>
      </div>

      <div style={styles.selectorNotice}>
        <div style={styles.selectorNoticeTitle}>New query pending.</div>
        <div style={styles.selectorNoticeText}>
          {hasExistingAnalysis
            ? "Current memo stays visible until you select an asset."
            : "Pick one matched asset before the memo runs."}
        </div>
      </div>

      <div style={styles.selectorFilterRow}>
        {filterOptions.map((option) => (
          <SelectorActionButton
            key={option.key}
            onClick={() => setActiveFilter(option.key)}
            baseStyle={styles.selectorFilterButton}
            activeStyle={styles.selectorFilterButtonActive}
            hoverStyle={styles.selectorFilterButtonHover}
            focusStyle={styles.selectorFilterButtonFocus}
            pressedStyle={styles.selectorFilterButtonPressed}
            disabledStyle={styles.selectorButtonDisabled}
            active={activeFilter === option.key}
            ariaPressed={activeFilter === option.key}
          >
            {option.label}
          </SelectorActionButton>
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
              <div style={styles.selectorCandidateHeader}>
                <div style={styles.selectorIdentity}>
                  <CandidateLogo candidate={candidate} styles={styles} />
                  <div style={styles.selectorCandidateMain}>
                    <div style={styles.selectorName}>
                      {candidate.name || "Unknown"}
                    </div>
                    <div style={styles.selectorMeta}>
                      {buildCandidateMeta(candidate)}
                    </div>
                  </div>
                </div>

                <SelectorActionButton
                  onClick={() => onSelectCandidate(candidate)}
                  baseStyle={styles.selectorPrimaryButton}
                  hoverStyle={styles.selectorPrimaryButtonHover}
                  focusStyle={styles.selectorPrimaryButtonFocus}
                  pressedStyle={styles.selectorPrimaryButtonPressed}
                  disabledStyle={styles.selectorButtonDisabled}
                >
                  Use this asset
                </SelectorActionButton>
              </div>

              <div style={styles.selectorChipRow}>
                {matchLabels.map((label) => (
                  <span key={label} style={styles.selectorChip}>{label}</span>
                ))}
              </div>

              <div style={styles.selectorCanonicalMeta}>
                Canonical identity:
                {candidate.coingeckoId ? ` gecko:${candidate.coingeckoId}` : ""}
                {candidate.coinmarketcapId ? ` | cmc:${candidate.coinmarketcapId}` : ""}
              </div>
              <div style={styles.selectorCanonicalMeta}>
                Network/contract:
                {` ${candidate.identitySummary?.networkLabel || candidate.chain || "network unknown"}`}
                {` | ${candidate.identitySummary?.contractLabel || candidate.contractAddress || "contract unavailable or not applicable"}`}
              </div>
              <div style={styles.selectorChipRow}>
                {candidateIdentityChips(candidate).map((label) => (
                  <span key={label} style={styles.selectorChip}>{label}</span>
                ))}
              </div>
              {candidate.identitySummary?.warning ? (
                <div style={styles.selectorBoundaryText}>{candidate.identitySummary.warning}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
