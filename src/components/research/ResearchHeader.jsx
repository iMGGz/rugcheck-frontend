import React from "react";

function ProductViewButton({ active, children, onClick, styles }) {
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
        ...styles.productViewButton,
        ...(active ? styles.productViewButtonActive : null),
        ...(interactiveState.hover ? styles.productViewButtonHover : null),
        ...(interactiveState.focus ? styles.productViewButtonFocus : null),
        ...(interactiveState.pressed ? styles.productViewButtonPressed : null),
      }}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </button>
  );
}

function ProductViewLink({ children, href, styles }) {
  const [interactiveState, setInteractiveState] = React.useState({ hover: false, focus: false, pressed: false });
  return (
    <a
      href={href}
      onMouseEnter={() => setInteractiveState((state) => ({ ...state, hover: true }))}
      onMouseLeave={() => setInteractiveState({ hover: false, focus: false, pressed: false })}
      onMouseDown={() => setInteractiveState((state) => ({ ...state, pressed: true }))}
      onMouseUp={() => setInteractiveState((state) => ({ ...state, pressed: false }))}
      onFocus={() => setInteractiveState((state) => ({ ...state, focus: true }))}
      onBlur={() => setInteractiveState({ hover: false, focus: false, pressed: false })}
      style={{
        ...styles.productViewButton,
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
        ...(interactiveState.hover ? styles.productViewButtonHover : null),
        ...(interactiveState.focus ? styles.productViewButtonFocus : null),
        ...(interactiveState.pressed ? styles.productViewButtonPressed : null),
      }}
    >
      {children}
    </a>
  );
}

function HeaderActionButton({ children, onClick, styles, variant = "quick" }) {
  const [interactiveState, setInteractiveState] = React.useState({
    hover: false,
    focus: false,
    pressed: false,
  });
  const isGhost = variant === "ghost";
  const baseStyle = isGhost ? styles.ghostButton : styles.quickButton;
  const hoverStyle = isGhost ? styles.ghostButtonHover : styles.quickButtonHover;
  const focusStyle = isGhost ? styles.ghostButtonFocus : styles.quickButtonFocus;
  const pressedStyle = isGhost ? styles.ghostButtonPressed : styles.quickButtonPressed;

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
        ...baseStyle,
        ...(interactiveState.hover ? hoverStyle : null),
        ...(interactiveState.focus ? focusStyle : null),
        ...(interactiveState.pressed ? pressedStyle : null),
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
          <ProductViewLink href="/terminal-v2" styles={styles}>Open ThesisCore V2</ProductViewLink>
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
          <HeaderActionButton onClick={onRunAnalysis} styles={styles}>Start Analysis</HeaderActionButton>
          <HeaderActionButton onClick={onViewMethodology} styles={styles} variant="ghost">Learn Methodology</HeaderActionButton>
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
