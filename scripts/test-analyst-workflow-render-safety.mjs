import assert from "node:assert/strict";
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
