import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import {
  extractRenderableText,
  normalizeRenderableList,
  providerLabel,
  safeArray,
  safeObject,
  titleCase,
} from "./researchUtils";

function chip(styles, label, color = "#7dd3fc") {
  return (
    <span style={{ ...styles.riskChip, borderColor: color, color }}>
      {label}
    </span>
  );
}

function boundaryChip(styles, children) {
  return (
    <span style={styles.sourceBoundaryChip}>
      {children}
    </span>
  );
}

function dedupeByText(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.label}-${item.description}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function providerGapLeads(providerDiagnostics) {
  return safeArray(providerDiagnostics)
    .filter((entry) => (
      entry.status === "failure" ||
      entry.status === "skipped" ||
      ["missing", "unavailable", "unsupported", "weak", "partial"].includes(entry.coverage || "")
    ))
    .map((entry) => ({
      label: providerLabel(entry.provider || entry.source || entry.section || "provider"),
      description: entry.reason || "Provider/source context is partial or unavailable in the live response.",
      status: entry.status === "failure" ? "Provider unavailable" : "Needs verification",
      source: "meta.providerDiagnostics",
      color: entry.status === "failure" ? "#ff6b6b" : "#ffb020",
    }));
}

function sourceStatusLeads(sourceStatus) {
  return Object.entries(safeObject(sourceStatus))
    .filter(([, value]) => ["partial", "modeled", "weak", "unsupported", "skipped", "unavailable", "missing"].includes(String(value).toLowerCase()))
    .map(([section, value]) => ({
      label: providerLabel(section),
      description: `Live source status is ${titleCase(value)}. This is a review lead, not a discovered source.`,
      status: "Potential source/review lead",
      source: "sourceStatus",
      color: ["unsupported", "skipped", "unavailable", "missing"].includes(String(value).toLowerCase()) ? "#ffb020" : "#7dd3fc",
    }));
}

function buildReviewLeads({ model, sourceStatus, providerDiagnostics }) {
  const required = normalizeRenderableList(model?.requiredConditions).map((entry) => ({
    label: "Required condition",
    description: entry,
    status: "Needs source",
    source: "decisionModel.requiredConditions",
    color: "#7dd3fc",
  }));
  const missing = normalizeRenderableList(model?.missingCritical).map((entry) => ({
    label: "Missing critical evidence",
    description: entry,
    status: "Needs verification",
    source: "decisionModel.missingCritical",
    color: "#ffb020",
  }));
  const whatWouldChange = normalizeRenderableList(model?.whatWouldChangeDecision?.items).map((entry) => ({
    label: "Decision-change requirement",
    description: entry,
    status: "Potential source/review lead",
    source: "decisionModel.whatWouldChangeDecision",
    color: "#7dd3fc",
  }));
  const alerts = normalizeRenderableList(model?.auditAlerts).map((entry) => ({
    label: "Audit alert",
    description: entry,
    status: "Needs review",
    source: "decisionModel.auditAlerts",
    color: "#ff6b6b",
  }));

  return dedupeByText([
    ...missing,
    ...required,
    ...whatWouldChange,
    ...alerts,
    ...providerGapLeads(providerDiagnostics),
    ...sourceStatusLeads(sourceStatus),
  ]).slice(0, 8);
}

