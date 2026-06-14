import React from "react";
import EvidenceConfidenceCard from "./EvidenceConfidenceCard";
import ScoreContributorsPanel from "./ScoreContributorsPanel";
import { Card, ExecutiveSummaryCard, ListBlock, QuestionPromptCard, SectionRow } from "./researchPrimitives";
import { TokenomicsSupplyIntegrityCard } from "./TokenomicsSupplyIntegrityCard";
import {
  extractRenderableText,
  formatScoreValue,
  normalizeRenderableList,
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
    safeScores.overallScore,
    safeModel.overallScore,
  );
  const structuralIsProxy = !hasAttachedValue(safeScores.structuralQuality) && !hasAttachedValue(safeScores.structuralQualityScore);
  const tokenomicsSupplyIntegrity = safeObject(safeModel.tokenomicsSupplyIntegrity);
  const scoringReadinessContract = safeObject(safeModel.scoringReadinessContract);
  const rawDataCoverageDiagnostics = safeObject(safeModel.rawDataCoverageDiagnostics || safeModel.providerRawDataExpansion?.rawDataCoverageDiagnostics);

  return [
    {
      title: "Overall Score",
      value: readableValue(firstAttached(safeScores.overallScore, safeModel.overallScore)),
      source: "analysis.scores.overallScore",
      rule: "Live aggregate output. Score is secondary to decision and thesis context.",
      live: "Yes",
      reportOnly: "No",
      caveat: "Does not replace analyst verification.",
      attached: hasAttachedValue(firstAttached(safeScores.overallScore, safeModel.overallScore)),
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
      source: hasAttachedValue(tokenomicsSupplyIntegrity) ? "tokenomicsSupplyIntegrity.tokenomicsIntegrityScore" : "Not attached",
      rule: "Separate supply-integrity underwriting signal for dilution, unlocks, supply authority, and provider contradictions.",
      live: "Diagnostic only in v1",
      reportOnly: "No, surfaced in live response but not integrated into current overall score",
      caveat: "Does not change the existing overall score or verdict in this release.",
      attached: hasAttachedValue(tokenomicsSupplyIntegrity),
    },
    {
      title: "Institutional Scoring Readiness",
      value: readableValue(scoringReadinessContract.overallReadinessStatus),
      source: hasAttachedValue(scoringReadinessContract) ? "scoringReadinessContract.overallReadinessStatus" : "Not attached",
      rule: "Evidence-to-scoring architecture for future calibrated scoring. It maps required evidence, live metrics, caps, and blockers without changing the current score.",
      live: "Diagnostic only in v1",
      reportOnly: "No, surfaced in live response but not integrated into current overall score",
      caveat: "Existing overall score and verdict remain unchanged.",
      attached: hasAttachedValue(scoringReadinessContract),
    },
    {
      title: "Raw Data Coverage",
      value: readableValue(rawDataCoverageDiagnostics.overallRawDataCoverageScore),
      source: hasAttachedValue(rawDataCoverageDiagnostics) ? "rawDataCoverageDiagnostics.overallRawDataCoverageScore" : "Not attached",
      rule: "Diagnostic provider/category/raw-data coverage score. It surfaces missing fields and source requirements only.",
      live: "Diagnostic only in v1",
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
      caveat: "Directness does not mean report-only evidence is scoring-active.",
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
      caveat: "Report-only overlays are not live verdict inputs.",
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
        <SectionRow label="Report-only" value={module.reportOnly} styles={styles} />
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
    <Card title="Diagnostic Warnings / Scoring Boundary" subtitle="Warnings can guide review without becoming evidence." styles={styles}>
      <div style={styles.scoringBoundaryStrip}>
        {boundaryChip(styles, "Diagnostic warning")}
        {boundaryChip(styles, "Source requirement, not evidence")}
        {boundaryChip(styles, "Affects verdict/scoring only when explicitly marked")}
      </div>
      <div style={styles.scoringModuleGrid}>
        {items.slice(0, 6).map((warning, index) => (
          <div key={`${warning.id || "warning"}-${index}`} style={styles.scoringModuleCard}>
            <div style={styles.scoringModuleTopline}>
              <div>
                <div style={styles.metaLabel}>{titleCase(String(warning.id || "diagnostic warning").replace(/_/g, " "))}</div>
                <div style={styles.scoreContributorSummary}>{warning.issue || warning.expectedBehavior || "Manual review required."}</div>
              </div>
              {chip(styles, warning.affectsScoring ? "Affects scoring" : "Diagnostic only", warning.affectsScoring ? "#ff6b6b" : "#ffb020")}
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
      subtitle="Future evidence-to-scoring architecture. Diagnostic only; current overall score and verdict are unchanged."
      styles={styles}
    >
      <div style={styles.scoringBoundaryStrip}>
        {boundaryChip(styles, "Diagnostic only")}
        {boundaryChip(styles, "Legacy score unchanged")}
        {boundaryChip(styles, "Reviewed evidence not scoring-active")}
        {boundaryChip(styles, "Source candidates not promoted")}
      </div>
      <div style={styles.scoringModuleGrid}>
        <ModuleCard
          module={{
            title: "Asset-family readiness",
            value: titleCase(contract.overallReadinessStatus || "Unavailable"),
            source: "scoringReadinessContract",
            rule: contract.committeeMemoPreview?.readinessSummary || `${contract.assetFamilyLabel || "Asset family"} readiness model.`,
            live: "Diagnostic only in v1",
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
            live: "Diagnostic only in v1",
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

  return (
    <div style={styles.scoringTransparencyShell}>
      <ExecutiveSummaryCard
        eyebrow="Scoring Transparency"
        title="Why does the score look like this?"
        answer="This view separates live scoring-active fields from diagnostics, report-only context, and source candidates. It explains boundaries before raw modules."
        tone="#7dd3fc"
        badges={[
          { label: `Overall: ${overallModule?.value || "Unavailable"}`, tone: "#7dd3fc" },
          { label: capsAndGates.length ? `${capsAndGates.length} cap/gate signals` : "No cap table attached", tone: capsAndGates.length ? "#f9d976" : "#d5dcec" },
          { label: "Report-only not scoring", tone: "#d5dcec" },
        ]}
        styles={styles}
      >
        <div style={styles.scoringBoundaryStrip}>
          {boundaryChip(styles, "Only the live scoring layer affects the current decision.")}
          {boundaryChip(styles, "Report-only evidence is context only.")}
          {boundaryChip(styles, "Source candidates require review and cannot affect scoring.")}
          {boundaryChip(styles, "Manual review is workflow, not automatic proof of failure.")}
          {boundaryChip(styles, "Proxy-derived values are not explicit backend scoring modules.")}
        </div>
        <SectionRow
          label="Boundary"
          value="Report-only evidence, source candidates, and manual-review workflow items are not scoring inputs unless explicitly integrated in a future calibrated release."
          styles={styles}
        />
      </ExecutiveSummaryCard>

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
          question="Which signals are diagnostic-only?"
          answer={scoringReadinessModule?.rule || tokenomicsModule?.rule || "Diagnostic-only module context was not attached."}
          status="Diagnostic only"
          impact="Not overall scoring"
          sourceState={scoringReadinessModule?.source || tokenomicsModule?.source || "Not attached"}
          styles={styles}
        />
      </div>

      <CalibrationWarningTransparency warnings={model?.calibrationWarnings} styles={styles} />

      <ScoringReadinessTransparency readiness={model?.scoringReadinessContract} styles={styles} />

      <TokenomicsSupplyIntegrityCard tokenomics={model?.tokenomicsSupplyIntegrity} styles={styles} compact />

      <div style={styles.scoringLayerGrid}>
        <LayerCard
          title="Live Scoring Layer"
          badge="Scoring-active"
          color="#2fd67b"
          description="Uses scoring modules and decision-layer fields attached to the current live analysis response."
          status="Affects current decision."
          styles={styles}
        />
        <LayerCard
          title="Report-Only Evidence Layer"
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
          description="Source candidates require review before becoming report evidence."
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
