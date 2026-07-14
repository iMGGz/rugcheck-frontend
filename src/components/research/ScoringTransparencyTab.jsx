import React from "react";
import EvidenceConfidenceCard from "./EvidenceConfidenceCard";
import ScoreContributorsPanel from "./ScoreContributorsPanel";
import { Card, ExecutiveSummaryCard, ListBlock, QuestionPromptCard, SectionRow } from "./researchPrimitives";
import { TokenomicsSupplyIntegrityCard } from "./TokenomicsSupplyIntegrityCard";
import {
  extractRenderableText,
  formatScoreValue,
  normalizeRenderableList,
  resolveInstitutionalAnalystWorkflowContract,
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
    <span style={styles.scoringBoundaryChip}>
      {children}
    </span>
  );
}

function hasAttachedValue(value) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function firstAttached(...values) {
  return values.find((value) => hasAttachedValue(value));
}

function readableValue(value, fallback = "Not attached to live response") {
  if (!hasAttachedValue(value)) return fallback;
  if (typeof value === "number") return formatScoreValue(value);
  if (typeof value === "string") return titleCase(value);
  return extractRenderableText(value, fallback);
}

function scoreFromObject(value) {
  const obj = safeObject(value);
  return firstAttached(obj.score, obj.value, obj.overallScore, obj.level, obj.label, obj.status);
}

