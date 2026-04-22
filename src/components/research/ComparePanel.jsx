import React from "react";
import { Box, Card, ListBlock } from "./researchPrimitives";
import {
  assertCompareShape,
  compareAreaLabel,
  formatDateTime,
  formatSignedDelta,
  formatTransition,
  impactColor,
  safeArray,
  safeObject,
  titleCase,
} from "./researchUtils";

const CONTRIBUTOR_STRENGTH = {
  low: 1,
  medium: 2,
  high: 3,
};

function shortSnapshotId(snapshotId) {
  if (!snapshotId) return "unknown";
  return String(snapshotId).slice(0, 8);
}

function formatSnapshotLabel(snapshot) {
  if (!snapshot) return "Unavailable";
  return `${formatDateTime(snapshot.generatedAt)} · #${shortSnapshotId(snapshot.snapshotId)}`;
}

function normalizeContributorAreas(scoreContributors) {
  const byArea = new Map();
  const normalized = safeObject(scoreContributors);

  for (const item of safeArray(normalized.neutralOrMissing)) {
    if (!item?.area) continue;
    byArea.set(item.area, {
      area: item.area,
      kind: "neutral",
      strength: null,
      strengthRank: 0,
      summary: item.summary || "No stored contributor summary.",
    });
  }

  for (const item of safeArray(normalized.positives)) {
    if (!item?.area) continue;
    const rank = CONTRIBUTOR_STRENGTH[item.strength] || 0;
    const current = byArea.get(item.area);
    if (!current || current.kind !== "positive" || rank >= current.strengthRank) {
      byArea.set(item.area, {
        area: item.area,
        kind: "positive",
        strength: item.strength || null,
        strengthRank: rank,
        summary: item.summary || "Positive contributor recorded.",
      });
    }
  }

  for (const item of safeArray(normalized.negatives)) {
    if (!item?.area) continue;
    const rank = CONTRIBUTOR_STRENGTH[item.strength] || 0;
    const current = byArea.get(item.area);
    if (!current || current.kind !== "negative" || rank >= current.strengthRank) {
      byArea.set(item.area, {
        area: item.area,
        kind: "negative",
        strength: item.strength || null,
        strengthRank: rank,
        summary: item.summary || "Negative contributor recorded.",
      });
    }
  }

  return byArea;
}