function suggestedResearchDomains(model, displayIdentity = null) {
  const resolvedLensId = model?.resolvedInstitutionalLens?.lensId;
  if (resolvedLensId === "PAYMENTS_SETTLEMENT") {
    return [
      "Payment/settlement volume and material usage evidence",
      "Transaction fee, reserve, anti-spam, and burn mechanics with materiality review",
      "Validator/trust/finality model, escrow/release/distribution, and ecosystem dependency evidence",
    ];
  }
  if (resolvedLensId === "GAMING_METAVERSE_CONSUMER") {
    return [
      "Active players, paying users, retention, and game volume evidence",
      "Marketplace, tournament, entry-fee, and in-game purchase demand",
      "Reward emissions, token sinks, mintability, max-supply enforcement, unlock schedule, audits, and admin roles",
    ];
  }
  if (resolvedLensId === "RWA_HYBRID_INFRASTRUCTURE") {
    return [
      "Official RWA/tokenization infrastructure and compliance architecture documentation",
      "Utility/gas/staking rights separated from tokenized security or RWA product rights",
      "Issuance/fee evidence, legal/custody/compliance dependencies, and supply-cap mutability review where flagged",
    ];
  }
  if (resolvedLensId === "ORACLE_INFRASTRUCTURE" || resolvedLensId === "DEPENDENCY_INFRASTRUCTURE") {
    return [
      "Oracle service payment, staking, collateral, and security-mechanics evidence",
      "Source-backed oracle usage to durable token-demand mapping",
      "Infrastructure adoption separated from tokenholder value capture",
    ];
  }
  if (resolvedLensId === "RWA_HYBRID_ASSET") {
    return [
      "Tokenholder legal/economic claim, redemption enforceability, and terms",
      "Issuer, custodian, collateral counterparty, jurisdiction, and backing documentation",
      "Explicit boundary that RWA/category metadata is not enforceable rights",
    ];
  }
  if (resolvedLensId === "DEPIN_COMPUTE_STORAGE") {
    return [
      "Resource demand, payer mapping, and compute/storage/rendering usage evidence",
      "Provider incentives, subsidy dependency, and token settlement/payment role",
      "Resource-network adoption separated from tokenholder value capture",
    ];
  }
  if (resolvedLensId === "STABLECOIN_SETTLEMENT" || displayIdentity?.lensId === "STABLECOIN_SETTLEMENT_ASSET") {
    return [
      "Reserve attestations and reserve composition disclosures",
      "Redemption terms, issuer disclosures, and legal/counterparty structure",
      "Issuer/custodian/admin/freeze controls and peg-stress redemption evidence",
    ];
  }
  if (resolvedLensId === "WRAPPED_ASSET" || ["WRAPPED_ASSET"].includes(displayIdentity?.lensId)) {
    return [
      "Proof-of-reserves/backing, custodian/merchant, and bridge-control documentation",
      "Mint/burn controls, redemption path, and wrapper dependency evidence",
      "Native-asset inheritance boundary and selected chain/contract identity review",
    ];
  }
  if (resolvedLensId === "LST_STAKING_DERIVATIVE" || ["LIQUID_STAKING_TOKEN", "RESTAKING_OR_LRT"].includes(displayIdentity?.lensId)) {
    return [
      "Withdrawal queue, redemption path, and staking-derivative mechanics",
      "Slashing/operator risk, depeg/liquidity depth, admin controls, and audit/security documentation",
      "Scanner verification to separate false positives from confirmed critical risk",
    ];
  }
  if (resolvedLensId === "BASE_LAYER_SETTLEMENT" || resolvedLensId === "NATIVE_MONETARY_BENCHMARK") {
    return [
      "Network activity, fees, settlement/gas demand, and market depth",
      "Validator/miner/security model, issuance/burn/staking/monetary policy, and decentralization evidence",
      "Liveness/outage, congestion, client diversity, validator risk, and protocol-upgrade review where relevant",
    ];
  }
  if (resolvedLensId === "MEME_NARRATIVE") {
    return [
      "Narrative/liquidity tradability context and holder/liquidity durability",
      "Evidence of durable non-narrative utility or enforceable economic rights, if any",
      "Explicit boundary that liquidity/security does not create allocation-thesis support by itself",
    ];
  }
  if (["DEFI_PROTOCOL_TOKEN", "DERIVATIVES_OR_PERPS_PROTOCOL"].includes(displayIdentity?.lensId)) {
    return [
      "Tokenholder accrual, fee switch, and revenue-routing evidence",
      "Governance proposals, admin controls, and upgrade authority",
      "Audit history, liquidation/risk module design, and protocol financials",
    ];
  }
  if (["ORACLE_OR_INFRASTRUCTURE", "COMPUTE_STORAGE_DEPIN"].includes(displayIdentity?.lensId)) {
    return [
      "Payer mapping and customer/payment evidence",
      "Staking/security role and slashing or service-level guarantees",
      "Token utility and tokenholder accrual limits",
    ];
  }
  if (displayIdentity?.lensId === "PAYMENTS_OR_SETTLEMENT_NETWORK") {
    return [
      "Production payment usage and customer/partner evidence",
      "Token role, fee mechanics, and settlement activity mapping",
      "Issuer/network dependencies, access, and regulatory status",
    ];
  }
  if (displayIdentity?.lensId === "MEME_OR_NARRATIVE") {
    return [
      "Holder concentration, insider/unlock risk, and liquidity durability",
      "Narrative dependence, exchange liquidity, and downside support",
      "Evidence that popularity is not being mistaken for fundamentals",
    ];
  }
  if (displayIdentity?.lensId === "RWA_OR_HYBRID_METHODOLOGY") {
    return [
      "Underlying asset, issuer, custody, and collateral evidence",
      "Legal claim, enforceable rights, redemption path, and jurisdictional access",
      "Yield source, AUM-to-token accrual, and institutional usage evidence",
    ];
  }

  const raw = [
    displayIdentity?.displayAssetClass,
    displayIdentity?.displayFraming,
    displayIdentity?.primaryChip,
    displayIdentity?.secondaryChip,
    model?.assetClass,
    model?.assetSubtype,
    model?.assetFramingLabel,
    model?.primarySector,
  ].filter(Boolean).join(" ").toLowerCase();
  if (raw.includes("stable") || raw.includes("trust")) {
    return [
      "Reserve attestations and reserve composition disclosures",
      "Redemption terms, issuer disclosures, and legal/counterparty structure",
      "Bankruptcy-remoteness, custodian, and concentration-risk evidence",
    ];
  }
  if (raw.includes("wrapped") || raw.includes("lst") || raw.includes("liquid staking") || raw.includes("dependency")) {
    return [
      "Custody and proof-of-reserves documentation",
      "Redemption path, merchant/custodian process, and wrapper contract/admin controls",
      "Dependency, slashing, bridge, or smart-contract risk evidence",
    ];
  }
  if (raw.includes("defi") || raw.includes("yield") || raw.includes("protocol")) {
    return [
      "Tokenholder accrual, fee switch, and revenue-routing evidence",
      "Governance proposals, admin controls, and upgrade authority",
      "Audit history, liquidation/risk module design, and protocol financials",
    ];
  }
  if (raw.includes("infrastructure") || raw.includes("oracle") || raw.includes("compute")) {
    return [
      "Payer mapping and customer/payment evidence",
      "Staking/security role and slashing or service-level guarantees",
      "Token utility and tokenholder accrual limits",
    ];
  }
  if (raw.includes("meme") || raw.includes("narrative")) {
    return [
      "Holder concentration, insider/unlock risk, and liquidity durability",
      "Narrative dependence, exchange liquidity, and downside support",
      "Evidence that popularity is not being mistaken for fundamentals",
    ];
  }
  return [
    "Primary-source documentation for the current thesis blockers",
    "Freshness, publisher authenticity, and claim-scope verification",
    "Contradiction checks against provider diagnostics and audit alerts",
  ];
}

