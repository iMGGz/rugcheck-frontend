import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";

function Badge({ children, styles }) {
  return <span style={styles.engineBadge}>{children}</span>;
}

function MiniCard({ title, children, badge, styles }) {
  return (
    <div style={styles.engineMiniCard}>
      <div style={styles.timelineTitleRow}>
        <strong style={{ color: "#f4f7ff" }}>{title}</strong>
        {badge ? <span style={styles.engineMiniBadge}>{badge}</span> : null}
      </div>
      <div style={styles.engineMuted}>{children}</div>
    </div>
  );
}

function PipelineStep({ index, title, description, styles }) {
  return (
    <div style={styles.enginePipelineStep}>
      <div style={styles.enginePipelineIndex}>{index}</div>
      <div>
        <div style={styles.engineStepTitle}>{title}</div>
        <div style={styles.engineMuted}>{description}</div>
      </div>
    </div>
  );
}

function FlowLane({ items, styles }) {
  return (
    <div style={styles.engineFlowRow}>
      {items.map((item, index) => (
        <React.Fragment key={item.title}>
          <div style={styles.engineFlowNode}>
            <div style={styles.metaLabel}>{item.title}</div>
            <div style={styles.contextMuted}>{item.description}</div>
          </div>
          {index < items.length - 1 ? <div style={styles.engineFlowArrow}>-&gt;</div> : null}
        </React.Fragment>
      ))}
    </div>
  );
}

function RubricCard({ item, styles }) {
  return (
    <div style={styles.engineRubricCard}>
      <div style={styles.engineRubricTitle}>{item.title}</div>
      <SectionRow label="What matters" value={item.matters} styles={styles} />
      <SectionRow label="Common false positive" value={item.falsePositive} styles={styles} />
      <SectionRow label="Evidence required" value={item.evidence} styles={styles} />
    </div>
  );
}

