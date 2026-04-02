import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ResearchHeader from "./components/research/ResearchHeader";
import SearchPanel from "./components/research/SearchPanel";
import ResultSummary from "./components/research/ResultSummary";
import StatusSummary from "./components/research/StatusSummary";
import AnalysisQualityNote from "./components/research/AnalysisQualityNote";
import OverviewPanel from "./components/research/OverviewPanel";
import MarketPanel from "./components/research/MarketPanel";
import SourcesPanel from "./components/research/SourcesPanel";
import FundamentalsPanel from "./components/research/FundamentalsPanel";
import ProjectCredibilityPanel from "./components/research/ProjectCredibilityPanel";
import OnChainPanel from "./components/research/OnChainPanel";
import NewsPanel from "./components/research/NewsPanel";
import RisksPanel from "./components/research/RisksPanel";
import VerdictPanel from "./components/research/VerdictPanel";
import TimelinePanel from "./components/research/TimelinePanel";
import ComparePanel from "./components/research/ComparePanel";
import SnapshotDetailPanel from "./components/research/SnapshotDetailPanel";
import ProviderHealthPanel from "./components/research/ProviderHealthPanel";
import { styles } from "./components/research/researchStyles";
import {
  buildAnalysisQualityExplanation,
  normalizeErrorMessage,
  statusMeta,
} from "./components/research/researchUtils";

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
  { key: "onchain", label: "On-Chain" },
  { key: "news", label: "News" },
  { key: "risks", label: "Risks" },
  { key: "verdict", label: "Verdict" },
];
const SEARCH_HISTORY_KEY = "rugcheck-history-v1";
const FAVORITES_KEY = "rugcheck-favorites-v1";

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

