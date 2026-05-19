import React from "react";
import { normalizeEvidenceProxyDisplayLabel } from "./researchUtils";

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
