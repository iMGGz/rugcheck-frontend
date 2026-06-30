import React from "react";
import { cleanPrimaryAnswerText, formatDateTime, normalizeEvidenceProxyDisplayLabel, safeArray } from "./researchUtils";

function RailBadge({ children, tone = "#7dd3fc", styles }) {
  return (
    <span
      style={{
        ...styles.railBadge,
        color: tone,
        borderColor: `${tone}55`,
        background: `${tone}14`,
      }}
    >
      {children}
    </span>
  );
}

function RailSection({ title, badge, children, styles }) {
  return (
    <div style={styles.railSection}>
      <div style={styles.railSectionHeader}>
        <div style={styles.railSectionTitle}>{title}</div>
        {badge ? <RailBadge styles={styles}>{badge}</RailBadge> : null}
      </div>
      {children}
    </div>
  );
}

function RailTextButton({ children, onClick, active = false, styles }) {
  const [interactiveState, setInteractiveState] = React.useState({
    hover: false,
    focus: false,
    pressed: false,
  });

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setInteractiveState((state) => ({ ...state, hover: true }))}
      onMouseLeave={() => setInteractiveState((state) => ({ ...state, hover: false, pressed: false }))}
      onMouseDown={() => setInteractiveState((state) => ({ ...state, pressed: true }))}
      onMouseUp={() => setInteractiveState((state) => ({ ...state, pressed: false }))}
      onFocus={() => setInteractiveState((state) => ({ ...state, focus: true }))}
      onBlur={() => setInteractiveState({ hover: false, focus: false, pressed: false })}
      style={{
        ...styles.railNavButton,
        ...(active ? styles.railNavButtonActive : null),
        ...(interactiveState.hover ? styles.railNavButtonHover : null),
        ...(interactiveState.focus ? styles.railNavButtonFocus : null),
        ...(interactiveState.pressed ? styles.railNavButtonPressed : null),
      }}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function EvidenceSignal({ item, styles }) {
  const display = normalizeEvidenceProxyDisplayLabel(item);
  const severityTone = display.tone || "#aab7cc";

  return (
    <div style={styles.railSignalRow}>
      <span style={{ ...styles.railSignalDot, borderColor: `${severityTone}88` }} />
      <div style={styles.railSignalText}>
        <div style={styles.railSignalLabel}>{item?.label || "Live evidence signal"}</div>
        <div style={styles.railSignalMeta}>{display.statusLabel} - {item?.sourceLabel || "Current response"}</div>
        <div style={styles.railSignalMeta}>{display.boundaryLabel}; qualitative only.</div>
      </div>
    </div>
  );
}

