import React from "react";
import { Box, Card, ListBlock } from "./researchPrimitives";
import { compareAreaLabel, formatDateTime, impactColor, providerLabel, safeArray, safeObject, titleCase } from "./researchUtils";

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
  const safeTimelineData = safeArray(timelineData);
  const safePageInfo = safeObject(timelinePageInfo);

  return (
    <Card title="Research timeline" subtitle="Stored snapshots, compact impact, and provider quality context" styles={styles}>
      {timelineLoading && !safeTimelineData.length ? (
        <p style={styles.timelineEmptyText}>Loading stored snapshot history...</p>
      ) : null}

      {timelineError ? (
        <div style={styles.inlineErrorBox}>
          <div style={styles.inlineErrorTitle}>Timeline unavailable</div>
          <div style={styles.inlineErrorText}>{timelineError}</div>
        </div>
      ) : null}

      {!timelineLoading && !timelineError && !safeTimelineData.length ? (
        <p style={styles.timelineEmptyText}>No stored snapshot history is available yet for this token. Run another analysis later to build a timeline.</p>
      ) : null}

      {safeTimelineData.length ? (
        <div style={styles.timelineStack}>
          {safeTimelineData.map((item, index) => {
            const impact = safeObject(item?.compactImpact);
            const providerSummary = safeObject(item?.compactProviderDiagnostics);
            const impactSummaryLines = safeArray(impact.summaryLines);
            const topChangedAreas = safeArray(impact.topChangedAreas);
            const failedProviders = safeArray(providerSummary.failedProviders);
            const skippedProviders = safeArray(providerSummary.skippedProviders);
            const keyErrorClasses = safeArray(providerSummary.keyErrorClasses);
            const providerSummaryLines = safeArray(providerSummary.summaryLines);
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
                    Overall {item?.summary?.overallScore ?? "?"}/100 | Confidence {item?.summary?.confidenceScore ?? "?"}/100
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
                  {impactSummaryLines.length
                    ? impactSummaryLines.join(" ")
                    : "No major change summary was stored for this snapshot."}
                </div>

                {topChangedAreas.length ? (
                  <div style={styles.timelineChipRow}>
                    {topChangedAreas.map((area) => (
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

                {Object.keys(providerSummary).length ? (
                  <>
                    <div style={styles.timelineSubsectionTitle}>Provider diagnostics snapshot</div>
                    <div style={styles.timelineChipRow}>
                      {failedProviders.length ? failedProviders.map((provider) => (
                        <span key={`${item.snapshotId}-failed-${provider}`} style={{ ...styles.riskChip, borderColor: "#ff6b6b", color: "#ff6b6b" }}>
                          Failed: {providerLabel(provider)}
                        </span>
                      )) : (
                        <span style={{ ...styles.riskChip, borderColor: "#2fd67b", color: "#2fd67b" }}>
                          No failed providers
                        </span>
                      )}
                      {skippedProviders.map((provider) => (
                        <span key={`${item.snapshotId}-skipped-${provider}`} style={{ ...styles.riskChip, borderColor: "#ffb020", color: "#ffb020" }}>
                          Skipped: {providerLabel(provider)}
                        </span>
                      ))}
                      {keyErrorClasses.map((errorClass) => (
                        <span key={`${item.snapshotId}-${errorClass}`} style={{ ...styles.riskChip, borderColor: "#8a94a6", color: "#8a94a6" }}>
                          {titleCase(errorClass)}
                        </span>
                      ))}
                    </div>
                    <ListBlock
                      title="Provider notes"
                      items={providerSummaryLines}
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

      {safePageInfo?.nextCursor ? (
        <div style={styles.timelineActionRow}>
          <button
            onClick={() => loadTimeline(query || latestTimelineSnapshot?.query || asset?.query, { cursor: safePageInfo.nextCursor, append: true })}
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