function buildLiveModules({ analysis, scores, confidence, model }) {
  const safeAnalysis = safeObject(analysis);
  const safeScores = safeObject(scores || safeAnalysis.scores);
  const safeConfidence = safeObject(confidence || safeAnalysis.confidence);
  const safeModel = safeObject(model);
  const decisionLayer = safeObject(safeAnalysis.decisionLayer);
  const finalDecisionScore = safeObject(decisionLayer.score);
  const hasAtomicFinalDecision = decisionLayer.audit?.calculationVersion === "final-decision-atomic-v1";
  const displayedOverallScore = hasAtomicFinalDecision
    ? (finalDecisionScore.displayable ? finalDecisionScore.displayValue : null)
    : firstAttached(safeScores.overallScore, safeModel.overallScore);
  const thesisCore = safeObject(safeAnalysis.thesisCore);
  const evidenceDirectness = safeObject(safeAnalysis.evidenceDirectness);
  const tokenDemandQuality = firstAttached(
    safeAnalysis.tokenDemandQuality,
    safeAnalysis.tdq,
    safeObject(thesisCore).tokenDemandQuality,
    safeObject(thesisCore).tokenDemand,
  );
  const policySignals = [
    ...normalizeRenderableList(safeAnalysis.policySignals),
    ...normalizeRenderableList(decisionLayer.policySignals),
    ...normalizeRenderableList(safeModel.auditAlerts),
  ];
  const capGateFields = firstAttached(
    safeAnalysis.policyCaps,
    safeAnalysis.caps,
    decisionLayer.policyCaps,
    decisionLayer.caps,
    decisionLayer.gates,
  );

  const structuralScore = firstAttached(
    safeScores.structuralQuality,
    safeScores.structuralQualityScore,
    hasAtomicFinalDecision && !finalDecisionScore.displayable ? null : safeScores.overallScore,
    hasAtomicFinalDecision && !finalDecisionScore.displayable ? null : safeModel.overallScore,
  );
  const structuralIsProxy = !hasAttachedValue(safeScores.structuralQuality) && !hasAttachedValue(safeScores.structuralQualityScore);
  const tokenomicsSupplyIntegrity = safeObject(safeModel.tokenomicsSupplyIntegrity);
  const scoringReadinessContract = safeObject(safeModel.scoringReadinessContract);
  const evidenceStatusAggregationContract = safeObject(safeModel.evidenceStatusAggregationContract);
  const benchmarkPack = safeObject(safeModel.benchmarkInstitutionalAnswerPack);
  const engineLearningFeedbackLoop = safeObject(safeModel.engineLearningBackbone?.engineLearningFeedbackLoop);
  const rawDataCoverageDiagnostics = safeObject(safeModel.rawDataCoverageDiagnostics || safeModel.providerRawDataExpansion?.rawDataCoverageDiagnostics);

  return [
    {
      title: "Overall Score",
      value: hasAtomicFinalDecision && !finalDecisionScore.displayable ? "Withheld" : readableValue(displayedOverallScore),
      source: hasAtomicFinalDecision ? "analysis.decisionLayer.score" : "analysis.scores.overallScore",
      rule: hasAtomicFinalDecision && !finalDecisionScore.displayable
        ? "The final decision withholds institutional score interpretation; the legacy numeric value remains available in Audit / Raw."
        : "Live aggregate output. Score is secondary to decision and thesis context.",
      live: "Yes",
      reportOnly: "No",
      caveat: finalDecisionScore.withholdingReason || "Does not replace analyst verification.",
      attached: hasAtomicFinalDecision || hasAttachedValue(displayedOverallScore),
    },
    {
      title: "Structural Quality",
      value: readableValue(structuralScore),
      source: structuralIsProxy ? "overallScore proxy" : "analysis.scores.structuralQuality",
      rule: structuralIsProxy
        ? "Separate structural-quality module is not attached; displaying the existing live score proxy."
        : "Live structural score field surfaced by the response.",
      live: "Yes, when attached",
      reportOnly: "No",
      caveat: structuralIsProxy ? "Proxy-derived values are not explicit backend scoring modules." : "Live score module.",
      attached: hasAttachedValue(structuralScore),
    },
    {
      title: "Evidence Support / Confidence Proxy",
      value: hasAttachedValue(safeConfidence.score)
        ? formatScoreValue(safeConfidence.score)
        : readableValue(firstAttached(safeModel.confidenceLabel, safeConfidence.label, safeConfidence.level)),
      source: "analysis.confidence / decisionModel",
      rule: "Confidence/evidence-support context can constrain conviction; it is not proof of evidence completeness.",
      live: "Yes, as live confidence context",
      reportOnly: "No",
      caveat: "Proxy-derived values are not explicit backend scoring modules.",
      attached: hasAttachedValue(firstAttached(safeConfidence.score, safeModel.confidenceLabel, safeConfidence.label, safeConfidence.level)),
    },
    {
      title: "Token Demand Quality",
      value: readableValue(scoreFromObject(tokenDemandQuality)),
      source: hasAttachedValue(tokenDemandQuality) ? "analysis.tokenDemandQuality / thesisCore token demand" : "Not attached",
      rule: hasAttachedValue(tokenDemandQuality)
        ? "Uses live token-demand fields where attached."
        : "Token Demand Quality is not attached as a distinct live score module in this response.",
      live: hasAttachedValue(tokenDemandQuality) ? "Yes, when attached" : "No attached module",
      reportOnly: "No",
      caveat: "Do not infer tokenholder accrual from TVL, usage, or narrative alone.",
      attached: hasAttachedValue(tokenDemandQuality),
    },
    {
      title: "Tokenomics Supply Integrity",
      value: readableValue(tokenomicsSupplyIntegrity.tokenomicsIntegrityScore),
      source: hasAttachedValue(tokenomicsSupplyIntegrity) ? "tokenomicsSupplyIntegrity (legacy diagnostic score plus canonical Supply Truth)" : "Not attached",
      rule: tokenomicsSupplyIntegrity.supplyTruth?.methodologyVersion
        ? `${safeArray(tokenomicsSupplyIntegrity.supplyTruth.calculatedMetrics).length} backend-owned supply calculations are attached with provenance and applicability. They are deterministic explanatory facts, not inputs to the current score.`
        : "Separate supply-integrity underwriting signal for dilution, unlocks, supply authority, and provider contradictions.",
      live: "Shown as explanatory context",
      reportOnly: "No, surfaced in live response but not integrated into current overall score",
      caveat: tokenomicsSupplyIntegrity.legacyCompatibility?.migrationBoundary || "Does not change the existing overall score or verdict in this release.",
      attached: hasAttachedValue(tokenomicsSupplyIntegrity),
    },
    {
      title: "Institutional Scoring Readiness",
      value: readableValue(scoringReadinessContract.overallReadinessStatus),
      source: hasAttachedValue(scoringReadinessContract) ? "scoringReadinessContract.overallReadinessStatus" : "Not attached",
      rule: "Evidence-to-scoring architecture for future calibrated scoring. It maps required evidence, live metrics, caps, and blockers without changing the current score.",
      live: "Shown as explanatory context",
      reportOnly: "No, surfaced in live response but not integrated into current overall score",
      caveat: "Existing overall score and verdict remain unchanged.",
      attached: hasAttachedValue(scoringReadinessContract),
    },
    {
      title: "Evidence Status Readiness",
      value: readableValue(evidenceStatusAggregationContract.assetAggregation?.primaryEvidenceStatus),
      source: hasAttachedValue(evidenceStatusAggregationContract) ? "evidenceStatusAggregationContract.assetAggregation" : "Not attached",
      rule: evidenceStatusAggregationContract.assetAggregation?.scoringReadinessImpact?.plainLanguageSummary || "Aggregates claim-level evidence into question status and readiness context without changing the current score.",
      live: "Shown as explanatory context",
      reportOnly: "No, surfaced in live response but not integrated into current overall score",
      caveat: "Does not change the existing overall score or verdict.",
      attached: hasAttachedValue(evidenceStatusAggregationContract),
    },
    {
      title: "Institutional Answer Coverage",
      value: benchmarkPack.packId
        ? `${safeArray(benchmarkPack.questions).length} answer-quality checks`
        : "Not attached",
      source: benchmarkPack.packId ? "Institutional answer coverage" : "Not attached",
      rule: benchmarkPack.scoreRationale?.readinessSummary || "Benchmark answer packs explain future score rationale candidates, caps, and blockers without changing current score.",
      live: "Shown as explanatory context",
      reportOnly: "No, surfaced in live response but not integrated into current overall score",
      caveat: benchmarkPack.packId ? "Existing overall score and verdict remain unchanged; answer coverage is not yet score-integrated." : "No answer-coverage pack matched this asset.",
      attached: Boolean(benchmarkPack.packId),
    },
    {
      title: "Engine Learning Feedback Loop",
      value: hasAttachedValue(engineLearningFeedbackLoop)
        ? `${safeArray(engineLearningFeedbackLoop.findingsApplied).length} QA finding${safeArray(engineLearningFeedbackLoop.findingsApplied).length === 1 ? "" : "s"}`
        : "Not attached",
      source: hasAttachedValue(engineLearningFeedbackLoop) ? "Engine learning feedback" : "Not attached",
      rule: "Captures manual QA and deterministic runtime findings as review context.",
      live: "Shown as explanatory context",
      reportOnly: "No, surfaced in live response but not integrated into current overall score",
      caveat: "Does not change score, verdict, provider behavior, or reviewed-evidence status.",
      attached: hasAttachedValue(engineLearningFeedbackLoop),
    },
    {
      title: "Raw Data Coverage",
      value: readableValue(rawDataCoverageDiagnostics.overallRawDataCoverageScore),
      source: hasAttachedValue(rawDataCoverageDiagnostics) ? "rawDataCoverageDiagnostics.overallRawDataCoverageScore" : "Not attached",
      rule: "Provider/category/raw-data coverage context. It surfaces missing fields and source requirements only.",
      live: "Shown as explanatory context",
      reportOnly: "No, surfaced in live response but not integrated into current overall score",
      caveat: "Does not change the existing overall score or verdict.",
      attached: hasAttachedValue(rawDataCoverageDiagnostics),
    },
    {
      title: "Evidence Directness",
      value: readableValue(firstAttached(evidenceDirectness.score, evidenceDirectness.directness, evidenceDirectness.status, evidenceDirectness.label)),
      source: hasAttachedValue(evidenceDirectness) ? "analysis.evidenceDirectness" : "Not attached",
      rule: hasAttachedValue(evidenceDirectness)
        ? "Describes how direct the live evidence is for the thesis."
        : "Evidence Directness is not attached as a distinct live module in this response.",
      live: hasAttachedValue(evidenceDirectness) ? "Yes, as evidence-quality context" : "No attached module",
      reportOnly: "No",
      caveat: "Directness does not mean explanatory evidence is score-integrated.",
      attached: hasAttachedValue(evidenceDirectness),
    },
    {
      title: "Policy Caps / Gates",
      value: policySignals.length
        ? `${policySignals.length} live signal${policySignals.length === 1 ? "" : "s"}`
        : readableValue(capGateFields),
      source: policySignals.length ? "policySignals / decisionModel.auditAlerts" : "cap/gate fields",
      rule: policySignals.length || hasAttachedValue(capGateFields)
        ? "Shows only cap/gate/blocker signals surfaced by the live response."
        : "Detailed cap/gate table is not attached to this live response.",
      live: policySignals.length || hasAttachedValue(capGateFields) ? "Yes, when surfaced" : "No attached table",
      reportOnly: "No",
      caveat: "No policy tables are invented by the frontend.",
      attached: policySignals.length || hasAttachedValue(capGateFields),
    },
    {
      title: "Decision Layer",
      value: readableValue(firstAttached(
        safeModel.allocationOutcome?.label,
        safeModel.posture,
        decisionLayer.posture,
        decisionLayer.finalDecision,
      )),
      source: "analysis.decisionLayer / decisionModel",
      rule: "Translates live scoring and gates into the visible decision posture.",
      live: "Yes",
      reportOnly: "No",
      caveat: "Explanatory overlays are not live verdict inputs.",
      attached: hasAttachedValue(firstAttached(safeModel.allocationOutcome?.label, safeModel.posture, decisionLayer.posture, decisionLayer.finalDecision)),
    },
  ];
}

