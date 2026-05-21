import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import {
  normalizeRenderableList,
  providerLabel,
  safeArray,
  safeObject,
  titleCase,
} from "./researchUtils";

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

  const combined = [
    ...manual,
    ...conflicts,
    ...missing,
    ...required,
    ...alerts,
    ...providerReviewSignals(providerDiagnostics),
    ...sourceStatusReviewSignals(sourceStatus),
    ...proxySignals,
  ];
  const seen = new Set();

  return combined.filter((entry) => {
    const key = `${entry.label}-${entry.description}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
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
    "Check claim scope and mapped evidence domain before any report-only use.",
    "Check contradiction risk and whether evidence is scoring-active or report-only.",
  ].slice(0, 6);
}

function CalibrationWarningsCard({ warnings, styles }) {
  const items = safeArray(warnings);
  if (!items.length) return null;

  return (
    <Card title="Calibration Warnings" subtitle="Diagnostic guardrails, not final verdicts." styles={styles}>
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
              {warning.affectsVerdict ? "May affect verdict semantics" : "Diagnostic only"} - {warning.sourceBoundary || "source boundary unavailable"}
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
  const signals = buildLiveReviewSignals({ model, sourceStatus, providerDiagnostics, evidenceStatusProxy });
  const verifyItems = analystVerificationItems(model);
  const outcomes = [
    ["requires_review", "Needs human review before use."],
    ["accepted_for_report", "Report-only acceptance. Does not mean production truth or scoring support."],
    ["stale", "Requires refresh before use."],
    ["rejected", "Blocked due to provenance, quality, scope, or safety."],
    ["duplicate", "Cannot count as independent support."],
    ["low_relevance", "Too indirect or weak for evidence use."],
    ["contradiction_review", "Blocked until conflict is resolved."],
  ];

  return (
    <div style={styles.sourceQueueShell}>
      <Card title="Manual Review Queue" subtitle="Workflow Layer" styles={styles}>
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, "Manual review is a workflow signal, not automatic proof of failure.")}
          {boundaryChip(styles, "Critical gaps may cap confidence until reviewed.")}
          {boundaryChip(styles, "Manual-source overlays are report-only unless explicitly integrated later.")}
        </div>
        <SectionRow
          label="Live review proxy"
          value={model?.manualReviewStatus?.label || "Unavailable"}
          styles={styles}
        />
        <SectionRow
          label="Reason"
          value={model?.manualReviewStatus?.detail || "Manual review queue is not attached to live response yet."}
          styles={styles}
        />
      </Card>

      <CalibrationWarningsCard warnings={calibrationWarnings || model?.calibrationWarnings} styles={styles} />

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

      <Card title="What An Analyst Should Verify" subtitle="Manual review checks before any report-only evidence use." styles={styles}>
        <ListBlock
          title="Verification checklist"
          items={verifyItems}
          emptyText="No verification guidance was available."
          color="#9bd7ff"
          styles={styles}
        />
        <SectionRow
          label="Scoring boundary"
          value="Manual-source review and report-only overlays cannot affect live scoring or verdict behavior unless a future integration explicitly approves it."
          styles={styles}
        />
      </Card>
    </div>
  );
}
