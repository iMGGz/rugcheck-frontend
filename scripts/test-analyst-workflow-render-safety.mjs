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
  assert.match(presentHtml, /Workflow thesis/);

  const nestedHtml = renderDecision({
    ...baseModel,
    analysis: { institutionalAnalystWorkflowContract: workflow },
  });
  assert.match(nestedHtml, /Workflow thesis/);

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
  const structuredProtectedReport = researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: "BTC" },
    model: {
      ...baseModel,
      institutionalAnswerSurfaceContract: structuredAnswerContract,
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
  assert.doesNotMatch(structuredProtectedReport, /qsc_|registryGateStatus|rejectedQuestionEvidence/);

  const aliasProtectedReport = researchUtils.buildProtectedInvestorReportText({
    asset: { symbol: "TEST" },
    model: canonicalRouteModel,
  });
  assert.match(aliasProtectedReport, /Analyst workflow family: Native Eth Pos Gas L2 Fee Market/);
  assert.doesNotMatch(aliasProtectedReport, /methodologyFamilyAlias|aliasesNormalized|native_eth_pos_settlement_gas_fee_market/);

  console.log("Institutional Analyst Workflow render-safety smoke tests passed.");
} finally {
  await server.close();
}
