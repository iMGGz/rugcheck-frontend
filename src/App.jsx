import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ResearchHeader from "./components/research/ResearchHeader";
import SearchPanel from "./components/research/SearchPanel";
import ScoreContributorsPanel from "./components/research/ScoreContributorsPanel";
import MarketPanel from "./components/research/MarketPanel";
import SourcesPanel from "./components/research/SourcesPanel";
import FundamentalsPanel from "./components/research/FundamentalsPanel";
import ProjectCredibilityPanel from "./components/research/ProjectCredibilityPanel";
import OnChainPanel from "./components/research/OnChainPanel";
import ProtocolIntelligencePanel from "./components/research/ProtocolIntelligencePanel";
import NewsPanel from "./components/research/NewsPanel";
import RisksPanel from "./components/research/RisksPanel";
import TimelinePanel from "./components/research/TimelinePanel";
import ComparePanel from "./components/research/ComparePanel";
import SnapshotDetailPanel from "./components/research/SnapshotDetailPanel";
import WatchlistPanel from "./components/research/WatchlistPanel";
import ResearchContextPanel from "./components/research/ResearchContextPanel";
import ResearchErrorBoundary from "./components/research/ResearchErrorBoundary";
import DecisionHeroCard from "./components/research/DecisionHeroCard";
import AllocationOutcomeCard from "./components/research/AllocationOutcomeCard";
import TokenDemandCard from "./components/research/TokenDemandCard";
import FailureModeCard from "./components/research/FailureModeCard";
import EvidenceConfidenceCard from "./components/research/EvidenceConfidenceCard";
import ConvictionDriversMatrix from "./components/research/ConvictionDriversMatrix";
import ThesisDriftTimeline from "./components/research/ThesisDriftTimeline";
import SearchSelectorPanel from "./components/research/SearchSelectorPanel";
import RiskFlagsStrip from "./components/research/RiskFlagsStrip";
import MethodologyPanel from "./components/research/MethodologyPanel";
import AuditSection from "./components/research/AuditSection";
import { Card, ListBlock, SectionRow, TabButton } from "./components/research/researchPrimitives";
import { styles } from "./components/research/researchStyles";
import {
  assertAnalysisShape,
  buildAnalysisQualityExplanation,
  buildDecisionTerminalModel,
  buildAssetLookupQuery,
  buildMethodologyPrinciples,
  buildWatchlistAssetFromAnalysis,
  buildWatchlistFreshnessMeta,
  buildWatchlistKey,
  normalizeWatchlistAsset,
  normalizeErrorMessage,
  safeArray,
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
  { key: "overview", label: "Decision" },
  { key: "thesis", label: "Thesis" },
  { key: "risks", label: "Risks" },
  { key: "evidence", label: "Evidence" },
  { key: "history", label: "History" },
  { key: "drift", label: "Drift" },
];
const SEARCH_HISTORY_KEY = "rugcheck-history-v1";
const WATCHLIST_KEY = "rugcheck-watchlist-v2";
const WATCHLIST_CHECKS_KEY = "rugcheck-watchlist-checks-v1";
const WATCHLIST_REFRESH_RESULTS_KEY = "rugcheck-watchlist-refresh-results-v1";

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
    (payload.analysis?.scores || payload.scores) &&
    (payload.analysis?.confidence || payload.confidence),
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

function readWatchlistItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeWatchlistAsset(item))
      .filter(Boolean)
      .slice(0, 12);
  } catch {
    return [];
  }
}

function saveWatchlistItems(nextItems) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(nextItems.slice(0, 12)));
}

function readWatchlistChecks() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(WATCHLIST_CHECKS_KEY);
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveWatchlistChecks(nextChecks) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WATCHLIST_CHECKS_KEY, JSON.stringify(nextChecks || {}));
}

function readWatchlistRefreshResults() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(WATCHLIST_REFRESH_RESULTS_KEY);
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveWatchlistRefreshResults(nextResults) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WATCHLIST_REFRESH_RESULTS_KEY, JSON.stringify(nextResults || {}));
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

function hasStrongSavedIdentity(item) {
  return Boolean(item?.contractAddress || item?.coingeckoId || item?.coinmarketcapId);
}

function buildWatchlistStateMap(items) {
  return new Map((items || []).map((entry) => [buildWatchlistKey(entry.asset), entry]));
}

