import React from "react";
import { analysisColor } from "./researchUtils";

export function ProgressBar({ score, styles }) {
  const safe = Math.max(0, Math.min(100, Number(score || 0)));
  return (
    <div style={styles.progressOuter}>
      <div style={{ ...styles.progressInner, width: `${safe}%`, background: analysisColor(safe) }} />
    </div>
  );
}

export function Box({ label, value, tone, styles }) {
  return (
    <div style={styles.box}>
      <div style={styles.boxLabel}>{label}</div>
      <div style={styles.boxValue}>{value}</div>
      {tone ? <div style={styles.boxTone}>{tone}</div> : null}
    </div>
  );
}

export function SectionRow({ label, value, styles }) {
  return (
    <div style={styles.sectionRow}>
      <div style={styles.sectionRowLabel}>{label}</div>
      <div style={styles.sectionRowValue}>{value}</div>
    </div>
  );
}

export function ListBlock({ title, items, emptyText, color = "#d5dcec" }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ color, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {items && items.length ? (
        items.map((item) => (
          <p key={item} style={{ color, margin: "6px 0", lineHeight: 1.7 }}>
            - {item}
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
  return (
    <div style={styles.cardWide}>
      <div style={styles.cardHeader}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {subtitle ? <div style={{ color: "#8a94a6", marginTop: 4 }}>{subtitle}</div> : null}
        </div>
        {score !== undefined && score !== null ? <span style={{ color: analysisColor(score), fontWeight: 800 }}>{score}/100</span> : null}
      </div>
      {score !== undefined && score !== null ? <ProgressBar score={score} styles={styles} /> : null}
      {children}
    </div>
  );
}