function formatRequirementStatus(value) {
  if (!value) return "Status unavailable";
  return titleCase(String(value));
}

function ResearchRequirementCard({ requirement, styles }) {
  const priorityColor = requirement.priority === "critical"
    ? "#ff6b6b"
    : requirement.priority === "high"
      ? "#ffb020"
      : "#7dd3fc";

  return (
    <div style={styles.sourceLeadCard}>
      <div style={styles.timelineTitleRow}>
        <strong style={{ color: "#f4f7ff" }}>{requirement.title || "Research requirement"}</strong>
        {chip(styles, titleCase(requirement.priority || "review"), priorityColor)}
      </div>
      <div style={styles.timelineSummary}>{requirement.reason || "Generated from live gaps and decision semantics."}</div>
      <div style={styles.timelineMeta}>
        {requirement.assetClassLens || "Asset-class lens"} - {formatRequirementStatus(requirement.currentStatus)}
      </div>
      <ListBlock
        title="Evidence needed"
        items={requirement.evidenceNeeded}
        emptyText="No evidence-needed list was attached."
        color="#f9d976"
        styles={styles}
      />
      <ListBlock
        title="Preferred source types"
        items={requirement.preferredSourceTypes}
        emptyText="No preferred source types were attached."
        color="#9bd7ff"
        styles={styles}
      />
      <SectionRow
        label="Verdict impact"
        value={requirement.verdictImpact || "Resolve or clarify the live decision requirement."}
        styles={styles}
      />
      <SectionRow
        label="Can change verdict"
        value={requirement.canChangeVerdict ? "Potentially, if reviewed source-backed evidence resolves the live gap." : "No, unless durable fundamentals are separately source-backed."}
        styles={styles}
      />
    </div>
  );
}

