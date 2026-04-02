import React, { useCallback, useEffect, useMemo, useState } from "react";

const PRODUCTION_API_BASE = "https://research-terminal-backend-production.up.railway.app";
const REQUEST_TIMEOUT_MS = 20000;

function resolveApiBase() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    if (isLocalhost) {
      return "http://localhost:4000";
    }

    if (protocol === "https:") {
      return PRODUCTION_API_BASE;
    }
  }

  return "http://localhost:4000";
}

const API_BASE = resolveApiBase();
const QUICK_SEARCHES = ["ETH", "BTC", "PEPE", "SOL", "WIF"];
const RESEARCH_TABS = [
  { key: "overview", label: "Overview" },
  { key: "market", label: "Market" },
  { key: "sources", label: "Sources" },
  { key: "tokenomics", label: "Tokenomics" },
  { key: "team", label: "Team" },
  { key: "technical", label: "Technical" },
  { key: "news", label: "News" },
  { key: "risks", label: "Risks" },
  { key: "verdict", label: "Verdict" },
];
const SEARCH_HISTORY_KEY = "rugcheck-history-v1";
const FAVORITES_KEY = "rugcheck-favorites-v1";

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
  if (score >= 75) return "#2fd67b";
  if (score >= 45) return "#ffb020";
  return "#ff6b6b";
}

function verdictColor(verdict) {
  if (verdict === "HIGH RISK") return "#ff6b6b";
  if (verdict === "CAUTION") return "#ffb020";
  return "#2fd67b";
}

function sourceColor(status) {
  if (status === "live") return "#2fd67b";
  if (status === "partial" || status === "modeled") return "#7dd3fc";
  if (status === "unsupported" || status === "skipped") return "#ffb020";
  if (status === "unavailable") return "#8a94a6";
  return "#ff6b6b";
}

function confidenceColor(level) {
  if (level === "high") return "#2fd67b";
  if (level === "medium") return "#ffb020";
  return "#ff6b6b";
}

function confidenceLabel(level) {
  if (level === "high") return "High confidence";
  if (level === "medium") return "Medium confidence";
  return "Low confidence";
}

function riskLevelColor(level) {
  if (level === "low") return "#2fd67b";
  if (level === "medium") return "#ffb020";
  if (level === "high") return "#ff8a4c";
  return "#ff6b6b";
}

function riskLevelLabel(level) {
  if (!level) return "Unknown";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function statusMeta(status) {
  if (status === "online") return { label: "Backend online", color: "#2fd67b", tone: "Live API responding" };
  if (status === "degraded") return { label: "Backend degraded", color: "#ffb020", tone: "Service reachable with partial coverage" };
  if (status === "offline") return { label: "Backend offline", color: "#ff6b6b", tone: "Requests are currently failing" };
  return { label: "Checking backend", color: "#8a94a6", tone: "Running health check" };
}

function normalizeErrorMessage(message) {
  if (!message) return "Analysis failed. Please try again.";
  const lower = message.toLowerCase();
  if (lower.includes("timed out") || lower.includes("timeout")) return "The backend took too long to respond. Try again in a moment.";
  if (lower.includes("failed to fetch")) return "Could not reach the backend. Check deployment status or try again in a moment.";
  if (lower.includes("cors")) return "The frontend is blocked from calling the backend. Check the backend allowed origins configuration.";
  if (lower.includes("unexpected token") || lower.includes("not valid json")) return "The backend returned an unexpected response. Retry the request after the service stabilizes.";
  if (lower.includes("malformed response")) return "The backend returned an incomplete analysis payload. Try again after the backend stabilizes.";
  if (lower.includes("rate limit")) return "Rate limit reached. Wait a bit before running another analysis.";
  if (lower.includes("not found")) return "Token not found. Try a symbol, project name, or EVM contract address.";
  return message;
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.slice(0, 180).trim();
    throw new Error(snippet ? `Malformed response: ${snippet}` : "Malformed response");
  }
}

async function fetchJson(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });

    const json = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(json?.error?.message || `Request failed with status ${response.status}`);
    }

    return json;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out");
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function isValidAnalysisResponse(payload) {
  return Boolean(
    payload &&
    typeof payload === "object" &&
    payload.asset &&
    payload.marketData &&
    payload.scores &&
    payload.confidence,
  );
}

function readSearchHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 6) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(nextQuery) {
  if (typeof window === "undefined") return [];
  const clean = nextQuery.trim().toUpperCase();
  if (!clean) return readSearchHistory();
  const next = [clean, ...readSearchHistory().filter((item) => item !== clean)].slice(0, 6);
  window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  return next;
}

function clearSearchHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SEARCH_HISTORY_KEY);
}

function readFavorites() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 12) : [];
  } catch {
    return [];
  }
}

function saveFavorites(nextFavorites) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites.slice(0, 12)));
}

function readInitialQuery() {
  if (typeof window === "undefined") return "ETH";
  const params = new URLSearchParams(window.location.search);
  return (params.get("q") || "ETH").trim() || "ETH";
}

function setShareQuery(nextQuery) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("q", nextQuery.trim());
  window.history.replaceState({}, "", url.toString());
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