function summarizeBatchRefreshResult(items, statesBefore, statesAfter, failures) {
  const staleItems = [];
  const limitedCoverageItems = [];
  const meaningfulChanges = [];
  let successful = 0;

  for (const item of items) {
    const key = buildWatchlistKey(item);
    const beforeState = statesBefore.get(key) || null;
    const afterState = statesAfter.get(key) || null;
    const afterSnapshot = afterState?.latestSnapshot || null;
    const beforeSnapshot = beforeState?.latestSnapshot || null;
    const itemLabel = item.symbol || item.name || key;

    if (!failures.includes(key)) {
      successful += 1;
    }

    const freshness = buildWatchlistFreshnessMeta(afterSnapshot);
    if (freshness.label === "Stale") {
      staleItems.push(itemLabel);
    }
    if (freshness.label === "Limited coverage") {
      limitedCoverageItems.push(itemLabel);
    }

    const snapshotChanged = Boolean(
      afterSnapshot &&
      (!beforeSnapshot || beforeSnapshot.snapshotId !== afterSnapshot.snapshotId),
    );
    const meaningfulImpact = afterSnapshot?.compactImpact?.overall && ["medium", "high"].includes(afterSnapshot.compactImpact.overall);

    if (snapshotChanged && meaningfulImpact) {
      meaningfulChanges.push({
        label: itemLabel,
        impact: afterSnapshot.compactImpact.overall,
      });
    }
  }

  return {
    total: items.length,
    successful,
    failed: failures.length,
    limitedCoverageCount: limitedCoverageItems.length,
    staleCount: staleItems.length,
    meaningfulChanges,
    failedItems: items
      .filter((item) => failures.includes(buildWatchlistKey(item)))
      .map((item) => item.symbol || item.name || buildWatchlistKey(item)),
  };
}

function determineWatchlistRefreshResult(beforeState, afterState) {
  const beforeSnapshot = beforeState?.latestSnapshot || null;
  const afterSnapshot = afterState?.latestSnapshot || null;

  if (!afterSnapshot) {
    return {
      status: "no_change",
      detail: "Refresh completed, but no stored snapshot is available yet.",
    };
  }

  if (!beforeSnapshot) {
    return {
      status: "updated",
      detail: "First stored snapshot was created for this asset.",
    };
  }

  if (beforeSnapshot.snapshotId === afterSnapshot.snapshotId) {
    return {
      status: "no_change",
      detail: "Refresh completed, but the latest stored snapshot did not change.",
    };
  }

  if (afterSnapshot.compactImpact?.overall && afterSnapshot.compactImpact.overall !== "none") {
    return {
      status: "updated",
      detail: `New snapshot stored with ${afterSnapshot.compactImpact.overall} impact.`,
    };
  }

  return {
    status: "no_change",
    detail: "A new snapshot was stored, but no major change was detected.",
  };
}

function getWatchlistStatusSnapshot(item, watchlistStates, watchlistChecks, watchlistRefreshResults) {
  const key = buildWatchlistKey(item);
  const state = watchlistStates.find((entry) => buildWatchlistKey(entry.asset) === key) || null;
  const latestSnapshot = state?.latestSnapshot || null;
  const freshness = buildWatchlistFreshnessMeta(latestSnapshot);
  const refreshResult = watchlistRefreshResults?.[key] || null;
  const checkedAt = watchlistChecks?.[key] || null;

  return {
    key,
    state,
    latestSnapshot,
    freshness,
    refreshResult,
    checkedAt,
  };
}

