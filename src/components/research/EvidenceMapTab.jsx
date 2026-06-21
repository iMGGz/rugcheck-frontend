import React from "react";
import { Card, ExecutiveSummaryCard, ListBlock, QuestionPromptCard, SectionRow } from "./researchPrimitives";
import EvidenceConfidenceCard from "./EvidenceConfidenceCard";
import ProviderDiagnosticsPanel from "./ProviderDiagnosticsPanel";
import ProviderHealthPanel from "./ProviderHealthPanel";
import ResearchContextPanel from "./ResearchContextPanel";
import SourcesPanel from "./SourcesPanel";
import {
  diagnosticTone,
  extractRenderableText,
  cleanPrimaryAnswerText,
  getAnalystAnswerCard,
  normalizeEvidenceProxyDisplayLabel,
  normalizeProviderHealth,
  normalizeRenderableList,
  providerHealthDisplayTone,
  providerLabel,
  safeArray,
  safeObject,
  sourceColor,
  titleCase,
} from "./researchUtils";

function boundaryChip(styles, children) {
  return (
    <span style={styles.evidenceMapBoundaryChip}>
      {children}
    </span>
  );
}

function statusChip(styles, label, color = "#8a94a6") {
  return (
    <span style={{ ...styles.riskChip, borderColor: color, color }}>
      {label}
    </span>
  );
}

function normalizeSourceStatusRows(sourceStatus) {
  return Object.entries(safeObject(sourceStatus))
    .map(([section, status]) => {
      const value = typeof status === "string" ? status : extractRenderableText(status, null);
      if (!value) return null;
      return {
        key: `source-${section}`,
        name: providerLabel(section),
        status: titleCase(value),
        statusColor: sourceColor(value),
        contribution: "Live source coverage signal returned by the current analysis response.",
        freshness: "Freshness unavailable",
        sourceLabel: "sourceStatus",
      };
    })
    .filter(Boolean);
}

function normalizeDiagnosticRows(providerDiagnostics) {
  return safeArray(providerDiagnostics)
    .map((entry, index) => {
      const tone = diagnosticTone(entry);
      return {
        key: `diagnostic-${entry?.provider || entry?.source || entry?.section || index}`,
        name: providerLabel(entry?.provider || entry?.source || entry?.section || "provider"),
        status: tone.label,
        statusColor: tone.color,
        contribution: entry?.reason || "Provider returned a diagnostic signal for this analysis.",
        freshness: entry?.latencyMs !== null && entry?.latencyMs !== undefined ? `${entry.latencyMs} ms latency` : "Freshness unavailable",
        sourceLabel: "meta.providerDiagnostics",
      };
    });
}

function normalizeProviderHealthRows(providerHealth) {
  const normalizedProviderHealth = normalizeProviderHealth(providerHealth);
  return safeArray(normalizedProviderHealth?.providersList)
    .map((entry) => {
      if (!entry) return null;
      const tone = providerHealthDisplayTone(entry);
      const providerName = entry.provider || "provider";
      return {
        key: `health-${providerName}`,
        name: providerName === "anthropic" ? "Decision memo service" : providerLabel(providerName),
        status: tone.label,
        statusColor: tone.color,
        contribution: `Provider availability context: ${tone.statusLabel}${entry?.reason ? ` (${titleCase(entry.reason)})` : ""}. Availability is not thesis evidence quality.`,
        freshness: entry?.latencyMs !== null && entry?.latencyMs !== undefined ? `${entry.latencyMs} ms latency` : "Freshness unavailable",
        sourceLabel: "provider health endpoint",
      };
    })
    .filter(Boolean);
}