function LensIdentityRailSection({ model, displayIdentity, styles }) {
  const primaryRoute = model?.primaryAnalysisRoute || {};
  const lens = model?.resolvedInstitutionalLens || {};
  const visibleLensLabel = primaryRoute.visibleLabel || lens.visibleLabelOverride || lens.displayLabel || lens.label;
  const visibleQuestionGroup = primaryRoute.questionGroup || lens.primaryRouteQuestionGroup || lens.questionGroupId;
  const canonicalRoute = model?.familyCanonicalRoutingContract || {};
  const canonicalQuestionGroup = canonicalRoute.canonicalQuestionGroup || model?.canonicalQuestionGroup || visibleQuestionGroup;
  const canonicalSourceProfile = canonicalRoute.canonicalSourceProfile || model?.canonicalSourceProfile || primaryRoute.sourceProfile;
  const provenance = model?.evidenceProvenanceSemanticsContract || {};
  const identity = model?.assetIdentityResolution || {};
  const representationRoute = model?.representationFamilyRoute || model?.representationFamilyDecision?.route || {};
  const representationGates = safeArray(model?.representationFamilyEvidenceGates || model?.representationFamilyDecision?.evidenceGates);
  const warnings = safeArray(model?.calibrationWarnings);
  const identityWarnings = warnings.filter((warning) => /identity|variant|wrapped|bridged|lens|mapping/i.test(String(warning?.id || warning?.issue || "")));
  if (!lens?.lensId && !identityWarnings.length && !displayIdentity?.displayFraming) return null;

  return (
    <RailSection title="Lens / Identity" badge={lens.confidence ? `${lens.confidence} confidence` : "Review context"} styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Resolved lens</div>
        <div style={styles.railMiniValue}>{visibleLensLabel || displayIdentity?.displayFraming || "Resolved lens unavailable"}</div>
      </div>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Canonical question group</div>
        <div style={styles.railMiniValue}>{canonicalQuestionGroup || "Question group unavailable"}</div>
      </div>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Source profile</div>
        <div style={styles.railMiniValue}>{canonicalSourceProfile || "Source profile unavailable"}</div>
      </div>
      {provenance.contractAttached ? (
        <div style={styles.railMiniCard}>
          <div style={styles.railMiniLabel}>Evidence readiness</div>
          <div style={styles.railMiniValue}>{provenance.assetSummary?.liveDataReadiness || "Current data readiness unavailable"}</div>
        </div>
      ) : null}
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Analyzed representation</div>
        <div style={styles.railMiniValue}>
          {identity.analyzedNetwork || "Network unavailable"}; {identity.analyzedContract || "no contract"}
        </div>
      </div>
      <div style={styles.railBoundaryGrid}>
        {representationRoute.selectedFamily ? (
          <div style={styles.railBoundaryPill}>Family: {representationRoute.visibleLabel || representationRoute.selectedFamily}</div>
        ) : null}
        {representationRoute.routeSafety ? (
          <div style={styles.railBoundaryPill}>Route safety: {representationRoute.routeSafety}</div>
        ) : null}
        {representationGates.length ? (
          <div style={styles.railBoundaryPill}>Evidence gates: {representationGates.length}</div>
        ) : null}
        <div style={styles.railBoundaryPill}>Provider metadata only</div>
        <div style={styles.railBoundaryPill}>Source requirement, not evidence</div>
        {provenance.contractAttached ? <div style={styles.railBoundaryPill}>{safeArray(provenance.primaryLabels)[0] || "Evidence provenance separated"}</div> : null}
        <div style={styles.railBoundaryPill}>Identity warnings require manual review</div>
        <div style={styles.railBoundaryPill}>Wrong-asset risk: {identity.wrongAssetRisk || "unknown"}</div>
      </div>
      {identityWarnings.length ? (
        <div style={styles.railBoundaryText}>
          Diagnostic warnings: {identityWarnings.slice(0, 2).map((warning) => warning.id || warning.issue || "warning").join("; ")}.
        </div>
      ) : (
        <div style={styles.railBoundaryText}>No lens or identity diagnostic warning is attached to this live response.</div>
      )}
    </RailSection>
  );
}

function FreshnessRailSection({ model, styles }) {
  const freshness = model?.analysisFreshness || {};
  if (!freshness.freshnessLabel) return null;

  return (
    <RailSection title="Analysis Freshness" badge={freshness.qaEligibilityLabel || freshness.freshnessLabel} styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Source</div>
        <div style={styles.railMiniValue}>{freshness.analysisSource || "Source unknown"}</div>
      </div>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Product truth object</div>
        <div style={styles.railMiniValue}>{freshness.currentProductTruthObject || "unknown"}</div>
      </div>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Generated / read</div>
        <div style={styles.railMiniValue}>
          {freshness.generatedAt ? formatDateTime(freshness.generatedAt) : freshness.readAt ? formatDateTime(freshness.readAt) : "Timestamp unavailable"}
        </div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Path: {freshness.primaryAnalysisPath || "live_full_recompute"}</div>
        <div style={styles.railBoundaryPill}>Recomputed: {freshness.recomputed === null || freshness.recomputed === undefined ? "unknown" : freshness.recomputed ? "yes" : "no"}</div>
        <div style={styles.railBoundaryPill}>Live full recompute</div>
        <div style={styles.railBoundaryPill}>QA: {freshness.freshQaEligible ? "eligible" : "verify"}</div>
      </div>
      <div style={styles.railBoundaryText}>
        {freshness.qaEligibilityWarning || freshness.summary || "Current product output is generated from live full recompute only."}
      </div>
    </RailSection>
  );
}

