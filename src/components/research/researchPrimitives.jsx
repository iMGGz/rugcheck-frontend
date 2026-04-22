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

export function TabButton({ active, label, onClick, styles }) {
  return (
    <button onClick={onClick} style={{ ...styles.tabButton, ...(active ? styles.tabButtonActive : {}) }}>
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
