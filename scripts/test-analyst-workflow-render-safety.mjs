import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const [
    { default: DecisionHeroCard },
    { default: AnalysisRightRail },
    { default: EvidenceMapTab },
    { default: InstitutionalChecklistTab },
    { default: ManualReviewPanel },
    { default: ScoringTransparencyTab },
    { default: SourceQueuePanel },
    { default: TokenomicsSupplyIntegrityTab },
    researchUtils,
  ] = await Promise.all([
    server.ssrLoadModule("/src/components/research/DecisionHeroCard.jsx"),
    server.ssrLoadModule("/src/components/research/AnalysisRightRail.jsx"),
    server.ssrLoadModule("/src/components/research/EvidenceMapTab.jsx"),
    server.ssrLoadModule("/src/components/research/InstitutionalChecklistTab.jsx"),
    server.ssrLoadModule("/src/components/research/ManualReviewPanel.jsx"),
    server.ssrLoadModule("/src/components/research/ScoringTransparencyTab.jsx"),
    server.ssrLoadModule("/src/components/research/SourceQueuePanel.jsx"),
    server.ssrLoadModule("/src/components/research/TokenomicsSupplyIntegrityTab.jsx"),
    server.ssrLoadModule("/src/components/research/researchUtils.js"),
  ]);

  const workflow = {
    artifactVersion: "institutional-analyst-workflow-v1",
    contractStatus: "complete",
    workflowCompletenessStatus: "partial",
    autonomousQuestionAnswers: [],
    moduleScoringReadiness: [],
    confidenceCapDrivers: [],
    missingData: ["Current institutional input"],
    investmentResearchMemo: { thesis: "Workflow thesis", executiveSummary: "Workflow summary" },
  };
  const baseModel = {
    allocationOutcome: { key: "evidence_blocked", label: "Evidence blocked" },
    verdictSemantics: { summary: "Current evidence is incomplete." },
    assetBadges: [],
  };
  const atomicDecision = ({ displayable, displayMode, eligibility, finalClass, finalLabel }) => ({
    audit: {
      calculationVersion: "final-decision-atomic-v1",
      inputOwners: { finalDecision: "decisionLayer" },
      legacyCandidate: finalClass === "not_allocation_ready"
        ? { verdictClass: "investable_medium_confidence", verdictLabel: "Investable - Medium Confidence", posture: "constructive_but_needs_confirmation" }
        : null,
    },
    score: {
      internalValue: 73,
      displayable,
      displayMode,
      displayValue: displayable ? 73 : null,
      withholdingReason: displayable ? null : "Final coverage and eligibility do not permit institutional score display.",
    },
    coverage: { tier: "tier_2_family_checklist_partial", label: "Family checklist partial", limitations: ["Current evidence remains incomplete."] },
    eligibility: { status: eligibility, blocked: !["eligible", "partially_eligible"].includes(eligibility), blockers: ["Current evidence remains incomplete."], reasons: ["Attach current evidence."] },
    manualReview: { required: !displayable, blocking: !displayable, reasons: displayable ? [] : ["Review current evidence."], productLanguage: displayable ? "No blocking review." : "Critical requirements must be resolved before an allocation-ready conclusion is permitted." },
    verdict: { candidateClass: "investable_medium_confidence", candidateLabel: "Investable - Medium Confidence", finalClass, finalLabel, posture: displayable ? "constructive_but_needs_confirmation" : "watchlist", explanation: displayable ? "Final inputs permit the existing allocation-ready candidate." : "The final state is not allocation-ready because the score is withheld.", reconciliationReason: displayable ? null : "score_not_displayable" },
    verdictClass: finalClass,
    verdictLabel: finalLabel,
    posture: { label: displayable ? "constructive_but_needs_confirmation" : "watchlist", summary: "Final posture.", reasonCodes: [], blockerTypes: [], supportReasonCodes: [] },
    currentState: { label: "underverified", secondaryLabels: [], summary: "Final state.", reasonCodes: [] },
    verdictReasons: { positiveThesisEvidence: [], realBlockers: [], evidenceGaps: [], reviewOnlyCautions: [], notApplicableItems: [], whatWouldChangeDecision: [] },
    allocationCase: { forAllocation: [], againstAllocation: [], missingEvidence: [], whatWouldChange: [] },
    prioritySignals: { support: [], risk: [], unknown: [], trigger: [] },
    decisionFrame: { whyNow: [], whyNotNow: [], whatMustBeTrue: [], whatCouldBreak: [], nextCheckpoints: [] },
    researchRequirements: [],
  });
  const blockedDecision = atomicDecision({
    displayable: false,
    displayMode: "manual_review_no_score",
    eligibility: "blocked_manual_review",
    finalClass: "not_allocation_ready",
    finalLabel: "Not Allocation-Ready",
  });
  const blockedTerminalModel = researchUtils.buildDecisionTerminalModel({
    analysis: { decisionLayer: blockedDecision, scores: { overallScore: 73 }, confidence: { score: 64, level: "medium" } },
    scores: { overallScore: 73 },
    confidence: { score: 64, level: "medium" },
    asset: { symbol: "CONTROL", name: "Control Asset" },
  });
  assert.equal(blockedTerminalModel.overallScore, null);
  assert.equal(blockedTerminalModel.internalOverallScoreAuditOnly, 73);
  assert.equal(blockedTerminalModel.scoreDisplayable, false);
  assert.equal(blockedTerminalModel.allocationOutcome.key, "not_allocation_ready");
  assert.equal(blockedTerminalModel.scoreEligibility, "blocked_manual_review");
  const blockedDecisionHtml = renderToString(React.createElement(DecisionHeroCard, {
    asset: { symbol: "CONTROL" },
    model: blockedTerminalModel,
    styles: {},
    showSupportSections: true,
  }));
  assert.match(blockedDecisionHtml, /Not Allocation-Ready/);
  assert.match(blockedDecisionHtml, /Withheld/);
  const blockedProtectedReport = researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: "CONTROL" },
    analysis: { decisionLayer: blockedDecision, scores: { overallScore: 73 } },
    model: blockedTerminalModel,
    scores: { overallScore: 73 },
  });
  assert.match(blockedProtectedReport, /Verdict: Not Allocation-Ready/);
  assert.match(blockedProtectedReport, /Score: Withheld/);
  assert.match(blockedProtectedReport, /Canonical analyst narrative unavailable/);
  assert.doesNotMatch(blockedProtectedReport, /Score: 73\/100/);
  const blockedBundle = researchUtils.buildReviewBundleText({
    asset: { symbol: "CONTROL" },
    analysis: { decisionLayer: blockedDecision, scores: { overallScore: 73 } },
    model: blockedTerminalModel,
    scores: { overallScore: 73 },
  });
  assert.match(blockedBundle, /Final decision \/ verdictClass: not_allocation_ready/);
  assert.match(blockedBundle, /Overall score: Withheld/);
  assert.match(blockedBundle, /Legacy score \(audit only\): 73/);
  assert.match(blockedBundle, /Canonical analyst narrative unavailable/);

  const visibleDecision = atomicDecision({
    displayable: true,
    displayMode: "show_score_with_coverage_caveat",
    eligibility: "partially_eligible",
    finalClass: "investable_medium_confidence",
    finalLabel: "Investable - Medium Confidence",
  });
  const visibleTerminalModel = researchUtils.buildDecisionTerminalModel({
    analysis: { decisionLayer: visibleDecision, scores: { overallScore: 73 }, confidence: { score: 64, level: "medium" } },
    scores: { overallScore: 73 },
    confidence: { score: 64, level: "medium" },
    asset: { symbol: "CONTROL", name: "Control Asset" },
  });
  assert.equal(visibleTerminalModel.overallScore, 73);
  assert.equal(visibleTerminalModel.scoreDisplayable, true);
  assert.equal(visibleTerminalModel.allocationOutcome.key, "investable_medium_confidence");
  const renderDecision = (model) => renderToString(React.createElement(DecisionHeroCard, {
    asset: { symbol: "TEST" },
    model,
    styles: {},
    showSupportSections: false,
  }));

  const presentHtml = renderDecision({
    ...baseModel,
    institutionalAnalystWorkflowContract: workflow,
  });
  assert.match(presentHtml, /Institutional Analyst Workflow unavailable/);
  assert.doesNotMatch(presentHtml, /Workflow thesis/);

  const nestedHtml = renderDecision({
    ...baseModel,
    analysis: { institutionalAnalystWorkflowContract: workflow },
  });
  assert.match(nestedHtml, /Institutional Analyst Workflow unavailable/);
  assert.doesNotMatch(nestedHtml, /Workflow thesis/);

  const partialHtml = renderDecision({
    ...baseModel,
    institutionalAnalystWorkflowContract: { contractStatus: "partial" },
  });
  assert.match(partialHtml, /Institutional Analyst Workflow unavailable/);

  const missingHtml = renderDecision(baseModel);
  assert.match(missingHtml, /Institutional Analyst Workflow unavailable/);

  const staleAliasWorkflow = {
    ...workflow,
    canonicalFamily: "native_eth_pos_settlement_gas_fee_market",
    canonicalQuestionGroup: "stale_methodology_group",
    familyAliasNormalization: {
      methodologyFamilyAlias: "native_eth_pos_settlement_gas_fee_market",
      aliasesNormalized: [],
      aliasesBlockedFromPrimaryRendering: [],
    },
  };
  const canonicalRouteModel = {
    ...baseModel,
    canonicalProductRoute: {
      primaryFamily: "native_eth_pos_gas_l2_fee_market",
      primaryQuestionGroup: "native_eth_pos_questions",
    },
    institutionalAnalystWorkflowContract: staleAliasWorkflow,
  };
  const normalizedAliasWorkflow = researchUtils.resolveInstitutionalAnalystWorkflowContract(canonicalRouteModel);
  assert.equal(normalizedAliasWorkflow.canonicalFamily, "native_eth_pos_gas_l2_fee_market");
  assert.equal(normalizedAliasWorkflow.canonicalQuestionGroup, "native_eth_pos_questions");
  assert.ok(normalizedAliasWorkflow.familyAliasNormalization.aliasesBlockedFromPrimaryRendering.includes(
    "native_eth_pos_settlement_gas_fee_market",
  ));

  const surfaceRenderers = [
    ["Right Rail", AnalysisRightRail, { model: baseModel }],
    ["Evidence Map", EvidenceMapTab, { model: baseModel }],
    ["Institutional Checklist", InstitutionalChecklistTab, { model: baseModel, analysis: {} }],
    ["Manual Review", ManualReviewPanel, { model: baseModel }],
    ["Scoring Transparency", ScoringTransparencyTab, { model: baseModel, analysis: {} }],
    ["Source Queue", SourceQueuePanel, { model: baseModel }],
    ["Tokenomics", TokenomicsSupplyIntegrityTab, {
      asset: { symbol: "TEST" },
      model: { ...baseModel, tokenomicsSupplyIntegrity: { supplySummary: "Supply data available" } },
    }],
  ];
  for (const [name, Component, props] of surfaceRenderers) {
    assert.doesNotThrow(
      () => renderToString(React.createElement(Component, { ...props, styles: {} })),
      `${name} must render without a workflow contract`,
    );
    assert.doesNotThrow(
      () => renderToString(React.createElement(Component, {
        ...props,
        model: { ...props.model, institutionalAnalystWorkflowContract: workflow },
        styles: {},
      })),
      `${name} must render with a workflow contract`,
    );
  }

  const supplyFact = (field, value, unit) => ({
    field,
    status: "selected",
    value,
    unit,
    selectedProvider: "coingecko",
    selectedFactId: `fixture-${field}`,
    sourcePath: `coingecko.market_data.${field}`,
    selectionReason: "Existing primary CoinGecko precedence retained for canonical display.",
    selectionMethod: "primary_provider",
    method: "primary_provider",
    rejectedFactIds: [],
    sourceBoundary: ["provider_reported_not_reviewed_evidence"],
  });
  const supplyFormula = (formulaId, label, formula, rawResult, displayedValue, resultUnit = "ratio") => ({
    formulaId,
    label,
    formula,
    result: rawResult,
    rawResult,
    display: displayedValue,
    displayedValue,
    status: "computed",
    method: "derived_provider_formula",
    applicability: "applicable",
    formulaPhase: "phase_1_canonical",
    resultUnit,
    canonicalOwner: "tokenomicsSupplyIntegrity",
    denominatorStatus: "valid",
    roundingPolicy: "Inputs are not rounded; display formatting only.",
    inputs: [{ name: "fixture", rawValue: 2, value: 2, unit: "usd", sourcePath: "fixture.input", provider: "coingecko", freshnessStatus: "fresh", validationState: "valid", sourceBoundary: [] }],
    missingInputs: [],
    invalidInputs: [],
    sourceInputs: ["fixture.input"],
    sourceBoundary: ["calculated_metric_non_scoring"],
    sourceRequirement: "No additional input required for this deterministic fixture.",
    limitations: ["Does not prove future dilution, unlocks, backing, or value capture."],
    scoringActive: false,
  });
  const supplyTruth = {
    methodologyVersion: "supply-truth-formula-engine-consolidation-v1",
    status: "available",
    statusSummary: "Comparable provider supply facts and deterministic Phase 1 calculations are available within the selected representation boundary.",
    canonicalFamily: "defi_governance_value_capture",
    representationContext: { representationType: "evm_contract_asset", selectedNetwork: "ethereum", selectedContract: "0x1111111111111111111111111111111111111111", analyzedNetwork: "ethereum", analyzedContract: "0x1111111111111111111111111111111111111111" },
    applicability: { familyPolicySummary: "Governance-token supply analysis covers float, cap, treasury, unlocks, and control.", primaryDiligenceQuestions: ["How much finite-cap dilution remains?"], notApplicableRedirects: [] },
    providerCandidates: [{ provider: "coingecko", status: "available" }],
    rawProviderFacts: [{ factId: "supply-coingecko-fixture-circulating", provider: "coingecko", field: "circulatingSupply", rawPath: "coingecko.market_data.circulating_supply", rawValue: 100, normalizedValue: 100, unit: "token", role: "primary", freshnessStatus: "fresh", validationState: "valid", scoringActive: false, reviewedEvidence: false, sourceBoundary: [] }],
    canonicalFacts: {
      currentPrice: supplyFact("currentPrice", 2, "usd_per_token"),
      marketCap: supplyFact("marketCap", 200, "usd"),
      fdv: supplyFact("fdv", 400, "usd"),
      volume24h: supplyFact("volume24h", 20, "usd"),
      circulatingSupply: supplyFact("circulatingSupply", 100, "token"),
      totalSupply: supplyFact("totalSupply", 125, "token"),
      maxSupply: supplyFact("maxSupply", 200, "token"),
      selfReportedCirculatingSupply: { field: "selfReportedCirculatingSupply", status: "unavailable", value: null, rejectedFactIds: [] },
      selfReportedMarketCap: { field: "selfReportedMarketCap", status: "unavailable", value: null, rejectedFactIds: [] },
    },
    maxSupplySemantics: { rawValueStatus: "reported_valid", semanticClassification: "finite_cap_reported", formulaApplicability: "applicable", evidenceBasis: [], reasoning: ["Finite positive provider maximum supply reported."], providerNullIsUncappedProof: false },
    providerDisagreements: [{ disagreementId: "fixture-disagreement", field: "marketCap", leftProvider: "coingecko", leftValue: 200, rightProvider: "coinmarketcap", rightValue: 230, absoluteDifference: 30, relativeDifference: 0.1304, material: true, reconciliationStatus: "comparable", selectionReason: "CoinGecko retained." }],
    contradictions: [{ contradictionId: "fixture-contradiction", type: "circulating_above_total", provider: "fixture", values: [120, 100], explanation: "Fixture contradiction remains visible without clamping." }],
    calculatedMetrics: [
      supplyFormula("market_cap_price_times_circulating", "Calculated Market Cap", "Price x Circulating Supply", 200, "$200", "usd"),
      supplyFormula("fdv_market_cap_ratio", "FDV / Market Cap", "FDV / Market Cap", 2, "2x"),
      supplyFormula("circulating_percent_of_max", "Circulating / Max Supply", "Circulating Supply / Max Supply", 0.5, "50%"),
    ],
    calculationTraces: [],
    typedObservations: [],
    provenanceSummary: { providerFactCount: 1, validFactCount: 1, selectedFactCount: 7, providers: ["coingecko"], sourceBoundary: [] },
    freshnessSummary: { overall: "fresh", freshestProviderTimestamp: "2026-07-12T12:00:00.000Z", staleFactIds: [], unknownFreshnessFactIds: [] },
    supportedConclusions: ["Current circulating supply is provider-reported."],
    unsupportedConclusions: ["Supply arithmetic does not prove unlock timing."],
    missingInputs: ["unlock schedule"],
    whatWouldChange: ["Attach a reviewed unlock schedule."],
    formulaOwner: "tokenomicsFormulaEngine.service.ts",
    scoringActive: false,
    reviewedEvidenceScoringActive: false,
  };
  supplyTruth.calculationTraces = supplyTruth.calculatedMetrics;
  const tokenomicsModel = {
    ...baseModel,
    tokenomicsSupplyIntegrity: {
      methodologyVersion: "supply-truth-formula-engine-consolidation-v1",
      canonicalFamily: supplyTruth.canonicalFamily,
      supplyTruth,
      legacyCompatibility: { migrationBoundary: "Supply Truth is non-scoring in v1." },
      supplySummary: { summary: "Legacy compatibility summary.", lensId: "DEFI_PROTOCOL_TOKEN" },
      tokenomicsIntegrityScore: 60,
      evidenceConfidence: "medium",
      unlockScheduleStatus: "unknown",
      sourceRequirements: ["Attach a reviewed unlock schedule."],
      whatWouldChange: ["Attach a reviewed unlock schedule."],
      sourceBoundary: ["diagnostic_only_not_scoring_active"],
      hardBlockers: [], softBlockers: [], scoreCaps: [], confidenceCaps: [], manualReviewTriggers: [], positiveSignals: [], negativeSignals: [], neutralContextualSignals: [], institutionalQuestions: [],
      providerContracts: [], providerPlatforms: [], providerMarketCaps: [], providerFdvs: [], providerVolumes: [], providerSupplyValues: [], providerTimestamps: [], providerScopeNotes: [], providerFieldAudit: [], sourceContradictions: [], providerDisagreements: [], formulaOutputs: supplyTruth.calculatedMetrics,
    },
  };
  const normalizedSupply = researchUtils.normalizeTokenomicsSupplyIntegrityPayload(tokenomicsModel);
  assert.equal(normalizedSupply.supplyTruth.canonicalFacts.marketCap.value, 200);
  assert.equal(normalizedSupply.formulaOutputs.find((entry) => entry.formulaId === "fdv_market_cap_ratio").displayedValue, "2x");
  const supplySurfaces = [
    ["Decision", DecisionHeroCard, { asset: { symbol: "FIX" }, model: tokenomicsModel, showSupportSections: true }],
    ["Right Rail", AnalysisRightRail, { model: tokenomicsModel }],
    ["Evidence Map", EvidenceMapTab, { model: tokenomicsModel }],
    ["Scoring Transparency", ScoringTransparencyTab, { model: tokenomicsModel, analysis: {} }],
    ["Tokenomics", TokenomicsSupplyIntegrityTab, { asset: { symbol: "FIX" }, model: tokenomicsModel }],
  ];
  for (const [name, Component, props] of supplySurfaces) {
    const html = renderToString(React.createElement(Component, { ...props, styles: {} }));
    assert.match(html, /Supply Truth|supply facts|supply integrity/i, `${name} must surface canonical supply context`);
    assert.doesNotMatch(html, /NaN|Infinity|undefined|\[object Object\]/, `${name} must render values safely`);
  }
  const supplyBundle = researchUtils.buildReviewBundleText({ asset: { symbol: "FIX" }, model: tokenomicsModel });
  assert.match(supplyBundle, /6A\. Tokenomics \/ Supply Integrity Tab Mirror/);
  assert.match(supplyBundle, /Canonical Tokenomics owner: tokenomicsSupplyIntegrity/);
  assert.match(supplyBundle, /Raw provider supply facts:/);
  assert.match(supplyBundle, /Canonical calculation traces:/);
  assert.match(supplyBundle, /fixture-disagreement/);
  const supplyProtected = researchUtils.buildProtectedInvestorReportText({ asset: { symbol: "FIX" }, model: tokenomicsModel });
  assert.match(supplyProtected, /Comparable provider supply facts/);
  assert.match(supplyProtected, /FDV \/ market cap: 2x/i);
  assert.doesNotMatch(supplyProtected, /supply-coingecko-fixture|fixture-disagreement|formulaPhase|selectedFactId/);
  const frontendTokenomicsSources = [
    "../src/components/research/TokenomicsSupplyIntegrityTab.jsx",
    "../src/components/research/TokenomicsSupplyIntegrityCard.jsx",
    "../src/components/research/researchUtils.js",
  ].map((path) => readFileSync(new URL(path, import.meta.url), "utf8")).join("\n");
  [
    /currentPrice\s*\*\s*circulatingSupply/i,
    /price\s*\*\s*maxSupply/i,
    /circulatingSupply\s*\/\s*totalSupply/i,
    /circulatingSupply\s*\/\s*maxSupply/i,
    /fdv\s*\/\s*marketCap/i,
    /marketCap\s*\/\s*fdv/i,
  ].forEach((pattern) => assert.doesNotMatch(frontendTokenomicsSources, pattern));

  const presentBundle = researchUtils.buildReviewBundleText({
    asset: { symbol: "TEST" },
    model: { ...baseModel, institutionalAnalystWorkflowContract: workflow },
  });
  assert.match(presentBundle, /2BB\. Institutional Analyst Workflow Engine v1/);
  assert.match(presentBundle, /Contract attached: yes/);

  const aliasBundle = researchUtils.buildReviewBundleText({
    asset: { symbol: "TEST" },
    model: canonicalRouteModel,
  });
  assert.match(aliasBundle, /Canonical family: native_eth_pos_gas_l2_fee_market/);
  assert.doesNotMatch(aliasBundle, /Canonical family: native_eth_pos_settlement_gas_fee_market/);
  assert.match(aliasBundle, /Alias normalization status: PASS/);

  const missingBundle = researchUtils.buildReviewBundleText({
    asset: { symbol: "TEST" },
    model: baseModel,
  });
  assert.match(missingBundle, /2BB\. Institutional Analyst Workflow Engine v1/);
  assert.match(missingBundle, /Contract attached: no/);

  assert.doesNotThrow(() => researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: "TEST" },
    model: { ...baseModel, institutionalAnalystWorkflowContract: workflow },
  }));
  assert.doesNotThrow(() => researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: "TEST" },
    model: baseModel,
  }));
  const structuredAnswerContract = {
    artifactVersion: "institutional-answer-product-layer-v1.2.3",
    contractAttached: true,
    assetFamily: "native_btc_pow_monetary",
    userAnswerCards: [{
      cardId: "btc_security_budget",
      question: "Is the proof-of-work security budget durable?",
      shortAnswer: "Current proof-of-work security evidence is incomplete.",
      answer: "Current hashrate and transaction-fee observations support only a preliminary security-budget view.",
      answerState: "partial_data_preliminary_answer",
      dataUsed: [{ label: "Hashrate", displayValue: "Current sample" }],
      whatDataSupports: ["Observed hashrate supports a bounded current-security assessment."],
      whatDataDoesNotProve: ["It does not prove long-term fee/subsidy security-budget durability."],
      missingData: ["Mining-pool concentration", "Transaction-fee pressure"],
      analystNextStep: "Attach current pool concentration and fee/subsidy security-budget observations.",
      boundary: "Current network observations; not a forecast.",
      openChecks: ["Mining-pool concentration"],
      statusLabel: "Partially supported",
    }],
  };
  const finalAnalystComposer = {
    artifactVersion: "final-analyst-answer-composer-v1",
    contractAttached: true,
    backendAuthoritative: true,
    canonicalFamily: "native_btc_pow_monetary",
    canonicalQuestionGroup: "native_btc_pow_questions",
    assetSummary: {
      canonicalAsset: "Bitcoin",
      canonicalIdentity: "bitcoin",
      representationType: "native_asset",
      networkScope: "Bitcoin",
      contractScope: "Not applicable",
      representationBoundary: "BTC is being evaluated as the native asset of Bitcoin, not as a wrapped representation.",
    },
    availableDataSummary: {
      missingSections: ["Mining-pool concentration"],
    },
    fundamentalQuestionAnswers: [{
      answerId: "final_btc_security_budget",
      questionId: "btc_security_budget",
      question: "Is the proof-of-work security budget durable?",
      answer: "Current network observations support a preliminary security-budget assessment.",
      answerState: "partial_data_preliminary_answer",
      dataUsed: [{ label: "Hashrate", displayValue: "Current sample" }],
      whatTheDataSupports: ["Observed hashrate supports a bounded current-security assessment."],
      whatTheDataDoesNotProve: ["It does not prove long-term fee and subsidy durability."],
      missingData: ["Mining-pool concentration"],
      analystNextStep: "Attach current pool concentration and fee-market observations.",
      observationTypesUsed: ["network_security"],
      observationTypesMissing: ["mining_pool_concentration"],
      familyApplicability: ["native_btc_pow_monetary"],
      scoreRelevance: "primary_constraint",
      boundary: "Current network observations; not a forecast.",
    }],
    analystView: {
      headline: "Bitcoin has a clear monetary thesis, with security-budget durability still requiring current evidence.",
      whatTheAssetIs: "Bitcoin is a native proof-of-work monetary asset.",
      whatTheDataSupports: "Current market and network observations support a bounded monetary-asset assessment.",
      strongestPartOfThesis: "Canonical identity and fixed-supply monetary framing are clear.",
      weakestPartOfAnalysis: "Current fee-market and mining concentration evidence is incomplete.",
      missingForHigherConviction: ["Mining-pool concentration"],
      allocationReadinessExplanation: "The existing verdict remains evidence-caveated.",
      noPricePrediction: true,
      researchSupportOnly: true,
    },
    scoreExplanationBridge: {
      score: 60,
      verdict: "Evidence blocked",
      confidence: "Medium",
      strongestSupportingDataCategories: ["Identity"],
      weakestOrMissingDataCategories: ["Mining concentration"],
      familySpecificScoreConstraints: ["Security-budget evidence"],
      explanation: "The existing score is constrained by incomplete security-budget evidence.",
      whatWouldImproveScoreOrConfidence: ["Current mining-pool and fee-market evidence"],
      formulaChanged: false,
      verdictChanged: false,
      confidenceFormulaChanged: false,
    },
    sourceQueuePriorities: ["Attach current mining-pool concentration evidence."],
    riskSummary: ["Security-budget durability remains the main open risk."],
    familyPurityDiagnostics: {
      primarySurfacePass: true,
      wrongDomainFindings: [],
      sourceQueueFamilyMismatchFindings: [],
      cardFamilyMismatchFindings: [],
      duplicateAnswerFindings: [],
      identityGrammarFindings: [],
      quarantinedPrimaryItems: [],
    },
    guardrails: {},
    knownLimitations: ["Current evidence is incomplete."],
    nextResumePointer: "Deployed cross-family QA",
  };
  finalAnalystComposer.canonicalQuestionJudgments = finalAnalystComposer.fundamentalQuestionAnswers;
  const structuredProtectedReport = researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: "BTC" },
    model: {
      ...baseModel,
      institutionalAnswerSurfaceContract: structuredAnswerContract,
      finalAnalystAnswerComposerContract: finalAnalystComposer,
      primaryAnalysisRoute: { visibleLabel: "Native BTC PoW Monetary" },
    },
  });
  [
    "Answer state: Partial Data Preliminary Answer",
    "Data used: Hashrate: Current sample",
    "Support: Observed hashrate supports",
    "Limits: It does not prove",
    "Missing data: Mining-pool concentration",
    "Next step: Attach current pool concentration",
    "Boundary: Current network observations",
  ].forEach((text) => assert.match(structuredProtectedReport, new RegExp(text, "i")));
  assert.match(structuredProtectedReport, /Bitcoin has a clear monetary thesis/);
  assert.match(structuredProtectedReport, /Current mining-pool and fee-market evidence/);
  assert.doesNotMatch(structuredProtectedReport, /qsc_|registryGateStatus|rejectedQuestionEvidence/);

  const finalComposerBundle = researchUtils.buildReviewBundleText({
    asset: { symbol: "BTC" },
    model: {
      ...baseModel,
      institutionalAnswerSurfaceContract: structuredAnswerContract,
      finalAnalystAnswerComposerContract: finalAnalystComposer,
    },
  });
  assert.match(finalComposerBundle, /2BD\. Final Analyst Answer Composer v1/);
  assert.match(finalComposerBundle, /Contract attached: yes/);
  assert.match(finalComposerBundle, /Is the proof-of-work security budget durable\?/);
  assert.match(finalComposerBundle, /Current network observations support a preliminary security-budget assessment/);
  assert.doesNotMatch(finalComposerBundle, /NO_MATCHING_QUESTION_EVIDENCE_CONTRACT/);

  const notApplicableQuestion = {
    ...finalAnalystComposer.canonicalQuestionJudgments[0],
    questionId: "btc_protocol_revenue_not_applicable",
    question: "Does protocol revenue accrue to BTC holders?",
    answerState: "not_applicable_for_family",
    answerStatus: "not_applicable",
    applicabilityStatus: "not_applicable",
    applicabilityReason: "Protocol revenue is not the applicable diligence frame for a native proof-of-work monetary asset.",
    applicabilityBasis: ["Canonical family: native_btc_pow_monetary"],
    applicabilityRedirect: "Assess fee-market security, miner economics, liquidity, and custody access instead.",
    noScoreOrCoveragePenalty: true,
    directAnswer: "Not relevant for this asset; use the native monetary security-budget frame.",
    answer: "Not relevant for this asset; use the native monetary security-budget frame.",
    gap: ["STALE_NA_GAP_MUST_NOT_RENDER"],
    missingData: ["STALE_NA_GAP_MUST_NOT_RENDER"],
    missingRequiredObservations: ["STALE_NA_GAP_MUST_NOT_RENDER"],
    observationTypesMissing: ["STALE_NA_OBSERVATION_MUST_NOT_RENDER"],
    whatWouldChangeTheView: "STALE_NA_NEXT_STEP_MUST_NOT_RENDER",
    analystNextStep: "STALE_NA_NEXT_STEP_MUST_NOT_RENDER",
    excludedEvidenceIds: ["foreign-asset-evidence-audit-id"],
    exclusionReasons: ["wrong_asset_rejected: evidence belongs to a different canonical asset"],
  };
  const notApplicableComposer = {
    ...finalAnalystComposer,
    canonicalQuestionJudgments: [notApplicableQuestion],
    fundamentalQuestionAnswers: [notApplicableQuestion],
    familyBoundSourceQueue: [{
      queueItemId: "stale-na-queue-item",
      canonicalFamily: "native_btc_pow_monetary",
      questionId: notApplicableQuestion.questionId,
      text: "STALE_NA_QUEUE_MUST_NOT_RENDER",
    }],
    sourceQueuePriorities: ["STALE_NA_QUEUE_MUST_NOT_RENDER"],
  };
  const normalizedNotApplicable = researchUtils.normalizeFinalAnalystAnswerComposerPayload({
    finalAnalystAnswerComposerContract: notApplicableComposer,
  });
  const normalizedNotApplicableQuestion = normalizedNotApplicable.canonicalQuestionJudgments[0];
  assert.equal(normalizedNotApplicableQuestion.applicabilityStatus, "not_applicable");
  assert.deepEqual(normalizedNotApplicableQuestion.gap, []);
  assert.deepEqual(normalizedNotApplicableQuestion.missingData, []);
  assert.deepEqual(normalizedNotApplicableQuestion.missingRequiredObservations, []);
  assert.deepEqual(normalizedNotApplicableQuestion.observationTypesMissing, []);
  assert.equal(normalizedNotApplicableQuestion.whatWouldChangeTheView, "");
  assert.equal(normalizedNotApplicableQuestion.analystNextStep, "");
  assert.equal(normalizedNotApplicable.familyBoundSourceQueue.length, 0);
  assert.equal(normalizedNotApplicable.sourceQueuePriorities.length, 0);

  const notApplicableModel = {
    ...baseModel,
    finalAnalystAnswerComposerContract: notApplicableComposer,
    canonicalProductRoute: {
      primaryFamily: "native_btc_pow_monetary",
      primaryQuestionGroup: "native_btc_pow_questions",
    },
  };
  const notApplicableChecklist = renderToString(React.createElement(InstitutionalChecklistTab, {
    model: notApplicableModel,
    analysis: {},
    styles: {},
  }));
  assert.match(notApplicableChecklist, /Not relevant|Protocol revenue is not the applicable diligence frame/i);
  assert.doesNotMatch(notApplicableChecklist, /STALE_NA_(?:GAP|NEXT_STEP|OBSERVATION|QUEUE)_MUST_NOT_RENDER/);
  const notApplicableProtected = researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: "BTC", name: "Bitcoin" },
    model: notApplicableModel,
  });
  assert.match(notApplicableProtected, /Protocol revenue is not the applicable diligence frame/i);
  assert.doesNotMatch(notApplicableProtected, /STALE_NA_(?:GAP|NEXT_STEP|OBSERVATION|QUEUE)_MUST_NOT_RENDER/);
  const notApplicableBundle = researchUtils.buildReviewBundleText({
    asset: { symbol: "BTC", name: "Bitcoin" },
    model: notApplicableModel,
  });
  const notApplicableTwoBd = notApplicableBundle.split("2BD. Final Analyst Answer Composer v1")[1]?.split("\n=== 2BE.")[0] || "";
  assert.match(notApplicableTwoBd, /applicability=not_applicable/);
  assert.match(notApplicableTwoBd, /noPenalty=yes/);
  assert.match(notApplicableTwoBd, /foreign-asset-evidence-audit-id/);
  assert.match(notApplicableTwoBd, /wrong_asset_rejected/);
  assert.doesNotMatch(notApplicableTwoBd, /STALE_NA_(?:GAP|NEXT_STEP|OBSERVATION|QUEUE)_MUST_NOT_RENDER/);
  assert.doesNotMatch(notApplicableBundle, /^=== 2B[FG]\./m);

  const isolationComposer = (assetName, assetId, evidenceId) => {
    const answer = {
      ...finalAnalystComposer.canonicalQuestionJudgments[0],
      questionId: `${assetId}_isolation_question`,
      question: `What supports ${assetName}?`,
      directAnswer: `${assetName} uses only ${evidenceId}.`,
      answer: `${assetName} uses only ${evidenceId}.`,
      evidenceBehindIt: [`${evidenceId} supports only ${assetName}.`],
      whatTheDataSupports: [`${evidenceId} supports only ${assetName}.`],
      gap: [],
      missingData: [],
      missingRequiredObservations: [],
      whatWouldChangeTheView: "",
      analystNextStep: "",
      excludedEvidenceIds: [`excluded-${evidenceId}`],
      exclusionReasons: ["wrong_asset_rejected"],
    };
    return {
      ...finalAnalystComposer,
      assetSummary: {
        ...finalAnalystComposer.assetSummary,
        canonicalAsset: assetName,
        canonicalIdentity: assetId,
      },
      analystView: {
        ...finalAnalystComposer.analystView,
        headline: `${assetName} canonical isolation headline.`,
        whatTheDataSupports: `${evidenceId} is scoped to ${assetName}.`,
      },
      canonicalQuestionJudgments: [answer],
      fundamentalQuestionAnswers: [answer],
      familyBoundSourceQueue: [],
      sourceQueuePriorities: [],
    };
  };
  const composerA = isolationComposer("Asset Alpha", "asset-alpha", "ALPHA_EVIDENCE_ONLY");
  const composerB = isolationComposer("Asset Beta", "asset-beta", "BETA_EVIDENCE_ONLY");
  const sequentialA = researchUtils.normalizeFinalAnalystAnswerComposerPayload({ finalAnalystAnswerComposerContract: composerA });
  const sequentialB = researchUtils.normalizeFinalAnalystAnswerComposerPayload({ finalAnalystAnswerComposerContract: composerB });
  assert.notEqual(sequentialA, sequentialB);
  assert.notEqual(sequentialA.canonicalQuestionJudgments, sequentialB.canonicalQuestionJudgments);
  assert.notEqual(sequentialA.canonicalQuestionJudgments[0], sequentialB.canonicalQuestionJudgments[0]);
  assert.doesNotMatch(JSON.stringify(sequentialB), /ALPHA_EVIDENCE_ONLY|Asset Alpha/);
  const [concurrentA, concurrentB] = await Promise.all([
    Promise.resolve().then(() => researchUtils.normalizeFinalAnalystAnswerComposerPayload({ finalAnalystAnswerComposerContract: composerA })),
    Promise.resolve().then(() => researchUtils.normalizeFinalAnalystAnswerComposerPayload({ finalAnalystAnswerComposerContract: composerB })),
  ]);
  assert.doesNotMatch(JSON.stringify(concurrentA), /BETA_EVIDENCE_ONLY|Asset Beta/);
  assert.doesNotMatch(JSON.stringify(concurrentB), /ALPHA_EVIDENCE_ONLY|Asset Alpha/);
  const betaModel = {
    ...baseModel,
    finalAnalystAnswerComposerContract: composerB,
    canonicalProductRoute: {
      primaryFamily: composerB.canonicalFamily,
      primaryQuestionGroup: composerB.canonicalQuestionGroup,
    },
  };
  const betaBundle = researchUtils.buildReviewBundleText({ asset: { symbol: "BETA", name: "Asset Beta" }, model: betaModel });
  const betaProtected = researchUtils.buildProtectedInvestorReportText({ asset: { symbol: "BETA", name: "Asset Beta" }, model: betaModel });
  assert.match(betaBundle, /BETA_EVIDENCE_ONLY/);
  assert.match(betaProtected, /BETA_EVIDENCE_ONLY/);
  assert.doesNotMatch(betaBundle, /ALPHA_EVIDENCE_ONLY|Asset Alpha/);
  assert.doesNotMatch(betaProtected, /ALPHA_EVIDENCE_ONLY|Asset Alpha/);

  const aliasProtectedReport = researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: "TEST" },
    model: canonicalRouteModel,
  });
  assert.match(aliasProtectedReport, /Analysis question family: native_eth_pos_questions/);
  assert.doesNotMatch(aliasProtectedReport, /Analyst workflow family:/);
  assert.doesNotMatch(aliasProtectedReport, /methodologyFamilyAlias|aliasesNormalized|native_eth_pos_settlement_gas_fee_market/);

  const staleEthRequirement = "Verify EIP-1559 base-fee burn, L2/blob fees, proposer-builder separation, and post-Merge issuance.";
  const adaCanonicalRequirement = "Verify current Cardano transaction activity, fee generation, staking concentration, and liveness.";
  const adaComposer = {
    ...finalAnalystComposer,
    canonicalFamily: "non_eth_l1_smart_contract_platform",
    canonicalQuestionGroup: "non_eth_l1_smart_contract_platform_questions",
    assetSummary: {
      ...finalAnalystComposer.assetSummary,
      canonicalAsset: "Cardano",
      canonicalIdentity: "cardano",
      representationType: "native_asset",
      networkScope: "Cardano",
      representationBoundary: "ADA is evaluated as the native asset of Cardano.",
    },
    analystView: {
      ...finalAnalystComposer.analystView,
      headline: "Cardano has a native smart-contract platform thesis with current chain usage and security evidence still required.",
      whatTheAssetIs: "Cardano is a non-Ethereum native smart-contract platform.",
      missingForHigherConviction: [adaCanonicalRequirement],
    },
    canonicalQuestionJudgments: [{
      ...finalAnalystComposer.canonicalQuestionJudgments[0],
      questionId: "non_eth_l1_chain_usage",
      question: "Is native-chain usage and fee generation durable?",
      answer: "Current chain evidence supports only a preliminary usage assessment.",
      gap: adaCanonicalRequirement,
      missingRequiredObservations: ["chain_transaction_activity", "chain_fee_generation"],
      whatWouldChangeTheView: [adaCanonicalRequirement],
      familyApplicability: ["non_eth_l1_smart_contract_platform"],
    }],
    familyBoundSourceQueue: [{
      queueItemId: "ada-chain-usage",
      canonicalFamily: "non_eth_l1_smart_contract_platform",
      questionId: "non_eth_l1_chain_usage",
      requirementId: "chain_transaction_activity",
      text: adaCanonicalRequirement,
      status: "needs_verification",
    }],
    sourceQueuePriorities: [adaCanonicalRequirement],
    riskSummary: ["Current chain usage and security evidence remains incomplete."],
  };
  adaComposer.fundamentalQuestionAnswers = adaComposer.canonicalQuestionJudgments;
  const adaFamilyMatrix = {
    artifactVersion: "family-data-requirement-matrix-v2",
    primaryFamily: "non_eth_l1_smart_contract_platform",
    primarySourceMatrixId: "matrix_non_eth_l1_smart_contract_platform",
    manualReviewItems: ["Review chain-specific validator or stake-pool concentration and liveness."],
    manualReviewTriggers: ["chain_security_review"],
    scoreEligibilityBlockers: [{ label: "Current native-chain usage and security evidence is incomplete." }],
    evidenceMapRows: [{ label: "Native-chain usage", requirement: adaCanonicalRequirement }],
    scoringTransparencyRows: [{ label: "Chain evidence gap", requirement: adaCanonicalRequirement }],
    auditOnlyLegacyInputs: [staleEthRequirement],
  };
  const adaModel = {
    ...baseModel,
    canonicalProductRoute: {
      primaryFamily: "non_eth_l1_smart_contract_platform",
      primaryQuestionGroup: "non_eth_l1_smart_contract_platform_questions",
    },
    primaryAnalysisRoute: {
      assetFamily: "non_eth_l1_smart_contract_platform",
      questionGroup: "non_eth_l1_smart_contract_platform_questions",
      visibleLabel: "Non-ETH L1 Smart-Contract Platform",
    },
    finalAnalystAnswerComposerContract: adaComposer,
    familyDataRequirementMatrixContract: adaFamilyMatrix,
    evidenceStatusAggregationContract: {
      artifactVersion: "evidence-status-aggregation-v1",
      sourceQueueItems: [adaCanonicalRequirement],
      manualReviewItems: ["Review chain-specific validator or stake-pool concentration and liveness."],
      canonicalProjection: {
        productSourceQueueOwner: "finalAnalystAnswerComposerContract.familyBoundSourceQueue",
        independentProductQueueProduced: false,
      },
      auditOnlyLegacyInputs: { sourceRequirements: [staleEthRequirement] },
      assetAggregation: { openChecks: [adaCanonicalRequirement] },
    },
    coverageScoreEligibilityContract: {
      artifactVersion: "coverage-score-eligibility-v1",
      coverageBlockers: [{ label: "Current native-chain usage evidence is incomplete." }],
      whatWouldUpgradeTier: [adaCanonicalRequirement],
      whatWouldMakeScoreEligible: [adaCanonicalRequirement],
      auditDetails: { rejectedLegacyInputsAuditOnly: [staleEthRequirement] },
    },
    familyCanonicalRoutingContract: {
      artifactVersion: "family-canonical-routing-v1",
      effectiveFamily: "non_eth_l1_smart_contract_platform",
      sourceQueueCanonicalRequirements: [adaCanonicalRequirement],
      manualReviewCanonicalRequirements: ["Review chain-specific validator or stake-pool concentration and liveness."],
      rejectedWrongFamilyRequirements: [{ text: staleEthRequirement, sourcePath: "audit-only" }],
      auditOnlyFields: { coverageBlockersBeforeCanonicalizationAuditOnlyNonCurrent: [staleEthRequirement] },
      independentProductQueueProduced: false,
    },
    evidenceProvenanceSemanticsContract: {
      contractAttached: true,
      readinessGaps: [{
        gapId: "ada-chain-usage-gap",
        family: "non_eth_l1_smart_contract_platform",
        visibility: "product",
        label: adaCanonicalRequirement,
      }],
      auditDetails: { legacyRequirements: [staleEthRequirement] },
    },
  };
  const adaSurfaceRenderers = [
    ["Decision", DecisionHeroCard, { asset: { symbol: "ADA" }, model: adaModel, showSupportSections: false }],
    ["Right Rail", AnalysisRightRail, { model: adaModel }],
    ["Evidence Map", EvidenceMapTab, { model: adaModel }],
    ["Manual Review", ManualReviewPanel, { model: adaModel }],
    ["Scoring Transparency", ScoringTransparencyTab, { model: adaModel, analysis: {} }],
    ["Source Queue", SourceQueuePanel, { model: adaModel }],
  ];
  for (const [name, Component, props] of adaSurfaceRenderers) {
    const html = renderToString(React.createElement(Component, { ...props, styles: {} }));
    assert.doesNotMatch(html, /EIP-?1559|base-fee burn|L2\/blob|proposer-builder|post-Merge/i, `${name} must ignore audit-only ETH requirements`);
  }
  const adaSourceQueueHtml = renderToString(React.createElement(SourceQueuePanel, { model: adaModel, styles: {} }));
  assert.match(adaSourceQueueHtml, /Cardano transaction activity/);
  const adaProtectedReport = researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: "ADA", name: "Cardano" },
    model: adaModel,
  });
  assert.match(adaProtectedReport, /Cardano transaction activity/);
  assert.doesNotMatch(adaProtectedReport, /EIP-?1559|base-fee burn|L2\/blob|proposer-builder|post-Merge/i);
  const adaBundle = researchUtils.buildReviewBundleText({
    asset: { symbol: "ADA", name: "Cardano" },
    model: adaModel,
  });
  const adaUserMirror = adaBundle.split("2BD. Final Analyst Answer Composer v1")[1]?.split("\n=== 2BE.")[0] || "";
  assert.match(adaUserMirror, /Cardano transaction activity/);
  assert.doesNotMatch(adaUserMirror, /EIP-?1559|base-fee burn|L2\/blob|proposer-builder|post-Merge/i);

  const canonicalComposer = ({
    family,
    questionGroup,
    assetName,
    assetDescription,
    headline,
    support,
    strength,
    weakness,
    readiness,
    question,
    answer,
    risk,
    queue,
    decision,
  }) => ({
    ...finalAnalystComposer,
    canonicalFamily: family,
    canonicalQuestionGroup: questionGroup,
    assetSummary: {
      ...finalAnalystComposer.assetSummary,
      canonicalAsset: assetName,
      canonicalIdentity: assetName.toLowerCase(),
      representationBoundary: assetDescription,
    },
    analystView: {
      headline,
      whatTheAssetIs: assetDescription,
      whatTheDataSupports: support,
      strongestPartOfThesis: strength,
      weakestPartOfAnalysis: weakness,
      allocationReadinessExplanation: readiness,
      missingForHigherConviction: [queue],
    },
    canonicalQuestionJudgments: [{
      ...finalAnalystComposer.canonicalQuestionJudgments[0],
      questionId: `${family}_control`,
      question,
      directAnswer: answer,
      answer,
      evidenceBehindIt: [support],
      whatTheDataSupports: [support],
      gap: [queue],
      missingRequiredObservations: [queue],
      whatWouldChangeTheView: queue,
      familyApplicability: [family],
    }],
    familyBoundSourceQueue: [{
      queueItemId: `${family}-control-queue`,
      canonicalFamily: family,
      questionId: `${family}_control`,
      requirementId: `${family}_control_requirement`,
      text: queue,
      status: "needs_verification",
    }],
    sourceQueuePriorities: [queue],
    riskSummary: [risk],
    scoreExplanationBridge: {
      ...finalAnalystComposer.scoreExplanationBridge,
      verdictClass: decision.verdict.finalClass,
      verdictLabel: decision.verdict.finalLabel,
      scoreDisplayMode: decision.score.displayMode,
      scoreDisplayLabel: decision.score.displayable ? "Score available with coverage caveat" : "Score withheld",
      explanation: decision.verdict.explanation,
      formulaChanged: false,
      verdictChanged: false,
      confidenceFormulaChanged: false,
    },
  });

  const buildCanonicalControlModel = ({ asset, family, questionGroup, composer, decision, legacy = {} }) => researchUtils.buildDecisionTerminalModel({
    analysis: {
      ...legacy,
      decisionLayer: decision,
      finalAnalystAnswerComposerContract: composer,
      canonicalProductRoute: {
        primaryFamily: family,
        primaryQuestionGroup: questionGroup,
        primaryVisibleLabel: family,
        primaryAssetFraming: composer.analystView.whatTheAssetIs,
      },
      primaryAnalysisRoute: {
        assetFamily: family,
        questionGroup,
        visibleLabel: family,
      },
      scores: { overallScore: 73 },
      confidence: { score: 64, level: "medium" },
    },
    scores: { overallScore: 73 },
    confidence: { score: 64, level: "medium" },
    asset,
  });

  const btcComposer = canonicalComposer({
    family: "native_btc_pow_monetary",
    questionGroup: "native_btc_pow_questions",
    assetName: "Bitcoin",
    assetDescription: "Bitcoin is the native proof-of-work monetary asset of the Bitcoin network.",
    headline: "Bitcoin has a fixed-supply monetary thesis, while current fee-market and mining concentration evidence limits allocation readiness.",
    support: "Canonical supply and proof-of-work observations support the monetary-asset framing.",
    strength: "Fixed-supply monetary policy and native proof-of-work identity are clear.",
    weakness: "Long-run fee-market security and mining-pool concentration remain underverified.",
    readiness: "The final decision is Not Allocation-Ready until current security-budget and market-access evidence is attached.",
    question: "Can the proof-of-work security budget remain durable?",
    answer: "Current evidence supports the mechanism, but fee-market durability and mining concentration remain open checks.",
    risk: "A weak fee market or concentrated mining could weaken long-run security.",
    queue: "Verify current fee revenue, hashrate, mining-pool concentration, liquidity, and custody access.",
    decision: blockedDecision,
  });
  const btcLegacyLeak = {
    verdictSemantics: {
      summary: "Not Allocation-Ready - Investable - Medium Confidence",
      positiveCase: ["BTC clears the benchmark allocation threshold."],
    },
    summaryMemo: "BTC is directionally investable because ETH gas demand, EIP-1559, staking/validator security, L2/blob demand, and MEV relay economics are strong.",
    dataFirstNarrativeContract: {
      contractAttached: true,
      generatedNarrativeFields: [{ fieldName: "headerSummary", display: "BTC clears the benchmark allocation threshold." }],
    },
    resolvedInstitutionalLens: {
      lensId: "POS_SMART_CONTRACT_SETTLEMENT_GAS_ASSET",
      questionGroupId: "native_eth_pos_questions",
      displayLabel: "PoS Smart-Contract Settlement / Gas Asset",
    },
    lensAwareExplanations: {
      source: "resolvedInstitutionalLens",
      lensId: "POS_SMART_CONTRACT_SETTLEMENT_GAS_ASSET",
      primaryBlocker: "ETH gas demand, EIP-1559 burn, staking security, L2/blob demand, and MEV relay concentration require review.",
      evidenceNeeded: ["Attach current validator and staking evidence."],
      whatWouldChange: ["Verify current L2/blob fee-market contribution."],
      requiredConditions: ["Confirm Ethereum fee-market durability."],
    },
  };
  const btcModel = buildCanonicalControlModel({
    asset: { symbol: "BTC", name: "Bitcoin" },
    family: "native_btc_pow_monetary",
    questionGroup: "native_btc_pow_questions",
    composer: btcComposer,
    decision: blockedDecision,
    legacy: btcLegacyLeak,
  });
  const btcPrimaryText = [
    btcModel.verdictSemantics?.summary,
    btcModel.summaryMemo,
    btcModel.primaryStrength,
    btcModel.primaryWeakness,
    btcModel.tokenDemandTruth,
    ...researchUtils.safeArray(btcModel.researchRequirements).map((item) => item?.reason || item?.title),
  ].join(" ");
  assert.doesNotMatch(btcPrimaryText, /Investable - Medium Confidence|directionally investable|clears the benchmark allocation threshold/i);
  assert.doesNotMatch(btcPrimaryText, /ETH gas demand|EIP-?1559|staking\/validator|L2\/blob|MEV relay/i);
  assert.match(btcPrimaryText, /proof-of-work|fee-market|mining/i);
  const btcParity = researchUtils.buildRenderedSurfaceParityViewModel({ model: btcModel });
  assert.equal(btcParity.finalVerdictClass, "not_allocation_ready");
  assert.equal(btcParity.candidateFinalContradictionAssertions.length, 0);
  assert.equal(btcParity.wrongFamilyNarrativeAssertions.length, 0);
  assert.equal(btcParity.primaryNarrativePass, true);
  assert.equal(btcParity.corpusProvenance.owner, "buildRenderedSurfaceParityViewModel");
  assert.equal(btcParity.corpusProvenance.scalarStringsPreserved, true);
  assert.ok(btcParity.surfaceRows.decisionTab.length > 0);
  btcParity.surfaceRows.decisionTab.forEach((row) => {
    assert.equal(row.surface, "decisionTab");
    assert.equal(row.renderedStatus, "rendered");
    assert.ok(row.fieldPath);
    assert.ok(row.sourceObjectPath);
    assert.ok(row.componentConsumer);
    assert.ok(row.inclusionReason);
    assert.ok(btcParity.surfaces.decisionTab.includes(row.renderedText));
  });
  const lensAwareAuditField = btcParity.nonRenderedAuditFields.find((entry) => entry.fieldPath === "model.lensAwareExplanations");
  assert.equal(lensAwareAuditField?.disposition, "audit_only_not_rendered");
  assert.equal(lensAwareAuditField?.renderedStatus, "not_rendered_by_live_decision_tab");
  assert.match(lensAwareAuditField?.componentConsumptionProof || "", /do not (?:read|consume)|do not consume/i);
  assert.doesNotMatch(btcParity.surfaces.decisionTab.join(" "), /EIP-?1559|staking security|L2\/blob|MEV relay/i);
  const btcDecisionHtml = renderDecision(btcModel);
  assert.match(btcDecisionHtml, /Not Allocation-Ready/);
  assert.doesNotMatch(btcDecisionHtml, /Investable - Medium Confidence|directionally investable|EIP-?1559|L2\/blob/i);
  const btcProtected = researchUtils.buildProtectedInvestorReportText({ asset: { symbol: "BTC", name: "Bitcoin" }, model: btcModel });
  assert.match(btcProtected, /fixed-supply monetary thesis/i);
  assert.doesNotMatch(btcProtected, /directionally investable|clears the benchmark allocation threshold|EIP-?1559|L2\/blob/i);
  const btcBundle = researchUtils.buildReviewBundleText({ asset: { symbol: "BTC", name: "Bitcoin" }, model: btcModel });
  const bundleSlice = (bundle, start, end) => bundle.split(start)[1]?.split(end)[0] || "";
  const btcDecisionTabBundle = bundleSlice(btcBundle, "=== 4. Decision Tab / Decision Snapshot ===", "=== 5. Thesis Falsification Tab ===");
  const btcAuditBundle = bundleSlice(btcBundle, "=== 11. Audit / Raw Key Fields ===", "=== 12. Engine Learning Backbone v1 ===");
  const btcTwoCBundle = bundleSlice(btcBundle, "=== 2C. Backend-to-Frontend Rendered Surface Parity Gate ===", "=== 2D.");
  const btcTwelveCBundle = bundleSlice(btcBundle, "=== 12C. BTC Benchmark Answer / Native Base-Layer Text QA ===", "=== 12D.");
  assert.match(btcDecisionTabBundle, /Exact text mirror of the live Decision Tab component-consumption view model/i);
  assert.doesNotMatch(btcDecisionTabBundle, /Lens-aware display text|not_rendered_by_ui|not_rendered_by_live_decision_tab/i);
  assert.doesNotMatch(btcDecisionTabBundle, /EIP-?1559|staking security|L2\/blob|MEV relay/i);
  assert.match(btcAuditBundle, /model\.lensAwareExplanations/);
  assert.match(btcAuditBundle, /analysis\.lensAwareExplanations/);
  assert.match(btcAuditBundle, /audit_only_not_rendered/);
  assert.match(btcAuditBundle, /not_rendered_by_live_decision_tab/);
  assert.match(btcAuditBundle, /EIP-?1559|staking security|L2\/blob|MEV relay/i);
  assert.match(btcTwoCBundle, new RegExp(btcParity.corpusProvenance.decisionTabCorpusId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(btcTwelveCBundle, new RegExp(btcParity.corpusProvenance.decisionTabCorpusId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const btcBundlePrimary = btcBundle.split("2BD. Final Analyst Answer Composer v1")[1]?.split("\n=== 2BE.")[0] || "";
  assert.match(btcBundlePrimary, /fixed-supply monetary thesis/i);
  assert.doesNotMatch(btcBundlePrimary, /directionally investable|clears the benchmark allocation threshold|EIP-?1559|L2\/blob/i);
  assert.match(btcBundle, /Candidate\/final contradiction findings: 0/);
  assert.match(btcBundle, /Wrong-family narrative findings: 0/);

  const injectedCandidateModel = {
    ...btcModel,
    decisionLayer: blockedDecision,
    verdictClass: "not_allocation_ready",
    summaryMemo: "BTC is directionally investable.",
  };
  const injectedCandidateParity = researchUtils.buildRenderedSurfaceParityViewModel({ model: injectedCandidateModel });
  assert.ok(injectedCandidateParity.candidateFinalContradictionAssertions.length > 0);
  assert.equal(injectedCandidateParity.primaryNarrativePass, false);
  const injectedWrongFamilyModel = {
    ...btcModel,
    decisionLayer: blockedDecision,
    verdictClass: "not_allocation_ready",
    summaryMemo: "EIP-1559 burn and L2/blob demand are the primary thesis.",
  };
  const injectedWrongFamilyParity = researchUtils.buildRenderedSurfaceParityViewModel({ model: injectedWrongFamilyModel });
  assert.ok(injectedWrongFamilyParity.wrongFamilyNarrativeAssertions.length > 0);
  assert.equal(injectedWrongFamilyParity.primaryNarrativePass, false);
  const injectedWrongFamilyBundle = researchUtils.buildReviewBundleText({ asset: { symbol: "CONTROL", name: "Injected Control" }, model: injectedWrongFamilyModel });
  const injectedTwoCBundle = bundleSlice(injectedWrongFamilyBundle, "=== 2C. Backend-to-Frontend Rendered Surface Parity Gate ===", "=== 2D.");
  const injectedTwelveCBundle = bundleSlice(injectedWrongFamilyBundle, "=== 12C. BTC Benchmark Answer / Native Base-Layer Text QA ===", "=== 12D.");
  assert.match(injectedTwoCBundle, /Gate status: FAIL/);
  assert.match(injectedTwoCBundle, /Wrong-family narrative count: [1-9]/);
  assert.match(injectedTwelveCBundle, /BTC-native forbidden-string failures: [1-9]/);

  const positiveBtcDecision = atomicDecision({
    displayable: true,
    displayMode: "show_score_with_coverage_caveat",
    eligibility: "partially_eligible",
    finalClass: "investable_medium_confidence",
    finalLabel: "Investable - Medium Confidence",
  });
  const positiveBtcComposer = canonicalComposer({
    family: "native_btc_pow_monetary",
    questionGroup: "native_btc_pow_questions",
    assetName: "Bitcoin",
    assetDescription: "Bitcoin is the native proof-of-work monetary asset of the Bitcoin network.",
    headline: "Bitcoin is investable at medium confidence under the current final decision.",
    support: "Current monetary, security, and liquidity observations support a bounded allocation case.",
    strength: "The native monetary thesis is supported.",
    weakness: "Fee-market durability remains a monitoring item.",
    readiness: "The final decision permits a medium-confidence allocation posture.",
    question: "Is the monetary thesis sufficiently supported?",
    answer: "Yes, within the current evidence and confidence boundary.",
    risk: "Fee-market and mining concentration still require monitoring.",
    queue: "Refresh fee-market and mining concentration data.",
    decision: positiveBtcDecision,
  });
  const positiveBtcModel = buildCanonicalControlModel({
    asset: { symbol: "BTC", name: "Bitcoin" },
    family: "native_btc_pow_monetary",
    questionGroup: "native_btc_pow_questions",
    composer: positiveBtcComposer,
    decision: positiveBtcDecision,
  });
  const positiveBtcParity = researchUtils.buildRenderedSurfaceParityViewModel({ model: positiveBtcModel });
  assert.ok(positiveBtcParity.allocationLanguageAssertions.length > 0);
  assert.equal(positiveBtcParity.candidateFinalContradictionAssertions.length, 0);
  assert.equal(positiveBtcParity.primaryNarrativePass, true);

  const ethComposer = canonicalComposer({
    family: "native_eth_pos_gas_l2_fee_market",
    questionGroup: "native_eth_pos_questions",
    assetName: "Ethereum",
    assetDescription: "Ether is Ethereum's native proof-of-stake gas and settlement asset.",
    headline: "Ethereum's thesis depends on gas demand, EIP-1559 burn, staking security, and L2/blob settlement demand.",
    support: "Fee-market, burn, staking, validator, and blob observations support a bounded network-economics assessment.",
    strength: "Gas settlement and proof-of-stake security roles are established.",
    weakness: "Validator/client diversity, MEV relay concentration, and liveness remain open checks.",
    readiness: "Current final decision permits a medium-confidence posture with live-data caveats.",
    question: "Are Ethereum fee, burn, staking, and L2 economics durable?",
    answer: "Current evidence supports the mechanism, while net issuance and L2 value contribution require monitoring.",
    risk: "Weak fees, concentrated validators, or MEV relay dependence could weaken the thesis.",
    queue: "Refresh gas fees, EIP-1559 burn, staking, validator/client diversity, L2/blob, MEV, relay, and liveness data.",
    decision: visibleDecision,
  });
  const ethModel = buildCanonicalControlModel({
    asset: { symbol: "ETH", name: "Ethereum" },
    family: "native_eth_pos_gas_l2_fee_market",
    questionGroup: "native_eth_pos_questions",
    composer: ethComposer,
    decision: visibleDecision,
  });
  const ethCorpus = researchUtils.buildRenderedSurfaceParityViewModel({ model: ethModel });
  assert.match(ethCorpus.primaryVisibleText.join(" "), /EIP-1559|staking|validator|L2\/blob|MEV|relay/i);
  assert.equal(ethCorpus.wrongFamilyNarrativeAssertions.length, 0);

  const usdcComposer = canonicalComposer({
    family: "stablecoin_fiat_backed",
    questionGroup: "stablecoin_fiat_backed_questions",
    assetName: "USD Coin",
    assetDescription: "USDC is an issuer-native fiat-backed stablecoin.",
    headline: "USDC depends on reserve quality, redemption reliability, issuer controls, and peg liquidity.",
    support: "Available reserve and redemption observations support only a bounded stablecoin trust assessment.",
    strength: "Issuer-native mint and redeem mechanics are the correct analytical frame.",
    weakness: "Current reserves, banking custody, freeze controls, and stress liquidity require verification.",
    readiness: "The final decision remains constrained by reserve and redemption evidence.",
    question: "Are reserves and redemption reliable?",
    answer: "The mechanism is identifiable, but current reserves, issuer controls, and redemption access require verification.",
    risk: "Reserve, banking, freeze, redemption, or peg stress could impair holders.",
    queue: "Verify reserves, attestations, redemption terms, issuer/banking custody, freeze controls, supported networks, and peg liquidity.",
    decision: blockedDecision,
  });
  const usdcModel = buildCanonicalControlModel({
    asset: { symbol: "USDC", name: "USD Coin" },
    family: "stablecoin_fiat_backed",
    questionGroup: "stablecoin_fiat_backed_questions",
    composer: usdcComposer,
    decision: blockedDecision,
  });
  const usdcParity = researchUtils.buildRenderedSurfaceParityViewModel({ model: usdcModel });
  assert.match(usdcParity.primaryVisibleText.join(" "), /reserve|redemption|issuer|freeze|peg/i);
  assert.equal(usdcParity.wrongFamilyNarrativeAssertions.length, 0);

  const xrpComposer = canonicalComposer({
    family: "payments_settlement_network",
    questionGroup: "payments_settlement_questions",
    assetName: "XRP",
    assetDescription: "XRP is the native settlement asset of the XRP Ledger payments network.",
    headline: "XRP depends on durable payment and settlement usage, ledger security, liquidity, and regulatory access.",
    support: "Available network observations support a bounded payments and settlement assessment.",
    strength: "Native settlement identity and market access are established.",
    weakness: "Current settlement usage, validator structure, and token value capture remain open checks.",
    readiness: "The final decision remains constrained by usage, regulatory, and liquidity evidence.",
    question: "Is settlement usage durable and economically relevant to XRP?",
    answer: "The settlement role is identifiable, while current usage and value capture require verification.",
    risk: "Weak usage, concentrated trust assumptions, regulatory constraints, or thin liquidity could weaken the thesis.",
    queue: "Verify settlement usage, validator structure, liquidity, access, regulatory context, and token economic role.",
    decision: blockedDecision,
  });
  const xrpModel = buildCanonicalControlModel({
    asset: { symbol: "XRP", name: "XRP" },
    family: "payments_settlement_network",
    questionGroup: "payments_settlement_questions",
    composer: xrpComposer,
    decision: blockedDecision,
  });
  const xrpParity = researchUtils.buildRenderedSurfaceParityViewModel({ model: xrpModel });
  assert.match(xrpParity.primaryVisibleText.join(" "), /payment|settlement|validator|liquidity|regulatory/i);
  assert.doesNotMatch(xrpParity.surfaces.decisionTab.join(" "), /EIP-?1559|L2\/blob|stablecoin reserve attestation/i);
  assert.equal(xrpParity.wrongFamilyNarrativeAssertions.length, 0);

  const buildNonEthL1Control = ({ symbol, name, network }) => {
    const composer = canonicalComposer({
      family: "non_eth_l1_smart_contract_platform",
      questionGroup: "non_eth_l1_questions",
      assetName: name,
      assetDescription: `${name} is the native asset of the ${network} base-layer network.`,
      headline: `${name}'s thesis depends on network usage, fees, validator security, liveness, and native token economics.`,
      support: `Available ${network} observations support a bounded non-Ethereum base-layer assessment.`,
      strength: "Native network identity and smart-contract platform role are established.",
      weakness: "Current usage, validator distribution, liveness, and inflation data remain open checks.",
      readiness: "The final decision remains constrained by current network-economics and security evidence.",
      question: "Are usage, security, and token economics durable?",
      answer: "The native platform role is clear, while current demand and security conditions require verification.",
      risk: "Weak usage, validator concentration, inflation, or liveness failures could weaken the thesis.",
      queue: `Verify ${network} usage, fees, validator distribution, liveness, inflation, liquidity, and access.`,
      decision: blockedDecision,
    });
    return buildCanonicalControlModel({
      asset: { symbol, name },
      family: "non_eth_l1_smart_contract_platform",
      questionGroup: "non_eth_l1_questions",
      composer,
      decision: blockedDecision,
    });
  };
  const adaNonEthModel = buildNonEthL1Control({ symbol: "ADA", name: "Cardano", network: "Cardano" });
  const avaxNonEthModel = buildNonEthL1Control({ symbol: "AVAX", name: "Avalanche", network: "Avalanche" });
  [adaNonEthModel, avaxNonEthModel].forEach((model) => {
    const parity = researchUtils.buildRenderedSurfaceParityViewModel({ model });
    assert.match(parity.primaryVisibleText.join(" "), /network usage|fees|validator|liveness|inflation/i);
    assert.doesNotMatch(parity.surfaces.decisionTab.join(" "), /EIP-?1559|ETH gas demand|L2\/blob|MEV relay/i);
    assert.equal(parity.wrongFamilyNarrativeAssertions.length, 0);
  });

  const missingComposerParity = researchUtils.buildRenderedSurfaceParityViewModel({ model: blockedTerminalModel });
  assert.equal(missingComposerParity.missingComposerControl.composerAttached, false);
  assert.equal(missingComposerParity.missingComposerControl.failClosed, true);
  assert.equal(missingComposerParity.candidateFinalContradictionAssertions.length, 0);
  assert.match(missingComposerParity.primaryVisibleText.join(" "), /canonical analyst narrative unavailable/i);

  const researchUtilsSource = readFileSync(new URL("../src/components/research/researchUtils.js", import.meta.url), "utf8");
  [
    "BTC_NATIVE_DISPLAY_COPY",
    "ETH_POS_SETTLEMENT_DISPLAY_COPY",
    "buildNativeBtcDisplayOverlay",
    "buildEthPosSettlementDisplayOverlay",
    "buildLensAwareVerdictSemantics",
    "buildLensAwareSecondaryCopy",
  ].forEach((legacyOwner) => assert.doesNotMatch(researchUtilsSource, new RegExp(legacyOwner)));
  assert.doesNotMatch(researchUtilsSource, /(?:symbol|assetSymbol)\s*={2,3}\s*["'](?:BTC|ETH|USDC)["']/i);
  const decisionSectionSource = researchUtilsSource.split('bundleSection("4. Decision Tab / Decision Snapshot"')[1]?.split('bundleSection("5. Thesis Falsification Tab"')[0] || "";
  assert.match(decisionSectionSource, /surfaceRows\?\.decisionTab/);
  assert.doesNotMatch(decisionSectionSource, /lensAware|decisionFrame\.whatMustBeTrue|not_rendered_by_ui/i);
  assert.match(researchUtilsSource, /disposition: "audit_only_not_rendered"/);
  assert.match(researchUtilsSource, /componentConsumptionProof/);
  const bundleSectionCount = (text) => (text.match(/^===\s.+\s===$/gm) || []).length;
  assert.equal(bundleSectionCount(btcBundle), bundleSectionCount(finalComposerBundle));

  console.log("Institutional Analyst Workflow render-safety smoke tests passed.");
} finally {
  await server.close();
}
