import React, { useRef } from "react";

function Label({ children, styles }) {
  return <span style={styles.homepageLabel}>{children}</span>;
}

function ValueCard({ title, text, styles }) {
  return (
    <div style={styles.homepageValueCard}>
      <div style={styles.homepageValueTitle}>{title}</div>
      <div style={styles.homepageMuted}>{text}</div>
    </div>
  );
}

function PipelineStep({ children, styles }) {
  return <div style={styles.homepagePipelineStep}>{children}</div>;
}

function BoundaryItem({ children, styles }) {
  return <div style={styles.homepageBoundaryItem}>{children}</div>;
}

export default function HomepagePositioning({ onAnalyzeAsset, onViewMethodology, styles }) {
  const workflowRef = useRef(null);
  const scrollToWorkflow = () => {
    workflowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const labels = [
    "Institutional Due Diligence",
    "Thesis Falsification",
    "Evidence Transparency",
    "False-Positive Discipline",
    "Source-Backed Research",
  ];

  const valueCards = [
    {
      title: "Decision-first analysis",
      text: "Final decision, primary blocker, weakest link, and what would change the decision are surfaced before secondary scores.",
    },
    {
      title: "Evidence transparency",
      text: "Live provider context, missing evidence, provider gaps, and source trace are visible instead of buried in a generic score.",
    },
    {
      title: "Institutional questions",
      text: "Asset-class-specific questions structure the analysis. Live per-question mapping only appears when attached.",
    },
    {
      title: "Source-backed workflow",
      text: "Source candidates, manual intake, reviewed evidence items, and report-only overlays support deeper diligence without contaminating live scoring.",
    },
    {
      title: "Scoring transparency",
      text: "Only live scoring affects the current verdict. Report-only evidence and source candidates do not affect scoring unless future calibrated integration occurs.",
    },
  ];

  const pipeline = [
    "Asset Input",
    "Classification",
    "Institutional Questions",
    "Evidence / Sources",
    "Missing Evidence + Provider Gaps",
    "Caps / Guardrails",
    "Decision",
    "What Would Change",
  ];

  const providerCategories = [
    "market context",
    "DEX liquidity context",
    "protocol context",
    "security/admin signals",
    "provider diagnostics",
  ];

  const manualResearchDomains = [
    "reserves",
    "redemption",
    "legal claim",
    "custody",
    "attestations",
    "governance",
    "tokenholder accrual",
    "audits",
    "NAV / proof-of-reserves",
  ];

  return (
    <section style={styles.homepageShell}>
      <div style={styles.homepageHero}>
        <div style={styles.homepageHeroCopy}>
          <div style={styles.homepageKicker}>Institutional Digital Asset Due Diligence</div>
          <h1 style={styles.homepageTitle}>Truth Before Allocation.</h1>
          <p style={styles.homepageSubtitle}>
            ThesisCore does not predict price or generate AI picks. It tests whether a digital asset allocation thesis survives evidence, missing data, contradictions, and asset-class-specific institutional due diligence.
          </p>
          <div style={styles.homepageLabelRow}>
            {labels.map((label) => <Label key={label} styles={styles}>{label}</Label>)}
          </div>
          <div style={styles.homepageCtaRow}>
            <button onClick={onAnalyzeAsset} style={styles.primaryButton}>Analyze an Asset</button>
            <button onClick={onViewMethodology} style={styles.quickButton}>View Methodology</button>
            <button onClick={scrollToWorkflow} style={styles.ghostButton}>See Evidence Workflow</button>
          </div>
        </div>

        <div style={styles.homepageDecisionCard}>
          <div style={styles.metaLabel}>What the engine exposes</div>
          <div style={styles.homepageDecisionLine}>Final decision</div>
          <div style={styles.homepageDecisionLineMuted}>Primary blocker</div>
          <div style={styles.homepageDecisionLineMuted}>Weakest link</div>
          <div style={styles.homepageDecisionLineMuted}>Missing evidence</div>
          <div style={styles.homepageDecisionLineMuted}>What would change the decision</div>
          <div style={styles.homepageBoundaryNote}>Research support only. Not financial advice. No price prediction.</div>
        </div>
      </div>

      <div style={styles.homepageValueGrid}>
        {valueCards.map((card) => (
          <ValueCard key={card.title} title={card.title} text={card.text} styles={styles} />
        ))}
      </div>

      <div style={styles.homepagePanel}>
        <div style={styles.homepageSectionHeader}>
          <div>
            <div style={styles.homepageKicker}>Engine Pipeline Preview</div>
            <h2 style={styles.homepageSectionTitle}>From asset input to falsifiable decision.</h2>
          </div>
          <div style={styles.homepageMuted}>Compact workflow only. No fake metrics or counts.</div>
        </div>
        <div style={styles.homepagePipeline}>
          {pipeline.map((step, index) => (
            <React.Fragment key={step}>
              <PipelineStep styles={styles}>{step}</PipelineStep>
              {index < pipeline.length - 1 ? <span style={styles.homepagePipelineArrow}>-&gt;</span> : null}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={styles.homepageTwoColumn}>
        <div style={styles.homepagePanel}>
          <div style={styles.homepageKicker}>Product Differentiation</div>
          <h2 style={styles.homepageSectionTitle}>Not a screener. Not price prediction. Not AI picks.</h2>
          <div style={styles.homepageBoundaryList}>
            <BoundaryItem styles={styles}>Screeners rank assets.</BoundaryItem>
            <BoundaryItem styles={styles}>Price tools forecast markets.</BoundaryItem>
            <BoundaryItem styles={styles}>AI-pick apps generate recommendations.</BoundaryItem>
            <BoundaryItem styles={styles}>ThesisCore tests allocation theses against evidence and falsification rules.</BoundaryItem>
          </div>
        </div>

        <div ref={workflowRef} style={styles.homepagePanel}>
          <div style={styles.homepageKicker}>Research Workflow</div>
          <h2 style={styles.homepageSectionTitle}>Transparent live data plus auditable source-backed research.</h2>
          <p style={styles.homepageMuted}>
            ThesisCore prioritizes currently available live providers and source-backed manual research over opaque paid-provider dependency.
          </p>
          <div style={styles.homepageWorkflowGrid}>
            <div>
              <div style={styles.homepageMiniTitle}>Live providers help with</div>
              <div style={styles.homepageTagRow}>
                {providerCategories.map((item) => <span key={item} style={styles.homepageTag}>{item}</span>)}
              </div>
            </div>
            <div>
              <div style={styles.homepageMiniTitle}>Source-backed research handles</div>
              <div style={styles.homepageTagRow}>
                {manualResearchDomains.map((item) => <span key={item} style={styles.homepageTag}>{item}</span>)}
              </div>
            </div>
          </div>
          <div style={styles.homepageBoundaryNote}>
            Source candidates are not evidence. Report-only evidence does not affect live scoring.
          </div>
        </div>
      </div>

      <div style={styles.homepageFuturePanel}>
        <div>
          <div style={styles.homepageKicker}>Planned Strategic Layer</div>
          <h2 style={styles.homepageSectionTitle}>Designed for the next thesis: Hybrid Finance.</h2>
          <p style={styles.homepageSubtitleSmall}>
            ThesisCore is designed to evolve from asset-level analysis into institutional macro thesis testing, including Hybrid Finance: Bitcoin as institutional foundation, tokenized real-world assets, stablecoin settlement rails, institutional blockchain infrastructure, and on-chain trading rails.
          </p>
        </div>
        <div style={styles.homepageFutureBoundary}>
          <div style={styles.homepageMiniTitle}>Boundary</div>
          <p style={styles.homepageMuted}>
            Planned strategic layer. Not live scoring. Not current registry. Not source fetching. Claims will require source, date, freshness, review status, mapped thesis question, verification requirements, contradiction checks, and evidence requirements.
          </p>
        </div>
      </div>
    </section>
  );
}
