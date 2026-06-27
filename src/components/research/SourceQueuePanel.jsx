import React from "react";
import { Card, CollapsibleDetail, ExecutiveSummaryCard, ListBlock, QuestionPromptCard, SectionRow } from "./researchPrimitives";
import {
  extractRenderableText,
  buildLensSpecificResearchDomains,
  cleanPrimaryAnswerText,
  getAnalystAnswerCard,
  isPrimaryFamilyCompatibleText,
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
  const canonicalPrimaryFamily = model?.canonicalProductRoute?.primaryFamily
    || model?.primaryAnalysisRoute?.assetFamily
    || null;
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
  const freshness = model?.analysisFreshness || {};
  const identity = model?.assetIdentityResolution || {};
  const freshnessLeads = [
    ...safeArray(freshness.staleSections).map((section) => ({
      label: "Refresh stale section",
      description: `Refresh or verify ${providerLabel(section)} before relying on this section.`,
      status: "Freshness review",
      source: "decisionModel.analysisFreshness.staleSections",
      color: "#ffb020",
    })),
    ...safeArray(freshness.missingSections).map((section) => ({
      label: "Verify missing section",
      description: `Verify ${providerLabel(section)} separately; missing data is not negative evidence.`,
      status: "Missing section",
      source: "decisionModel.analysisFreshness.missingSections",
      color: "#ffb020",
    })),
    ...(!freshness.freshQaEligible || freshness.isPartialRefresh ? [{
      label: "Verify analysis freshness",
      description: freshness.qaEligibilityWarning || freshness.summary || "Analysis source is unclear; verify current provider state before relying on the output.",
      status: freshness.isSnapshot ? "Historical snapshot" : freshness.isPartialRefresh ? "Partial refresh caveat" : freshness.isCachedRecentMemo ? "Cached/recent memo" : "Freshness review",
      source: "decisionModel.analysisFreshness",
      color: "#ffb020",
    }] : []),
  ];
  const identityLeads = safeArray(identity.sourceRequirements).map((entry) => ({
    label: "Identity / contract verification",
    description: entry,
    status: "Identity review",
    source: "decisionModel.assetIdentityResolution.sourceRequirements",
    color: "#ffb020",
  }));
  const tokenomics = model?.tokenomicsSupplyIntegrity || {};
  const tokenomicsLeads = safeArray(tokenomics.sourceRequirements).map((entry) => ({
    label: "Tokenomics supply verification",
    description: entry,
    status: "Supply review",
    source: "decisionModel.tokenomicsSupplyIntegrity.sourceRequirements",
    color: "#ffb020",
  }));
  const readiness = model?.scoringReadinessContract || {};
  const scoringReadinessLeads = [
    ...safeArray(readiness.whatWouldChangeScore).slice(0, 6).map((entry) => ({
      label: "Scoring-readiness evidence requirement",
      description: entry,
      status: "Diagnostic-only source requirement",
      source: "decisionModel.scoringReadinessContract.whatWouldChangeScore",
      color: "#c7a7ff",
    })),
    ...safeArray(readiness.liveMetricRequirements).slice(0, 4).map((entry) => ({
      label: "Live metric readiness requirement",
      description: entry,
      status: "Future scoring input candidate",
      source: "decisionModel.scoringReadinessContract.liveMetricRequirements",
      color: "#9bd7ff",
    })),
  ];
  const reviewedEvidence = model?.reviewedEvidencePacket || {};
  const synthesizedLeads = [
    ...safeArray(model?.institutionalQuestions),
    ...safeArray(model?.tokenomicsSupplyIntegrity?.institutionalQuestions),
  ]
    .filter((question) => question?.synthesizedAnswer)
    .flatMap((question) => safeArray(getAnalystAnswerCard(question).missingEvidence).slice(0, 2).map((entry) => ({
      label: `Question evidence gap: ${question.questionId || "institutional question"}`,
      description: `${entry} ${getAnalystAnswerCard(question).whatWouldChange?.[0] ? `What would change: ${getAnalystAnswerCard(question).whatWouldChange[0]}` : ""}`.trim(),
      status: getAnalystAnswerCard(question).headlineStatus || (question.synthesizedAnswer.evidenceStatus === "source_required" ? "Source required" : "Remaining evidence gap"),
      source: "decisionModel.institutionalQuestions.synthesizedAnswer.analystAnswerCard",
      color: "#f9d976",
    })));
  const reviewedCoverageLeads = [
    ...safeArray(reviewedEvidence.sourceQueueNotes).slice(0, 3).map((entry) => ({
      label: "Reviewed evidence mapped",
      description: entry,
      status: "Partially/source-backed",
      source: "decisionModel.reviewedEvidencePacket.sourceQueueNotes",
      color: "#a6f3c2",
    })),
    ...safeArray(reviewedEvidence.remainingSourceRequirements).map((entry) => ({
      label: "Reviewed evidence remaining gap",
      description: entry,
      status: "Remaining source required",
      source: "decisionModel.reviewedEvidencePacket.remainingSourceRequirements",
      color: "#f9d976",
    })),
  ];
  const benchmarkPack = model?.benchmarkInstitutionalAnswerPack || {};
  const benchmarkPackLeads = [
    ...safeArray(benchmarkPack.sourceRequirements).slice(0, 6).map((entry) => ({
      label: "Benchmark answer-pack source requirement",
      description: entry,
      status: "Diagnostic-only source requirement",
      source: "decisionModel.benchmarkInstitutionalAnswerPack.sourceRequirements",
      color: "#c7a7ff",
    })),
    ...safeArray(benchmarkPack.questions).flatMap((question) =>
      safeArray(question.sourceRequirements).slice(0, 2).map((entry) => ({
        label: `Benchmark question source: ${question.questionId || "question"}`,
        description: `${entry} ${question.directAnswer ? `Why: ${question.directAnswer}` : ""}`.trim(),
        status: question.decisionImpact === "requires_manual_review" ? "Manual review" : "Source required",
        source: "decisionModel.benchmarkInstitutionalAnswerPack.questions",
        color: question.priority === "critical" ? "#ffb020" : "#c7a7ff",
      }))
    ).slice(0, 6),
  ];
  const engineLearning = model?.engineLearningBackbone || {};
  const feedbackLoop = engineLearning.engineLearningFeedbackLoop || {};
  const engineLearningLeads = [
    ...safeArray(engineLearning.sourceRequirementsTriggered).slice(0, 3).map((entry) => ({
      label: "Engine-learning source requirement",
      description: entry.title || entry.requirement || entry.id || "Source requirement",
      status: entry.diagnosticOnly ? "Diagnostic only" : "Source required",
      source: "decisionModel.engineLearningBackbone.sourceRequirementsTriggered",
      color: "#f9d976",
    })),
    ...safeArray(engineLearning.sourceCandidates).slice(0, 3).map((entry) => ({
      label: "Source candidate, not reviewed evidence",
      description: `${entry.sourceCandidateTitle || entry.candidateId || "Source candidate"}${entry.publisher ? ` (${entry.publisher})` : ""}`,
      status: entry.scoringActive ? "QA warning: unexpectedly included in score" : "Candidate only",
      source: "decisionModel.engineLearningBackbone.sourceCandidates",
      color: "#9bd7ff",
    })),
    ...safeArray(feedbackLoop.sourceRequirementTemplatesProposed).slice(0, 5).map((entry) => ({
      label: "Learning feedback source requirement",
      description: entry,
      status: "Diagnostic proposal",
      source: "decisionModel.engineLearningBackbone.engineLearningFeedbackLoop.sourceRequirementTemplatesProposed",
      color: "#c7a7ff",
    })),
  ];
  const rawDataExpansion = model?.providerRawDataExpansion || {};
  const rawDataCoverage = model?.rawDataCoverageDiagnostics || rawDataExpansion.rawDataCoverageDiagnostics || {};
  const rawDataLeads = [
    ...safeArray(rawDataExpansion.categoryDataSourceRequirements),
    ...safeArray(rawDataCoverage.sourceCriticalMissingFields),
  ].slice(0, 6).map((entry) => ({
    label: "Provider raw-data requirement",
    description: entry,
    status: "Source required",
    source: "decisionModel.providerRawDataExpansion.categoryDataSourceRequirements",
    color: "#f9d976",
  }));
  const evidenceAggregation = model?.evidenceStatusAggregationContract || {};
  const evidenceAggregationLeads = safeArray(evidenceAggregation.sourceQueueItems)
    .slice(0, 8)
    .map((item) => ({
      label: "Evidence aggregation source requirement",
      description: item || "Reviewed evidence or live data required.",
      status: "Needs verification",
      source: "decisionModel.evidenceStatusAggregationContract.sourceQueueItems",
      color: "#f9d976",
    }));

  return dedupeByText([
    ...evidenceAggregationLeads,
    ...rawDataLeads,
    ...engineLearningLeads,
    ...benchmarkPackLeads,
    ...reviewedCoverageLeads,
    ...synthesizedLeads,
    ...scoringReadinessLeads,
    ...tokenomicsLeads,
    ...identityLeads,
    ...freshnessLeads,
    ...missing,
    ...required,
    ...whatWouldChange,
    ...alerts,
    ...providerGapLeads(providerDiagnostics),
    ...sourceStatusLeads(sourceStatus),
  ]).filter((lead) => isPrimaryFamilyCompatibleText(
    `${lead.label || ""} ${lead.description || ""}`,
    canonicalPrimaryFamily,
  )).map((lead) => ({
    ...lead,
    label: cleanPrimaryAnswerText(lead.label),
    description: cleanPrimaryAnswerText(lead.description),
    status: cleanPrimaryAnswerText(lead.status),
    source: cleanPrimaryAnswerText(lead.source),
  })).slice(0, 8);
}

