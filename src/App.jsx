import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const QUICK_SEARCHES = ["ETH", "BTC", "PEPE", "FLR", "MOONRUG"];
const RESEARCH_TABS = [
  { key: "overview", label: "Overview" },
  { key: "market", label: "Market Structure" },
  { key: "tokenomics", label: "Tokenomics" },
  { key: "team", label: "Team & Governance" },
  { key: "technical", label: "Technical" },
  { key: "risks", label: "Risk Matrix" },
  { key: "verdict", label: "Final Verdict" },
];

function formatUsd(value) {
  if (value === null || value === undefined || value === "") return "Unknown";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: num >= 100 ? 0 : 6 })}`;
}

function formatCompact(value) {
  if (value === null || value === undefined || value === "") return "Unknown";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(num);
}

function formatPct(value, digits = 2) {
  if (value === null || value === undefined || value === "") return "Unknown";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toFixed(digits)}%`;
}

function analysisColor(score) {
  if (score >= 75) return "#22c55e";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
}

function verdictColor(verdict) {
  if (verdict === "HIGH RISK") return "#ef4444";
  if (verdict === "CAUTION") return "#f59e0b";
  return "#22c55e";
}

function sourceColor(status) {
  if (status === "live") return "#22c55e";
  if (status === "partial" || status === "modeled") return "#93c5fd";
  if (status === "unsupported" || status === "skipped") return "#f59e0b";
  if (status === "unavailable") return "#94a3b8";
  return "#ef4444";
}

function confidenceColor(level) {
  if (level === "high") return "#22c55e";
  if (level === "medium") return "#f59e0b";
  return "#ef4444";
}

function confidenceLabel(level) {
  if (level === "high") return "High confidence";
  if (level === "medium") return "Medium confidence";
  return "Low confidence";
}

function ProgressBar({ score }) {
  const safe = Math.max(0, Math.min(100, Number(score || 0)));
  return (
    <div style={styles.progressOuter}>
      <div style={{ ...styles.progressInner, width: `${safe}%`, background: analysisColor(safe) }} />
    </div>
  );
}

function Box({ label, value, tone }) {
  return (
    <div style={styles.box}>
      <div style={styles.boxLabel}>{label}</div>
      <div style={styles.boxValue}>{value}</div>
      {tone ? <div style={styles.boxTone}>{tone}</div> : null}
    </div>
  );
}

function SectionRow({ label, value }) {
  return (
    <div style={styles.sectionRow}>
      <div style={styles.sectionRowLabel}>{label}</div>
      <div style={styles.sectionRowValue}>{value}</div>
    </div>
  );
}

function ListBlock({ title, items, emptyText, color = "#cbd5e1" }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ color, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {items && items.length ? (
        items.map((item) => (
          <p key={item} style={{ color, margin: "6px 0", lineHeight: 1.7 }}>
            • {item}
          </p>
        ))
      ) : (
        <p style={{ color: "#94a3b8" }}>{emptyText}</p>
      )}
    </div>
  );
}

function TabButton({ active, label, onClick }) {
  return (
    <button onClick={onClick} style={{ ...styles.tabButton, ...(active ? styles.tabButtonActive : {}) }}>
      {label}
    </button>
  );
}

function ScorePill({ label, score }) {
  return <div style={{ ...styles.scorePill, borderColor: analysisColor(score), color: analysisColor(score) }}>{label}: {score}/100</div>;
}

