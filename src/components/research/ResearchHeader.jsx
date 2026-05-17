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
          <button onClick={onRunAnalysis} style={styles.quickButton}>Analyze an Asset</button>
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
          <div style={styles.heroKicker}>Institutional Due Diligence for Digital Asset Allocation</div>
          <h1 style={styles.heroTitle}>Truth Before Allocation.</h1>
          <p style={styles.heroSubtitle}>
            ThesisCore tests whether a digital asset thesis deserves capital by exposing blockers, missing evidence, source gaps, false-positive risk, and what would change the decision.
          </p>
          <div style={styles.heroButtonRow}>
            <button onClick={onRunAnalysis} style={styles.primaryButton}>Analyze an Asset</button>
            <button onClick={onViewMethodology} style={styles.quickButton}>View Methodology</button>
          </div>
          <div style={styles.heroBullets}>
            <span style={styles.heroBullet}>Thesis Falsification</span>
            <span style={styles.heroBullet}>Evidence Transparency</span>
            <span style={styles.heroBullet}>Research Support Only</span>
          </div>
        </div>

        <div style={styles.heroSideCard}>
          <div style={styles.sideCardLabel}>Positioning Boundary</div>
          <div style={styles.sideCardValue}>Not a crypto dashboard</div>
          <p style={styles.sideCardText}>
            Not price prediction.
          </p>
          <p style={styles.sideCardText}>
            Not AI picks.
          </p>
          <p style={styles.sideCardText}>
            Not a generic score.
          </p>
          <p style={styles.sideCardText}>
            It is a deterministic due-diligence and allocation-thesis falsification engine.
          </p>
          <p style={styles.sideCardText}>
            API base: <code style={styles.inlineCode}>{apiBase}</code>
          </p>
        </div>
      </div>
    </>
  );
}