export default function HowTheEngineWorksPage({ styles }) {
  const pipeline = [
    ["Asset Input", "Start with a symbol, project name, or contract. The engine resolves identity before reasoning."],
    ["Asset Classification", "Classify the asset so stablecoins, wrapped assets, DeFi tokens, infrastructure tokens, and memes are not judged by the same rubric."],
    ["Institutional Question Registry", "Defines the questions ThesisCore uses to test asset classes. Live per-question evidence mapping is only shown when that mapping is attached to the response."],
    ["Live Provider Evidence", "Use connected provider data and diagnostics where available. Provider gaps are surfaced, not hidden."],
    ["Evidence Directness / TDQ / Risk Signals", "Separate direct evidence from adjacent context, and separate protocol quality from tokenholder value capture."],
    ["Missing Evidence + Provider Gaps", "Expose what the engine cannot verify from available data."],
    ["Red Flags + Confidence Caps", "Where live cap/gate signals are attached, surface them. Legal, custody, redemption, reserve, and security gaps remain methodology-level cap candidates until source-backed evidence makes them scoring-active."],
    ["Decision Layer", "Translate score, evidence support, caps, and blockers into a decision posture."],
    ["Thesis Falsification Report", "Explain what must be true, what could break, the weakest link, and what would change the decision."],
    ["Source Queue / Manual Review", "Route missing or ambiguous claims into source-backed research workflows without making them scoring inputs."],
  ];

  const liveProviderCategories = [
    "market context",
    "DEX liquidity context",
    "protocol TVL / fee context",
    "contract/admin/security signals",
    "developer/provenance context",
    "provider diagnostics",
  ];

  const manualGaps = [
    "legal claim",
    "redemption",
    "custody",
    "reserve attestations",
    "tokenholder accrual",
    "institutional adoption quality",
    "deep concentration",
    "unlock schedules",
    "regulatory status",
  ];

  const guardrails = [
    "Market cap does not prove reserves.",
    "TVL does not prove tokenholder value capture.",
    "Fees do not prove token accrual.",
    "BTC strength does not prove WBTC custody quality.",
    "Stablecoin category does not prove redemption or legal clarity.",
    "Institutional narrative does not prove institutional adoption.",
    "Partnership announcement does not prove usage.",
    "High yield does not prove quality.",
    "Secondary liquidity does not prove redemption quality.",
    "Confidence does not mean evidence completeness.",
  ];

  const rubrics = [
    {
      title: "Bitcoin / Monetary Benchmark",
      matters: "survivability, monetary network quality, liquidity depth, custody access, and thesis role",
      falsePositive: "treating price momentum as institutional thesis durability",
      evidence: "liquidity, custody rails, network security, adoption quality, and stress behavior",
    },
    {
      title: "Ethereum / Settlement + Staking",
      matters: "settlement demand, fee market durability, staking/security economics, L2 leakage, and developer ecosystem",
      falsePositive: "assuming ecosystem activity automatically accrues to ETH holders",
      evidence: "fee burn, validator economics, settlement activity, and credible demand capture",
    },
    {
      title: "Payments / Settlement Tokens",
      matters: "real payment use, settlement role, liquidity, issuer or network dependency, and compliance risk",
      falsePositive: "mistaking transfer volume for economic capture",
      evidence: "settlement usage, counterparty quality, fee capture, liquidity, and legal constraints",
    },
    {
      title: "DeFi Lending",
      matters: "collateral quality, liquidation design, risk parameters, bad debt history, governance, and fee accrual",
      falsePositive: "TVL growth treated as tokenholder value",
      evidence: "revenue routing, risk controls, audits, governance actions, and tokenholder rights",
    },
    {
      title: "AMMs",
      matters: "volume quality, LP economics, fee switch status, governance, and tokenholder accrual",
      falsePositive: "protocol usage treated as token value capture",
      evidence: "fees, fee routing, governance proposals, liquidity durability, and MEV/competition context",
    },
    {
      title: "Infrastructure / Oracle / Compute",
      matters: "payer mapping, customer dependence, security role, token necessity, and accrual mechanics",
      falsePositive: "network importance treated as tokenholder value",
      evidence: "payments, customer usage, token utility, staking/security role, and revenue linkage",
    },
    {
      title: "Stablecoins",
      matters: "reserves, redemption, issuer quality, legal claim, custody, bankruptcy remoteness, and attestations",
      falsePositive: "market cap or peg history treated as reserve proof",
      evidence: "reserve reports, redemption terms, legal disclosures, issuer/custodian structure, and stress behavior",
    },
    {
      title: "Wrapped Assets / LSTs",
      matters: "custody, redeemability, wrapper controls, proof-of-reserves, slashing/bridge risk, and dependency stack",
      falsePositive: "underlying asset quality inherited automatically by the wrapper",
      evidence: "custodian process, redemption path, reserves, smart-contract/admin controls, and dependency evidence",
    },
    {
      title: "RWA / Tokenized Assets",
      matters: "underlying asset, legal claim, enforceability, issuer/custodian dependency, NAV tracking, and redemption",
      falsePositive: "tokenized announcement treated as institutional-grade asset quality",
      evidence: "off-chain documents, legal rights, custody/collateral controls, NAV, audits, and redemption mechanics",
    },
    {
      title: "Meme / Narrative Assets",
      matters: "liquidity durability, holder concentration, narrative persistence, insider risk, and downside support",
      falsePositive: "attention treated as fundamentals",
      evidence: "holder distribution, liquidity venues, unlock/insider risk, volatility, and narrative stress tests",
    },
    {
      title: "Exchange Tokens",
      matters: "fee utility, legal structure, issuer dependency, buyback/burn credibility, and platform risk",
      falsePositive: "exchange volume treated as enforceable tokenholder claim",
      evidence: "utility terms, revenue linkage, legal disclosures, issuer risk, and platform concentration",
    },
    {
      title: "Unknown / Low-Coverage Assets",
      matters: "identity, source authenticity, contract/security basics, liquidity, and reason for low coverage",
      falsePositive: "absence of negative evidence treated as safety",
      evidence: "verified identity, docs, source provenance, liquidity, contract controls, and manual review",
    },
  ];

  const hybridQuestions = [
    "Is the underlying asset real?",
    "Does the tokenholder have enforceable rights?",
    "Is redemption available?",
    "Is custody verifiable?",
    "Does AUM accrue to the token?",
    "Is yield real or subsidized?",
    "Is institutional usage measurable?",
    "What would falsify the thesis?",
  ];

  const hybridRules = [
    "Institutional narrative does not equal institutional adoption.",
    "Tokenized asset announcement does not equal tokenholder value capture.",
    "Protocol AUM does not imply token accrual.",
    "Secondary-market liquidity does not prove redemption quality.",
    "Stablecoin settlement volume does not automatically accrue value to a governance token.",
    "If legal claim is unclear, confidence must be capped.",
    "If redemption path is unclear, manual review is required.",
    "If issuer/custodian dependency is thesis-critical and unresolved, confidence must be capped.",
    "If tokenholders have no enforceable rights, Hybrid Finance narrative cannot produce Capital-Worthy verdict.",
    "If yield source is opaque, higher APY worsens risk rather than improving quality.",
    "If adoption is announcement-only, it increases attention, not verdict confidence.",
  ];

  return (
    <section style={styles.enginePageShell}>
      <div style={styles.engineHero}>
        <div>
          <div style={styles.engineKicker}>Methodology / How It Works</div>
          <h2 style={styles.engineTitle}>How ThesisCore Tests Digital Asset Allocation Theses</h2>
          <p style={styles.engineSubtitle}>
            ThesisCore does not predict price or generate AI picks. It tests whether a digital asset thesis survives evidence, missing data, contradictions, and asset-class-specific institutional due diligence.
          </p>
          <div style={styles.engineBadgeRow}>
            <Badge styles={styles}>Institutional due diligence</Badge>
            <Badge styles={styles}>Thesis falsification</Badge>
            <Badge styles={styles}>Evidence transparency</Badge>
            <Badge styles={styles}>False-positive discipline</Badge>
          </div>
        </div>
        <div style={styles.engineHeroCard}>
          <div style={styles.metaLabel}>Primary product sentence</div>
          <div style={styles.engineHeroStatement}>
            ThesisCore is an institutional due-diligence and thesis-falsification engine for digital assets.
          </div>
          <div style={styles.contextMuted}>Research support only. Not financial advice. No price prediction.</div>
        </div>
      </div>

      <div style={styles.engineTwoColumn}>
        <Card title="The Problem" subtitle="Why a score is not enough." styles={styles}>
          <ListBlock
            title="Research failure modes"
            items={[
              "Crypto research is often narrative-heavy, score-heavy, or price-driven.",
              "Protocols can succeed while tokens fail to capture value.",
              "Missing evidence is often hidden behind polished dashboards.",
              "Stablecoins, wrapped assets, and RWA assets require legal, custody, redemption, and attestation evidence.",
              "Institutions need auditability, not hype.",
            ]}
            emptyText=""
            color="#ffb020"
            styles={styles}
          />
        </Card>

        <Card title="What ThesisCore Is / Is Not" subtitle="Positioning boundary." styles={styles}>
          <div style={styles.engineGrid}>
            <MiniCard title="Is" badge="Engine" styles={styles}>
              Institutional due-diligence engine, thesis-falsification system, evidence operating system, and research support layer.
            </MiniCard>
            <MiniCard title="Is Not" badge="Boundary" styles={styles}>
              Price prediction, AI picks, generic screener, financial advice, or automatic truth engine.
            </MiniCard>
          </div>
        </Card>
      </div>

      <Card title="Engine Pipeline" subtitle="From asset input to falsification report." styles={styles}>
        <div style={styles.enginePipelineGrid}>
          {pipeline.map(([title, description], index) => (
            <PipelineStep
              key={title}
              index={String(index + 1).padStart(2, "0")}
              title={title}
              description={description}
              styles={styles}
            />
          ))}
        </div>
      </Card>

      <div style={styles.engineTwoColumn}>
        <Card title="Live Scoring Layer" subtitle="The only layer that affects the current live verdict." styles={styles}>
          <SectionRow label="Boundary" value="Only the live scoring layer affects the current live verdict." styles={styles} />
          <ListBlock
            title="Uses"
            items={[
              "connected live providers and deterministic rules",
              "market, protocol, security, and provider context where available",
              "Token Demand Quality, Evidence Directness, policy caps/gates, and decision layer where attached",
            ]}
            emptyText=""
            color="#2fd67b"
            styles={styles}
          />
        </Card>

        <Card title="Report-Only Evidence Layer" subtitle="Source-backed context that remains outside live scoring." styles={styles}>
          <SectionRow
            label="Boundary"
            value="Report-only evidence does not affect live scoring unless explicitly integrated in a future calibrated release."
            styles={styles}
          />
          <FlowLane
            styles={styles}
            items={[
              { title: "Manual Source Packet", description: "Source-backed report input." },
              { title: "Manual Source Mapping", description: "Maps claims to packet fields/questions." },
              { title: "Reviewed Evidence Item", description: "Reviewer-gated report object." },
              { title: "Report-Only Overlay", description: "Context only. Not scoring input." },
            ]}
          />
        </Card>
      </div>

      <Card title="Source Discovery / Manual Research Layer" subtitle="How hard institutional questions move into source-backed review." styles={styles}>
        <SectionRow label="Why it exists" value="Many institutional questions cannot be answered by free market APIs." styles={styles} />
        <ListBlock
          title="Examples requiring manual/source research"
          items={[
            "reserve attestations",
            "redemption terms",
            "legal claim",
            "custody agreements",
            "audit reports",
            "governance proposals",
            "tokenholder accrual",
            "fee switch status",
            "NAV / proof-of-reserves",
          ]}
          emptyText=""
          color="#9bd7ff"
          styles={styles}
        />
        <FlowLane
          styles={styles}
          items={[
            { title: "Source Candidate", description: "Not evidence. Requires review." },
            { title: "Manual Intake", description: "Authenticity, freshness, scope, contradiction checks." },
            { title: "ManualSourceEvidenceItem", description: "Report object after accepted intake gates." },
            { title: "Mapping", description: "Question/field alignment." },
            { title: "Report-Only Overlay", description: "Context only unless future integration approves it." },
          ]}
        />
        <div style={styles.engineNotice}>
          Source candidates are not evidence. Manual review is workflow, not automatic proof of failure.
        </div>
      </Card>

      <Card title="What The Engine Refuses To Infer" subtitle="False-positive discipline." styles={styles}>
        <div style={styles.engineDoctrineGrid}>
          {guardrails.map((item) => (
            <div key={item} style={styles.engineDoctrineCard}>{item}</div>
          ))}
        </div>
      </Card>

      <Card title="Asset-Class Specific Rubrics" subtitle="Different assets fail in different ways." styles={styles}>
        <div style={styles.engineRubricGrid}>
          {rubrics.map((item) => (
            <RubricCard key={item.title} item={item} styles={styles} />
          ))}
        </div>
      </Card>

      <div style={styles.engineTwoColumn}>
        <Card title="Thesis Falsification Report" subtitle="The report asks better allocation questions." styles={styles}>
          <ListBlock
            title="Decision questions"
            items={[
              "What is the thesis?",
              "What must be true?",
              "What could break it?",
              "What evidence supports it?",
              "What evidence is missing?",
              "What is the weakest link?",
              "What would change the decision?",
            ]}
            emptyText=""
            color="#9bd7ff"
            styles={styles}
          />
        </Card>

        <Card title="Scoring Transparency" subtitle="Every score should be explainable." styles={styles}>
          <ListBlock
            title="Each module should show"
            items={[
              "input used",
              "provider/source",
              "rule applied",
              "cap/gate applied",
              "reason",
              "whether it affects live scoring",
              "whether it is report-only",
              "whether it is candidate-only",
            ]}
            emptyText=""
            color="#2fd67b"
            styles={styles}
          />
        </Card>
      </div>

      <div style={styles.engineTwoColumn}>
        <Card title="Current Provider Strategy" subtitle="Transparent available data plus source-backed manual research." styles={styles}>
          <SectionRow
            label="Strategy"
            value="ThesisCore currently prioritizes transparent available provider data and source-backed manual research over opaque paid-provider dependency."
            styles={styles}
          />
          <ListBlock title="Provider categories" items={liveProviderCategories} emptyText="" color="#9bd7ff" styles={styles} />
          <ListBlock title="Gaps requiring source/manual research" items={manualGaps} emptyText="" color="#ffb020" styles={styles} />
        </Card>

        <Card title="Future Direction: Hybrid Finance Thesis Testing" subtitle="Planned strategic layer, not live scoring layer." styles={styles}>
          <div style={styles.engineFuturePanel}>
            <div style={styles.engineFutureTitle}>Hybrid Finance will be treated as a thesis to falsify, not a narrative to accept.</div>
            <p style={styles.engineMuted}>
              ThesisCore is designed to evolve from an asset analysis engine into an institutional thesis-testing platform. The future Hybrid Finance / Tokenized Institutional Assets layer will test macro theses around Bitcoin, tokenized real-world assets, stablecoin settlement, institutional blockchain infrastructure, and on-chain trading rails.
            </p>
          </div>
          <SectionRow
            label="Boundary"
            value="Planned strategic layer only. Not current live scoring, not a current registry, not current source fetching, and not provider behavior."
            styles={styles}
          />
          <ListBlock title="Future Hybrid questions" items={hybridQuestions} emptyText="" color="#9bd7ff" styles={styles} />
          <ListBlock title="Future hard rules" items={hybridRules} emptyText="" color="#ffb020" styles={styles} />
          <SectionRow
            label="Claim discipline"
            value="Future Hybrid Finance claims require publisher/source, date, freshness, review status, mapped thesis question, verification requirements, contradiction checks, and evidence requirements."
            styles={styles}
          />
        </Card>
      </div>

      <Card title="Disclaimers" subtitle="Boundary conditions." styles={styles}>
        <div style={styles.engineDoctrineGrid}>
          {[
            "Research support only.",
            "Not financial advice.",
            "No price prediction.",
            "Source evidence requires review.",
            "Report-only evidence does not affect scoring unless future calibrated integration occurs.",
            "Future Hybrid Finance layer is planned, not live.",
          ].map((item) => (
            <div key={item} style={styles.engineDoctrineCard}>{item}</div>
          ))}
        </div>
      </Card>
    </section>
  );
}