function suggestedResearchDomains(model, displayIdentity = null) {
  return buildLensSpecificResearchDomains(model, displayIdentity);
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
  const reviewedEvidence = model?.reviewedEvidencePacket || {};
  const assetFraming = displayIdentity?.displayFraming || displayIdentity?.displayAssetClass || extractRenderableText(model?.assetFramingLabel, "Digital asset allocation thesis");
  const coverageGate = model?.coverageScoreEligibilityContract || {};
  const canonicalRoute = model?.familyCanonicalRoutingContract || {};
  const provenance = model?.evidenceProvenanceSemanticsContract || {};
  const familyMatrix = model?.familyDataRequirementMatrixContract || {};
  const provenanceCounters = provenance.readinessCounters || {};

  return (
    <div style={styles.sourceQueueShell}>
      <ExecutiveSummaryCard
        eyebrow="Source Queue"
        title="What source is needed next?"
        answer={reviewLeads[0]?.description || "No live review leads were surfaced. Add reviewed sources before relying on stronger conclusions."}
        tone="#9bd7ff"
        badges={[
          { label: `${reviewLeads.length} review leads`, tone: reviewLeads.length ? "#f9d976" : "#d5dcec" },
          { label: `${researchRequirements.length} research requirements`, tone: researchRequirements.length ? "#7dd3fc" : "#d5dcec" },
          { label: "Needs review", tone: "#d5dcec" },
          { label: model?.analysisFreshness?.freshQaEligible ? "Current QA eligible" : "Run fresh analysis for QA", tone: model?.analysisFreshness?.freshQaEligible ? "#a6f3c2" : "#f9d976" },
        ]}
        styles={styles}
      >
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, "Open checks require source review.")}
          {boundaryChip(styles, "Missing data is not negative proof.")}
          {boundaryChip(styles, "See Methodology for evidence workflow.")}
          {boundaryChip(styles, model?.analysisFreshness?.qaEligibilityWarning || "Freshness metadata should be checked before QA.")}
        </div>
        <SectionRow
          label="Current attachment"
          value="No accepted source discovery item is attached to this live response yet."
          styles={styles}
        />
      </ExecutiveSummaryCard>

      {reviewedEvidence.packetLoaded ? (
        <Card title="Reviewed Evidence Coverage" subtitle="Mapped evidence can reduce duplicate source asks; remaining gaps stay visible." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `Packet: ${reviewedEvidence.packetId || "loaded"}`)}
            {boundaryChip(styles, cleanPrimaryAnswerText(reviewedEvidence.reviewStatus || "reviewed support"))}
            {boundaryChip(styles, "Explanation support")}
          </div>
          <ListBlock
            title="Already mapped to questions"
            items={reviewedEvidence.sourceQueueNotes}
            emptyText="No reviewed-evidence coverage notes were attached."
            color="#a6f3c2"
            styles={styles}
          />
          <ListBlock
            title="Still needed"
            items={reviewedEvidence.remainingSourceRequirements}
            emptyText="No remaining reviewed-evidence gaps were attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {canonicalRoute.artifactVersion ? (
        <Card title="Canonical Source Family" subtitle="Effective family controls the primary question group and source matrix." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, canonicalRoute.effectiveFamily || "Family unavailable")}
            {boundaryChip(styles, canonicalRoute.canonicalQuestionGroup || "Question group unavailable")}
            {boundaryChip(styles, canonicalRoute.canonicalSourceProfile || "Source profile unavailable")}
          </div>
          <ListBlock
            title="Family-scoped source requirements"
            items={canonicalRoute.familyScopedSourceQueueRequirements}
            emptyText="No canonical family source requirements were attached."
            color="#7dd3fc"
            styles={styles}
          />
        </Card>
      ) : null}

      {coverageGate.artifactVersion ? (
        <Card title="Coverage Upgrade Priorities" subtitle="Sources that would improve analysis depth or score display eligibility." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, coverageGate.coverageTierLabel || coverageGate.coverageTier || "Coverage tier")}
            {boundaryChip(styles, coverageGate.scoreEligibility || "Score eligibility")}
            {boundaryChip(styles, "Does not change current score formula")}
          </div>
          <ListBlock
            title="What would upgrade tier"
            items={coverageGate.whatWouldUpgradeTier}
            emptyText="No coverage-tier upgrade requirements were attached."
            color="#7dd3fc"
            styles={styles}
          />
          <ListBlock
            title="What would make score eligible"
            items={coverageGate.whatWouldMakeScoreEligible}
            emptyText="No score-eligibility requirements were attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {familyMatrix.artifactVersion ? (
        <Card title="Family Data Requirements" subtitle="Asset-family-specific data and reviewed-source requirements." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, familyMatrix.primaryFamily || "Family unavailable")}
            {boundaryChip(styles, familyMatrix.primarySourceMatrixId || "Source matrix unavailable")}
            {boundaryChip(styles, "Provider metadata is context only")}
          </div>
          <ListBlock
            title="Next family-specific source checks"
            items={familyMatrix.sourceQueueItems}
            emptyText="No family matrix Source Queue items were attached."
            color="#7dd3fc"
            styles={styles}
          />
          <ListBlock
            title="What provider metadata cannot prove"
            items={familyMatrix.providerMetadataBoundaries}
            emptyText="No provider metadata boundaries were attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {provenance.contractAttached ? (
        <Card title="Evidence Provenance Readiness" subtitle="Separates reviewed evidence, live data, source candidates, and score integration." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, provenance.assetSummary?.summaryLabel || "Evidence provenance separated")}
            {boundaryChip(styles, provenance.assetSummary?.manualEvidenceReadiness || "Manual evidence status unavailable")}
            {boundaryChip(styles, provenance.assetSummary?.liveDataReadiness || "Current data status unavailable")}
            {boundaryChip(styles, provenance.assetSummary?.scoreEvidenceBasis || "Score basis unavailable")}
          </div>
          <SectionRow
            label="Source queue meaning"
            value={provenance.displayPolicy?.sourceQueueLabel || "Source candidates and requirements are review prompts, not supported evidence."}
            styles={styles}
          />
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `${provenanceCounters.manualReviewedEvidenceClaims || 0} reviewed evidence claims`)}
            {boundaryChip(styles, `${provenanceCounters.liveMetricGaps || 0} live metric gaps`)}
            {boundaryChip(styles, `${provenanceCounters.sourceRequiredGaps || 0} source-required gaps`)}
            {boundaryChip(styles, `${provenanceCounters.scoringActivationGaps || 0} score-integration gaps`)}
          </div>
          <ListBlock
            title="Current verification gaps"
            items={safeArray(provenance.readinessGaps).map((gap) => gap.label).slice(0, 6)}
            emptyText="No provenance-specific readiness gaps were attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      <div style={styles.advancedGrid}>
        <QuestionPromptCard
          question="What should be sourced first?"
          answer={reviewLeads[0]?.description || safeArray(model?.tokenomicsSupplyIntegrity?.sourceRequirements)[0] || "No priority source requirement was attached."}
          status={reviewLeads[0]?.status || "Source required"}
          impact="Next source"
          sourceState={reviewLeads[0]?.source || "Open checks"}
          styles={styles}
        />
        <QuestionPromptCard
          question="Which question would it answer?"
          answer={researchRequirements[0]?.title || reviewLeads[0]?.label || "No mapped research question was attached."}
          status="Research requirement"
          impact="Question mapping"
          sourceState="Requirement model"
          styles={styles}
        />
        <QuestionPromptCard
          question="Could it change the verdict?"
          answer={researchRequirements[0]?.verdictImpact || "Potentially only if reviewed, source-backed evidence resolves a live decision requirement."}
          status={researchRequirements[0]?.canChangeVerdict ? "Potentially" : "Requires review"}
          impact="Verdict boundary"
          sourceState="Needs review"
          styles={styles}
        />
      </div>

      <CollapsibleDetail title="Source Lifecycle Explainer" subtitle="Report-only workflow. Not live scoring input." styles={styles} tone="#8a94a6">
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
      </CollapsibleDetail>

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

        <Card title="Freshness Review Requirements" subtitle="Snapshot and section status. Not negative evidence." styles={styles}>
          <SectionRow
            label="Analysis source"
            value={model?.analysisFreshness?.freshnessLabel || "Freshness unknown"}
            styles={styles}
          />
          <ListBlock
            title="Stale sections to refresh"
            items={model?.analysisFreshness?.staleSections}
            emptyText="No stale sections were attached to the display model."
            color="#f9d976"
            styles={styles}
          />
          <ListBlock
            title="Missing sections to verify"
            items={model?.analysisFreshness?.missingSections}
            emptyText="No missing sections were attached to the display model."
            color="#f9d976"
            styles={styles}
          />
        </Card>

        <Card title="Identity / Chain / Contract Requirements" subtitle="Wrong-asset and representation guardrails. Not scoring input by themselves." styles={styles}>
          <SectionRow
            label="Analyzed representation"
            value={`${model?.assetIdentityResolution?.analyzedNetwork || "Network unavailable"} ${model?.assetIdentityResolution?.analyzedContract || "no contract"}`}
            styles={styles}
          />
          <ListBlock
            title="Identity verification requirements"
            items={model?.assetIdentityResolution?.sourceRequirements}
            emptyText="No identity-specific source requirements were attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>

        <Card title="Tokenomics Supply Integrity Requirements" subtitle="Dilution, unlock, mint/admin, and supply-source review. Not reviewed evidence." styles={styles}>
          <SectionRow
            label="Boundary"
            value="Missing unlock data is a confidence cap, not proof of no unlock risk. Provider supply fields are reported context until source-backed."
            styles={styles}
          />
          <ListBlock
            title="Source requirements"
            items={model?.tokenomicsSupplyIntegrity?.sourceRequirements}
            emptyText="No tokenomics supply source requirements were attached."
            color="#f9d976"
            styles={styles}
          />
          <ListBlock
            title="Manual review triggers"
            items={model?.tokenomicsSupplyIntegrity?.manualReviewTriggers}
            emptyText="No tokenomics manual review trigger was attached."
            color="#ffb020"
            styles={styles}
          />
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
