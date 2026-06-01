import React, { useState } from "react";
import { Card, CollapsibleDetail, ExecutiveSummaryCard, ListBlock, SectionRow } from "./researchPrimitives";
import { formatCompact, formatPct, formatUsd, getAnalystAnswerCard, safeArray, safeObject, titleCase } from "./researchUtils";

function isPresent(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function displayNumber(value, options = {}) {
  if (!isPresent(value)) return "Unavailable";
  const num = Number(value);
  return num.toLocaleString(undefined, {
    maximumFractionDigits: options.digits ?? (Math.abs(num) >= 100 ? 0 : 6),
  });
}

function displayUsd(value) {
  if (!isPresent(value)) return "Unavailable";
  return formatUsd(value);
}

function displayRatio(value) {
  if (!isPresent(value)) return "Unavailable";
  return `${Number(value).toFixed(2)}x`;
}

function displayPercent(value, digits = 2) {
  if (!isPresent(value)) return "Unavailable";
  return formatPct(value, digits);
}

function displayDecimalPercent(value, digits = 2) {
  if (!isPresent(value)) return "Unavailable";
  return formatPct(Number(value) * 100, digits);
}

function status(value) {
  return titleCase(value || "Unavailable");
}

function controlStatusLabel(value, kind, lensId) {
  const stablecoin = lensId === "STABLECOIN_SETTLEMENT";
  if (stablecoin && kind === "mint") {
    if (value === "requires_manual_review") return "present / issuer-controlled / requires policy review";
    if (value === "verified") return "not detected on selected contract; issuer mint/redeem still requires review";
    if (value === "not_applicable") return "not applicable to selected scan";
    return "unknown / requires issuer policy review";
  }
  if (stablecoin && kind === "admin") {
    if (value === "requires_manual_review") return "present / requires policy review";
    if (value === "verified") return "not detected on selected contract; freeze/admin policy still requires review";
    if (value === "not_applicable") return "not applicable to selected scan";
    return "unknown / requires policy review";
  }
  if (kind === "mint" && value === "verified") return "selected contract reported non-mintable";
  if (kind === "admin" && value === "verified") return "owner/admin risk not detected on selected contract";
  if (value === "requires_manual_review") return "detected / requires review";
  if (value === "not_applicable") return "not applicable";
  return status(value);
}

function compactList(items, mapper = (item) => item) {
  return safeArray(items).map(mapper).filter(Boolean);
}

function FieldGrid({ children }) {
  return (
    <div style={{
      display: "grid",
      gap: "0.75rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      marginTop: "0.8rem",
    }}>
      {children}
    </div>
  );
}

function MiniMetric({ label, value, tone = "#d5dcec" }) {
  return (
    <div style={{
      border: "1px solid rgba(148, 163, 184, 0.16)",
      borderRadius: 16,
      padding: "0.85rem",
      background: "rgba(6, 12, 24, 0.36)",
    }}>
      <div style={{ color: "#8a94a6", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ color: tone, fontSize: "1rem", fontWeight: 800, marginTop: 4 }}>{value || "Unavailable"}</div>
    </div>
  );
}

function ProviderComparison({ tokenomics, styles }) {
  const snapshots = [
    tokenomics.coingeckoSupply,
    tokenomics.coinmarketcapSupply,
  ].filter(Boolean);
  const localRows = [
    ...safeArray(tokenomics.providerMarketCaps),
    ...safeArray(tokenomics.providerFdvs),
    ...safeArray(tokenomics.providerVolumes),
    ...safeArray(tokenomics.providerSupplyValues),
  ].filter((entry) => entry?.scope === "pair_liquidity_local");

  if (!snapshots.length) {
    return (
      <Card title="Provider Comparison" subtitle="Provider-specific numeric rows were not attached to this response." styles={styles}>
        <ListBlock
          title="Provider numeric provenance"
          items={[
            ...compactList(tokenomics.providerMarketCaps, (entry) => `${entry.provider} market cap: ${displayUsd(entry.value)} (${entry.sourcePath}; ${entry.boundary})`),
            ...compactList(tokenomics.providerFdvs, (entry) => `${entry.provider} FDV: ${displayUsd(entry.value)} (${entry.sourcePath}; ${entry.boundary})`),
            ...compactList(tokenomics.providerVolumes, (entry) => `${entry.provider} volume: ${displayUsd(entry.value)} (${entry.sourcePath}; ${entry.boundary})`),
            ...compactList(tokenomics.providerSupplyValues, (entry) => `${entry.provider} ${entry.field}: ${displayNumber(entry.value)} (${entry.sourcePath}; ${entry.boundary})`),
          ]}
          emptyText="No provider-specific numeric rows were attached."
          color="#d5dcec"
          styles={styles}
        />
      </Card>
    );
  }

  return (
    <Card title="Provider Comparison" subtitle="CoinGecko/CMC rows are provider-reported context, not reviewed evidence." styles={styles}>
      <div style={{ display: "grid", gap: "0.85rem" }}>
        {snapshots.map((snapshot) => (
          <div key={snapshot.provider} style={{
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: 18,
            padding: "0.9rem",
            background: "rgba(6, 12, 24, 0.34)",
          }}>
            <SectionRow label="Provider" value={titleCase(snapshot.provider)} styles={styles} />
            <SectionRow label="Price / market cap / FDV" value={`${displayUsd(snapshot.currentPrice)} / ${displayUsd(snapshot.marketCap)} / ${displayUsd(snapshot.fdv)}`} styles={styles} />
            <SectionRow label="Volume / circulating / total / max" value={`${displayUsd(snapshot.volume24h)} / ${displayNumber(snapshot.circulatingSupply)} / ${displayNumber(snapshot.totalSupply)} / ${displayNumber(snapshot.maxSupply)}`} styles={styles} />
            <SectionRow label="Self-reported CMC supply / market cap" value={`${displayNumber(snapshot.selfReportedCirculatingSupply)} / ${displayUsd(snapshot.selfReportedMarketCap)}`} styles={styles} />
            <SectionRow label="Timestamp / source" value={`${snapshot.timestamp || "Unavailable"} / ${snapshot.sourcePath || "Unavailable"}`} styles={styles} />
            <ListBlock title="Boundary" items={snapshot.sourceBoundary} emptyText="No source boundary attached." color="#9bd7ff" styles={styles} />
          </div>
        ))}
      </div>
      <ListBlock title="Provider disagreements" items={tokenomics.providerDisagreements} emptyText="No material provider disagreement was attached." color="#f9d976" styles={styles} />
      <ListBlock title="Provider scope notes" items={tokenomics.providerScopeNotes} emptyText="No cross-scope provider note was attached." color="#d5dcec" styles={styles} />
      <ListBlock
        title="Liquidity / Pair Context"
        items={compactList(localRows, (entry) => `${entry.provider} ${entry.field}: ${entry.field?.toLowerCase().includes("supply") ? displayNumber(entry.value) : displayUsd(entry.value)} (${entry.sourcePath}; ${entry.scope})`)}
        emptyText="No pair-level liquidity context attached."
        color="#9bd7ff"
        styles={styles}
      />
    </Card>
  );
}

function FormulaPanel({ tokenomics, styles }) {
  const formulas = safeArray(tokenomics.formulaOutputs);
  const primaryIds = new Set([
    "fdv_market_cap_ratio",
    "remaining_dilution",
    "circulating_percent_of_max",
    "supply_gap_total_minus_circulating",
    "max_supply_gap",
    "unlock_volume_ratio",
    "unlock_market_cap_ratio",
    "net_issuance",
  ]);
  const primary = formulas.filter((formula) => primaryIds.has(formula.formulaId));
  const unavailable = formulas.filter((formula) => formula.status !== "computed" && !primaryIds.has(formula.formulaId));
  const advanced = formulas.filter((formula) => formula.status === "computed" && !primaryIds.has(formula.formulaId));
  const FormulaRows = ({ rows }) => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {rows.map((formula) => (
        <div key={formula.formulaId || formula.label} style={{
          border: "1px solid rgba(148, 163, 184, 0.16)",
          borderRadius: 16,
          padding: "0.85rem",
          background: "rgba(6, 12, 24, 0.32)",
        }}>
          <SectionRow label={formula.label || "Formula"} value={formula.display || "Unavailable"} styles={styles} />
          <SectionRow label="Formula" value={formula.formula || "Unavailable"} styles={styles} />
          <SectionRow label="Status / method" value={`${status(formula.status)} / ${status(formula.method)}`} styles={styles} />
          <ListBlock
            title="Inputs"
            items={compactList(formula.inputs, (entry) => `${entry.name}: ${displayNumber(entry.value)} (${entry.sourcePath || "source unavailable"})`)}
            emptyText="No formula inputs attached."
            color="#d5dcec"
            styles={styles}
          />
          <ListBlock title="Missing inputs" items={formula.missingInputs} emptyText="No missing inputs for this formula." color="#f9d976" styles={styles} />
          <SectionRow label="Source requirement" value={formula.sourceRequirement || "Unavailable"} styles={styles} />
        </div>
      ))}
    </div>
  );
  return (
    <Card title="Formula Outputs" subtitle="Primary formulas first. Advanced and unavailable formulas remain available without taking over the page." styles={styles}>
      {formulas.length ? (
        <>
          <FormulaRows rows={primary.length ? primary : formulas.slice(0, 6)} />
          {advanced.length ? (
            <details style={{ marginTop: 14 }}>
              <summary style={{ color: "#9bd7ff", cursor: "pointer", fontWeight: 800 }}>Advanced computed formulas ({advanced.length})</summary>
              <div style={{ marginTop: 12 }}><FormulaRows rows={advanced} /></div>
            </details>
          ) : null}
          {unavailable.length ? (
            <details style={{ marginTop: 14 }}>
              <summary style={{ color: "#f9d976", cursor: "pointer", fontWeight: 800 }}>Unavailable formulas / source required ({unavailable.length})</summary>
              <div style={{ marginTop: 12 }}><FormulaRows rows={unavailable} /></div>
            </details>
          ) : null}
        </>
      ) : (
        <p style={{ color: "#8a94a6" }}>No backend formula outputs were attached.</p>
      )}
    </Card>
  );
}

