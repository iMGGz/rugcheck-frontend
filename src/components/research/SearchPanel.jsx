import React, { useState } from "react";

function shortcutLabel(item) {
  if (typeof item === "string") return item;
  return item?.label || item?.symbol || item?.query || item?.name || "Asset";
}

function shortcutQuery(item) {
  if (typeof item === "string") return item;
  return item?.query || item?.symbol || item?.label || item?.name || "";
}

function shortcutTitle(item) {
  if (typeof item === "string") return item;
  return [
    item?.name || item?.label || item?.symbol,
    item?.family,
    item?.coingeckoId ? `CoinGecko: ${item.coingeckoId}` : null,
    item?.coinmarketcapId ? `CMC: ${item.coinmarketcapId}` : null,
    "Benchmark preset; not a recommendation.",
  ].filter(Boolean).join(" | ");
}

function SearchShortcutChip({ item, onClick, styles }) {
  const [interactiveState, setInteractiveState] = useState({
    hover: false,
    focus: false,
    pressed: false,
  });
  const label = shortcutLabel(item);
  const badge = typeof item === "string" ? null : item?.badge;

  return (
    <button
      type="button"
      onClick={onClick}
      title={shortcutTitle(item)}
      onMouseEnter={() => setInteractiveState((state) => ({ ...state, hover: true }))}
      onMouseLeave={() => setInteractiveState((state) => ({ ...state, hover: false, pressed: false }))}
      onMouseDown={() => setInteractiveState((state) => ({ ...state, pressed: true }))}
      onMouseUp={() => setInteractiveState((state) => ({ ...state, pressed: false }))}
      onFocus={() => setInteractiveState((state) => ({ ...state, focus: true }))}
      onBlur={() => setInteractiveState({ hover: false, focus: false, pressed: false })}
      style={{
        ...styles.quickButton,
        ...(interactiveState.hover ? styles.quickButtonHover : null),
        ...(interactiveState.focus ? styles.quickButtonFocus : null),
        ...(interactiveState.pressed ? styles.quickButtonPressed : null),
      }}
    >
      <span>{label}</span>
      {badge ? (
        <span style={{
          marginLeft: 6,
          padding: "2px 6px",
          borderRadius: 999,
          background: "rgba(125, 211, 252, 0.12)",
          color: "#93c5fd",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}>
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export default function SearchPanel({
  query,
  setQuery,
  analyze,
  loading,
  quickSearches,
  history,
  clearHistory,
  lastUpdated,
  styles,
}) {
  return (
    <div style={styles.searchPanel}>
      <div style={styles.searchHeader}>
        <div>
          <div style={styles.searchTitle}>Search for the asset to analyze</div>
          <div style={styles.searchHint}>Use a symbol, project name, or EVM contract address. If multiple assets match, choose the exact asset before the memo updates.</div>
        </div>
        {lastUpdated ? <div style={styles.lastUpdated}>Last memo: {lastUpdated}</div> : null}
      </div>

      <div style={styles.searchRow}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") analyze(query, "full");
          }}
          style={styles.input}
          placeholder="ETH, AAVE, 0x..."
        />
        <button onClick={() => analyze(query, "full")} style={styles.primaryButton} disabled={loading}>
          {loading ? "Resolving..." : "Find Asset"}
        </button>
      </div>

      <div style={styles.quickSearchWrap}>
        <div style={styles.quickSearchHeader}>
          <div style={styles.quickSearchTitle}>Research Shortcuts</div>
          <div style={styles.quickSearchSubtitle}>
            Representative assets for testing different asset-class lenses. Not recommendations.
          </div>
        </div>
        <div style={styles.quickRow}>
          {quickSearches.map((item) => (
            <SearchShortcutChip
              key={typeof item === "string" ? item : item?.presetId || item?.symbol || item?.query}
              item={item}
              styles={styles}
              onClick={() => {
                const queryValue = shortcutQuery(item);
                setQuery(queryValue);
                analyze(queryValue, "full");
              }}
            />
          ))}
        </div>
      </div>

      {history.length ? (
        <div style={styles.historyWrap}>
          <div style={styles.historyHeader}>
            <div style={styles.historyLabel}>Recent assessments</div>
            <button onClick={clearHistory} style={styles.ghostButton}>Clear</button>
          </div>
          <div style={styles.historyRow}>
            {history.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setQuery(item);
                  analyze(item, "full");
                }}
                style={styles.historyButton}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

    </div>
  );
}
