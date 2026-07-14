import React, { useState } from "react";
import { Card, CollapsibleDetail, ExecutiveSummaryCard, ListBlock, SectionRow } from "./researchPrimitives";
import { cleanPrimaryAnswerText, formatPct, formatUsd, getAnalystAnswerCard, safeArray, safeObject, titleCase } from "./researchUtils";

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
  const supplyTruth = safeObject(tokenomics.supplyTruth);
  const canonicalFacts = safeObject(supplyTruth.canonicalFacts);
  const rawFacts = safeArray(supplyTruth.rawProviderFacts);
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

  if (!snapshots.length && !rawFacts.length) {
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
      <ListBlock
        title="Canonical selections"
        items={Object.values(canonicalFacts).map((fact) => fact?.field ? `${fact.field}: ${displayNumber(fact.value)}; provider=${fact.selectedProvider || "compatibility fallback"}; method=${fact.selectionMethod || "unavailable"}; reason=${fact.selectionReason || "not attached"}` : null).filter(Boolean)}
        emptyText="No canonical Supply Truth selection was attached."
        color="#a6f3c2"
        styles={styles}
      />
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
      <ListBlock
        title="Provider disagreements"
        items={(safeArray(supplyTruth.providerDisagreements).length ? safeArray(supplyTruth.providerDisagreements) : safeArray(tokenomics.providerDisagreements)).map((entry) => typeof entry === "string" ? entry : `${entry.field}: ${entry.leftProvider}=${displayNumber(entry.leftValue)} vs ${entry.rightProvider}=${displayNumber(entry.rightValue)}; relative difference=${displayDecimalPercent(entry.relativeDifference)}; material=${entry.material ? "yes" : "no"}; reconciliation=${entry.reconciliationStatus || "unavailable"}`)}
        emptyText="No material comparable-scope provider disagreement was attached."
        color="#f9d976"
        styles={styles}
      />
      <ListBlock
        title="Supply contradictions"
        items={safeArray(supplyTruth.contradictions).map((entry) => `${entry.type}: ${entry.explanation}; values=${safeArray(entry.values).map(displayNumber).join(" / ")}; provider=${entry.provider}`)}
        emptyText="No arithmetic supply contradiction was attached."
        color="#ffb6b6"
        styles={styles}
      />
      <ListBlock title="Provider scope notes" items={tokenomics.providerScopeNotes} emptyText="No cross-scope provider note was attached." color="#d5dcec" styles={styles} />
      <ListBlock
        title="Liquidity / Pair Context"
        items={compactList(localRows, (entry) => `${entry.provider} ${entry.field}: ${entry.field?.toLowerCase().includes("supply") ? displayNumber(entry.value) : displayUsd(entry.value)} (${entry.sourcePath}; ${entry.scope})`)}
        emptyText="No pair-level liquidity context attached."
        color="#9bd7ff"
        styles={styles}
      />
      {rawFacts.length ? (
        <details style={{ marginTop: 14 }}>
          <summary style={{ color: "#9bd7ff", cursor: "pointer", fontWeight: 800 }}>View raw provider supply facts ({rawFacts.length})</summary>
          <ListBlock
            title="Raw provider facts"
            items={rawFacts.map((fact) => `${fact.provider}.${fact.field}: raw=${displayNumber(fact.rawValue)}; normalized=${displayNumber(fact.normalizedValue)}; unit=${fact.unit || "unavailable"}; role=${fact.role}; freshness=${fact.freshnessStatus}; validation=${fact.validationState}; path=${fact.rawPath}`)}
            emptyText="No raw provider facts attached."
            color="#d5dcec"
            styles={styles}
          />
        </details>
      ) : null}
    </Card>
  );
}