function buildCapsAndGates({ analysis, model }) {
  const safeAnalysis = safeObject(analysis);
  const decisionLayer = safeObject(safeAnalysis.decisionLayer);
  const rawRows = [
    ...normalizeRenderableList(safeAnalysis.policySignals),
    ...normalizeRenderableList(decisionLayer.policySignals),
    ...normalizeRenderableList(decisionLayer.caps),
    ...normalizeRenderableList(decisionLayer.gates),
    ...normalizeRenderableList(safeObject(model).auditAlerts),
  ];

  return rawRows.map((item, index) => ({
    key: `cap-gate-${index}`,
    name: item,
    reason: "Live cap/gate/blocker signal surfaced by the current response.",
    source: index < normalizeRenderableList(safeAnalysis.policySignals).length
      ? "analysis.policySignals"
      : "decision layer / audit alerts",
    severity: /block|critical|cap|red|alert|fail/i.test(item) ? "High" : "Review",
  })).slice(0, 8);
}

function moduleTone(module) {
  if (!module.attached) return { label: "Not attached", color: "#8a94a6" };
  if (module.title.includes("Caps") || module.title.includes("Evidence")) return { label: "Gate context", color: "#ffb020" };
  return { label: "Live scoring", color: "#2fd67b" };
}

function LayerCard({ title, badge, description, status, color, styles }) {
  return (
    <div style={styles.scoringLayerCard}>
      <div style={styles.timelineTitleRow}>
        <strong style={{ color: "#f4f7ff" }}>{title}</strong>
        {chip(styles, badge, color)}
      </div>
      <div style={styles.timelineSummary}>{description}</div>
      <div style={styles.timelineMeta}>{status}</div>
    </div>
  );
}

function ModuleCard({ module, styles }) {
  const tone = moduleTone(module);

  return (
    <div style={styles.scoringModuleCard}>
      <div style={styles.scoringModuleTopline}>
        <div>
          <div style={styles.metaLabel}>{module.title}</div>
          <div style={styles.scoreContributorSummary}>{module.rule}</div>
        </div>
        {chip(styles, tone.label, tone.color)}
      </div>
      <div style={styles.scoringModuleValue}>{module.value}</div>
      <div style={styles.scoringModuleMetaGrid}>
        <SectionRow label="Source field" value={module.source} styles={styles} />
        <SectionRow label="Affects live scoring" value={module.live} styles={styles} />
        <SectionRow label="Explanatory" value={module.reportOnly} styles={styles} />
        <SectionRow label="Caveat" value={module.caveat} styles={styles} />
      </div>
    </div>
  );
}

