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

const CONTRIBUTOR_STRENGTH = {
  low: 1,
  medium: 2,
  high: 3,
};

function normalizeContributorAreas(scoreContributors) {
  const byArea = new Map();

  for (const item of scoreContributors?.neutralOrMissing || []) {
    if (!item?.area) continue;
    byArea.set(item.area, {
      area: item.area,
      kind: "neutral",
      strength: null,
      strengthRank: 0,
      summary: item.summary || "No stored contributor summary.",
    });
  }

  for (const item of scoreContributors?.positives || []) {
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

  for (const item of scoreContributors?.negatives || []) {
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

  const topDriversAdded = (baseContributors?.topDrivers || []).filter(
    (driver) => !(againstContributors?.topDrivers || []).includes(driver),
  );
  const topDriversRemoved = (againstContributors?.topDrivers || []).filter(
    (driver) => !(baseContributors?.topDrivers || []).includes(driver),
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
  const contributorCompare = compareData
    ? buildContributorCompare(
        compareData.base?.derivedAnalysis?.scoreContributors,
        compareData.against?.derivedAnalysis?.scoreContributors,
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
