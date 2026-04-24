import React from "react";
import { Card } from "./researchPrimitives";
import { sanitizeSemanticLabel } from "./researchUtils";

function outcomeColor(outcomeKey) {
  if (outcomeKey === "capital_worthy") return "#2fd67b";
  if (outcomeKey === "conditional_allocation") return "#ffb020";
  if (outcomeKey === "tradable_only") return "#ff8a4c";
  return "#ff6b6b";
}

export default function DecisionHeroCard({ asset, model, styles, sections = [], activeSection = null, onSelectSection = null }) {
  const outcomeColorValue = outcomeColor(model?.allocationOutcome?.key);
  const assetBadges = model?.assetBadges || [];
  const showWhyNotNow = Boolean(model?.whyNotNow)
    && model?.allocationOutcome?.key === "conditional_allocation"
    && model?.whyNotNow !== model?.summaryMemo
    && model?.whyNotNow !== model?.primaryWeakness;
  const showPrimaryStrength = Boolean(model?.primaryStrength) && model?.primaryStrength !== model?.summaryMemo;

  return (
    <div style={styles.decisionHeroWrap}>
      <Card
        title="Executive Decision Memo"
        subtitle={asset?.name ? `${asset.name}${asset?.symbol ? ` | ${asset.symbol}` : ""}` : "Allocator-first thesis compression"}
        styles={styles}
      >
        <div style={styles.decisionHeroTopRow}>
          <div style={styles.decisionHeroPrimaryColumn}>
            <div style={styles.decisionHeroEyebrow}>Allocation Outcome</div>
            <div style={{ ...styles.decisionHeroOutcome, color: outcomeColorValue }}>
              {model?.allocationOutcome?.label || "Decision unavailable"}
            </div>
            <div style={styles.decisionHeroInvestabilityBadge}>
              <span style={styles.decisionHeroInvestabilityLabel}>Investability</span>
              <span style={styles.decisionHeroInvestabilityValue}>
                {sanitizeSemanticLabel(model?.investabilityStatus, "Unavailable")}
              </span>
            </div>
          </div>
          <div style={styles.decisionHeroMetaColumn}>
            {assetBadges.length ? (
              <div style={styles.decisionHeroBadgeRow}>
                {assetBadges.map((badge) => (
                  <span key={badge} style={styles.institutionalBadge}>{badge}</span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {model?.contradictionNote ? (
          <div style={styles.contradictionBanner}>
            <div style={styles.contradictionTitle}>Override Explanation</div>
            <div style={styles.contradictionText}>{model.contradictionNote}</div>
          </div>
        ) : null}

        {model?.evidenceConstraintNote ? (
          <div style={styles.evidenceConstraintBanner}>
            <div style={styles.evidenceConstraintTitle}>Evidence Constraint</div>
            <div style={styles.evidenceConstraintText}>{model.evidenceConstraintNote}</div>
          </div>
        ) : null}

        <div style={styles.decisionDominanceGrid}>
          <div style={styles.decisionDominanceBlock}>
            <div style={styles.decisionDominanceLabel}>Primary Weakness</div>
            <div style={styles.decisionDominanceValue}>{model?.primaryWeakness || "Unavailable"}</div>
          </div>
          <div style={styles.decisionDominanceBlock}>
            <div style={styles.decisionDominanceLabel}>Failure Mode</div>
            <div style={styles.decisionDominanceValue}>{model?.failureMode?.primary || "Unavailable"}</div>
          </div>
          {showWhyNotNow ? (
            <div style={styles.decisionDominanceBlock}>
              <div style={styles.decisionDominanceLabel}>Why Not Now</div>
              <div style={styles.decisionDominanceValue}>{model?.whyNotNow}</div>
            </div>
          ) : null}
          {showPrimaryStrength ? (
            <div style={styles.decisionDominanceBlock}>
              <div style={styles.decisionDominanceLabel}>Primary Strength</div>
              <div style={styles.decisionDominanceMutedValue}>
                {model?.primaryStrength}
              </div>
            </div>
          ) : null}
        </div>

        <div style={styles.decisionHeroSecondaryBand}>
          <div style={styles.decisionHeroSecondaryMetric}>
            <div style={styles.decisionHeroSecondaryLabel}>Structural Quality Score</div>
            <div style={styles.decisionHeroSecondaryValue}>{model?.overallScore ?? "?"}/100</div>
          </div>
          <div style={styles.decisionHeroSecondaryMetric}>
            <div style={styles.decisionHeroSecondaryLabel}>Evidence Support</div>
            <div style={styles.decisionHeroSecondaryValue}>{model?.confidenceScore ?? "?"}/100</div>
          </div>
          <div style={styles.decisionHeroSecondaryNarrative}>
            {model?.summaryMemo || "No structured thesis summary is available from the current analysis."}
          </div>
        </div>

        {sections.length ? (
          <div style={styles.decisionNavigatorWrap}>
            <div style={styles.decisionNavigatorTitle}>Navigate reasoning</div>
            <div style={styles.decisionNavigatorRow}>
              {sections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => onSelectSection?.(section.key)}
                  style={{
                    ...styles.decisionNavigatorButton,
                    ...(activeSection === section.key ? styles.decisionNavigatorButtonActive : {}),
                  }}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div style={styles.decisionDriverPanel}>
          <div style={styles.decisionDriverTitle}>Top Decision Drivers</div>
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
