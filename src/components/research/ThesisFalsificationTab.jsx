import React from "react";
import FailureModeCard from "./FailureModeCard";
import TokenDemandCard from "./TokenDemandCard";
import ConvictionDriversMatrix from "./ConvictionDriversMatrix";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import { normalizeRenderableList, sanitizeSemanticLabel, titleCase } from "./researchUtils";

function dedupe(items) {
  const seen = new Set();
  return normalizeRenderableList(items).filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function firstText(items, fallback) {
  return normalizeRenderableList(items)[0] || fallback;
}

function lensForAsset(model) {
  const raw = [
    model?.assetClass,
    model?.assetClassLabel,
    model?.assetFramingLabel,
    model?.assetSubtype,
  ].filter(Boolean).join(" ").toLowerCase();

  if (raw.includes("stablecoin") || raw.includes("trust") || raw.includes("settlement")) {
    return "Stablecoin falsification lens: market cap, liquidity, or category does not prove reserve backing, redemption reliability, issuer risk, or legal clarity.";
  }

  if (raw.includes("wrapped") || raw.includes("lst") || raw.includes("staking derivative")) {
    return "Wrapped/dependency falsification lens: underlying asset strength does not prove wrapper custody, backing, redeemability, or smart-contract dependency quality.";
  }

  if (raw.includes("defi") || raw.includes("yield") || raw.includes("protocol")) {
    return "DeFi falsification lens: protocol TVL, usage, or fees do not prove durable tokenholder value capture unless the live evidence directly supports accrual.";
  }

  if (raw.includes("infrastructure") || raw.includes("oracle") || raw.includes("compute")) {
    return "Infrastructure falsification lens: network importance does not automatically prove tokenholder accrual, payer mapping, or durable token demand.";
  }

  if (raw.includes("meme") || raw.includes("narrative")) {
    return "Narrative/liquidity falsification lens: liquidity and attention do not prove durable fundamentals or allocation-grade downside protection.";
  }

  return "General falsification lens: apparent quality, liquidity, or recognition must not be treated as thesis support without direct live evidence.";
}

function buildThesisModel(model) {
  const allocationThesis = firstText([
    model?.summaryMemo,
    model?.tokenDemandTruth,
    model?.primaryStrength,
  ], "Allocation thesis is not explicitly available in the live response.");

  const whatMustBeTrue = dedupe([
    ...(model?.whatMustBeTrue || []),
    ...(model?.requiredConditions || []),
    ...(model?.whatWouldChangeDecision?.items || []),
  ]).slice(0, 6);

  const whatCouldBreak = dedupe([
    ...(model?.whatCouldBreak || []),
    model?.failureMode?.primary,
    model?.failureMode?.trigger,
    ...(model?.auditAlerts || []),
    ...(model?.missingCritical || []),
    ...(model?.topNegativeDrivers || []),
  ]).slice(0, 6);

  const supportingContext = dedupe([
    ...(model?.topPositiveDrivers || []),
    ...(model?.decisionDrivers || []),
    model?.primaryStrength,
    model?.evidenceStrength ? `Live evidence strength signal: ${titleCase(model.evidenceStrength)}.` : null,
  ]).slice(0, 6);

  const missingContext = dedupe([
    ...(model?.missingCritical || []),
    ...(model?.requiredConditions || []),
    ...(model?.blockers || []),
    ...(model?.topNeutralDrivers || []),
  ]).slice(0, 6);

  const manualReviewTriggers = dedupe([
    model?.manualReviewStatus?.label,
    model?.manualReviewStatus?.detail,
    ...(model?.auditAlerts || []),
    ...(model?.blockers || []),
  ]).slice(0, 5);

  return {
    allocationThesis,
    whatMustBeTrue,
    whatCouldBreak,
    supportingContext,
    missingContext,
    manualReviewTriggers,
    falsePositiveRisk: lensForAsset(model),
    weakestLinkLabel: model?.weakestLink?.label || "Weakest link not explicitly available in live response.",
    weakestLinkExplanation: model?.weakestLink?.explanation || "The live response did not expose a dedicated weakest-link field.",
    whatWouldChange: dedupe(
      model?.whatWouldChangeDecision?.items?.length
        ? model.whatWouldChangeDecision.items
        : model?.requiredConditions || [],
    ).slice(0, 4),
  };
}

function BoundaryChip({ children, styles }) {
  return <span style={styles.thesisBoundaryChip}>{children}</span>;
}

export default function ThesisFalsificationTab({ model, styles, onSelectSection }) {
  const thesis = buildThesisModel(model || {});

  return (
    <div>
      <Card
        title="Thesis Falsification Report"
        subtitle="A decision-oriented view of what must be true, what could break, and what the engine refuses to infer."
        styles={styles}
      >
        <div style={styles.thesisBoundaryStrip}>
          <BoundaryChip styles={styles}>This tab uses the current live analysis response</BoundaryChip>
          <BoundaryChip styles={styles}>Report-only source overlays are not connected to live scoring</BoundaryChip>
          <BoundaryChip styles={styles}>Falsification lens items explain what the engine refuses to infer</BoundaryChip>
        </div>
        <SectionRow label="Allocation Thesis" value={thesis.allocationThesis} styles={styles} />
        <SectionRow label="Asset framing" value={model?.assetFramingLabel || model?.assetClassLabel || "Digital asset allocation thesis"} styles={styles} />
      </Card>

      <div style={styles.advancedGrid}>
        <Card title="What Must Be True" subtitle="Conditions required for thesis confidence." styles={styles}>
          <ListBlock
            title="Live conditions and requirements"
            items={thesis.whatMustBeTrue}
            emptyText="No live must-be-true conditions were surfaced."
            color="#7dd3fc"
            styles={styles}
          />
        </Card>
        <Card title="What Could Break The Thesis" subtitle="Live response signals/proxies that would weaken or falsify the allocation case." styles={styles}>
          <ListBlock
            title="Break conditions"
            items={thesis.whatCouldBreak}
            emptyText="No explicit thesis-break signals were surfaced."
            color="#ffb020"
            styles={styles}
          />
        </Card>
      </div>

      <div style={styles.advancedGrid}>
        <Card title="Live Context Supporting The Thesis" subtitle="Live provider/engine context only. This is not institutional question-level support." styles={styles}>
          <ListBlock
            title="Supportive context"
            items={thesis.supportingContext}
            emptyText="No live supportive context was strong enough to highlight."
            color="#a6f3c2"
            styles={styles}
          />
          <SectionRow
            label="Evidence strength signal"
            value={model?.evidenceStrength ? sanitizeSemanticLabel(model.evidenceStrength) : "Not explicitly available in live response."}
            styles={styles}
          />
        </Card>
        <Card title="Evidence Missing / Provider Gaps" subtitle="Qualitative missing-context view. No institutional evidence counts are attached here." styles={styles}>
          <SectionRow
            label="Doctrine"
            value="Missing evidence is a verification gap, not automatic proof of failure. Critical gaps may still cap confidence or trigger manual review."
            styles={styles}
          />
          <ListBlock
            title="Missing or unresolved context"
            items={thesis.missingContext}
            emptyText="No live missing-evidence list was surfaced."
            color="#ffb6b6"
            styles={styles}
          />
        </Card>
      </div>

      <div style={styles.advancedGrid}>
        <Card title="Weakest Link" subtitle="The first place the thesis should be challenged." styles={styles}>
          <SectionRow label="Weakest link" value={thesis.weakestLinkLabel} styles={styles} />
          <SectionRow label="Why it matters" value={thesis.weakestLinkExplanation} styles={styles} />
        </Card>
        <Card title="False-Positive Risk" subtitle="ThesisCore falsification lens. Methodology-informed, not a new live evidence claim." styles={styles}>
          <SectionRow label="What the engine refuses to infer" value={thesis.falsePositiveRisk} styles={styles} />
          <ListBlock
            title="Manual-review triggers"
            items={thesis.manualReviewTriggers}
            emptyText="No manual-review trigger was surfaced beyond normal analyst verification."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      </div>

      <Card title="What Would Change The Decision" subtitle="Concrete requirements to move the thesis, if the live response surfaced them." styles={styles}>
        <ListBlock
          title="Decision-change requirements"
          items={thesis.whatWouldChange}
          emptyText="Additional verified evidence required."
          color="#9bd7ff"
          styles={styles}
        />
        <button
          type="button"
          onClick={() => onSelectSection?.("manual_review")}
          style={styles.decisionHeaderPrimaryButton}
        >
          Inspect requirements in Manual Review -&gt;
        </button>
      </Card>

      <div style={styles.thesisSupportingPanelLabel}>Supporting live-analysis panels</div>
      <div style={styles.advancedGrid}>
        <TokenDemandCard model={model} styles={styles} />
        <FailureModeCard model={model} styles={styles} />
        <ConvictionDriversMatrix model={model} styles={styles} />
      </div>
    </div>
  );
}