function FormulaPanel({ tokenomics, styles }) {
  const formulas = safeArray(tokenomics.supplyTruth?.calculatedMetrics).length
    ? safeArray(tokenomics.supplyTruth.calculatedMetrics)
    : safeArray(tokenomics.formulaOutputs);
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
          <SectionRow label={formula.label || "Formula"} value={formula.displayedValue || formula.display || "Unavailable"} styles={styles} />
          <SectionRow label="Formula" value={formula.formula || "Unavailable"} styles={styles} />
          <SectionRow label="Status / applicability" value={`${status(formula.status)} / ${status(formula.applicability)}`} styles={styles} />
          <SectionRow label="Method / owner" value={`${status(formula.method)} / ${formula.canonicalOwner || "Backend owner unavailable"}`} styles={styles} />
          <ListBlock
            title="Inputs"
            items={compactList(formula.inputs, (entry) => `${entry.name}: ${displayNumber(entry.rawValue ?? entry.value)} ${entry.unit || "unit unavailable"}; provider=${entry.provider || "derived/fallback"}; freshness=${entry.freshnessStatus || "unknown"}; validation=${entry.validationState || "unknown"}; source=${entry.sourcePath || "source unavailable"}`)}
            emptyText="No formula inputs attached."
            color="#d5dcec"
            styles={styles}
          />
          <ListBlock title="Missing inputs" items={formula.missingInputs} emptyText="No missing inputs for this formula." color="#f9d976" styles={styles} />
          <ListBlock title="Invalid inputs / limitations" items={[...safeArray(formula.invalidInputs), ...safeArray(formula.limitations)]} emptyText="No invalid input or formula limitation attached." color="#f9d976" styles={styles} />
          {formula.discrepancy ? <SectionRow label="Provider/calculated discrepancy" value={`absolute=${displayNumber(formula.discrepancy.absoluteDifference)}; relative=${displayDecimalPercent(formula.discrepancy.relativeDifference)}; material=${formula.discrepancy.material ? "yes" : "no"}`} styles={styles} /> : null}
          <SectionRow label="Denominator / rounding" value={`${status(formula.denominatorStatus)} / ${formula.roundingPolicy || "Display-only rounding policy unavailable"}`} styles={styles} />
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

function whyItMatters(question, tokenomics) {
  return question?.whyItMatters
    || tokenomics?.supplyTruth?.applicability?.familyPolicySummary
    || "This question connects the attached supply facts and formula trace to a bounded institutional diligence conclusion.";
}

function valueFromPath(tokenomics, path) {
  if (!path || typeof path !== "string") return null;
  const canonicalFieldAliases = {
    currentPrice: "currentPrice",
    marketCap: "marketCap",
    fdv: "fdv",
    volume24h: "volume24h",
    circulatingSupply: "circulatingSupply",
    totalSupply: "totalSupply",
    maxSupplyValue: "maxSupply",
  };
  if (canonicalFieldAliases[path]) {
    const canonicalValue = tokenomics?.supplyTruth?.canonicalFacts?.[canonicalFieldAliases[path]]?.value;
    if (canonicalValue !== null && canonicalValue !== undefined) return canonicalValue;
  }
  const formulaAliases = {
    fdvMarketCapRatio: ["fdv_market_cap_ratio", 1],
    circulatingPercentOfMax: ["circulating_percent_of_max", 100],
    remainingDilutionPercent: ["remaining_dilution", 100],
    supplyGapTotalMinusCirculating: ["supply_gap_total_minus_circulating", 1],
    supplyGapMaxMinusCirculating: ["max_supply_gap", 1],
    fdvMinusMarketCap: ["fdv_minus_market_cap", 1],
    volumeMarketCapRatio: ["volume_market_cap_ratio", 1],
  };
  if (formulaAliases[path]) {
    const [formulaId, multiplier] = formulaAliases[path];
    const formula = safeArray(tokenomics?.supplyTruth?.calculatedMetrics).find((entry) => entry?.formulaId === formulaId);
    if (formula?.rawResult !== null && formula?.rawResult !== undefined) return formula.rawResult * multiplier;
  }
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
    const reviewedSourceRows = (safeArray(synthesized.reviewedSourcesUsed).length ? safeArray(synthesized.reviewedSourcesUsed) : safeArray(question.reviewedSourcesUsed)).map((source) => cleanPrimaryAnswerText(`${source.title || "Reviewed source"} (${source.publisher || "publisher unavailable"}) - ${source.freshnessStatus || "freshness unknown"} - ${source.scoringEligible ? "score-integrated" : "explanation support"} - ${source.url || "URL unavailable"}`));
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
            ? `Backend rule-based answer: ${question.ruleUsed || tokenomics.supplyTruth?.applicability?.familyPolicySummary || "family methodology attached"}.`
            : question.answerStatus === "not_applicable"
              ? `Not applicable for this asset class. ${displayQuestionAnswer(question) || tokenomics.supplyTruth?.applicability?.notApplicableRedirects?.[0] || "Use the family-specific alternative."}`
              : `Backend rule-based answer. ${question.ruleUsed || tokenomics.supplyTruth?.applicability?.familyPolicySummary || "No formula applies to this question."}`,
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
              {safeArray(analystCard.primaryBadges).includes("Not scoring-active") ? <StatusBadge tone="#d5dcec">Explanation context</StatusBadge> : null}
              <StatusBadge tone="#f9d976">{impactBadge}</StatusBadge>
              <StatusBadge tone="#d5dcec">{isOpen ? "Collapse" : "Expand"}</StatusBadge>
            </div>
          </div>
        </button>
        {isOpen ? (
          <div style={{ borderTop: "1px solid rgba(148, 163, 184, 0.14)", padding: "1rem", display: "grid", gap: "0.85rem" }}>
            <SectionRow label="A. Direct answer" value={answerText} styles={styles} />
            <SectionRow label="B. Why it matters" value={analystCard.assetClassSpecificKeyIssue || whyItMatters(question, tokenomics)} styles={styles} />
            <SectionRow label="Answer support" value={synthesized.synthesisTemplateId ? cleanPrimaryAnswerText(status(synthesized.evidenceStatus)) : "No structured answer attached."} styles={styles} />
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
                question.reviewedEvidenceStatus ? "Boundary: Reviewed evidence improves answer quality; score integration requires a calibrated release." : null,
              ].filter(Boolean)}
              emptyText="No evidence status attached."
              color="#a6f3c2"
              styles={styles}
            />
            <ListBlock title="Reviewed sources used" items={reviewedSourceRows} emptyText="No reviewed evidence packet source mapped to this question." color="#a6f3c2" styles={styles} />
            <ListBlock title="Evidence mapping cautions" items={evidenceMappingWarningRows} emptyText="No evidence mapping caution attached." color="#f9d976" styles={styles} />
            <ListBlock title="F. Missing evidence" items={safeArray(analystCard.missingEvidence).length ? analystCard.missingEvidence : safeArray(synthesized.missingEvidence).length ? synthesized.missingEvidence : question.missingEvidence} emptyText="No missing evidence listed." color="#f9d976" styles={styles} />
            <SectionRow label="G. Decision / confidence impact" value={cleanPrimaryAnswerText(analystCard.decisionImpact || synthesized.impact || question.impactOnScoreOrConfidence || "Review/source requirement only; no new verdict impact inferred.")} styles={styles} />
            <SectionRow label="Confidence boundary" value={cleanPrimaryAnswerText(analystCard.confidenceBoundary || "This display explains confidence; numerical score integration requires a calibrated release.")} styles={styles} />
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

export default function TokenomicsSupplyIntegrityTab({ model, asset, styles }) {
  const tokenomics = safeObject(model?.tokenomicsSupplyIntegrity);
  const supplyTruth = safeObject(tokenomics.supplyTruth);
  const canonicalFacts = safeObject(supplyTruth.canonicalFacts);
  const calculatedMetrics = safeArray(supplyTruth.calculatedMetrics).length
    ? safeArray(supplyTruth.calculatedMetrics)
    : safeArray(tokenomics.formulaOutputs);
  const identity = safeObject(model?.assetIdentityResolution);
  const lens = safeObject(model?.resolvedInstitutionalLens);
  const finalComposer = safeObject(model?.finalAnalystAnswerComposerContract);
  const composerAvailable = finalComposer?.contractAttached === true;

  if (!supplyTruth.methodologyVersion && !tokenomics.supplySummary && tokenomics.tokenomicsIntegrityScore === undefined) {
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
  const canonicalValue = (field, fallback) => {
    const value = canonicalFacts?.[field]?.value;
    return value === null || value === undefined ? fallback : value;
  };
  const formula = (formulaId) => calculatedMetrics.find((entry) => entry?.formulaId === formulaId) || null;
  const formulaDisplay = (formulaId, fallback = "Unavailable") => {
    const selected = formula(formulaId);
    return selected?.displayedValue || selected?.display || fallback;
  };
  const familyPolicySummary = supplyTruth.applicability?.familyPolicySummary
    || "Supply analysis is bounded to the canonical family and selected representation attached by the backend.";
  const primaryDiligenceQuestions = safeArray(supplyTruth.applicability?.primaryDiligenceQuestions);
  const providerRawDataExpansion = model?.providerRawDataExpansion || {};
  const rawDataCoverage = model?.rawDataCoverageDiagnostics || providerRawDataExpansion.rawDataCoverageDiagnostics || {};
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
        answer={supplyTruth.statusSummary || tokenomics.explanationSummary || "Supply integrity is unavailable for the current response."}
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
          <MiniMetric label="Max supply semantics" value={status(supplyTruth.maxSupplySemantics?.semanticClassification || tokenomics.maxSupplyStatus)} />
          <MiniMetric label="Unlock schedule" value={status(tokenomics.unlockScheduleStatus)} />
          <MiniMetric label="Mint authority" value={controlStatusLabel(tokenomics.mintAuthorityStatus, "mint", primaryLensId)} />
          <MiniMetric label="Admin controls" value={controlStatusLabel(tokenomics.adminControlStatus, "admin", primaryLensId)} />
          <MiniMetric label="Governance supply risk" value={status(tokenomics.governanceSupplyChangeRisk)} />
          <MiniMetric label="FDV / market cap" value={formulaDisplay("fdv_market_cap_ratio", displayRatio(tokenomics.fdvMarketCapRatio))} />
          <MiniMetric label="Remaining dilution" value={formulaDisplay("remaining_dilution", displayPercent(tokenomics.remainingDilutionPercent))} />
        </FieldGrid>
        <SectionRow label="Primary tokenomics blocker" value={safeArray(tokenomics.hardBlockers)[0] || safeArray(tokenomics.softBlockers)[0] || safeArray(tokenomics.confidenceCaps)[0] || "No primary tokenomics blocker attached."} styles={styles} />
        <SectionRow label="Top positive signal" value={safeArray(tokenomics.positiveSignals)[0] || "No positive tokenomics signal attached."} styles={styles} />
        <SectionRow label="Top negative signal" value={safeArray(tokenomics.negativeSignals)[0] || "No negative tokenomics signal attached."} styles={styles} />
        <SectionRow label="Diagnostic boundary" value="tokenomicsIntegrityScore is diagnostic-only and does not change the current overall score or verdict." styles={styles} />
        <SectionRow label="Asset-family context" value={familyPolicySummary} styles={styles} />
        <SectionRow label="Supply Truth status / freshness" value={`${status(supplyTruth.status)} / ${status(supplyTruth.freshnessSummary?.overall)}`} styles={styles} />
      </ExecutiveSummaryCard>

      <Card title="Key Risk Summary" subtitle="What matters most for this asset class before relying on tokenomics conclusions." styles={styles}>
        <ListBlock title="What matters most" items={primaryDiligenceQuestions} emptyText="No backend family-specific diligence questions were attached." color="#9bd7ff" styles={styles} />
        <ListBlock title="Primary review signals" items={[
          ...safeArray(tokenomics.manualReviewTriggers).slice(0, 3),
          ...safeArray(tokenomics.confidenceCaps).slice(0, 3),
          ...safeArray(tokenomics.neutralContextualSignals).slice(0, 2),
        ]} emptyText="No primary tokenomics review signal attached." color="#f9d976" styles={styles} />
      </Card>

      <TokenomicsQuestionPanel tokenomics={tokenomics} styles={styles} />

      <Card title="Key Numbers" subtitle="Canonical provider facts and backend-calculated metrics for the selected representation." styles={styles}>
        <FieldGrid>
          <MiniMetric label="Current price" value={displayUsd(canonicalValue("currentPrice", tokenomics.currentPrice))} />
          <MiniMetric label="Market cap" value={displayUsd(canonicalValue("marketCap", tokenomics.marketCap))} />
          <MiniMetric label="FDV" value={displayUsd(canonicalValue("fdv", tokenomics.fdv))} />
          <MiniMetric label="24h volume" value={displayUsd(canonicalValue("volume24h", tokenomics.volume24h))} />
          <MiniMetric label="Circulating supply" value={displayNumber(canonicalValue("circulatingSupply", tokenomics.circulatingSupply))} />
          <MiniMetric label="Total supply" value={displayNumber(canonicalValue("totalSupply", tokenomics.totalSupply))} />
          <MiniMetric label="Max supply" value={displayNumber(canonicalValue("maxSupply", tokenomics.maxSupplyValue))} />
          <MiniMetric label="Self-reported CMC supply" value={displayNumber(tokenomics.selfReportedCirculatingSupply)} />
          <MiniMetric label="Self-reported CMC market cap" value={displayUsd(tokenomics.selfReportedMarketCap)} />
          <MiniMetric label="Circulating % max" value={formulaDisplay("circulating_percent_of_max", displayPercent(tokenomics.circulatingPercentOfMax))} />
          <MiniMetric label="Supply gap total-circ" value={formulaDisplay("supply_gap_total_minus_circulating", displayNumber(tokenomics.supplyGapTotalMinusCirculating))} />
          <MiniMetric label="Supply gap max-circ" value={formulaDisplay("max_supply_gap", displayNumber(tokenomics.supplyGapMaxMinusCirculating))} />
          <MiniMetric label="FDV minus market cap" value={formulaDisplay("fdv_minus_market_cap", displayUsd(tokenomics.fdvMinusMarketCap))} />
          <MiniMetric label="Calculated market cap" value={formulaDisplay("market_cap_price_times_circulating", displayUsd(tokenomics.derivedMarketCap))} />
          <MiniMetric label="Calculated FDV" value={formulaDisplay("fdv_price_times_max_supply", displayUsd(tokenomics.derivedFdv))} />
        </FieldGrid>
        <SectionRow label="Market cap selection" value={canonicalFacts.marketCap?.selectionReason || status(tokenomics.marketCapMethod)} styles={styles} />
        <SectionRow label="FDV selection" value={canonicalFacts.fdv?.selectionReason || status(tokenomics.fdvMethod)} styles={styles} />
        <SectionRow label="Max supply status / applicability" value={`${status(supplyTruth.maxSupplySemantics?.rawValueStatus || tokenomics.maxSupplyMethod)} / ${status(supplyTruth.maxSupplySemantics?.formulaApplicability)}`} styles={styles} />
      </Card>

      {providerRawDataExpansion.artifactVersion ? (
        <Card title="Provider Raw Data Context" subtitle="Category endpoint and peer context are provider-reported diagnostics, not reviewed evidence." styles={styles}>
          <FieldGrid>
            <MiniMetric label="Raw data coverage" value={rawDataCoverage.overallRawDataCoverageScore === undefined ? "Unavailable" : `${rawDataCoverage.overallRawDataCoverageScore}/100`} />
            <MiniMetric label="Category coverage" value={providerRawDataExpansion.categoryDataCoverage || "Unavailable"} />
            <MiniMetric label="Category peers" value={providerRawDataExpansion.categoryPeerMarketStats?.peerCount ?? 0} />
            <MiniMetric label="CG category endpoint" value={providerRawDataExpansion.coinGeckoCategoryUniverse?.status || "Unavailable"} />
            <MiniMetric label="CMC category endpoint" value={providerRawDataExpansion.coinMarketCapCategoryUniverse?.status || "Unavailable"} />
            <MiniMetric label="Primary category mcap" value={displayUsd(providerRawDataExpansion.primaryCategoryMarketContext?.marketCap)} />
          </FieldGrid>
          <ListBlock title="Raw-data source requirements" items={safeArray(providerRawDataExpansion.categoryDataSourceRequirements).slice(0, 5)} emptyText="No raw-data source requirement attached." color="#f9d976" styles={styles} />
          <SectionRow label="Boundary" value="Provider endpoint data can improve context and source requirements, but it is not reviewed evidence and does not change the current overall score or verdict." styles={styles} />
        </Card>
      ) : null}

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