function TokenomicsRailSection({ model, styles }) {
  const tokenomics = model?.tokenomicsSupplyIntegrity || {};
  if (tokenomics.tokenomicsIntegrityScore === undefined) return null;

  return (
    <RailSection title="Tokenomics Integrity" badge="Explanation context" styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Supply integrity score</div>
        <div style={styles.railMiniValue}>{tokenomics.tokenomicsIntegrityScore}/100</div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Max supply: {tokenomics.maxSupplyStatus || "unknown"}</div>
        <div style={styles.railBoundaryPill}>Unlocks: {tokenomics.unlockScheduleStatus || "unknown"}</div>
        <div style={styles.railBoundaryPill}>Evidence: {tokenomics.evidenceConfidence || "unknown"}</div>
      </div>
      <div style={styles.railBoundaryText}>
        Separate dilution/supply-underwriting signal. Provider supply fields are reported context until source-backed; this does not change the current overall score.
      </div>
    </RailSection>
  );
}

function ScoringReadinessRailSection({ model, styles }) {
  const readiness = model?.scoringReadinessContract || {};
  if (!readiness.artifactVersion) return null;

  return (
    <RailSection title="Scoring Readiness" badge="Explanation context" styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Future scoring status</div>
        <div style={styles.railMiniValue}>{readiness.overallReadinessStatus || "Status unavailable"}</div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Family: {readiness.assetFamilyLabel || "unknown"}</div>
        <div style={styles.railBoundaryPill}>Source required: {readiness.sourceRequiredDimensionCount ?? "n/a"}</div>
        <div style={styles.railBoundaryPill}>Ready: {readiness.scoringReadyDimensionCount ?? "n/a"}</div>
        <div style={styles.railBoundaryPill}>Legacy score unchanged</div>
      </div>
      <div style={styles.railBoundaryText}>
        Evidence-readiness checks explain what would improve confidence; numerical score integration requires a calibrated release.
      </div>
    </RailSection>
  );
}

function CoverageScoreEligibilityRailSection({ model, styles }) {
  const coverage = model?.coverageScoreEligibilityContract || {};
  if (!coverage.artifactVersion) return null;
  const blockers = safeArray(coverage.criticalBlockers).length
    ? safeArray(coverage.criticalBlockers)
    : safeArray(coverage.coverageBlockers);

  return (
    <RailSection title="Coverage / Score Eligibility" badge={coverage.scoreEligibility || "Coverage gate"} styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Analysis depth</div>
        <div style={styles.railMiniValue}>{coverage.analysisDepthLabel || coverage.coverageTierLabel || "Coverage tier unavailable"}</div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Tier: {coverage.coverageTierLabel || coverage.coverageTier || "unknown"}</div>
        <div style={styles.railBoundaryPill}>Score: {coverage.scoreDisplayMode || "unknown"}</div>
        <div style={styles.railBoundaryPill}>Route: {coverage.familyRouteSafety || "unknown"}</div>
      </div>
      {blockers.slice(0, 3).map((blocker, index) => (
        <div key={`${blocker.label || "blocker"}-${index}`} style={styles.railSignalRow}>
          <span style={{ ...styles.railSignalDot, borderColor: "#ffb02088" }} />
          <div style={styles.railSignalText}>
            <div style={styles.railSignalLabel}>{blocker.label || "Coverage blocker requires review."}</div>
            <div style={styles.railSignalMeta}>{blocker.severity || "coverage"} - {blocker.scoreEligibilityImpact || "score eligibility"}</div>
          </div>
        </div>
      ))}
      <div style={styles.railBoundaryText}>
        {coverage.primaryUserMessage || "Coverage gate controls score display eligibility only; current score and verdict formulas are unchanged."}
      </div>
    </RailSection>
  );
}