function getWatchlistSortTimestamp(statusSnapshot) {
  const checkedAtMs = statusSnapshot.checkedAt ? new Date(statusSnapshot.checkedAt).getTime() : 0;
  const snapshotMs = statusSnapshot.latestSnapshot?.generatedAt ? new Date(statusSnapshot.latestSnapshot.generatedAt).getTime() : 0;
  return Math.max(checkedAtMs || 0, snapshotMs || 0);
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
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [watchlistChecks, setWatchlistChecks] = useState({});
  const [watchlistRefreshResults, setWatchlistRefreshResults] = useState({});
  const [watchlistStates, setWatchlistStates] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");
  const [watchlistRefreshError, setWatchlistRefreshError] = useState("");
  const [watchlistRefreshNotice, setWatchlistRefreshNotice] = useState("");
  const [watchlistBatchSummary, setWatchlistBatchSummary] = useState(null);
  const [watchlistRefreshingKeys, setWatchlistRefreshingKeys] = useState([]);
  const [watchlistBatchRefresh, setWatchlistBatchRefresh] = useState(null);
  const [watchlistFilter, setWatchlistFilter] = useState("all");
  const [watchlistSort, setWatchlistSort] = useState("newest_checked");
  const [copyMessage, setCopyMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingResolution, setPendingResolution] = useState(null);
  const [activeWatchlistAsset, setActiveWatchlistAsset] = useState(null);
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
  const watchlistRequestRef = useRef(0);
  const searchSectionRef = useRef(null);
  const methodologySectionRef = useRef(null);

  const scrollToRef = useCallback((targetRef) => {
    targetRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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

  const loadWatchlistState = useCallback(async (items) => {
    if (!items.length) {
      setWatchlistStates([]);
      setWatchlistError("");
      setWatchlistLoading(false);
      return [];
    }

    const requestId = ++watchlistRequestRef.current;
    setWatchlistLoading(true);
    setWatchlistError("");

    try {
      const json = await fetchJson(`${API_BASE}/api/watchlist/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }, 10000);

      if (requestId !== watchlistRequestRef.current) return;
      const nextItems = Array.isArray(json?.items) ? json.items : [];
      setWatchlistStates(nextItems);
      return nextItems;
    } catch (err) {
      if (requestId !== watchlistRequestRef.current) return;
      setWatchlistStates([]);
      setWatchlistError(normalizeErrorMessage(err instanceof Error ? err.message : "Could not load watchlist state."));
      return [];
    } finally {
      if (requestId === watchlistRequestRef.current) {
        setWatchlistLoading(false);
      }
    }
  }, []);

  const updateWatchlistRefreshingKey = useCallback((key, active) => {
    setWatchlistRefreshingKeys((current) => active
      ? current.includes(key) ? current : [...current, key]
      : current.filter((entry) => entry !== key));
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

  const resetAnalysisSubviews = useCallback(() => {
    setTimelineData([]);
    setTimelinePageInfo(null);
    setTimelineError("");
    setCompareData(null);
    setCompareAgainstId("");
    setCompareError("");
    setSnapshotDetailId("");
    setSnapshotDetailData(null);
    setSnapshotDetailError("");
  }, []);

  const requestAnalysisPayload = useCallback(async (cleanQuery, mode = "full", selection = null) => {
    try {
      const json = await fetchJson(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cleanQuery, mode, ...(selection ? { selection } : {}) }),
      });

      if (!isValidAnalysisResponse(json)) {
        throw new Error("Malformed response");
      }
      return { payload: json, notice: "" };
    } catch (err) {
      if (shouldRetryAsQuick(mode, err)) {
        const fallbackJson = await fetchJson(`${API_BASE}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: cleanQuery, mode: "quick", ...(selection ? { selection } : {}) }),
        });

        if (!isValidAnalysisResponse(fallbackJson)) {
          throw new Error("Malformed response");
        }

        return {
          payload: fallbackJson,
          notice: "Loaded quick analysis because the full analysis took too long.",
        };
      }

      throw err;
    }
  }, []);

  const executeAnalyzeRequest = useCallback(async (cleanQuery, mode = "full", selection = null) => {
    setError("");
    setNotice("");
    setPendingResolution(null);
    resetAnalysisSubviews();

    try {
      const { payload, notice: nextNotice } = await requestAnalysisPayload(cleanQuery, mode, selection);
      setData(payload);
      setActiveWatchlistAsset(buildWatchlistAssetFromAnalysis(payload.asset, selection));
      setActiveTab("overview");
      setLastUpdated(new Date().toLocaleString());
      setHistory(saveSearchHistory(cleanQuery));
      setShareQuery(cleanQuery);
      if (nextNotice) {
        setNotice(nextNotice);
      }
      void loadTimeline(buildAssetLookupQuery(payload.asset, cleanQuery), { append: false });
      checkHealth();
      loadProviderHealth();
    } catch (err) {
      setData(null);
      setActiveWatchlistAsset(null);
      setError(normalizeErrorMessage(err instanceof Error ? err.message : "Analysis failed"));
      checkHealth();
      loadProviderHealth();
    }
  }, [checkHealth, loadProviderHealth, loadTimeline, requestAnalysisPayload, resetAnalysisSubviews]);

  const analyze = useCallback(async (nextQuery, mode = "full") => {
    const cleanQuery = nextQuery.trim();
    if (!cleanQuery) {
      setError("Enter a token symbol, project name, or contract address.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const search = new URLSearchParams({ q: cleanQuery });
      const searchResponse = await fetchJson(`${API_BASE}/api/search/tokens?${search.toString()}`, {}, 10000);
      const resolution = searchResponse?.resolution;

      if (!resolution || resolution.status === "not_found") {
        setPendingResolution(null);
        setData(null);
        setError("Token not found. Try a symbol, project name, or EVM contract address.");
        return;
      }

      if (resolution.status === "ambiguous") {
        setPendingResolution({
          query: cleanQuery,
          mode,
          ambiguityReason: resolution.ambiguityReason || null,
          candidates: Array.isArray(resolution.candidates) ? resolution.candidates : [],
        });
        return;
      }

      await executeAnalyzeRequest(cleanQuery, mode, resolution.directMatch || null);
    } catch (err) {
      setPendingResolution(null);
      setError(normalizeErrorMessage(err instanceof Error ? err.message : "Analysis failed"));
      checkHealth();
      loadProviderHealth();
    } finally {
      setLoading(false);
    }
  }, [checkHealth, executeAnalyzeRequest, loadProviderHealth]);

  const analyzeSelectedCandidate = useCallback(async (candidate) => {
    if (!pendingResolution?.query) return;

    setLoading(true);
    try {
      await executeAnalyzeRequest(pendingResolution.query, pendingResolution.mode || "full", candidate);
    } finally {
      setLoading(false);
    }
  }, [executeAnalyzeRequest, pendingResolution]);

  useEffect(() => {
    setHistory(readSearchHistory());
    setWatchlistItems(readWatchlistItems());
    setWatchlistChecks(readWatchlistChecks());
    setWatchlistRefreshResults(readWatchlistRefreshResults());
    checkHealth();
    loadProviderHealth();
    analyze(readInitialQuery(), "quick");
  }, [analyze, checkHealth, loadProviderHealth]);

  useEffect(() => {
    void loadWatchlistState(watchlistItems);
  }, [watchlistItems, loadWatchlistState]);

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

  const analysis = data?.analysis || null;
  const asset = data?.asset;
  const marketData = data?.marketData;
  const security = data?.security;
  const scores = analysis?.scores || data?.scores;
  const aiReport = data?.aiReport;
  const officialLinks = data?.officialLinks;
  const whitepaperDocs = data?.whitepaperDocs;
  const newsIntelligence = data?.newsIntelligence;
  const onChainMetrics = data?.onChainMetrics;
  const snapshot = data?.snapshot;
  const sourceStatus = data?.sourceStatus;
  const meta = data?.meta;
  const confidence = analysis?.confidence || data?.confidence;
  const fundamentals = analysis?.fundamentals || data?.fundamentals;
  const projectCredibility = data?.projectCredibility;
  const protocolUsage = data?.protocolUsage;
  const protocolEconomics = data?.protocolEconomics;
  const providerDiagnostics = useMemo(() => safeArray(meta?.providerDiagnostics), [meta?.providerDiagnostics]);
  const notableDiagnostics = useMemo(() => providerDiagnostics.filter((entry) =>
    entry.status !== "success" ||
    ["partial", "weak", "missing", "unavailable"].includes(entry.coverage || ""),
  ), [providerDiagnostics]);
  const onChainFundamentals = fundamentals?.onChain;
  const protocolUsageFundamentals = fundamentals?.protocolUsage;
  const protocolEconomicsFundamentals = fundamentals?.protocolEconomics;
  const scoreContributors = analysis?.contributors || data?.scoreContributors;
  const warnings = data?.warnings || [];
  const backendMeta = statusMeta(backendStatus);
  const currentWatchlistKey = buildWatchlistKey(activeWatchlistAsset || asset);
  const isFavorite = currentWatchlistKey ? watchlistItems.some((item) => buildWatchlistKey(item) === currentWatchlistKey) : false;
  const timelineQuery = buildAssetLookupQuery(asset, query);
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
  const decisionModel = useMemo(() => buildDecisionTerminalModel({
    analysis,
    scores,
    confidence,
    scoreContributors,
    fundamentals,
    warnings,
    asset,
  }), [analysis, scores, confidence, scoreContributors, fundamentals, warnings, asset]);
  const methodologyPrinciples = useMemo(() => buildMethodologyPrinciples(), []);

  assertAnalysisShape(data, "live-analysis");

  const visibleWatchlistItems = useMemo(() => {
    const enriched = watchlistItems.map((item) => ({
      item,
      status: getWatchlistStatusSnapshot(item, watchlistStates, watchlistChecks, watchlistRefreshResults),
    }));

    const filtered = enriched.filter(({ status }) => {
      if (watchlistFilter === "stale") {
        return status.freshness.label === "Stale";
      }
      if (watchlistFilter === "refresh_failed") {
        return status.refreshResult?.status === "failed";
      }
      if (watchlistFilter === "updated_recently") {
        return status.refreshResult?.status === "updated";
      }
      if (watchlistFilter === "limited_coverage") {
        return status.freshness.label === "Limited coverage";
      }
      return true;
    });

    filtered.sort((left, right) => {
      if (watchlistSort === "oldest_checked") {
        return getWatchlistSortTimestamp(left.status) - getWatchlistSortTimestamp(right.status);
      }
      if (watchlistSort === "stale_first") {
        const leftRank = left.status.freshness.label === "Stale" ? 0 : 1;
        const rightRank = right.status.freshness.label === "Stale" ? 0 : 1;
        if (leftRank !== rightRank) return leftRank - rightRank;
        return getWatchlistSortTimestamp(right.status) - getWatchlistSortTimestamp(left.status);
      }
      if (watchlistSort === "recently_updated_first") {
        const leftRank = left.status.refreshResult?.status === "updated" ? 0 : 1;
        const rightRank = right.status.refreshResult?.status === "updated" ? 0 : 1;
        if (leftRank !== rightRank) return leftRank - rightRank;
        return getWatchlistSortTimestamp(right.status) - getWatchlistSortTimestamp(left.status);
      }
      return getWatchlistSortTimestamp(right.status) - getWatchlistSortTimestamp(left.status);
    });

    return filtered.map(({ item }) => item);
  }, [watchlistItems, watchlistStates, watchlistChecks, watchlistRefreshResults, watchlistFilter, watchlistSort]);

  const riskVerdict = useMemo(() => {
    if (!scores) return "UNKNOWN";
    if (scores.fragilityScore >= 70 || scores.securityScore <= 20) return "HIGH RISK";
    if (scores.overallScore < 55) return "CAUTION";
    return "LOWER RISK";
  }, [scores]);

  function toggleFavorite() {
    const nextAsset = activeWatchlistAsset || buildWatchlistAssetFromAnalysis(asset, null);
    const normalized = normalizeWatchlistAsset(nextAsset);
    if (!normalized) return;

    const nextItems = watchlistItems.some((item) => buildWatchlistKey(item) === buildWatchlistKey(normalized))
      ? watchlistItems.filter((item) => buildWatchlistKey(item) !== buildWatchlistKey(normalized))
      : [normalized, ...watchlistItems.filter((item) => buildWatchlistKey(item) !== buildWatchlistKey(normalized))].slice(0, 12);

    setWatchlistItems(nextItems);
    saveWatchlistItems(nextItems);
  }

  function removeWatchlistItem(itemToRemove) {
    const keyToRemove = buildWatchlistKey(itemToRemove);
    const nextItems = watchlistItems.filter((item) => buildWatchlistKey(item) !== keyToRemove);
    setWatchlistItems(nextItems);
    saveWatchlistItems(nextItems);
    setWatchlistChecks((current) => {
      const next = { ...current };
      delete next[keyToRemove];
      saveWatchlistChecks(next);
      return next;
    });
    setWatchlistRefreshResults((current) => {
      const next = { ...current };
      delete next[keyToRemove];
      saveWatchlistRefreshResults(next);
      return next;
    });
  }

  async function refreshWatchlistItem(item, options = {}) {
    const key = buildWatchlistKey(item);
    const queryValue = item.symbol || item.name || item.coingeckoId || item.contractAddress || "";
    if (!queryValue) return;

    if (!hasStrongSavedIdentity(item)) {
      setWatchlistRefreshError("One saved item is missing a stable asset identity. Open it once and save it again before refreshing from the watchlist.");
      return false;
    }

    const { silent = false } = options;
    if (!silent) {
      setWatchlistRefreshError("");
      setWatchlistRefreshNotice("");
      setWatchlistBatchSummary(null);
    }

    const beforeState = buildWatchlistStateMap(watchlistStates).get(key) || null;
    updateWatchlistRefreshingKey(key, true);
    try {
      await requestAnalysisPayload(queryValue, "full", item);
      const nextStates = await loadWatchlistState(watchlistItems);
      const afterState = buildWatchlistStateMap(nextStates).get(key) || null;
      const checkedAt = new Date().toISOString();
      const nextResult = {
        ...determineWatchlistRefreshResult(beforeState, afterState),
        checkedAt,
      };
      setWatchlistRefreshResults((current) => {
        const next = {
          ...current,
          [key]: nextResult,
        };
        saveWatchlistRefreshResults(next);
        return next;
      });
      if (!silent) {
        setWatchlistRefreshNotice(`Refreshed ${item.symbol || item.name || "watchlist item"}.`);
        checkHealth();
        loadProviderHealth();
      }
      return true;
    } catch (err) {
      const message = normalizeErrorMessage(err instanceof Error ? err.message : "Watchlist refresh failed.");
      const checkedAt = new Date().toISOString();
      setWatchlistRefreshResults((current) => {
        const next = {
          ...current,
          [key]: {
            status: "failed",
            detail: message,
            checkedAt,
          },
        };
        saveWatchlistRefreshResults(next);
        return next;
      });
      setWatchlistRefreshError(message);
      return false;
    } finally {
      const checkedAt = new Date().toISOString();
      setWatchlistChecks((current) => {
        const next = {
          ...current,
          [key]: checkedAt,
        };
        saveWatchlistChecks(next);
        return next;
      });
      updateWatchlistRefreshingKey(key, false);
    }
  }

  async function refreshWatchlistBatch() {
    const eligibleItems = watchlistItems.filter((item) => hasStrongSavedIdentity(item));
    if (!eligibleItems.length) {
      setWatchlistRefreshError("No watchlist items have a strong saved identity yet. Open and save a resolved token first.");
      return;
    }

    setWatchlistRefreshError("");
    setWatchlistRefreshNotice("");
    setWatchlistBatchSummary(null);
    setWatchlistBatchRefresh({ completed: 0, total: eligibleItems.length });

    const failures = [];
    const previousStates = buildWatchlistStateMap(watchlistStates);

    for (let index = 0; index < eligibleItems.length; index += 1) {
      const item = eligibleItems[index];
      const success = await refreshWatchlistItem(item, { silent: true });
      if (!success) {
        failures.push(buildWatchlistKey(item));
      }
      setWatchlistBatchRefresh({ completed: index + 1, total: eligibleItems.length });
    }

    const nextStates = await loadWatchlistState(watchlistItems);
    const batchSummary = summarizeBatchRefreshResult(
      eligibleItems,
      previousStates,
      buildWatchlistStateMap(nextStates),
      failures,
    );
    setWatchlistBatchSummary(batchSummary);

    if (failures.length) {
      setWatchlistRefreshError(`Some watchlist items could not be refreshed: ${batchSummary.failedItems.slice(0, 3).join(", ")}.`);
    } else {
      setWatchlistRefreshNotice(`Refreshed ${eligibleItems.length} watchlist item${eligibleItems.length === 1 ? "" : "s"}.`);
    }

    setWatchlistBatchRefresh(null);
    checkHealth();
    loadProviderHealth();
  }

  async function openWatchlistItem(item) {
    const nextQuery = item.symbol || item.name || item.coingeckoId || item.contractAddress || "";
    if (!nextQuery) return;
    setQuery(nextQuery);
    setLoading(true);
    try {
      if (hasStrongSavedIdentity(item)) {
        await executeAnalyzeRequest(nextQuery, "full", item);
      } else {
        await analyze(nextQuery, "full");
      }
    } finally {
      setLoading(false);
    }
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
          <>
            <div style={styles.advancedGrid}>
              <AllocationOutcomeCard model={decisionModel} styles={styles} />
              <Card title="Decision Memo" subtitle="Answer first. Reasoning second. Audit third." styles={styles}>
                <SectionRow label="Primary Weakness" value={decisionModel.primaryWeakness} styles={styles} />
                <SectionRow label="Failure Mode" value={decisionModel.failureMode?.primary || "Unavailable"} styles={styles} />
                {decisionModel.whyNotNow ? (
                  <SectionRow label="Why Not Now" value={decisionModel.whyNotNow} styles={styles} />
                ) : null}
                <SectionRow label="Structured Thesis Summary" value={decisionModel.summaryMemo} styles={styles} />
              </Card>
              <EvidenceConfidenceCard model={decisionModel} styles={styles} />
            </div>

            <div style={styles.advancedGrid}>
              <Card title="Structural Signals" subtitle="Score stays visible, but it does not lead the decision." styles={styles}>
                <SectionRow label="Structural Quality Score" value={decisionModel.overallScore !== null ? `${decisionModel.overallScore}/100` : "Unavailable"} styles={styles} />
                <SectionRow label="Confidence in Thesis Support" value={decisionModel.confidenceLabel || "Unavailable"} styles={styles} />
                <ListBlock
                  title="Top decision drivers"
                  items={decisionModel.decisionDrivers}
                  emptyText="No dominant decision drivers were surfaced."
                  color="#9bd7ff"
                  styles={styles}
                />
              </Card>
              <Card title="Constraint Summary" subtitle="What blocks full conviction right now." styles={styles}>
                <ListBlock title="Blockers" items={decisionModel.blockers} emptyText="No explicit blockers were surfaced." color="#ffb6b6" styles={styles} />
                <ListBlock title="Required conditions" items={decisionModel.requiredConditions} emptyText="No additional conditions were recorded." color="#9bd7ff" styles={styles} />
              </Card>
            </div>

            <details style={styles.auditSection}>
              <summary style={styles.auditSummary}>
                <span>Advanced Quant Signals</span>
                <span style={styles.auditSummaryMeta}>Collapsed by default</span>
              </summary>
              <div style={styles.auditBody}>
                <ListBlock
                  title=""
                  items={[
                    "Max Fib Retracement",
                    "Drawdown vs ATH",
                    "Cycle Multiples",
                    "Unlock Overhang",
                    "Supply Pressure",
                    "Relative Valuation",
                    "Yield Quality",
                  ]}
                  emptyText=""
                  color="#d5dcec"
                  styles={styles}
                />
              </div>
            </details>
          </>
        );
      case "thesis":
        return (
          <>
            <div style={styles.advancedGrid}>
              <TokenDemandCard model={decisionModel} styles={styles} />
              <FailureModeCard model={decisionModel} styles={styles} />
              <ConvictionDriversMatrix model={decisionModel} styles={styles} />
            </div>
            <ScoreContributorsPanel scoreContributors={scoreContributors} styles={styles} />
          </>
        );
      case "risks":
        return (
          <>
            <RiskFlagsStrip items={decisionModel.auditAlerts} title="Policy constraints and dominant flags" styles={styles} />
            <div style={styles.advancedGrid}>
              <FailureModeCard model={decisionModel} styles={styles} />
              <Card title="Allocation Constraints" subtitle="When the system refuses softness, it should be obvious why." styles={styles}>
                <ListBlock title="Blockers" items={decisionModel.blockers} emptyText="No explicit blockers were surfaced." color="#ffb6b6" styles={styles} />
                <ListBlock title="Required conditions" items={decisionModel.requiredConditions} emptyText="No additional conditions were recorded." color="#9bd7ff" styles={styles} />
                <ListBlock title="Key alerts" items={decisionModel.keyAlerts} emptyText="No critical alerts were raised." color="#f9d976" styles={styles} />
              </Card>
            </div>
            <RisksPanel aiReport={aiReport} fundamentals={fundamentals} security={security} scores={scores} styles={styles} />
          </>
        );
      case "evidence":
        return (
          <>
            <AuditSection title="Market Structure" subtitle="Liquidity, turnover, market context" defaultOpen styles={styles}>
              <MarketPanel aiReport={aiReport} marketData={marketData} sourceStatus={sourceStatus} providerDiagnostics={providerDiagnostics} providerHealth={providerHealth} freshnessEntry={meta?.sectionFreshness?.marketData} styles={styles} />
            </AuditSection>
            <AuditSection title="Tokenomics" subtitle="Supply, unlocks, dilution, value accrual" defaultOpen styles={styles}>
              <FundamentalsPanel fundamentals={fundamentals} aiReport={aiReport} marketData={marketData} styles={styles} />
            </AuditSection>
            <AuditSection title="Governance" subtitle="Credibility, execution, governance structure" styles={styles}>
              <ProjectCredibilityPanel projectCredibility={projectCredibility} fundamentals={fundamentals} aiReport={aiReport} scores={scores} sourceStatus={sourceStatus} providerDiagnostics={providerDiagnostics} providerHealth={providerHealth} freshnessEntry={meta?.sectionFreshness?.projectCredibility} styles={styles} />
            </AuditSection>
            <AuditSection title="On-Chain" subtitle="Distribution, holder structure, activity" styles={styles}>
              <OnChainPanel onChainMetrics={onChainMetrics} onChainFundamentals={onChainFundamentals} aiReport={aiReport} marketData={marketData} sourceStatus={sourceStatus} providerDiagnostics={providerDiagnostics} providerHealth={providerHealth} freshnessEntry={meta?.sectionFreshness?.onChainMetrics} styles={styles} />
              <ProtocolIntelligencePanel
                protocolUsage={protocolUsage}
                protocolEconomics={protocolEconomics}
                protocolUsageFundamentals={protocolUsageFundamentals}
                protocolEconomicsFundamentals={protocolEconomicsFundamentals}
                sourceStatus={sourceStatus}
                providerDiagnostics={providerDiagnostics}
                providerHealth={providerHealth}
                protocolUsageFreshnessEntry={meta?.sectionFreshness?.protocolUsage}
                protocolEconomicsFreshnessEntry={meta?.sectionFreshness?.protocolEconomics}
                styles={styles}
              />
            </AuditSection>
            <AuditSection title="Sources" subtitle="Official links, docs, documentation quality" styles={styles}>
              <SourcesPanel officialLinks={officialLinks} whitepaperDocs={whitepaperDocs} sourceStatus={sourceStatus} providerDiagnostics={providerDiagnostics} providerHealth={providerHealth} freshnessEntry={meta?.sectionFreshness?.officialLinksDocs} styles={styles} />
            </AuditSection>
            <AuditSection title="Provider Diagnostics" subtitle="Advanced evidence provenance" styles={styles}>
              <ResearchContextPanel
                analysisQualityExplanation={analysisQualityExplanation}
                confidence={confidence}
                meta={meta}
                sourceStatus={sourceStatus}
                notableDiagnostics={notableDiagnostics}
                providerHealth={providerHealth}
                providerHealthLoading={providerHealthLoading}
                providerHealthError={providerHealthError}
                styles={styles}
              />
            </AuditSection>
            <AuditSection title="Catalysts" subtitle="News and recent changes" styles={styles}>
              <NewsPanel newsIntelligence={newsIntelligence} snapshot={snapshot} styles={styles} />
            </AuditSection>
          </>
        );
      case "history":
        return (
          <TimelinePanel
            timelineLoading={timelineLoading}
            timelineError={timelineError}
            timelineData={timelineData}
            timelinePageInfo={timelinePageInfo}
            timelineLoadingMore={timelineLoading}
            loadTimeline={loadTimeline}
            latestTimelineSnapshot={latestTimelineSnapshot}
            asset={asset}
            query={timelineQuery}
            onOpenSnapshot={loadSnapshotDetail}
            openedSnapshotId={snapshotDetailId}
            styles={styles}
          />
        );
      case "drift":
        return (
          <div style={styles.advancedGrid}>
            <ThesisDriftTimeline model={decisionModel} compareData={compareData} styles={styles} />
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
        );
      default:
        return null;
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <ResearchHeader
        backendMeta={backendMeta}
        apiBase={API_BASE}
        onRunAnalysis={() => scrollToRef(searchSectionRef)}
        onViewMethodology={() => scrollToRef(methodologySectionRef)}
        styles={styles}
      />

      <div style={styles.container}>
        <div style={styles.trustStrip}>
          <span style={styles.trustStripItem}>Research Support Only</span>
          <span style={styles.trustStripItem}>No Investment Advice</span>
          <span style={styles.trustStripItem}>Independent Verification Required</span>
          <span style={styles.trustStripItem}>Third-Party Data Dependent</span>
        </div>

        <div ref={searchSectionRef}>
          <SearchPanel
            query={query}
            setQuery={setQuery}
            analyze={analyze}
            loading={loading}
            quickSearches={QUICK_SEARCHES}
            history={history}
            clearHistory={clearHistory}
            lastUpdated={lastUpdated}
            styles={styles}
          />
        </div>

        <WatchlistPanel
          watchlistItems={visibleWatchlistItems}
          watchlistTotalCount={watchlistItems.length}
          watchlistStates={watchlistStates}
          watchlistChecks={watchlistChecks}
          watchlistRefreshResults={watchlistRefreshResults}
          watchlistLoading={watchlistLoading}
          watchlistError={watchlistError}
          watchlistRefreshError={watchlistRefreshError}
          watchlistRefreshNotice={watchlistRefreshNotice}
          watchlistBatchSummary={watchlistBatchSummary}
          watchlistRefreshingKeys={watchlistRefreshingKeys}
          watchlistBatchRefresh={watchlistBatchRefresh}
          watchlistFilter={watchlistFilter}
          watchlistSort={watchlistSort}
          onChangeWatchlistFilter={setWatchlistFilter}
          onChangeWatchlistSort={setWatchlistSort}
          onOpenItem={openWatchlistItem}
          onRefreshItem={refreshWatchlistItem}
          onRefreshAll={refreshWatchlistBatch}
          onRemoveItem={removeWatchlistItem}
          styles={styles}
        />

        {loading ? (
          <div style={styles.loadingCard}>
            <div style={styles.loadingPulse} />
            <div>
              <div style={styles.loadingTitle}>Building your analysis</div>
              <div style={styles.loadingText}>Fetching evidence, compressing thesis support, and preparing a deterministic decision memo.</div>
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
            <div style={styles.noticeTitle}>Decision memo loaded</div>
            <div style={styles.noticeText}>{notice}</div>
          </div>
        ) : null}

        {pendingResolution ? (
          <SearchSelectorPanel
            pendingResolution={pendingResolution}
            onSelectCandidate={analyzeSelectedCandidate}
            onDismiss={() => {
              setPendingResolution(null);
              setNotice("");
            }}
            styles={styles}
          />
        ) : null}

        {!data && !loading && !error ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>No allocation memo loaded yet</div>
            <div style={styles.emptyText}>Start with a symbol, project name, or contract address to generate a deterministic decision memo.</div>
          </div>
        ) : null}

        {data ? (
          <ResearchErrorBoundary styles={styles} areaName="research-results">
            <DecisionHeroCard
              asset={asset}
              model={decisionModel}
              styles={styles}
              sections={RESEARCH_TABS}
              activeSection={activeTab}
              onSelectSection={setActiveTab}
            />

            <div style={styles.resultActions}>
              <button onClick={toggleFavorite} style={styles.actionButton}>
                {isFavorite ? "Remove from saved history" : "Save to decision history"}
              </button>
              <button onClick={copyShareLink} style={styles.actionButton}>
                Copy memo link
              </button>
              {copyMessage ? <div style={styles.copyMessage}>{copyMessage}</div> : null}
            </div>

            <RiskFlagsStrip items={decisionModel.auditAlerts} styles={styles} />

            <div style={styles.terminalNavHeader}>
              <div style={styles.terminalNavTitle}>Decision Navigation</div>
              <div style={styles.terminalNavHint}>Decision, thesis, risks, evidence, history, and drift stay available without burying the answer.</div>
            </div>
            <div style={styles.terminalNav}>
              {RESEARCH_TABS.map((tab) => (
                <TabButton
                  key={tab.key}
                  label={tab.label}
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  styles={styles}
                />
              ))}
            </div>

            {renderActiveTab()}

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
          </ResearchErrorBoundary>
        ) : null}

        <div ref={methodologySectionRef}>
          <MethodologyPanel principles={methodologyPrinciples} styles={styles} />
        </div>

        <div style={styles.disclaimer}>
          <h3 style={{ marginTop: 0, color: "#f9d976" }}>Research Support Only</h3>
          <p style={{ color: "#f4f7ff", lineHeight: 1.8, marginBottom: 0 }}>
            No investment advice. No performance promises. This terminal is decision-support infrastructure only. Data quality depends on third-party providers and service availability, and every output requires independent verification before capital is allocated.
          </p>
        </div>
      </div>
    </div>
  );
}

