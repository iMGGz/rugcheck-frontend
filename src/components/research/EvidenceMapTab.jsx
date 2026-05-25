import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import EvidenceConfidenceCard from "./EvidenceConfidenceCard";
import ProviderDiagnosticsPanel from "./ProviderDiagnosticsPanel";
import ProviderHealthPanel from "./ProviderHealthPanel";
import ResearchContextPanel from "./ResearchContextPanel";
import SourcesPanel from "./SourcesPanel";
import {
  diagnosticTone,
  extractRenderableText,
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
        contribution: `Provider availability diagnostic: ${tone.statusLabel}${entry?.reason ? ` (${titleCase(entry.reason)})` : ""}. Provider availability is diagnostic context, not thesis evidence quality.`,
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
  const lensBoundaryDisplayRows = [
    ...assetIdentityRows,
    ...lensEvidenceRows,
    ...lensBoundaryRows,
    ...calibrationWarningRows,
  ];
  const freshness = model?.analysisFreshness || {};
  const providerNotes = normalizeRenderableList(meta?.providerNotes).slice(0, 4);
  const coverageSignals = safeArray(evidenceStatusProxy?.items);

  return (
    <div style={styles.evidenceMapShell}>
      <Card
        title="Evidence Map / Source Trace"
        subtitle="Live Response Layer"
        styles={styles}
      >
        <div style={styles.evidenceMapBoundaryStrip}>
          {boundaryChip(styles, "This view maps live provider/source context from the current analysis response. It is not the full institutional evidence map.")}
          {boundaryChip(styles, "Report-only overlays are not connected to live scoring.")}
          {boundaryChip(styles, "Source candidates require review before becoming evidence.")}
          {boundaryChip(styles, `${freshness.freshnessLabel || "Freshness unknown"}: stale or missing sections require review, not negative inference.`)}
        </div>
        <SectionRow
          label="Read this as"
          value="A source-trace view of live response context, provider availability, and qualitative evidence signals. It does not show institutional question counts or manual-source overlay status."
          styles={styles}
        />
        <SectionRow
          label="Freshness boundary"
          value={freshness.summary || "Freshness unknown. Missing provider sections are not proof of negative evidence; verify before relying on section-level conclusions."}
          styles={styles}
        />
      </Card>

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