function keyRiskItems(lensId) {
  switch (lensId) {
    case "STABLECOIN_SETTLEMENT":
      return ["Are reserves and redemption rights source-backed?", "Are mint/redeem controls and supported networks verified?", "Are issuer/custodian dependencies clear?", "Are admin/freeze policies disclosed?", "How did the peg behave under stress?"];
    case "DEFI_PROTOCOL_TOKEN":
      return ["Does protocol success accrue to tokenholders?", "Are fee switch, fee routing, buyback, burn, or staking mechanisms active?", "Are unlocks and treasury risks material?", "Is protocol economics mapping source-backed?"];
    case "GAMING_METAVERSE_CONSUMER":
      return ["Are emissions offset by real token sinks?", "Are active/paying users and retention source-backed?", "Are unlocks and mint/admin controls reviewed?", "Is gameplay demand organic rather than subsidy-driven?"];
    case "RWA_HYBRID_INFRASTRUCTURE":
      return ["Are utility-token rights separated from RWA/security-token rights?", "Is canonical network/contract mapping verified?", "Can supply or cap policy change through governance?", "Are fee, staking, or gas-demand mechanics source-backed?"];
    case "BASE_LAYER_SETTLEMENT":
    case "NATIVE_MONETARY_BENCHMARK":
      return ["Is monetary policy clear?", "Are issuance, burn, staking/mining, and security-budget mechanics understood?", "Is network liveness/security evidence sufficient?", "Is market depth institutionally usable?"];
    case "MEME_NARRATIVE":
      return ["Is supply certainty clear?", "Are mint/admin controls safe for the selected contract?", "Is concentration/liquidity risk acceptable?", "Is the analysis avoiding fake protocol fundamentals?"];
    case "WRAPPED_ASSET":
      return ["Is backing/proof-of-reserves current?", "Are custodian/bridge controls understood?", "Is the mint/burn and redemption path source-backed?", "Is native-asset inheritance avoided?"];
    case "LST_STAKING_DERIVATIVE":
      return ["Is the withdrawal/redemption path source-backed?", "Are slashing/operator risks understood?", "Is depeg/liquidity risk reviewed?", "Are protocol/admin controls disclosed?"];
    default:
      return ["Is supply data complete and source-backed?", "Can future dilution be measured?", "Who controls supply changes?", "Are provider disagreements resolved?"];
  }
}

const QUESTION_GROUPS = [
  {
    id: "supply_integrity",
    title: "Supply Integrity",
    matcher: /max_supply|remaining_dilution|supply_reconciliation|provider_supply/i,
  },
  {
    id: "future_dilution",
    title: "Future Dilution / Unlocks",
    matcher: /unlock|absorb_dilution/i,
  },
  {
    id: "control_mutability",
    title: "Control / Mutability",
    matcher: /mint_admin|emissions|burn_buyback/i,
  },
  {
    id: "ownership_concentration",
    title: "Ownership / Concentration",
    matcher: /treasury_insider|concentration/i,
  },
  {
    id: "tokenholder_economics",
    title: "Tokenholder Economics",
    matcher: /value_capture|tokenholder|accrual/i,
  },
  {
    id: "asset_identity",
    title: "Asset-Class / Identity",
    matcher: /asset_class|canonical_supply_tree/i,
  },
];