function GuardrailCard({ text, styles }) {
  return (
    <div style={styles.scoringGuardrailCard}>
      <div style={styles.metaLabel}>Falsification guardrail</div>
      <div style={styles.contextMuted}>{text}</div>
    </div>
  );
}

function CalibrationWarningTransparency({ warnings, styles }) {
  const items = safeArray(warnings);
  if (!items.length) return null;
  return (
    <Card title="Review Warnings / Scoring Boundary" subtitle="Warnings can guide review without becoming evidence." styles={styles}>
      <div style={styles.scoringBoundaryStrip}>
        {boundaryChip(styles, "Review warning")}
        {boundaryChip(styles, "Source requirement, not evidence")}
        {boundaryChip(styles, "Affects verdict/scoring only when explicitly marked")}
      </div>
      <div style={styles.scoringModuleGrid}>
        {items.slice(0, 6).map((warning, index) => (
          <div key={`${warning.id || "warning"}-${index}`} style={styles.scoringModuleCard}>
            <div style={styles.scoringModuleTopline}>
              <div>
                <div style={styles.metaLabel}>{titleCase(String(warning.id || "Review warning").replace(/_/g, " "))}</div>
                <div style={styles.scoreContributorSummary}>{warning.issue || warning.expectedBehavior || "Manual review required."}</div>
              </div>
              {chip(styles, warning.affectsScoring ? "Affects scoring" : "Explanation context", warning.affectsScoring ? "#ff6b6b" : "#ffb020")}
            </div>
            <div style={styles.scoringModuleMetaGrid}>
              <SectionRow label="Affects verdict" value={warning.affectsVerdict ? "Yes" : "No"} styles={styles} />
              <SectionRow label="Affects scoring" value={warning.affectsScoring ? "Yes" : "No"} styles={styles} />
              <SectionRow label="Source boundary" value={warning.sourceBoundary || "Unavailable"} styles={styles} />
              <SectionRow label="Recommended action" value={warning.recommendedAction || "Manual review required."} styles={styles} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScoringReadinessTransparency({ readiness, styles }) {
  const contract = safeObject(readiness);
  if (!contract.artifactVersion) return null;
  const dimensions = safeArray(contract.dimensions);
  const sourceRequired = dimensions.filter((dimension) => dimension.evidenceStatus === "source_required" || safeArray(dimension.missingEvidence).length);
  const scoringReady = dimensions.filter((dimension) => dimension.evidenceStatus === "scoring_ready");

  return (
    <Card
      title="Institutional Scoring Readiness"
      subtitle="Future evidence-to-scoring architecture. Explanation context; current overall score and verdict are unchanged."
      styles={styles}
    >
      <div style={styles.scoringBoundaryStrip}>
        {boundaryChip(styles, "Explanation context")}
        {boundaryChip(styles, "Current score unchanged")}
        {boundaryChip(styles, "Evidence checks explain confidence")}
        {boundaryChip(styles, "Candidate sources need review")}
      </div>
      <div style={styles.scoringModuleGrid}>
        <ModuleCard
          module={{
            title: "Asset-family readiness",
            value: titleCase(contract.overallReadinessStatus || "Unavailable"),
            source: "scoringReadinessContract",
            rule: contract.committeeMemoPreview?.readinessSummary || `${contract.assetFamilyLabel || "Asset family"} readiness model.`,
            live: "Shown as explanatory context",
            reportOnly: "No, mirrored in live tabs and bundle",
            caveat: contract.legacyScoreBoundary || "Legacy score and verdict unchanged.",
            attached: true,
          }}
          styles={styles}
        />
        <ModuleCard
          module={{
            title: "Dimension coverage",
            value: `${contract.scoringReadyDimensionCount ?? scoringReady.length} ready / ${contract.sourceRequiredDimensionCount ?? sourceRequired.length} source-required`,
            source: "scoringReadinessContract.dimensions",
            rule: "Counts readiness dimensions that are source-backed, blocked, or still missing required evidence/live metrics.",
            live: "Shown as explanatory context",
            reportOnly: "No",
            caveat: "Readiness counts are not weights and do not replace the live score.",
            attached: true,
          }}
          styles={styles}
        />
      </div>
      <ListBlock
        title="Top readiness gaps"
        items={safeArray(contract.whatWouldChangeScore).slice(0, 6)}
        emptyText="No scoring-readiness gap list was attached."
        color="#f9d976"
        styles={styles}
      />
      <ListBlock
        title="Confidence caps / blockers"
        items={[...safeArray(contract.confidenceCaps), ...safeArray(contract.hardBlockers)].slice(0, 8)}
        emptyText="No scoring-readiness caps or blockers were attached."
        color="#ffb020"
        styles={styles}
      />
    </Card>
  );
}

export default function ScoringTransparencyTab({
  analysis,
  scores,
  scoreContributors,
  confidence,
  model,
  styles,
}) {
  const modules = buildLiveModules({ analysis, scores, confidence, model });
  const capsAndGates = buildCapsAndGates({ analysis, model });
  const guardrails = [
    "Market cap does not prove reserves.",
    "TVL does not prove tokenholder accrual.",
    "BTC quality does not prove WBTC custody or redeemability.",
    "Category does not prove legal clarity.",
    "Volume alone does not prove institutional exit depth.",
    "Candidate source does not equal reviewed evidence.",
  ];
  const unavailable = modules
    .filter((module) => !module.attached)
    .map((module) => `${module.title}: not attached to live response.`);
  const overallModule = modules.find((module) => module.title === "Overall Score");
  const capsModule = modules.find((module) => module.title === "Policy Caps / Gates");
  const tokenomicsModule = modules.find((module) => module.title === "Tokenomics Supply Integrity");
  const scoringReadinessModule = modules.find((module) => module.title === "Institutional Scoring Readiness");
  const coverageGate = model?.coverageScoreEligibilityContract || {};
  const canonicalRoute = model?.familyCanonicalRoutingContract || {};
  const provenance = model?.evidenceProvenanceSemanticsContract || {};
  const familyMatrix = model?.familyDataRequirementMatrixContract || {};
  const methodologyContract = model?.institutionalMethodologyContract || {};
  const provenanceCounters = provenance.readinessCounters || {};
  const benchmarkPack = safeObject(model?.benchmarkInstitutionalAnswerPack);
  const sourceIntelligence = model?.sourceIntelligenceContract || {};
  const sourceDiscovery = model?.deepResearchSourceDiscoveryContract || {};
  const sourceCandidateRegistry = model?.sourceCandidateRegistryContract || sourceDiscovery.sourceCandidateRegistryContract || {};
  const candidateAccounting = sourceCandidateRegistry.candidateAccountingSummary || sourceDiscovery.candidateAccountingSummary || {};
  const reviewWorkflow = model?.sourceCandidateReviewWorkflowContract || {};
  const reviewQueue = model?.sourceCandidateReviewQueueContract || reviewWorkflow.sourceCandidateReviewQueueContract || {};
  const analystWorkflow = resolveInstitutionalAnalystWorkflowContract(model, analysis) || {};
  const sourceCoverageRegistry = safeObject(model?.institutionalQuestionSourceCoverageContract);
  const finalComposer = safeObject(model?.finalAnalystAnswerComposerContract);
  const composerAvailable = finalComposer?.contractAttached === true;
  const composerScore = safeObject(finalComposer.scoreExplanationBridge);

  return (
    <div style={styles.scoringTransparencyShell}>
      <ExecutiveSummaryCard
        eyebrow="Scoring Transparency"
        title="Why does the score look like this?"
        answer={composerAvailable
          ? composerScore.explanation || "This view explains the current score, verdict, and confidence using the canonical analyst composer."
          : "Canonical score explanation is unavailable; the existing score object remains visible without a reconstructed evidence narrative."}
        tone="#7dd3fc"
        badges={[
          { label: `Overall: ${overallModule?.value || "Unavailable"}`, tone: "#7dd3fc" },
          { label: capsAndGates.length ? `${capsAndGates.length} cap/gate signals` : "No cap table attached", tone: capsAndGates.length ? "#f9d976" : "#d5dcec" },
          { label: "Explanation context", tone: "#d5dcec" },
        ]}
        styles={styles}
      >
        <div style={styles.scoringBoundaryStrip}>
          {boundaryChip(styles, `Current score: ${overallModule?.value || "Unavailable"}`)}
          {boundaryChip(styles, coverageGate.scoreEligibility || "Eligibility unavailable")}
          {boundaryChip(styles, coverageGate.coverageTierLabel || "Coverage tier unavailable")}
        </div>
        <ListBlock
          title="What currently caps confidence"
          items={safeArray(composerAvailable ? composerScore.whatWouldImproveScoreOrConfidence : []).slice(0, 4)}
          emptyText="No additional confidence cap was attached."
          color="#f9d976"
          styles={styles}
        />
        <SectionRow
          label="Score meaning"
          value={composerAvailable ? "The displayed score reflects the current model. The canonical composer explains it without changing the formula." : "The displayed score reflects the existing score object; no fallback evidence interpretation is attached."}
          styles={styles}
        />
      </ExecutiveSummaryCard>

      {sourceCoverageRegistry.registryVersion ? (
        <Card
          title="Question Evidence Readiness"
          subtitle="Diagnostic requirements only; this registry does not alter the score or verdict."
          styles={styles}
        >
          <div style={styles.scoringBoundaryStrip}>
            {boundaryChip(styles, `${safeArray(sourceCoverageRegistry.supportedQuestionTypes).length} question types`)}
            {boundaryChip(styles, `${safeArray(sourceCoverageRegistry.observationTypeCatalog).length} typed observations`)}
            {boundaryChip(styles, `${safeArray(sourceCoverageRegistry.forbiddenInputRules).length} forbidden-input controls`)}
            {boundaryChip(styles, sourceCoverageRegistry.contractStatus || "Status unavailable")}
          </div>
          <SectionRow
            label="Readiness boundary"
            value="Specialized institutional questions require eligible typed observations. Unrelated market data remains context, and missing evidence is a gap rather than a negative conclusion."
            styles={styles}
          />
        </Card>
      ) : null}

      {!composerAvailable && analystWorkflow.artifactVersion ? (
        <Card title="Autonomous Module Readiness" subtitle="Diagnostic input readiness only; final score and verdict formulas are unchanged." styles={styles}>
          <div style={styles.scoringBoundaryStrip}>
            {boundaryChip(styles, `${analystWorkflow.moduleScoringReadiness?.filter((module) => module.autonomousInputSupport === "strong").length || 0} strong-support modules`)}
            {boundaryChip(styles, `${analystWorkflow.moduleScoringReadiness?.filter((module) => module.scoreEligibility === "blocked").length || 0} blocked modules`)}
            {boundaryChip(styles, "Future calibration required")}
          </div>
          <ListBlock
            title="Module readiness"
            items={safeArray(analystWorkflow.moduleScoringReadiness).map((module) =>
              `${module.module}: ${module.autonomousInputSupport}; ${module.scoreEligibility}. ${module.answerSummary}`
            )}
            emptyText="No autonomous module-readiness object was attached."
            color="#9bd7ff"
            styles={styles}
          />
        </Card>
      ) : null}

      {!composerAvailable && methodologyContract.contractVersion === "1.1.0" ? (
        <Card title="Methodology Readiness" subtitle="Diagnostic framework only; it does not alter the current score or verdict." styles={styles}>
          <div style={styles.scoringBoundaryStrip}>
            {boundaryChip(styles, `${methodologyContract.registrySummary?.canonicalFamilyCount || 0} canonical families`)}
            {boundaryChip(styles, `${methodologyContract.registrySummary?.moduleCount || 0} analyst modules`)}
            {boundaryChip(styles, `${methodologyContract.registrySummary?.regressionControlCount || 0} regression controls`)}
            {boundaryChip(styles, methodologyContract.validation?.valid ? "Registry PASS" : "Registry review required")}
          </div>
        </Card>
      ) : null}

      <div style={styles.advancedGrid}>
        <QuestionPromptCard
          question="Which live score is visible?"
          answer={overallModule?.rule || "Overall score module was not attached."}
          status={overallModule?.value || "Unavailable"}
          impact="Live score"
          sourceState={overallModule?.source || "Not attached"}
          styles={styles}
        />
        <QuestionPromptCard
          question="Which caps or gates apply?"
          answer={capsAndGates[0]?.name || capsModule?.rule || "No cap/gate signal was attached to the display model."}
          status={capsAndGates.length ? "Review gates" : "None attached"}
          impact="Score boundary"
          sourceState="Policy signals"
          styles={styles}
        />
        <QuestionPromptCard
          question="Which signals are explanatory?"
          answer={scoringReadinessModule?.rule || tokenomicsModule?.rule || "No explanatory module context was attached."}
          status="Explanation context"
          impact="Not overall scoring"
          sourceState={scoringReadinessModule?.source || tokenomicsModule?.source || "Not attached"}
          styles={styles}
        />
        <QuestionPromptCard
          question="Is the score institutionally eligible?"
          answer={coverageGate.primaryUserMessage || "Coverage score-eligibility gate was not attached."}
          status={coverageGate.scoreEligibility || "Unavailable"}
          impact={composerScore.scoreDisplayLabel || "Score display policy unavailable"}
          sourceState={coverageGate.coverageTierLabel || "Coverage tier unavailable"}
          styles={styles}
        />
        <QuestionPromptCard
          question="Is reviewed evidence part of the score?"
          answer={provenance.coverageScoreEligibilitySemantics?.scoringActivationReadiness || provenance.assetSummary?.scoreEvidenceBasis || "Evidence provenance semantics were not attached."}
          status={provenance.assetSummary?.scoreEvidenceBasis || "Score basis unavailable"}
          impact="Score integration boundary"
          sourceState={provenance.contractAttached ? "Evidence provenance contract" : "Not attached"}
          styles={styles}
        />
        <QuestionPromptCard
          question="Can source intelligence activate scoring?"
          answer={sourceIntelligence.artifactVersion
            ? "No. Source Intelligence classifies evidence readiness and boundary violations; it does not activate evidence in the numerical score."
            : "Source Intelligence contract was not attached."}
          status={sourceIntelligence.artifactVersion ? "Not scoring-active" : "Unavailable"}
          impact={`${sourceIntelligence.summary?.scoringActiveEvidenceCount || 0} active evidence packets`}
          sourceState="Diagnostic evidence registry"
          styles={styles}
        />
        <QuestionPromptCard
          question="Can discovered source candidates affect this score?"
          answer={sourceDiscovery.artifactVersion
            ? "No. Discovered sources remain unreviewed candidates and cannot resolve evidence gaps or affect the numerical score."
            : "Source discovery candidate contract was not attached."}
          status={sourceDiscovery.artifactVersion ? "Not scoring-active" : "Unavailable"}
          impact={`${sourceCandidateRegistry.summary?.scoringActiveCandidateCount || 0} active; ${candidateAccounting.acceptedCandidateCount ?? 0} accepted for review`}
          sourceState={`${candidateAccounting.limitStatus || "Limit status unavailable"}; discovery only`}
          styles={styles}
        />
        <QuestionPromptCard
          question="Can reviewed source candidates affect this score?"
          answer={reviewWorkflow.artifactVersion
            ? "No. Source review can make a candidate eligible for future evidence packet drafting, but it does not create reviewed evidence or scoring support."
            : "Source candidate review workflow was not attached."}
          status={`${reviewQueue.summary?.scoringActiveCandidateCount || 0} scoring-active candidates`}
          impact={`${reviewQueue.summary?.evidencePacketDraftEligibleCount || 0} packet-draft eligible`}
          sourceState="Source review is not evidence review"
          styles={styles}
        />
        <QuestionPromptCard
          question="Which family blockers are in scope?"
          answer={canonicalRoute.canonicalCoverageBlockerNamespace
            ? `${canonicalRoute.canonicalCoverageBlockerNamespace}; ${safeArray(canonicalRoute.familyScopedBlockers).slice(0, 3).join("; ") || "blocker themes unavailable"}.`
            : "Canonical blocker namespace was not attached."}
          status={canonicalRoute.canonicalQuestionGroup || "Route unavailable"}
          impact="Wrong-family leakage guard"
          sourceState="Family canonical route"
          styles={styles}
        />
        <QuestionPromptCard
          question="Which data requirements cap confidence?"
          answer={safeArray(familyMatrix.confidenceCapRules)[0]?.label || "Family Data Requirement Matrix v2 was not attached."}
          status={familyMatrix.primarySourceMatrixId || "Matrix unavailable"}
          impact={familyMatrix.artifactVersion ? "Requirement/readiness context" : "Unavailable"}
          sourceState="No score formula change"
          styles={styles}
        />
      </div>

      <CalibrationWarningTransparency warnings={model?.calibrationWarnings} styles={styles} />

      {methodologyContract.artifactVersion ? (
        <Card
          title="Institutional Methodology Coverage"
          subtitle="Versioned diagnostic framework only. It does not alter the current score, verdict, route, or evidence status."
          styles={styles}
        >
          <div style={styles.scoringBoundaryStrip}>
            {boundaryChip(styles, methodologyContract.contractVersion || "Methodology v1")}
            {boundaryChip(styles, `${methodologyContract.registrySummary?.familyDefinitionCount || 0} asset families`)}
            {boundaryChip(styles, `${methodologyContract.registrySummary?.questionCount || 0} institutional questions`)}
            {boundaryChip(styles, "Scoring inactive")}
          </div>
          <SectionRow
            label="Methodology boundary"
            value={methodologyContract.currentRuntimeEffect || "Diagnostic methodology coverage is attached."}
            styles={styles}
          />
          <SectionRow
            label="Validation"
            value={methodologyContract.validation?.valid ? "Registry references and evidence boundaries validated." : "Methodology registry validation requires review."}
            styles={styles}
          />
        </Card>
      ) : null}

      {coverageGate.artifactVersion ? (
        <Card
          title="Coverage Tier + Score Eligibility"
          subtitle="Display/readiness gate only. Current score and verdict formulas are unchanged."
          styles={styles}
        >
          <div style={styles.scoringBoundaryStrip}>
            {boundaryChip(styles, coverageGate.coverageTierLabel || coverageGate.coverageTier || "Coverage tier")}
            {boundaryChip(styles, coverageGate.scoreEligibility || "Score eligibility")}
            {boundaryChip(styles, composerScore.scoreDisplayLabel || "Score display policy")}
            {boundaryChip(styles, "Legacy score preserved for audit")}
          </div>
          <SectionRow label="Primary message" value={coverageGate.primaryUserMessage || coverageGate.coverageTierReason || "Coverage gate attached."} styles={styles} />
          <ListBlock title="Critical blockers" items={safeArray(coverageGate.criticalBlockers).map((blocker) => blocker.label).slice(0, 6)} emptyText="No critical coverage blockers attached." color="#ffb020" styles={styles} />
          <ListBlock title="What would make score eligible" items={safeArray(coverageGate.whatWouldMakeScoreEligible).slice(0, 6)} emptyText="No score-eligibility requirements attached." color="#7dd3fc" styles={styles} />
        </Card>
      ) : null}

      {provenance.contractAttached ? (
        <Card
          title="Evidence Provenance + Readiness"
          subtitle="Why explanation support, live readiness, and score integration can differ."
          styles={styles}
        >
          <div style={styles.scoringBoundaryStrip}>
            {boundaryChip(styles, provenance.assetSummary?.summaryLabel || "Evidence provenance separated")}
            {boundaryChip(styles, provenance.assetSummary?.manualEvidenceReadiness || "Manual evidence status unavailable")}
            {boundaryChip(styles, provenance.assetSummary?.liveDataReadiness || "Current data status unavailable")}
            {boundaryChip(styles, provenance.assetSummary?.scoreEvidenceBasis || "Score basis unavailable")}
          </div>
          <SectionRow
            label="Coverage basis"
            value={provenance.coverageScoreEligibilitySemantics?.coverageEvidenceBasis || "Coverage evidence basis was not attached."}
            styles={styles}
          />
          <SectionRow
            label="Score basis"
            value={provenance.coverageScoreEligibilitySemantics?.scoreEvidenceBasis || "Reviewed/display evidence is not automatically part of the numerical score."}
            styles={styles}
          />
          <div style={styles.scoringModuleGrid}>
            <ModuleCard
              module={{
                title: "Reviewed evidence",
                value: `${provenanceCounters.manualReviewedEvidenceClaims || 0} claim${provenanceCounters.manualReviewedEvidenceClaims === 1 ? "" : "s"}`,
                source: "evidenceProvenanceSemanticsContract.readinessCounters",
                rule: "Can support mechanism and explanation when mapped, but is not included in the numerical score in this release.",
                live: "Display support",
                reportOnly: "No, visible as evidence-readiness context",
                caveat: provenance.assetSummary?.manualEvidenceReadiness || "Manual evidence status unavailable.",
                attached: true,
              }}
              styles={styles}
            />
            <ModuleCard
              module={{
                title: "Live metric gaps",
                value: `${provenanceCounters.liveMetricGaps || 0} gap${provenanceCounters.liveMetricGaps === 1 ? "" : "s"}`,
                source: "evidenceProvenanceSemanticsContract.readinessGaps",
                rule: "Current provider/API data needs are tracked separately from reviewed mechanism evidence.",
                live: "Current-data readiness",
                reportOnly: "No, visible as source/readiness context",
                caveat: provenance.assetSummary?.liveDataReadiness || "Current-data status unavailable.",
                attached: true,
              }}
              styles={styles}
            />
          </div>
          <ListBlock
            title="Score integration gaps"
            items={provenance.scoringActivationGaps}
            emptyText="No score-integration gap was attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      <ScoringReadinessTransparency readiness={model?.scoringReadinessContract} styles={styles} />

      {familyMatrix.artifactVersion ? (
        <Card
          title="Family Data Requirement Matrix"
          subtitle="Requirement/readiness context only. It does not change the current score formula."
          styles={styles}
        >
          <div style={styles.scoringBoundaryStrip}>
            {boundaryChip(styles, familyMatrix.primaryFamily || "Family unavailable")}
            {boundaryChip(styles, familyMatrix.primarySourceMatrixId || "Source matrix unavailable")}
            {boundaryChip(styles, "No score formula change")}
            {boundaryChip(styles, "Source candidates not promoted")}
          </div>
          <ListBlock
            title="Scoring transparency rows"
            items={familyMatrix.scoringTransparencyRows}
            emptyText="No family matrix scoring-transparency rows were attached."
            color="#7dd3fc"
            styles={styles}
          />
          <ListBlock
            title="Score eligibility blockers"
            items={safeArray(familyMatrix.scoreEligibilityBlockers).map((item) => item.label)}
            emptyText="No family matrix score-eligibility blockers were attached."
            color="#ffb020"
            styles={styles}
          />
        </Card>
      ) : null}

      {benchmarkPack.packId ? (
        <Card
          title="Benchmark Answer Pack Score Rationale"
          subtitle="Future score-rationale preview only. Existing score and verdict are unchanged."
          styles={styles}
        >
          <div style={styles.scoringBoundaryStrip}>
            {boundaryChip(styles, "Explanation context")}
            {boundaryChip(styles, "Current score unchanged")}
            {boundaryChip(styles, "Current score unchanged")}
          </div>
          <SectionRow label="Readiness summary" value={benchmarkPack.scoreRationale?.readinessSummary || "Benchmark score rationale attached."} styles={styles} />
          <ListBlock title="Candidate confidence caps" items={safeArray(benchmarkPack.confidenceCaps).slice(0, 6)} emptyText="No benchmark confidence caps attached." color="#f9d976" styles={styles} />
          <ListBlock title="Candidate hard blockers" items={safeArray(benchmarkPack.hardBlockers).slice(0, 6)} emptyText="No benchmark blockers attached." color="#ffb020" styles={styles} />
          <ListBlock title="Future score-readiness gaps" items={safeArray(benchmarkPack.scoreRationale?.scoreReadinessGaps).slice(0, 6)} emptyText="No benchmark score-readiness gaps attached." color="#c7a7ff" styles={styles} />
        </Card>
      ) : null}

      <TokenomicsSupplyIntegrityCard tokenomics={model?.tokenomicsSupplyIntegrity} styles={styles} compact />

      <div style={styles.scoringLayerGrid}>
        <LayerCard
          title="Live Scoring Layer"
          badge="Current scoring"
          color="#2fd67b"
          description="Uses scoring modules and decision-layer fields attached to the current live analysis response."
          status="Affects current decision."
          styles={styles}
        />
        <LayerCard
          title="Explanatory Evidence Layer"
          badge="Context only"
          color="#7dd3fc"
          description="Manual/source-backed workflow context when attached later. It does not change the live score."
          status="Does not affect current scoring."
          styles={styles}
        />
        <LayerCard
          title="Source Candidate Layer"
          badge="Candidate only"
          color="#ffb020"
          description="Candidate sources require review before use."
          status="Cannot affect scoring."
          styles={styles}
        />
        <LayerCard
          title="Manual Review Workflow"
          badge="Workflow signal"
          color="#ffb020"
          description="Manual review can indicate unresolved verification needs or confidence caps."
          status="Not automatic proof of failure."
          styles={styles}
        />
      </div>

      <Card title="Live Score Breakdown" subtitle="Current live fields only. Missing modules stay explicitly unattached." styles={styles}>
        <div style={styles.scoringModuleGrid}>
          {modules.map((module) => (
            <ModuleCard key={module.title} module={module} styles={styles} />
          ))}
        </div>
        <ListBlock
          title="Unavailable live modules"
          items={unavailable}
          emptyText="All expected transparency module slots had some live response context."
          color="#8a94a6"
          styles={styles}
        />
      </Card>

      <div style={styles.advancedGrid}>
        <Card title="Caps / Gates / Blockers" subtitle="Only live-response signals are shown. No policy table is invented." styles={styles}>
          {capsAndGates.length ? capsAndGates.map((entry) => (
            <div key={entry.key} style={styles.reviewSignalCard}>
              <div style={styles.timelineTitleRow}>
                <strong style={{ color: "#f4f7ff" }}>{entry.name}</strong>
                {chip(styles, entry.severity, entry.severity === "High" ? "#ff6b6b" : "#ffb020")}
              </div>
              <div style={styles.timelineSummary}>{entry.reason}</div>
              <div style={styles.timelineMeta}>{entry.source} - live response signal only</div>
            </div>
          )) : (
            <p style={styles.timelineEmptyText}>Detailed cap/gate table is not attached to this live response.</p>
          )}
        </Card>

        <Card title="What The Engine Refused To Infer" subtitle="Falsification guardrails." styles={styles}>
          <div style={styles.scoringGuardrailGrid}>
            {guardrails.map((item) => (
              <GuardrailCard key={item} text={item} styles={styles} />
            ))}
          </div>
        </Card>
      </div>

      <div style={styles.scoringDetailsStack}>
        <ScoreContributorsPanel scoreContributors={scoreContributors} styles={styles} />
        <EvidenceConfidenceCard model={model} styles={styles} />
      </div>
    </div>
  );
}

