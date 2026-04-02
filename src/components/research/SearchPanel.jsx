import React from "react";

export default function SearchPanel({
  query,
  setQuery,
  analyze,
  loading,
  quickSearches,
  history,
  favorites,
  clearHistory,
  lastUpdated,
  styles,
}) {
  return (
    <div style={styles.searchPanel}>
      <div style={styles.searchHeader}>
        <div>
          <div style={styles.searchTitle}>Run analysis</div>
          <div style={styles.searchHint}>Use a symbol, project name, or EVM contract address.</div>
        </div>
        {lastUpdated ? <div style={styles.lastUpdated}>Last result: {lastUpdated}</div> : null}
      </div>

      <div style={styles.searchRow}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") analyze(query, "full");
          }}
          style={styles.input}
          placeholder="ETH, Pepe, 0x..."
        />
        <button onClick={() => analyze(query, "full")} style={styles.primaryButton} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <div style={styles.quickRow}>
        {quickSearches.map((item) => (
          <button
            key={item}
            onClick={() => {
              setQuery(item);
              analyze(item, "full");
            }}
            style={styles.quickButton}
          >
            {item}
          </button>
        ))}
      </div>

      {history.length ? (
        <div style={styles.historyWrap}>
          <div style={styles.historyHeader}>
            <div style={styles.historyLabel}>Recent searches</div>
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

      {favorites.length ? (
        <div style={styles.historyWrap}>
          <div style={styles.historyLabel}>Watchlist</div>
          <div style={styles.historyRow}>
            {favorites.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setQuery(item);
                  analyze(item, "full");
                }}
                style={styles.favoriteButton}
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