export default function SourceQueuePanel({
  model,
  displayIdentity = null,
  sourceStatus,
  providerDiagnostics,
  styles,
}) {
  const reviewLeads = buildReviewLeads({ model, sourceStatus, providerDiagnostics });
  const domains = suggestedResearchDomains(model, displayIdentity);
  const researchRequirements = safeArray(model?.researchRequirements);
  const assetFraming = displayIdentity?.displayFraming || displayIdentity?.displayAssetClass || extractRenderableText(model?.assetFramingLabel, "Digital asset allocation thesis");

  return (
    <div style={styles.sourceQueueShell}>
      <Card title="Source Queue" subtitle="Candidate Layer" styles={styles}>
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, "Source candidates are not evidence.")}
          {boundaryChip(styles, "Candidates require review before they can become report evidence.")}
          {boundaryChip(styles, "Candidate-only items cannot affect scoring.")}
        </div>
        <SectionRow
          label="Current attachment"
          value="Source discovery candidates are not attached to this live response yet."
          styles={styles}
        />
      </Card>

      <Card title="Source Lifecycle Explainer" subtitle="Report-only workflow. Not live scoring input." styles={styles}>
        <div style={styles.sourceWorkflowGrid}>
          {[
            ["Source Candidate", "Review prompt only. Not evidence.", "Cannot affect scoring"],
            ["Manual Intake", "Reviewer checks source authenticity, freshness, scope, and contradictions.", "Requires review"],
            ["ManualSourceEvidenceItem", "Source-backed report object after accepted intake and conversion gates.", "Report-only"],
            ["Manual Source Mapping", "Maps evidence item to packet field/question candidates.", "Cannot affect scoring"],
            ["Report-Only Overlay", "Transparent report context if accepted mapping later merges.", "Report-only unless explicitly integrated later"],
          ].map(([title, description, status]) => (
            <div key={title} style={styles.sourceWorkflowLane}>
              <div style={styles.metaLabel}>{title}</div>
              <div style={styles.contextMuted}>{description}</div>
              <div style={{ marginTop: 10 }}>{chip(styles, status, status.includes("Cannot") ? "#ffb020" : "#7dd3fc")}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={styles.advancedGrid}>
        <Card title="Research Requirements" subtitle="Generated from live gaps. These are not reviewed evidence." styles={styles}>
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, "Research requirements are not evidence.")}
          {boundaryChip(styles, "A source candidate becomes evidence only after review.")}
          {boundaryChip(styles, "Report-only evidence does not affect live scoring.")}
        </div>
          {model?.lensAwareExplanations ? (
            <p style={styles.timelineMeta}>
              Lens-aware display priorities use the resolved institutional lens. Raw backend requirements remain available in Audit / Raw; scores and verdicts are unchanged.
            </p>
          ) : null}
          {researchRequirements.length ? researchRequirements.map((requirement) => (
            <ResearchRequirementCard key={requirement.id || requirement.title} requirement={requirement} styles={styles} />
          )) : (
            <p style={styles.timelineEmptyText}>No backend research requirements were attached to this live response.</p>
          )}
        </Card>

        <Card title="Live Response Gaps That Need Sources" subtitle="Review leads derived from current live response." styles={styles}>
          {reviewLeads.length ? reviewLeads.map((lead, index) => (
            <div key={`${lead.source}-${lead.label}-${index}`} style={styles.sourceLeadCard}>
              <div style={styles.timelineTitleRow}>
                <strong style={{ color: "#f4f7ff" }}>{lead.label}</strong>
                {chip(styles, lead.status, lead.color)}
              </div>
              <div style={styles.timelineSummary}>{lead.description}</div>
              <div style={styles.timelineMeta}>{lead.source} - potential source/review lead, not a discovered source</div>
            </div>
          )) : (
            <p style={styles.timelineEmptyText}>No live review leads were surfaced. Source discovery candidates are still not attached to this response.</p>
          )}
        </Card>

        <Card title="Suggested Research Domains" subtitle="Methodology guidance only, not live facts." styles={styles}>
          <SectionRow
            label="Asset framing"
            value={assetFraming}
            styles={styles}
          />
          <ListBlock
            title="Domains an analyst may research manually"
            items={domains}
            emptyText="No methodology guidance was available."
            color="#9bd7ff"
            styles={styles}
          />
        </Card>
      </div>
    </div>
  );
}
