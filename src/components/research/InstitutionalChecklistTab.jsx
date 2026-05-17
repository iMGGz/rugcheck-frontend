import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import {
  extractRenderableText,
  normalizeRenderableList,
  providerLabel,
  safeArray,
  safeObject,
  titleCase,
} from "./researchUtils";

function boundaryChip(styles, children) {
  return <span style={styles.sourceBoundaryChip}>{children}</span>;
}

function statusChip(styles, label, color = "#7dd3fc") {
  return (
    <span style={{ ...styles.riskChip, borderColor: color, color }}>
      {label}
    </span>
  );
}

function evidenceTag(styles, label) {
  return <span style={styles.checklistEvidenceTag}>{label}</span>;
}

function normalizeChecklistSignalStatus(value) {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("provider") || raw.includes("gap") || raw.includes("unavailable")) {
    return "Provider Gap Possible";
  }
  if (raw.includes("review")) {
    return "Needs Source Review";
  }
  if (raw.includes("not attached")) {
    return "Not Attached To Live Mapping";
  }
  if (raw.includes("proxy")) {
    return "Methodology Question";
  }
  if (raw.includes("present") || raw.includes("detected")) {
    return "Live Signal Present";
  }
  return "Live Signal Present";
}

function dedupeSignals(signals) {
  const seen = new Set();
  return signals.filter((signal) => {
    const key = `${signal.label}-${signal.description}-${signal.source}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildChecklistLiveSignals({ model, sourceStatus, providerDiagnostics, providerHealth, evidenceStatusProxy }) {
  const missing = normalizeRenderableList(model?.missingCritical).map((entry) => ({
    label: "Missing critical evidence",
    description: entry,
    source: "decisionModel.missingCritical",
    status: "Needs Source Review",
    color: "#ffb020",
  }));
  const required = normalizeRenderableList(model?.requiredConditions).map((entry) => ({
    label: "Required condition",
    description: entry,
    source: "decisionModel.requiredConditions",
    status: "Live Signal Present",
    color: "#7dd3fc",
  }));
  const alerts = normalizeRenderableList(model?.auditAlerts).map((entry) => ({
    label: "Audit alert",
    description: entry,
    source: "decisionModel.auditAlerts",
    status: "Needs Source Review",
    color: "#ff6b6b",
  }));
  const sourceSignals = Object.entries(safeObject(sourceStatus))
    .filter(([, value]) => ["partial", "modeled", "weak", "unsupported", "skipped", "unavailable", "missing"].includes(String(value).toLowerCase()))
    .map(([section, value]) => ({
      label: providerLabel(section),
      description: `Live source status is ${titleCase(value)}. This is not question-level evidence support.`,
      source: "sourceStatus",
      status: "Provider Gap Possible",
      color: "#ffb020",
    }));
  const providerSignals = safeArray(providerDiagnostics)
    .filter((entry) => (
      entry.status === "failure" ||
      entry.status === "skipped" ||
      ["missing", "unavailable", "unsupported", "weak", "partial"].includes(entry.coverage || "")
    ))
    .map((entry) => ({
      label: providerLabel(entry.provider || entry.source || entry.section || "provider"),
      description: entry.reason || "Provider/source context is partial or unavailable in the live response.",
      source: "meta.providerDiagnostics",
      status: entry.status === "failure" ? "Provider Gap Possible" : "Needs Source Review",
      color: entry.status === "failure" ? "#ff6b6b" : "#ffb020",
    }));
  const proxySignals = safeArray(evidenceStatusProxy?.items)
    .filter((item) => ["provider_gap", "contradiction_audit", "manual_review_signal", "missing_critical", "partial_indirect"].includes(item.key))
    .map((item) => ({
      label: item.label,
      description: item.description,
      source: item.sourceLabel || "deriveEvidenceStatusProxy",
      status: normalizeChecklistSignalStatus(item.valueLabel),
      color: item.severity === "critical" ? "#ff6b6b" : "#ffb020",
    }));
  const providerHealthSignals = providerHealth?.summary ? [{
    label: "Provider health",
    description: extractRenderableText(providerHealth.summary, "Provider health context is attached to the live UI."),
    source: "providerHealth",
    status: "Live Signal Present",
    color: "#7dd3fc",
  }] : [];

  return dedupeSignals([
    ...missing,
    ...required,
    ...alerts,
    ...sourceSignals,
    ...providerSignals,
    ...proxySignals,
    ...providerHealthSignals,
  ]).slice(0, 12);
}

function matchesSignal(question, group, signal) {
  const haystack = `${question.question} ${question.why} ${question.evidence.join(" ")} ${group.title} ${signal.label} ${signal.description}`.toLowerCase();
  return safeArray(question.keywords || group.keywords).some((keyword) => haystack.includes(keyword));
}

function findSignal(question, group, signals) {
  return signals.find((signal) => matchesSignal(question, group, signal));
}

function baseGroups() {
  return [
    {
      title: "Asset Identity & Classification",
      subtitle: "What is being tested before any thesis can be evaluated.",
      keywords: ["asset", "identity", "classification", "category", "token", "network", "role"],
      questions: [
        {
          id: "identity-01",
          question: "What type of asset is this?",
          why: "The rubric changes materially across stablecoins, wrapped assets, DeFi, infrastructure, and narrative assets.",
          evidence: ["asset metadata", "official docs", "category/provider context"],
        },
        {
          id: "identity-02",
          question: "What role does it claim to play?",
          why: "A settlement asset, utility token, governance token, and wrapper should not be assessed through the same thesis.",
          evidence: ["official docs", "token role description", "project disclosures"],
        },
        {
          id: "identity-03",
          question: "Is the investable token the same as the useful network or product?",
          why: "Protocol usefulness does not automatically become tokenholder value.",
          evidence: ["tokenomics", "utility disclosures", "provider context"],
          keywords: ["tokenholder", "utility", "protocol", "value"],
        },
      ],
    },
    {
      title: "Token Demand / Value Capture",
      subtitle: "Whether usage creates demand for the investable token.",
      keywords: ["demand", "accrual", "fee", "revenue", "tokenholder", "aum", "tvl", "usage"],
      rule: "Protocol usage, TVL, or AUM must not be treated as tokenholder value capture without direct evidence.",
      questions: [
        {
          id: "tdq-01",
          question: "Does usage create token demand?",
          why: "A useful product can still leave the token economically weak.",
          evidence: ["tokenomics", "staking/burn/buyback mechanics", "usage-to-token linkage"],
        },
        {
          id: "tdq-02",
          question: "Does protocol growth accrue to tokenholders?",
          why: "AUM, TVL, and usage are not enough unless value capture is direct.",
          evidence: ["fee routing", "governance docs", "protocol financials"],
        },
        {
          id: "tdq-03",
          question: "Are fees or revenue captured by the token or elsewhere?",
          why: "Fees can accrue to LPs, validators, sequencers, teams, or users rather than tokenholders.",
          evidence: ["protocol financials", "fee switch status", "revenue distribution docs"],
        },
      ],
    },
    {
      title: "Evidence Quality / Source Directness",
      subtitle: "Whether claims are directly supported or only adjacent context.",
      keywords: ["evidence", "source", "provider", "diagnostic", "direct", "manual", "review"],
      rule: "Live provider availability does not equal question-level support.",
      questions: [
        {
          id: "evidence-01",
          question: "Is evidence direct or indirect?",
          why: "Adjacent context should not be promoted into institutional support.",
          evidence: ["Evidence Directness", "provider diagnostics", "source provenance"],
        },
        {
          id: "evidence-02",
          question: "Are claims backed by provider or source evidence?",
          why: "The UI must distinguish live signals, report-only evidence, and candidate-only sources.",
          evidence: ["provider diagnostics", "direct source docs", "reviewed evidence"],
        },
        {
          id: "evidence-03",
          question: "Which claims require manual review?",
          why: "Unresolved evidence should create review leads rather than fake answers.",
          evidence: ["manual review signals", "missing critical evidence", "audit alerts"],
        },
      ],
    },
    {
      title: "Risk / Control / Governance",
      subtitle: "Whether controls or dependencies can alter the thesis.",
      keywords: ["admin", "governance", "contract", "security", "audit", "dependency", "control", "freeze", "pause", "upgrade"],
      questions: [
        {
          id: "risk-01",
          question: "Can admins, governance, or contracts alter economics?",
          why: "Control rights can override apparent economics or create tail risk.",
          evidence: ["contract risk flags", "governance docs", "admin control disclosures"],
        },
        {
          id: "risk-02",
          question: "Are there freeze, pause, or upgrade controls?",
          why: "Control surfaces affect custody, transferability, and confidence boundaries.",
          evidence: ["contract risk flags", "security docs", "audit reports"],
        },
        {
          id: "risk-03",
          question: "Are major dependencies unresolved?",
          why: "Custodian, oracle, bridge, issuer, or governance dependencies can be thesis-critical.",
          evidence: ["dependency docs", "audit reports", "source-backed manual review"],
        },
      ],
    },
    {
      title: "Liquidity / Exit / Market Structure",
      subtitle: "Whether apparent liquidity can support institutional execution.",
      keywords: ["liquidity", "volume", "venue", "exit", "market", "depth", "slippage"],
      rule: "Volume alone does not prove institutional exit depth.",
      questions: [
        {
          id: "liquidity-01",
          question: "Can the asset be exited in size?",
          why: "Headline liquidity can fail under stress or institutional order size.",
          evidence: ["volume/liquidity context", "depth/slippage where available", "venue data"],
        },
        {
          id: "liquidity-02",
          question: "Is liquidity durable or venue-concentrated?",
          why: "Concentrated liquidity can disappear or become unavailable when needed.",
          evidence: ["DEX/CEX venue data", "liquidity distribution", "stress liquidity evidence"],
        },
        {
          id: "liquidity-03",
          question: "Does volume imply real execution depth?",
          why: "Volume can be noisy, wash-like, or too shallow to support institutional exits.",
          evidence: ["depth/slippage", "venue quality", "stress execution evidence"],
        },
      ],
    },
  ];
}

function assetSpecificGroup(model) {
  const raw = `${model?.assetClassLabel || ""} ${model?.assetFramingLabel || ""} ${model?.assetClass || ""} ${model?.assetSubtype || ""} ${model?.primarySector || ""}`.toLowerCase();
  if (raw.includes("stable") || raw.includes("settlement")) {
    return {
      title: "Asset-Class Specific Requirements",
      subtitle: "Stablecoin / settlement asset lens. Methodology only unless mapped evidence is attached.",
      keywords: ["stable", "reserve", "redemption", "issuer", "custody", "legal", "attestation"],
      rule: "Stablecoin category does not prove reserves, redemption, or legal clarity.",
      questions: [
        { id: "stable-01", question: "Are reserves independently attested?", why: "Reserve claims require direct, current, source-backed evidence.", evidence: ["reserve attestations", "reserve composition", "publisher/freshness"] },
        { id: "stable-02", question: "Is redemption available and to whom?", why: "Peg history is not the same as enforceable redemption access.", evidence: ["redemption terms", "issuer disclosures", "eligibility terms"] },
        { id: "stable-03", question: "What legal claim does the holder have?", why: "Legal clarity affects confidence and verdict boundaries.", evidence: ["legal disclosures", "issuer/custodian structure", "bankruptcy remoteness"] },
        { id: "stable-04", question: "What issuer or custodian dependencies exist?", why: "Issuer and custodian dependencies can be primary thesis risks.", evidence: ["custody agreements", "counterparty disclosures", "risk reports"] },
      ],
    };
  }
  if (raw.includes("wrapped") || raw.includes("lst") || raw.includes("liquid staking") || raw.includes("dependency")) {
    return {
      title: "Asset-Class Specific Requirements",
      subtitle: "Wrapped asset / LST dependency lens. Methodology only unless mapped evidence is attached.",
      keywords: ["wrapped", "backing", "custody", "redeem", "lst", "bridge", "slashing"],
      rule: "A wrapped asset does not inherit underlying asset quality automatically. Custody, backing, and redeemability must be proven.",
      questions: [
        { id: "wrapped-01", question: "Is backing or custody independently verifiable?", why: "The wrapper has its own dependency stack.", evidence: ["proof-of-reserves", "custodian process", "wrapper docs"] },
        { id: "wrapped-02", question: "Can holders redeem?", why: "Redeemability is separate from market liquidity.", evidence: ["redemption path", "merchant/custodian process", "terms"] },
        { id: "wrapped-03", question: "Does the wrapped asset inherit underlying quality?", why: "Underlying asset quality is not automatic wrapper quality.", evidence: ["custody controls", "smart-contract/admin controls", "dependency evidence"] },
      ],
    };
  }
  if (raw.includes("defi") || raw.includes("amm") || raw.includes("lending") || raw.includes("yield")) {
    return {
      title: "Asset-Class Specific Requirements",
      subtitle: "DeFi / AMM / lending lens. Methodology only unless mapped evidence is attached.",
      keywords: ["defi", "amm", "lending", "tvl", "fee", "governance", "admin", "accrual"],
      rule: "TVL and usage do not prove tokenholder value capture.",
      questions: [
        { id: "defi-01", question: "Does TVL create tokenholder value?", why: "TVL may benefit users or LPs without accruing to the token.", evidence: ["fee routing", "tokenholder rights", "protocol financials"] },
        { id: "defi-02", question: "Is the fee switch active or theoretical?", why: "Optional economics should not be treated as current cash flow.", evidence: ["governance docs", "fee switch status", "revenue routing"] },
        { id: "defi-03", question: "Are governance or admin risks material?", why: "Admin controls can alter economics, collateral, or user risk.", evidence: ["governance docs", "admin controls", "audit reports"] },
      ],
    };
  }
  if (raw.includes("infrastructure") || raw.includes("oracle") || raw.includes("compute")) {
    return {
      title: "Asset-Class Specific Requirements",
      subtitle: "Infrastructure / oracle / compute lens. Methodology only unless mapped evidence is attached.",
      keywords: ["infrastructure", "oracle", "compute", "payer", "staking", "security", "usage", "accrual"],
      rule: "Network importance does not automatically become tokenholder accrual.",
      questions: [
        { id: "infra-01", question: "Does network usage accrue to tokenholders?", why: "Critical infrastructure can still have weak token capture.", evidence: ["payer mapping", "customer/payment evidence", "revenue linkage"] },
        { id: "infra-02", question: "Is payer mapping clear?", why: "Demand should be observable and connected to the token thesis.", evidence: ["customer usage", "payment docs", "provider/source evidence"] },
        { id: "infra-03", question: "Is staking or security role economically necessary?", why: "Utility claims need evidence of economic necessity.", evidence: ["staking docs", "security role", "slashing/service-level guarantees"] },
      ],
    };
  }
  if (raw.includes("meme") || raw.includes("narrative")) {
    return {
      title: "Asset-Class Specific Requirements",
      subtitle: "Meme / narrative lens. Methodology only unless mapped evidence is attached.",
      keywords: ["meme", "narrative", "liquidity", "holder", "concentration", "reflexivity"],
      rule: "Attention does not prove durable fundamentals.",
      questions: [
        { id: "meme-01", question: "Is liquidity durable?", why: "Narrative liquidity can disappear quickly.", evidence: ["venue liquidity", "holder distribution", "stress behavior"] },
        { id: "meme-02", question: "Is holder concentration high?", why: "Insider or whale concentration can dominate risk.", evidence: ["holder data", "unlock/insider risk", "source review"] },
        { id: "meme-03", question: "What would invalidate the narrative?", why: "Narrative assets need explicit falsification triggers.", evidence: ["liquidity deterioration", "attention decay", "distribution risk"] },
      ],
    };
  }
  if (raw.includes("rwa") || raw.includes("tokenized") || raw.includes("real world") || raw.includes("hybrid")) {
    return {
      title: "Asset-Class Specific Requirements",
      subtitle: "RWA / Hybrid Finance / tokenized asset lens. Future-compatible methodology only unless live fields classify it.",
      keywords: ["rwa", "tokenized", "hybrid", "legal", "custody", "redemption", "aum", "yield", "institutional"],
      rule: "Hybrid/RWA questions are methodology/future-compatible only unless explicit live fields classify the asset that way.",
      questions: [
        { id: "rwa-01", question: "Is the underlying asset identifiable?", why: "Tokenized claims need a real, traceable underlying asset.", evidence: ["issuer docs", "asset description", "custody/collateral records"] },
        { id: "rwa-02", question: "Does tokenholder have enforceable rights?", why: "No enforceable rights means the narrative cannot support a capital-worthy verdict.", evidence: ["legal claim", "fund/security terms", "jurisdictional access"] },
        { id: "rwa-03", question: "Is redemption clear?", why: "Secondary liquidity is not proof of redemption quality.", evidence: ["redemption path", "NAV mechanics", "issuer/custodian terms"] },
        { id: "rwa-04", question: "Does AUM or tokenization activity accrue to tokenholders?", why: "Protocol AUM does not imply token accrual.", evidence: ["fee routing", "tokenholder rights", "cash-flow evidence"] },
      ],
    };
  }
  return {
    title: "Asset-Class Specific Requirements",
    subtitle: "General asset-class lens. More specific checklist rows appear when asset classification or report mapping is attached.",
    keywords: ["asset", "specific", "classification", "source", "review"],
    rule: "Hybrid/RWA, stablecoin, wrapped, DeFi, infrastructure, and narrative lenses remain methodology/report-layer context unless attached.",
    questions: [
      { id: "general-01", question: "Which asset-class lens applies?", why: "Checklist precision depends on the asset classification and report-layer mapping.", evidence: ["asset classification", "official docs", "provider/source context"] },
      { id: "general-02", question: "Which claims need source-backed review?", why: "Low coverage should lead to review leads, not fake question answers.", evidence: ["missing evidence", "provider diagnostics", "manual review signals"] },
      { id: "general-03", question: "Which future specialized lens could apply?", why: "Stablecoin, wrapped, DeFi, infrastructure, RWA, and meme lenses have distinct false-positive patterns.", evidence: ["classification evidence", "source-backed documents", "report endpoint mapping"] },
    ],
  };
}

function ChecklistQuestionRow({ group, question, signal, styles }) {
  const statusItems = [
    { label: "Methodology Question", color: "#7dd3fc" },
    { label: signal ? "Live Signal Present" : "Not Attached To Live Mapping", color: signal ? "#ffb020" : "#8a94a6" },
    { label: "Needs Source Review", color: "#ffb020" },
    { label: "Report-Layer Only", color: "#9bd7ff" },
  ];

  return (
    <div style={styles.checklistRow}>
      <div style={styles.checklistQuestionHeader}>
        <div>
          <div style={styles.metaLabel}>{question.id}</div>
        <div style={styles.checklistQuestionText}>{question.question}</div>
      </div>
      <div style={styles.checklistStatusStack}>
          {statusItems.map((item) => (
            <React.Fragment key={item.label}>
              {statusChip(styles, item.label, item.color)}
            </React.Fragment>
          ))}
      </div>
      </div>

      <div style={styles.checklistSlotGrid}>
        <SectionRow label="Why it matters" value={question.why} styles={styles} />
        <SectionRow label="Future answer/status slot" value="Not attached to live mapping." styles={styles} />
        <SectionRow
          label="Related live review signal"
          value={signal ? `${signal.status}: ${signal.description}` : "No question-level live signal is attached. Do not infer an answer."}
          styles={styles}
        />
        <SectionRow label="Source / research requirement" value="Source trace and manual research status appear here only when attached by a live or report endpoint." styles={styles} />
        <SectionRow label="Verdict / scoring boundary" value="Methodology/report-layer only. No scoring impact unless future calibrated integration explicitly attaches it." styles={styles} />
      </div>

      <div style={styles.checklistEvidenceTags}>
        {question.evidence.map((item) => (
          <React.Fragment key={item}>
            {evidenceTag(styles, item)}
          </React.Fragment>
        ))}
        {group.rule ? evidenceTag(styles, "Hard rule applies") : null}
      </div>
    </div>
  );
}

function ChecklistGroup({ group, signals, styles }) {
  return (
    <Card title={group.title} subtitle={group.subtitle} styles={styles}>
      {group.rule ? (
        <div style={styles.engineNotice}>{group.rule}</div>
      ) : null}
      <div style={styles.checklistQuestionList}>
        {group.questions.map((question) => (
          <ChecklistQuestionRow
            key={question.id}
            group={group}
            question={question}
            signal={findSignal(question, group, signals)}
            styles={styles}
          />
        ))}
      </div>
    </Card>
  );
}

export default function InstitutionalChecklistTab({
  model,
  sourceStatus,
  providerDiagnostics,
  providerHealth,
  evidenceStatusProxy,
  styles,
}) {
  const signals = buildChecklistLiveSignals({ model, sourceStatus, providerDiagnostics, providerHealth, evidenceStatusProxy });
  const groups = [...baseGroups(), assetSpecificGroup(model)];
  const bridgeSteps = [
    "Question",
    "Answer/status",
    "Evidence present",
    "Evidence missing",
    "Source trace",
    "Manual review",
    "Scoring/report boundary",
    "Verdict impact",
  ];

  return (
    <div style={styles.institutionalChecklistShell}>
      <Card title="Institutional Checklist" subtitle="Methodology / Report Layer" styles={styles}>
        <div style={styles.sourceBoundaryStrip}>
          {boundaryChip(styles, "Live per-question evidence mapping is only shown when attached to the response.")}
          {boundaryChip(styles, "This checklist is methodology/report-layer guidance, not a fake evidence map.")}
          {boundaryChip(styles, "Missing evidence is a verification gap, not automatic proof of failure.")}
          {boundaryChip(styles, "Report-only source evidence does not affect live scoring unless future calibrated integration occurs.")}
        </div>
        <SectionRow
          label="Registry boundary"
          value="The Institutional Question Registry defines the questions ThesisCore uses to test asset classes. Question-level answers, evidence statuses, source traces, and verdict impacts will appear here only when attached by a live or report endpoint."
          styles={styles}
        />
        <SectionRow
          label="Current asset lens"
          value={`${model?.assetClassLabel || "Asset class unavailable"} - ${model?.assetFramingLabel || "framing unavailable"}`}
          styles={styles}
        />
      </Card>

      <Card title="Engine-to-UI Bridge" subtitle="Future connection between questions, evidence, sources, and verdict impact." styles={styles}>
        <div style={styles.checklistBridgeGrid}>
          {bridgeSteps.map((step) => (
            <div key={step} style={styles.checklistBridgeNode}>{step}</div>
          ))}
        </div>
        <div style={styles.engineNotice}>
          This tab is designed to become the bridge between ThesisCore's institutional question engine and the user-facing evidence map. Until question-level mapping is attached, it displays methodology questions and safe live-review signals only.
        </div>
      </Card>

      <div style={styles.advancedGrid}>
        <Card title="Safe Live-Response Review Signals" subtitle="Qualitative signals only. Not question-level answers, not counts." styles={styles}>
          {signals.length ? signals.slice(0, 6).map((signal, index) => (
            <div key={`${signal.source}-${signal.label}-${index}`} style={styles.reviewSignalCard}>
              <div style={styles.timelineTitleRow}>
                <strong style={{ color: "#f4f7ff" }}>{signal.label}</strong>
                {statusChip(styles, signal.status, signal.color)}
              </div>
              <div style={styles.timelineSummary}>{signal.description}</div>
              <div style={styles.timelineMeta}>{signal.source} - live review signal, not checklist support</div>
            </div>
          )) : (
            <p style={styles.timelineEmptyText}>No checklist-relevant live review signals were surfaced. Do not infer question-level answers.</p>
          )}
        </Card>

        <Card title="Attachment Status" subtitle="What is intentionally not shown yet." styles={styles}>
          <ListBlock
            title="Not attached to this live response"
            items={[
              "question-level answers",
              "question-level evidence statuses",
              "question-level source traces",
              "manual-source overlay status",
              "verdict/confidence impact by question",
            ]}
            emptyText=""
            color="#ffb020"
            styles={styles}
          />
        </Card>
      </div>

      {groups.map((group) => (
        <ChecklistGroup key={group.title} group={group} signals={signals} styles={styles} />
      ))}
    </div>
  );
}