function questionGroupFor(question) {
  const id = String(question?.questionId || "");
  return QUESTION_GROUPS.find((group) => group.matcher.test(id)) || {
    id: "other",
    title: "Other Tokenomics Checks",
    matcher: /.*/,
  };
}

function questionStatusLabel(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "not_applicable") return "Not applicable";
  if (normalized === "manual_review_required") return "Manual review required";
  if (normalized === "evidence_missing") return "Evidence missing";
  if (normalized === "partially_supported") return "Partially supported";
  if (normalized === "contradicted") return "Contradicted";
  if (normalized === "supported") return "Supported";
  if (!normalized || normalized === "unknown") return "Evidence missing - source required";
  return titleCase(value);
}

function sourceStateForQuestion(question, formulas) {
  const analystCard = getAnalystAnswerCard(question);
  if (analystCard?.headlineStatus) return analystCard.headlineStatus;
  if (question?.synthesizedAnswer?.evidenceStatus) return String(question.synthesizedAnswer.evidenceStatus).replace(/_/g, "-");
  if (question?.reviewedEvidenceStatus === "source_backed") return "source-backed";
  if (question?.reviewedEvidenceStatus === "partially_source_backed") return "partially-source-backed";
  if (question?.reviewedEvidenceStatus === "stale") return "stale-source";
  if (question?.reviewedEvidenceStatus === "contradicted") return "contradicted";
  const formulaIds = safeArray(question?.formulaOutputsUsed);
  const linkedFormulas = formulas.filter((formula) => formulaIds.includes(formula.formulaId));
  const statusText = String(question?.answerStatus || "").toLowerCase();
  if (statusText.includes("manual")) return "manual-review-required";
  if (statusText.includes("contradict")) return "contradicted";
  if (statusText.includes("not_applicable")) return "not-applicable";
  if (linkedFormulas.some((formula) => formula.status === "computed")) return "computed";
  if (linkedFormulas.some((formula) => /missing|source_required|invalid/i.test(String(formula.status)))) return "source-required";
  if (safeArray(question?.missingEvidence).length) return "source-required";
  if (safeArray(question?.evidenceUsed).length) return "provider-reported";
  return "evidence-missing";
}

function displayQuestionAnswer(question) {
  const analystCard = getAnalystAnswerCard(question);
  if (analystCard?.directAnswer) return analystCard.directAnswer;
  return question?.synthesizedAnswer?.directAnswer
    || question?.shortAnswer
    || question?.answerSummary
    || "Evidence missing - source required.";
}

function impactBadgeForQuestion(question) {
  const text = `${question?.impactOnScoreOrConfidence || ""} ${safeArray(question?.missingEvidence).join(" ")}`.toLowerCase();
  if (/confidence cap|capped|cap/.test(text)) return "Confidence cap";
  if (/manual review/.test(text)) return "Manual review";
  if (/not applicable/.test(text)) return "Not applicable";
  if (/diagnostic/.test(text)) return "Diagnostic only";
  return "Source review";
}

function whyItMatters(question, lensId) {
  const id = String(question?.questionId || "");
  if (/max_supply/.test(id)) return "Max supply is only useful when the cap is credible, immutable, or clearly governed. Provider-reported caps are not reviewed evidence.";
  if (/remaining_dilution/.test(id)) return "Remaining dilution helps underwrite future supply pressure, but it may be secondary or not applicable for stablecoins, wrapped assets, LSTs, and adaptive native assets.";
  if (/unlock/.test(id)) return "Unlocks can create sell-pressure or confidence caps when timing, recipients, liquidity, and demand absorption are not source-backed.";
  if (/mint_admin/.test(id)) return "Mint/admin authority determines who can change supply or restrict transfer behavior; selected-contract scans may not cover the canonical supply tree.";
  if (/burn_buyback|emissions/.test(id)) return "Burn, buyback, and emission mechanics only matter when activation, materiality, durability, and source backing are clear.";
  if (/value_capture/.test(id)) return "Protocol or network success does not automatically accrue to tokenholders without an active, material, source-backed mechanism.";
  if (/canonical_supply_tree/.test(id)) return "Supply conclusions depend on analyzing the correct canonical asset, network, contract, bridge, wrapper, or multichain representation.";
  if (/asset_class/.test(id)) return contextualNote(lensId);
  return "This question converts tokenomics data into a source-boundary-aware institutional diligence answer.";
}

function valueFromPath(tokenomics, path) {
  if (!path || typeof path !== "string") return null;
  const direct = tokenomics?.[path];
  if (direct !== undefined) return direct;
  const parts = path.split(".");
  let current = tokenomics;
  for (const part of parts) {
    if (!current || typeof current !== "object") return null;
    current = current[part];
  }
  return current;
}

function displayFieldValue(value) {
  if (value === null || value === undefined || value === "") return "Unavailable - source required";
  if (Array.isArray(value)) return value.length ? value.map((entry) => typeof entry === "object" ? JSON.stringify(entry) : String(entry)).join("; ") : "Unavailable - source required";
  if (typeof value === "object") return Object.keys(value).length ? JSON.stringify(value) : "Unavailable - source required";
  if (typeof value === "number") return displayNumber(value);
  return String(value);
}

function StatusBadge({ children, tone = "#9bd7ff" }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      border: `1px solid ${tone}55`,
      borderRadius: 999,
      padding: "0.22rem 0.55rem",
      color: tone,
      background: `${tone}14`,
      fontSize: "0.72rem",
      fontWeight: 800,
      letterSpacing: "0.02em",
    }}>
      {children}
    </span>
  );
}

