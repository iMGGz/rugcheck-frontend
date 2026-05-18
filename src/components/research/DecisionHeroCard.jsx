import React from "react";
import { Card } from "./researchPrimitives";
import { formatScoreValue, sanitizeSemanticLabel } from "./researchUtils";

function outcomeColor(outcomeKey) {
  if (outcomeKey === "capital_worthy") return "#2fd67b";
  if (outcomeKey === "conditional_allocation") return "#ffb020";
  if (outcomeKey === "tradable_only") return "#ff8a4c";
  return "#ff6b6b";
}

function statusToneColor(label) {
  const text = String(label || "").toLowerCase();
  if (text.includes("scoring")) return "#7dd3fc";
  if (text.includes("review") || text.includes("proxy") || text.includes("fallback")) return "#ffb020";
  if (text.includes("unavailable")) return "#8a94a6";
  return "#d5dcec";
}

function StatusBadge({ label, styles, color = null }) {
  const badgeColor = color || statusToneColor(label);
  return (
    <span
      style={{
        ...styles.decisionHeaderStatusBadge,
        color: badgeColor,
        borderColor: `${badgeColor}55`,
        background: `${badgeColor}16`,
      }}
    >
      {label}
    </span>
  );
}

function DecisionInsightCard({ title, value, detail, badge, accent, cta, onClick, styles }) {
  return (
    <div style={{ ...styles.decisionInsightCard, borderColor: `${accent}33` }}>
      <div style={styles.decisionInsightHeader}>
        <div style={styles.decisionInsightTitle}>{title}</div>
        {badge ? <StatusBadge label={badge} styles={styles} color={accent} /> : null}
      </div>
      <div style={styles.decisionInsightValue}>{value}</div>
      {detail ? <div style={styles.decisionInsightDetail}>{detail}</div> : null}
      {cta ? (
        <button type="button" onClick={onClick} style={styles.decisionHeaderTextButton}>
          {cta} -&gt;
        </button>
      ) : null}
    </div>
  );
}

function ScoreTile({ label, value, detail, styles }) {
  return (
    <div style={styles.decisionScoreTile}>
      <div style={styles.decisionScoreLabel}>{label}</div>
      <div style={styles.decisionScoreValue}>{value}</div>
      {detail ? <div style={styles.decisionScoreDetail}>{detail}</div> : null}
    </div>
  );
}

function LayerLegendItem({ title, detail, badge, tone, styles }) {
  return (
    <div style={styles.decisionLayerLegendItem}>
      <div style={styles.decisionLayerLegendTopline}>
        <span style={{ ...styles.decisionLayerDot, background: tone }} />
        <span style={styles.decisionLayerLegendTitle}>{title}</span>
      </div>
      <div style={styles.decisionLayerLegendDetail}>{detail}</div>
      <StatusBadge label={badge} styles={styles} color={tone} />
    </div>
  );
}

