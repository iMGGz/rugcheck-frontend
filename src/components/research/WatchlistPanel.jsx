import React from "react";
import { Card } from "./researchPrimitives";
import {
  buildWatchlistKey,
  buildWatchlistFreshnessMeta,
  buildWatchlistRefreshResultMeta,
  buildWatchlistTimestampMeta,
  compareAreaLabel,
  formatDateTime,
  safeArray,
  shortenAddress,
  titleCase,
} from "./researchUtils";

function WatchlistLogo({ item, styles }) {
  if (item.logo) {
    return <img src={item.logo} alt={`${item.name || item.symbol || "Token"} logo`} style={styles.pickerLogo} />;
  }

  return (
    <div style={styles.pickerLogoFallback}>
      {(item.symbol || item.name || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function WatchlistPanel({
  watchlistItems,
  watchlistTotalCount,
  watchlistStates,
  watchlistChecks,
  watchlistRefreshResults,
  watchlistLoading,
  watchlistError,
  watchlistRefreshError,
  watchlistRefreshNotice,
  watchlistBatchSummary,
  watchlistRefreshingKeys,
  watchlistBatchRefresh,
  watchlistFilter,
  watchlistSort,
  onChangeWatchlistFilter,
  onChangeWatchlistSort,
  onOpenItem,
  onRefreshItem,
  onRefreshAll,
  onRemoveItem,
  styles,
}) {
  const safeWatchlistItems = safeArray(watchlistItems);
  const safeWatchlistStates = safeArray(watchlistStates);
  const safeRefreshingKeys = safeArray(watchlistRefreshingKeys);

  if (!safeWatchlistItems.length && !watchlistLoading && !watchlistError) return null;

  const statesByKey = new Map(safeWatchlistStates.map((entry) => [buildWatchlistKey(entry?.asset), entry]));
  const filterOptions = [
    { key: "all", label: "All" },
    { key: "stale", label: "Stale" },
    { key: "refresh_failed", label: "Refresh failed" },
    { key: "updated_recently", label: "Updated recently" },
    { key: "limited_coverage", label: "Limited coverage" },
  ];

  return (
    <Card title="Watchlist" subtitle="Saved resolved assets with latest stored snapshot context" styles={styles}>
      <div style={styles.watchlistToolbar}>
        <button
          onClick={() => onRefreshAll?.()}
          style={styles.actionButton}
          disabled={!safeWatchlistItems.length || Boolean(watchlistBatchRefresh) || safeRefreshingKeys.length > 0}
        >
          {watchlistBatchRefresh
            ? `Refreshing ${watchlistBatchRefresh.completed}/${watchlistBatchRefresh.total}`
            : "Refresh watchlist"}
        </button>
        <select
          value={watchlistSort}
          onChange={(event) => onChangeWatchlistSort?.(event.target.value)}
          style={styles.watchlistSelect}
        >
          <option value="newest_checked">Newest checked</option>
          <option value="oldest_checked">Oldest checked</option>
          <option value="stale_first">Stale first</option>
          <option value="recently_updated_first">Recently updated first</option>
        </select>
        {watchlistRefreshNotice ? <div style={styles.metaSubtext}>{watchlistRefreshNotice}</div> : null}
      </div>

      <div style={styles.watchlistFilterRow}>
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => onChangeWatchlistFilter?.(option.key)}
            style={{
              ...styles.quickButton,
              ...(watchlistFilter === option.key ? styles.watchlistFilterButtonActive : null),
            }}
          >
            {option.label}
          </button>
        ))}
        <span style={styles.watchlistCountText}>
          Showing {safeWatchlistItems.length} of {watchlistTotalCount || safeWatchlistItems.length}
        </span>
      </div>

      {watchlistBatchSummary ? (
        <div style={styles.watchlistBatchSummary}>
          <div style={styles.watchlistBatchSummaryTitle}>Latest refresh run</div>
          <div style={styles.timelineChipRow}>
            <span style={{ ...styles.riskChip, borderColor: "#2fd67b", color: "#2fd67b" }}>
              Refreshed {watchlistBatchSummary.successful}/{watchlistBatchSummary.total}
            </span>
            {watchlistBatchSummary.failed ? (
              <span style={{ ...styles.riskChip, borderColor: "#ff6b6b", color: "#ff6b6b" }}>
                Failed {watchlistBatchSummary.failed}
              </span>
            ) : null}
            {watchlistBatchSummary.limitedCoverageCount ? (
              <span style={{ ...styles.riskChip, borderColor: "#7dd3fc", color: "#7dd3fc" }}>
                Limited coverage {watchlistBatchSummary.limitedCoverageCount}
              </span>
            ) : null}
            {watchlistBatchSummary.staleCount ? (
              <span style={{ ...styles.riskChip, borderColor: "#ffb020", color: "#ffb020" }}>
                Stale {watchlistBatchSummary.staleCount}
              </span>
            ) : null}
          </div>
          {watchlistBatchSummary.meaningfulChanges?.length ? (
            <div style={styles.watchlistBatchSummaryText}>
              Meaningful snapshot changes:{" "}
              {watchlistBatchSummary.meaningfulChanges
                .slice(0, 3)
                .map((entry) => `${entry.label} (${titleCase(entry.impact)} impact)`)
                .join(", ")}
              .
            </div>
          ) : null}
        </div>
      ) : null}

      {watchlistLoading && !safeWatchlistItems.length ? (
        <p style={styles.timelineEmptyText}>Loading watchlist state...</p>
      ) : null}

      {watchlistError ? (
        <div style={styles.inlineErrorBox}>
          <div style={styles.inlineErrorTitle}>Watchlist preview unavailable</div>
          <div style={styles.inlineErrorText}>{watchlistError}</div>
        </div>
      ) : null}

      {watchlistRefreshError ? (
        <div style={styles.inlineErrorBox}>
          <div style={styles.inlineErrorTitle}>Refresh issue</div>
          <div style={styles.inlineErrorText}>{watchlistRefreshError}</div>
        </div>
      ) : null}

      {safeWatchlistItems.length ? (
        <div style={styles.watchlistGrid}>
          {safeWatchlistItems.map((item) => {
            const state = statesByKey.get(buildWatchlistKey(item));
            const latestSnapshot = state?.latestSnapshot || null;
            const impact = latestSnapshot?.compactImpact || null;
            const itemKey = buildWatchlistKey(item);
            const impactSummaryLines = safeArray(impact?.summaryLines);
            const topChangedAreas = safeArray(impact?.topChangedAreas);
            const isRefreshing = safeRefreshingKeys.includes(itemKey);
            const freshness = buildWatchlistFreshnessMeta(latestSnapshot);
            const refreshResult = buildWatchlistRefreshResultMeta(watchlistRefreshResults?.[itemKey] || null);
            const timestamp = buildWatchlistTimestampMeta({
              latestSnapshot,
              lastCheckedAt: watchlistChecks?.[itemKey] || null,
              isRefreshing,
            });

            return (
              <div key={itemKey} style={styles.watchlistCard}>
                <div style={styles.watchlistHeader}>
                  <div style={styles.watchlistIdentityRow}>
                    <WatchlistLogo item={item} styles={styles} />
                    <div>
                      <div style={styles.pickerName}>
                        {item.name || "Unknown"} {item.symbol ? `(${item.symbol})` : ""}
                      </div>
                      <div style={styles.watchlistSubtitle}>
                        {titleCase(item.chain || "unknown")}
                        {item.contractAddress ? ` | ${shortenAddress(item.contractAddress)}` : ""}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onRemoveItem(item)} style={styles.ghostButton}>Remove</button>
                </div>

                <div style={styles.watchlistStatusRow}>
                  <span
                    style={{
                      ...styles.watchlistStatusChip,
                      borderColor: freshness.color,
                      color: freshness.color,
                    }}
                  >
                    {freshness.label}
                  </span>
                  {freshness.detail ? (
                    <span style={styles.watchlistStatusDetail}>{freshness.detail}</span>
                  ) : null}
                </div>

                {timestamp ? (
                  <div style={styles.watchlistTimestampRow}>
                    <span style={styles.watchlistTimestampLabel}>{timestamp.label}</span>
                    <span style={styles.watchlistTimestampValue}>{timestamp.value}</span>
                  </div>
                ) : null}

                {refreshResult ? (
                  <div style={styles.watchlistRefreshResultRow}>
                    <span
                      style={{
                        ...styles.watchlistRefreshResultChip,
                        borderColor: refreshResult.color,
                        color: refreshResult.color,
                      }}
                    >
                      {refreshResult.label}
                    </span>
                    {refreshResult.detail ? (
                      <span style={styles.watchlistRefreshResultDetail}>{refreshResult.detail}</span>
                    ) : null}
                  </div>
                ) : null}

                {latestSnapshot ? (
                  <>
                    <div style={styles.watchlistSummaryText}>
                      Latest snapshot: {formatDateTime(latestSnapshot.generatedAt)}
                    </div>
                    <div style={styles.timelineChipRow}>
                      <span style={{ ...styles.riskChip, borderColor: "#7dd3fc", color: "#7dd3fc" }}>
                        Overall {latestSnapshot?.summary?.overallScore ?? "?"}/100
                      </span>
                      <span style={{ ...styles.riskChip, borderColor: "#2fd67b", color: "#2fd67b" }}>
                        Confidence {latestSnapshot?.summary?.confidenceScore ?? "?"}/100
                      </span>
                      {impact?.overall ? (
                        <span style={{ ...styles.riskChip, borderColor: "#ffb020", color: "#ffb020" }}>
                          Impact {titleCase(impact.overall)}
                        </span>
                      ) : null}
                    </div>
                    {impactSummaryLines.length ? (
                      <div style={styles.watchlistSummaryText}>
                        {impactSummaryLines.join(" ")}
                      </div>
                    ) : null}
                    {topChangedAreas.length ? (
                      <div style={styles.timelineChipRow}>
                        {topChangedAreas.map((area) => (
                          <span key={`${itemKey}-${area}`} style={styles.pickerChip}>
                            {compareAreaLabel(area)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div style={styles.watchlistSummaryText}>
                    No stored timeline state yet for this asset. Run analysis to create the first snapshot.
                  </div>
                )}

                <div style={styles.watchlistActionRow}>
                  <button onClick={() => onRefreshItem(item)} style={styles.actionButton} disabled={isRefreshing || Boolean(watchlistBatchRefresh)}>
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                  <button onClick={() => onOpenItem(item)} style={styles.actionButton}>Open analysis</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={styles.timelineEmptyText}>No watchlist items match the current filter.</p>
      )}
    </Card>
  );
}