function FamilyDataRequirementRailSection({ model, styles }) {
  const matrix = model?.familyDataRequirementMatrixContract || {};
  if (!matrix.artifactVersion) return null;

  return (
    <RailSection title="Family Data Matrix" badge="Requirement backbone" styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Source matrix</div>
        <div style={styles.railMiniValue}>{matrix.primarySourceMatrixId || matrix.primaryFamily || "Source matrix unavailable"}</div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Live/API: {safeArray(matrix.liveDataRequirements).length}</div>
        <div style={styles.railBoundaryPill}>Reviewed evidence: {safeArray(matrix.reviewedEvidenceRequirements).length}</div>
        <div style={styles.railBoundaryPill}>Manual review: {safeArray(matrix.manualReviewTriggers).length}</div>
      </div>
      <div style={styles.railBoundaryText}>
        {safeArray(matrix.sourceQueueItems)[0] || "Family-specific requirements are attached as readiness context only; scores and verdicts are unchanged."}
      </div>
    </RailSection>
  );
}

function ReviewedEvidenceRailSection({ model, styles }) {
  const packet = model?.reviewedEvidencePacket || {};
  if (!packet.packetLoaded) return null;

  const reviewStatusLabel = cleanPrimaryAnswerText(packet.reviewStatus || "reviewed support");

  return (
    <RailSection title="Reviewed Evidence" badge={reviewStatusLabel || "Reviewed support"} styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Packet</div>
        <div style={styles.railMiniValue}>{packet.packetId || "Reviewed evidence packet loaded"}</div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>{safeArray(packet.sources).length} sources</div>
        <div style={styles.railBoundaryPill}>{safeArray(packet.questionMappings).filter((mapping) => mapping.answerUpgradeAvailable).length} mapped answers</div>
        <div style={styles.railBoundaryPill}>{packet.scoringActive ? "QA warning: unexpectedly included in calibrated scoring" : "Not included in the numerical score yet"}</div>
      </div>
      <div style={styles.railBoundaryText}>
        Reviewed evidence can improve answer wording and source status; it is not included in the numerical score yet.
      </div>
    </RailSection>
  );
}

function CategoryDrivenRailSection({ model, styles }) {
  const contract = model?.categoryDrivenAssetFamilyContract || {};
  const diagnostics = model?.categoryReadinessDiagnostics || {};
  if (!contract.primaryAssetFamily) return null;

  return (
    <RailSection title="Category Questions" badge={contract.categoryAuthorityApplied ? "Authority applied" : "Diagnostic only"} styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Asset family</div>
        <div style={styles.railMiniValue}>{contract.primaryVisibleLabel || contract.frontendVisibleLabel || contract.primaryAssetFamily}</div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Authority: {contract.categoryAuthorityStatus || "unknown"}</div>
        <div style={styles.railBoundaryPill}>Question group: {contract.questionRegistryGroup?.groupId || "unavailable"}</div>
        <div style={styles.railBoundaryPill}>Family confidence: {contract.familyConfidence || "unknown"}</div>
        <div style={styles.railBoundaryPill}>AIC: {contract.categoryAicAlignmentStatus || "unknown"}</div>
        <div style={styles.railBoundaryPill}>DataFirst: {contract.categoryDataFirstAlignmentStatus || "unknown"}</div>
        <div style={styles.railBoundaryPill}>Fit: {diagnostics.familyFitScore ?? "n/a"}</div>
        <div style={styles.railBoundaryPill}>Scoring: {diagnostics.scoringIntegrationStatus || "non_scoring_v1"}</div>
      </div>
      <div style={styles.railBoundaryText}>
        {contract.categoryAuthorityReason || contract.categoryAuthorityBlockedReason || "Provider categories route source questions only. They do not change the final score or verdict."}
      </div>
    </RailSection>
  );
}

