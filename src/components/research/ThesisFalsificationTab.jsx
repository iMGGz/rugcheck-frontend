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

const GENERIC_NON_PROTOCOL_COPY = /vesting|unlock|protocol revenue|fee\/revenue|generic defi|confirm token utility|direct accrual or governance|direct accrual|coverage restraint.*vesting|core tokenomics evidence|tokenholder value capture as primary/i;

function isProtocolLens(model) {
  const lensId = model?.resolvedInstitutionalLens?.lensId || model?.lensAwareExplanations?.lensId;
  return ["DEFI_PROTOCOL_TOKEN", "L2_GOVERNANCE_TOKEN", "EXCHANGE_PLATFORM"].includes(lensId);
}

function filterPrimaryLensCopy(items, model) {
  const normalized = normalizeRenderableList(items);
  if (isProtocolLens(model)) return normalized;
  return normalized.filter((item) => !GENERIC_NON_PROTOCOL_COPY.test(item));
}

function lensAwareQuestionItems(model, field) {
  const questions = Array.isArray(model?.institutionalQuestions) ? model.institutionalQuestions : [];
  return normalizeRenderableList(questions.flatMap((question) => normalizeRenderableList(question?.[field])));
}

function lensAwarePrimaryItems(model, field) {
  const lensAware = model?.lensAwareExplanations || {};
  if (field === "evidenceNeeded") {
    return normalizeRenderableList(lensAware.evidenceNeeded).length
      ? normalizeRenderableList(lensAware.evidenceNeeded)
      : lensAwareQuestionItems(model, "missingEvidence");
  }
  if (field === "whatWouldChange") {
    return normalizeRenderableList(lensAware.whatWouldChange).length
      ? normalizeRenderableList(lensAware.whatWouldChange)
      : lensAwareQuestionItems(model, "whatWouldChange");
  }
  if (field === "requiredConditions") {
    return normalizeRenderableList(lensAware.requiredConditions);
  }
  if (field === "primaryBlocker") {
    return normalizeRenderableList(lensAware.primaryBlocker);
  }
  return [];
}