function Card({ title, score, children, subtitle }) {
  return (
    <div style={styles.cardWide}>
      <div style={styles.cardHeader}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {subtitle ? <div style={{ color: "#94a3b8", marginTop: 4 }}>{subtitle}</div> : null}
        </div>
        {score !== undefined ? <span style={{ color: analysisColor(score), fontWeight: 800 }}>{score}/100</span> : null}
      </div>
      {score !== undefined ? <ProgressBar score={score} /> : null}
      {children}
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("ETH");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [backendStatus, setBackendStatus] = useState("unknown");

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      setBackendStatus(response.ok ? "online" : "degraded");
    } catch {
      setBackendStatus("offline");
    }
  }, []);

  const analyze = useCallback(async (nextQuery, mode = "full") => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nextQuery, mode }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message || "Analysis failed");
      }
      setData(json);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    analyze("ETH", "full");
  }, [analyze, checkHealth]);

  const asset = data?.asset;
  const marketData = data?.marketData;
  const security = data?.security;
  const scores = data?.scores;
  const aiReport = data?.aiReport;
  const sourceStatus = data?.sourceStatus;
  const confidence = data?.confidence;
  const warnings = data?.warnings || [];

  const riskVerdict = useMemo(() => {
    if (!scores) return "UNKNOWN";
    if (scores.fragilityScore >= 70 || scores.securityScore <= 20) return "HIGH RISK";
    if (scores.overallScore < 55) return "CAUTION";
    return "SAFE";
  }, [scores]);

  function renderOverview() {
    return (
      <div style={styles.advancedGrid}>
        <Card title="AI agent verdict" score={scores?.overallScore} subtitle={aiReport?.finalVerdict?.rating || "Backend-generated report"}>
          <SectionRow label="Recommendation" value={aiReport?.finalVerdict?.recommendation || "Unavailable"} />
          <SectionRow label="Summary" value={aiReport?.finalVerdict?.summary || "Unavailable"} />
          <SectionRow label="Project overview" value={aiReport?.projectOverview || "Unavailable"} />
          <ListBlock title="Warnings" items={warnings} emptyText="No warnings returned." color="#fde68a" />
        </Card>

        <Card title="Confidence" score={confidence?.score} subtitle={confidence ? confidenceLabel(confidence.level) : "Assessment unavailable"}>
          <SectionRow label="Summary" value={confidence?.summary || "Unavailable"} />
          <SectionRow label="Market data status" value={confidence?.marketDataStatus || "Unknown"} />
          <ListBlock title="Why this confidence level" items={confidence?.reasons || []} emptyText="No confidence notes available." color="#93c5fd" />
        </Card>

        <Card title="Source coverage" subtitle="Live vs partial vs unavailable">
          {sourceStatus ? Object.entries(sourceStatus).map(([key, value]) => (
            <div key={key} style={styles.scoreRow}>
              <div style={{ color: "#cbd5e1", textTransform: "capitalize" }}>{key}</div>
              <div style={{ color: sourceColor(value), fontWeight: 800 }}>{value}</div>
            </div>
          )) : <p style={{ color: "#94a3b8" }}>No source status available.</p>}
        </Card>

        <Card title="Score breakdown" subtitle="Calculated in backend">
          {scores ? (
            [
              ["Overall", scores.overallScore],
              ["Liquidity", scores.liquidityScore],
              ["Tokenomics", scores.tokenomicsScore],
              ["Governance", scores.governanceScore],
              ["Security", scores.securityScore],
              ["Technical", scores.technicalScore],
              ["Fragility", 100 - scores.fragilityScore],
            ].map(([label, score]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={styles.scoreRow}>
                  <div style={{ color: "#cbd5e1" }}>{label}</div>
                  <div style={{ color: analysisColor(score), fontWeight: 800 }}>{score}/100</div>
                </div>
                <ProgressBar score={score} />
              </div>
            ))
          ) : <p style={{ color: "#94a3b8" }}>Scores unavailable.</p>}
        </Card>
      </div>
    );
  }

  function renderMarket() {
    return (
      <div style={styles.advancedGridSingle}>
        <Card title="Market Structure" score={aiReport?.marketStructure?.score} subtitle={aiReport?.marketStructure?.marketCapTier || "Market analysis"}>
          <SectionRow label="Summary" value={aiReport?.marketStructure?.summary || "Unavailable"} />
          <SectionRow label="Liquidity assessment" value={aiReport?.marketStructure?.liquidityAssessment || "Unavailable"} />
          <SectionRow label="Volume quality" value={aiReport?.marketStructure?.volumeQuality || "Unavailable"} />
          <div style={styles.inlineGrid}>
            <Box label="Price" value={formatUsd(marketData?.priceUsd)} />
            <Box label="24h Volume" value={formatUsd(marketData?.volume24h)} />
            <Box label="Market Cap" value={formatUsd(marketData?.marketCap)} />
            <Box label="FDV" value={formatUsd(marketData?.fdv)} />
            <Box label="DEX Liquidity" value={formatUsd(marketData?.dexLiquidityUsd)} />
            <Box label="Turnover Ratio" value={marketData?.turnoverRatio ?? "Unknown"} />
          </div>
          <ListBlock title="Top exchanges" items={marketData?.topExchanges || []} emptyText="No exchange data available." color="#93c5fd" />
        </Card>
      </div>
    );
  }

  function renderTokenomics() {
    return (
      <div style={styles.advancedGridSingle}>
        <Card title="Tokenomics" score={aiReport?.tokenomics?.score} subtitle={aiReport?.tokenomics?.inflationRisk || "Tokenomics analysis"}>
          <SectionRow label="Summary" value={aiReport?.tokenomics?.summary || "Unavailable"} />
          <SectionRow label="Supply pressure" value={aiReport?.tokenomics?.supplyPressure || "Unavailable"} />
          <SectionRow label="MCAP / FDV view" value={aiReport?.tokenomics?.mcapToFdvRatio || "Unavailable"} />
          <div style={styles.inlineGrid}>
            <Box label="Circulating Supply" value={formatCompact(marketData?.circulatingSupply)} />
            <Box label="Total Supply" value={formatCompact(marketData?.totalSupply)} />
            <Box label="Market Cap" value={formatUsd(marketData?.marketCap)} />
            <Box label="FDV" value={formatUsd(marketData?.fdv)} />
          </div>
          <ListBlock
            title="Manual checks still needed"
            items={[
              "Exact vesting and unlock schedule.",
              "Team / treasury allocation.",
              "Value accrual mechanism from primary documentation.",
            ]}
            emptyText=""
            color="#93c5fd"
          />
        </Card>
      </div>
    );
  }

  function renderTeam() {
    return (
      <div style={styles.advancedGridSingle}>
        <Card title="Team & Governance" score={aiReport?.teamGovernance?.score} subtitle={aiReport?.teamGovernance?.dataAvailability || "Governance analysis"}>
          <SectionRow label="Summary" value={aiReport?.teamGovernance?.summary || "Unavailable"} />
          <SectionRow label="Category" value={asset?.category || "Unknown"} />
          <SectionRow label="Narrative" value={asset?.narrative || "Unknown"} />
          <ListBlock
            title="Current limitation"
            items={[
              "This backend version does not yet ingest real founder / VC / team datasets.",
              "Governance score is still partly modeled until richer data sources are added.",
            ]}
            emptyText=""
            color="#fde68a"
          />
        </Card>
      </div>
    );
  }

  function renderTechnical() {
    return (
      <div style={styles.advancedGridSingle}>
        <Card title="Technical" score={aiReport?.technicalAnalysis?.score} subtitle={aiReport?.technicalAnalysis?.trend || "Technical analysis"}>
          <SectionRow label="Summary" value={aiReport?.technicalAnalysis?.summary || "Unavailable"} />
          <SectionRow label="Key levels" value={aiReport?.technicalAnalysis?.keyLevels || "Unavailable"} />
          <div style={styles.inlineGrid}>
            <Box label="1h Change" value={formatPct(marketData?.priceChange1h)} />
            <Box label="6h Change" value={formatPct(marketData?.priceChange6h)} />
            <Box label="24h Change" value={formatPct(marketData?.priceChange24h)} />
            <Box label="DEX" value={marketData?.dexId || "Unknown"} />
          </div>
        </Card>
      </div>
    );
  }

  function renderRisks() {
    return (
      <div style={styles.advancedGrid}>
        <Card title="Risk Matrix" score={aiReport?.riskMatrix?.overallScore} subtitle="AI + backend risk view">
          <SectionRow label="Liquidity risk" value={aiReport?.riskMatrix?.liquidityRisk || "Unavailable"} />
          <SectionRow label="Contract risk" value={aiReport?.riskMatrix?.contractRisk || "Unavailable"} />
          <SectionRow label="Market risk" value={aiReport?.riskMatrix?.marketRisk || "Unavailable"} />
          <SectionRow label="Concentration risk" value={aiReport?.riskMatrix?.concentrationRisk || "Unavailable"} />
          <ListBlock title="Red flags" items={aiReport?.riskMatrix?.redFlags || []} emptyText="No explicit red flags returned." color="#fecaca" />
          <ListBlock title="Green flags" items={aiReport?.riskMatrix?.greenFlags || []} emptyText="No explicit green flags returned." color="#bbf7d0" />
        </Card>

        <Card title="Security checks" score={scores?.securityScore} subtitle={security?.isSupported ? "GoPlus-supported asset" : "Unsupported or unavailable"}>
          <SectionRow label="Security supported" value={security?.isSupported ? "Yes" : "No"} />
          <SectionRow label="Honeypot" value={security?.isHoneypot === null ? "Unknown" : security?.isHoneypot ? "Yes" : "No"} />
          <SectionRow label="Mintable" value={security?.isMintable === null ? "Unknown" : security?.isMintable ? "Yes" : "No"} />
          <SectionRow label="Owner privileges" value={security?.hasOwnerPrivileges === null ? "Unknown" : security?.hasOwnerPrivileges ? "Yes" : "No"} />
          <SectionRow label="Take back ownership" value={security?.canTakeBackOwnership === null ? "Unknown" : security?.canTakeBackOwnership ? "Yes" : "No"} />
          <ListBlock title="Security notes" items={security?.notes || []} emptyText="No security notes available." color="#93c5fd" />
        </Card>
      </div>
    );
  }

  function renderVerdict() {
    return (
      <div style={styles.advancedGridSingle}>
        <Card title="Final Verdict" score={aiReport?.finalVerdict?.score || scores?.overallScore} subtitle={aiReport?.finalVerdict?.rating || riskVerdict}>
          <SectionRow label="Recommendation" value={aiReport?.finalVerdict?.recommendation || "Unavailable"} />
          <SectionRow label="Summary" value={aiReport?.finalVerdict?.summary || "Unavailable"} />
          <SectionRow label="Bull case" value={aiReport?.bullCase || "Unavailable"} />
          <SectionRow label="Bear case" value={aiReport?.bearCase || "Unavailable"} />
        </Card>
      </div>
    );
  }

  function renderActiveTab() {
    if (!data) return null;
    switch (activeTab) {
      case "overview": return renderOverview();
      case "market": return renderMarket();
      case "tokenomics": return renderTokenomics();
      case "team": return renderTeam();
      case "technical": return renderTechnical();
      case "risks": return renderRisks();
      case "verdict": return renderVerdict();
      default: return renderOverview();
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <h2 style={{ margin: 0 }}>🛡️ RugCheck AI</h2>
        <div style={{ color: backendStatus === "online" ? "#22c55e" : backendStatus === "offline" ? "#ef4444" : "#94a3b8" }}>
          Backend: {backendStatus}
        </div>
      </div>

      <div style={styles.container}>
        <h1 style={styles.heroTitle}>Institutional-style crypto research terminal</h1>
        <p style={styles.heroSubtitle}>
          Frontend is now connected to the uploaded backend. Search a token, call the backend analyze endpoint, and render normalized data, scores, security checks, and AI report sections.
        </p>

        <div style={styles.configBox}>
          <div style={styles.configTitle}>Current integration mode</div>
          <p style={styles.configText}>
            This UI now calls <code>{API_BASE}/api/analyze</code> and renders the real backend response shape: asset, marketData, security, scores, aiReport, sourceStatus, and warnings.
          </p>
        </div>

        <div style={styles.searchRow}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") analyze(query, "full");
            }}
            style={styles.input}
            placeholder="Token symbol, project name, or EVM contract"
          />
          <button onClick={() => analyze(query, "full")} style={styles.primaryButton}>Analyze</button>
        </div>

        <div style={styles.quickRow}>
          {QUICK_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => {
                setQuery(item);
                analyze(item, "full");
              }}
              style={styles.quickButton}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? <p style={{ marginTop: 24, color: "#cbd5e1" }}>Loading backend analysis...</p> : null}
        {error ? <div style={styles.errorBox}>{error}</div> : null}

        {data ? (
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <div>
                <h2 style={{ margin: "0 0 6px 0" }}>{asset?.name || "Unknown token"}</h2>
                <div style={{ color: "#94a3b8" }}>
                  {asset?.symbol || "?"}
                  {asset?.chain ? ` • ${asset.chain}` : ""}
                  {marketData?.dexId ? ` • ${marketData.dexId}` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: verdictColor(riskVerdict), fontWeight: 800, fontSize: 22 }}>{riskVerdict}</div>
                <div style={{ color: "#cbd5e1" }}>Overall Score: {scores?.overallScore ?? "Unknown"}/100</div>
                {confidence ? (
                  <div style={{ color: confidenceColor(confidence.level), fontWeight: 700, marginTop: 6 }}>
                    {confidenceLabel(confidence.level)} • {confidence.score}/100
                  </div>
                ) : null}
              </div>
            </div>

            <div style={styles.metricsGrid}>
              <Box label="Price" value={formatUsd(marketData?.priceUsd)} />
              <Box label="Market Cap" value={formatUsd(marketData?.marketCap)} />
              <Box label="FDV" value={formatUsd(marketData?.fdv)} />
              <Box label="24h Volume" value={formatUsd(marketData?.volume24h)} />
              <Box label="DEX Liquidity" value={formatUsd(marketData?.dexLiquidityUsd)} />
              <Box label="24h Change" value={formatPct(marketData?.priceChange24h)} />
              <Box label="Circulating Supply" value={formatCompact(marketData?.circulatingSupply)} />
              <Box label="Total Supply" value={formatCompact(marketData?.totalSupply)} />
              <Box label="Turnover Ratio" value={marketData?.turnoverRatio ?? "Unknown"} />
              <Box label="Liquidity / MC Ratio" value={marketData?.liquidityToMarketCapRatio ?? "Unknown"} />
              <Box label="Coingecko ID" value={asset?.coingeckoId || "Unknown"} />
              <Box label="Pair Address" value={asset?.pairAddress || "Unknown"} />
            </div>
          </div>
        ) : null}

        {data ? (
          <>
            <div style={styles.tabRow}>
              {RESEARCH_TABS.map((tab) => (
                <TabButton key={tab.key} label={tab.label} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} />
              ))}
            </div>
            <div style={styles.summaryStrip}>
              <ScorePill label="Overall" score={scores?.overallScore || 0} />
              <ScorePill label="Liquidity" score={scores?.liquidityScore || 0} />
              <ScorePill label="Tokenomics" score={scores?.tokenomicsScore || 0} />
              <ScorePill label="Security" score={scores?.securityScore || 0} />
              <ScorePill label="Technical" score={scores?.technicalScore || 0} />
            </div>
            {renderActiveTab()}
          </>
        ) : null}

        <div style={styles.disclaimer}>
          <h3 style={{ marginTop: 0, color: "#fde68a" }}>Important disclaimer</h3>
          <p style={{ color: "#f8fafc", lineHeight: 1.8, marginBottom: 0 }}>
            This tool is for informational and educational purposes only. It is not financial advice, investment advice, trading advice, legal advice, or tax advice. Data quality depends on connected providers and backend availability. Users must verify official sources before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    color: "white",
    fontFamily: "Inter, Arial, sans-serif",
  },
  topbar: {
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #172036",
    flexWrap: "wrap",
    gap: 12,
  },
  container: {
    padding: 40,
    maxWidth: 1160,
    margin: "auto",
  },
  heroTitle: {
    fontSize: 42,
    lineHeight: 1.1,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: "#94a3b8",
    fontSize: 18,
    marginTop: 0,
  },
  configBox: {
    marginTop: 20,
    background: "rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.22)",
    borderRadius: 18,
    padding: 18,
  },
  configTitle: {
    fontWeight: 800,
    marginBottom: 6,
  },
  configText: {
    color: "#cbd5e1",
    lineHeight: 1.7,
    margin: 0,
  },
  searchRow: {
    display: "flex",
    gap: 10,
    marginTop: 20,
    flexWrap: "wrap",
  },
  quickRow: {
    display: "flex",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  tabRow: {
    display: "flex",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap",
  },
  summaryStrip: {
    display: "flex",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 260,
    padding: 15,
    borderRadius: 12,
    border: "1px solid #24314f",
    background: "#0f172a",
    color: "white",
  },
  primaryButton: {
    padding: "15px 20px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #22d3ee, #3b82f6)",
    color: "#04111d",
    fontWeight: 700,
    border: 0,
    cursor: "pointer",
  },
  quickButton: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "#0f172a",
    border: "1px solid #24314f",
    color: "#cbd5e1",
    cursor: "pointer",
  },
  tabButton: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "#0f172a",
    border: "1px solid #24314f",
    color: "#cbd5e1",
    cursor: "pointer",
    fontWeight: 700,
  },
  tabButtonActive: {
    background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.2))",
    border: "1px solid rgba(99,102,241,0.45)",
    color: "#f8fafc",
  },
  errorBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
  },
  resultCard: {
    background: "#0f172a",
    padding: 24,
    borderRadius: 24,
    marginTop: 24,
    border: "1px solid #172036",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginTop: 20,
  },
  inlineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginTop: 14,
  },
  box: {
    background: "#020617",
    padding: 14,
    borderRadius: 14,
    border: "1px solid #172036",
  },
  boxLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 6,
  },
  boxValue: {
    fontWeight: 600,
  },
  boxTone: {
    marginTop: 6,
    color: "#93c5fd",
    fontSize: 12,
  },
  sectionRow: {
    marginTop: 12,
    padding: 12,
    background: "#020617",
    borderRadius: 12,
    border: "1px solid #172036",
  },
  sectionRowLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 6,
  },
  sectionRowValue: {
    color: "#e2e8f0",
    lineHeight: 1.7,
  },
  cardWide: {
    background: "#0f172a",
    padding: 20,
    borderRadius: 20,
    border: "1px solid #172036",
    marginTop: 16,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  advancedGrid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
  },
  advancedGridSingle: {
    marginTop: 4,
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #172036",
  },
  scorePill: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #24314f",
    background: "#0f172a",
    fontWeight: 700,
  },
  progressOuter: {
    height: 8,
    background: "#0b1220",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
    border: "1px solid #172036",
  },
  progressInner: {
    height: "100%",
    borderRadius: 999,
  },
  disclaimer: {
    marginTop: 28,
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.28)",
    borderRadius: 20,
    padding: 20,
  },
};
