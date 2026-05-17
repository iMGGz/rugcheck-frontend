import React from "react";
import { formatScoreValue } from "./researchUtils";

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
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.railNavButton,
        ...(active ? styles.railNavButtonActive : null),
      }}
    >
      {children}
    </button>
  );
}

function EvidenceSignal({ item, styles }) {
  const severityTone = {
    supported: "#2fd67b",
    info: "#7dd3fc",
    neutral: "#8a94a6",
    warning: "#ffb020",
    review: "#ffb020",
    critical: "#ff6b6b",
  }[item?.severity] || "#8a94a6";

  return (
    <div style={styles.railSignalRow}>
      <span style={{ ...styles.railSignalDot, background: severityTone }} />
      <div style={styles.railSignalText}>
        <div style={styles.railSignalLabel}>{item?.label || "Live evidence signal"}</div>
        <div style={styles.railSignalMeta}>{item?.valueLabel || "Proxy"} - {item?.sourceLabel || "Current response"}</div>
      </div>
    </div>
  );
}

export default function AnalysisRightRail({
  model,
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
        <div style={styles.railHeader}>
          <div style={styles.railEyebrow}>Research Intelligence Rail</div>
          <div style={styles.railTitle}>Decision cockpit</div>
          <div style={styles.railSubtitle}>Compact live context. Main cards remain the source of detail.</div>
        </div>

        <RailSection title="Decision Snapshot" badge="Live response snapshot" styles={styles}>
          <div style={styles.railDecisionOutcome}>{model?.allocationOutcome?.label || "Decision unavailable"}</div>
          <div style={styles.railMuted}>{model?.assetFramingLabel || "Digital Asset Allocation Thesis"}</div>
          <div style={styles.railChipRow}>
            <RailBadge styles={styles} tone="#d5dcec">{model?.assetClassLabel || "Asset class unavailable"}</RailBadge>
            <RailBadge styles={styles} tone="#ffb020">{model?.confidenceLabel || "Confidence unavailable"}</RailBadge>
            <RailBadge styles={styles} tone="#7dd3fc">{formatScoreValue(model?.confidenceScore)} evidence proxy</RailBadge>
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
          <div style={styles.railBoundaryText}>Qualitative proxy only. Not a count distribution.</div>
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
              Methodology
            </RailTextButton>
          </div>
          <div style={styles.railBoundaryText}>
            Live navigation only. Report-only overlays do not affect live verdicts.
          </div>
        </RailSection>
      </div>
    </aside>
  );
}
