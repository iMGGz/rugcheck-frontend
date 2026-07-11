import React from "react";
import { Card, CollapsibleDetail, ExecutiveSummaryCard, ListBlock, QuestionPromptCard, SectionRow } from "./researchPrimitives";
import {
  extractRenderableText,
  buildLensSpecificResearchDomains,
  cleanPrimaryAnswerText,
  resolveInstitutionalAnalystWorkflowContract,
  safeArray,
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

function composerQueueItems(contract) {
  const structured = safeArray(contract?.familyBoundSourceQueue);
  if (structured.length) return structured.map((item) => ({
    id: item.queueItemId,
    text: cleanPrimaryAnswerText(item.text || item),
  })).filter((item) => item.text);
  return safeArray(contract?.sourceQueuePriorities).map((item, index) => ({
    id: `legacy-composer-queue-${index}`,
    text: cleanPrimaryAnswerText(item),
  })).filter((item) => item.text);
}

function buildReviewLeads({ model }) {
  return composerQueueItems(model?.finalAnalystAnswerComposerContract)
    .slice(0, 8)
    .map((item, index) => ({
      label: index === 0 ? "Highest-priority family diligence" : "Family diligence requirement",
      description: item.text,
      status: "Needs current evidence",
      source: `finalAnalystAnswerComposerContract.familyBoundSourceQueue.${item.id || index}`,
      color: index === 0 ? "#ffb020" : "#7dd3fc",
    }));
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
  styles,
}) {
  const analystWorkflow = resolveInstitutionalAnalystWorkflowContract(model) || {};
  const reviewLeads = buildReviewLeads({ model });
  const domains = suggestedResearchDomains(model, displayIdentity);
  const finalComposer = model?.finalAnalystAnswerComposerContract || {};
  const composerAvailable = finalComposer?.contractAttached === true;
  const canonicalQueue = composerQueueItems(finalComposer);
  const nextDiligence = canonicalQueue.map((item) => item.text);
  const canonicalJudgments = safeArray(finalComposer?.canonicalQuestionJudgments);
  const researchRequirements = composerAvailable
    ? nextDiligence.map((requirement, index) => ({
      id: canonicalQueue[index]?.id || `canonical-diligence-${index}`,
      title: requirement,
      reason: "Derived from the canonical question judgment gap and next-evidence state.",
      evidenceNeeded: [requirement],
      preferredSourceTypes: [],
      priority: index < 2 ? "high" : "medium",
      verdictImpact: "May improve confidence if the canonical evidence gap is resolved.",
      currentStatus: "needs_verification",
      canChangeVerdict: false,
    }))
    : [];
  const reviewedEvidence = model?.reviewedEvidencePacket || {};
  const assetFraming = displayIdentity?.displayFraming || displayIdentity?.displayAssetClass || extractRenderableText(model?.assetFramingLabel, "Digital asset allocation thesis");
  const coverageGate = model?.coverageScoreEligibilityContract || {};
  const canonicalRoute = model?.familyCanonicalRoutingContract || {};
  const provenance = model?.evidenceProvenanceSemanticsContract || {};
  const familyMatrix = model?.familyDataRequirementMatrixContract || {};
  const provenanceCounters = provenance.readinessCounters || {};
  const sourceIntelligence = model?.sourceIntelligenceContract || {};
  const questionEvidenceMapping = model?.questionEvidenceMappingContract || sourceIntelligence.questionEvidenceMappingContract || {};
  const sourceDiscovery = model?.deepResearchSourceDiscoveryContract || {};
  const sourceCandidateRegistry = model?.sourceCandidateRegistryContract || sourceDiscovery.sourceCandidateRegistryContract || {};
  const candidateAccounting = sourceCandidateRegistry.candidateAccountingSummary || sourceDiscovery.candidateAccountingSummary || {};
  const reviewWorkflow = model?.sourceCandidateReviewWorkflowContract || {};
  const reviewQueue = model?.sourceCandidateReviewQueueContract || reviewWorkflow.sourceCandidateReviewQueueContract || {};

  return (
    <div style={styles.sourceQueueShell}>
      <ExecutiveSummaryCard
        eyebrow="Recommended Next Diligence"
        title="What should the analyst verify next?"
        answer={nextDiligence[0] || reviewLeads[0]?.description || "No additional diligence item was attached."}
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
          {boundaryChip(styles, finalComposer?.assetSummary?.representationBoundary || "Canonical question judgments are required before source priorities are rendered.")}
        </div>
        <ListBlock title="Priority diligence" items={nextDiligence.slice(0, 5)} emptyText="No priority diligence attached." color="#9bd7ff" styles={styles} />
      </ExecutiveSummaryCard>

      {!composerAvailable && analystWorkflow.artifactVersion ? (
        <Card title="Autonomous Workflow Data Gaps" subtitle="Inputs needed to answer canonical institutional questions more completely." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `${analystWorkflow.rawProblemDataInventory?.availableCategories?.length || 0} available categories`)}
            {boundaryChip(styles, `${analystWorkflow.rawProblemDataInventory?.missingCategories?.length || 0} missing categories`)}
            {boundaryChip(styles, "Candidates do not resolve gaps")}
          </div>
          <ListBlock
            title="Priority missing data"
            items={safeArray(analystWorkflow.missingData).slice(0, 10)}
            emptyText="No autonomous workflow data gap was attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {!composerAvailable && sourceDiscovery.artifactVersion ? (
        <Card title="Source Candidates for Review" subtitle="Bounded discovery leads only; each candidate requires review before evidence use." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `${candidateAccounting.acceptedCandidateCount ?? sourceCandidateRegistry.summary?.acceptedCandidateCount ?? 0} accepted`)}
            {boundaryChip(styles, `${candidateAccounting.displayCandidateCount ?? 0} displayed`)}
            {boundaryChip(styles, `${sourceCandidateRegistry.summary?.highPriorityReviewCandidateCount || 0} high priority`)}
            {boundaryChip(styles, "Candidate only")}
            {boundaryChip(styles, "Not scoring-active")}
          </div>
          <ListBlock
            title="Highest-priority review leads"
            items={safeArray(sourceCandidateRegistry.candidates)
              .filter((candidate) => ["critical_gap", "high"].includes(candidate.reviewPriority))
              .slice(0, 8)
              .map((candidate) => `${candidate.candidateTitle}: ${candidate.candidateReason}`)}
            emptyText="No high-priority source candidate was attached."
            color="#7dd3fc"
            styles={styles}
          />
          <ListBlock
            title="Evidence gaps remain open"
            items={safeArray(sourceDiscovery.sourceCandidatePipelineContract?.unresolvedEvidenceGaps)
              .slice(0, 8)
              .map((entry) => `${entry.questionId}: ${entry.gap}`)}
            emptyText="No unresolved candidate-mapped source gap was attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {!composerAvailable && reviewWorkflow.artifactVersion ? (
        <Card title="Source Candidate Review Workflow" subtitle="Source usefulness review only; accepted candidates are not evidence." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, `${reviewQueue.summary?.unreviewedCount || 0} unreviewed`)}
            {boundaryChip(styles, `${reviewQueue.summary?.acceptedForEvidencePacketDraftingCount || 0} accepted for packet drafting`)}
            {boundaryChip(styles, `${reviewQueue.summary?.scoringActiveCandidateCount || 0} scoring-active`)}
            {boundaryChip(styles, reviewWorkflow.persistence?.mode || "Persistence unavailable")}
            {boundaryChip(styles, `API mutation available: ${reviewWorkflow.persistence?.diagnostic?.reviewMutationAvailable ? "yes" : "no"}`)}
          </div>
          <ListBlock
            title="Next review actions"
            items={safeArray(reviewQueue.items).slice(0, 8).map((item) =>
              `${item.candidateTitle}: ${item.reviewStatus}; ${item.nextRecommendedAction} Authority: ${item.sourceAuthorityTier}.`
            )}
            emptyText="No source candidate review queue was attached."
            color="#7dd3fc"
            styles={styles}
          />
        </Card>
      ) : null}

      {!composerAvailable && sourceIntelligence.artifactVersion ? (
        <Card title="Question-Level Source Readiness" subtitle="Missing evidence is prioritized by the canonical question family." styles={styles}>
          <div style={styles.sourceBoundaryStrip}>
            {boundaryChip(styles, sourceIntelligence.canonicalFamily || "Family unavailable")}
            {boundaryChip(styles, `${questionEvidenceMapping.summary?.coveragePercent || 0}% question coverage`)}
            {boundaryChip(styles, questionEvidenceMapping.contractStatus || "Mapping status unavailable")}
            {boundaryChip(styles, "Diagnostic only")}
          </div>
          <ListBlock
            title="Highest-priority evidence gaps"
            items={safeArray(questionEvidenceMapping.mappings).flatMap((mapping) =>
              safeArray(mapping.blockingEvidenceGaps).map((gap) => `${mapping.questionId}: ${gap}`)
            ).slice(0, 8)}
            emptyText="No question-level evidence gaps were attached."
            color="#f9d976"
            styles={styles}
          />
        </Card>
      ) : null}

      {!composerAvailable && reviewedEvidence.packetLoaded ? (
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

      {!composerAvailable && canonicalRoute.artifactVersion ? (
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

      {!composerAvailable && coverageGate.artifactVersion ? (
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

      {!composerAvailable && familyMatrix.artifactVersion ? (
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

      {!composerAvailable && provenance.contractAttached ? (
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
          answer={canonicalJudgments[0]?.question || researchRequirements[0]?.title || reviewLeads[0]?.label || "No mapped research question was attached."}
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

      {!composerAvailable ? <CollapsibleDetail title="Source Lifecycle Explainer" subtitle="Report-only workflow. Not live scoring input." styles={styles} tone="#8a94a6">
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
      </CollapsibleDetail> : null}

      {!composerAvailable ? <div style={styles.advancedGrid}>
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
      </div> : null}
    </div>
  );
}