function buildContributorCompare(baseContributors, againstContributors) {
  const baseAreas = normalizeContributorAreas(baseContributors);
  const againstAreas = normalizeContributorAreas(againstContributors);
  const allAreas = [...new Set([...baseAreas.keys(), ...againstAreas.keys()])];

  const moreSupportive = [];
  const moreNegative = [];
  const newlyConfirmed = [];
  const newlyMissing = [];

  for (const area of allAreas) {
    const base = baseAreas.get(area) || {
      area,
      kind: "neutral",
      strength: null,
      strengthRank: 0,
      summary: "No stored contributor summary.",
    };
    const against = againstAreas.get(area) || {
      area,
      kind: "neutral",
      strength: null,
      strengthRank: 0,
      summary: "No stored contributor summary.",
    };
    const label = compareAreaLabel(area);

    if (base.kind === "positive") {
      if (against.kind === "neutral") {
        newlyConfirmed.push(`${label} is newly confirmed as a positive score driver.`);
        continue;
      }
      if (against.kind === "negative") {
        moreSupportive.push(`${label} shifted from a negative driver to a positive one in the base snapshot.`);
        continue;
      }
      if (base.strengthRank > against.strengthRank) {
        moreSupportive.push(`${label} became a stronger positive driver.`);
      } else if (base.strengthRank < against.strengthRank) {
        moreNegative.push(`${label} became a weaker positive driver.`);
      }
      continue;
    }

    if (base.kind === "negative") {
      if (against.kind === "neutral") {
        newlyConfirmed.push(`${label} is newly confirmed as a negative score driver.`);
        continue;
      }
      if (against.kind === "positive") {
        moreNegative.push(`${label} shifted from a positive driver to a negative one in the base snapshot.`);
        continue;
      }
      if (base.strengthRank > against.strengthRank) {
        moreNegative.push(`${label} became a stronger negative driver.`);
      } else if (base.strengthRank < against.strengthRank) {
        moreSupportive.push(`${label} became less of a negative drag.`);
      }
      continue;
    }

    if (against.kind === "positive") {
      newlyMissing.push(`${label} no longer has a confirmed positive contributor.`);
    } else if (against.kind === "negative") {
      newlyMissing.push(`${label} no longer has a confirmed negative contributor.`);
    }
  }

  const baseTopDrivers = safeArray(baseContributors?.topDrivers);
  const againstTopDrivers = safeArray(againstContributors?.topDrivers);
  const topDriversAdded = baseTopDrivers.filter(
    (driver) => !againstTopDrivers.includes(driver),
  );
  const topDriversRemoved = againstTopDrivers.filter(
    (driver) => !baseTopDrivers.includes(driver),
  );

  return {
    moreSupportive,
    moreNegative,
    newlyConfirmed,
    newlyMissing,
    topDriversAdded,
    topDriversRemoved,
  };
}

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
  assertCompareShape(compareData, "compare-panel");

  const comparison = safeObject(compareData?.comparison);
  const comparisonImpact = safeObject(comparison.impact);
  const scoreChanges = safeObject(comparison.scoreChanges);
  const projectCredibilityChanges = safeObject(comparison.projectCredibilityChanges);
  const fundamentalsChanges = safeObject(comparison.fundamentalsChanges);
  const warningsAndAlertsChanges = safeObject(comparison.warningsAndAlertsChanges);
  const impactClassifications = safeArray(comparisonImpact.classifications);
  const compareSummaryLines = safeArray(comparison.changeSummary);
  const founderEvidenceAdded = safeArray(projectCredibilityChanges.founderEvidenceAdded);
  const founderEvidenceRemoved = safeArray(projectCredibilityChanges.founderEvidenceRemoved);
  const credibilityConcernsAdded = safeArray(projectCredibilityChanges.credibilityConcernsAdded);
  const credibilityConcernsRemoved = safeArray(projectCredibilityChanges.credibilityConcernsRemoved);
  const addedWarnings = safeArray(warningsAndAlertsChanges.addedWarnings);
  const removedWarnings = safeArray(warningsAndAlertsChanges.removedWarnings);
  const addedAlerts = safeArray(warningsAndAlertsChanges.addedAlerts);
  const removedAlerts = safeArray(warningsAndAlertsChanges.removedAlerts);
  const contributorCompare = compareData
    ? buildContributorCompare(
        compareData.base?.analysis?.contributors || compareData.base?.derivedAnalysis?.scoreContributors,
        compareData.against?.analysis?.contributors || compareData.against?.derivedAnalysis?.scoreContributors,
      )
    : null;

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
              <div style={styles.boxValue}>{formatSnapshotLabel(latestTimelineSnapshot)}</div>
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
                    {formatSnapshotLabel(item)} | impact {item.compactImpact?.overall || "none"}
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
                    borderColor: impactColor(comparisonImpact.overall),
                    color: impactColor(comparisonImpact.overall),
                  }}
                >
                  Overall impact: {titleCase(comparisonImpact.overall || "none")}
                </span>
                <span style={{ ...styles.riskChip, borderColor: "#7dd3fc", color: "#7dd3fc" }}>
                  Base: {formatSnapshotLabel(compareData.base)}
                </span>
                <span style={{ ...styles.riskChip, borderColor: "#8a94a6", color: "#8a94a6" }}>
                  Against: {formatSnapshotLabel(compareData.against)}
                </span>
              </div>

              <div style={styles.inlineGrid}>
                <Box label="Overall score delta" value={formatSignedDelta(scoreChanges.overallScoreDelta)} styles={styles} />
                <Box label="Confidence delta" value={formatSignedDelta(scoreChanges.confidenceScoreDelta)} styles={styles} />
                <Box label="On-chain delta" value={formatSignedDelta(scoreChanges.onChainScoreDelta)} styles={styles} />
                <Box label="Credibility score delta" value={formatSignedDelta(projectCredibilityChanges.scoreDelta)} styles={styles} />
                <Box label="Governance risk" value={formatTransition(fundamentalsChanges.governanceRiskFrom, fundamentalsChanges.governanceRiskTo)} styles={styles} />
                <Box label="Liquidity risk" value={formatTransition(fundamentalsChanges.liquidityRiskFrom, fundamentalsChanges.liquidityRiskTo)} styles={styles} />
                <Box label="Team transparency" value={formatTransition(projectCredibilityChanges.teamTransparencyFrom, projectCredibilityChanges.teamTransparencyTo)} styles={styles} />
                <Box label="Backer quality" value={formatTransition(projectCredibilityChanges.backerQualityFrom, projectCredibilityChanges.backerQualityTo)} styles={styles} />
                <Box label="Company credibility" value={formatTransition(projectCredibilityChanges.companyCredibilityFrom, projectCredibilityChanges.companyCredibilityTo)} styles={styles} />
              </div>

              <div style={styles.timelineChipRow}>
                {impactClassifications.map((entry, index) => (
                  <span
                    key={`${entry?.area || "unknown"}-${entry?.level || "none"}-${index}`}
                    style={{
                      ...styles.riskChip,
                      borderColor: impactColor(entry?.level),
                      color: impactColor(entry?.level),
                    }}
                  >
                    {compareAreaLabel(entry?.area || "unknown")}: {titleCase(entry?.level || "none")}
                  </span>
                ))}
              </div>

              <ListBlock
                title="Compare summary"
                items={compareSummaryLines}
                emptyText="No meaningful stored delta summary was generated for this pair."
                color="#9bd7ff"
                styles={styles}
              />

              <ListBlock
                title="Credibility changes"
                items={[
                  ...(founderEvidenceAdded.length
                    ? [`Founder evidence added: ${founderEvidenceAdded.join(", ")}`]
                    : []),
                  ...(founderEvidenceRemoved.length
                    ? [`Founder evidence removed: ${founderEvidenceRemoved.join(", ")}`]
                    : []),
                  ...(credibilityConcernsAdded.length
                    ? [`Credibility concerns added: ${credibilityConcernsAdded.join("; ")}`]
                    : []),
                  ...(credibilityConcernsRemoved.length
                    ? [`Credibility concerns removed: ${credibilityConcernsRemoved.join("; ")}`]
                    : []),
                ]}
                emptyText="No founder, backer, or credibility concern deltas were stored for this pair."
                color="#a6f3c2"
                styles={styles}
              />

              <ListBlock
                title="Warnings and alerts changed"
                items={[
                  ...(addedWarnings.length
                    ? [`Warnings added: ${addedWarnings.join("; ")}`]
                    : []),
                  ...(removedWarnings.length
                    ? [`Warnings removed: ${removedWarnings.join("; ")}`]
                    : []),
                  ...(addedAlerts.length
                    ? [`Alerts added: ${addedAlerts.join("; ")}`]
                    : []),
                  ...(removedAlerts.length
                    ? [`Alerts removed: ${removedAlerts.join("; ")}`]
                    : []),
                ]}
                emptyText="No warnings or alerts changed between these stored snapshots."
                color="#ffb6b6"
                styles={styles}
              />

              {contributorCompare ? (
                <>
                  <div style={styles.timelineSubsectionTitle}>Score driver changes</div>

                  {contributorCompare.topDriversAdded.length || contributorCompare.topDriversRemoved.length ? (
                    <div style={styles.timelineChipRow}>
                      {contributorCompare.topDriversAdded.map((driver) => (
                        <span
                          key={`driver-added-${driver}`}
                          style={{ ...styles.riskChip, borderColor: "#2fd67b", color: "#2fd67b" }}
                        >
                          Added driver: {driver}
                        </span>
                      ))}
                      {contributorCompare.topDriversRemoved.map((driver) => (
                        <span
                          key={`driver-removed-${driver}`}
                          style={{ ...styles.riskChip, borderColor: "#8a94a6", color: "#8a94a6" }}
                        >
                          Removed driver: {driver}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <ListBlock
                    title="More supportive in the base snapshot"
                    items={contributorCompare.moreSupportive}
                    emptyText="No score drivers became more supportive between these stored snapshots."
                    color="#a6f3c2"
                    styles={styles}
                  />

                  <ListBlock
                    title="More negative in the base snapshot"
                    items={contributorCompare.moreNegative}
                    emptyText="No score drivers became more negative between these stored snapshots."
                    color="#ffb6b6"
                    styles={styles}
                  />

                  <ListBlock
                    title="Newly confirmed or newly missing contributors"
                    items={[
                      ...contributorCompare.newlyConfirmed,
                      ...contributorCompare.newlyMissing,
                    ]}
                    emptyText="No contributor confirmation or missing-state changes were recorded for this pair."
                    color="#9bd7ff"
                    styles={styles}
                  />
                </>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
