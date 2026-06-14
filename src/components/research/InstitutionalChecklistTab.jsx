import React from "react";
import { Card, CollapsibleDetail, ExecutiveSummaryCard, ListBlock, SectionRow } from "./researchPrimitives";
import {
  extractRenderableText,
  getAnalystAnswerCard,
  normalizeInstitutionalQuestionsPayload,
  normalizeRenderableList,
  normalizeResolvedInstitutionalLensPayload,
  providerLabel,
  safeArray,
  safeObject,
  titleCase,
} from "./researchUtils";
import { resolveInstitutionalChecklistLens } from "./institutionalChecklistLensRegistry";
import { TokenomicsSupplyQuestionCard } from "./TokenomicsSupplyIntegrityCard";

function boundaryChip(styles, children) {
  return <span style={styles.sourceBoundaryChip}>{children}</span>;
}

function statusChip(styles, label, color = "#7dd3fc") {
  return (
    <span style={{ ...styles.riskChip, borderColor: color, color }}>
      {label}
    </span>
  );
}

function evidenceTag(styles, label) {
  return <span style={styles.checklistEvidenceTag}>{label}</span>;
}

function labelize(value) {
  return titleCase(String(value || "").replace(/_/g, " "));
}

function questionStatusTone(status) {
  switch (status) {
    case "supported":
      return { label: "Supported", color: "#2fd67b" };
    case "partially_supported":
      return { label: "Partially supported", color: "#7dd3fc" };
    case "contradicted":
      return { label: "Contradicted", color: "#ff6b6b" };
    case "evidence_missing":
      return { label: "Evidence missing", color: "#ffb020" };
    case "evidence_stale":
      return { label: "Evidence stale", color: "#ffb020" };
    case "evidence_indirect":
      return { label: "Evidence indirect", color: "#9bd7ff" };
    case "manual_review_required":
      return { label: "Manual review", color: "#ffb020" };
    case "source_candidate_only":
      return { label: "Source candidate only", color: "#aab7cc" };
    case "reviewed_evidence_required":
      return { label: "Reviewed evidence required", color: "#ffb020" };
    case "not_applicable":
      return { label: "Not applicable", color: "#8a94a6" };
    default:
      return { label: status ? labelize(status) : "Source required", color: "#8a94a6" };
  }
}

function verdictImpactTone(impact) {
  switch (impact) {
    case "supports_allocation":
    case "raises_confidence":
      return { label: labelize(impact), color: "#2fd67b" };
    case "blocks_allocation":
      return { label: labelize(impact), color: "#ff6b6b" };
    case "caps_confidence":
    case "lowers_confidence":
    case "requires_manual_review":
      return { label: labelize(impact), color: "#ffb020" };
    default:
      return { label: impact ? labelize(impact) : "Diagnostic only", color: "#aab7cc" };
  }
}

function reviewedEvidenceTone(status) {
  switch (status) {
    case "source_backed":
      return { label: "Source-backed", color: "#2fd67b" };
    case "partially_source_backed":
      return { label: "Partially source-backed", color: "#7dd3fc" };
    case "contradicted":
      return { label: "Reviewed contradiction", color: "#ff6b6b" };
    case "stale":
      return { label: "Stale reviewed source", color: "#ffb020" };
    case "not_applicable":
      return { label: "Not applicable", color: "#8a94a6" };
    default:
      return null;
  }
}

function synthesizedEvidenceTone(status) {
  switch (status) {
    case "source_backed":
      return { label: "Source-backed answer", color: "#2fd67b" };
    case "partially_source_backed":
      return { label: "Partially source-backed", color: "#7dd3fc" };
    case "provider_reported":
      return { label: "Provider-only", color: "#aab7cc" };
    case "computed":
      return { label: "Computed", color: "#9bd7ff" };
    case "source_required":
      return { label: "Source required", color: "#ffb020" };
    case "manual_review_required":
      return { label: "Manual review", color: "#ffb020" };
    case "not_applicable":
      return { label: "Not applicable", color: "#8a94a6" };
    case "contradicted":
      return { label: "Contradicted", color: "#ff6b6b" };
    case "stale":
      return { label: "Stale source", color: "#ffb020" };
    default:
      return null;
  }
}

function primaryQuestionStatusTone(question, synthesized) {
  if (
    synthesized?.evidenceStatus === "source_required"
    && ["supported", "partially_supported"].includes(question?.answerStatus)
  ) {
    return { label: "Legacy support in audit", color: "#8a94a6" };
  }
  return questionStatusTone(question?.answerStatus);
}

function synthesizedPrimaryBadge(question, synthesizedTone) {
  if (!synthesizedTone) return null;
  if (
    ["base_layer_security_validator_role", "base_layer_issuance_burn_staking"].includes(question?.questionId)
    && ["source_backed", "partially_source_backed"].includes(question?.synthesizedAnswer?.evidenceStatus)
  ) {
    return { ...synthesizedTone, label: "Source-backed for mechanism" };
  }
  if (
    ["base_layer_security_validator_role", "base_layer_issuance_burn_staking"].includes(question?.questionId)
    && question?.synthesizedAnswer?.evidenceStatus === "source_required"
  ) {
    return { ...synthesizedTone, label: "Live review required" };
  }
  return synthesizedTone;
}

function answerFallback(question) {
  const card = getAnalystAnswerCard(question);
  if (card?.directAnswer) return card.directAnswer;
  const status = questionStatusTone(question?.answerStatus).label;
  if (question?.synthesizedAnswer?.directAnswer) return question.synthesizedAnswer.directAnswer;
  if (question?.shortAnswer) return question.shortAnswer;
  if (question?.answerSummary) return question.answerSummary;
  if (question?.answerStatus === "not_applicable") return "Not applicable for this asset class.";
  if (question?.answerStatus === "manual_review_required") return "Manual review required before relying on this answer.";
  if (question?.answerStatus === "evidence_missing" || question?.answerStatus === "reviewed_evidence_required") return "Evidence missing; source review required.";
  if (question?.answerStatus === "contradicted") return "Contradiction detected; review source evidence before using this answer.";
  if (question?.answerStatus === "supported" || question?.answerStatus === "partially_supported") return `${status}; supporting source context should be reviewed before raising confidence.`;
  return "Partially answerable; source review required.";
}

function simplifiedBoundary(boundaries) {
  const text = normalizeRenderableList(boundaries).join(" ").toLowerCase();
  if (!text) return "Source boundary not attached.";
  if (text.includes("provider")) return "Provider metadata is context, not reviewed evidence.";
  if (text.includes("diagnostic")) return "Diagnostic context only; not a standalone evidence claim.";
  if (text.includes("source_candidate")) return "Source candidate; review required before evidence use.";
  if (text.includes("scoring")) return "Scoring boundary attached; inspect technical details for exact field use.";
  return "Source boundary attached; inspect details before treating this as evidence.";
}

