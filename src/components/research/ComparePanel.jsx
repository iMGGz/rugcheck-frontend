import React from "react";
import { Box, Card, ListBlock } from "./researchPrimitives";
import {
  compareAreaLabel,
  formatDateTime,
  formatSignedDelta,
  formatTransition,
  impactColor,
  titleCase,
} from "./researchUtils";

export default function ComparePanel({
  timelineData,
  compareSelectionOptions,
  latestTimelineSnapshot,
  compareAgainstId,
  setCompareAgainstId,
  compareLoading,
  compareError,
  compareData,
  styles,
}) {
  return (
    <Card title="Snapshot compare" subtitle="Compare the latest stored snapshot with an older one" styles={styles}>
      {!timelineData.length ? (
        <p style={styles.timelineEmptyText}>Compare becomes available once the backend has stored snapshots for this token.</p>
      ) : null}

      {timelineData.length > 0 && !compareSelectionOptions.length ? (
        <p style={styles.timelineEmptyText}>Only one stored snapshot exists so far. Run the analysis again later to compare changes over time.</p>
      ) : null}

      {compareSelectionOptions.length ? (
        <>
          <div style={styles.compareToolbar}>
            <div style={styles.compareMetaBlock}>
              <div style={styles.boxLabel}>Base snapshot</div>
              <div style={styles.boxValue}>{formatDateTime(latestTimelineSnapshot?.generatedAt)}</div>
            </div>
            <div style={styles.compareMetaBlock}>
              <div style={styles.boxLabel}>Compare against</div>
              <select
                value={compareAgainstId}
                onChange={(event) => setCompareAgainstId(event.target.value)}
                style={styles.select}
              >
                {compareSelectionOptions.map((item) => (
                  <option key={item.snapshotId} value={item.snapshotId}>
                    {formatDateTime(item.generatedAt)} | impact {item.compactImpact?.overall || "none"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {compareLoading ? <p style={styles.timelineEmptyText}>Loading stored comparison...</p> : null}

          {compareError ? (
            <div style={styles.inlineErrorBox}>
              <div style={styles.inlineErrorTitle}>Compare unavailable</div>
              <div style={styles.inlineErrorText}>{compareError}</div>
            </div>
          ) : null}

          {compareData ? (
            <>
              <div style={styles.compareSummaryHeader}>
                <span
                  style={{
                    ...styles.riskChip,
                    borderColor: impactColor(compareData.comparison.impact.overall),
                    color: impactColor(compareData.comparison.impact.overall),
                  }}
                >
                  Overall impact: {titleCase(compareData.comparison.impact.overall)}
                </span>
                <span style={{ ...styles.riskChip, borderColor: "#7dd3fc", color: "#7dd3fc" }}>
                  Base: {formatDateTime(compareData.base.generatedAt)}
                </span>
                <span style={{ ...styles.riskChip, borderColor: "#8a94a6", color: "#8a94a6" }}>
                  Against: {formatDateTime(compareData.against.generatedAt)}
                </span>
              </div>

              <div style={styles.inlineGrid}>
                <Box label="Overall score delta" value={formatSignedDelta(compareData.comparison.scoreChanges.overallScoreDelta)} styles={styles} />
                <Box label="Confidence delta" value={formatSignedDelta(compareData.comparison.scoreChanges.confidenceScoreDelta)} styles={styles} />
                <Box label="On-chain delta" value={formatSignedDelta(compareData.comparison.scoreChanges.onChainScoreDelta)} styles={styles} />
                <Box label="Credibility score delta" value={formatSignedDelta(compareData.comparison.projectCredibilityChanges.scoreDelta)} styles={styles} />
                <Box label="Governance risk" value={formatTransition(compareData.comparison.fundamentalsChanges.governanceRiskFrom, compareData.comparison.fundamentalsChanges.governanceRiskTo)} styles={styles} />
                <Box label="Liquidity risk" value={formatTransition(compareData.comparison.fundamentalsChanges.liquidityRiskFrom, compareData.comparison.fundamentalsChanges.liquidityRiskTo)} styles={styles} />
                <Box label="Team transparency" value={formatTransition(compareData.comparison.projectCredibilityChanges.teamTransparencyFrom, compareData.comparison.projectCredibilityChanges.teamTransparencyTo)} styles={styles} />
                <Box label="Backer quality" value={formatTransition(compareData.comparison.projectCredibilityChanges.backerQualityFrom, compareData.comparison.projectCredibilityChanges.backerQualityTo)} styles={styles} />
                <Box label="Company credibility" value={formatTransition(compareData.comparison.projectCredibilityChanges.companyCredibilityFrom, compareData.comparison.projectCredibilityChanges.companyCredibilityTo)} styles={styles} />
              </div>

              <div style={styles.timelineChipRow}>
                {compareData.comparison.impact.classifications.map((entry) => (
                  <span
                    key={`${entry.area}-${entry.level}`}
                    style={{
                      ...styles.riskChip,
                      borderColor: impactColor(entry.level),
                      color: impactColor(entry.level),
                    }}
                  >
                    {compareAreaLabel(entry.area)}: {titleCase(entry.level)}
                  </span>
                ))}
              </div>

              <ListBlock
                title="Compare summary"
                items={compareData.comparison.changeSummary || []}
                emptyText="No meaningful stored delta summary was generated for this pair."
                color="#9bd7ff"
                styles={styles}
              />

              <ListBlock
                title="Credibility changes"
                items={[
                  ...(compareData.comparison.projectCredibilityChanges.founderEvidenceAdded.length
                    ? [`Founder evidence added: ${compareData.comparison.projectCredibilityChanges.founderEvidenceAdded.join(", ")}`]
                    : []),
                  ...(compareData.comparison.projectCredibilityChanges.founderEvidenceRemoved.length
                    ? [`Founder evidence removed: ${compareData.comparison.projectCredibilityChanges.founderEvidenceRemoved.join(", ")}`]
                    : []),
                  ...(compareData.comparison.projectCredibilityChanges.credibilityConcernsAdded.length
                    ? [`Credibility concerns added: ${compareData.comparison.projectCredibilityChanges.credibilityConcernsAdded.join("; ")}`]
                    : []),
                  ...(compareData.comparison.projectCredibilityChanges.credibilityConcernsRemoved.length
                    ? [`Credibility concerns removed: ${compareData.comparison.projectCredibilityChanges.credibilityConcernsRemoved.join("; ")}`]
                    : []),
                ]}
                emptyText="No founder, backer, or credibility concern deltas were stored for this pair."
                color="#a6f3c2"
                styles={styles}
              />

              <ListBlock
                title="Warnings and alerts changed"
                items={[
                  ...(compareData.comparison.warningsAndAlertsChanges.addedWarnings.length
                    ? [`Warnings added: ${compareData.comparison.warningsAndAlertsChanges.addedWarnings.join("; ")}`]
                    : []),
                  ...(compareData.comparison.warningsAndAlertsChanges.removedWarnings.length
                    ? [`Warnings removed: ${compareData.comparison.warningsAndAlertsChanges.removedWarnings.join("; ")}`]
                    : []),
                  ...(compareData.comparison.warningsAndAlertsChanges.addedAlerts.length
                    ? [`Alerts added: ${compareData.comparison.warningsAndAlertsChanges.addedAlerts.join("; ")}`]
                    : []),
                  ...(compareData.comparison.warningsAndAlertsChanges.removedAlerts.length
                    ? [`Alerts removed: ${compareData.comparison.warningsAndAlertsChanges.removedAlerts.join("; ")}`]
                    : []),
                ]}
                emptyText="No warnings or alerts changed between these stored snapshots."
                color="#ffb6b6"
                styles={styles}
              />
            </>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
