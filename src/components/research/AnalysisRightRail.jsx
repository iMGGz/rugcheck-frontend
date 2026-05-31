import React from "react";
import { formatDateTime, normalizeEvidenceProxyDisplayLabel, safeArray } from "./researchUtils";

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
  const lens = model?.resolvedInstitutionalLens || {};
  const identity = model?.assetIdentityResolution || {};
  const warnings = safeArray(model?.calibrationWarnings);
  const identityWarnings = warnings.filter((warning) => /identity|variant|wrapped|bridged|lens|mapping/i.test(String(warning?.id || warning?.issue || "")));
  if (!lens?.lensId && !identityWarnings.length && !displayIdentity?.displayFraming) return null;

  return (
    <RailSection title="Lens / Identity" badge={lens.confidence ? `${lens.confidence} confidence` : "Review context"} styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Resolved lens</div>
        <div style={styles.railMiniValue}>{lens.label || displayIdentity?.displayFraming || "Resolved lens unavailable"}</div>
      </div>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Question group</div>
        <div style={styles.railMiniValue}>{lens.questionGroupId || "Question group unavailable"}</div>
      </div>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Analyzed representation</div>
        <div style={styles.railMiniValue}>
          {identity.analyzedNetwork || "Network unavailable"}; {identity.analyzedContract || "no contract"}
        </div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Provider metadata only</div>
        <div style={styles.railBoundaryPill}>Source requirement, not evidence</div>
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
    <RailSection title="Analysis Freshness" badge={freshness.freshnessLabel} styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Source</div>
        <div style={styles.railMiniValue}>{freshness.analysisSource || "Source unknown"}</div>
      </div>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Generated / read</div>
        <div style={styles.railMiniValue}>
          {freshness.generatedAt ? formatDateTime(freshness.generatedAt) : freshness.readAt ? formatDateTime(freshness.readAt) : "Timestamp unavailable"}
        </div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>Snapshot: {freshness.snapshotShortId || "unavailable"}</div>
        <div style={styles.railBoundaryPill}>Recomputed: {freshness.recomputed === null || freshness.recomputed === undefined ? "unknown" : freshness.recomputed ? "yes" : "no"}</div>
        <div style={styles.railBoundaryPill}>{freshness.isPartialRefresh ? "Partial refresh" : freshness.isSnapshot ? "Stored snapshot" : freshness.isFreshLive ? "Live analysis" : "Verify freshness"}</div>
      </div>
      <div style={styles.railBoundaryText}>
        {freshness.summary || "Freshness unknown. Verify current provider state before relying on time-sensitive sections."}
      </div>
    </RailSection>
  );
}

function TokenomicsRailSection({ model, styles }) {
  const tokenomics = model?.tokenomicsSupplyIntegrity || {};
  if (tokenomics.tokenomicsIntegrityScore === undefined) return null;

  return (
    <RailSection title="Tokenomics Integrity" badge="Diagnostic v1" styles={styles}>
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

function ReviewedEvidenceRailSection({ model, styles }) {
  const packet = model?.reviewedEvidencePacket || {};
  if (!packet.packetLoaded) return null;

  return (
    <RailSection title="Reviewed Evidence" badge={packet.reviewStatus || "Demo seed"} styles={styles}>
      <div style={styles.railMiniCard}>
        <div style={styles.railMiniLabel}>Packet</div>
        <div style={styles.railMiniValue}>{packet.packetId || "Reviewed evidence packet loaded"}</div>
      </div>
      <div style={styles.railBoundaryGrid}>
        <div style={styles.railBoundaryPill}>{safeArray(packet.sources).length} sources</div>
        <div style={styles.railBoundaryPill}>{safeArray(packet.questionMappings).filter((mapping) => mapping.answerUpgradeAvailable).length} mapped answers</div>
        <div style={styles.railBoundaryPill}>{packet.scoringActive ? "QA warning: scoring-active" : "Not scoring-active"}</div>
      </div>
      <div style={styles.railBoundaryText}>
        Reviewed demo evidence can improve answer wording and source status; it does not change the live score or verdict in v1.
      </div>
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
  const resolvedLens = model?.resolvedInstitutionalLens || {};
  const freshness = model?.analysisFreshness || {};

  return (
    <div style={styles.railMobileSummary}>
      <div style={styles.railMobileSummaryTopline}>
        <div>
          <div style={styles.railEyebrow}>Research Intelligence Summary</div>
          <div style={styles.railTitle}>Live response snapshot</div>
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
          <div style={styles.railMiniValue}>{resolvedLens.label || "Lens unavailable"}</div>
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

          <RailSection title="Decision Snapshot" badge="Live response snapshot" styles={styles}>
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

          <ReviewedEvidenceRailSection model={model} styles={styles} />

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
