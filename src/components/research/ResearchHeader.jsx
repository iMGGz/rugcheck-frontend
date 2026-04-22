import React from "react";

export default function ResearchHeader({ backendMeta, apiBase, onRunAnalysis, onViewMethodology, styles }) {
  return (
    <>
      <div style={styles.topbar}>
        <div>
          <div style={styles.brandEyebrow}>ThesisCore</div>
          <h2 style={styles.brandTitle}>Truth Before Allocation.</h2>
        </div>
        <div style={styles.heroNav}>
          <button onClick={onRunAnalysis} style={styles.quickButton}>Run Analysis</button>
          <button onClick={onViewMethodology} style={styles.ghostButton}>View Methodology</button>
        </div>
        <div style={{ ...styles.statusBadge, borderColor: backendMeta.color }}>
          <span style={{ ...styles.statusDot, background: backendMeta.color }} />
          <div>
            <div style={{ color: "#f4f7ff", fontWeight: 700 }}>{backendMeta.label}</div>
            <div style={{ color: "#8a94a6", fontSize: 12 }}>{backendMeta.tone}</div>
          </div>
        </div>
      </div>

      <div style={styles.heroPanel}>
        <div style={styles.heroCopy}>
          <div style={styles.heroKicker}>Decision Infrastructure for Digital Assets</div>
          <h1 style={styles.heroTitle}>Decide What Deserves Capital.</h1>
          <p style={styles.heroSubtitle}>
            Deterministic investability analysis, token-thesis assessment, and allocator-grade decision support for digital assets.
          </p>
          <div style={styles.heroButtonRow}>
            <button onClick={onRunAnalysis} style={styles.primaryButton}>Run Analysis</button>
            <button onClick={onViewMethodology} style={styles.quickButton}>View Methodology</button>
          </div>
          <div style={styles.heroBullets}>
            <span style={styles.heroBullet}>Deterministic</span>
            <span style={styles.heroBullet}>Explainable</span>
            <span style={styles.heroBullet}>No Black-Box AI</span>
          </div>
        </div>

        <div style={styles.heroSideCard}>
          <div style={styles.sideCardLabel}>Positioning</div>
          <div style={styles.sideCardValue}>Messari helps you research</div>
          <p style={styles.sideCardText}>
            Nansen helps you monitor
          </p>
          <p style={styles.sideCardText}>
            Token Terminal helps you measure
          </p>
          <p style={styles.sideCardText}>
            ThesisCore helps you decide
          </p>
          <p style={styles.sideCardText}>
            API base: <code style={styles.inlineCode}>{apiBase}</code>
          </p>
        </div>
      </div>
    </>
  );
}