function lensForAsset(model, displayIdentity = null) {
  if (displayIdentity?.lensId === "STABLECOIN_SETTLEMENT_ASSET") {
    return "Stablecoin falsification lens: market cap, liquidity, or category does not prove reserve backing, redemption reliability, issuer risk, or legal clarity.";
  }
  if (["WRAPPED_ASSET", "LIQUID_STAKING_TOKEN", "RESTAKING_OR_LRT"].includes(displayIdentity?.lensId)) {
    return "Wrapped/dependency falsification lens: underlying asset strength does not prove wrapper custody, backing, redeemability, slashing, or smart-contract dependency quality.";
  }
  if (["DEFI_PROTOCOL_TOKEN", "DERIVATIVES_OR_PERPS_PROTOCOL"].includes(displayIdentity?.lensId)) {
    return "DeFi/protocol falsification lens: protocol TVL, usage, or fees do not prove durable tokenholder value capture unless the live evidence directly supports accrual.";
  }
  if (["ORACLE_OR_INFRASTRUCTURE", "COMPUTE_STORAGE_DEPIN"].includes(displayIdentity?.lensId)) {
    return "Infrastructure falsification lens: network importance does not automatically prove tokenholder accrual, payer mapping, or durable token demand.";
  }
  if (displayIdentity?.lensId === "PAYMENTS_OR_SETTLEMENT_NETWORK") {
    return "Payments-network falsification lens: payment narrative, settlement volume, or partnerships do not prove measurable adoption or tokenholder value capture.";
  }
  if (displayIdentity?.lensId === "MEME_OR_NARRATIVE") {
    return "Narrative/liquidity falsification lens: liquidity and attention do not prove durable fundamentals or allocation-grade downside protection.";
  }
  if (displayIdentity?.lensId === "RWA_OR_HYBRID_METHODOLOGY") {
    return "RWA/Hybrid methodology lens: tokenized activity does not prove enforceable rights, redemption, custody quality, legal claim, or tokenholder value capture without source-backed evidence.";
  }

  const raw = [
    displayIdentity?.displayAssetClass,
    displayIdentity?.displayFraming,
    displayIdentity?.primaryChip,
    displayIdentity?.secondaryChip,
    model?.assetClass,
    model?.assetClassLabel,
    model?.assetFramingLabel,
    model?.assetSubtype,
  ].filter(Boolean).join(" ").toLowerCase();

  if (raw.includes("stablecoin") || raw.includes("trust")) {
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

function buildThesisModel(model, displayIdentity = null) {
  const lensEvidenceNeeded = lensAwarePrimaryItems(model, "evidenceNeeded");
  const lensWhatWouldChange = lensAwarePrimaryItems(model, "whatWouldChange");
  const lensRequiredConditions = lensAwarePrimaryItems(model, "requiredConditions");
  const lensPrimaryBlocker = lensAwarePrimaryItems(model, "primaryBlocker");
  const rawWhatMustBeTrue = filterPrimaryLensCopy([
    ...(model?.whatMustBeTrue || []),
    ...(model?.requiredConditions || []),
    ...(model?.whatWouldChangeDecision?.items || []),
  ], model);
  const rawMissingContext = filterPrimaryLensCopy([
    ...(model?.missingCritical || []),
    ...(model?.requiredConditions || []),
    ...(model?.blockers || []),
    ...(model?.topNeutralDrivers || []),
  ], model);
  const rawWhatCouldBreak = filterPrimaryLensCopy([
    ...(model?.whatCouldBreak || []),
    model?.failureMode?.primary,
    model?.failureMode?.trigger,
    ...(model?.auditAlerts || []),
    ...(model?.missingCritical || []),
    ...(model?.topNegativeDrivers || []),
  ], model);
  const rawManualReviewTriggers = filterPrimaryLensCopy([
    model?.manualReviewStatus?.label,
    model?.manualReviewStatus?.detail,
    ...(model?.auditAlerts || []),
    ...(model?.blockers || []),
  ], model);
  const allocationThesis = firstText([
    model?.summaryMemo,
    model?.tokenDemandTruth,
    model?.primaryStrength,
  ], "Allocation thesis is not explicitly available in the live response.");

  const whatMustBeTrue = dedupe([
    ...lensRequiredConditions,
    ...lensEvidenceNeeded,
    ...rawWhatMustBeTrue,
  ]).slice(0, 6);

  const whatCouldBreak = dedupe([
    ...lensPrimaryBlocker,
    ...filterPrimaryLensCopy(lensEvidenceNeeded, model),
    ...rawWhatCouldBreak,
  ]).slice(0, 6);

  const supportingContext = dedupe([
    ...(model?.topPositiveDrivers || []),
    ...(model?.decisionDrivers || []),
    model?.primaryStrength,
    model?.evidenceStrength ? `Live evidence strength signal: ${titleCase(model.evidenceStrength)}.` : null,
  ]).slice(0, 6);

  const missingContext = dedupe([
    ...lensEvidenceNeeded,
    ...rawMissingContext,
  ]).slice(0, 6);

  const manualReviewTriggers = dedupe([
    ...lensEvidenceNeeded,
    ...lensRequiredConditions,
    ...rawManualReviewTriggers,
  ]).slice(0, 5);

  return {
    allocationThesis,
    whatMustBeTrue,
    whatCouldBreak,
    supportingContext,
    missingContext,
    manualReviewTriggers,
    falsePositiveRisk: lensForAsset(model, displayIdentity),
    weakestLinkLabel: model?.weakestLink?.label || "Weakest link not explicitly available in live response.",
    weakestLinkExplanation: model?.weakestLink?.explanation || "The live response did not expose a dedicated weakest-link field.",
    whatWouldChange: dedupe(
      lensWhatWouldChange.length
        ? lensWhatWouldChange
        : filterPrimaryLensCopy(
          model?.whatWouldChangeDecision?.items?.length
            ? model.whatWouldChangeDecision.items
            : model?.requiredConditions || [],
          model,
        ),
    ).slice(0, 4),
  };
}

function BoundaryChip({ children, styles }) {
  return <span style={styles.thesisBoundaryChip}>{children}</span>;
}

function AllocationCaseSection({ model, styles }) {
  const allocationCase = model?.allocationCase || {};
  const verdictReasons = model?.verdictReasons || {};
  const lensAware = model?.lensAwareExplanations || {};
  const lensAwareEvidence = normalizeRenderableList(lensAware.evidenceNeeded);
  const lensAwareWhatWouldChange = normalizeRenderableList(lensAware.whatWouldChange);
  const lensAwarePrimaryBlocker = normalizeRenderableList(lensAware.primaryBlocker);
  const questionEvidence = lensAwareQuestionItems(model, "missingEvidence");
  const questionWhatWouldChange = lensAwareQuestionItems(model, "whatWouldChange");
  const primaryEvidence = lensAwareEvidence.length ? lensAwareEvidence : questionEvidence;
  const primaryWhatWouldChange = lensAwareWhatWouldChange.length ? lensAwareWhatWouldChange : questionWhatWouldChange;
  const reviewOnlyCautions = filterPrimaryLensCopy(verdictReasons.reviewOnlyCautions, model);
  const columns = [
    {
      title: "Why allocation could make sense",
      items: allocationCase.forAllocation || verdictReasons.positiveThesisEvidence || [],
      color: "#a6f3c2",
      emptyText: "No positive allocation case was surfaced by the live response.",
    },
    {
      title: "Why allocation is blocked",
      items: lensAwarePrimaryBlocker.length
        ? lensAwarePrimaryBlocker
        : allocationCase.againstAllocation || verdictReasons.realBlockers || [],
      color: "#ffb6b6",
      emptyText: "No material blocker was surfaced by the live response.",
    },
    {
      title: "Evidence still needed",
      items: primaryEvidence.length
        ? primaryEvidence
        : allocationCase.missingEvidence || verdictReasons.evidenceGaps || [],
      color: "#f9d976",
      emptyText: "No missing-evidence list was surfaced.",
    },
    {
      title: "What would change the decision",
      items: primaryWhatWouldChange.length
        ? primaryWhatWouldChange
        : allocationCase.whatWouldChange || verdictReasons.whatWouldChangeDecision || [],
      color: "#9bd7ff",
      emptyText: "No decision-change requirements were surfaced.",
    },
  ];

  return (
    <Card
      title="Allocation Case Semantics"
      subtitle="Backend verdict taxonomy v1. Research requirements and missing evidence are not completed evidence."
      styles={styles}
    >
      <div style={styles.thesisBoundaryStrip}>
        <BoundaryChip styles={styles}>Research requirements are not evidence</BoundaryChip>
        <BoundaryChip styles={styles}>Evidence gaps are separated from confirmed failure</BoundaryChip>
        <BoundaryChip styles={styles}>Only live scoring affects the current verdict</BoundaryChip>
        {primaryEvidence.length || primaryWhatWouldChange.length ? (
          <BoundaryChip styles={styles}>Primary display copy is lens-aware; raw fields remain audit context</BoundaryChip>
        ) : null}
      </div>
      <div style={styles.allocationCaseGrid}>
        {columns.map((column) => (
          <div key={column.title} style={styles.allocationCaseCard}>
            <ListBlock
              title={column.title}
              items={column.items}
              emptyText={column.emptyText}
              color={column.color}
              styles={styles}
            />
          </div>
        ))}
      </div>
      <ListBlock
        title="Review-only cautions"
        items={reviewOnlyCautions}
        emptyText="No review-only cautions were surfaced separately."
        color="#d5dcec"
        styles={styles}
      />
      <ListBlock
        title="Not-applicable items"
        items={verdictReasons.notApplicableItems}
        emptyText="No not-applicable items were surfaced separately."
        color="#8a94a6"
        styles={styles}
      />
    </Card>
  );
}

export default function ThesisFalsificationTab({ model, displayIdentity = null, styles, onSelectSection }) {
  const thesis = buildThesisModel(model || {}, displayIdentity);
  const assetFraming = displayIdentity?.displayFraming || displayIdentity?.displayAssetClass || model?.assetFramingLabel || model?.assetClassLabel || "Digital asset allocation thesis";

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
        <SectionRow label="Asset framing" value={assetFraming} styles={styles} />
      </Card>

      {model?.verdictSemantics?.hasVerdictClass ? (
        <AllocationCaseSection model={model} styles={styles} />
      ) : null}

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