function shouldRetryAsQuick(mode, error) {
  if (mode !== "full") return false;
  if (!(error instanceof Error)) return false;
  const lower = error.message.toLowerCase();
  return lower.includes("timed out") || lower.includes("timeout") || lower.includes("malformed response");
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

export default function App() {
  const [query, setQuery] = useState(readInitialQuery);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [backendStatus, setBackendStatus] = useState("unknown");
  const [providerHealth, setProviderHealth] = useState(null);
  const [providerHealthLoading, setProviderHealthLoading] = useState(false);
  const [providerHealthError, setProviderHealthError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [copyMessage, setCopyMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [timelineData, setTimelineData] = useState([]);
  const [timelinePageInfo, setTimelinePageInfo] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState("");
  const [compareAgainstId, setCompareAgainstId] = useState("");
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState("");
  const [snapshotDetailId, setSnapshotDetailId] = useState("");
  const [snapshotDetailData, setSnapshotDetailData] = useState(null);
  const [snapshotDetailLoading, setSnapshotDetailLoading] = useState(false);
  const [snapshotDetailError, setSnapshotDetailError] = useState("");
  const timelineRequestRef = useRef(0);
  const compareRequestRef = useRef(0);
  const snapshotDetailRequestRef = useRef(0);
  const providerHealthRequestRef = useRef(0);

  const checkHealth = useCallback(async () => {
    try {
      await fetchJson(`${API_BASE}/api/health`, {}, 7000);
      setBackendStatus("online");
    } catch {
      setBackendStatus("degraded");
    }
  }, []);

  const loadProviderHealth = useCallback(async () => {
    const requestId = ++providerHealthRequestRef.current;
    setProviderHealthLoading(true);
    setProviderHealthError("");

    try {
      const json = await fetchJson(`${API_BASE}/api/health/providers`, {}, 9000);
      if (requestId !== providerHealthRequestRef.current) return;
      setProviderHealth(json || null);
    } catch (err) {
      if (requestId !== providerHealthRequestRef.current) return;
      setProviderHealth(null);
      setProviderHealthError(normalizeErrorMessage(err instanceof Error ? err.message : "Could not load provider health."));
    } finally {
      if (requestId === providerHealthRequestRef.current) {
        setProviderHealthLoading(false);
      }
    }
  }, []);

  const loadTimeline = useCallback(async (tokenQuery, options = {}) => {
    const cleanQuery = tokenQuery.trim();
    if (!cleanQuery) return;

    const { cursor = null, append = false } = options;
    const requestId = ++timelineRequestRef.current;
    setTimelineLoading(true);
    if (!append) {
      setTimelineError("");
    }

    try {
      const search = new URLSearchParams({
        query: cleanQuery,
        limit: "8",
      });
      if (cursor) {
        search.set("cursor", cursor);
      }

      const json = await fetchJson(`${API_BASE}/api/analyze/snapshots?${search.toString()}`, {}, 12000);

      if (requestId !== timelineRequestRef.current) return;

      const snapshots = Array.isArray(json?.snapshots) ? json.snapshots : [];
      setTimelineData((previous) => append ? [...previous, ...snapshots] : snapshots);
      setTimelinePageInfo(json?.pageInfo || null);
      setTimelineError("");
    } catch (err) {
      if (requestId !== timelineRequestRef.current) return;
      const message = err instanceof Error ? err.message : "Could not load snapshot history.";
      if (message.toLowerCase().includes("no snapshot history found") || message.toLowerCase().includes("snapshot_not_found")) {
        setTimelineData([]);
        setTimelinePageInfo(null);
        setCompareData(null);
        setCompareAgainstId("");
        setTimelineError("");
      } else {
        setTimelineError(normalizeErrorMessage(message));
      }
    } finally {
      if (requestId === timelineRequestRef.current) {
        setTimelineLoading(false);
      }
    }
  }, []);

  const loadComparison = useCallback(async (baseSnapshotId, againstSnapshotId) => {
    if (!baseSnapshotId || !againstSnapshotId || baseSnapshotId === againstSnapshotId) {
      setCompareData(null);
      setCompareError("");
      return;
    }

    const requestId = ++compareRequestRef.current;
    setCompareLoading(true);
    setCompareError("");

    try {
      const json = await fetchJson(
        `${API_BASE}/api/analyze/snapshots/${baseSnapshotId}/compare?against=${encodeURIComponent(againstSnapshotId)}`,
        {},
        12000,
      );

      if (requestId !== compareRequestRef.current) return;
      setCompareData(json?.comparison || null);
    } catch (err) {
      if (requestId !== compareRequestRef.current) return;
      setCompareData(null);
      setCompareError(normalizeErrorMessage(err instanceof Error ? err.message : "Could not load comparison."));
    } finally {
      if (requestId === compareRequestRef.current) {
        setCompareLoading(false);
      }
    }
  }, []);

  const loadSnapshotDetail = useCallback(async (snapshotId) => {
    if (!snapshotId) {
      setSnapshotDetailId("");
      setSnapshotDetailData(null);
      setSnapshotDetailError("");
      return;
    }

    const requestId = ++snapshotDetailRequestRef.current;
    setSnapshotDetailId(snapshotId);
    setSnapshotDetailLoading(true);
    setSnapshotDetailError("");

    try {
      const json = await fetchJson(`${API_BASE}/api/analyze/snapshots/${encodeURIComponent(snapshotId)}`, {}, 12000);
      if (requestId !== snapshotDetailRequestRef.current) return;
      setSnapshotDetailData(json?.snapshot || null);
    } catch (err) {
      if (requestId !== snapshotDetailRequestRef.current) return;
      setSnapshotDetailData(null);
      setSnapshotDetailError(normalizeErrorMessage(err instanceof Error ? err.message : "Could not load stored snapshot."));
    } finally {
      if (requestId === snapshotDetailRequestRef.current) {
        setSnapshotDetailLoading(false);
      }
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
    setNotice("");
    setTimelineData([]);
    setTimelinePageInfo(null);
    setTimelineError("");
    setCompareData(null);
    setCompareAgainstId("");
    setCompareError("");
    setSnapshotDetailId("");
    setSnapshotDetailData(null);
    setSnapshotDetailError("");
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
      void loadTimeline(cleanQuery, { append: false });
      checkHealth();
      loadProviderHealth();
    } catch (err) {
      if (shouldRetryAsQuick(mode, err)) {
        try {
          const fallbackJson = await fetchJson(`${API_BASE}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: cleanQuery, mode: "quick" }),
          });

          if (!isValidAnalysisResponse(fallbackJson)) {
            throw new Error("Malformed response");
          }

          setData(fallbackJson);
          setActiveTab("overview");
          setLastUpdated(new Date().toLocaleString());
          setHistory(saveSearchHistory(cleanQuery));
          setShareQuery(cleanQuery);
          setNotice("Loaded quick analysis because the full analysis took too long.");
          void loadTimeline(cleanQuery, { append: false });
          checkHealth();
          loadProviderHealth();
          return;
        } catch (fallbackErr) {
          setData(null);
          setError(normalizeErrorMessage(fallbackErr instanceof Error ? fallbackErr.message : "Analysis failed"));
          checkHealth();
          loadProviderHealth();
          return;
        }
      }

      setData(null);
      setError(normalizeErrorMessage(err instanceof Error ? err.message : "Analysis failed"));
      checkHealth();
      loadProviderHealth();
    } finally {
      setLoading(false);
    }
  }, [checkHealth, loadProviderHealth, loadTimeline]);

  useEffect(() => {
    setHistory(readSearchHistory());
    setFavorites(readFavorites());
    checkHealth();
    loadProviderHealth();
    analyze(readInitialQuery(), "quick");
  }, [analyze, checkHealth, loadProviderHealth]);

  useEffect(() => {
    if (!copyMessage) return undefined;
    const timeout = window.setTimeout(() => setCopyMessage(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyMessage]);

  useEffect(() => {
    if (!timelineData.length) {
      setCompareAgainstId("");
      setCompareData(null);
      setCompareError("");
      return;
    }

    const latestSnapshotId = timelineData[0]?.snapshotId;
    const selectable = timelineData.filter((item) => item.snapshotId !== latestSnapshotId);

    if (!selectable.length) {
      setCompareAgainstId("");
      setCompareData(null);
      setCompareError("");
      return;
    }

    if (!compareAgainstId || !selectable.some((item) => item.snapshotId === compareAgainstId)) {
      setCompareAgainstId(selectable[0].snapshotId);
    }
  }, [timelineData, compareAgainstId]);

  useEffect(() => {
    const latestSnapshotId = timelineData[0]?.snapshotId;
    if (!latestSnapshotId || !compareAgainstId || latestSnapshotId === compareAgainstId) {
      return;
    }

    void loadComparison(latestSnapshotId, compareAgainstId);
  }, [timelineData, compareAgainstId, loadComparison]);

  const asset = data?.asset;
  const marketData = data?.marketData;
  const security = data?.security;
  const scores = data?.scores;
  const aiReport = data?.aiReport;
  const officialLinks = data?.officialLinks;
  const whitepaperDocs = data?.whitepaperDocs;
  const newsIntelligence = data?.newsIntelligence;
  const onChainMetrics = data?.onChainMetrics;
  const snapshot = data?.snapshot;
  const sourceStatus = data?.sourceStatus;
  const meta = data?.meta;
  const confidence = data?.confidence;
  const fundamentals = data?.fundamentals;
  const projectCredibility = data?.projectCredibility;
  const providerDiagnostics = meta?.providerDiagnostics || [];
  const notableDiagnostics = providerDiagnostics.filter((entry) =>
    entry.status !== "success" ||
    ["partial", "weak", "missing", "unavailable"].includes(entry.coverage || ""),
  );
  const onChainFundamentals = fundamentals?.onChain;
  const warnings = data?.warnings || [];
  const backendMeta = statusMeta(backendStatus);
  const currentFavoriteKey = (asset?.symbol || query || "").trim().toUpperCase();
  const isFavorite = currentFavoriteKey ? favorites.includes(currentFavoriteKey) : false;
  const latestTimelineSnapshot = timelineData[0] || null;
  const compareSelectionOptions = latestTimelineSnapshot
    ? timelineData.filter((item) => item.snapshotId !== latestTimelineSnapshot.snapshotId)
    : [];
  const analysisQualityExplanation = useMemo(() => buildAnalysisQualityExplanation({
    confidence,
    providerDiagnostics,
    providerHealth,
    sourceStatus,
  }), [confidence, providerDiagnostics, providerHealth, sourceStatus]);

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

  function renderActiveTab() {
    if (!data) return null;
    switch (activeTab) {
      case "overview":
        return (
          <OverviewPanel
            asset={asset}
            meta={meta}
            fundamentals={fundamentals}
            aiReport={aiReport}
            warnings={warnings}
            confidence={confidence}
            sourceStatus={sourceStatus}
            notableDiagnostics={notableDiagnostics}
            officialLinks={officialLinks}
            snapshot={snapshot}
            scores={scores}
            styles={styles}
          />
        );
      case "market":
        return <MarketPanel aiReport={aiReport} marketData={marketData} sourceStatus={sourceStatus} providerDiagnostics={providerDiagnostics} providerHealth={providerHealth} freshnessEntry={meta?.sectionFreshness?.marketData} styles={styles} />;
      case "sources":
        return <SourcesPanel officialLinks={officialLinks} whitepaperDocs={whitepaperDocs} sourceStatus={sourceStatus} providerDiagnostics={providerDiagnostics} providerHealth={providerHealth} freshnessEntry={meta?.sectionFreshness?.officialLinksDocs} styles={styles} />;
      case "tokenomics":
        return <FundamentalsPanel fundamentals={fundamentals} aiReport={aiReport} marketData={marketData} styles={styles} />;
      case "team":
        return <ProjectCredibilityPanel projectCredibility={projectCredibility} fundamentals={fundamentals} aiReport={aiReport} scores={scores} sourceStatus={sourceStatus} providerDiagnostics={providerDiagnostics} providerHealth={providerHealth} freshnessEntry={meta?.sectionFreshness?.projectCredibility} styles={styles} />;
      case "onchain":
        return <OnChainPanel onChainMetrics={onChainMetrics} onChainFundamentals={onChainFundamentals} aiReport={aiReport} marketData={marketData} sourceStatus={sourceStatus} providerDiagnostics={providerDiagnostics} providerHealth={providerHealth} freshnessEntry={meta?.sectionFreshness?.onChainMetrics} styles={styles} />;
      case "news":
        return <NewsPanel newsIntelligence={newsIntelligence} snapshot={snapshot} styles={styles} />;
      case "risks":
        return <RisksPanel aiReport={aiReport} fundamentals={fundamentals} security={security} scores={scores} styles={styles} />;
      case "verdict":
        return <VerdictPanel aiReport={aiReport} scores={scores} riskVerdict={riskVerdict} styles={styles} />;
      default:
        return <OverviewPanel asset={asset} meta={meta} fundamentals={fundamentals} aiReport={aiReport} warnings={warnings} confidence={confidence} sourceStatus={sourceStatus} notableDiagnostics={notableDiagnostics} officialLinks={officialLinks} snapshot={snapshot} scores={scores} styles={styles} />;
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <ResearchHeader backendMeta={backendMeta} apiBase={API_BASE} styles={styles} />

      <div style={styles.container}>
        <SearchPanel
          query={query}
          setQuery={setQuery}
          analyze={analyze}
          loading={loading}
          quickSearches={QUICK_SEARCHES}
          history={history}
          favorites={favorites}
          clearHistory={clearHistory}
          lastUpdated={lastUpdated}
          styles={styles}
        />

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

        {notice ? (
          <div style={styles.noticeBox}>
            <div style={styles.noticeTitle}>Analysis loaded</div>
            <div style={styles.noticeText}>{notice}</div>
          </div>
        ) : null}

        {!data && !loading && !error ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>No analysis loaded yet</div>
            <div style={styles.emptyText}>Start with a quick search or enter a token manually to generate a report.</div>
          </div>
        ) : null}

        {data ? (
          <ResultSummary
            asset={asset}
            marketData={marketData}
            riskVerdict={riskVerdict}
            scores={scores}
            confidence={confidence}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            copyShareLink={copyShareLink}
            copyMessage={copyMessage}
            styles={styles}
          />
        ) : null}

        {data ? (
          <AnalysisQualityNote explanation={analysisQualityExplanation} styles={styles} />
        ) : null}

        {data ? (
          <>
            <StatusSummary
              confidence={confidence}
              meta={meta}
              activeTab={activeTab}
              researchTabs={RESEARCH_TABS}
              setActiveTab={setActiveTab}
              scores={scores}
              styles={styles}
            />
            <ProviderHealthPanel
              providerHealth={providerHealth}
              providerHealthLoading={providerHealthLoading}
              providerHealthError={providerHealthError}
              styles={styles}
            />
            {renderActiveTab()}
            <div style={styles.advancedGrid}>
              <TimelinePanel
                timelineLoading={timelineLoading}
                timelineError={timelineError}
                timelineData={timelineData}
                timelinePageInfo={timelinePageInfo}
                timelineLoadingMore={timelineLoading}
                loadTimeline={loadTimeline}
                latestTimelineSnapshot={latestTimelineSnapshot}
                asset={asset}
                query={query}
                onOpenSnapshot={loadSnapshotDetail}
                openedSnapshotId={snapshotDetailId}
                styles={styles}
              />
              <ComparePanel
                timelineData={timelineData}
                compareSelectionOptions={compareSelectionOptions}
                latestTimelineSnapshot={latestTimelineSnapshot}
                compareAgainstId={compareAgainstId}
                setCompareAgainstId={setCompareAgainstId}
                compareLoading={compareLoading}
                compareError={compareError}
                compareData={compareData}
                styles={styles}
              />
            </div>
            {(snapshotDetailId || snapshotDetailLoading || snapshotDetailError) ? (
              <SnapshotDetailPanel
                snapshotRecord={snapshotDetailData}
                loading={snapshotDetailLoading}
                error={snapshotDetailError}
                onClose={() => {
                  setSnapshotDetailId("");
                  setSnapshotDetailData(null);
                  setSnapshotDetailError("");
                }}
                styles={styles}
              />
            ) : null}
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

