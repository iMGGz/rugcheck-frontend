import React from "react";

export default function ResearchHeader({ backendMeta, apiBase, styles }) {
  return (
    <>
      <div style={styles.topbar}>
        <div>
          <div style={styles.brandEyebrow}>RugCheck AI</div>
          <h2 style={styles.brandTitle}>Token research terminal</h2>
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
          <div style={styles.heroKicker}>Research faster. Filter noise earlier.</div>
          <h1 style={styles.heroTitle}>Crypto screening built for fast first-pass conviction.</h1>
          <p style={styles.heroSubtitle}>
            Search a token, pull market structure and security signals, then review a structured verdict without bouncing across five tabs and three data sources.
          </p>
          <div style={styles.heroBullets}>
            <span style={styles.heroBullet}>Live market inputs</span>
            <span style={styles.heroBullet}>Security checks</span>
            <span style={styles.heroBullet}>AI-assisted summary</span>
            <span style={styles.heroBullet}>Confidence scoring</span>
          </div>
        </div>

        <div style={styles.heroSideCard}>
          <div style={styles.sideCardLabel}>Current setup</div>
          <div style={styles.sideCardValue}>Frontend and backend are deployed</div>
          <p style={styles.sideCardText}>
            API base: <code style={styles.inlineCode}>{apiBase}</code>
          </p>
          <p style={styles.sideCardText}>
            Best use: quick token triage before deeper manual research.
          </p>
        </div>
      </div>
    </>
  );
}
