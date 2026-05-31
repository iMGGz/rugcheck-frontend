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

function buildTokenomicsEvidenceRows(model) {
  const tokenomics = model?.tokenomicsSupplyIntegrity || {};
  if (tokenomics.tokenomicsIntegrityScore === undefined && !safeArray(tokenomics.sourceContradictions).length) return [];
  return [
    {
      key: "tokenomics-integrity-summary",
      label: "Tokenomics supply integrity",
      value: `${tokenomics.explanationSummary || "Supply integrity summary unavailable."} Max supply: ${tokenomics.maxSupplyStatus || "unknown"}; unlock coverage: ${tokenomics.unlockScheduleStatus || "unknown"}.`,
      sourceType: "Supply underwriting diagnostic",
      boundary: "Separate source-boundary-aware diagnostic; it does not change the live overall score.",
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

function buildReviewedEvidenceRows(model) {
  const packet = model?.reviewedEvidencePacket || {};
  if (!packet.packetLoaded) return [];
  return [
    {
      key: "reviewed-evidence-packet-summary",
      label: "Reviewed Evidence Packet v1",
      value: `${packet.packetId || "packet"} loaded as ${packet.reviewStatus || "review status unavailable"}. Reviewed demo evidence is not scoring-active in v1.`,
      sourceType: "Reviewed demo evidence",
      boundary: "Question-level source-backed context. Separate from provider metadata and final scoring.",
    },
    ...safeArray(packet.sources).slice(0, 5).map((source, index) => ({
      key: `reviewed-source-${source.sourceId || index}`,
      label: source.title || "Reviewed source",
      value: `${source.publisher || "publisher unavailable"} | ${source.freshnessStatus || "freshness unknown"} | ${source.reliabilityTier || "reliability unknown"} | ${source.url || "URL unavailable"}`,
      sourceType: source.scoringEligible ? "Reviewed evidence - scoring eligible flag" : "Reviewed demo source",
      boundary: source.scoringEligible ? "QA warning: v1 should not treat reviewed demo packets as scoring-active." : "Reviewed demo evidence improves answer quality only.",
    })),
    ...safeArray(packet.questionMappings).filter((mapping) => mapping.answerUpgradeAvailable).slice(0, 5).map((mapping) => ({
      key: `reviewed-mapping-${mapping.questionId}`,
      label: `Mapped question: ${mapping.questionId}`,
      value: `${mapping.reviewedEvidenceStatus}; remaining gaps: ${safeArray(mapping.remainingMissingEvidence).join("; ") || "none listed"}`,
      sourceType: "Question-level reviewed evidence",
      boundary: "Answer upgrade context only; no overall scoring or verdict change.",
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
  const reviewedEvidenceRows = buildReviewedEvidenceRows(model);
  const lensBoundaryDisplayRows = [
    ...reviewedEvidenceRows,
    ...assetIdentityRows,
    ...tokenomicsEvidenceRows,
    ...lensEvidenceRows,
    ...lensBoundaryRows,
    ...calibrationWarningRows,
  ];
  const freshness = model?.analysisFreshness || {};
  const providerNotes = normalizeRenderableList(meta?.providerNotes).slice(0, 4);
  const coverageSignals = safeArray(evidenceStatusProxy?.items);
  const firstCoverageSignal = coverageSignals[0] ? normalizeEvidenceProxyDisplayLabel(coverageSignals[0]) : null;
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
          { label: "Source boundaries preserved", tone: "#d5dcec" },
        ]}
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
      </ExecutiveSummaryCard>

      <div style={styles.advancedGrid}>
        <QuestionPromptCard
          question="Which claims are source-backed?"
          answer={firstCoverageSignal?.meaning || "No live evidence-status proxy signals were attached."}
          status={firstCoverageSignal?.statusLabel || "Unknown"}
          impact="Evidence support"
          sourceState="Live response"
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
