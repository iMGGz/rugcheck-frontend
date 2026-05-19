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
  activeProductView = "overview",
  onOpenOverview,
  onRunAnalysis,
  onViewMethodology,
  onOpenAnalysis,
  styles,
}) {
  const isAnalysisView = activeProductView === "analysis";
  const isOverviewView = activeProductView === "overview";
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
            active={isOverviewView}
            onClick={onOpenOverview}
            styles={styles}
          >
            Overview
          </ProductViewButton>
          <ProductViewButton
            active={isAnalysisView}
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
    </>
  );
}
