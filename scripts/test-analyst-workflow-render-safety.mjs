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

  console.log("Institutional Analyst Workflow render-safety smoke tests passed.");
} finally {
  await server.close();
}