function TokenomicsQuestionPanel({ tokenomics, styles }) {
  const [openQuestions, setOpenQuestions] = useState(() => new Set());
  const questions = safeArray(tokenomics.institutionalQuestions);
  const formulas = safeArray(tokenomics.formulaOutputs);
  const grouped = QUESTION_GROUPS.concat([{ id: "other", title: "Other Tokenomics Checks", matcher: /.*/ }])
    .map((group) => ({
      ...group,
      questions: questions.filter((question) => questionGroupFor(question).id === group.id),
    }))
    .filter((group) => group.questions.length);
  const toggleQuestion = (id) => {
    setOpenQuestions((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderQuestion = (question, index) => {
    const questionKey = question.questionId || question.questionText || `question-${index}`;
    const synthesized = safeObject(question.synthesizedAnswer);
    const analystCard = getAnalystAnswerCard(question);
    const linkedFormulas = formulas.filter((formula) => safeArray(question.formulaOutputsUsed).includes(formula.formulaId));
    const isOpen = openQuestions.has(questionKey);
    const sourceState = sourceStateForQuestion(question, formulas);
    const statusText = questionStatusLabel(question.answerStatus);
    const impactBadge = impactBadgeForQuestion(question);
    const dataRows = safeArray(question.dataFieldsUsed).map((field) => `${field}: ${displayFieldValue(valueFromPath(tokenomics, field))}`);
    const formulaIds = safeArray(synthesized.formulaOutputsUsed).length ? safeArray(synthesized.formulaOutputsUsed) : safeArray(question.formulaOutputsUsed);
    const synthesizedLinkedFormulas = formulas.filter((formula) => formulaIds.includes(formula.formulaId));
    const formulaRows = (synthesizedLinkedFormulas.length ? synthesizedLinkedFormulas : linkedFormulas).map((formula) => `${formula.label || formula.formulaId}: ${formula.display || "Unavailable - source required"} | ${formula.formula || "Formula unavailable"} | status=${questionStatusLabel(formula.status)} | missing=${safeArray(formula.missingInputs).join(", ") || "none"}`);
    const reviewedSourceRows = (safeArray(synthesized.reviewedSourcesUsed).length ? safeArray(synthesized.reviewedSourcesUsed) : safeArray(question.reviewedSourcesUsed)).map((source) => `${source.title || "Reviewed source"} (${source.publisher || "publisher unavailable"}) - ${source.freshnessStatus || "freshness unknown"} - ${source.scoringEligible ? "scoring eligible" : "not scoring-active"} - ${source.url || "URL unavailable"}`);
    const reviewedFactRows = (safeArray(synthesized.reviewedFactsUsed).length ? safeArray(synthesized.reviewedFactsUsed) : safeArray(question.reviewedFactsUsed)).map((fact) => `${fact.claim || fact.factId} (${fact.normalizedClaimType || "claim type unavailable"})`);
    const evidenceMappingWarningRows = [
      ...safeArray(synthesized.warnings),
      ...safeArray(question.evidenceMappingWarnings),
      ...safeArray(question.reviewedEvidenceDoesNotAnswer),
    ];
    const ruleRows = formulaRows.length
      ? formulaRows
      : [
          synthesized.synthesisTemplateId
            ? `Rule-based synthesized answer: ${synthesized.synthesisTemplateId}. ${contextualNote(tokenomics.supplySummary?.lensId)}`
            : question.answerStatus === "not_applicable"
              ? `Not applicable for this asset class. ${displayQuestionAnswer(question) || contextualNote(tokenomics.supplySummary?.lensId)}`
              : `Rule-based answer. ${contextualNote(tokenomics.supplySummary?.lensId)}`,
        ];
    const answerText = analystCard.directAnswer || displayQuestionAnswer(question);

    return (
      <div key={questionKey} style={{
        border: "1px solid rgba(148, 163, 184, 0.17)",
        borderRadius: 18,
        overflow: "hidden",
        background: "rgba(6, 12, 24, 0.34)",
      }}>
        <button
          type="button"
          onClick={() => toggleQuestion(questionKey)}
          aria-expanded={isOpen}
          style={{
            width: "100%",
            border: 0,
            background: "transparent",
            color: "#d5dcec",
            textAlign: "left",
            padding: "1rem",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ minWidth: 220, flex: "1 1 320px" }}>
              <div style={{ color: "#f4f7fb", fontWeight: 850, lineHeight: 1.35 }}>{question.questionText || "Tokenomics question unavailable"}</div>
              <div style={{ color: "#9aa5b8", fontSize: "0.86rem", marginTop: 6 }}>{answerText}</div>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <StatusBadge tone={statusText === "Contradicted" ? "#ffb6b6" : statusText === "Manual review required" ? "#f9d976" : statusText === "Not applicable" ? "#d5dcec" : "#9bd7ff"}>{statusText}</StatusBadge>
              <StatusBadge tone="#a6f3c2">{sourceState}</StatusBadge>
              {safeArray(analystCard.primaryBadges).includes("Not scoring-active") ? <StatusBadge tone="#d5dcec">Not scoring-active</StatusBadge> : null}
              <StatusBadge tone="#f9d976">{impactBadge}</StatusBadge>
              <StatusBadge tone="#d5dcec">{isOpen ? "Collapse" : "Expand"}</StatusBadge>
            </div>
          </div>
        </button>
        {isOpen ? (
          <div style={{ borderTop: "1px solid rgba(148, 163, 184, 0.14)", padding: "1rem", display: "grid", gap: "0.85rem" }}>
            <SectionRow label="A. Direct answer" value={answerText} styles={styles} />
            <SectionRow label="B. Why it matters" value={analystCard.assetClassSpecificKeyIssue || whyItMatters(question, tokenomics.supplySummary?.lensId)} styles={styles} />
            <SectionRow label="Synthesis model" value={synthesized.synthesisTemplateId ? `${synthesized.synthesisTemplateId} | ${status(synthesized.evidenceStatus)}` : "No synthesized answer attached."} styles={styles} />
            <ListBlock title="C. Evidence / data basis" items={safeArray(analystCard.evidenceBasis).length ? analystCard.evidenceBasis : dataRows} emptyText="No data fields listed; source-required review remains." color="#d5dcec" styles={styles} />
            <ListBlock title="D. Formula / rule used" items={ruleRows} emptyText="No formula or rule linkage attached." color="#9bd7ff" styles={styles} />
            <ListBlock
              title="E. Evidence status"
              items={[
                `Answer status: ${statusText}`,
                `Source state: ${sourceState}`,
                synthesized.evidenceStatus ? `Synthesized status: ${status(synthesized.evidenceStatus)}` : null,
                ...safeArray(question.evidenceUsed).map((entry) => `Provider/evidence field: ${entry}`),
                ...reviewedFactRows.map((entry) => `Reviewed fact: ${entry}`),
                ...safeArray(analystCard.whatEvidenceDoesNotProve).map((entry) => `Does not prove: ${entry}`),
                ...safeArray(analystCard.sourceBoundaryPlainEnglish).map((entry) => `Boundary: ${entry}`),
                question.reviewedEvidenceStatus ? "Boundary: Reviewed demo evidence improves answer quality but is not scoring-active in v1." : null,
              ].filter(Boolean)}
              emptyText="No evidence status attached."
              color="#a6f3c2"
              styles={styles}
            />
            <ListBlock title="Reviewed sources used" items={reviewedSourceRows} emptyText="No reviewed evidence packet source mapped to this question." color="#a6f3c2" styles={styles} />
            <ListBlock title="Evidence mapping cautions" items={evidenceMappingWarningRows} emptyText="No evidence mapping caution attached." color="#f9d976" styles={styles} />
            <ListBlock title="F. Missing evidence" items={safeArray(analystCard.missingEvidence).length ? analystCard.missingEvidence : safeArray(synthesized.missingEvidence).length ? synthesized.missingEvidence : question.missingEvidence} emptyText="No missing evidence listed." color="#f9d976" styles={styles} />
            <SectionRow label="G. Decision / confidence impact" value={analystCard.decisionImpact || synthesized.impact || question.impactOnScoreOrConfidence || "Diagnostic/source requirement only; no new verdict impact inferred."} styles={styles} />
            <SectionRow label="Confidence boundary" value={analystCard.confidenceBoundary || "No scoring or verdict change is inferred from this display card."} styles={styles} />
            <ListBlock title="H. What would change" items={safeArray(analystCard.whatWouldChange).length ? analystCard.whatWouldChange : safeArray(synthesized.whatWouldChange).length ? synthesized.whatWouldChange : question.whatWouldChange} emptyText="No change requirement listed." color="#a6f3c2" styles={styles} />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Card title="Institutional Tokenomics Q&A" subtitle="Question-first accordion. Expand a row to inspect data, formula/rule logic, evidence status, impact, and what would change." styles={styles}>
      {questions.length ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {grouped.map((group) => {
            const manualCount = group.questions.filter((question) => String(question.answerStatus || "").includes("manual")).length;
            const sourceCount = group.questions.filter((question) => sourceStateForQuestion(question, formulas) === "source-required" || question.answerStatus === "evidence_missing").length;
            const notApplicableCount = group.questions.filter((question) => question.answerStatus === "not_applicable").length;
            return (
              <div key={group.id} style={{ display: "grid", gap: "0.65rem" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  padding: "0.85rem 0.2rem 0.2rem",
                }}>
                  <div>
                    <div style={{ color: "#f4f7fb", fontWeight: 900 }}>{group.title}</div>
                    <div style={{ color: "#8a94a6", fontSize: "0.82rem" }}>Answered: {group.questions.length} | source-required: {sourceCount} | manual-review: {manualCount} | not-applicable: {notApplicableCount}</div>
                  </div>
                </div>
                {group.questions.map(renderQuestion)}
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: "#8a94a6" }}>No tokenomics Q&A was attached. Evidence missing - source required.</p>
      )}
    </Card>
  );
}

function contextualNote(lensId) {
  switch (lensId) {
    case "BASE_LAYER_SETTLEMENT":
    case "NATIVE_MONETARY_BENCHMARK":
      return "Native/base-layer tokenomics should focus on issuance, burn, staking/miner incentives, security budget, and liveness. A missing EVM contract scan is not itself negative evidence.";
    case "DEFI_PROTOCOL_TOKEN":
    case "L2_GOVERNANCE_TOKEN":
      return "Protocol success does not automatically accrue to tokenholders; fee switch, fee routing, treasury, unlocks, and governance durability require source-backed review.";
    case "GAMING_METAVERSE_CONSUMER":
      return "Gaming/GameFi supply underwriting focuses on rewards versus sinks, emissions, unlocks, mintability, and active/paying user demand.";
    case "RWA_HYBRID_INFRASTRUCTURE":
      return "RWA infrastructure relevance is not legal/economic rights. Utility-token supply, cap mutability, canonical chain, migration, and fee/gas/staking demand require review.";
    case "STABLECOIN_SETTLEMENT":
      return "Stablecoin tokenomics is primarily mint/redeem, reserves, redemption, legal claim, issuer/custodian, and admin/freeze-control diligence.";
    case "WRAPPED_ASSET":
      return "Wrapped-asset supply integrity depends on backing, custodian/bridge controls, mint/burn, redemption, and proof-of-reserves.";
    case "LST_STAKING_DERIVATIVE":
      return "LST tokenomics depends on mint/burn, withdrawal queue, slashing/operator risk, depeg/liquidity, and protocol/admin controls.";
    case "MEME_NARRATIVE":
      return "Meme-asset tokenomics focuses on supply certainty, mint/admin controls, holder concentration, liquidity, and avoiding fake value-capture claims.";
    default:
      return "Tokenomics diligence is supply-integrity and dilution underwriting, not a retail utility checklist or price forecast.";
  }
}

export default function TokenomicsSupplyIntegrityTab({ model, asset, styles }) {
  const tokenomics = safeObject(model?.tokenomicsSupplyIntegrity);
  const identity = safeObject(model?.assetIdentityResolution);
  const lens = safeObject(model?.resolvedInstitutionalLens);

  if (!tokenomics.supplySummary && tokenomics.tokenomicsIntegrityScore === undefined) {
    return (
      <Card title="Tokenomics / Supply Integrity" subtitle="No tokenomics supply-integrity object is attached to this response." styles={styles}>
        <SectionRow label="Status" value="Unavailable - source-required tokenomics object not attached." styles={styles} />
      </Card>
    );
  }

  const providerContracts = compactList(tokenomics.providerContracts, (entry) => `${entry.provider}: ${entry.network || "network unavailable"} ${entry.contractAddress || "no contract"} (${entry.sourcePath || "source unavailable"})`);
  const knownContracts = compactList(identity.allKnownContracts, (entry) => `${entry.provider || "provider"}: ${entry.network || "network unavailable"} ${entry.contractAddress || "no contract"}`);
  const contractRows = knownContracts.length ? knownContracts : providerContracts;
  const selectedContractLine = identity.analyzedContract
    ? `${identity.analyzedNetwork || "network unavailable"} ${identity.analyzedContract}`
    : "No selected/analyzed contract attached";
  const primaryLensId = lens.lensId || tokenomics.supplySummary?.lensId;
  const scopeWarnings = [
    ...safeArray(identity.identityWarnings),
    ...safeArray(identity.chainWarnings),
    ...safeArray(identity.contractWarnings),
  ];

  return (
    <>
      <ExecutiveSummaryCard
        eyebrow="Tokenomics / Supply Integrity"
        title="What is the supply-integrity answer?"
        answer={tokenomics.explanationSummary || "Supply integrity is shown as a diagnostic underwriting layer. Exact provider numbers, formulas, and missing evidence remain available below."}
        tone="#9bd7ff"
        badges={[
          { label: tokenomics.tokenomicsIntegrityScore === null || tokenomics.tokenomicsIntegrityScore === undefined ? "Score unavailable" : `${tokenomics.tokenomicsIntegrityScore}/100 diagnostic`, tone: "#9bd7ff" },
          { label: `Evidence: ${status(tokenomics.evidenceConfidence)}`, tone: "#f9d976" },
          { label: "Not overall scoring", tone: "#d5dcec" },
        ]}
        styles={styles}
      >
        <FieldGrid>
          <MiniMetric label="Integrity score" value={tokenomics.tokenomicsIntegrityScore === null || tokenomics.tokenomicsIntegrityScore === undefined ? "Unavailable" : `${tokenomics.tokenomicsIntegrityScore}/100`} tone="#7dd3fc" />
          <MiniMetric label="Evidence confidence" value={status(tokenomics.evidenceConfidence)} />
          <MiniMetric label="Max supply status" value={status(tokenomics.maxSupplyStatus)} />
          <MiniMetric label="Unlock schedule" value={status(tokenomics.unlockScheduleStatus)} />
          <MiniMetric label="Mint authority" value={controlStatusLabel(tokenomics.mintAuthorityStatus, "mint", primaryLensId)} />
          <MiniMetric label="Admin controls" value={controlStatusLabel(tokenomics.adminControlStatus, "admin", primaryLensId)} />
          <MiniMetric label="Governance supply risk" value={status(tokenomics.governanceSupplyChangeRisk)} />
          <MiniMetric label="FDV / market cap" value={displayRatio(tokenomics.fdvMarketCapRatio)} />
          <MiniMetric label="Remaining dilution" value={displayPercent(tokenomics.remainingDilutionPercent)} />
        </FieldGrid>
        <SectionRow label="Primary tokenomics blocker" value={safeArray(tokenomics.hardBlockers)[0] || safeArray(tokenomics.softBlockers)[0] || safeArray(tokenomics.confidenceCaps)[0] || "No primary tokenomics blocker attached."} styles={styles} />
        <SectionRow label="Top positive signal" value={safeArray(tokenomics.positiveSignals)[0] || "No positive tokenomics signal attached."} styles={styles} />
        <SectionRow label="Top negative signal" value={safeArray(tokenomics.negativeSignals)[0] || "No negative tokenomics signal attached."} styles={styles} />
        <SectionRow label="Diagnostic boundary" value="tokenomicsIntegrityScore is diagnostic-only and does not change the current overall score or verdict." styles={styles} />
        <SectionRow label="Asset-class context" value={contextualNote(primaryLensId)} styles={styles} />
      </ExecutiveSummaryCard>

      <Card title="Key Risk Summary" subtitle="What matters most for this asset class before relying on tokenomics conclusions." styles={styles}>
        <ListBlock title="What matters most" items={keyRiskItems(primaryLensId)} emptyText="No lens-specific risk summary attached." color="#9bd7ff" styles={styles} />
        <ListBlock title="Primary review signals" items={[
          ...safeArray(tokenomics.manualReviewTriggers).slice(0, 3),
          ...safeArray(tokenomics.confidenceCaps).slice(0, 3),
          ...safeArray(tokenomics.neutralContextualSignals).slice(0, 2),
        ]} emptyText="No primary tokenomics review signal attached." color="#f9d976" styles={styles} />
      </Card>

      <TokenomicsQuestionPanel tokenomics={tokenomics} styles={styles} />

      <Card title="Key Numbers" subtitle="Exact normalized values and derived supply ratios from provider-reported fields." styles={styles}>
        <FieldGrid>
          <MiniMetric label="Current price" value={displayUsd(tokenomics.currentPrice)} />
          <MiniMetric label="Market cap" value={displayUsd(tokenomics.marketCap)} />
          <MiniMetric label="FDV" value={displayUsd(tokenomics.fdv)} />
          <MiniMetric label="24h volume" value={displayUsd(tokenomics.volume24h)} />
          <MiniMetric label="Circulating supply" value={displayNumber(tokenomics.circulatingSupply)} />
          <MiniMetric label="Total supply" value={displayNumber(tokenomics.totalSupply)} />
          <MiniMetric label="Max supply" value={displayNumber(tokenomics.maxSupplyValue)} />
          <MiniMetric label="Self-reported CMC supply" value={displayNumber(tokenomics.selfReportedCirculatingSupply)} />
          <MiniMetric label="Self-reported CMC market cap" value={displayUsd(tokenomics.selfReportedMarketCap)} />
          <MiniMetric label="Circulating % max" value={displayPercent(tokenomics.circulatingPercentOfMax)} />
          <MiniMetric label="Supply gap total-circ" value={displayNumber(tokenomics.supplyGapTotalMinusCirculating)} />
          <MiniMetric label="Supply gap max-circ" value={displayNumber(tokenomics.supplyGapMaxMinusCirculating)} />
          <MiniMetric label="FDV minus market cap" value={displayUsd(tokenomics.fdvMinusMarketCap)} />
          <MiniMetric label="Derived market cap" value={displayUsd(tokenomics.derivedMarketCap)} />
          <MiniMetric label="Derived FDV" value={displayUsd(tokenomics.derivedFdv)} />
        </FieldGrid>
        <SectionRow label="Market cap / FDV method" value={`${status(tokenomics.marketCapMethod)} / ${status(tokenomics.fdvMethod)}`} styles={styles} />
        <SectionRow label="Max supply method" value={status(tokenomics.maxSupplyMethod)} styles={styles} />
      </Card>

      <Card title="Source Requirements / What Would Change" subtitle="The shortest path to improving tokenomics confidence." styles={styles}>
        <ListBlock title="Top source requirements" items={safeArray(tokenomics.sourceRequirements).slice(0, 5)} emptyText="No tokenomics source requirements attached." color="#9bd7ff" styles={styles} />
        <ListBlock title="What would change" items={safeArray(tokenomics.whatWouldChange).slice(0, 5)} emptyText="No tokenomics change requirements attached." color="#a6f3c2" styles={styles} />
      </Card>

      <FormulaPanel tokenomics={tokenomics} styles={styles} />

      <CollapsibleDetail title="Future Dilution & Unlocks" subtitle="Missing unlock data is a confidence cap, not proof of no unlock risk." styles={styles} tone="#f9d976">
        <SectionRow label="Unlock schedule status" value={status(tokenomics.unlockScheduleStatus)} styles={styles} />
        <SectionRow label="Next unlock" value={`${tokenomics.nextUnlockDate || "Unknown date"} | ${displayPercent(tokenomics.nextUnlockPercent)} | ${displayUsd(tokenomics.nextUnlockUsdValue)}`} styles={styles} />
        <SectionRow label="Unlock / volume / liquidity / market cap" value={`${displayRatio(tokenomics.unlockToVolumeRatio)} / ${displayRatio(tokenomics.unlockToLiquidityRatio)} / ${displayDecimalPercent(tokenomics.unlockToMarketCap)}`} styles={styles} />
        <SectionRow label="Future dilution risk" value={status(tokenomics.futureDilutionRisk)} styles={styles} />
        <ListBlock title="Unlock source requirements" items={safeArray(tokenomics.sourceRequirements).filter((item) => /unlock|vesting|release|recipient|liquidity|dilution/i.test(item))} emptyText="No unlock-specific source requirement attached." color="#f9d976" styles={styles} />
      </CollapsibleDetail>

      <CollapsibleDetail title="Supply Control / Mutability" subtitle="Admin, mint, governance, migration, and contract-control risks require source-backed review." styles={styles} tone="#f9d976">
        <SectionRow label="Mint/admin/cap mutability" value={`${controlStatusLabel(tokenomics.mintAuthorityStatus, "mint", primaryLensId)} / ${controlStatusLabel(tokenomics.adminControlStatus, "admin", primaryLensId)} / ${status(tokenomics.capMutabilityStatus)}`} styles={styles} />
        <SectionRow label="Governance supply-change risk" value={status(tokenomics.governanceSupplyChangeRisk)} styles={styles} />
        <SectionRow label="Migration / representation" value={`${identity.migrationStatus || "Unknown"} / ${identity.representationType || "Unknown"}`} styles={styles} />
        <ListBlock title="Manual review triggers" items={tokenomics.manualReviewTriggers} emptyText="No tokenomics manual-review trigger attached." color="#f9d976" styles={styles} />
        <ListBlock title="Control source requirements" items={safeArray(tokenomics.sourceRequirements).filter((item) => /mint|admin|governance|contract|migration|cap|emission|proxy|authority/i.test(item))} emptyText="No control-specific source requirement attached." color="#9bd7ff" styles={styles} />
      </CollapsibleDetail>

      <CollapsibleDetail title="Emissions / Burn / Rewards" subtitle="Burns and rewards require materiality and source review before improving supply confidence." styles={styles} tone="#9bd7ff">
        <SectionRow label="Emission policy / annual inflation" value={`${status(tokenomics.emissionPolicyStatus)} / ${displayPercent(tokenomics.annualInflationEstimate)}`} styles={styles} />
        <SectionRow label="Annualized emissions / net issuance" value={`${displayNumber(tokenomics.annualizedEmissions)} / ${displayNumber(tokenomics.netIssuanceAfterBurn)}`} styles={styles} />
        <SectionRow label="Burn / materiality / buyback-burn" value={`${status(tokenomics.burnMechanismStatus)} / ${status(tokenomics.burnMateriality)} / ${status(tokenomics.buybackBurnStatus)}`} styles={styles} />
        <SectionRow label="Buyback/burn coverage" value={displayDecimalPercent(tokenomics.buybackBurnCoverage)} styles={styles} />
        <SectionRow label="Staking reward source / real yield vs subsidy" value={`${status(tokenomics.stakingRewardSource)} / ${status(tokenomics.realYieldVsSubsidyStatus)}`} styles={styles} />
      </CollapsibleDetail>

      <CollapsibleDetail title="Concentration / Treasury / Holder Risk" subtitle="Concentration metrics are shown only when current providers attach usable fields." styles={styles} tone="#9bd7ff">
        <SectionRow label="Insider / treasury / holder concentration risk" value={`${status(tokenomics.insiderAllocationRisk)} / ${status(tokenomics.treasurySupplyRisk)} / ${status(tokenomics.holderConcentrationRisk)}`} styles={styles} />
        <SectionRow label="Top wallet concentration" value={displayPercent(tokenomics.topWalletConcentration)} styles={styles} />
        <SectionRow label="Treasury / vesting recipient concentration" value={`${displayDecimalPercent(tokenomics.treasurySupplyConcentration)} / ${displayDecimalPercent(tokenomics.vestingRecipientConcentration)}`} styles={styles} />
        <ListBlock title="Concentration source requirements" items={safeArray(tokenomics.sourceRequirements).filter((item) => /treasury|foundation|insider|wallet|recipient|holder/i.test(item))} emptyText="No concentration-specific source requirement attached." color="#f9d976" styles={styles} />
      </CollapsibleDetail>

      <CollapsibleDetail title="Absorption Capacity / Liquidity Context" subtitle="Dilution materiality depends on unlock timing, liquidity, volume, market cap, and demand absorption." styles={styles} tone="#9bd7ff">
        <SectionRow label="24h volume / volume-market-cap" value={`${displayUsd(tokenomics.volume24h)} / ${displayDecimalPercent(tokenomics.volumeMarketCapRatio)}`} styles={styles} />
        <SectionRow label="Unlock / volume / liquidity / market cap" value={`${displayRatio(tokenomics.unlockToVolumeRatio)} / ${displayRatio(tokenomics.unlockToLiquidityRatio)} / ${displayDecimalPercent(tokenomics.unlockToMarketCap)}`} styles={styles} />
        <ListBlock title="Demand absorption notes" items={safeArray(tokenomics.neutralContextualSignals).concat(safeArray(tokenomics.negativeSignals).filter((item) => /demand|liquidity|volume|absorption|FDV/i.test(item)))} emptyText="No absorption-capacity note attached." color="#d5dcec" styles={styles} />
      </CollapsibleDetail>

      <CollapsibleDetail title="Tokenholder Accrual / Rights" subtitle="The engine separates tokenholder economic rights from provider category, narrative, or protocol adoption." styles={styles} tone="#9bd7ff">
        <SectionRow label="Value capture / token necessity" value={`${status(tokenomics.tokenholderValueCaptureStatus)} / ${status(tokenomics.tokenNecessityStatus)}`} styles={styles} />
        <SectionRow label="Accrual / fee revenue / protocol revenue ratios" value={`${displayDecimalPercent(tokenomics.tokenholderAccrualRatio)} / ${displayDecimalPercent(tokenomics.feeRevenueCaptureRatio)} / ${displayRatio(tokenomics.protocolRevenueToTokenValue)}`} styles={styles} />
        <SectionRow label="Staking / real yield vs subsidy" value={`${status(tokenomics.stakingRewardSource)} / ${status(tokenomics.realYieldVsSubsidyStatus)}`} styles={styles} />
        <ListBlock title="Accrual source requirements" items={safeArray(tokenomics.sourceRequirements).filter((item) => /fee|revenue|accrual|buyback|burn|staking|rights|claim|yield/i.test(item))} emptyText="No tokenholder-accrual source requirement attached." color="#9bd7ff" styles={styles} />
      </CollapsibleDetail>

      <CollapsibleDetail title="Canonical Asset / Contract Scope" subtitle="Supply calculations depend on the selected asset, analyzed network, and representation boundary." styles={styles} tone="#d5dcec">
        <SectionRow label="Canonical asset" value={`${identity.canonicalAssetName || tokenomics.supplySummary?.canonicalAsset || asset?.name || "Unavailable"} (${identity.canonicalAssetSymbol || asset?.symbol || "Unavailable"})`} styles={styles} />
        <SectionRow label="Provider IDs" value={`CoinGecko: ${identity.canonicalProviderIds?.coingeckoId || asset?.coingeckoId || "Unavailable"} | CMC: ${identity.canonicalProviderIds?.coinmarketcapId || asset?.coinmarketcapId || "Unavailable"}`} styles={styles} />
        <SectionRow label="Canonical/native network candidate" value={identity.canonicalNetworkCandidate || identity.nativeNetworkCandidate || "Unavailable"} styles={styles} />
        <SectionRow label="Selected/analyzed network" value={`${identity.selectedNetwork || "Unavailable"} / ${identity.analyzedNetwork || "Unavailable"}`} styles={styles} />
        <SectionRow label="Selected/analyzed contract" value={`${identity.selectedContract || "Not applicable"} / ${identity.analyzedContract || "Not applicable"}`} styles={styles} />
        <SectionRow label="Representation type" value={identity.representationType === "issuer_native_multichain_stablecoin" ? "issuer-native multichain stablecoin" : identity.representationType || "Unknown"} styles={styles} />
        <SectionRow label="Native / EVM / multichain / migrated" value={`native=${identity.isNativeAsset === undefined ? "unknown" : identity.isNativeAsset ? "yes" : "no"}; evm=${identity.isEvmContractAsset === undefined ? "unknown" : identity.isEvmContractAsset ? "yes" : "no"}; multichain=${identity.isMultichain === undefined ? "unknown" : identity.isMultichain ? "yes" : "no"}; migration=${identity.migrationStatus || "unknown"}`} styles={styles} />
        <SectionRow label="Wrong-asset risk" value={identity.wrongAssetRisk || "Unknown"} styles={styles} />
        <SectionRow label="Contract scan applicability" value={identity.contractScanApplicability || "Unknown"} styles={styles} />
        <SectionRow label="Selected/analyzed contract" value={selectedContractLine} styles={styles} />
        <SectionRow label="Known provider contract count" value={contractRows.length ? `${contractRows.length} mappings attached` : "No provider contract mappings attached"} styles={styles} />
        <ListBlock title="Top provider contract mappings" items={contractRows.slice(0, 5)} emptyText="No provider contract mappings attached." color="#9bd7ff" styles={styles} />
        {contractRows.length > 5 ? (
          <details style={{ marginTop: 12 }}>
            <summary style={{ color: "#9bd7ff", cursor: "pointer", fontWeight: 800 }}>View all provider contract mappings ({contractRows.length})</summary>
            <ListBlock title="All provider contract mappings" items={contractRows} emptyText="No provider contract mappings attached." color="#d5dcec" styles={styles} />
          </details>
        ) : null}
        <SectionRow label="Contract mapping boundary" value="Provider contract mappings require official supported-network verification." styles={styles} />
        <ListBlock title="Identity warnings / source requirements" items={[...scopeWarnings, ...safeArray(identity.sourceRequirements)]} emptyText="No identity warning attached." color="#f9d976" styles={styles} />
      </CollapsibleDetail>

      <ProviderComparison tokenomics={tokenomics} styles={styles} />

      <Card title="Score Logic / Caps / Gates" subtitle="These are tokenomics module signals; they do not replace the current overall scoring model." styles={styles}>
        <SectionRow label="Diagnostic integrity score" value={tokenomics.tokenomicsIntegrityScore === null || tokenomics.tokenomicsIntegrityScore === undefined ? "Unavailable" : `${tokenomics.tokenomicsIntegrityScore}/100`} styles={styles} />
        <SectionRow label="Evidence confidence" value={status(tokenomics.evidenceConfidence)} styles={styles} />
        <ListBlock title="Hard blockers" items={tokenomics.hardBlockers} emptyText="No tokenomics hard blocker attached." color="#ffb6b6" styles={styles} />
        <ListBlock title="Soft blockers" items={tokenomics.softBlockers} emptyText="No tokenomics soft blocker attached." color="#f9d976" styles={styles} />
        <ListBlock title="Score caps" items={tokenomics.scoreCaps} emptyText="No tokenomics score cap attached." color="#f9d976" styles={styles} />
        <ListBlock title="Confidence caps" items={tokenomics.confidenceCaps} emptyText="No tokenomics confidence cap attached." color="#f9d976" styles={styles} />
        <ListBlock title="Positive signals" items={tokenomics.positiveSignals} emptyText="No positive tokenomics signal attached." color="#a6f3c2" styles={styles} />
        <ListBlock title="Negative signals" items={tokenomics.negativeSignals} emptyText="No negative tokenomics signal attached." color="#ffb6b6" styles={styles} />
        <ListBlock title="Neutral/contextual signals" items={tokenomics.neutralContextualSignals} emptyText="No contextual tokenomics signal attached." color="#d5dcec" styles={styles} />
        <SectionRow label="Institutional target model" value="Doctrine only: supply integrity, control/mutability, dilution path, concentration/treasury, absorption capacity, and tokenholder accrual. Not claimed as active backend weights." styles={styles} />
      </Card>

      <CollapsibleDetail title="Audit Boundary / Reproducibility" subtitle="Compact audit-critical provenance. Full raw object remains in Audit / Raw." styles={styles} tone="#8a94a6">
        <ListBlock title="Provider field audit" items={compactList(tokenomics.providerFieldAudit, (entry) => `${entry.provider}: available=${safeArray(entry.fieldsAvailable).join(", ") || "none"}; missing=${safeArray(entry.fieldsMissing).join(", ") || "none"}; timestamp=${entry.timestamp || "unavailable"}`)} emptyText="No provider field audit attached." color="#d5dcec" styles={styles} />
        <ListBlock title="Provider timestamps" items={compactList(tokenomics.providerTimestamps, (entry) => `${entry.provider}: ${entry.timestamp || "Unavailable"} (${entry.sourcePath || "source unavailable"})`)} emptyText="No provider timestamps attached." color="#d5dcec" styles={styles} />
        <ListBlock title="Source contradictions" items={tokenomics.sourceContradictions} emptyText="No source contradiction attached." color="#ffb6b6" styles={styles} />
        <ListBlock title="Provider disagreements" items={tokenomics.providerDisagreements} emptyText="No provider disagreement attached." color="#f9d976" styles={styles} />
        <ListBlock title="Source boundary" items={tokenomics.sourceBoundary} emptyText="No tokenomics source boundary attached." color="#9bd7ff" styles={styles} />
        <SectionRow label="Raw audit availability" value={Object.keys(safeObject(tokenomics.auditRawFields)).length ? "Raw tokenomics audit fields available in Audit / Raw and Review Bundle." : "No raw tokenomics audit object attached."} styles={styles} />
      </CollapsibleDetail>
    </>
  );
}