function ListBlock({ title, items, emptyText, color = "#d5dcec" }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ color, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {items && items.length ? (
        items.map((item) => (
          <p key={item} style={{ color, margin: "6px 0", lineHeight: 1.7 }}>
            - {item}
          </p>
        ))
      ) : (
        <p style={{ color: "#8a94a6" }}>{emptyText}</p>
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
          {subtitle ? <div style={{ color: "#8a94a6", marginTop: 4 }}>{subtitle}</div> : null}
        </div>
        {score !== undefined ? <span style={{ color: analysisColor(score), fontWeight: 800 }}>{score}/100</span> : null}
      </div>
      {score !== undefined ? <ProgressBar score={score} /> : null}
      {children}
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState(readInitialQuery);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [backendStatus, setBackendStatus] = useState("unknown");
  const [lastUpdated, setLastUpdated] = useState("");
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [copyMessage, setCopyMessage] = useState("");

  const checkHealth = useCallback(async () => {
    try {
      await fetchJson(`${API_BASE}/api/health`, {}, 7000);
      setBackendStatus("online");
    } catch {
      setBackendStatus("degraded");
    }
  }, []);

  const analyze = useCallback(async (nextQuery, mode = "full") => {
    const cleanQuery = nextQuery.trim();
    if (!cleanQuery) {
      setError("Enter a token symbol, project name, or contract address.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const json = await fetchJson(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cleanQuery, mode }),
      });

      if (!isValidAnalysisResponse(json)) {
        throw new Error("Malformed response");
      }

      setData(json);
      setActiveTab("overview");
      setLastUpdated(new Date().toLocaleString());
      setHistory(saveSearchHistory(cleanQuery));
      setShareQuery(cleanQuery);
      checkHealth();
    } catch (err) {
      setData(null);
      setError(normalizeErrorMessage(err instanceof Error ? err.message : "Analysis failed"));
      checkHealth();
    } finally {
      setLoading(false);
    }
  }, [checkHealth]);

  useEffect(() => {
    setHistory(readSearchHistory());
    setFavorites(readFavorites());
    checkHealth();
    analyze(readInitialQuery(), "full");
  }, [analyze, checkHealth]);

  useEffect(() => {
    if (!copyMessage) return undefined;
    const timeout = window.setTimeout(() => setCopyMessage(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyMessage]);

  const asset = data?.asset;
  const marketData = data?.marketData;
  const security = data?.security;
  const scores = data?.scores;
  const aiReport = data?.aiReport;
  const officialLinks = data?.officialLinks;
  const whitepaperDocs = data?.whitepaperDocs;
  const newsIntelligence = data?.newsIntelligence;
  const snapshot = data?.snapshot;
  const sourceStatus = data?.sourceStatus;
  const meta = data?.meta;
  const confidence = data?.confidence;
  const fundamentals = data?.fundamentals;
  const warnings = data?.warnings || [];
  const backendMeta = statusMeta(backendStatus);
  const currentFavoriteKey = (asset?.symbol || query || "").trim().toUpperCase();
  const isFavorite = currentFavoriteKey ? favorites.includes(currentFavoriteKey) : false;

  const riskVerdict = useMemo(() => {
    if (!scores) return "UNKNOWN";
    if (scores.fragilityScore >= 70 || scores.securityScore <= 20) return "HIGH RISK";
    if (scores.overallScore < 55) return "CAUTION";
    return "LOWER RISK";
  }, [scores]);

  function toggleFavorite() {
    if (!currentFavoriteKey) return;
    const nextFavorites = favorites.includes(currentFavoriteKey)
      ? favorites.filter((item) => item !== currentFavoriteKey)
      : [currentFavoriteKey, ...favorites].slice(0, 12);
    setFavorites(nextFavorites);
    saveFavorites(nextFavorites);
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyMessage("Share link copied");
    } catch {
      setCopyMessage("Could not copy link");
    }
  }

  function clearHistory() {
    clearSearchHistory();
    setHistory([]);
  }

  function renderOverview() {
    return (
      <div style={styles.advancedGrid}>
        <Card title="AI verdict" score={scores?.overallScore} subtitle={aiReport?.finalVerdict?.rating || "Generated from live analysis"}>
          <SectionRow label="Recommendation" value={aiReport?.finalVerdict?.recommendation || "Unavailable"} />
          <SectionRow label="Summary" value={aiReport?.finalVerdict?.summary || "Unavailable"} />
          <SectionRow label="Project overview" value={aiReport?.projectOverview || "Unavailable"} />
          <ListBlock title="Warnings" items={warnings} emptyText="No warnings returned." color="#f9d976" />
        </Card>

        <Card title="Confidence" score={confidence?.score} subtitle={confidence ? confidenceLabel(confidence.level) : "Assessment unavailable"}>
          <SectionRow label="Summary" value={confidence?.summary || "Unavailable"} />
          <SectionRow label="Market data status" value={confidence?.marketDataStatus || "Unknown"} />
          <ListBlock title="Why this confidence level" items={confidence?.reasons || []} emptyText="No confidence notes available." color="#9bd7ff" />
        </Card>

        <Card title="Source coverage" subtitle="Live vs partial vs unavailable">
          {sourceStatus ? Object.entries(sourceStatus).map(([key, value]) => (
            <div key={key} style={styles.scoreRow}>
              <div style={{ color: "#d5dcec", textTransform: "capitalize" }}>{key}</div>
              <div style={{ color: sourceColor(value), fontWeight: 800 }}>{value}</div>
            </div>
          )) : <p style={{ color: "#8a94a6" }}>No source status available.</p>}
        </Card>

        <Card
          title="Official sources"
          score={officialLinks?.sourceReliabilityScore}
          subtitle={officialLinks?.status ? `Source reliability: ${officialLinks.status}` : "Official project links"}
        >
          <SectionRow label="Summary" value={officialLinks?.summary || "Unavailable"} />
          <div style={styles.inlineGrid}>
            <Box label="Website" value={officialLinks?.website || "Unavailable"} />
            <Box label="Docs" value={officialLinks?.docs || "Unavailable"} />
            <Box label="Whitepaper" value={officialLinks?.whitepaper || "Unavailable"} />
            <Box label="X / Twitter" value={officialLinks?.twitter || "Unavailable"} />
            <Box label="GitHub" value={officialLinks?.github || "Unavailable"} />
            <Box label="Explorer" value={officialLinks?.explorer || "Unavailable"} />
          </div>
          <ListBlock title="Source notes" items={officialLinks?.notes || []} emptyText="No source notes available." color="#9bd7ff" />
        </Card>

        <Card
          title="Research timeline"
          subtitle={snapshot?.generatedAt ? `Snapshot stored at ${new Date(snapshot.generatedAt).toLocaleString()}` : "No persisted snapshot yet"}
        >
          <SectionRow label="Previous snapshot" value={snapshot?.previousSnapshotAt ? new Date(snapshot.previousSnapshotAt).toLocaleString() : "No previous snapshot"} />
          <ListBlock title="What changed" items={snapshot?.changeSummary || []} emptyText="No change summary available yet." color="#9bd7ff" />
        </Card>

        <Card title="Score breakdown" subtitle="Calculated by the backend engine">
          {scores ? (
            [
              ["Overall", scores.overallScore],
              ["Liquidity", scores.liquidityScore],
              ["Tokenomics", scores.tokenomicsScore],
              ["Governance", scores.governanceScore],
              ["Security", scores.securityScore],
              ["Technical", scores.technicalScore],
              ["Fragility resistance", 100 - scores.fragilityScore],
            ].map(([label, score]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={styles.scoreRow}>
                  <div style={{ color: "#d5dcec" }}>{label}</div>
                  <div style={{ color: analysisColor(score), fontWeight: 800 }}>{score}/100</div>
                </div>
                <ProgressBar score={score} />
              </div>
            ))
          ) : <p style={{ color: "#8a94a6" }}>Scores unavailable.</p>}
        </Card>

        <Card
          title="Fundamental posture"
          score={fundamentals?.tokenomics?.overallScore}
          subtitle={fundamentals?.tokenomics ? `Unlock impact: ${riskLevelLabel(fundamentals.tokenomics.upcomingUnlockImpact)}` : "Fundamental snapshot"}
        >
          <SectionRow
            label="Supply health"
            value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.supplyHealth}/100` : "Unavailable"}
          />
          <SectionRow
            label="FDV pressure"
            value={fundamentals?.tokenomics?.breakdown?.fdvPressure ? riskLevelLabel(fundamentals.tokenomics.breakdown.fdvPressure) : "Unavailable"}
          />
          <SectionRow
            label="Inflation risk"
            value={fundamentals?.tokenomics?.breakdown?.inflationRisk ? riskLevelLabel(fundamentals.tokenomics.breakdown.inflationRisk) : "Unavailable"}
          />
          <SectionRow
            label="Concentration risk"
            value={fundamentals?.tokenomics?.breakdown?.concentrationRisk ? riskLevelLabel(fundamentals.tokenomics.breakdown.concentrationRisk) : "Unavailable"}
          />
          <ListBlock
            title="Key alerts"
            items={fundamentals?.risks?.keyAlerts || []}
            emptyText="No material alerts from the tokenomics and risk engine."
            color="#ffb6b6"
          />
        </Card>
      </div>
    );
  }

  function renderMarket() {
    return (
      <div style={styles.advancedGridSingle}>
        <Card title="Market structure" score={aiReport?.marketStructure?.score} subtitle={aiReport?.marketStructure?.marketCapTier || "Market analysis"}>
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
          <ListBlock title="Top exchanges" items={marketData?.topExchanges || []} emptyText="No exchange data available." color="#9bd7ff" />
        </Card>
      </div>
    );
  }

  function renderSources() {
    return (
      <div style={styles.advancedGrid}>
        <Card
          title="Official links"
          score={officialLinks?.sourceReliabilityScore}
          subtitle={officialLinks?.status ? `Coverage: ${officialLinks.status}` : "Official project sources"}
        >
          <SectionRow label="Summary" value={officialLinks?.summary || "Unavailable"} />
          <div style={styles.inlineGrid}>
            <Box label="Website" value={officialLinks?.website || "Unavailable"} />
            <Box label="Docs" value={officialLinks?.docs || "Unavailable"} />
            <Box label="Whitepaper" value={officialLinks?.whitepaper || "Unavailable"} />
            <Box label="GitHub" value={officialLinks?.github || "Unavailable"} />
            <Box label="X / Twitter" value={officialLinks?.twitter || "Unavailable"} />
            <Box label="Explorer" value={officialLinks?.explorer || "Unavailable"} />
          </div>
          <ListBlock title="Source notes" items={officialLinks?.notes || []} emptyText="No source notes available." color="#9bd7ff" />
        </Card>

        <Card
          title="Whitepaper and docs"
          score={whitepaperDocs?.score}
          subtitle={whitepaperDocs ? `Documentation depth: ${whitepaperDocs.documentationDepth}` : "Docs analysis"}
        >
          <SectionRow label="Summary" value={whitepaperDocs?.summary || "Unavailable"} />
          <SectionRow label="Token utility coverage" value={whitepaperDocs?.tokenUtilityCoverage || "Unavailable"} />
          <SectionRow label="Consistency" value={whitepaperDocs?.consistency || "Unavailable"} />
          <ListBlock title="Documentation notes" items={whitepaperDocs?.notes || []} emptyText="No documentation notes available." color="#a6f3c2" />
          <ListBlock title="Red flags" items={whitepaperDocs?.redFlags || []} emptyText="No explicit documentation red flags." color="#ffb6b6" />
        </Card>
      </div>
    );
  }

  function renderTokenomics() {
    return (
      <div style={styles.advancedGrid}>
        <Card
          title="Tokenomics engine"
          score={fundamentals?.tokenomics?.overallScore ?? aiReport?.tokenomics?.score}
          subtitle={fundamentals?.tokenomics ? `Upcoming unlock impact: ${riskLevelLabel(fundamentals.tokenomics.upcomingUnlockImpact)}` : (aiReport?.tokenomics?.inflationRisk || "Tokenomics analysis")}
        >
          <SectionRow label="Summary" value={aiReport?.tokenomics?.summary || "Unavailable"} />
          <SectionRow label="Supply pressure" value={aiReport?.tokenomics?.supplyPressure || "Unavailable"} />
          <SectionRow label="Market cap / FDV view" value={aiReport?.tokenomics?.mcapToFdvRatio || "Unavailable"} />
          <div style={styles.inlineGrid}>
            <Box label="Circulating Supply" value={formatCompact(marketData?.circulatingSupply)} />
            <Box label="Total Supply" value={formatCompact(marketData?.totalSupply)} />
            <Box label="Max Supply" value={formatCompact(marketData?.maxSupply)} />
            <Box label="Market Cap" value={formatUsd(marketData?.marketCap)} />
            <Box label="FDV" value={formatUsd(marketData?.fdv)} />
            <Box
              label="MC / FDV"
              value={fundamentals?.tokenomics?.breakdown?.mcToFdvRatio ?? "Unknown"}
              tone="Closer to 1.0 is healthier."
            />
            <Box
              label="Float %"
              value={fundamentals?.tokenomics?.breakdown?.floatPercent !== null && fundamentals?.tokenomics?.breakdown?.floatPercent !== undefined
                ? formatPct(fundamentals.tokenomics.breakdown.floatPercent)
                : "Unknown"}
              tone="Higher float usually means lower dilution overhang."
            />
          </div>
          <div style={styles.inlineGrid}>
            <Box label="Supply Health" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.supplyHealth}/100` : "Unavailable"} />
            <Box label="Unlock Risk" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.unlockRisk}/100` : "Unavailable"} />
            <Box label="Inflation Health" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.inflationHealth}/100` : "Unavailable"} />
            <Box label="Insider Concentration" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.insiderConcentration}/100` : "Unavailable"} />
            <Box label="FDV Pressure" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.fdvPressure}/100` : "Unavailable"} />
            <Box label="Value Accrual Quality" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.valueAccrualQuality}/100` : "Unavailable"} />
          </div>
          <ListBlock title="Strengths" items={fundamentals?.tokenomics?.strengths || []} emptyText="No clear strengths were extracted." color="#a6f3c2" />
          <ListBlock title="Concerns" items={fundamentals?.tokenomics?.concerns || []} emptyText="No major tokenomics concerns were extracted." color="#ffb6b6" />
        </Card>

        <Card title="Why the tokenomics score looks like this" subtitle="Scoring explanations from the backend evaluator">
          <SectionRow label="Supply health" value={fundamentals?.tokenomics?.explanations?.supplyHealth || "Unavailable"} />
          <SectionRow label="Unlock risk" value={fundamentals?.tokenomics?.explanations?.unlockRisk || "Unavailable"} />
          <SectionRow label="Inflation health" value={fundamentals?.tokenomics?.explanations?.inflationHealth || "Unavailable"} />
          <SectionRow label="Insider concentration" value={fundamentals?.tokenomics?.explanations?.insiderConcentration || "Unavailable"} />
          <SectionRow label="FDV pressure" value={fundamentals?.tokenomics?.explanations?.fdvPressure || "Unavailable"} />
          <SectionRow label="Value accrual quality" value={fundamentals?.tokenomics?.explanations?.valueAccrualQuality || "Unavailable"} />
          <ListBlock
            title="Still worth checking manually"
            items={[
              "Exact vesting and unlock schedule.",
              "Team or treasury allocation.",
              "Value accrual mechanism from official docs.",
            ]}
            emptyText=""
            color="#9bd7ff"
          />
        </Card>
      </div>
    );
  }

  function renderTeam() {
    return (
      <div style={styles.advancedGridSingle}>
        <Card title="Team and governance" score={aiReport?.teamGovernance?.score} subtitle={aiReport?.teamGovernance?.dataAvailability || "Governance analysis"}>
          <SectionRow label="Summary" value={aiReport?.teamGovernance?.summary || "Unavailable"} />
          <SectionRow label="Category" value={asset?.category || "Unknown"} />
          <SectionRow label="Narrative" value={asset?.narrative || "Unknown"} />
          <ListBlock
            title="Current limitation"
            items={[
              "This version does not ingest live founder, VC, or governance datasets yet.",
              "Governance scoring is still partly modeled until richer sources are added.",
            ]}
            emptyText=""
            color="#f9d976"
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

  function renderNews() {
    return (
      <div style={styles.advancedGrid}>
        <Card
          title="News intelligence"
          score={newsIntelligence?.score}
          subtitle={newsIntelligence ? `Sentiment: ${newsIntelligence.sentiment} | Source confidence: ${newsIntelligence.sourceConfidence}` : "Catalyst monitor"}
        >
          <SectionRow label="Summary" value={newsIntelligence?.summary || "Unavailable"} />
          <ListBlock title="News notes" items={newsIntelligence?.notes || []} emptyText="No news notes available." color="#9bd7ff" />
          {newsIntelligence?.latestEvents?.length ? newsIntelligence.latestEvents.map((event) => (
            <div key={`${event.title}-${event.publishedAt || "na"}`} style={styles.sectionRow}>
              <div style={styles.sectionRowLabel}>
                {event.source} {event.publishedAt ? `| ${new Date(event.publishedAt).toLocaleString()}` : ""}
              </div>
              <div style={styles.sectionRowValue}>{event.title}</div>
              <div style={styles.eventMeta}>
                <span style={{ ...styles.riskChip, borderColor: sourceColor("partial"), color: "#7dd3fc" }}>{event.classification}</span>
                <span style={{ ...styles.riskChip, borderColor: event.impact === "high" ? "#ff6b6b" : event.impact === "medium" ? "#ffb020" : "#7dd3fc", color: event.impact === "high" ? "#ff6b6b" : event.impact === "medium" ? "#ffb020" : "#7dd3fc" }}>
                  Impact: {event.impact}
                </span>
              </div>
            </div>
          )) : <p style={{ color: "#8a94a6" }}>No recent events available.</p>}
        </Card>

        <Card title="Snapshot changes" subtitle={snapshot?.generatedAt ? `Latest snapshot: ${new Date(snapshot.generatedAt).toLocaleString()}` : "Change tracking"}>
          <SectionRow label="Previous snapshot" value={snapshot?.previousSnapshotAt ? new Date(snapshot.previousSnapshotAt).toLocaleString() : "No previous snapshot"} />
          <ListBlock title="Change summary" items={snapshot?.changeSummary || []} emptyText="No change summary available." color="#9bd7ff" />
        </Card>
      </div>
    );
  }

  function renderRisks() {
    return (
      <div style={styles.advancedGrid}>
        <Card title="Risk matrix" score={aiReport?.riskMatrix?.overallScore} subtitle="AI plus backend risk view">
          <SectionRow label="Liquidity risk" value={aiReport?.riskMatrix?.liquidityRisk || "Unavailable"} />
          <SectionRow label="Contract risk" value={aiReport?.riskMatrix?.contractRisk || "Unavailable"} />
          <SectionRow label="Market risk" value={aiReport?.riskMatrix?.marketRisk || "Unavailable"} />
          <SectionRow label="Concentration risk" value={aiReport?.riskMatrix?.concentrationRisk || "Unavailable"} />
          <ListBlock title="Red flags" items={aiReport?.riskMatrix?.redFlags || []} emptyText="No explicit red flags returned." color="#ffb6b6" />
          <ListBlock title="Green flags" items={aiReport?.riskMatrix?.greenFlags || []} emptyText="No explicit green flags returned." color="#a6f3c2" />
        </Card>

        <Card title="Backend risk engine" subtitle="Machine-readable product and token risk posture">
          <div style={styles.inlineGrid}>
            <Box label="Tokenomics Risk" value={riskLevelLabel(fundamentals?.risks?.tokenomicsRisk)} tone="Covers dilution, float, and supply-overhang risk." />
            <Box label="Product Risk" value={riskLevelLabel(fundamentals?.risks?.productRisk)} tone="Reflects how measurable the product and usage look from available data." />
            <Box label="Execution Risk" value={riskLevelLabel(fundamentals?.risks?.executionRisk)} tone="Raised when warnings and missing confirmations start to stack up." />
            <Box label="Governance Risk" value={riskLevelLabel(fundamentals?.risks?.governanceRisk)} tone="Higher when governance transparency is still weak." />
            <Box label="Security Risk" value={riskLevelLabel(fundamentals?.risks?.securityRisk)} tone="Combines contract support and hard red flags like honeypot or mintability." />
            <Box label="Liquidity Risk" value={riskLevelLabel(fundamentals?.risks?.liquidityRisk)} tone="Based on how much usable market liquidity the token appears to have." />
          </div>
          <div style={styles.riskLevelRow}>
            {[
              ["Tokenomics", fundamentals?.risks?.tokenomicsRisk],
              ["Product", fundamentals?.risks?.productRisk],
              ["Execution", fundamentals?.risks?.executionRisk],
              ["Governance", fundamentals?.risks?.governanceRisk],
              ["Security", fundamentals?.risks?.securityRisk],
              ["Liquidity", fundamentals?.risks?.liquidityRisk],
            ].map(([label, level]) => (
              <div key={label} style={{ ...styles.riskChip, borderColor: riskLevelColor(level), color: riskLevelColor(level) }}>
                {label}: {riskLevelLabel(level)}
              </div>
            ))}
          </div>
          <ListBlock title="Key alerts" items={fundamentals?.risks?.keyAlerts || []} emptyText="No critical alerts were raised by the backend risk engine." color="#ffb6b6" />
        </Card>

        <Card title="Security checks" score={scores?.securityScore} subtitle={security?.isSupported ? "GoPlus-supported asset" : "Unsupported or unavailable"}>
          <SectionRow label="Security supported" value={security?.isSupported ? "Yes" : "No"} />
          <SectionRow label="Honeypot" value={security?.isHoneypot === null ? "Unknown" : security?.isHoneypot ? "Yes" : "No"} />
          <SectionRow label="Mintable" value={security?.isMintable === null ? "Unknown" : security?.isMintable ? "Yes" : "No"} />
          <SectionRow label="Owner privileges" value={security?.hasOwnerPrivileges === null ? "Unknown" : security?.hasOwnerPrivileges ? "Yes" : "No"} />
          <SectionRow label="Take back ownership" value={security?.canTakeBackOwnership === null ? "Unknown" : security?.canTakeBackOwnership ? "Yes" : "No"} />
          <ListBlock title="Security notes" items={security?.notes || []} emptyText="No security notes available." color="#9bd7ff" />
        </Card>
      </div>
    );
  }

  function renderVerdict() {
    return (
      <div style={styles.advancedGridSingle}>
        <Card title="Final verdict" score={aiReport?.finalVerdict?.score || scores?.overallScore} subtitle={aiReport?.finalVerdict?.rating || riskVerdict}>
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
      case "sources": return renderSources();
      case "tokenomics": return renderTokenomics();
      case "team": return renderTeam();
      case "technical": return renderTechnical();
      case "news": return renderNews();
      case "risks": return renderRisks();
      case "verdict": return renderVerdict();
      default: return renderOverview();
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

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

      <div style={styles.container}>
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
              API base: <code style={styles.inlineCode}>{API_BASE}</code>
            </p>
            <p style={styles.sideCardText}>
              Best use: quick token triage before deeper manual research.
            </p>
          </div>
        </div>

        <div style={styles.searchPanel}>
          <div style={styles.searchHeader}>
            <div>
              <div style={styles.searchTitle}>Run analysis</div>
              <div style={styles.searchHint}>Use a symbol, project name, or EVM contract address.</div>
            </div>
            {lastUpdated ? <div style={styles.lastUpdated}>Last result: {lastUpdated}</div> : null}
          </div>

          <div style={styles.searchRow}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") analyze(query, "full");
              }}
              style={styles.input}
              placeholder="ETH, Pepe, 0x..."
            />
            <button onClick={() => analyze(query, "full")} style={styles.primaryButton} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>
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
          {history.length ? (
            <div style={styles.historyWrap}>
              <div style={styles.historyHeader}>
                <div style={styles.historyLabel}>Recent searches</div>
                <button onClick={clearHistory} style={styles.ghostButton}>Clear</button>
              </div>
              <div style={styles.historyRow}>
                {history.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      analyze(item, "full");
                    }}
                    style={styles.historyButton}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {favorites.length ? (
            <div style={styles.historyWrap}>
              <div style={styles.historyLabel}>Watchlist</div>
              <div style={styles.historyRow}>
                {favorites.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      analyze(item, "full");
                    }}
                    style={styles.favoriteButton}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div style={styles.loadingCard}>
            <div style={styles.loadingPulse} />
            <div>
              <div style={styles.loadingTitle}>Building your analysis</div>
              <div style={styles.loadingText}>Fetching market inputs, scoring risk, and preparing a structured verdict.</div>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div style={styles.skeletonGrid}>
            <div style={styles.skeletonCard} />
            <div style={styles.skeletonCard} />
            <div style={styles.skeletonCard} />
          </div>
        ) : null}

        {error ? (
          <div style={styles.errorBox}>
            <div style={styles.errorTitle}>Request failed</div>
            <div style={styles.errorText}>{error}</div>
            <button onClick={() => analyze(query, "full")} style={styles.secondaryButton}>Try again</button>
          </div>
        ) : null}

        {!data && !loading && !error ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>No analysis loaded yet</div>
            <div style={styles.emptyText}>Start with a quick search or enter a token manually to generate a report.</div>
          </div>
        ) : null}

        {data ? (
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <div>
                <h2 style={{ margin: "0 0 6px 0" }}>{asset?.name || "Unknown token"}</h2>
                <div style={{ color: "#8a94a6" }}>
                  {asset?.symbol || "?"}
                  {asset?.chain ? ` | ${asset.chain}` : ""}
                  {marketData?.dexId ? ` | ${marketData.dexId}` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: verdictColor(riskVerdict), fontWeight: 800, fontSize: 22 }}>{riskVerdict}</div>
                <div style={{ color: "#d5dcec" }}>Overall Score: {scores?.overallScore ?? "Unknown"}/100</div>
                {confidence ? (
                  <div style={{ color: confidenceColor(confidence.level), fontWeight: 700, marginTop: 6 }}>
                    {confidenceLabel(confidence.level)} | {confidence.score}/100
                  </div>
                ) : null}
              </div>
            </div>

            <div style={styles.resultActions}>
              <button onClick={toggleFavorite} style={styles.actionButton}>
                {isFavorite ? "Remove from watchlist" : "Save to watchlist"}
              </button>
              <button onClick={copyShareLink} style={styles.actionButton}>
                Copy share link
              </button>
              {copyMessage ? <div style={styles.copyMessage}>{copyMessage}</div> : null}
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
              <Box label="CoinMarketCap ID" value={asset?.coinmarketcapId || "Unknown"} />
              <Box label="CoinGecko ID" value={asset?.coingeckoId || "Unknown"} />
              <Box label="Pair Address" value={asset?.pairAddress || "Unknown"} />
            </div>
          </div>
        ) : null}

        {data ? (
          <>
            <div style={styles.metaGrid}>
              <div style={styles.metaCard}>
                <div style={styles.metaLabel}>Confidence</div>
                <div style={{ ...styles.metaValue, color: confidenceColor(confidence?.level) }}>
                  {confidence ? `${confidenceLabel(confidence.level)} | ${confidence.score}/100` : "Unavailable"}
                </div>
                <div style={styles.metaText}>{confidence?.summary || "Confidence unavailable."}</div>
                <div style={styles.metaSubtext}>
                  Data quality: {meta?.dataQuality || confidence?.dataQuality || "unknown"} | Source agreement: {confidence?.sourceAgreement || "unknown"}
                </div>
              </div>

              <div style={styles.metaCard}>
                <div style={styles.metaLabel}>Source clarity</div>
                <div style={styles.metaValue}>How this analysis was built</div>
                <div style={styles.metaText}>{confidence?.sourceAgreementSummary || "Source agreement summary unavailable."}</div>
                <div style={styles.providerList}>
                  {(meta?.providerNotes || []).slice(0, 4).map((note) => (
                    <div key={note} style={styles.providerNote}>{note}</div>
                  ))}
                </div>
              </div>
            </div>

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
            <div style={styles.explainerRow}>
              <div style={styles.explainerCard}>
                <div style={styles.explainerTitle}>How to read this</div>
                <div style={styles.explainerText}>
                  Treat the overall score as a screening signal, not a buy or sell signal. The most useful pattern is when score, confidence, and source coverage point in the same direction.
                </div>
              </div>
              <div style={styles.explainerCard}>
                <div style={styles.explainerTitle}>Best use case</div>
                <div style={styles.explainerText}>
                  Use this terminal to filter candidates quickly, then verify tokenomics, unlocks, governance, and official docs manually before acting.
                </div>
              </div>
            </div>
            {renderActiveTab()}
          </>
        ) : null}

        <div style={styles.disclaimer}>
          <h3 style={{ marginTop: 0, color: "#f9d976" }}>Important note</h3>
          <p style={{ color: "#f4f7ff", lineHeight: 1.8, marginBottom: 0 }}>
            This tool is for research support only. It is not financial, legal, tax, or investment advice. Data quality depends on third-party providers and service availability. Always verify contract addresses and official project sources before making decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "radial-gradient(circle at top left, rgba(21,87,149,0.25), transparent 30%), radial-gradient(circle at top right, rgba(24,180,108,0.14), transparent 24%), #07111f",
    minHeight: "100vh",
    color: "white",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  backgroundGlowOne: {
    position: "absolute",
    inset: "70px auto auto -120px",
    width: 320,
    height: 320,
    background: "radial-gradient(circle, rgba(70,140,255,0.22), transparent 70%)",
    pointerEvents: "none",
  },
  backgroundGlowTwo: {
    position: "absolute",
    inset: "auto -80px 60px auto",
    width: 300,
    height: 300,
    background: "radial-gradient(circle, rgba(47,214,123,0.16), transparent 70%)",
    pointerEvents: "none",
  },
  topbar: {
    position: "relative",
    zIndex: 1,
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(138,148,166,0.18)",
    flexWrap: "wrap",
    gap: 16,
    backdropFilter: "blur(14px)",
  },
  brandEyebrow: {
    color: "#7dd3fc",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: 6,
  },
  brandTitle: {
    margin: 0,
    fontSize: 28,
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(10,18,32,0.72)",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  container: {
    position: "relative",
    zIndex: 1,
    padding: "34px 20px 52px",
    maxWidth: 1180,
    margin: "0 auto",
  },
  heroPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
    alignItems: "stretch",
  },
  heroCopy: {
    padding: 28,
    borderRadius: 28,
    background: "linear-gradient(180deg, rgba(16,25,43,0.9), rgba(10,16,29,0.85))",
    border: "1px solid rgba(125,211,252,0.14)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.24)",
  },
  heroKicker: {
    color: "#7dd3fc",
    fontWeight: 700,
    marginBottom: 12,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 48,
    lineHeight: 1,
    margin: "0 0 14px 0",
    maxWidth: 700,
  },
  heroSubtitle: {
    color: "#aab7cc",
    fontSize: 18,
    margin: 0,
    lineHeight: 1.7,
    maxWidth: 740,
  },
  heroBullets: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  heroBullet: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(14,22,39,0.9)",
    border: "1px solid rgba(125,211,252,0.18)",
    color: "#d5dcec",
    fontWeight: 600,
  },
  heroSideCard: {
    padding: 24,
    borderRadius: 28,
    background: "linear-gradient(180deg, rgba(9,17,30,0.96), rgba(7,14,25,0.92))",
    border: "1px solid rgba(47,214,123,0.16)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.24)",
  },
  sideCardLabel: {
    color: "#8a94a6",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontSize: 12,
    marginBottom: 10,
  },
  sideCardValue: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 12,
  },
  sideCardText: {
    color: "#c5d0e0",
    lineHeight: 1.7,
    margin: "0 0 10px 0",
  },
  inlineCode: {
    display: "inline-block",
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.08)",
    color: "#f4f7ff",
    wordBreak: "break-all",
  },
  searchPanel: {
    marginTop: 22,
    padding: 22,
    borderRadius: 24,
    background: "rgba(10,18,32,0.84)",
    border: "1px solid rgba(138,148,166,0.14)",
  },
  searchHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 4,
  },
  searchHint: {
    color: "#8a94a6",
  },
  lastUpdated: {
    color: "#8a94a6",
    fontSize: 13,
  },
  searchRow: {
    display: "flex",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },
  quickRow: {
    display: "flex",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  historyWrap: {
    marginTop: 18,
  },
  historyHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  historyLabel: {
    color: "#8a94a6",
    fontSize: 13,
  },
  ghostButton: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(138,148,166,0.18)",
    background: "transparent",
    color: "#8a94a6",
    cursor: "pointer",
  },
  historyRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  historyButton: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(138,148,166,0.18)",
    color: "#d5dcec",
    cursor: "pointer",
  },
  favoriteButton: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(47,214,123,0.1)",
    border: "1px solid rgba(47,214,123,0.24)",
    color: "#dff9ea",
    cursor: "pointer",
  },
  input: {
    flex: 1,
    minWidth: 260,
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(125,211,252,0.22)",
    background: "#0e1728",
    color: "white",
    fontSize: 16,
  },
  primaryButton: {
    padding: "15px 22px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #46b8ff, #2fd67b)",
    color: "#05111e",
    fontWeight: 800,
    border: 0,
    cursor: "pointer",
    minWidth: 130,
  },
  secondaryButton: {
    marginTop: 14,
    padding: "11px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    color: "#f4f7ff",
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: "pointer",
  },
  quickButton: {
    padding: "9px 13px",
    borderRadius: 999,
    background: "#101a2d",
    border: "1px solid rgba(138,148,166,0.18)",
    color: "#d5dcec",
    cursor: "pointer",
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
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14,
    marginTop: 18,
  },
  metaCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(138,148,166,0.14)",
    borderRadius: 18,
    padding: 16,
  },
  metaLabel: {
    color: "#8a94a6",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
  },
  metaValue: {
    color: "#f4f7ff",
    fontWeight: 800,
    marginBottom: 8,
  },
  metaText: {
    color: "#c5d0e0",
    lineHeight: 1.7,
  },
  metaSubtext: {
    color: "#8a94a6",
    marginTop: 10,
    fontSize: 13,
  },
  providerList: {
    marginTop: 10,
    display: "grid",
    gap: 8,
  },
  providerNote: {
    color: "#aab7cc",
    lineHeight: 1.5,
    fontSize: 14,
  },
  explainerRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
    marginTop: 18,
  },
  explainerCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(138,148,166,0.14)",
    borderRadius: 18,
    padding: 16,
  },
  explainerTitle: {
    fontWeight: 800,
    marginBottom: 6,
    color: "#f4f7ff",
  },
  explainerText: {
    color: "#aab7cc",
    lineHeight: 1.7,
  },
  tabButton: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "#0f172a",
    border: "1px solid rgba(138,148,166,0.18)",
    color: "#d5dcec",
    cursor: "pointer",
    fontWeight: 700,
  },
  tabButtonActive: {
    background: "linear-gradient(135deg, rgba(70,184,255,0.16), rgba(47,214,123,0.16))",
    border: "1px solid rgba(70,184,255,0.38)",
    color: "#f8fafc",
  },
  loadingCard: {
    marginTop: 22,
    padding: 18,
    borderRadius: 22,
    background: "rgba(70,184,255,0.08)",
    border: "1px solid rgba(70,184,255,0.18)",
    display: "flex",
    gap: 16,
    alignItems: "center",
  },
  loadingPulse: {
    width: 18,
    height: 18,
    borderRadius: 999,
    background: "#46b8ff",
    boxShadow: "0 0 0 10px rgba(70,184,255,0.16)",
  },
  loadingTitle: {
    fontWeight: 800,
    marginBottom: 4,
  },
  loadingText: {
    color: "#c5d0e0",
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    marginTop: 16,
  },
  skeletonCard: {
    minHeight: 110,
    borderRadius: 18,
    background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    border: "1px solid rgba(138,148,166,0.12)",
  },
  errorBox: {
    marginTop: 22,
    padding: 18,
    borderRadius: 22,
    background: "rgba(255,107,107,0.1)",
    border: "1px solid rgba(255,107,107,0.24)",
  },
  errorTitle: {
    fontWeight: 800,
    marginBottom: 6,
    color: "#ffb6b6",
  },
  errorText: {
    color: "#f1d5d5",
    lineHeight: 1.7,
  },
  emptyState: {
    marginTop: 22,
    padding: 18,
    borderRadius: 22,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(138,148,166,0.14)",
  },
  emptyTitle: {
    fontWeight: 800,
    marginBottom: 6,
  },
  emptyText: {
    color: "#8a94a6",
  },
  resultCard: {
    background: "rgba(10,18,32,0.88)",
    padding: 24,
    borderRadius: 24,
    marginTop: 24,
    border: "1px solid rgba(138,148,166,0.14)",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  resultActions: {
    display: "flex",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
    alignItems: "center",
  },
  actionButton: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(138,148,166,0.18)",
    background: "rgba(255,255,255,0.04)",
    color: "#f4f7ff",
    cursor: "pointer",
  },
  copyMessage: {
    color: "#8a94a6",
    fontSize: 13,
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
    background: "#08111f",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(138,148,166,0.12)",
  },
  boxLabel: {
    fontSize: 12,
    color: "#8a94a6",
    marginBottom: 6,
  },
  boxValue: {
    fontWeight: 700,
    color: "#f4f7ff",
  },
  boxTone: {
    marginTop: 6,
    color: "#9bd7ff",
    fontSize: 12,
  },
  sectionRow: {
    marginTop: 12,
    padding: 12,
    background: "#08111f",
    borderRadius: 12,
    border: "1px solid rgba(138,148,166,0.12)",
  },
  sectionRowLabel: {
    fontSize: 12,
    color: "#8a94a6",
    marginBottom: 6,
  },
  sectionRowValue: {
    color: "#e2e8f0",
    lineHeight: 1.7,
  },
  cardWide: {
    background: "rgba(10,18,32,0.88)",
    padding: 20,
    borderRadius: 20,
    border: "1px solid rgba(138,148,166,0.14)",
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
    borderBottom: "1px solid rgba(138,148,166,0.12)",
  },
  scorePill: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(138,148,166,0.18)",
    background: "#0f172a",
    fontWeight: 700,
  },
  riskLevelRow: {
    display: "flex",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  riskChip: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(138,148,166,0.18)",
    background: "#0f172a",
    fontWeight: 700,
  },
  eventMeta: {
    display: "flex",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  progressOuter: {
    height: 8,
    background: "#0b1220",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
    border: "1px solid rgba(138,148,166,0.12)",
  },
  progressInner: {
    height: "100%",
    borderRadius: 999,
  },
  disclaimer: {
    marginTop: 28,
    background: "rgba(249,217,118,0.08)",
    border: "1px solid rgba(249,217,118,0.2)",
    borderRadius: 20,
    padding: 20,
  },
};