export default function DecisionHeroCard({
  asset,
  model,
  displayIdentity = null,
  styles,
  onSelectSection = null,
  lastAnalyzed = null,
}) {
  const outcomeColorValue = outcomeColor(model?.allocationOutcome?.key);
  const assetBadges = displayIdentity
    ? [displayIdentity.primaryChip, displayIdentity.secondaryChip].filter(Boolean)
    : model?.assetBadges || [];
  const symbol = asset?.symbol || model?.assetName || "Asset";
  const assetInitial = String(symbol).trim().slice(0, 4).toUpperCase() || "TC";
  const primaryBlocker = model?.primaryBlocker || {};
  const weakestLink = model?.weakestLink || {};
  const whatWouldChange = model?.whatWouldChangeDecision?.items || ["Additional verified evidence required."];
  const manualReviewStatus = model?.manualReviewStatus || {};
  const finalDecisionSubcopy = model?.summaryMemo || "Live decision layer returned no structured summary.";
  const assetClassLabel = displayIdentity?.displayAssetClass || model?.assetClassLabel || sanitizeSemanticLabel(model?.assetClass, "Asset class unavailable");
  const framingLabel = displayIdentity?.displayFraming || model?.assetFramingLabel || "Digital Asset Allocation Thesis";
  const freshnessLabel = lastAnalyzed ? `Last analyzed ${lastAnalyzed}` : "Freshness unavailable";

  return (
    <div style={styles.decisionHeroWrap}>
      <Card
        title="Decision Command Header"
        subtitle="Live scoring output with report-only evidence boundaries preserved."
        styles={styles}
      >
        <div style={styles.decisionCommandGrid}>
          <div style={styles.decisionAssetPanel}>
            <div style={styles.decisionAssetIdentityRow}>
              <div style={styles.decisionAssetIcon}>{assetInitial}</div>
              <div>
                <div style={styles.decisionAssetSymbol}>{asset?.symbol || "Asset"}</div>
                <div style={styles.decisionAssetName}>{asset?.name || model?.assetName || "Resolved asset"}</div>
              </div>
            </div>
            <div style={styles.decisionAssetFraming}>{framingLabel}</div>
            <div style={styles.decisionAssetMeta}>{assetClassLabel}</div>
            {assetBadges.length ? (
              <div style={styles.decisionHeroBadgeRow}>
                {assetBadges.map((badge) => (
                  <span key={badge} style={styles.institutionalBadge}>{badge}</span>
                ))}
              </div>
            ) : null}
            <div style={styles.decisionAssetFooter}>
              <StatusBadge label="Research support only" styles={styles} color="#7dd3fc" />
              <span style={styles.decisionAssetFreshness}>{freshnessLabel}</span>
            </div>
          </div>

          <div style={styles.decisionFinalPanel}>
            <div style={styles.decisionHeroEyebrow}>Final Decision</div>
            <div style={{ ...styles.decisionHeroOutcome, color: outcomeColorValue }}>
              {model?.allocationOutcome?.label || "Decision unavailable"}
            </div>
            <div style={styles.decisionFinalSubcopy}>{finalDecisionSubcopy}</div>
            <div style={styles.decisionFinalActions}>
              <StatusBadge
                label={sanitizeSemanticLabel(model?.investabilityStatus, "Scoring-active")}
                styles={styles}
                color={outcomeColorValue}
              />
              <button
                type="button"
                onClick={() => onSelectSection?.("overview")}
                style={styles.decisionHeaderPrimaryButton}
              >
                View final verdict logic -&gt;
              </button>
            </div>
          </div>
        </div>

        {(model?.contradictionNote || model?.evidenceConstraintNote) ? (
          <div style={styles.decisionNoticeGrid}>
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
          </div>
        ) : null}

        <div style={styles.decisionInsightGrid}>
          <DecisionInsightCard
            title="Primary Blocker"
            value={primaryBlocker.label || "Primary blocker not explicitly available in live response."}
            detail={primaryBlocker.explanation}
            badge={primaryBlocker.badge || "Derived proxy"}
            accent="#ff6b6b"
            cta="Inspect blocker"
            onClick={() => onSelectSection?.("manual_review")}
            styles={styles}
          />
          <DecisionInsightCard
            title="Weakest Link"
            value={weakestLink.label || "Weakest link not explicitly available in live response."}
            detail={weakestLink.explanation}
            badge={weakestLink.badge || "Weakest-link proxy"}
            accent="#ffb020"
            cta="Trace evidence"
            onClick={() => onSelectSection?.("evidence_map")}
            styles={styles}
          />
          <div style={{ ...styles.decisionInsightCard, ...styles.decisionChangeCard }}>
            <div style={styles.decisionInsightHeader}>
              <div style={styles.decisionInsightTitle}>What Would Change The Decision</div>
              <StatusBadge label={model?.whatWouldChangeDecision?.badge || "Live requirements"} styles={styles} color="#7dd3fc" />
            </div>
            <div style={styles.decisionRequirementList}>
              {whatWouldChange.slice(0, 4).map((item, index) => (
                <div key={`${item}-${index}`} style={styles.decisionRequirementItem}>
                  <span style={styles.decisionRequirementIndex}>{index + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onSelectSection?.("thesis_falsification")}
              style={styles.decisionHeaderTextButton}
            >
              View requirements -&gt;
            </button>
          </div>
        </div>

        <div style={styles.decisionScoreStrip}>
          <ScoreTile label="Structural Quality" value={formatScoreValue(model?.overallScore)} detail="Live score bundle" styles={styles} />
          <ScoreTile label="Evidence Support" value={formatScoreValue(model?.confidenceScore)} detail="Confidence proxy, not completeness" styles={styles} />
          <ScoreTile label="Confidence" value={model?.confidenceLabel || "Unavailable"} detail={model?.evidenceStrength ? `Evidence strength: ${sanitizeSemanticLabel(model.evidenceStrength, "Unavailable")}` : null} styles={styles} />
          <ScoreTile label="Overall Score" value={formatScoreValue(model?.overallScore)} detail="Secondary signal" styles={styles} />
          <ScoreTile label="Manual Review" value={manualReviewStatus.label || "No explicit review flag"} detail={manualReviewStatus.detail} styles={styles} />
        </div>

        <div style={styles.decisionLayerLegend}>
          <div style={styles.decisionLayerLegendHeader}>
            <div>
              <div style={styles.decisionLayerLegendEyebrow}>Evidence Layer Legend</div>
              <div style={styles.decisionLayerLegendCopy}>
                Layer labels explain boundaries only. Report-only and candidate layers are not integrated into live scoring here.
              </div>
            </div>
          </div>
          <div style={styles.decisionLayerLegendGrid}>
            <LayerLegendItem
              title="Live Scoring Layer"
              detail="Current engine fields used by the final decision."
              badge="Affects final decision"
              tone="#2fd67b"
              styles={styles}
            />
            <LayerLegendItem
              title="Report-Only Evidence Layer"
              detail="Institutional artifacts and overlays remain context-only until separately integrated."
              badge="Not scoring input"
              tone="#ffb020"
              styles={styles}
            />
            <LayerLegendItem
              title="Source Candidate Layer"
              detail="Candidate sources require human review before evidence promotion."
              badge="Requires review"
              tone="#7dd3fc"
              styles={styles}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