function buildProviderRows({ sourceStatus, providerDiagnostics, providerHealth }) {
  const rows = [
    ...normalizeSourceStatusRows(sourceStatus),
    ...normalizeDiagnosticRows(providerDiagnostics),
    ...normalizeProviderHealthRows(providerHealth),
  ];
  const seen = new Set();

  return rows.filter((row) => {
    const key = `${row.name}-${row.sourceLabel}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildProvenanceRows({ officialLinks, whitepaperDocs }) {
  const linkRows = [
    ["Website", officialLinks?.website],
    ["Docs", officialLinks?.docs],
    ["Whitepaper", officialLinks?.whitepaper],
    ["GitHub", officialLinks?.github],
    ["X / Twitter", officialLinks?.twitter],
    ["Explorer", officialLinks?.explorer],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => ({
      key: `official-${label}`,
      label,
      value,
      sourceType: "Official-link field",
      boundary: "Live source reference. Not reviewed manual evidence.",
    }));

  const docsRows = [
    whitepaperDocs?.summary ? {
      key: "docs-summary",
      label: "Docs summary",
      value: whitepaperDocs.summary,
      sourceType: "Docs / whitepaper context",
      boundary: "Live docs context. Not institutional question-level support.",
    } : null,
    whitepaperDocs?.documentationDepth ? {
      key: "docs-depth",
      label: "Documentation depth",
      value: whitepaperDocs.documentationDepth,
      sourceType: "Docs / whitepaper context",
      boundary: "Qualitative docs signal only.",
    } : null,
  ].filter(Boolean);

  return [...linkRows, ...docsRows];
}

function buildLensEvidenceRows(model) {
  const lens = model?.resolvedInstitutionalLens || {};
  return safeArray(lens.providerClassificationEvidence)
    .slice(0, 8)
    .map((entry, index) => ({
      key: `lens-evidence-${index}`,
      label: `${providerLabel(entry.provider)} ${entry.field || "classification field"}`,
      value: entry.value || "Unavailable",
      sourceType: "Provider classification metadata",
      boundary: "Classification evidence only. Not reviewed proof of legal/economic rights, reserves, backing, redemption, or accrual.",
    }));
}

function buildLensSourceBoundaryRows(model) {
  const lens = model?.resolvedInstitutionalLens || {};
  return safeArray(lens.sourceBoundary)
    .slice(0, 6)
    .map((entry, index) => ({
      key: `lens-boundary-${index}`,
      label: "Resolved lens source boundary",
      value: entry,
      sourceType: "Boundary notice",
      boundary: "This boundary defines how provider metadata may be used in the live response.",
    }));
}

function buildCalibrationWarningRows(model) {
  return safeArray(model?.calibrationWarnings)
    .slice(0, 6)
    .map((warning, index) => ({
      key: `calibration-warning-${warning?.id || index}`,
      label: titleCase(String(warning?.id || "diagnostic warning").replace(/_/g, " ")),
      value: warning?.issue || warning?.observedBehavior || warning?.recommendedAction || "Manual review required.",
      sourceType: warning?.affectsScoring ? "Affects scoring" : "Diagnostic warning",
      boundary: `${warning?.affectsVerdict ? "Affects verdict" : "Does not affect verdict"}; ${warning?.sourceBoundary || "source boundary unavailable"}.`,
    }));
}

function buildAssetIdentityRows(model) {
  const identity = model?.assetIdentityResolution || {};
  const contracts = safeArray(identity.allKnownContracts).map((entry, index) => ({
    key: `asset-identity-contract-${index}`,
    label: `Known contract mapping: ${entry.network || "unknown"}`,
    value: entry.contractAddress || "Unavailable",
    sourceType: `${entry.provider || "provider"} identity metadata`,
    boundary: "Provider contract mapping is identity context, not reviewed proof of canonical chain or economic rights.",
  }));
  const warnings = [
    ...safeArray(identity.identityWarnings),
    ...safeArray(identity.chainWarnings),
    ...safeArray(identity.contractWarnings),
  ].map((entry, index) => ({
    key: `asset-identity-warning-${index}`,
    label: "Asset identity warning",
    value: entry,
    sourceType: "Manual review guardrail",
    boundary: "Identity warning does not change scoring by itself.",
  }));
  const summary = identity.canonicalAssetName || identity.representationType ? [{
    key: "asset-identity-summary",
    label: "Selected/analyzed identity",
    value: `${identity.canonicalAssetName || "Asset"} (${identity.canonicalAssetSymbol || "symbol unavailable"}) | canonical network: ${identity.canonicalNetworkCandidate || "unavailable"} | analyzed: ${identity.analyzedNetwork || "unknown"} ${identity.analyzedContract || "no contract"}`,
    sourceType: "Asset identity resolution",
    boundary: "Shows selected representation and canonical-network candidate when connected metadata supports it.",
  }] : [];
  return [...summary, ...contracts, ...warnings];
}

function buildTokenomicsEvidenceRows(model) {
  const tokenomics = model?.tokenomicsSupplyIntegrity || {};
  if (tokenomics.tokenomicsIntegrityScore === undefined && !safeArray(tokenomics.sourceContradictions).length) return [];
  return [
    {
      key: "tokenomics-integrity-summary",
      label: "Tokenomics supply integrity",
      value: `${tokenomics.explanationSummary || "Supply integrity summary unavailable."} Max supply: ${tokenomics.maxSupplyStatus || "unknown"}; unlock coverage: ${tokenomics.unlockScheduleStatus || "unknown"}.`,
      sourceType: "Supply underwriting diagnostic",
      boundary: "Separate supply-integrity context; score integration requires a calibrated release.",
    },
    ...safeArray(tokenomics.sourceContradictions).map((entry, index) => ({
      key: `tokenomics-contradiction-${index}`,
      label: "Supply contradiction",
      value: entry,
      sourceType: "Provider supply contradiction",
      boundary: "Requires source reconciliation before provider supply fields are treated as reliable.",
    })),
    ...safeArray(tokenomics.sourceBoundary).slice(0, 4).map((entry, index) => ({
      key: `tokenomics-boundary-${index}`,
      label: "Tokenomics source boundary",
      value: entry,
      sourceType: "Boundary notice",
      boundary: "Defines source status for tokenomics supply integrity.",
    })),
  ];
}

function buildScoringReadinessEvidenceRows(model) {
  const readiness = model?.scoringReadinessContract || {};
  if (!readiness.artifactVersion) return [];
  return [
    {
      key: "scoring-readiness-summary",
      label: "Institutional scoring readiness",
      value: `${readiness.assetFamilyLabel || "Asset-family schema"} | ${readiness.overallReadinessStatus || "status unavailable"} | source-required dimensions: ${readiness.sourceRequiredDimensionCount ?? "unknown"}.`,
      sourceType: "Scoring-readiness context",
      boundary: readiness.legacyScoreBoundary || "Future evidence-to-scoring architecture only; current score and verdict unchanged.",
    },
    ...safeArray(readiness.sourceMatrixEntries).slice(0, 6).map((entry) => ({
      key: `scoring-readiness-matrix-${entry.dimensionId}`,
      label: `Readiness dimension: ${entry.dimensionId || "dimension"}`,
      value: `Status: ${entry.evidenceStatus || "unknown"}; missing: ${safeArray(entry.missingEvidence).slice(0, 3).join("; ") || "none listed"}.`,
      sourceType: "Evidence-to-scoring bridge",
      boundary: "Required evidence/live metrics explain readiness before score integration.",
    })),
  ];
}

function buildEvidenceStatusAggregationRows(model) {
  const contract = model?.evidenceStatusAggregationContract || {};
  if (!contract.artifactVersion) return [];
  return [
    {
      key: "evidence-status-aggregation-summary",
      label: "Evidence Status Aggregation Contract v1",
      value: contract.assetAggregation?.plainLanguageSummary || "Question-level evidence aggregation is attached.",
      sourceType: "Claim-to-question evidence aggregation",
      boundary: "Aggregates reviewed evidence, provider context, live data requirements, not-applicable redirects, and missing evidence without changing score or verdict.",
    },
    ...safeArray(contract.questionAggregations).slice(0, 8).map((question) => ({
      key: `evidence-status-question-${question.questionId || question.question}`,
      label: cleanPrimaryAnswerText(question.question || question.questionId || "Institutional question"),
      value: `${cleanPrimaryAnswerText(question.plainLanguageStatus || "Needs verification")}: ${cleanPrimaryAnswerText(question.plainLanguageSummary || "Evidence status unavailable.")}`,
      sourceType: "Question evidence status",
      boundary: `Supported claims: ${safeArray(question.supportedClaims).length}; missing: ${safeArray(question.missingClaims).length}; live data: ${safeArray(question.liveDataClaims).length}; not applicable: ${safeArray(question.notApplicableClaims).length}.`,
    })),
  ];
}

function buildReviewedEvidenceRows(model) {
  const packet = model?.reviewedEvidencePacket || {};
  const synthesizedRows = [
    ...safeArray(model?.institutionalQuestions),
    ...safeArray(model?.tokenomicsSupplyIntegrity?.institutionalQuestions),
  ]
    .filter((question) => question?.synthesizedAnswer)
    .slice(0, 6)
    .map((question) => ({
      key: `synthesized-answer-${question.questionId}`,
      label: `Synthesized answer: ${question.questionId}`,
      value: `${cleanPrimaryAnswerText(getAnalystAnswerCard(question).directAnswer || question.synthesizedAnswer.directAnswer || "Direct answer unavailable")} | status: ${cleanPrimaryAnswerText(getAnalystAnswerCard(question).headlineStatus || question.synthesizedAnswer.evidenceStatus || "source_required")} | boundary: ${cleanPrimaryAnswerText(safeArray(getAnalystAnswerCard(question).sourceBoundaryPlainEnglish)[0] || "source boundary unavailable")}`,
      sourceType: "Institutional answer synthesis",
      boundary: "Deterministic display synthesis. It uses mapped provider/review/formula fields and does not affect scoring.",
    }));
  if (!packet.packetLoaded) return synthesizedRows;
  return [
    {
      key: "reviewed-evidence-packet-summary",
      label: "Reviewed Evidence Packet v1",
      value: `${packet.packetId || "packet"} loaded as ${cleanPrimaryAnswerText(packet.reviewStatus || "review status unavailable")}. Reviewed evidence improves answer quality before score integration.`,
      sourceType: "Reviewed evidence",
      boundary: "Question-level source-backed context. Separate from provider metadata and final scoring.",
    },
    ...safeArray(packet.sources).slice(0, 5).map((source, index) => ({
      key: `reviewed-source-${source.sourceId || index}`,
      label: source.title || "Reviewed source",
      value: `${source.publisher || "publisher unavailable"} | ${source.freshnessStatus || "freshness unknown"} | ${source.reliabilityTier || "reliability unknown"} | ${source.url || "URL unavailable"}`,
      sourceType: source.scoringEligible ? "Reviewed evidence - score-eligible flag" : "Reviewed source",
      boundary: source.scoringEligible ? "QA warning: reviewed packets should not be included in the numerical score in v1." : "Reviewed evidence improves answer quality only.",
    })),
    ...safeArray(packet.questionMappings).filter((mapping) => mapping.answerUpgradeAvailable).slice(0, 5).map((mapping) => ({
      key: `reviewed-mapping-${mapping.questionId}`,
      label: `Mapped question: ${mapping.questionId}`,
      value: `${cleanPrimaryAnswerText(mapping.reviewedEvidenceStatus || "Needs verification")}; scope: ${cleanPrimaryAnswerText(mapping.questionEvidenceScope || "unknown")}; remaining gaps: ${safeArray(mapping.remainingMissingEvidence).map(cleanPrimaryAnswerText).join("; ") || "none listed"}; cautions: ${safeArray(mapping.evidenceMappingWarnings).map(cleanPrimaryAnswerText).join("; ") || "none"}`,
      sourceType: "Question-level reviewed evidence",
      boundary: "Answer upgrade context only; no overall scoring or verdict change.",
    })),
    ...safeArray(packet.identityEvidenceReconciliationWarnings).slice(0, 3).map((warning, index) => ({
      key: `reviewed-identity-reconciliation-${index}`,
      label: "Reviewed identity reconciliation",
      value: warning,
      sourceType: "Reviewed evidence / identity guardrail",
      boundary: "Reviewed evidence can refine identity review requirements before score integration.",
    })),
    ...synthesizedRows,
  ];
}

function buildBenchmarkInstitutionalAnswerPackRows(model) {
  const pack = model?.benchmarkInstitutionalAnswerPack || {};
  if (!pack.packId) return [];
  const claimRows = safeArray(pack.questions).flatMap((question) =>
    safeArray(question.claims).map((claim) => ({
      key: `benchmark-pack-claim-${claim.claimId || question.questionId}`,
      label: `Benchmark answer claim: ${question.questionId || "question"}`,
      value: `${cleanPrimaryAnswerText(claim.claim || question.directAnswer || "Claim unavailable")} | status=${cleanPrimaryAnswerText(claim.evidenceStatus || question.answerStatus || "unknown")} | score inclusion=${claim.scoringActive ? "included" : "not included"}`,
      sourceType: "Institutional answer context",
      boundary: `${safeArray(claim.doesNotProve).slice(0, 2).map(cleanPrimaryAnswerText).join("; ") || "Does not change the existing score or final verdict."}`,
    }))
  );
  return [
    {
      key: "benchmark-institutional-answer-pack-summary",
      label: "Institutional answer coverage",
      value: `${pack.expectedLabel || pack.expectedFamily || "Asset-family coverage"} attached for ${pack.assetSymbol || "asset"} with ${safeArray(pack.questions).length} institutional questions.`,
      sourceType: "Institutional answer context",
      boundary: "Answer-quality context; score integration requires a calibrated release.",
    },
    ...claimRows.slice(0, 8),
  ];
}

function buildEngineLearningEvidenceRows(model) {
  const backbone = model?.engineLearningBackbone || {};
  if (!backbone.artifactVersion) return [];
  const feedbackLoop = backbone.engineLearningFeedbackLoop || {};
  return [
    {
      key: "engine-learning-backbone-summary",
      label: "Engine Learning Backbone v1",
      value: `${backbone.findings?.length || 0} findings, ${backbone.assetClassRulesApplied?.length || 0} rules, ${backbone.outputQaChecks?.length || 0} output QA checks. Methodology context only.`,
      sourceType: "Methodology memory",
      boundary: "Institutional memory for review workflow. Candidate sources require review before evidence use.",
    },
    ...safeArray(backbone.sourceCandidates).slice(0, 4).map((candidate, index) => ({
      key: `engine-learning-source-candidate-${candidate.candidateId || index}`,
      label: "Source candidate",
      value: `${cleanPrimaryAnswerText(candidate.sourceCandidateTitle || candidate.candidateId || "Candidate")} | review status: ${candidate.promotedToReviewedEvidence ? "accepted as reviewed evidence" : "awaiting review"} | score inclusion: ${candidate.scoringActive ? "included" : "not included"}`,
      sourceType: "Source candidate queue",
      boundary: "Candidate only; requires manual review before evidence use.",
    })),
    ...safeArray(backbone.outputQaChecks).slice(0, 4).map((check, index) => ({
      key: `engine-learning-output-qa-${check.id || index}`,
      label: "Output QA check",
      value: `${check.status || "status"} | ${check.description || check.id || "QA check"}${check.remediation ? ` | ${check.remediation}` : ""}`,
      sourceType: "Output QA diagnostic",
      boundary: "QA visibility only; does not alter verdict/scoring.",
    })),
    ...(feedbackLoop.artifactVersion ? [{
      key: "engine-learning-feedback-loop-summary",
      label: "Engine Learning Feedback Loop",
      value: `${safeArray(feedbackLoop.seedManualFindings).length} manual QA seed findings, ${safeArray(feedbackLoop.autoGeneratedFindings).length} runtime auto findings, ${safeArray(feedbackLoop.candidateRulesGenerated).length} inactive rule candidates.`,
      sourceType: "Diagnostic learning feedback",
      boundary: "Runtime/manual findings are review context. Candidate rules require calibration before score integration.",
    }] : []),
    ...safeArray(feedbackLoop.autoGeneratedFindings).slice(0, 4).map((finding) => ({
      key: `engine-learning-feedback-auto-${finding.findingId}`,
      label: "Runtime auto finding",
      value: `${finding.title || finding.findingType || "Finding"} | ${finding.expectedBehavior || finding.summary || "review required"}`,
      sourceType: "Runtime QA detector",
      boundary: "Detector output is not evidence and does not change verdict/scoring.",
    })),
  ];
}

function buildRawDataCoverageRows(model) {
  const expansion = model?.providerRawDataExpansion || {};
  const diagnostics = model?.rawDataCoverageDiagnostics || expansion.rawDataCoverageDiagnostics || {};
  if (!expansion.artifactVersion && diagnostics.overallRawDataCoverageScore === undefined) return [];
  return [
    {
      key: "raw-data-coverage-summary",
      label: "Provider raw-data coverage",
      value: `Overall coverage ${diagnostics.overallRawDataCoverageScore ?? "n/a"}/100; category coverage ${expansion.categoryDataCoverage || "unknown"}; peer assets ${expansion.categoryPeerMarketStats?.peerCount ?? 0}.`,
      sourceType: "Provider category/raw-data context",
      boundary: "Provider-reported context only; source review is required for stronger claims.",
    },
    ...safeArray(expansion.providerCategoryEndpointDiagnostics).slice(0, 6).map((entry, index) => ({
      key: `provider-category-endpoint-${entry.provider}-${index}`,
      label: `${providerLabel(entry.provider)} category endpoint`,
      value: `${entry.endpoint || "endpoint"} | ${entry.status || "unknown"} | coverage=${entry.coverage || "unknown"} | mapped=${entry.mappingSucceeded ? "yes" : "no"}${entry.failureReason ? ` | ${entry.failureReason}` : ""}`,
      sourceType: "Provider endpoint diagnostic",
      boundary: cleanPrimaryAnswerText(entry.sourceBoundary || "Endpoint context only; source review required."),
    })),
    ...safeArray(expansion.categoryDataSourceRequirements).slice(0, 6).map((entry, index) => ({
      key: `raw-data-source-requirement-${index}`,
      label: "Raw data source requirement",
      value: entry,
      sourceType: "Missing raw provider field",
      boundary: "Missing provider data is a source requirement, not negative evidence.",
    })),
  ];
}

function EvidenceSignalRow({ item, styles }) {
  const display = normalizeEvidenceProxyDisplayLabel(item);
  const color = display.tone || "#aab7cc";

  return (
    <div style={styles.evidenceSignalCard}>
      <div style={styles.timelineTitleRow}>
        <strong style={{ color: "#f4f7ff" }}>{item.label}</strong>
        {statusChip(styles, display.statusLabel, color)}
      </div>
      <div style={styles.timelineSummary}>{display.meaning}</div>
      <div style={styles.timelineMeta}>
        {display.signalType} - {item.sourceLabel || "current live response"} - {display.boundaryLabel}
      </div>
    </div>
  );
}

function LifecycleLane({ title, description, styles }) {
  return (
    <div style={styles.evidenceLifecycleLane}>
      <div style={styles.metaLabel}>{title}</div>
      <div style={styles.contextMuted}>{description}</div>
    </div>
  );
}

export default function EvidenceMapTab({
  model,
  evidenceStatusProxy,
  analysisQualityExplanation,
  confidence,
  meta,
  sourceStatus,
  providerDiagnostics,
  notableDiagnostics,
  providerHealth,
  providerHealthLoading,
  providerHealthError,
  officialLinks,
  whitepaperDocs,
  styles,
}) {
  const providerRows = buildProviderRows({ sourceStatus, providerDiagnostics, providerHealth });
  const provenanceRows = buildProvenanceRows({ officialLinks, whitepaperDocs });
  const lensEvidenceRows = buildLensEvidenceRows(model);
  const lensBoundaryRows = buildLensSourceBoundaryRows(model);
  const calibrationWarningRows = buildCalibrationWarningRows(model);
  const assetIdentityRows = buildAssetIdentityRows(model);
  const tokenomicsEvidenceRows = buildTokenomicsEvidenceRows(model);
  const evidenceStatusAggregationRows = buildEvidenceStatusAggregationRows(model);
  const scoringReadinessEvidenceRows = buildScoringReadinessEvidenceRows(model);
  const reviewedEvidenceRows = buildReviewedEvidenceRows(model);
  const benchmarkPackEvidenceRows = buildBenchmarkInstitutionalAnswerPackRows(model);
  const engineLearningEvidenceRows = buildEngineLearningEvidenceRows(model);
  const rawDataCoverageRows = buildRawDataCoverageRows(model);
  const lensBoundaryDisplayRows = [
    ...evidenceStatusAggregationRows,
    ...rawDataCoverageRows,
    ...engineLearningEvidenceRows,
    ...benchmarkPackEvidenceRows,
    ...reviewedEvidenceRows,
    ...assetIdentityRows,
    ...scoringReadinessEvidenceRows,
    ...tokenomicsEvidenceRows,
    ...lensEvidenceRows,
    ...lensBoundaryRows,
    ...calibrationWarningRows,
  ];
  const freshness = model?.analysisFreshness || {};
  const providerNotes = normalizeRenderableList(meta?.providerNotes).slice(0, 4);
  const coverageSignals = safeArray(evidenceStatusProxy?.items);
  const firstCoverageSignal = coverageSignals[0] ? normalizeEvidenceProxyDisplayLabel(coverageSignals[0]) : null;
  const aggregationSummary = model?.evidenceStatusAggregationContract?.assetAggregation?.plainLanguageSummary || null;
  const coverageGate = model?.coverageScoreEligibilityContract || {};
  const canonicalRoute = model?.familyCanonicalRoutingContract || {};
  const provenance = model?.evidenceProvenanceSemanticsContract || {};
  const firstProviderMetadata = lensEvidenceRows[0]?.value || "Provider classification metadata is unavailable or not attached.";
  const firstContradiction = calibrationWarningRows[0]?.value || tokenomicsEvidenceRows.find((row) => /contradiction/i.test(row.label))?.value;

  return (
    <div style={styles.evidenceMapShell}>
      <ExecutiveSummaryCard
        eyebrow="Evidence Map / Source Trace"
        title="What evidence is actually attached?"
        answer="This tab separates reviewed evidence, provider metadata, source candidates, diagnostics, and missing/stale sections. Missing provider data is a verification gap, not negative evidence."
        tone="#7dd3fc"
        badges={[
          { label: evidenceStatusProxy?.label || "Live evidence proxy", tone: "#7dd3fc" },
          { label: freshness.freshnessLabel || "Freshness unknown", tone: freshness.isFreshLive ? "#a6f3c2" : "#f9d976" },
          { label: freshness.qaEligibilityLabel || "QA freshness unknown", tone: freshness.freshQaEligible ? "#a6f3c2" : "#f9d976" },
          { label: "Source boundaries preserved", tone: "#d5dcec" },
        ]}
        styles={styles}
      >
        <div style={styles.evidenceMapBoundaryStrip}>
          {boundaryChip(styles, "This view maps live provider/source context from the current analysis response. It is not the full institutional evidence map.")}
          {boundaryChip(styles, "Report-only overlays are not connected to live scoring.")}
          {boundaryChip(styles, "Source candidates require review before becoming evidence.")}
          {boundaryChip(styles, `${freshness.freshnessLabel || "Freshness unknown"}: stale or missing sections require review, not negative inference.`)}
          {boundaryChip(styles, freshness.qaEligibilityWarning || "Run fresh analysis before current QA if freshness is ambiguous.")}
        </div>
        <SectionRow
          label="Read this as"
          value="A source-trace view of live response context, provider availability, and qualitative evidence signals. It does not show institutional question counts or manual-source overlay status."
          styles={styles}
        />
        <SectionRow
          label="Freshness boundary"
          value={freshness.qaEligibilityWarning || freshness.summary || "Freshness unknown. Missing provider sections are not proof of negative evidence; verify before relying on section-level conclusions."}
          styles={styles}
        />
      </ExecutiveSummaryCard>

      <div style={styles.advancedGrid}>
        <QuestionPromptCard
          question="How should evidence provenance be read?"
          answer={provenance.assetSummary?.summaryLabel || "Evidence provenance semantics were not attached."}
          status={safeArray(provenance.primaryLabels)[0] || "Provenance unavailable"}
          impact={provenance.assetSummary?.scoringActivationReadiness || "Scoring boundary unavailable"}
          sourceState="Provenance semantics"
          styles={styles}
        />
        <QuestionPromptCard
          question="Which source matrix applies?"
          answer={canonicalRoute.canonicalSourceProfile
            ? `${canonicalRoute.canonicalSourceProfile}; matrix: ${safeArray(canonicalRoute.canonicalSourceMatrixEntries).join(", ") || "unavailable"}.`
            : "Canonical family source matrix was not attached."}
          status={canonicalRoute.canonicalQuestionGroup || "Route unavailable"}
          impact="Source routing"
          sourceState="Family canonical route"
          styles={styles}
        />
        <QuestionPromptCard
          question="Which claims are source-backed?"
          answer={aggregationSummary || firstCoverageSignal?.meaning || "No live evidence-status proxy signals were attached."}
          status={model?.evidenceStatusAggregationContract?.assetAggregation?.primaryEvidenceStatus ? titleCase(model.evidenceStatusAggregationContract.assetAggregation.primaryEvidenceStatus) : firstCoverageSignal?.statusLabel || "Unknown"}
          impact="Evidence support"
          sourceState={model?.evidenceStatusAggregationContract ? "Evidence aggregation" : "Live response"}
          styles={styles}
        />
        <QuestionPromptCard
          question="Which fields are provider metadata only?"
          answer={firstProviderMetadata}
          status="Provider metadata only"
          impact="Boundary"
          sourceState="Not reviewed evidence"
          styles={styles}
        />
        <QuestionPromptCard
          question="Where are contradictions or warnings?"
          answer={firstContradiction || "No contradiction or calibration warning was attached to the display model."}
          status={firstContradiction ? "Review required" : "None attached"}
          impact="Manual review"
          sourceState="Diagnostic"
          styles={styles}
        />
        <QuestionPromptCard
          question="What evidence is stale or missing?"
          answer={safeArray(freshness.missingSections)[0] || safeArray(freshness.staleSections)[0] || "No stale/missing section was attached to the display model."}
          status={freshness.isFreshLive ? "Fresh/live" : "Verify freshness"}
          impact="Freshness"
          sourceState="Section status"
          styles={styles}
        />
        <QuestionPromptCard
          question="What coverage level is allowed?"
          answer={coverageGate.primaryUserMessage || "Coverage Tier + Score Eligibility Gate was not attached."}
          status={coverageGate.coverageTierLabel || "Coverage unavailable"}
          impact={coverageGate.scoreEligibility || "Score eligibility unavailable"}
          sourceState={coverageGate.analysisDepthLabel || "Analysis depth unavailable"}
          styles={styles}
        />
      </div>

      <div style={styles.advancedGrid}>
        <Card title="Provider Classification Evidence" subtitle="Lens routing metadata. Not reviewed proof." styles={styles}>
          {lensBoundaryDisplayRows.length ? lensBoundaryDisplayRows.map((row) => (
            <div key={row.key} style={styles.evidenceProvenanceRow}>
              <div style={styles.timelineTitleRow}>
                <strong style={{ color: "#f4f7ff" }}>{row.label}</strong>
                {statusChip(styles, row.sourceType, "#7dd3fc")}
              </div>
              <div style={styles.timelineSummary}>{row.value}</div>
              <div style={styles.timelineMeta}>{row.boundary}</div>
            </div>
          )) : (
            <p style={styles.timelineEmptyText}>No provider classification evidence, source-boundary entries, or calibration warnings were attached to the display model.</p>
          )}
        </Card>

        <Card title="Live Provider Evidence" subtitle="Provider/source rows returned by the current response only." styles={styles}>
          {providerRows.length ? providerRows.slice(0, 8).map((row) => (
            <div key={row.key} style={styles.evidenceProviderRow}>
              <div>
                <div style={styles.timelineTitleRow}>
                  <strong style={{ color: "#f4f7ff" }}>{row.name}</strong>
                  {statusChip(styles, row.status, row.statusColor)}
                </div>
                <div style={styles.timelineSummary}>{row.contribution}</div>
                <div style={styles.timelineMeta}>{row.sourceLabel} - {row.freshness} - boundary: live provider context</div>
              </div>
            </div>
          )) : (
            <p style={styles.timelineEmptyText}>Live provider/source rows are not attached to this response yet.</p>
          )}
          <ListBlock
            title="Provider notes"
            items={providerNotes}
            emptyText="No provider notes were recorded for this analysis."
            color="#9bd7ff"
            styles={styles}
          />
        </Card>

        <Card title="Evidence Coverage Signals" subtitle="Qualitative live response signals - not institutional question counts." styles={styles}>
          <div style={styles.evidenceSignalGrid}>
            {coverageSignals.length ? coverageSignals.map((item) => (
              <EvidenceSignalRow key={item.key} item={item} styles={styles} />
            )) : (
              <p style={styles.timelineEmptyText}>No live evidence-status proxy signals were attached to this response.</p>
            )}
          </div>
          <ListBlock
            title="Unavailable in live response"
            items={evidenceStatusProxy?.unavailable || []}
            emptyText="No unavailable evidence lifecycle sections were listed."
            color="#8a94a6"
            styles={styles}
          />
        </Card>
      </div>

      <div style={styles.advancedGrid}>
        <Card title="Source Trace / Provenance" subtitle="References attached to the live response, if present." styles={styles}>
          {provenanceRows.length ? provenanceRows.map((row) => (
            <div key={row.key} style={styles.evidenceProvenanceRow}>
              <div style={styles.timelineTitleRow}>
                <strong style={{ color: "#f4f7ff" }}>{row.label}</strong>
                {statusChip(styles, row.sourceType, "#7dd3fc")}
              </div>
              <div style={styles.timelineSummary}>{row.value}</div>
              <div style={styles.timelineMeta}>{row.boundary}</div>
            </div>
          )) : (
            <p style={styles.timelineEmptyText}>Detailed source trace is not attached to this live response yet.</p>
          )}
        </Card>

        <Card title="Report-Only Evidence Lifecycle Boundary" subtitle="Educational lane only. These are not live counts." styles={styles}>
          <div style={styles.evidenceLifecycleGrid}>
            <LifecycleLane title="Source Candidate" description="Candidate only. Requires review before becoming evidence." styles={styles} />
            <LifecycleLane title="Manual Intake" description="Human/manual gate. Accepted for report does not mean production truth." styles={styles} />
            <LifecycleLane title="ManualSourceEvidenceItem" description="Report object only. Still cannot affect scoring." styles={styles} />
            <LifecycleLane title="Report-Only Overlay" description="Context for reports. Not attached to live scoring unless a future endpoint explicitly says so." styles={styles} />
          </div>
        </Card>
      </div>

      <div style={styles.evidenceDetailsStack}>
        <AuditGroup title="Live Provider Context" subtitle="Existing live evidence and source-context panels, grouped under source trace." styles={styles}>
          <EvidenceConfidenceCard model={model} styles={styles} />
          <ResearchContextPanel
            analysisQualityExplanation={analysisQualityExplanation}
            confidence={confidence}
            meta={meta}
            sourceStatus={sourceStatus}
            notableDiagnostics={notableDiagnostics}
            providerHealth={providerHealth}
            providerHealthLoading={providerHealthLoading}
            providerHealthError={providerHealthError}
            styles={styles}
          />
        </AuditGroup>

        <AuditGroup title="Source Trace Details" subtitle="Official-link and docs context attached to the live response." styles={styles}>
          <SourcesPanel
            officialLinks={officialLinks}
            whitepaperDocs={whitepaperDocs}
            sourceStatus={sourceStatus}
            providerDiagnostics={providerDiagnostics}
            providerHealth={providerHealth}
            freshnessEntry={meta?.sectionFreshness?.officialLinksDocs}
            styles={styles}
          />
        </AuditGroup>

        <AuditGroup title="Diagnostics / Audit Details" subtitle="Technical provider visibility. Not every raw detail affects the final decision." styles={styles}>
          <div style={styles.advancedGrid}>
            <ProviderDiagnosticsPanel notableDiagnostics={notableDiagnostics} styles={styles} />
            <ProviderHealthPanel
              providerHealth={providerHealth}
              providerHealthLoading={providerHealthLoading}
              providerHealthError={providerHealthError}
              styles={styles}
            />
          </div>
        </AuditGroup>
      </div>
    </div>
  );
}

function AuditGroup({ title, subtitle, children, styles }) {
  return (
    <section style={styles.evidenceAuditGroup}>
      <div style={styles.evidenceAuditHeader}>
        <div>
          <div style={styles.metaLabel}>{title}</div>
          <div style={styles.contextMuted}>{subtitle}</div>
        </div>
      </div>
      {children}
    </section>
  );
}
