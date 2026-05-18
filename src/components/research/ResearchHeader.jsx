import React from "react";

function ProductViewButton({ active, children, onClick, styles }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.productViewButton,
        ...(active ? styles.productViewButtonActive : null),
      }}
    >
      {children}
    </button>
  );
}

export default function ResearchHeader({
  backendMeta,
  apiBase,
  activeProductView = "analysis",
  onRunAnalysis,
  onViewMethodology,
  onOpenAnalysis,
  styles,
}) {
  const isMethodologyView = activeProductView === "methodology";

  return (
    <>
      <div style={styles.topbar}>
        <div>
          <div style={styles.brandEyebrow}>ThesisCore</div>
          <h2 style={styles.brandTitle}>Research Terminal</h2>
        </div>
        <nav style={styles.productViewNav} aria-label="Product view navigation">
          <ProductViewButton
            active={!isMethodologyView}
            onClick={onOpenAnalysis || onRunAnalysis}
            styles={styles}
          >
            Analysis Terminal
          </ProductViewButton>
          <ProductViewButton
            active={isMethodologyView}
            onClick={onViewMethodology}
            styles={styles}
          >
            Methodology
          </ProductViewButton>
        </nav>
        <div style={styles.heroNav}>
          <button onClick={onRunAnalysis} style={styles.quickButton}>Start Analysis</button>
          <button onClick={onViewMethodology} style={styles.ghostButton}>Learn Methodology</button>
        </div>
        <div style={{ ...styles.statusBadge, borderColor: backendMeta.color }}>
          <span style={{ ...styles.statusDot, background: backendMeta.color }} />
          <div>
            <div style={{ color: "#f4f7ff", fontWeight: 700 }}>{backendMeta.label}</div>
            <div style={{ color: "#8a94a6", fontSize: 12 }}>{backendMeta.tone}</div>
          </div>
        </div>
      </div>

      {!isMethodologyView ? <div style={styles.heroPanel}>
        <div style={styles.heroCopy}>
          <div style={styles.heroKicker}>Institutional Due Diligence for Digital Asset Allocation</div>
          <h1 style={styles.heroTitle}>Truth Before Allocation.</h1>
          <p style={styles.heroSubtitle}>
            ThesisCore tests whether a digital asset thesis deserves capital by exposing blockers, missing evidence, source gaps, false-positive risk, and what would change the decision.
          </p>
          <div style={styles.heroButtonRow}>
            <button onClick={onRunAnalysis} style={styles.primaryButton}>Start Analysis</button>
            <button onClick={onViewMethodology} style={styles.quickButton}>Learn Methodology</button>
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
      </div> : null}
    </>
  );
}
