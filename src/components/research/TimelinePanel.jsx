import React from "react";
import { Box, Card, ListBlock } from "./researchPrimitives";
import { compareAreaLabel, formatDateTime, impactColor, providerLabel, titleCase } from "./researchUtils";

export default function TimelinePanel({
  timelineLoading,
  timelineError,
  timelineData,
  timelinePageInfo,
  timelineLoadingMore,
  loadTimeline,
  latestTimelineSnapshot,
  asset,
  query,
  onOpenSnapshot,
  openedSnapshotId,
  styles,
}) {
  return (
    <Card title="Research timeline" subtitle="Stored snapshots, compact impact, and provider quality context" styles={styles}>
      {timelineLoading && !timelineData.length ? (
        <p style={styles.timelineEmptyText}>Loading stored snapshot history...</p>
      ) : null}

      {timelineError ? (
        <div style={styles.inlineErrorBox}>
          <div style={styles.inlineErrorTitle}>Timeline unavailable</div>
          <div style={styles.inlineErrorText}>{timelineError}</div>
        </div>
      ) : null}

      {!timelineLoading && !timelineError && !timelineData.length ? (
        <p style={styles.timelineEmptyText}>No stored snapshot history is available yet for this token. Run another analysis later to build a timeline.</p>
      ) : null}

      {timelineData.length ? (
        <div style={styles.timelineStack}>
          {timelineData.map((item, index) => {
            const impact = item.compactImpact;
            const providerSummary = item.compactProviderDiagnostics;
            const isLatest = index === 0;

            return (
              <div
                key={item.snapshotId}
                style={{
                  ...styles.timelineEntry,
                  ...(isLatest ? styles.timelineEntryActive : {}),
                }}
              >
                <div style={styles.timelineEntryHeader}>
                  <div>
                    <div style={styles.timelineTitleRow}>
                      <strong style={{ color: "#f4f7ff" }}>
                        {isLatest ? "Latest stored snapshot" : "Historical snapshot"}
                      </strong>
                      <span
                        style={{
                          ...styles.riskChip,
                          borderColor: impactColor(impact?.overall || "none"),
                          color: impactColor(impact?.overall || "none"),
                        }}
                      >
                        Impact: {titleCase(impact?.overall || "none")}
                      </span>
                      {providerSummary?.likelyImpactedQuality ? (
                        <span style={{ ...styles.riskChip, borderColor: "#ffb020", color: "#ffb020" }}>
                          Provider quality impacted
                        </span>
                      ) : null}
                    </div>
                    <div style={styles.timelineMeta}>{formatDateTime(item.generatedAt)}</div>
                  </div>
                  <div style={styles.timelineMeta}>
                    Overall {item.summary.overallScore}/100 | Confidence {item.summary.confidenceScore}/100
                  </div>
                </div>

                <div style={styles.timelineActionRow}>
                  <button
                    onClick={() => onOpenSnapshot?.(item.snapshotId)}
                    style={styles.actionButton}
                  >
                    {openedSnapshotId === item.snapshotId ? "Viewing snapshot" : "Open snapshot"}
                  </button>
                </div>

                <div style={styles.timelineSummary}>
                  {impact?.summaryLines?.length
                    ? impact.summaryLines.join(" ")
                    : "No major change summary was stored for this snapshot."}
                </div>

                {impact?.topChangedAreas?.length ? (
                  <div style={styles.timelineChipRow}>
                    {impact.topChangedAreas.map((area) => (
                      <span key={`${item.snapshotId}-${area}`} style={{ ...styles.riskChip, borderColor: "#7dd3fc", color: "#7dd3fc" }}>
                        {compareAreaLabel(area)}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div style={styles.inlineGrid}>
                  <Box label="Confidence level" value={titleCase(item.summary.confidenceLevel)} styles={styles} />
                  <Box label="Data quality" value={titleCase(item.summary.dataQuality)} styles={styles} />
                  <Box label="On-chain score" value={item.summary.onChainScore ?? "Unavailable"} styles={styles} />
                  <Box label="Docs score" value={`${item.summary.docsScore}/100`} styles={styles} />
                </div>

                {providerSummary ? (
                  <>
                    <div style={styles.timelineSubsectionTitle}>Provider diagnostics snapshot</div>
                    <div style={styles.timelineChipRow}>
                      {providerSummary.failedProviders.length ? providerSummary.failedProviders.map((provider) => (
                        <span key={`${item.snapshotId}-failed-${provider}`} style={{ ...styles.riskChip, borderColor: "#ff6b6b", color: "#ff6b6b" }}>
                          Failed: {providerLabel(provider)}
                        </span>
                      )) : (
                        <span style={{ ...styles.riskChip, borderColor: "#2fd67b", color: "#2fd67b" }}>
                          No failed providers
                        </span>
                      )}
                      {providerSummary.skippedProviders.map((provider) => (
                        <span key={`${item.snapshotId}-skipped-${provider}`} style={{ ...styles.riskChip, borderColor: "#ffb020", color: "#ffb020" }}>
                          Skipped: {providerLabel(provider)}
                        </span>
                      ))}
                      {providerSummary.keyErrorClasses.map((errorClass) => (
                        <span key={`${item.snapshotId}-${errorClass}`} style={{ ...styles.riskChip, borderColor: "#8a94a6", color: "#8a94a6" }}>
                          {titleCase(errorClass)}
                        </span>
                      ))}
                    </div>
                    <ListBlock
                      title="Provider notes"
                      items={providerSummary.summaryLines || []}
                      emptyText="No provider issues were stored for this snapshot."
                      color="#9bd7ff"
                      styles={styles}
                    />
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {timelinePageInfo?.nextCursor ? (
        <div style={styles.timelineActionRow}>
          <button
            onClick={() => loadTimeline(latestTimelineSnapshot?.query || asset?.query || query, { cursor: timelinePageInfo.nextCursor, append: true })}
            style={styles.secondaryButton}
            disabled={timelineLoadingMore}
          >
            {timelineLoadingMore ? "Loading history..." : "Load older snapshots"}
          </button>
        </div>
      ) : null}
    </Card>
  );
}
