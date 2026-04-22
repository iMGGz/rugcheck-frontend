import React from "react";
import { Card, SectionRow } from "./researchPrimitives";
import { titleCase } from "./researchUtils";

function outcomeColor(outcomeKey) {
  if (outcomeKey === "capital_worthy") return "#2fd67b";
  if (outcomeKey === "conditional_allocation") return "#ffb020";
  if (outcomeKey === "tradable_only") return "#ff8a4c";
  return "#ff6b6b";
}

export default function DecisionHeroCard({ asset, model, styles }) {
  const outcomeColorValue = outcomeColor(model?.allocationOutcome?.key);
  const assetBadges = [
    model?.assetClass ? titleCase(model.assetClass) : null,
    model?.assetSubtype && model.assetSubtype !== "unknown" ? titleCase(model.assetSubtype) : null,
    model?.primarySector && model.primarySector !== "Unknown" ? model.primarySector : null,
  ].filter(Boolean);

  return (
    <div style={styles.decisionHeroWrap}>
      <Card
        title="Executive Decision Memo"
        subtitle={asset?.name ? `${asset.name}${asset?.symbol ? ` | ${asset.symbol}` : ""}` : "Allocator-first thesis compression"}
        styles={styles}
      >
        <div style={styles.decisionHeroTopRow}>
          <div>
            <div style={styles.decisionHeroEyebrow}>Allocation Outcome</div>
            <div style={{ ...styles.decisionHeroOutcome, color: outcomeColorValue }}>
              {model?.allocationOutcome?.label || "Decision unavailable"}
            </div>
            <div style={styles.decisionHeroSubtext}>
              {model?.investabilityStatus ? `Investability: ${titleCase(model.investabilityStatus)}` : "Investability status unavailable"}
            </div>
          </div>

          <div style={styles.decisionHeroScoreRow}>
            <div style={styles.decisionHeroScoreBlock}>
              <div style={styles.decisionHeroMetricLabel}>Overall Score</div>
              <div style={styles.decisionHeroMetricValue}>{model?.overallScore ?? "?"}/100</div>
            </div>
            <div style={styles.decisionHeroScoreBlock}>
              <div style={styles.decisionHeroMetricLabel}>Confidence in Thesis Support</div>
              <div style={styles.decisionHeroMetricValueSmall}>{model?.confidenceScore ?? "?"}/100</div>
            </div>
          </div>
        </div>

        {assetBadges.length ? (
          <div style={styles.decisionHeroBadgeRow}>
            {assetBadges.map((badge) => (
              <span key={badge} style={styles.institutionalBadge}>{badge}</span>
            ))}
          </div>
        ) : null}

        {model?.contradictionNote ? (
          <div style={styles.contradictionBanner}>
            <div style={styles.contradictionTitle}>Override Explanation</div>
            <div style={styles.contradictionText}>{model.contradictionNote}</div>
          </div>
        ) : null}

        <div style={styles.decisionHeroGrid}>
          <SectionRow label="Primary Strength" value={model?.primaryStrength || "No strength is strong enough to support conviction."} styles={styles} />
          <SectionRow label="Primary Weakness" value={model?.primaryWeakness || "Unavailable"} styles={styles} />
          <SectionRow label="Failure Mode" value={model?.failureMode?.primary || "Unavailable"} styles={styles} />
          <SectionRow label="Structured Thesis Summary" value={model?.summaryMemo || "No memo summary is available from the current analysis."} styles={styles} />
        </div>

        <div style={styles.decisionDriverPanel}>
          <div style={styles.decisionDriverTitle}>Top 3 Decision Drivers</div>
          <div style={styles.decisionHeroBadgeRow}>
            {(model?.decisionDrivers || []).map((driver) => (
              <span key={driver} style={styles.decisionDriverChip}>{driver}</span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
