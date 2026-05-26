import React from "react";
import EvidenceConfidenceCard from "./EvidenceConfidenceCard";
import ScoreContributorsPanel from "./ScoreContributorsPanel";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
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

  return (
    <div style={styles.scoringTransparencyShell}>
      <Card title="Scoring Transparency" subtitle="Live Scoring Layer" styles={styles}>
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
      </Card>

      <CalibrationWarningTransparency warnings={model?.calibrationWarnings} styles={styles} />

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
