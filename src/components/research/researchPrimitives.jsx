import React from "react";
import { analysisColor, extractRenderableText, normalizeRenderableList } from "./researchUtils";

export function ProgressBar({ score, styles }) {
  const safe = Math.max(0, Math.min(100, Number(score || 0)));
  return (
    <div style={styles.progressOuter}>
      <div style={{ ...styles.progressInner, width: `${safe}%`, background: analysisColor(safe) }} />
    </div>
  );
}

export function Box({ label, value, tone, styles }) {
  const displayValue = extractRenderableText(value, "Unavailable");
  const displayTone = extractRenderableText(tone, null);

  return (
    <div style={styles.box}>
      <div style={styles.boxLabel}>{label}</div>
      <div style={styles.boxValue}>{displayValue}</div>
      {displayTone ? <div style={styles.boxTone}>{displayTone}</div> : null}
    </div>
  );
}

export function SectionRow({ label, value, styles }) {
  const displayValue = extractRenderableText(value, "Unavailable");

  return (
    <div style={styles.sectionRow}>
      <div style={styles.sectionRowLabel}>{label}</div>
      <div style={styles.sectionRowValue}>{displayValue}</div>
    </div>
  );
}

export function ListBlock({ title, items, emptyText, color = "#d5dcec" }) {
  const safeItems = normalizeRenderableList(items);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ color, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {safeItems.length ? (
        safeItems.map((item, index) => (
          <p key={`${item}-${index}`} style={{ color, margin: "6px 0", lineHeight: 1.7 }}>
            - {item ?? `Item ${index + 1}`}
          </p>
        ))
      ) : (
        <p style={{ color: "#8a94a6" }}>{emptyText}</p>
      )}
    </div>
  );
}

export function DesignBadge({ label, tone = "#7dd3fc" }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      width: "fit-content",
      padding: "0.25rem 0.62rem",
      borderRadius: 999,
      border: `1px solid ${tone}55`,
      background: `${tone}14`,
      color: tone,
      fontSize: 11,
      fontWeight: 850,
      letterSpacing: "0.03em",
      textTransform: "uppercase",
      lineHeight: 1.25,
    }}>
      {label || "Status unavailable"}
    </span>
  );
}

export function ExecutiveSummaryCard({ eyebrow, title, answer, badges = [], children, tone = "#7dd3fc", styles }) {
  return (
    <div style={{
      ...styles.cardWide,
      padding: 24,
      borderRadius: 26,
      borderColor: `${tone}35`,
      background: `linear-gradient(145deg, ${tone}18, rgba(8,17,31,0.92) 42%, rgba(10,18,32,0.88))`,
      boxShadow: "0 22px 60px rgba(0,0,0,0.24)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 420px" }}>
          {eyebrow ? <div style={{ color: tone, fontSize: 12, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{eyebrow}</div> : null}
          <h3 style={{ margin: 0, color: "#f8fbff", fontSize: 28, lineHeight: 1.12 }}>{title}</h3>
          {answer ? <p style={{ color: "#c7d2e5", fontSize: 16, lineHeight: 1.65, margin: "10px 0 0" }}>{answer}</p> : null}
        </div>
        {badges.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", maxWidth: 420 }}>
            {badges.map((badge, index) => (
              <DesignBadge key={`${badge.label || badge}-${index}`} label={badge.label || badge} tone={badge.tone || tone} />
            ))}
          </div>
        ) : null}
      </div>
      {children ? <div style={{ marginTop: 16 }}>{children}</div> : null}
    </div>
  );
}

export function QuestionPromptCard({ question, answer, status, impact, sourceState, onClick, styles }) {
  const buttonProps = onClick ? { type: "button", onClick } : {};
  const Element = onClick ? "button" : "div";

  return (
    <Element
      {...buttonProps}
      style={{
        width: "100%",
        textAlign: "left",
        border: "1px solid rgba(125,211,252,0.18)",
        borderRadius: 18,
        padding: "0.95rem",
        background: "linear-gradient(135deg, rgba(125,211,252,0.08), rgba(6,12,24,0.42))",
        color: "#d5dcec",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 260px" }}>
          <div style={{ color: "#f4f7ff", fontWeight: 900, lineHeight: 1.35 }}>{question}</div>
          <div style={{ color: "#9aa5b8", fontSize: 13, lineHeight: 1.55, marginTop: 6 }}>{answer || "Evidence missing - source required."}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {status ? <DesignBadge label={status} tone="#9bd7ff" /> : null}
          {impact ? <DesignBadge label={impact} tone="#f9d976" /> : null}
          {sourceState ? <DesignBadge label={sourceState} tone="#a6f3c2" /> : null}
        </div>
      </div>
    </Element>
  );
}

export function CollapsibleDetail({ title, subtitle, defaultOpen = false, children, tone = "#9bd7ff", styles }) {
  return (
    <details
      open={defaultOpen}
      style={{
        ...styles.cardWide,
        borderColor: `${tone}28`,
        background: "rgba(6,12,24,0.48)",
      }}
    >
      <summary style={{ cursor: "pointer", listStyle: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: tone, fontSize: 11, fontWeight: 900, letterSpacing: "0.09em", textTransform: "uppercase" }}>Expandable detail</div>
            <h3 style={{ margin: "4px 0 0", color: "#f4f7ff" }}>{title}</h3>
            {subtitle ? <div style={{ color: "#8a94a6", marginTop: 4 }}>{subtitle}</div> : null}
          </div>
          <DesignBadge label="Open / close" tone={tone} />
        </div>
      </summary>
      <div style={{ marginTop: 14 }}>{children}</div>
    </details>
  );
}

export function TabButton({ active, label, onClick, styles }) {
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
      onMouseLeave={() => setInteractiveState({ hover: false, focus: interactiveState.focus, pressed: false })}
      onMouseDown={() => setInteractiveState((state) => ({ ...state, pressed: true }))}
      onMouseUp={() => setInteractiveState((state) => ({ ...state, pressed: false }))}
      onFocus={() => setInteractiveState((state) => ({ ...state, focus: true }))}
      onBlur={() => setInteractiveState({ hover: false, focus: false, pressed: false })}
      style={{
        ...styles.tabButton,
        ...(active ? styles.tabButtonActive : {}),
        ...(interactiveState.hover ? styles.tabButtonHover : {}),
        ...(interactiveState.focus ? styles.tabButtonFocus : {}),
        ...(interactiveState.pressed ? styles.tabButtonPressed : {}),
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export function ScorePill({ label, score, styles }) {
  return (
    <div style={{ ...styles.scorePill, borderColor: analysisColor(score), color: analysisColor(score) }}>
      {label}: {score}/100
    </div>
  );
}

export function Card({ title, score, children, subtitle, styles }) {
  const displaySubtitle = extractRenderableText(subtitle, null);

  return (
    <div style={styles.cardWide}>
      <div style={styles.cardHeader}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {displaySubtitle ? <div style={{ color: "#8a94a6", marginTop: 4 }}>{displaySubtitle}</div> : null}
        </div>
        {score !== undefined && score !== null ? <span style={{ color: analysisColor(score), fontWeight: 800 }}>{score}/100</span> : null}
      </div>
      {score !== undefined && score !== null ? <ProgressBar score={score} styles={styles} /> : null}
      {children}
    </div>
  );
}
