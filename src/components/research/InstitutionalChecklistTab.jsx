import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import {
  extractRenderableText,
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
      return { label: labelize(status || "Unknown"), color: "#8a94a6" };
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
      return { label: labelize(impact || "No scoring impact"), color: "#aab7cc" };
  }
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
  const status = questionStatusTone(question.answerStatus);
  const impact = verdictImpactTone(question.verdictImpact);
  const boundaries = normalizeRenderableList(question.sourceBoundary).map(labelize);
  return (
    <div style={styles.institutionalQuestionAnswerCard}>
      <div style={styles.checklistQuestionHeader}>
        <div>
          <div style={styles.metaLabel}>{question.questionId}</div>
          <div style={styles.checklistQuestionText}>{question.questionText}</div>
        </div>
        <div style={styles.checklistStatusStack}>
          {statusChip(styles, status.label, status.color)}
          {statusChip(styles, impact.label, impact.color)}
        </div>
      </div>

      <p style={styles.institutionalQuestionSummary}>{question.answerSummary}</p>

      <div style={styles.institutionalQuestionDetailGrid}>
        <InlineList
          title="Evidence used / supporting signals"
          items={question.supportingSignals}
          emptyText="No support signal attached."
          styles={styles}
          color="#7dd3fc"
        />
        <InlineList
          title="Missing evidence"
          items={question.missingEvidence}
          emptyText="No missing-evidence field attached."
          styles={styles}
          color="#ffb020"
        />
        <InlineList
          title="Contradictions / blockers"
          items={question.contradictionSignals}
          emptyText="No contradiction signal attached."
          styles={styles}
          color="#ff6b6b"
        />
        <InlineList
          title="What would change"
          items={question.whatWouldChange}
          emptyText="No decision-change condition attached."
          styles={styles}
          color="#d5dcec"
        />
      </div>

      <div style={styles.sourceBoundaryStrip}>
        {boundaryChip(styles, `Lens: ${question.assetClassLens}`)}
        {boundaryChip(styles, `MVP: ${labelize(question.currentMvpCapability)}`)}
        {boundaries.slice(0, 4).map((item) => boundaryChip(styles, item))}
      </div>
    </div>
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
        Answers use current live scoring/provider fields. They are not reviewed external evidence unless explicitly stated.
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

function ResolvedLensPanel({ resolvedLens, styles }) {
  if (!resolvedLens?.lensId) return null;
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
      <SectionRow label="Resolved lens" value={resolvedLens.label || "Unavailable"} styles={styles} />
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
    { label: signal ? "Related Review Signal" : "Not Attached To Live Mapping", color: signal ? "#ffb020" : "#8a94a6" },
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
        <SectionRow label="Future answer/status slot" value="Not attached to live mapping." styles={styles} />
        <SectionRow
          label="Related live review signal"
          value={signal ? `${signal.status}: ${signal.description}` : "No question-level live signal is attached. Do not infer an answer."}
          styles={styles}
        />
        <SectionRow label="Source / research requirement" value="Source trace and manual research status appear here only when attached by a live or report endpoint." styles={styles} />
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
  const hasInstitutionalAnswers = institutionalQuestions.length > 0;
  const signals = buildChecklistLiveSignals({ model, sourceStatus, providerDiagnostics, providerHealth, evidenceStatusProxy });
  const lensResolution = resolveInstitutionalChecklistLens(asset, analysis, model);
  const selectedLensGroup = lensSpecificGroup(lensResolution);
  const groups = [...baseGroups(), selectedLensGroup];
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
      <Card title="Institutional Checklist" subtitle="Methodology / Report Layer" styles={styles}>
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, hasInstitutionalAnswers ? "Live deterministic question answers are attached." : "Live per-question evidence mapping is only shown when attached to the response.")}
          {boundaryChip(styles, "This checklist is methodology/report-layer guidance, not a fake evidence map.")}
          {boundaryChip(styles, "Missing evidence is a verification gap, not automatic proof of failure.")}
          {boundaryChip(styles, "Report-only source evidence does not affect live scoring unless future calibrated integration occurs.")}
        </div>
        <SectionRow
          label="Registry boundary"
          value={hasInstitutionalAnswers
            ? "The backend attached deterministic institutional question answers for this asset. They explain current live scoring and evidence gaps; they do not override scoring or verdicts."
            : "The Institutional Question Registry defines the questions ThesisCore uses to test asset classes. Question-level answers, evidence statuses, source traces, and verdict impacts will appear here only when attached by a live or report endpoint."}
          styles={styles}
        />
        <SectionRow
          label="Current asset lens"
          value={resolvedInstitutionalLens
            ? `${resolvedInstitutionalLens.label} (${resolvedInstitutionalLens.confidence} provider-grounded confidence)`
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
      </Card>

      <ResolvedLensPanel resolvedLens={resolvedInstitutionalLens} styles={styles} />

      <CalibrationWarningsSummary warnings={calibrationWarnings || model?.calibrationWarnings} styles={styles} />

      <TokenomicsSupplyQuestionCard tokenomics={model?.tokenomicsSupplyIntegrity} styles={styles} />

      {hasInstitutionalAnswers ? (
        <InstitutionalQuestionAnswersSection
          questions={institutionalQuestions}
          provenance={institutionalQuestionsProvenance}
          calibrationWarnings={calibrationWarnings || model?.calibrationWarnings}
          styles={styles}
        />
      ) : (
        <>
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