function readableEmpty(label) {
  if (/missing/i.test(label)) return "No missing evidence listed.";
  if (/contradiction|blocker/i.test(label)) return "No contradiction detected.";
  if (/change/i.test(label)) return "No change condition listed.";
  return "Not available yet.";
}

function InlineList({ title, items, emptyText, styles, color = "#aab7cc" }) {
  const normalized = normalizeRenderableList(items).slice(0, 5);
  if (!normalized.length && !emptyText) return null;
  return (
    <div>
      <div style={styles.metaLabel}>{title}</div>
      {normalized.length ? (
        <div style={styles.institutionalQuestionChipList}>
          {normalized.map((item) => (
            <span key={item} style={{ ...styles.checklistEvidenceTag, color, borderColor: `${color}55` }}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <div style={styles.timelineEmptyText}>{emptyText}</div>
      )}
    </div>
  );
}

function InstitutionalQuestionAnswerCard({ question, styles }) {
  const [open, setOpen] = React.useState(false);
  const synthesized = safeObject(question.synthesizedAnswer);
  const analystCard = getAnalystAnswerCard(question);
  const status = primaryQuestionStatusTone(question, synthesized);
  const impact = verdictImpactTone(question.verdictImpact);
  const boundaries = normalizeRenderableList(question.sourceBoundary);
  const shortAnswer = analystCard.directAnswer || answerFallback(question);
  const supportItems = normalizeRenderableList(question.supportingSignals);
  const missingItems = normalizeRenderableList(question.missingEvidence);
  const contradictionItems = normalizeRenderableList(question.contradictionSignals);
  const changeItems = normalizeRenderableList(question.whatWouldChange);
  const reviewedTone = reviewedEvidenceTone(question.reviewedEvidenceStatus);
  const synthesizedTone = synthesizedPrimaryBadge(question, synthesizedEvidenceTone(synthesized.evidenceStatus));
  const reviewedSources = safeArray(question.reviewedSourcesUsed);
  const reviewedFacts = safeArray(question.reviewedFactsUsed);
  const synthesizedSources = safeArray(synthesized.reviewedSourcesUsed);
  const synthesizedFacts = safeArray(synthesized.reviewedFactsUsed);
  const evidenceMappingWarnings = normalizeRenderableList(question.evidenceMappingWarnings);
  const reviewedDoesNotAnswer = normalizeRenderableList(question.reviewedEvidenceDoesNotAnswer);
  const synthesizedMissing = normalizeRenderableList(analystCard.missingEvidence).length ? normalizeRenderableList(analystCard.missingEvidence) : normalizeRenderableList(synthesized.missingEvidence);
  const synthesizedWarnings = normalizeRenderableList(synthesized.warnings);
  const synthesizedBoundaries = normalizeRenderableList(analystCard.sourceBoundaryPlainEnglish).length ? normalizeRenderableList(analystCard.sourceBoundaryPlainEnglish) : normalizeRenderableList(synthesized.sourceBoundary);
  const synthesizedDoesNotProve = normalizeRenderableList(analystCard.whatEvidenceDoesNotProve).length ? normalizeRenderableList(analystCard.whatEvidenceDoesNotProve) : normalizeRenderableList(synthesized.whatEvidenceDoesNotProve);
  return (
    <details style={styles.institutionalQuestionAnswerCard} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary style={{ cursor: "pointer", listStyle: "none" }} aria-expanded={open}>
        <div style={styles.checklistQuestionHeader}>
          <div>
            <div style={styles.checklistQuestionText}>{question.questionText || "Institutional question"}</div>
            <p style={{ ...styles.institutionalQuestionSummary, marginBottom: 0 }}>{shortAnswer}</p>
          </div>
          <div style={styles.checklistStatusStack}>
            {statusChip(styles, analystCard.headlineStatus || status.label, synthesizedTone?.color || status.color)}
            {statusChip(styles, analystCard.primaryBadges?.includes("Not scoring-active") ? "Not scoring-active" : impact.label, impact.color)}
            {synthesizedTone ? statusChip(styles, synthesizedTone.label, synthesizedTone.color) : null}
            {reviewedTone ? statusChip(styles, reviewedTone.label, reviewedTone.color) : null}
            {statusChip(styles, supportItems.length ? "Signals attached" : "Source required", supportItems.length ? "#7dd3fc" : "#ffb020")}
            {statusChip(styles, open ? "Hide answer" : "View answer", "#d5dcec")}
            <span aria-hidden="true" style={{ color: "#d5dcec", fontSize: 18, fontWeight: 900, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 140ms ease" }}>{">"}</span>
          </div>
        </div>
      </summary>

      <div style={styles.institutionalQuestionDetailGrid}>
          <SectionRow label="Direct answer" value={shortAnswer} styles={styles} />
          <SectionRow label="Why it matters" value={analystCard.assetClassSpecificKeyIssue || "This question tests whether the asset-class thesis has enough source-backed support to improve confidence without overclaiming evidence."} styles={styles} />
        {synthesized.directAnswer ? (
          <SectionRow label="Synthesized answer model" value={`${synthesized.synthesisTemplateId || "institutional_answer_synthesis_v1"} | ${labelize(synthesized.evidenceStatus || "source_required")}`} styles={styles} />
        ) : null}
        <InlineList
          title="Supporting evidence, summarized"
          items={normalizeRenderableList(analystCard.evidenceBasis).length ? normalizeRenderableList(analystCard.evidenceBasis).slice(0, 4) : normalizeRenderableList(synthesized.evidenceUsed).length ? normalizeRenderableList(synthesized.evidenceUsed).slice(0, 4) : supportItems.slice(0, 4)}
          emptyText="No support signal attached."
          styles={styles}
          color="#7dd3fc"
        />
        <InlineList
          title="Reviewed sources used"
          items={(synthesizedSources.length ? synthesizedSources : reviewedSources).map((source) => `${source.title || "Reviewed source"} (${source.publisher || "publisher unavailable"}) - ${source.freshnessStatus || "freshness unknown"} - ${source.scoringEligible ? "scoring eligible" : "not scoring-active"}`)}
          emptyText="No reviewed evidence packet source mapped to this question."
          styles={styles}
          color="#a6f3c2"
        />
        <InlineList
          title="Key reviewed facts used"
          items={(synthesizedFacts.length ? synthesizedFacts : reviewedFacts).map((fact) => fact.claim || fact.factId)}
          emptyText="No reviewed facts mapped."
          styles={styles}
          color="#a6f3c2"
        />
        <InlineList
          title="What this evidence does not prove"
          items={synthesizedDoesNotProve}
          emptyText="No explicit non-proof boundary attached."
          styles={styles}
          color="#ffb020"
        />
        <InlineList
          title="Evidence mapping cautions"
          items={[...synthesizedWarnings, ...evidenceMappingWarnings, ...reviewedDoesNotAnswer].slice(0, 4)}
          emptyText="No evidence mapping caution attached."
          styles={styles}
          color="#ffb020"
        />
        <InlineList
          title="Missing evidence"
          items={(synthesizedMissing.length ? synthesizedMissing : missingItems).slice(0, 4)}
          emptyText={readableEmpty("missing evidence")}
          styles={styles}
          color="#ffb020"
        />
        <InlineList
          title="Contradictions / blockers"
          items={contradictionItems.slice(0, 4)}
          emptyText={readableEmpty("contradictions")}
          styles={styles}
          color="#ff6b6b"
        />
        <InlineList
          title="What would change"
          items={changeItems.slice(0, 4)}
          emptyText={readableEmpty("what would change")}
          styles={styles}
          color="#d5dcec"
        />
        <SectionRow label="Decision / confidence impact" value={analystCard.decisionImpact || synthesized.impact || impact.label} styles={styles} />
        <SectionRow label="Confidence boundary" value={analystCard.confidenceBoundary || "No scoring or verdict change is inferred from this display card."} styles={styles} />
        <SectionRow label="Manual review implication" value={analystCard.manualReviewImplication || "No separate manual-review implication beyond the current source boundary."} styles={styles} />
        <SectionRow label="Reviewed evidence status" value={reviewedTone?.label || "No reviewed packet mapped."} styles={styles} />
        <SectionRow label="Evidence scope" value={labelize(question.questionEvidenceScope || "not attached")} styles={styles} />
        <SectionRow label="Reviewed evidence boundary" value={question.reviewedEvidenceStatus ? "Reviewed demo evidence improves answer quality but is not scoring-active in v1." : "No reviewed evidence boundary attached."} styles={styles} />
        <SectionRow label="Source boundary" value={simplifiedBoundary(synthesizedBoundaries.length ? synthesizedBoundaries : boundaries)} styles={styles} />
      </div>

      <details style={{ marginTop: 12 }}>
        <summary style={{ color: "#8a94a6", cursor: "pointer", fontWeight: 800 }}>Technical details / raw fields</summary>
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, `Lens: ${labelize(question.assetClassLens)}`)}
          {boundaryChip(styles, `Capability: ${labelize(question.currentMvpCapability)}`)}
          {synthesized.evidenceStatus ? boundaryChip(styles, `Synthesized: ${labelize(synthesized.evidenceStatus)}`) : null}
          {boundaries.slice(0, 4).map((item) => boundaryChip(styles, labelize(item)))}
        </div>
        <InlineList title="Signals used" items={supportItems} emptyText="No support signal attached." styles={styles} color="#7dd3fc" />
        <InlineList title="Scoring/audit fields" items={question.scoringFieldsUsed} emptyText="No scoring/audit fields attached." styles={styles} color="#8a94a6" />
        <InlineList title="Analyst card audit fields" items={analystCard.auditFields} emptyText="No analyst-card audit fields attached." styles={styles} color="#8a94a6" />
        <SectionRow label="Question id" value={question.questionId || "Not available yet."} styles={styles} />
      </details>
    </details>
  );
}

function InstitutionalQuestionAnswersSection({ questions, provenance, calibrationWarnings, styles }) {
  const isReconstructed = provenance === "reconstructed_from_snapshot";
  const questionWarnings = safeArray(calibrationWarnings)
    .filter((warning) => safeArray(warning.relatedQuestionIds)
      .some((questionId) => questions.some((question) => question.questionId === questionId)));
  const hasLensMismatchWarning = questionWarnings.some((warning) => warning.id === "question_lens_mismatch");
  const hasLstWarning = questionWarnings.some((warning) => warning.id === "lst_scanner_over_escalation_possible");
  return (
    <Card
      title="Live Institutional Question Answers"
      subtitle="Deterministic answers generated from current live ThesisCore fields."
      styles={styles}
    >
      <div style={styles.engineNotice}>
        Answers use current live scoring/provider fields. Provider metadata is context, not reviewed evidence.
      </div>
      {isReconstructed ? (
        <div style={styles.institutionalQuestionsProvenanceNote}>
          Historical answers may be reconstructed from stored analysis fields.
        </div>
      ) : null}
      {hasLensMismatchWarning ? (
        <div style={styles.calibrationWarningNote}>
          Calibration note: provider-grounded lens routing and question group should be reviewed before relying on this checklist. This warning is diagnostic, not a scoring signal.
        </div>
      ) : null}
      {hasLstWarning ? (
        <div style={styles.calibrationWarningNote}>
          Calibration note: LST scanner-like risk is treated as technical verification until confirmed by stronger evidence. This is diagnostic, not a scoring signal.
        </div>
      ) : null}
      <div style={styles.institutionalQuestionAnswerGrid}>
        {questions.map((question) => (
          <InstitutionalQuestionAnswerCard
            key={question.questionId}
            question={question}
            styles={styles}
          />
        ))}
      </div>
    </Card>
  );
}

function checklistStatusCounts(questions) {
  return safeArray(questions).reduce((acc, question) => {
    const status = String(question?.answerStatus || "source_required");
    acc.total += 1;
    if (status === "supported") acc.supported += 1;
    else if (status === "partially_supported") acc.partial += 1;
    else if (status === "not_applicable") acc.notApplicable += 1;
    else if (status === "manual_review_required") acc.manualReview += 1;
    else if (status === "contradicted") acc.contradicted += 1;
    else acc.sourceRequired += 1;
    return acc;
  }, {
    total: 0,
    supported: 0,
    partial: 0,
    sourceRequired: 0,
    manualReview: 0,
    notApplicable: 0,
    contradicted: 0,
  });
}

function ChecklistEvidenceSummary({ questions, styles }) {
  const missingByQuestion = safeArray(questions)
    .map((question) => ({
      question: question.questionText || "Institutional question",
      item: normalizeRenderableList(question.missingEvidence)[0],
    }))
    .filter((entry) => entry.item)
    .slice(0, 5);
  const changeByQuestion = safeArray(questions)
    .map((question) => ({
      question: question.questionText || "Institutional question",
      item: normalizeRenderableList(question.whatWouldChange)[0],
    }))
    .filter((entry) => entry.item)
    .slice(0, 5);

  if (!missingByQuestion.length && !changeByQuestion.length) return null;

  return (
    <div style={styles.advancedGrid}>
      <Card title="Missing Evidence By Question" subtitle="Top verification gaps grouped by institutional question." styles={styles}>
        {missingByQuestion.length ? missingByQuestion.map((entry, index) => (
          <div key={`${entry.question}-missing-${index}`} style={styles.reviewSignalCard}>
            <div style={styles.metaLabel}>{entry.question}</div>
            <div style={styles.timelineSummary}>{entry.item}</div>
          </div>
        )) : (
          <p style={styles.timelineEmptyText}>No question-level missing evidence was attached.</p>
        )}
      </Card>
      <Card title="What Would Change" subtitle="Top requirements that would improve the checklist answer quality." styles={styles}>
        {changeByQuestion.length ? changeByQuestion.map((entry, index) => (
          <div key={`${entry.question}-change-${index}`} style={styles.reviewSignalCard}>
            <div style={styles.metaLabel}>{entry.question}</div>
            <div style={styles.timelineSummary}>{entry.item}</div>
          </div>
        )) : (
          <p style={styles.timelineEmptyText}>No question-level decision-change requirements were attached.</p>
        )}
      </Card>
    </div>
  );
}

function ResolvedLensPanel({ resolvedLens, styles }) {
  if (!resolvedLens?.lensId) return null;
  const visibleLensLabel = resolvedLens.visibleLabelOverride || resolvedLens.displayLabel || resolvedLens.label;
  const providerEvidence = safeArray(resolvedLens.providerClassificationEvidence)
    .slice(0, 5)
    .map((item) => `${providerLabel(item.provider)} ${item.field}: ${extractRenderableText(item.value, "Unspecified")}`);
  const routingSource = safeArray(resolvedLens.routingSource)
    .slice(0, 8)
    .map((item) => extractRenderableText(item, null))
    .filter(Boolean);
  const sourceBoundaries = safeArray(resolvedLens.sourceBoundary)
    .slice(0, 5)
    .map((item) => extractRenderableText(item, null))
    .filter(Boolean);
  return (
    <Card title="Provider-Grounded Research Lens" subtitle="Single lens used for institutional question routing." styles={styles}>
      <div style={styles.sourceBoundaryStrip}>
        {boundaryChip(styles, resolvedLens.lensId)}
        {boundaryChip(styles, `${labelize(resolvedLens.confidence)} confidence`)}
        {boundaryChip(styles, `Question group: ${resolvedLens.questionGroupId}`)}
      </div>
      <SectionRow label="Resolved lens" value={visibleLensLabel || "Unavailable"} styles={styles} />
      <SectionRow label="Asset-class group" value={resolvedLens.assetClassGroup || "Unavailable"} styles={styles} />
      <SectionRow
        label="Matched signals"
        value={safeArray(resolvedLens.matchedSignals).length ? resolvedLens.matchedSignals.join("; ") : "No matched signal attached."}
        styles={styles}
      />
      <SectionRow
        label="Ambiguity flags"
        value={safeArray(resolvedLens.ambiguityFlags).length ? resolvedLens.ambiguityFlags.join("; ") : "No ambiguity flags attached."}
        styles={styles}
      />
      <ListBlock
        title="Provider classification evidence"
        items={providerEvidence}
        emptyText="No provider classification evidence was attached."
        color="#7dd3fc"
        styles={styles}
      />
      <ListBlock
        title="Routing source"
        items={routingSource}
        emptyText="No routing source path was attached."
        color="#9bd7ff"
        styles={styles}
      />
      <ListBlock
        title="Source boundary"
        items={sourceBoundaries}
        emptyText="No source boundary text was attached."
        color="#ffb020"
        styles={styles}
      />
      <div style={styles.engineNotice}>
        Provider category metadata is classification evidence only. It is not reviewed proof of legal rights, reserves, redemption, backing, or tokenholder accrual.
      </div>
    </Card>
  );
}

function CategoryDrivenQuestionProfile({ model, styles }) {
  const contract = model?.categoryDrivenAssetFamilyContract;
  const diagnostics = model?.categoryReadinessDiagnostics;
  const providerSignals = model?.providerCategorySignals;
  if (!contract?.primaryAssetFamily) return null;
  const questions = safeArray(contract.questionRegistryGroup?.questions);

  return (
    <CollapsibleDetail
      title={contract.categoryAuthorityApplied ? "Authoritative Category Question Group" : "Category-Driven Question Profile"}
      subtitle={contract.categoryAuthorityApplied
        ? "High-confidence category family is driving display, DataFirst source gaps, and checklist question routing; scoring and verdicts are unchanged."
        : "Provider category/tags route diagnostic source questions; they are not reviewed evidence or scoring inputs."}
      styles={styles}
      tone="#9bd7ff"
    >
      <div style={styles.sourceBoundaryStrip}>
        {boundaryChip(styles, contract.primaryVisibleLabel || contract.frontendVisibleLabel || contract.primaryAssetFamily)}
        {boundaryChip(styles, `Authority: ${contract.categoryAuthorityStatus || "unknown"}`)}
        {boundaryChip(styles, `Question group: ${contract.questionRegistryGroup?.groupId || "unavailable"}`)}
        {boundaryChip(styles, `Source profile: ${contract.sourceRequirementProfile?.profileId || "unavailable"}`)}
        {boundaryChip(styles, `AIC: ${contract.categoryAicAlignmentStatus || "unknown"}`)}
        {boundaryChip(styles, `DataFirst: ${contract.categoryDataFirstAlignmentStatus || "unknown"}`)}
        {boundaryChip(styles, `Questions: ${contract.categoryQuestionGroupAlignmentStatus || "unknown"}`)}
        {boundaryChip(styles, `Family confidence: ${contract.familyConfidence || "unknown"}`)}
        {boundaryChip(styles, diagnostics?.scoringIntegrationStatus || "non_scoring_v1")}
      </div>
      <SectionRow
        label="Authority reason"
        value={contract.categoryAuthorityReason || contract.categoryAuthorityBlockedReason || "Category authority status unavailable."}
        styles={styles}
      />
      <SectionRow
        label="Category routing summary"
        value={providerSignals?.frontendVisibleSummary || "Provider category summary unavailable."}
        styles={styles}
      />
      <div style={styles.sourceBoundaryStrip}>
        {boundaryChip(styles, `Category data: ${providerSignals?.categoryDataCoverage || "unavailable"}`)}
        {boundaryChip(styles, `CG categories: ${providerSignals?.coinGeckoCategoryUniverseStatus?.status || "unknown"}`)}
        {boundaryChip(styles, `CMC categories: ${providerSignals?.coinMarketCapCategoryUniverseStatus?.status || "unknown"}`)}
        {boundaryChip(styles, `Peers: ${providerSignals?.categoryPeerMarketStats?.peerCount ?? 0}`)}
      </div>
      <InlineList
        title="Raw category/source requirements"
        items={providerSignals?.categoryDataSourceRequirements}
        emptyText="No category endpoint source requirements attached."
        styles={styles}
        color="#f9d976"
      />
      <InlineList
        title="Category-driven questions"
        items={questions.map((question) => question.question)}
        emptyText="No category-driven questions attached."
        styles={styles}
        color="#9bd7ff"
      />
      <InlineList
        title="Priority source requirements"
        items={contract.sourceRequirementProfile?.priorityRequirements}
        emptyText="No category source requirements attached."
        styles={styles}
        color="#f9d976"
      />
      <InlineList
        title="False-positive / context risks"
        items={diagnostics?.falsePositiveRisks}
        emptyText="No category false-positive risk attached."
        styles={styles}
        color="#ffb020"
      />
      <SectionRow
        label="Boundary"
        value="Provider categories and ecosystem tags are diagnostic routing signals only. They do not change final scoring, verdicts, provider behavior, or reviewed-evidence status."
        styles={styles}
      />
    </CollapsibleDetail>
  );
}

function CalibrationWarningsSummary({ warnings, styles }) {
  const items = safeArray(warnings);
  if (!items.length) return null;
  return (
    <Card title="Lens / Identity / Calibration Notes" subtitle="Diagnostic warnings surfaced from the live response." styles={styles}>
      <div style={styles.engineNotice}>
        These warnings are not evidence and do not change scoring by themselves. They explain where manual review or source requirements are needed.
      </div>
      <div style={styles.institutionalQuestionAnswerGrid}>
        {items.slice(0, 6).map((warning, index) => (
          <div key={`${warning.id || "warning"}-${index}`} style={styles.reviewSignalCard}>
            <div style={styles.timelineTitleRow}>
              <strong style={{ color: "#f4f7ff" }}>{labelize(warning.id || "diagnostic warning")}</strong>
              {statusChip(styles, warning.affectsScoring ? "Affects scoring" : "Diagnostic warning", warning.affectsScoring ? "#ff6b6b" : "#ffb020")}
            </div>
            <div style={styles.timelineSummary}>{warning.issue || warning.recommendedAction || "Manual review required."}</div>
            <div style={styles.timelineMeta}>
              {warning.affectsVerdict ? "Affects verdict" : "Does not affect verdict"} - {warning.sourceBoundary || "source boundary unavailable"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function normalizeChecklistSignalStatus(value) {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("provider") || raw.includes("gap") || raw.includes("unavailable")) {
    return "Provider Gap Possible";
  }
  if (raw.includes("review")) {
    return "Needs Source Review";
  }
  if (raw.includes("not attached")) {
    return "Not Attached To Live Mapping";
  }
  if (raw.includes("proxy")) {
    return "Methodology Question";
  }
  if (raw.includes("present") || raw.includes("detected")) {
    return "Related Review Signal";
  }
  return "Related Review Signal";
}

function dedupeSignals(signals) {
  const seen = new Set();
  return signals.filter((signal) => {
    const key = `${signal.label}-${signal.description}-${signal.source}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildChecklistLiveSignals({ model, sourceStatus, providerDiagnostics, providerHealth, evidenceStatusProxy }) {
  const missing = normalizeRenderableList(model?.missingCritical).map((entry) => ({
    label: "Missing critical evidence",
    description: entry,
    source: "decisionModel.missingCritical",
    status: "Needs Source Review",
    color: "#ffb020",
  }));
  const required = normalizeRenderableList(model?.requiredConditions).map((entry) => ({
    label: "Required condition",
    description: entry,
    source: "decisionModel.requiredConditions",
    status: "Related Review Signal",
    color: "#7dd3fc",
  }));
  const alerts = normalizeRenderableList(model?.auditAlerts).map((entry) => ({
    label: "Audit alert",
    description: entry,
    source: "decisionModel.auditAlerts",
    status: "Needs Source Review",
    color: "#ff6b6b",
  }));
  const sourceSignals = Object.entries(safeObject(sourceStatus))
    .filter(([, value]) => ["partial", "modeled", "weak", "unsupported", "skipped", "unavailable", "missing"].includes(String(value).toLowerCase()))
    .map(([section, value]) => ({
      label: providerLabel(section),
      description: `Live source status is ${titleCase(value)}. This is not question-level evidence support.`,
      source: "sourceStatus",
      status: "Provider Gap Possible",
      color: "#ffb020",
    }));
  const providerSignals = safeArray(providerDiagnostics)
    .filter((entry) => (
      entry.status === "failure" ||
      entry.status === "skipped" ||
      ["missing", "unavailable", "unsupported", "weak", "partial"].includes(entry.coverage || "")
    ))
    .map((entry) => ({
      label: providerLabel(entry.provider || entry.source || entry.section || "provider"),
      description: entry.reason || "Provider/source context is partial or unavailable in the live response.",
      source: "meta.providerDiagnostics",
      status: entry.status === "failure" ? "Provider Gap Possible" : "Needs Source Review",
      color: entry.status === "failure" ? "#ff6b6b" : "#ffb020",
    }));
  const proxySignals = safeArray(evidenceStatusProxy?.items)
    .filter((item) => ["provider_gap", "contradiction_audit", "manual_review_signal", "missing_critical", "partial_indirect"].includes(item.key))
    .map((item) => ({
      label: item.label,
      description: item.description,
      source: item.sourceLabel || "deriveEvidenceStatusProxy",
      status: normalizeChecklistSignalStatus(item.valueLabel),
      color: item.severity === "critical" ? "#ff6b6b" : "#ffb020",
    }));
  const providerHealthSignals = providerHealth?.summary ? [{
    label: "Provider health",
    description: extractRenderableText(providerHealth.summary, "Provider health context is attached to the live UI."),
    source: "providerHealth",
    status: "Related Review Signal",
    color: "#7dd3fc",
  }] : [];

  return dedupeSignals([
    ...missing,
    ...required,
    ...alerts,
    ...sourceSignals,
    ...providerSignals,
    ...proxySignals,
    ...providerHealthSignals,
  ]).slice(0, 12);
}

function matchesSignal(question, group, signal) {
  const haystack = `${question.question} ${question.why} ${question.evidence.join(" ")} ${group.title} ${signal.label} ${signal.description}`.toLowerCase();
  return safeArray(question.keywords || group.keywords).some((keyword) => haystack.includes(keyword));
}

function findSignal(question, group, signals) {
  return signals.find((signal) => matchesSignal(question, group, signal));
}

function baseGroups() {
  return [
    {
      title: "Asset Identity & Classification",
      subtitle: "What is being tested before any thesis can be evaluated.",
      keywords: ["asset", "identity", "classification", "category", "token", "network", "role"],
      questions: [
        {
          id: "identity-01",
          question: "What type of asset is this?",
          why: "The rubric changes materially across stablecoins, wrapped assets, DeFi, infrastructure, and narrative assets.",
          evidence: ["asset metadata", "official docs", "category/provider context"],
        },
        {
          id: "identity-02",
          question: "What role does it claim to play?",
          why: "A settlement asset, utility token, governance token, and wrapper should not be assessed through the same thesis.",
          evidence: ["official docs", "token role description", "project disclosures"],
        },
        {
          id: "identity-03",
          question: "Is the investable token the same as the useful network or product?",
          why: "Protocol usefulness does not automatically become tokenholder value.",
          evidence: ["tokenomics", "utility disclosures", "provider context"],
          keywords: ["tokenholder", "utility", "protocol", "value"],
        },
      ],
    },
    {
      title: "Token Demand / Value Capture",
      subtitle: "Whether usage creates demand for the investable token.",
      keywords: ["demand", "accrual", "fee", "revenue", "tokenholder", "aum", "tvl", "usage"],
      rule: "Protocol usage, TVL, or AUM must not be treated as tokenholder value capture without direct evidence.",
      questions: [
        {
          id: "tdq-01",
          question: "Does usage create token demand?",
          why: "A useful product can still leave the token economically weak.",
          evidence: ["tokenomics", "staking/burn/buyback mechanics", "usage-to-token linkage"],
        },
        {
          id: "tdq-02",
          question: "Does protocol growth accrue to tokenholders?",
          why: "AUM, TVL, and usage are not enough unless value capture is direct.",
          evidence: ["fee routing", "governance docs", "protocol financials"],
        },
        {
          id: "tdq-03",
          question: "Are fees or revenue captured by the token or elsewhere?",
          why: "Fees can accrue to LPs, validators, sequencers, teams, or users rather than tokenholders.",
          evidence: ["protocol financials", "fee switch status", "revenue distribution docs"],
        },
      ],
    },
    {
      title: "Evidence Quality / Source Directness",
      subtitle: "Whether claims are directly supported or only adjacent context.",
      keywords: ["evidence", "source", "provider", "diagnostic", "direct", "manual", "review"],
      rule: "Live provider availability does not equal question-level support.",
      questions: [
        {
          id: "evidence-01",
          question: "Is evidence direct or indirect?",
          why: "Adjacent context should not be promoted into institutional support.",
          evidence: ["Evidence Directness", "provider diagnostics", "source provenance"],
        },
        {
          id: "evidence-02",
          question: "Are claims backed by provider or source evidence?",
          why: "The UI must distinguish live signals, report-only evidence, and candidate-only sources.",
          evidence: ["provider diagnostics", "direct source docs", "reviewed evidence"],
        },
        {
          id: "evidence-03",
          question: "Which claims require manual review?",
          why: "Unresolved evidence should create review leads rather than fake answers.",
          evidence: ["manual review signals", "missing critical evidence", "audit alerts"],
        },
      ],
    },
    {
      title: "Risk / Control / Governance",
      subtitle: "Whether controls or dependencies can alter the thesis.",
      keywords: ["admin", "governance", "contract", "security", "audit", "dependency", "control", "freeze", "pause", "upgrade"],
      questions: [
        {
          id: "risk-01",
          question: "Can admins, governance, or contracts alter economics?",
          why: "Control rights can override apparent economics or create tail risk.",
          evidence: ["contract risk flags", "governance docs", "admin control disclosures"],
        },
        {
          id: "risk-02",
          question: "Are there freeze, pause, or upgrade controls?",
          why: "Control surfaces affect custody, transferability, and confidence boundaries.",
          evidence: ["contract risk flags", "security docs", "audit reports"],
        },
        {
          id: "risk-03",
          question: "Are major dependencies unresolved?",
          why: "Custodian, oracle, bridge, issuer, or governance dependencies can be thesis-critical.",
          evidence: ["dependency docs", "audit reports", "source-backed manual review"],
        },
      ],
    },
    {
      title: "Liquidity / Exit / Market Structure",
      subtitle: "Whether apparent liquidity can support institutional execution.",
      keywords: ["liquidity", "volume", "venue", "exit", "market", "depth", "slippage"],
      rule: "Volume alone does not prove institutional exit depth.",
      questions: [
        {
          id: "liquidity-01",
          question: "Can the asset be exited in size?",
          why: "Headline liquidity can fail under stress or institutional order size.",
          evidence: ["volume/liquidity context", "depth/slippage where available", "venue data"],
        },
        {
          id: "liquidity-02",
          question: "Is liquidity durable or venue-concentrated?",
          why: "Concentrated liquidity can disappear or become unavailable when needed.",
          evidence: ["DEX/CEX venue data", "liquidity distribution", "stress liquidity evidence"],
        },
        {
          id: "liquidity-03",
          question: "Does volume imply real execution depth?",
          why: "Volume can be noisy, wash-like, or too shallow to support institutional exits.",
          evidence: ["depth/slippage", "venue quality", "stress execution evidence"],
        },
      ],
    },
  ];
}

function lensSpecificGroup(lensResolution) {
  const entry = lensResolution.entry;
  return {
    title: `Selected Asset-Class Lens: ${entry.displayName}`,
    subtitle: `${entry.description} Methodology only unless mapped evidence is attached.`,
    keywords: [
      ...(entry.routingSignals?.keywords || []),
      ...(entry.evidenceRequired || []),
    ],
    rule: entry.boundaryCopy,
    questions: entry.questions,
  };
}

function ChecklistQuestionRow({ group, question, signal, styles }) {
  const statusItems = [
    { label: "Methodology Question", color: "#7dd3fc" },
    { label: signal ? "Related Review Signal" : "Not answered yet", color: signal ? "#ffb020" : "#8a94a6" },
    { label: "Needs Source Review", color: "#ffb020" },
    { label: "Report-Layer Only", color: "#9bd7ff" },
  ];

  return (
    <div style={styles.checklistRow}>
      <div style={styles.checklistQuestionHeader}>
        <div>
          <div style={styles.metaLabel}>{question.id}</div>
        <div style={styles.checklistQuestionText}>{question.question}</div>
      </div>
      <div style={styles.checklistStatusStack}>
          {statusItems.map((item) => (
            <React.Fragment key={item.label}>
              {statusChip(styles, item.label, item.color)}
            </React.Fragment>
          ))}
      </div>
      </div>

      <div style={styles.checklistSlotGrid}>
        <SectionRow label="Why it matters" value={question.why} styles={styles} />
        <SectionRow label="Current answer" value="Not available yet. Do not infer an answer." styles={styles} />
        <SectionRow
          label="Related live review signal"
          value={signal ? `${signal.status}: ${signal.description}` : "No question-level live signal is attached. Do not infer an answer."}
          styles={styles}
        />
        <SectionRow label="Source requirement" value="Source trace and manual research status appear here only when attached by a live or report endpoint." styles={styles} />
        <SectionRow label="Verdict / scoring boundary" value="Methodology/report-layer only. No scoring impact unless future calibrated integration explicitly attaches it." styles={styles} />
      </div>

      <div style={styles.checklistEvidenceTags}>
        {question.evidence.map((item) => (
          <React.Fragment key={item}>
            {evidenceTag(styles, item)}
          </React.Fragment>
        ))}
        {group.rule ? evidenceTag(styles, "Hard rule applies") : null}
      </div>
    </div>
  );
}

function ChecklistGroup({ group, signals, styles }) {
  return (
    <Card title={group.title} subtitle={group.subtitle} styles={styles}>
      {group.rule ? (
        <div style={styles.engineNotice}>{group.rule}</div>
      ) : null}
      <div style={styles.checklistQuestionList}>
        {group.questions.map((question) => (
          <ChecklistQuestionRow
            key={question.id}
            group={group}
            question={question}
            signal={findSignal(question, group, signals)}
            styles={styles}
          />
        ))}
      </div>
    </Card>
  );
}

function ScoringReadinessChecklistImpact({ readiness, styles }) {
  const contract = safeObject(readiness);
  if (!contract.artifactVersion) return null;
  const dimensions = safeArray(contract.dimensions);
  const sourceRequired = dimensions.filter((dimension) => dimension.evidenceStatus === "source_required" || safeArray(dimension.missingEvidence).length);

  return (
    <Card
      title="Scoring Readiness Impact"
      subtitle="Diagnostic mapping from institutional answers to future evidence-to-scoring readiness."
      styles={styles}
    >
      <div style={styles.evidenceMapBoundaryStrip}>
        {boundaryChip(styles, "Diagnostic only")}
        {boundaryChip(styles, "Legacy score/verdict unchanged")}
        {boundaryChip(styles, "Reviewed evidence not scoring-active")}
      </div>
      <div style={styles.checklistBridgeGrid}>
        <div style={styles.checklistBridgeNode}>Family: {contract.assetFamilyLabel || "Unavailable"}</div>
        <div style={styles.checklistBridgeNode}>Status: {labelize(contract.overallReadinessStatus || "unavailable")}</div>
        <div style={styles.checklistBridgeNode}>Ready: {contract.scoringReadyDimensionCount ?? 0}</div>
        <div style={styles.checklistBridgeNode}>Source required: {contract.sourceRequiredDimensionCount ?? sourceRequired.length}</div>
      </div>
      <ListBlock
        title="Top readiness gaps"
        items={safeArray(contract.whatWouldChangeScore).slice(0, 5)}
        emptyText="No scoring-readiness gaps were attached."
        color="#f9d976"
        styles={styles}
      />
    </Card>
  );
}

export default function InstitutionalChecklistTab({
  asset,
  analysis,
  model,
  sourceStatus,
  providerDiagnostics,
  providerHealth,
  evidenceStatusProxy,
  calibrationWarnings,
  styles,
}) {
  const analysisQuestionPayload = normalizeInstitutionalQuestionsPayload(analysis);
  const modelQuestionPayload = normalizeInstitutionalQuestionsPayload(model);
  const institutionalQuestions = analysisQuestionPayload.institutionalQuestions.length
    ? analysisQuestionPayload.institutionalQuestions
    : modelQuestionPayload.institutionalQuestions;
  const institutionalQuestionsProvenance = analysisQuestionPayload.institutionalQuestionsProvenance
    || modelQuestionPayload.institutionalQuestionsProvenance
    || null;
  const resolvedInstitutionalLens = normalizeResolvedInstitutionalLensPayload(analysis)
    || normalizeResolvedInstitutionalLensPayload(model);
  const visibleResolvedLensLabel = resolvedInstitutionalLens?.visibleLabelOverride
    || resolvedInstitutionalLens?.displayLabel
    || resolvedInstitutionalLens?.label;
  const hasInstitutionalAnswers = institutionalQuestions.length > 0;
  const signals = buildChecklistLiveSignals({ model, sourceStatus, providerDiagnostics, providerHealth, evidenceStatusProxy });
  const lensResolution = resolveInstitutionalChecklistLens(asset, analysis, model);
  const selectedLensGroup = lensSpecificGroup(lensResolution);
  const groups = [...baseGroups(), selectedLensGroup];
  const questionCounts = checklistStatusCounts(institutionalQuestions);
  const bridgeSteps = [
    "Question",
    "Answer/status",
    "Evidence present",
    "Evidence missing",
    "Source trace",
    "Manual review",
    "Scoring/report boundary",
    "Verdict impact",
  ];

  return (
    <div style={styles.institutionalChecklistShell}>
      <ExecutiveSummaryCard
        eyebrow="Institutional Checklist"
        title={hasInstitutionalAnswers ? "What does the institutional Q&A say?" : "Which institutional questions should be asked?"}
        answer={hasInstitutionalAnswers
          ? "Live deterministic question answers are attached. Rows show concise status first; source signals and raw technical fields are expandable."
          : "Question-level answers are not attached yet. The checklist shows safe methodology prompts and live review signals without inventing answers."}
        tone="#9bd7ff"
        badges={[
          { label: hasInstitutionalAnswers ? `${institutionalQuestions.length} live answers` : "Methodology prompts", tone: hasInstitutionalAnswers ? "#7dd3fc" : "#d5dcec" },
          hasInstitutionalAnswers ? { label: `${questionCounts.supported + questionCounts.partial} supported/partial`, tone: "#a6f3c2" } : { label: visibleResolvedLensLabel || lensResolution.displayName, tone: "#9bd7ff" },
          hasInstitutionalAnswers ? { label: `${questionCounts.sourceRequired + questionCounts.manualReview} source/review`, tone: "#f9d976" } : { label: "Provider metadata is context", tone: "#f9d976" },
          hasInstitutionalAnswers && questionCounts.notApplicable ? { label: `${questionCounts.notApplicable} not applicable`, tone: "#8a94a6" } : null,
        ].filter(Boolean)}
        styles={styles}
      >
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, hasInstitutionalAnswers ? "Live deterministic question answers are attached." : "Live per-question evidence mapping is only shown when attached to the response.")}
          {boundaryChip(styles, "This checklist is methodology/report-layer guidance, not a fake evidence map.")}
          {boundaryChip(styles, "Missing evidence is a verification gap, not automatic proof of failure.")}
          {boundaryChip(styles, "Report-only source evidence does not affect live scoring unless future calibrated integration occurs.")}
        </div>
        {!hasInstitutionalAnswers ? (
          <>
            <SectionRow
              label="Registry boundary"
              value="The Institutional Question Registry defines the questions ThesisCore uses to test asset classes. Question-level answers, evidence statuses, source traces, and verdict impacts will appear here only when attached by a live or report endpoint."
              styles={styles}
            />
            <SectionRow
              label="Current asset lens"
              value={resolvedInstitutionalLens
                ? `${visibleResolvedLensLabel} (${resolvedInstitutionalLens.confidence} provider-grounded confidence)`
                : `${lensResolution.displayName} (${lensResolution.confidence} resolver confidence)`}
              styles={styles}
            />
          </>
        ) : null}
      </ExecutiveSummaryCard>

      {hasInstitutionalAnswers ? (
        <>
          {model?.categoryDrivenAssetFamilyContract?.categoryAuthorityApplied ? (
            <CategoryDrivenQuestionProfile model={model} styles={styles} />
          ) : null}

          <InstitutionalQuestionAnswersSection
            questions={institutionalQuestions}
            provenance={institutionalQuestionsProvenance}
            calibrationWarnings={calibrationWarnings || model?.calibrationWarnings}
            styles={styles}
          />

          <ScoringReadinessChecklistImpact readiness={model?.scoringReadinessContract} styles={styles} />

          <ChecklistEvidenceSummary questions={institutionalQuestions} styles={styles} />

          {!model?.categoryDrivenAssetFamilyContract?.categoryAuthorityApplied ? (
            <CategoryDrivenQuestionProfile model={model} styles={styles} />
          ) : null}

          <CollapsibleDetail
            title="Tokenomics Question Module"
            subtitle="Supply-integrity questions remain available here, with the full experience in the Tokenomics tab."
            styles={styles}
            tone="#9bd7ff"
          >
            <TokenomicsSupplyQuestionCard tokenomics={model?.tokenomicsSupplyIntegrity} styles={styles} />
          </CollapsibleDetail>

          <CollapsibleDetail
            title="Lens / Resolver / Provider Context"
            subtitle="Routing metadata is important, but it is secondary to the live institutional answers above."
            styles={styles}
            tone="#8a94a6"
          >
            <SectionRow
              label="Current asset lens"
              value={resolvedInstitutionalLens
                ? `${visibleResolvedLensLabel} (${resolvedInstitutionalLens.confidence} provider-grounded confidence)`
                : `${lensResolution.displayName} (${lensResolution.confidence} resolver confidence)`}
              styles={styles}
            />
            <SectionRow
              label="Resolver reason"
              value={resolvedInstitutionalLens?.fallbackReason || lensResolution.reason}
              styles={styles}
            />
            <SectionRow
              label="Matched routing signals"
              value={resolvedInstitutionalLens?.matchedSignals?.length
                ? resolvedInstitutionalLens.matchedSignals.join("; ")
                : lensResolution.matchedSignals?.length ? lensResolution.matchedSignals.join("; ") : "No specialized routing signal attached. Using conservative fallback."}
              styles={styles}
            />
            <ResolvedLensPanel resolvedLens={resolvedInstitutionalLens} styles={styles} />
            <CalibrationWarningsSummary warnings={calibrationWarnings || model?.calibrationWarnings} styles={styles} />
          </CollapsibleDetail>
        </>
      ) : (
        <>
      <ResolvedLensPanel resolvedLens={resolvedInstitutionalLens} styles={styles} />

      <CalibrationWarningsSummary warnings={calibrationWarnings || model?.calibrationWarnings} styles={styles} />

      <CategoryDrivenQuestionProfile model={model} styles={styles} />

      <TokenomicsSupplyQuestionCard tokenomics={model?.tokenomicsSupplyIntegrity} styles={styles} />

      <Card title="Engine-to-UI Bridge" subtitle="Future connection between questions, evidence, sources, and verdict impact." styles={styles}>
        <div style={styles.checklistBridgeGrid}>
          {bridgeSteps.map((step) => (
            <div key={step} style={styles.checklistBridgeNode}>{step}</div>
          ))}
        </div>
        <div style={styles.engineNotice}>
          This tab is designed to become the bridge between ThesisCore's institutional question engine and the user-facing evidence map. Until question-level mapping is attached, it displays methodology questions and safe live-review signals only.
        </div>
      </Card>

      <div style={styles.advancedGrid}>
        <Card title="Safe Live-Response Review Signals" subtitle="Qualitative signals only. Not question-level answers, not counts." styles={styles}>
          {signals.length ? signals.slice(0, 6).map((signal, index) => (
            <div key={`${signal.source}-${signal.label}-${index}`} style={styles.reviewSignalCard}>
              <div style={styles.timelineTitleRow}>
                <strong style={{ color: "#f4f7ff" }}>{signal.label}</strong>
                {statusChip(styles, signal.status, signal.color)}
              </div>
              <div style={styles.timelineSummary}>{signal.description}</div>
              <div style={styles.timelineMeta}>{signal.source} - live review signal, not checklist support</div>
            </div>
          )) : (
            <p style={styles.timelineEmptyText}>No checklist-relevant live review signals were surfaced. Do not infer question-level answers.</p>
          )}
        </Card>

        <Card title="Attachment Status" subtitle="What is intentionally not shown yet." styles={styles}>
          <ListBlock
            title="Not attached to this live response"
            items={[
              "question-level answers",
              "question-level evidence statuses",
              "question-level source traces",
              "manual-source overlay status",
              "verdict/confidence impact by question",
            ]}
            emptyText=""
            color="#ffb020"
            styles={styles}
          />
        </Card>
      </div>

      <Card title="Selected Lens Safeguards" subtitle="Display routing guardrails. These are not scoring modules." styles={styles}>
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, `Lens ID: ${lensResolution.lensId}`)}
          {boundaryChip(styles, "GENERAL_LOW_COVERAGE fallback when ambiguous.")}
          {boundaryChip(styles, "No question-level answers are implied.")}
        </div>
        <ListBlock
          title="Wrong-lens safeguards"
          items={safeArray(lensResolution.avoidWarnings).slice(0, 6)}
          emptyText="No additional lens-specific safeguards attached."
          color="#ffb020"
          styles={styles}
        />
      </Card>

      {groups.map((group) => (
        <ChecklistGroup key={group.title} group={group} signals={signals} styles={styles} />
      ))}
        </>
      )}
    </div>
  );
}
