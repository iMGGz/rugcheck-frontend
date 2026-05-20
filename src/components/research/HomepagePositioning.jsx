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
    "Live Decision Support",
    "Thesis Falsification",
    "Asset-Class Lenses",
    "Evidence Boundaries",
    "False-Positive Discipline",
  ];

  const valueCards = [
    {
      title: "Decision-first analysis",
      text: "Final verdict, primary blocker, weakest link, and what would change the decision appear before secondary scores.",
    },
    {
      title: "Evidence gaps, not mystery scores",
      text: "Live outputs separate direct evidence, provider gaps, missing critical support, source candidates, and review-only cautions.",
    },
    {
      title: "Asset-class-aware lenses",
      text: "BTC, ETH, stablecoins, wrapped assets, DeFi tokens, L2s, infrastructure tokens, RWA assets, and memes are not judged by one generic rubric.",
    },
    {
      title: "Research requirements",
      text: "The engine generates what still needs review from live gaps. Those requirements are not reviewed evidence until a source workflow promotes them.",
    },
    {
      title: "Verdict semantics",
      text: "The frontend now distinguishes investable, evidence-blocked, manual-review, value-capture failure, dependency failure, narrative-only, and critical-risk cases.",
    },
  ];

  const pipeline = [
    "Asset",
    "Lens",
    "Evidence",
    "Blockers",
    "Research Requirements",
    "Verdict",
    "What Would Change",
  ];

  const institutionalQuestions = [
    "What must be true for this asset to deserve capital?",
    "What evidence directly supports that thesis?",
    "What evidence is missing, stale, indirect, or contradicted?",
    "Does protocol usage translate into tokenholder value capture?",
    "Does TVL, volume, or AUM create enforceable economic rights?",
    "Who controls custody, redemption, reserves, upgrades, or admin keys?",
    "Is this evidence, a source candidate, or an unreviewed claim?",
    "What would break the thesis under stress?",
    "What would change the verdict?",
  ];

  const currentAnswers = [
    {
      title: "Why allocation could make sense",
      text: "Surfaces the strongest live thesis-support signals.",
    },
    {
      title: "Why allocation is blocked",
      text: "Separates real blockers from cautionary or incomplete evidence.",
    },
    {
      title: "What evidence is missing",
      text: "Shows unresolved asset-class-critical evidence gaps.",
    },
    {
      title: "What research is required",
      text: "Turns gaps into source-review requirements.",
    },
    {
      title: "What would change the decision",
      text: "Names the conditions that could move the verdict.",
    },
    {
      title: "Fundamental failure or evidence-blocked",
      text: "Distinguishes failed thesis from insufficient proof.",
    },
  ];

  const institutionalRisks = [
    "Crypto has too many false positives.",
    "Usage does not always mean tokenholder value.",
    "TVL does not always mean accrual.",
    "AUM does not always mean token rights.",
    "Wrapped exposure is not native exposure.",
    "Stablecoin settlement depends on reserves, redemption, legal claim, and issuer risk.",
    "RWA and tokenized assets require issuer, custody, collateral, redemption, jurisdiction, and legal-rights review.",
    "Meme and narrative assets should not receive fake fundamentals.",
  ];

  const assetCoverage = [
    "BTC / monetary benchmarks",
    "ETH / base-layer settlement",
    "SOL / L1 settlement networks",
    "stablecoins",
    "wrapped assets",
    "LST / restaking assets",
    "DeFi protocol tokens",
    "L2 governance/economics tokens",
    "oracle / infrastructure assets",
    "payments / settlement networks",
    "RWA / Hybrid Finance assets",
    "meme / narrative assets",
    "low-coverage assets",
  ];

  const currentLive = [
    "thesis-falsification workflow",
    "live scoring / decision layer",
    "asset-class lenses",
    "verdict taxonomy",
    "allocation case",
    "research requirements",
    "evidence boundaries",
    "source/manual review separation",
  ];

  const plannedLayers = [
    "Source Intelligence",
    "Evidence Registry",
    "Question-Level Evidence Mapping",
    "reviewed evidence promotion",
    "contradiction / freshness / reliability checks",
    "calibrated scoring integration",
    "Hybrid Finance strategic layer",
  ];

  return (
    <section style={styles.homepageShell}>
      <div style={styles.homepageHero}>
        <div style={styles.homepageHeroCopy}>
          <div style={styles.homepageKicker}>Institutional Digital Asset Due Diligence</div>
          <h1 style={styles.homepageTitle}>Truth Before Allocation.</h1>
          <p style={styles.homepageSubtitle}>
            Most crypto tools rank what looks attractive. ThesisCore tries to break the allocation thesis before capital is exposed.
          </p>
          <p style={styles.homepageSubtitleSmall}>
            Before an asset earns capital, ThesisCore asks what would break the thesis, what evidence is missing, and what would change the decision.
          </p>
          <div style={styles.homepageLabelRow}>
            {labels.map((label) => <Label key={label} styles={styles}>{label}</Label>)}
          </div>
          <div style={styles.homepageCtaRow}>
            <button onClick={onAnalyzeAsset} style={styles.primaryButton}>Start Analysis</button>
            <button onClick={onViewMethodology} style={styles.quickButton}>Learn Methodology</button>
            <button onClick={scrollToWorkflow} style={styles.ghostButton}>See Asset Lenses</button>
          </div>
        </div>

        <div style={styles.homepageDecisionCard}>
          <div style={styles.metaLabel}>What the engine exposes</div>
          <div style={styles.homepageDecisionLine}>Allocation thesis under stress</div>
          <div style={styles.homepageDecisionLineMuted}>Final semantic verdict</div>
          <div style={styles.homepageDecisionLineMuted}>Why allocation could make sense</div>
          <div style={styles.homepageDecisionLineMuted}>Why allocation is blocked</div>
          <div style={styles.homepageDecisionLineMuted}>Evidence still needed</div>
          <div style={styles.homepageDecisionLineMuted}>What would change the verdict</div>
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
            <div style={styles.homepageKicker}>Engine Workflow</div>
            <h2 style={styles.homepageSectionTitle}>From asset identity to falsifiable verdict.</h2>
          </div>
          <div style={styles.homepageMuted}>Research requirements are generated from live gaps. They are not reviewed evidence.</div>
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
          <div style={styles.homepageKicker}>Institutional Questions</div>
          <h2 style={styles.homepageSectionTitle}>Built to ask the questions a score cannot answer.</h2>
          <div style={styles.homepageBoundaryList}>
            {institutionalQuestions.map((question) => (
              <BoundaryItem key={question} styles={styles}>{question}</BoundaryItem>
            ))}
          </div>
          <div style={styles.homepageBoundaryNote}>
            Current live outputs generate research requirements and evidence gaps. They do not claim every question is fully source-reviewed today.
          </div>
        </div>

        <div style={styles.homepagePanel}>
          <div style={styles.homepageKicker}>What ThesisCore Answers Today</div>
          <h2 style={styles.homepageSectionTitle}>A decision cockpit for allocation blockers, evidence gaps, and decision-change conditions.</h2>
          <p style={styles.homepageMuted}>
            Generated from live scoring, verdict semantics, evidence gaps, and research requirement fields when available. Research requirements are not reviewed evidence.
          </p>
          <div style={styles.homepageWorkflowGrid}>
            {currentAnswers.map((answer) => (
              <ValueCard key={answer.title} title={answer.title} text={answer.text} styles={styles} />
            ))}
          </div>
          <div style={styles.homepageBoundaryNote}>
            A source candidate becomes evidence only after review; report-only context does not affect live scoring.
          </div>
        </div>
      </div>

      <div style={styles.homepageTwoColumn}>
        <div style={styles.homepagePanel}>
          <div style={styles.homepageKicker}>Why Institutions Need This</div>
          <h2 style={styles.homepageSectionTitle}>The dangerous cases are usually not obvious.</h2>
          <div style={styles.homepageBoundaryList}>
            {institutionalRisks.map((risk) => (
              <BoundaryItem key={risk} styles={styles}>{risk}</BoundaryItem>
            ))}
          </div>
        </div>

        <div ref={workflowRef} style={styles.homepagePanel}>
          <div style={styles.homepageKicker}>Asset Coverage Doctrine</div>
          <h2 style={styles.homepageSectionTitle}>Different assets require different evidence.</h2>
          <p style={styles.homepageMuted}>
            A single generic score is not enough. ThesisCore routes assets through conservative lenses so wrong questions do not create false confidence.
          </p>
          <div style={styles.homepageTagRow}>
            {assetCoverage.map((item) => <span key={item} style={styles.homepageTag}>{item}</span>)}
          </div>
          <div style={styles.homepageBoundaryNote}>
            Category-aware does not mean source-complete. Low-confidence or ambiguous assets still fall back to conservative low-coverage treatment.
          </div>
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
            <BoundaryItem styles={styles}>ThesisCore tests allocation theses against evidence, blockers, and falsification rules.</BoundaryItem>
          </div>
        </div>

        <div style={styles.homepagePanel}>
          <div style={styles.homepageKicker}>Current vs Next Layers</div>
          <h2 style={styles.homepageSectionTitle}>Live decision support now. Source intelligence next.</h2>
          <div style={styles.homepageWorkflowGrid}>
            <div>
              <div style={styles.homepageMiniTitle}>Current live layer</div>
              <div style={styles.homepageTagRow}>
                {currentLive.map((item) => <span key={item} style={styles.homepageTag}>{item}</span>)}
              </div>
            </div>
            <div>
              <div style={styles.homepageMiniTitle}>Planned next layer</div>
              <div style={styles.homepageTagRow}>
                {plannedLayers.map((item) => <span key={item} style={styles.homepageTag}>{item}</span>)}
              </div>
            </div>
          </div>
          <div style={styles.homepageBoundaryNote}>
            Planned layers are not live scoring today. Source candidates, research requirements, and report-only context do not change the current verdict unless a future calibrated integration explicitly promotes them.
          </div>
        </div>
      </div>

      <div style={styles.homepageFuturePanel}>
        <div>
          <div style={styles.homepageKicker}>Planned Strategic Layer</div>
          <h2 style={styles.homepageSectionTitle}>Designed to extend into Hybrid Finance.</h2>
          <p style={styles.homepageSubtitleSmall}>
            ThesisCore is designed to extend into Hybrid Finance: tokenized funds, stablecoin settlement rails, RWA protocols, tokenized yield, and institutional DeFi infrastructure.
          </p>
        </div>
        <div style={styles.homepageFutureBoundary}>
          <div style={styles.homepageMiniTitle}>Boundary</div>
          <p style={styles.homepageMuted}>
            Planned strategic layer only. Not live scoring today. Not current source fetching. Not proof of legal claim, redemption, custody, or institutional rights. Hybrid Finance claims require source-backed evidence registry, claim review, freshness checks, contradiction checks, and calibrated scoring integration before they can affect verdicts.
          </p>
        </div>
      </div>
    </section>
  );
}