function RawDataCoverageRailSection({ model, styles }) {
  const expansion = model?.providerRawDataExpansion || {};
  const diagnostics = model?.rawDataCoverageDiagnostics || expansion.rawDataCoverageDiagnostics || {};
  if (!expansion.artifactVersion && diagnostics.overallRawDataCoverageScore === undefined) return null;

  return (
    <RailSection title="Raw Data Coverage" badge="Non-scoring" styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Overall coverage</div>
        <div style={styles.railMiniValue}>{diagnostics.overallRawDataCoverageScore ?? "n/a"}/100</div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Category: {expansion.categoryDataCoverage || diagnostics.categoryDataCoverageScore || "unknown"}</div>
        <div style={styles.railBoundaryPill}>Peers: {expansion.categoryPeerMarketStats?.peerCount ?? 0}</div>
        <div style={styles.railBoundaryPill}>CoinGecko: {expansion.coinGeckoCategoryUniverse?.status || "unknown"}</div>
        <div style={styles.railBoundaryPill}>CMC: {expansion.coinMarketCapCategoryUniverse?.status || "unknown"}</div>
      </div>
      <div style={styles.railBoundaryText}>
        Provider category/raw data is provider-reported context only. Missing fields become source requirements and do not change scoring or verdicts.
      </div>
    </RailSection>
  );
}

function AnalystWorkflowRailSection({ model, styles }) {
  const workflow = model?.institutionalAnalystWorkflowContract;
  if (!workflow?.artifactVersion) return null;
  const answered = (workflow.autonomousQuestionAnswers || []).filter((answer) => answer.answerState === "answered_by_current_data").length;
  return (
    <RailSection title="Analyst Workflow" badge={workflow.workflowCompletenessStatus || "Workflow"} styles={styles}>
      <div style={styles.railMuted}>{workflow.investmentResearchMemo?.executiveSummary || "Autonomous analyst summary unavailable."}</div>
      <div style={styles.railChipRow}>
        <RailBadge styles={styles} tone="#7dd3fc">{answered}/{workflow.autonomousQuestionAnswers?.length || 0} answered</RailBadge>
        <RailBadge styles={styles} tone="#f9d976">{workflow.missingData?.length || 0} gaps</RailBadge>
      </div>
      <div style={styles.railBoundaryText}>Source candidates and manual review state are excluded from autonomous answers.</div>
    </RailSection>
  );
}

function MobileRailSummary({
  model,
  primaryBlocker,
  evidenceItems,
  evidenceStatusProxy,
  onSelectSection,
  onViewMethodology,
  styles,
}) {
  const firstEvidenceSignal = evidenceItems[0] ? normalizeEvidenceProxyDisplayLabel(evidenceItems[0]) : null;
  const primaryRoute = model?.primaryAnalysisRoute || {};
  const resolvedLens = model?.resolvedInstitutionalLens || {};
  const visibleLensLabel = primaryRoute.visibleLabel || resolvedLens.visibleLabelOverride || resolvedLens.displayLabel || resolvedLens.label;
  const freshness = model?.analysisFreshness || {};
  const representationRoute = model?.representationFamilyRoute || model?.representationFamilyDecision?.route || {};

  return (
    <div style={styles.railMobileSummary}>
      <div style={styles.railMobileSummaryTopline}>
        <div>
          <div style={styles.railEyebrow}>Research Intelligence Summary</div>
          <div style={styles.railTitle}>Live response summary</div>
        </div>
        <RailBadge styles={styles}>{evidenceStatusProxy?.label || "Live Evidence Proxy"}</RailBadge>
      </div>
      <div style={styles.railMobileSummaryGrid}>
        <div style={styles.railMiniCard}>
          <div style={styles.railMiniLabel}>Decision</div>
          <div style={styles.railMiniValue}>{model?.allocationOutcome?.label || "Decision unavailable"}</div>
        </div>
        <div style={styles.railMiniCard}>
          <div style={styles.railMiniLabel}>Primary blocker</div>
          <div style={styles.railMiniValue}>{primaryBlocker.label || "Primary blocker not explicitly available."}</div>
        </div>
        <div style={styles.railMiniCard}>
          <div style={styles.railMiniLabel}>Evidence proxy</div>
          <div style={styles.railMiniValue}>{firstEvidenceSignal?.statusLabel || "No live evidence proxy signals attached."}</div>
        </div>
        <div style={styles.railMiniCard}>
          <div style={styles.railMiniLabel}>Resolved lens</div>
          <div style={styles.railMiniValue}>{visibleLensLabel || "Lens unavailable"}</div>
        </div>
        <div style={styles.railMiniCard}>
          <div style={styles.railMiniLabel}>Family route</div>
          <div style={styles.railMiniValue}>{representationRoute.visibleLabel || primaryRoute.visibleLabel || "Family route unavailable"}</div>
        </div>
        <div style={styles.railMiniCard}>
          <div style={styles.railMiniLabel}>Freshness</div>
          <div style={styles.railMiniValue}>{freshness.freshnessLabel || "Freshness unknown"}</div>
        </div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Source candidates require review.</div>
        <div style={styles.railBoundaryPill}>Report-only evidence is not scoring input.</div>
        <div style={styles.railBoundaryPill}>Manual review is workflow, not automatic proof of failure.</div>
      </div>
      <div style={styles.railInlineActions}>
        <RailTextButton onClick={() => onSelectSection?.("thesis_falsification")} styles={styles}>
          View Thesis
        </RailTextButton>
        <RailTextButton onClick={onViewMethodology} styles={styles}>
          Learn Methodology
        </RailTextButton>
      </div>
      <div style={styles.railMobileDetails}>
        Full rail detail is reduced on mobile. Use the canonical tabs below for the complete thesis, evidence, scoring, source, and review views.
      </div>
    </div>
  );
}

