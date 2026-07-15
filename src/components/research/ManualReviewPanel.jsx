import React from "react";
import { Card, ExecutiveSummaryCard, ListBlock, QuestionPromptCard, SectionRow } from "./researchPrimitives";
import {
  cleanPrimaryAnswerText,
  getAnalystAnswerCard,
  isPrimaryFamilyCompatibleText,
  normalizeRenderableList,
  providerLabel,
  resolveInstitutionalAnalystWorkflowContract,
  safeArray,
  safeObject,
  titleCase,
} from "./researchUtils";
import { TokenomicsSupplyIntegrityCard } from "./TokenomicsSupplyIntegrityCard";

function chip(styles, label, color = "#ffb020") {
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

function providerReviewSignals(providerDiagnostics) {
  return safeArray(providerDiagnostics)
    .filter((entry) => (
      entry.status === "failure" ||
      entry.status === "skipped" ||
      ["missing", "unavailable", "unsupported", "weak", "partial"].includes(entry.coverage || "")
    ))
    .map((entry) => ({
      label: providerLabel(entry.provider || entry.source || entry.section || "provider"),
      description: entry.reason || "Provider/source context needs verification.",
      status: entry.status === "failure" ? "Provider unavailable" : "Needs verification",
      source: "meta.providerDiagnostics",
      color: entry.status === "failure" ? "#ff6b6b" : "#ffb020",
    }));
}

function sourceStatusReviewSignals(sourceStatus) {
  return Object.entries(safeObject(sourceStatus))
    .filter(([, value]) => ["partial", "modeled", "weak", "unsupported", "skipped", "unavailable", "missing"].includes(String(value).toLowerCase()))
    .map(([section, value]) => ({
      label: providerLabel(section),
      description: `Live source status is ${titleCase(value)}.`,
      status: ["unsupported", "skipped", "unavailable", "missing"].includes(String(value).toLowerCase()) ? "Needs source" : "Needs verification",
      source: "sourceStatus",
      color: "#ffb020",
    }));
}

function buildLiveReviewSignals({ model, sourceStatus, providerDiagnostics, evidenceStatusProxy }) {
  const canonicalPrimaryFamily = model?.canonicalProductRoute?.primaryFamily
    || model?.primaryAnalysisRoute?.assetFamily
    || null;
  const manual = model?.manualReviewStatus?.label && !String(model.manualReviewStatus.label).toLowerCase().includes("no explicit")
    ? [{
      label: model.manualReviewStatus.label,
      description: model.manualReviewStatus.detail || "Manual review proxy is active in the live response.",
      status: "Review required",
      source: "decisionModel.manualReviewStatus",
      color: "#ffb020",
    }]
    : [];
  const missing = normalizeRenderableList(model?.missingCritical).map((entry) => ({
    label: "Missing critical evidence",
    description: entry,
    status: "Needs source",
    source: "decisionModel.missingCritical",
    color: "#ffb020",
  }));
  const required = normalizeRenderableList(model?.requiredConditions).map((entry) => ({
    label: "Required condition",
    description: entry,
    status: "Needs verification",
    source: "decisionModel.requiredConditions",
    color: "#7dd3fc",
  }));
  const alerts = normalizeRenderableList(model?.auditAlerts).map((entry) => ({
    label: "Audit alert",
    description: entry,
    status: "Audit alert",
    source: "decisionModel.auditAlerts",
    color: "#ff6b6b",
  }));
  const conflicts = model?.evidenceConflicts ? [{
    label: "Evidence conflict",
    description: "Conflicting or unresolved evidence appears in the live response.",
    status: "Needs contradiction review",
    source: "decisionModel.evidenceConflicts",
    color: "#ff6b6b",
  }] : [];
  const proxySignals = safeArray(evidenceStatusProxy?.items)
    .filter((item) => ["provider_gap", "contradiction_audit", "manual_review_signal", "missing_critical"].includes(item.key))
    .map((item) => ({
      label: item.label,
      description: item.description,
      status: item.valueLabel || "Review required",
      source: item.sourceLabel || "deriveEvidenceStatusProxy",
      color: item.severity === "critical" ? "#ff6b6b" : "#ffb020",
    }));
  const freshness = model?.analysisFreshness || {};
  const identity = model?.assetIdentityResolution || {};
  const freshnessSignals = safeArray(freshness.freshnessWarnings).map((entry) => ({
    label: "Analysis freshness",
    description: entry,
    status: freshness.freshQaEligible ? (freshness.isPartialRefresh ? "Partial refresh caveat" : "Freshness context") : "Fresh analysis required for QA",
    source: "decisionModel.analysisFreshness",
    color: freshness.isFreshLive ? "#7dd3fc" : "#ffb020",
  }));
  const identitySignals = [
    ...safeArray(identity.identityWarnings),
    ...safeArray(identity.chainWarnings),
    ...safeArray(identity.contractWarnings),
  ].map((entry) => ({
    label: "Asset identity guardrail",
    description: entry,
    status: "Identity review",
    source: "decisionModel.assetIdentityResolution",
    color: "#ffb020",
  }));
  const tokenomics = model?.tokenomicsSupplyIntegrity || {};
  const tokenomicsSignals = [
    ...safeArray(tokenomics.manualReviewTriggers),
    ...safeArray(tokenomics.hardBlockers),
    ...safeArray(tokenomics.scoreCaps),
    ...safeArray(tokenomics.confidenceCaps),
  ].map((entry) => ({
    label: "Tokenomics supply integrity",
    description: entry,
    status: "Supply review",
    source: "decisionModel.tokenomicsSupplyIntegrity",
    color: "#ffb020",
  }));
  const readiness = model?.scoringReadinessContract || {};
  const scoringReadinessSignals = [
    ...safeArray(readiness.hardBlockers),
    ...safeArray(readiness.confidenceCaps),
    ...safeArray(readiness.whatWouldChangeScore).slice(0, 4),
  ].map((entry) => ({
    label: "Institutional scoring readiness",
    description: entry,
    status: "Readiness review item",
    source: "decisionModel.scoringReadinessContract",
    color: "#c7a7ff",
  }));
  const reviewedEvidence = model?.reviewedEvidencePacket || {};
  const synthesizedAnswerSignals = [
    ...safeArray(model?.institutionalQuestions),
    ...safeArray(model?.tokenomicsSupplyIntegrity?.institutionalQuestions),
  ]
    .filter((question) => question?.synthesizedAnswer
      && question.synthesizedAnswer.applicabilityStatus !== "not_applicable"
      && question.applicability?.status !== "not_applicable"
      && question.answerStatus !== "not_applicable")
    .flatMap((question) => [
      ...safeArray(getAnalystAnswerCard(question).missingEvidence).slice(0, 1).map((entry) => `Missing evidence: ${entry}`),
      ...safeArray(question.synthesizedAnswer.warnings),
      ...safeArray(question.synthesizedAnswer.identityWarnings),
    ].slice(0, 2).map((entry) => ({
      label: getAnalystAnswerCard(question).headlineStatus || "Analyst answer review",
      description: `${question.questionText || question.questionId || "question"}: ${entry}. ${getAnalystAnswerCard(question).manualReviewImplication || ""}`.trim(),
      status: "Review boundary",
      source: "decisionModel.institutionalQuestions.synthesizedAnswer.analystAnswerCard",
      color: "#ffb020",
    })));
  const reviewedEvidenceSignals = [
    ...safeArray(reviewedEvidence.warnings).map((entry) => ({
      label: "Reviewed evidence packet",
      description: entry,
      status: "Reviewed-evidence review",
      source: "decisionModel.reviewedEvidencePacket.warnings",
      color: "#ffb020",
    })),
    ...safeArray(reviewedEvidence.questionMappings)
      .filter((mapping) => safeArray(mapping.contradictionNotes).length || mapping.freshnessStatus === "stale")
      .map((mapping) => ({
        label: "Reviewed evidence question mapping",
        description: `${mapping.questionId}: ${safeArray(mapping.contradictionNotes).join("; ") || "Stale source mapped."}`,
        status: mapping.freshnessStatus === "stale" ? "Stale source" : "Contradiction review",
        source: "decisionModel.reviewedEvidencePacket.questionMappings",
        color: mapping.freshnessStatus === "stale" ? "#ffb020" : "#ff6b6b",
      })),
  ];
  const benchmarkPack = model?.benchmarkInstitutionalAnswerPack || {};
  const benchmarkPackSignals = [
    ...safeArray(benchmarkPack.hardBlockers).map((entry) => ({
      label: "Benchmark answer-pack blocker",
      description: entry,
      status: "Evidence blocker",
      source: "decisionModel.benchmarkInstitutionalAnswerPack.hardBlockers",
      color: "#ffb020",
    })),
    ...safeArray(benchmarkPack.confidenceCaps).map((entry) => ({
      label: "Benchmark answer-pack confidence cap",
      description: entry,
      status: "Confidence cap",
      source: "decisionModel.benchmarkInstitutionalAnswerPack.confidenceCaps",
      color: "#c7a7ff",
    })),
    ...safeArray(benchmarkPack.questions)
      .filter((question) => question.manualReviewRequired)
      .slice(0, 5)
      .map((question) => ({
        label: "Benchmark institutional answer review",
        description: `${question.questionText || question.questionId}: ${question.directAnswer || "Manual review required."}`,
        status: question.priority === "critical" ? "Critical review" : "Manual review",
        source: "decisionModel.benchmarkInstitutionalAnswerPack.questions",
        color: question.priority === "critical" ? "#ff6b6b" : "#ffb020",
      })),
  ];
  const engineLearning = model?.engineLearningBackbone || {};
  const feedbackLoop = engineLearning.engineLearningFeedbackLoop || {};
  const engineLearningSignals = [
    ...safeArray(engineLearning.outputQaChecks)
      .filter((check) => check.status === "fail" || check.status === "advisory")
      .slice(0, 4)
      .map((check) => ({
        label: "Engine-learning output QA",
        description: `${check.description || check.id || "Output QA check"} ${check.remediation ? `Remediation: ${check.remediation}` : ""}`.trim(),
        status: check.status === "fail" ? "QA failure" : "QA advisory",
        source: "decisionModel.engineLearningBackbone.outputQaChecks",
        color: check.status === "fail" ? "#ff6b6b" : "#f9d976",
      })),
    ...safeArray(engineLearning.calibrationAnomalies).slice(0, 3).map((anomaly) => ({
      label: "Engine-learning calibration anomaly",
      description: anomaly.description || anomaly.calibrationAction || anomaly.anomalyId || "Calibration anomaly",
      status: "Methodology review",
      source: "decisionModel.engineLearningBackbone.calibrationAnomalies",
      color: "#f9d976",
    })),
    ...safeArray(feedbackLoop.findingsApplied)
      .filter((finding) => finding.manualReviewRequired)
      .slice(0, 5)
      .map((finding) => ({
        label: "Engine learning feedback",
        description: `${finding.title || finding.findingType || "Finding"}: ${finding.summary || finding.expectedBehavior || "Manual review required."}`,
        status: "Review item",
        source: "decisionModel.engineLearningBackbone.engineLearningFeedbackLoop.findingsApplied",
        color: "#c7a7ff",
      })),
  ];
  const rawDataExpansion = model?.providerRawDataExpansion || {};
  const rawDataCoverage = model?.rawDataCoverageDiagnostics || rawDataExpansion.rawDataCoverageDiagnostics || {};
  const rawDataSignals = [
    ...safeArray(rawDataCoverage.manualReviewRequiredFields),
    ...safeArray(rawDataExpansion.categoryDataMissingFields).map((field) => `Missing provider raw-data field: ${field}`),
  ].slice(0, 6).map((entry) => ({
    label: "Provider raw-data coverage",
    description: entry,
    status: "Manual/source review",
    source: "decisionModel.rawDataCoverageDiagnostics",
    color: "#f9d976",
  }));
  const evidenceAggregation = model?.evidenceStatusAggregationContract || {};
  const evidenceAggregationSignals = [
    ...safeArray(evidenceAggregation.manualReviewItems).map((item) => ({
      label: "Evidence readiness review",
      description: cleanPrimaryAnswerText(item || "Manual review required."),
      status: "Review before stronger conclusions",
      source: "decisionModel.evidenceStatusAggregationContract.manualReviewItems",
      color: "#f9d976",
    })),
    ...safeArray(evidenceAggregation.conflicts).map((conflict) => ({
      label: "Evidence aggregation conflict",
      description: cleanPrimaryAnswerText(conflict.summary || conflict.conflictId || "Evidence contradiction requires review."),
      status: titleCase(conflict.severity || "Review required"),
      source: "decisionModel.evidenceStatusAggregationContract.conflicts",
      color: conflict.severity === "critical" ? "#ff6b6b" : "#ffb020",
    })),
  ];

  const combined = [
    ...manual,
    ...evidenceAggregationSignals,
    ...rawDataSignals,
    ...engineLearningSignals,
    ...benchmarkPackSignals,
    ...synthesizedAnswerSignals,
    ...reviewedEvidenceSignals,
    ...scoringReadinessSignals,
    ...tokenomicsSignals,
    ...identitySignals,
    ...freshnessSignals,
    ...conflicts,
    ...missing,
    ...required,
    ...alerts,
    ...providerReviewSignals(providerDiagnostics),
    ...sourceStatusReviewSignals(sourceStatus),
    ...proxySignals,
  ];
  const seen = new Set();

  return combined.filter((entry) => isPrimaryFamilyCompatibleText(
    `${entry.label || ""} ${entry.description || ""}`,
    canonicalPrimaryFamily,
  )).filter((entry) => {
    const key = `${entry.label}-${entry.description}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((entry) => ({
    ...entry,
    label: cleanPrimaryAnswerText(entry.label),
    description: cleanPrimaryAnswerText(entry.description),
    status: cleanPrimaryAnswerText(entry.status),
    source: cleanPrimaryAnswerText(entry.source),
  })).slice(0, 10);
}

function analystVerificationItems(model) {
  const liveItems = [
    ...normalizeRenderableList(model?.missingCritical),
    ...normalizeRenderableList(model?.requiredConditions),
    ...normalizeRenderableList(model?.auditAlerts),
  ].slice(0, 3);

  return [
    ...liveItems.map((item) => `Verify live-response issue: ${item}`),
    "Confirm source authenticity, publisher identity, and current freshness.",
    "Check claim scope and mapped evidence domain before relying on it.",
    "Check contradiction risk and whether the evidence is only explanatory context.",
  ].slice(0, 6);
}

function CalibrationWarningsCard({ warnings, styles }) {
  const items = safeArray(warnings);
  if (!items.length) return null;

  return (
    <Card title="Calibration Warnings" subtitle="Review guardrails, not final verdicts." styles={styles}>
      <div style={styles.engineNotice}>
        Calibration warnings flag live-path presentation or routing risks. They do not create evidence and do not change scoring by themselves.
      </div>
      <div style={styles.institutionalQuestionAnswerGrid}>
        {items.map((warning, index) => (
          <div key={`${warning.id || "warning"}-${index}`} style={styles.reviewSignalCard}>
            <div style={styles.timelineTitleRow}>
              <strong style={{ color: "#f4f7ff" }}>{titleCase(String(warning.id || "calibration warning").replace(/_/g, " "))}</strong>
              {chip(styles, titleCase(warning.severity || "review"), warning.severity === "critical" || warning.severity === "high" ? "#ffb020" : "#7dd3fc")}
            </div>
            <div style={styles.timelineSummary}>{warning.issue || "Calibration warning requires review."}</div>
            <div style={styles.timelineMeta}>
              {warning.affectsVerdict ? "Affects verdict" : "Review warning"} - {warning.affectsScoring ? "Affects scoring" : "Does not affect scoring"} - {cleanPrimaryAnswerText(warning.sourceBoundary || "source boundary unavailable")}
            </div>
            <SectionRow
              label="Expected behavior"
              value={warning.expectedBehavior || "Follow asset-class guardrail behavior."}
              styles={styles}
            />
            <SectionRow
              label="Recommended action"
              value={warning.recommendedAction || "Manual verification required."}
              styles={styles}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function ManualReviewPanel({
  model,
  sourceStatus,
  providerDiagnostics,
  evidenceStatusProxy,
  calibrationWarnings,
  styles,
}) {
  const analystWorkflow = resolveInstitutionalAnalystWorkflowContract(model) || {};
  const signals = buildLiveReviewSignals({ model, sourceStatus, providerDiagnostics, evidenceStatusProxy });
  const verifyItems = analystVerificationItems(model);
  const coverageGate = model?.coverageScoreEligibilityContract || {};
  const finalDecision = model?.decisionLayer || {};
  const finalCoverage = finalDecision.coverage || {};
  const finalEligibility = finalDecision.eligibility || {};
  const finalScore = finalDecision.score || {};
  const finalManualReview = finalDecision.manualReview || {};
  const canonicalRoute = model?.familyCanonicalRoutingContract || {};
  const provenance = model?.evidenceProvenanceSemanticsContract || {};
  const familyMatrix = model?.familyDataRequirementMatrixContract || {};
  const provenanceCounters = provenance.readinessCounters || {};
  const sourceIntelligence = model?.sourceIntelligenceContract || {};
  const evidenceRegistry = model?.evidenceRegistryContract || sourceIntelligence.evidenceRegistryContract || {};
  const sourceDiscovery = model?.deepResearchSourceDiscoveryContract || {};
  const sourceCandidateRegistry = model?.sourceCandidateRegistryContract || sourceDiscovery.sourceCandidateRegistryContract || {};
  const sourceCandidatePipeline = model?.sourceCandidatePipelineContract || sourceDiscovery.sourceCandidatePipelineContract || {};
  const candidateAccounting = sourceCandidateRegistry.candidateAccountingSummary || sourceDiscovery.candidateAccountingSummary || {};
  const reviewWorkflow = model?.sourceCandidateReviewWorkflowContract || {};
  const reviewQueue = model?.sourceCandidateReviewQueueContract || reviewWorkflow.sourceCandidateReviewQueueContract || {};
  const reviewAudit = model?.sourceCandidateReviewAuditTrailContract || reviewWorkflow.sourceCandidateReviewAuditTrailContract || {};
  const finalComposer = model?.finalAnalystAnswerComposerContract || {};
  const composerAvailable = finalComposer?.contractAttached === true;
  const verificationItems = composerAvailable
    ? (safeArray(finalComposer.familyBoundSourceQueue).length
      ? safeArray(finalComposer.familyBoundSourceQueue).map((item) => item.text)
      : safeArray(finalComposer.sourceQueuePriorities))
    : [];
  const outcomes = [
    ["requires_review", "Needs human review before use."],
    ["accepted_for_report", "Accepted for explanation. Does not by itself mean production truth or score support."],
    ["stale", "Requires refresh before use."],
    ["rejected", "Blocked due to provenance, quality, scope, or safety."],
    ["duplicate", "Cannot count as independent support."],
    ["low_relevance", "Too indirect or weak for evidence use."],
    ["contradiction_review", "Blocked until conflict is resolved."],
  ];

  return (
    <div style={styles.sourceQueueShell}>
      <ExecutiveSummaryCard
        eyebrow="Analyst Verification"
        title="What evidence should be checked next?"
        answer={verificationItems[0] || signals[0]?.description || "No additional analyst verification item was attached."}
        tone="#f9d976"
        badges={[
          { label: model?.manualReviewStatus?.label || "Review status unavailable", tone: "#f9d976" },
          { label: `${signals.length} live signals`, tone: signals.length ? "#ffb020" : "#d5dcec" },
          { label: "Workflow, not failure", tone: "#d5dcec" },
        ]}
        styles={styles}
      >
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, finalComposer?.assetSummary?.representationBoundary || "Canonical question judgments are required before verification priorities are rendered.")}
        </div>
        <ListBlock title="External diligence items" items={verificationItems.slice(0, 6)} emptyText="No external diligence item attached." color="#f9d976" styles={styles} />
        {model?.reviewedEvidencePacket?.packetLoaded ? (
          <SectionRow
            label="Reviewed evidence packet"
            value={`${model.reviewedEvidencePacket.packetId || "packet loaded"} - explanation support only`}
            styles={styles}
          />
        ) : null}
      </ExecutiveSummaryCard>

      {!composerAvailable && analystWorkflow.artifactVersion ? (
        <Card title="Autonomous Workflow Audit Boundary" subtitle="Read-only escalation context; manual review is not the normal analysis flow." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `Workflow: ${analystWorkflow.workflowCompletenessStatus || "unknown"}`)}
            {boundaryChip(styles, `${analystWorkflow.confidenceCapDrivers?.length || 0} confidence caps`)}
            {boundaryChip(styles, "No score/readiness mutation")}
          </div>
          <ListBlock
            title="Confidence cap drivers"
            items={analystWorkflow.confidenceCapDrivers}
            emptyText="No workflow confidence cap was attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {sourceDiscovery.artifactVersion ? (
        <Card title="Source Candidate Review Boundary" subtitle="Rejected, duplicate, and unresolved candidates stay outside evidence and scoring." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `${candidateAccounting.rejectedCandidateCount ?? 0} rejected`)}
            {boundaryChip(styles, `${candidateAccounting.auditOnlyCandidateCount ?? 0} audit-only`)}
            {boundaryChip(styles, `${candidateAccounting.duplicateCandidateCount ?? 0} duplicates`)}
            {boundaryChip(styles, `${sourceCandidatePipeline.boundaryDiagnostics?.length || 0} boundary diagnostics`)}
            {boundaryChip(styles, "Requires analyst review")}
          </div>
          <ListBlock
            title="Candidate boundary findings"
            items={safeArray(sourceCandidatePipeline.boundaryDiagnostics)
              .filter((entry) => entry.severity !== "audit_only")
              .slice(0, 8)
              .map((entry) => entry.finding)}
            emptyText="No blocking source-candidate boundary finding was attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {reviewWorkflow.artifactVersion ? (
        <Card title="Candidate Review Queue" subtitle="Available actions update source-review state, not evidence or scoring." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `${reviewQueue.summary?.totalReviewQueueItems || 0} queue items`)}
            {boundaryChip(styles, `${reviewQueue.summary?.needsCheckCount || 0} need checks`)}
            {boundaryChip(styles, `${reviewAudit.eventCount || 0} audit events`)}
            {boundaryChip(styles, `Persistence available: ${reviewWorkflow.persistence?.diagnostic?.reviewPersistenceAvailable ? "yes" : "no"}`)}
            {boundaryChip(styles, "Candidate boundary preserved")}
          </div>
          <ListBlock
            title="Review status and available actions"
            items={safeArray(reviewQueue.items).slice(0, 8).map((item) =>
              `${item.candidateTitle}: ${item.reviewStatus}; actions: ${safeArray(item.reviewActionAvailable).join(", ")}; reason: ${item.reviewReasonCode}.`
            )}
            emptyText="No source review workflow item was attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {sourceIntelligence.artifactVersion ? (
        <Card title="Source Boundary Review" subtitle="Contradictions and blocked evidence promotions that require analyst attention." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `${sourceIntelligence.summary?.contradictionCount || 0} contradictions`)}
            {boundaryChip(styles, `${sourceIntelligence.summary?.sourcePromotionBlockedCount || 0} blocked promotions`)}
            {boundaryChip(styles, "Does not change score or verdict")}
          </div>
          <ListBlock
            title="Contradictions requiring review"
            items={safeArray(evidenceRegistry.contradictions).map((entry) => entry.description)}
            emptyText="No source-intelligence contradiction was attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {!composerAvailable && (finalCoverage.tier || coverageGate.artifactVersion) ? (
        <Card title="Coverage / Score Eligibility Review" subtitle="Critical blockers before fundamental score interpretation." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, finalCoverage.label || finalCoverage.tier || coverageGate.coverageTierLabel || coverageGate.coverageTier || "Coverage tier")}
            {boundaryChip(styles, finalEligibility.status || coverageGate.scoreEligibility || "Score eligibility")}
            {boundaryChip(styles, finalScore.displayable ? "Score available" : finalScore.displayMode || finalComposer?.scoreExplanationBridge?.scoreDisplayLabel || "Score display policy")}
          </div>
          <SectionRow
            label="Coverage message"
            value={finalScore.withholdingReason || finalManualReview.productLanguage || finalCoverage.limitations?.[0] || coverageGate.primaryUserMessage || coverageGate.scoreEligibilityReason || "Coverage gate attached."}
            styles={styles}
          />
          <ListBlock
            title="Critical blockers"
            items={safeArray(finalEligibility.blockers).length ? finalEligibility.blockers : safeArray(coverageGate.criticalBlockers).map((blocker) => blocker.label)}
            emptyText="No critical coverage blockers were attached."
            color="#ffb020"
            styles={styles}
          />
          <ListBlock
            title="Manual review triggers"
            items={safeArray(finalManualReview.reasons).length ? finalManualReview.reasons : coverageGate.manualReviewTriggers}
            emptyText="No coverage-specific manual review trigger was attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {!composerAvailable && provenance.contractAttached ? (
        <Card title="Evidence Provenance Review" subtitle="Manual review distinguishes missing current data from explanation support." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, provenance.assetSummary?.summaryLabel || "Evidence provenance separated")}
            {boundaryChip(styles, provenance.assetSummary?.manualEvidenceReadiness || "Manual evidence status unavailable")}
            {boundaryChip(styles, provenance.assetSummary?.liveDataReadiness || "Current data status unavailable")}
            {boundaryChip(styles, provenance.assetSummary?.scoreEvidenceBasis || "Score basis unavailable")}
          </div>
          <SectionRow
            label="Review interpretation"
            value={provenance.assetSummary?.institutionalReadinessBasis || "Reviewed evidence can improve explanations, while unresolved current-data and verification gaps remain review items."}
            styles={styles}
          />
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `${provenanceCounters.institutionalVerificationGaps || 0} verification gaps`)}
            {boundaryChip(styles, `${provenanceCounters.manualReviewRequired || 0} manual-review items`)}
            {boundaryChip(styles, `${provenanceCounters.confidenceCapDrivers || 0} confidence caps`)}
          </div>
          <ListBlock
            title="Review drivers"
            items={[
              ...safeArray(provenance.confidenceCapDrivers),
              ...safeArray(provenance.readinessGaps).map((gap) => gap.label),
            ].slice(0, 6)}
            emptyText="No provenance-specific manual-review drivers were attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {!composerAvailable && canonicalRoute.artifactVersion ? (
        <Card title="Canonical Family Review" subtitle="Family-scoped manual checks; raw fallback groups stay audit-only." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, canonicalRoute.effectiveFamily || "Family unavailable")}
            {boundaryChip(styles, canonicalRoute.canonicalManualReviewNamespace || "Manual-review namespace unavailable")}
            {boundaryChip(styles, `${canonicalRoute.wrongFamilyBlockerLeakageCount ?? 0} wrong-family leaks`)}
          </div>
          <ListBlock
            title="Manual review checks"
            items={canonicalRoute.familyScopedManualReviewItems}
            emptyText="No canonical family manual-review checks were attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {familyMatrix.artifactVersion ? (
        <Card title="Family Matrix Manual Review" subtitle="Family-specific missing data creates review gates, not fake conclusions." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, familyMatrix.primaryFamily || "Family unavailable")}
            {boundaryChip(styles, familyMatrix.primarySourceMatrixId || "Source matrix unavailable")}
            {boundaryChip(styles, `${safeArray(familyMatrix.manualReviewTriggers).length} review gates`)}
          </div>
          <ListBlock
            title="Manual review items"
            items={familyMatrix.manualReviewItems}
            emptyText="No family matrix manual-review items were attached."
            color="#f9d976"
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

      <div style={styles.advancedGrid}>
        <QuestionPromptCard
          question="Is this a true blocker or missing evidence?"
          answer={signals[0]?.description || "No blocker/review distinction was attached beyond normal verification."}
          status={signals[0]?.status || "Review context"}
          impact="Manual review"
          sourceState={signals[0]?.source || "Decision model"}
          styles={styles}
        />
        <QuestionPromptCard
          question="What should the analyst check first?"
          answer={verifyItems[0] || "Confirm source authenticity, freshness, scope, and contradiction risk."}
          status="First check"
          impact="Workflow"
          sourceState="Verification checklist"
          styles={styles}
        />
        <QuestionPromptCard
          question="Does this affect scoring?"
          answer="Manual review and source overlays explain uncertainty; they do not automatically change the current score."
          status="Boundary"
          impact="Not automatic scoring"
          sourceState="Policy"
          styles={styles}
        />
      </div>

      <CalibrationWarningsCard warnings={calibrationWarnings || model?.calibrationWarnings} styles={styles} />

      <Card title="Analysis Freshness Review" subtitle="Snapshot/live status is workflow context, not automatic failure." styles={styles}>
        <SectionRow
          label="Status"
          value={model?.analysisFreshness?.freshnessLabel || "Freshness unknown"}
          styles={styles}
        />
        <SectionRow
          label="Review meaning"
          value={model?.analysisFreshness?.summary || "Freshness metadata is unavailable; verify current provider state before relying on this analysis."}
          styles={styles}
        />
        <ListBlock
          title="Freshness warnings"
          items={model?.analysisFreshness?.freshnessWarnings}
          emptyText="No freshness warning was attached."
          color="#f9d976"
          styles={styles}
        />
      </Card>

      <Card title="Asset Identity / Chain Review" subtitle="Selected asset and analyzed representation guardrails." styles={styles}>
        <SectionRow
          label="Wrong-asset risk"
          value={model?.assetIdentityResolution?.wrongAssetRisk || "Unknown"}
          styles={styles}
        />
        <SectionRow
          label="Analyzed representation"
          value={`${model?.assetIdentityResolution?.analyzedNetwork || "Network unavailable"} ${model?.assetIdentityResolution?.analyzedContract || "no contract"}`}
          styles={styles}
        />
        <ListBlock
          title="Identity warnings"
          items={[
            ...safeArray(model?.assetIdentityResolution?.identityWarnings),
            ...safeArray(model?.assetIdentityResolution?.chainWarnings),
            ...safeArray(model?.assetIdentityResolution?.contractWarnings),
          ]}
          emptyText="No identity warning was attached."
          color="#f9d976"
          styles={styles}
        />
      </Card>

      <TokenomicsSupplyIntegrityCard tokenomics={model?.tokenomicsSupplyIntegrity} styles={styles} compact />

      <div style={styles.advancedGrid}>
        <Card title="Live Review Signals" subtitle="Qualitative workflow signals from the current live response. No fake counts." styles={styles}>
          {signals.length ? signals.map((signal, index) => (
            <div key={`${signal.source}-${signal.label}-${index}`} style={styles.reviewSignalCard}>
              <div style={styles.timelineTitleRow}>
                <strong style={{ color: "#f4f7ff" }}>{signal.label}</strong>
                {chip(styles, signal.status, signal.color)}
              </div>
              <div style={styles.timelineSummary}>{signal.description}</div>
              <div style={styles.timelineMeta}>{signal.source} - workflow signal only</div>
            </div>
          )) : (
            <p style={styles.timelineEmptyText}>No live manual-review signals were surfaced. Institutional review queue counts are not attached.</p>
          )}
        </Card>

        <Card title="Review Outcome Legend" subtitle="Methodology/workflow definitions unless attached to a live endpoint." styles={styles}>
          <div style={styles.reviewOutcomeGrid}>
            {outcomes.map(([label, description]) => (
              <div key={label} style={styles.reviewOutcomeCard}>
                <div style={styles.metaLabel}>{label}</div>
                <div style={styles.contextMuted}>{description}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="What An Analyst Should Verify" subtitle="Manual review checks before relying on explanatory evidence." styles={styles}>
        <ListBlock
          title="Verification checklist"
          items={verifyItems}
          emptyText="No verification guidance was available."
          color="#9bd7ff"
          styles={styles}
        />
        <SectionRow
          label="Scoring boundary"
          value="Manual-source review and explanatory overlays do not change live scoring or verdict behavior unless a future integration explicitly approves it."
          styles={styles}
        />
      </Card>
    </div>
  );
}