export default function AnalysisRightRail({
  model,
  displayIdentity = null,
  evidenceStatusProxy,
  activeTab,
  onSelectSection,
  onViewMethodology,
  styles,
}) {
  const primaryBlocker = model?.primaryBlocker || {};
  const weakestLink = model?.weakestLink || {};
  const requirements = model?.whatWouldChangeDecision?.items?.length
    ? model.whatWouldChangeDecision.items
    : ["Additional verified evidence required."];
  const evidenceItems = evidenceStatusProxy?.items || [];
  const assetClassLabel = displayIdentity?.displayAssetClass || model?.assetClassLabel || "Asset class unavailable";
  const assetFramingLabel = displayIdentity?.displayFraming || model?.assetFramingLabel || "Digital Asset Allocation Thesis";
  const identityChip = displayIdentity?.primaryChip || assetClassLabel;
  const navItems = [
    ["thesis_falsification", "Thesis Falsification"],
    ["institutional_checklist", "Institutional Checklist"],
    ["tokenomics", "Tokenomics"],
    ["evidence_map", "Evidence Map"],
    ["scoring_transparency", "Scoring Transparency"],
    ["source_queue", "Source Queue"],
    ["manual_review", "Manual Review"],
  ];

  return (
    <aside style={styles.analysisRightRail} aria-label="Research intelligence rail">
      <div style={styles.railStickyInner}>
        <MobileRailSummary
          model={model}
          primaryBlocker={primaryBlocker}
          evidenceItems={evidenceItems}
          evidenceStatusProxy={evidenceStatusProxy}
          onSelectSection={onSelectSection}
          onViewMethodology={onViewMethodology}
          styles={styles}
        />

        <div style={styles.railDesktopSections}>
          <div style={styles.railHeader}>
            <div style={styles.railEyebrow}>Research Intelligence Rail</div>
            <div style={styles.railTitle}>Decision cockpit</div>
            <div style={styles.railSubtitle}>Compact live context. Main cards remain the source of detail.</div>
          </div>

          <RailSection title="Decision Summary" badge="Live response summary" styles={styles}>
            <div style={styles.railDecisionOutcome}>{model?.allocationOutcome?.label || "Decision unavailable"}</div>
            <div style={styles.railMuted}>{assetFramingLabel}</div>
            <div style={styles.railChipRow}>
              <RailBadge styles={styles} tone="#d5dcec">{assetClassLabel}</RailBadge>
              <RailBadge styles={styles} tone="#7dd3fc">{identityChip}</RailBadge>
              <RailBadge styles={styles} tone="#ffb020">{model?.confidenceLabel || "Confidence unavailable"}</RailBadge>
              <RailBadge styles={styles} tone="#7dd3fc">Evidence proxy: qualitative</RailBadge>
            </div>
          </RailSection>

          <LensIdentityRailSection model={model} displayIdentity={displayIdentity} styles={styles} />

          <FreshnessRailSection model={model} styles={styles} />

          <TokenomicsRailSection model={model} styles={styles} />

          <ScoringReadinessRailSection model={model} styles={styles} />

          <CoverageScoreEligibilityRailSection model={model} styles={styles} />

          <FamilyDataRequirementRailSection model={model} styles={styles} />

          <ReviewedEvidenceRailSection model={model} styles={styles} />

          <CategoryDrivenRailSection model={model} styles={styles} />

          <RawDataCoverageRailSection model={model} styles={styles} />

          <AnalystWorkflowRailSection model={model} styles={styles} />

          <RailSection title="Blocker / Weakest Link" styles={styles}>
            <div style={styles.railMiniCard}>
              <div style={styles.railMiniLabel}>Primary blocker</div>
              <div style={styles.railMiniValue}>{primaryBlocker.label || "Primary blocker not explicitly available."}</div>
            </div>
            <div style={styles.railMiniCard}>
              <div style={styles.railMiniLabel}>Weakest link</div>
              <div style={styles.railMiniValue}>{weakestLink.label || "Weakest link not explicitly available."}</div>
            </div>
            <div style={styles.railInlineActions}>
              <RailTextButton onClick={() => onSelectSection?.("manual_review")} active={activeTab === "manual_review"} styles={styles}>
                View Manual Review
              </RailTextButton>
              <RailTextButton onClick={() => onSelectSection?.("thesis_falsification")} active={activeTab === "thesis_falsification"} styles={styles}>
                View Thesis
              </RailTextButton>
            </div>
          </RailSection>

          <RailSection title="Evidence Status" badge={evidenceStatusProxy?.label || "Live Evidence Proxy"} styles={styles}>
            {evidenceItems.length ? (
              <div style={styles.railSignalList}>
                {evidenceItems.slice(0, 4).map((item) => (
                  <EvidenceSignal key={item.key} item={item} styles={styles} />
                ))}
              </div>
            ) : (
              <div style={styles.railMuted}>No evidence proxy signals attached to this live response.</div>
            )}
            <div style={styles.railBoundaryText}>Qualitative review signals only. Not a score, count distribution, or institutional support rating.</div>
          </RailSection>

          <RailSection title="What Would Change" styles={styles}>
            <div style={styles.railRequirementList}>
              {requirements.slice(0, 3).map((item, index) => (
                <div key={`${item}-${index}`} style={styles.railRequirementItem}>
                  <span style={styles.railRequirementIndex}>{index + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </RailSection>

          <RailSection title="Source / Review Boundary" styles={styles}>
            <div style={styles.railBoundaryGrid}>
              <div style={styles.railBoundaryPill}>Source candidates require review.</div>
              <div style={styles.railBoundaryPill}>Report-only evidence is not scoring input.</div>
              <div style={styles.railBoundaryPill}>Manual review is workflow, not automatic proof of failure.</div>
            </div>
          </RailSection>

          <RailSection title="Quick Navigation" styles={styles}>
            <div style={styles.railNavGrid}>
              {navItems.map(([key, label]) => (
                <RailTextButton key={key} onClick={() => onSelectSection?.(key)} active={activeTab === key} styles={styles}>
                  {label}
                </RailTextButton>
              ))}
              <RailTextButton onClick={onViewMethodology} styles={styles}>
                Learn Methodology
              </RailTextButton>
            </div>
            <div style={styles.railBoundaryText}>
              Live navigation only. Report-only overlays do not affect live verdicts.
            </div>
          </RailSection>
        </div>
      </div>
    </aside>
  );
}
