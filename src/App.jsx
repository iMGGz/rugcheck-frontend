import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ResearchHeader from "./components/research/ResearchHeader";
import HomepagePositioning from "./components/research/HomepagePositioning";
import SearchPanel from "./components/research/SearchPanel";
import NewsPanel from "./components/research/NewsPanel";
import RisksPanel from "./components/research/RisksPanel";
import WatchlistPanel from "./components/research/WatchlistPanel";
import ResearchContextPanel from "./components/research/ResearchContextPanel";
import ResearchErrorBoundary from "./components/research/ResearchErrorBoundary";
import DecisionHeroCard, { DecisionHeroSupportSections } from "./components/research/DecisionHeroCard";
import EvidenceStatusSummaryCard from "./components/research/EvidenceStatusSummaryCard";
import EvidenceMapTab from "./components/research/EvidenceMapTab";
import SourceQueuePanel from "./components/research/SourceQueuePanel";
import ManualReviewPanel from "./components/research/ManualReviewPanel";
import InstitutionalChecklistTab from "./components/research/InstitutionalChecklistTab";
import AllocationOutcomeCard from "./components/research/AllocationOutcomeCard";
import EvidenceConfidenceCard from "./components/research/EvidenceConfidenceCard";
import ThesisFalsificationTab from "./components/research/ThesisFalsificationTab";
import ScoringTransparencyTab from "./components/research/ScoringTransparencyTab";
import TokenomicsSupplyIntegrityTab from "./components/research/TokenomicsSupplyIntegrityTab";
import ThesisDriftTimeline from "./components/research/ThesisDriftTimeline";
import SearchSelectorPanel from "./components/research/SearchSelectorPanel";
import RiskFlagsStrip from "./components/research/RiskFlagsStrip";
import HowTheEngineWorksPage from "./components/research/HowTheEngineWorksPage";
import AnalysisRightRail from "./components/research/AnalysisRightRail";
import AuditSection from "./components/research/AuditSection";
import { TokenomicsSupplyIntegrityCard } from "./components/research/TokenomicsSupplyIntegrityCard";
import { Card, ListBlock, SectionRow, TabButton } from "./components/research/researchPrimitives";
import { buildResponsiveStyles } from "./components/research/researchStyles";
import { buildInstitutionalAssetIdentity } from "./components/research/institutionalChecklistLensRegistry";
import {
  assertAnalysisShape,
  buildAnalysisQualityExplanation,
  buildDecisionTerminalModel,
  buildProtectedInvestorReportText,
  deriveEvidenceStatusProxy,
  buildAssetLookupQuery,
  buildReviewBundleText,
  buildWatchlistAssetFromAnalysis,
  buildWatchlistFreshnessMeta,
  buildWatchlistKey,
  normalizeCalibrationWarningsPayload,
  normalizeAnalysisFreshnessPayload,
  normalizeAssetIdentityResolutionPayload,
  normalizeResolvedInstitutionalLensPayload,
  normalizeProviderHealth,
  normalizeInstitutionalQuestionsPayload,
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
const QUICK_SEARCHES = ["BTC", "WBTC", "ETH", "XRP", "ADA", "UNI", "RENDER", "LINK", "AVAX", "ONDO", "USDT", "USDC", "RIO", "NAKA", "SOL", "PEPE"];
const RESEARCH_TABS = [
  { key: "overview", label: "Decision" },
  { key: "thesis_falsification", label: "Thesis Falsification" },
  { key: "institutional_checklist", label: "Institutional Checklist" },
  { key: "tokenomics", label: "Tokenomics" },
  { key: "evidence_map", label: "Evidence Map" },
  { key: "scoring_transparency", label: "Scoring Transparency" },
  { key: "source_queue", label: "Source Queue" },
  { key: "manual_review", label: "Manual Review" },
  { key: "audit_raw", label: "Audit / Raw" },
];
const SEARCH_HISTORY_KEY = "rugcheck-history-v1";
const WATCHLIST_KEY = "rugcheck-watchlist-v2";
const WATCHLIST_CHECKS_KEY = "rugcheck-watchlist-checks-v1";
const WATCHLIST_REFRESH_RESULTS_KEY = "rugcheck-watchlist-refresh-results-v1";
const SHOW_INTERNAL_EXPORTS = import.meta.env.VITE_SHOW_INTERNAL_EXPORTS !== "false";
const INTERNAL_EXPORT_HEADER = "PRIVATE INTERNAL QA EXPORT — DO NOT SHARE EXTERNALLY";

function getViewportWidth() {
  if (typeof window === "undefined") return 1280;
  return window.innerWidth || 1280;
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

function UnattachedReportLayerNotice({
  title,
  description,
  boundary,
  bullets = [],
  status = "Not attached to live response",
  styles,
}) {
  return (
    <Card title={title} subtitle={description} styles={styles}>
      <SectionRow label="Current status" value={status} styles={styles} />
      <SectionRow label="Boundary" value={boundary} styles={styles} />
      <ListBlock
        title="What this section will show when attached"
        items={bullets}
        emptyText="No live section details are attached yet."
        color="#7dd3fc"
        styles={styles}
      />
    </Card>
  );
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
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const [activeProductView, setActiveProductView] = useState("overview");
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
  const [internalExportToken, setInternalExportToken] = useState(null);
  const [internalExportTokenExpiresAt, setInternalExportTokenExpiresAt] = useState("");
  const [internalExportPasswordModalOpen, setInternalExportPasswordModalOpen] = useState(false);
  const [internalExportPassword, setInternalExportPassword] = useState("");
  const [internalExportAuthError, setInternalExportAuthError] = useState("");
  const [internalExportAuthLoading, setInternalExportAuthLoading] = useState(false);
  const [pendingInternalExportAction, setPendingInternalExportAction] = useState(null);
  const [manualCopyModal, setManualCopyModal] = useState({ open: false, text: "", filename: "" });
  const [notice, setNotice] = useState("");
  const [pendingResolution, setPendingResolution] = useState(null);
  const [pendingTabFocusTarget, setPendingTabFocusTarget] = useState(null);
  const [tabFocusPulse, setTabFocusPulse] = useState(false);
  const [activeWatchlistAsset, setActiveWatchlistAsset] = useState(null);
  const providerHealthRequestRef = useRef(0);
  const watchlistRequestRef = useRef(0);
  const searchSectionRef = useRef(null);
  const selectorSectionRef = useRef(null);
  const activeTabContentRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frameId = 0;
    const handleResize = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setViewportWidth(getViewportWidth());
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const styles = useMemo(() => buildResponsiveStyles(viewportWidth), [viewportWidth]);

  const scrollToRef = useCallback((targetRef) => {
    targetRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openAnalysisView = useCallback((options = {}) => {
    const { scrollToSearch = false } = options;
    setActiveProductView("analysis");

    if (scrollToSearch && typeof window !== "undefined") {
      window.setTimeout(() => scrollToRef(searchSectionRef), 0);
    }
  }, [scrollToRef]);

  const openOverviewView = useCallback(() => {
    setActiveProductView("overview");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const openMethodologyView = useCallback(() => {
    setActiveProductView("methodology");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const selectAnalysisSection = useCallback((tabKey, options = {}) => {
    const { scrollToContent = true } = options;
    setActiveProductView("analysis");
    setActiveTab(tabKey);

    if (scrollToContent) {
      setPendingTabFocusTarget({ tabKey, requestedAt: Date.now() });
    }
  }, []);

  useEffect(() => {
    if (!pendingResolution || activeProductView !== "analysis" || typeof window === "undefined") return undefined;
    const timeout = window.setTimeout(() => scrollToRef(selectorSectionRef), 0);
    return () => window.clearTimeout(timeout);
  }, [activeProductView, pendingResolution, scrollToRef]);

  useEffect(() => {
    if (
      !pendingTabFocusTarget ||
      pendingTabFocusTarget.tabKey !== activeTab ||
      activeProductView !== "analysis" ||
      typeof window === "undefined"
    ) {
      return undefined;
    }

    let pulseTimeout = 0;
    const scrollTimeout = window.setTimeout(() => {
      const target = activeTabContentRef.current;
      if (!target) {
        setPendingTabFocusTarget(null);
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus({ preventScroll: true });
      setTabFocusPulse(true);
      setPendingTabFocusTarget(null);
      pulseTimeout = window.setTimeout(() => setTabFocusPulse(false), 1500);
    }, 40);

    return () => {
      window.clearTimeout(scrollTimeout);
      if (pulseTimeout) window.clearTimeout(pulseTimeout);
    };
  }, [activeProductView, activeTab, pendingTabFocusTarget]);

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
      setProviderHealth(normalizeProviderHealth(json) || null);
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

  const resetAnalysisSubviews = useCallback(() => {
    setPendingTabFocusTarget(null);
    setTabFocusPulse(false);
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
      checkHealth();
      loadProviderHealth();
    } catch (err) {
      setData(null);
      setActiveWatchlistAsset(null);
      setError(normalizeErrorMessage(err instanceof Error ? err.message : "Analysis failed"));
      checkHealth();
      loadProviderHealth();
    }
  }, [checkHealth, loadProviderHealth, requestAnalysisPayload, resetAnalysisSubviews]);

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

  const analysis = useMemo(() => {
    if (!data) return null;
    const analysisBlock = data.analysis || {};
    const institutionalQuestionPayload = normalizeInstitutionalQuestionsPayload(data);
    const calibrationWarnings = normalizeCalibrationWarningsPayload(data);
    const resolvedInstitutionalLens = normalizeResolvedInstitutionalLensPayload(data);
    const assetIdentityResolution = normalizeAssetIdentityResolutionPayload(data);
    const analysisFreshness = normalizeAnalysisFreshnessPayload(data, null);
    return {
      ...analysisBlock,
      institutionalQuestions: institutionalQuestionPayload.institutionalQuestions,
      institutionalQuestionsProvenance: institutionalQuestionPayload.institutionalQuestionsProvenance,
      resolvedInstitutionalLens,
      assetIdentityResolution,
      calibrationWarnings,
      analysisFreshness,
    };
  }, [data]);
  const asset = data?.asset;
  const marketData = data?.marketData;
  const security = data?.security;
  const scores = analysis?.scores || data?.scores;
  const aiReport = data?.aiReport;
  const officialLinks = data?.officialLinks;
  const whitepaperDocs = data?.whitepaperDocs;
  const newsIntelligence = data?.newsIntelligence;
  const onChainMetrics = data?.onChainMetrics;
  const snapshot = null;
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
  const institutionalAssetIdentity = useMemo(
    () => buildInstitutionalAssetIdentity(asset, analysis, decisionModel),
    [asset, analysis, decisionModel],
  );
  const evidenceStatusProxy = useMemo(() => deriveEvidenceStatusProxy({
    model: decisionModel,
    analysis,
    confidence,
    providerDiagnostics,
    sourceStatus,
    meta,
    providerHealth,
  }), [decisionModel, analysis, confidence, providerDiagnostics, sourceStatus, meta, providerHealth]);
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
    setActiveProductView("analysis");
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

  function formatExportDate(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  function sanitizeFilenamePart(value, fallback = "asset") {
    const normalized = String(value || fallback).trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
    return normalized || fallback;
  }

  function currentAssetSymbol() {
    return sanitizeFilenamePart(asset?.symbol || asset?.name || query || "asset").toUpperCase();
  }

  function internalBundleFilename() {
    return `thesiscore-internal-developer-qa-${currentAssetSymbol()}-${formatExportDate()}.txt`;
  }

  function protectedInvestorReportFilename() {
    return `thesiscore-protected-investor-report-${currentAssetSymbol()}-${formatExportDate()}.txt`;
  }

  function downloadTextFile(text, filename) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function buildInternalDeveloperQaBundle() {
    const bundle = buildReviewBundleText({
      asset,
      analysis,
      data,
      model: decisionModel,
      displayIdentity: institutionalAssetIdentity,
      evidenceStatusProxy,
      analysisQualityExplanation,
      sourceStatus,
      providerDiagnostics,
      notableDiagnostics,
      providerHealth,
      officialLinks,
      whitepaperDocs,
      scores,
      confidence,
      meta,
      snapshot: null,
      timelineData: [],
      compareData: null,
      aiReport,
      fundamentals,
      security,
    });
    return [
      INTERNAL_EXPORT_HEADER,
      "Purpose: private developer QA/export mirror for ThesisCore internal review only.",
      "",
      bundle,
    ].join("\n");
  }

  function buildProtectedReport() {
    return buildProtectedInvestorReportText({
      asset,
      analysis,
      data,
      model: decisionModel,
      displayIdentity: institutionalAssetIdentity,
      evidenceStatusProxy,
      sourceStatus,
      providerDiagnostics,
      providerHealth,
      scores,
      confidence,
      meta,
    });
  }

  function hasValidInternalExportToken() {
    if (!internalExportToken || !internalExportTokenExpiresAt) return false;
    const expiresMs = new Date(internalExportTokenExpiresAt).getTime();
    return Number.isFinite(expiresMs) && expiresMs > Date.now() + 1000;
  }

  async function executeInternalExportAction(actionId, tokenOverride = null) {
    const hasFreshToken = Boolean(tokenOverride) || hasValidInternalExportToken();
    if (!hasFreshToken) {
      setPendingInternalExportAction(actionId);
      setInternalExportPassword("");
      setInternalExportAuthError("");
      setInternalExportPasswordModalOpen(true);
      return;
    }

    if (actionId === "copyBundle") {
      await copyInternalDeveloperQaBundle();
      return;
    }

    if (actionId === "downloadBundle") {
      downloadInternalDeveloperQaBundle();
      return;
    }

    setCopyMessage(`Password accepted, but export action failed: unknown action ${actionId || "none"}`);
  }

  function requestInternalExportAccess(actionId) {
    if (hasValidInternalExportToken()) {
      void executeInternalExportAction(actionId, internalExportToken);
      return;
    }
    setPendingInternalExportAction(actionId);
    setInternalExportPassword("");
    setInternalExportAuthError("");
    setInternalExportPasswordModalOpen(true);
  }

  function normalizeInternalExportTokenResponse(response) {
    const payload = response?.token ? response : response?.data || {};
    return {
      token: payload.token || "",
      purpose: payload.purpose || "",
      expiresAt: payload.expiresAt || payload.expires_at || "",
    };
  }

  async function verifyInternalExportPassword(event) {
    event?.preventDefault?.();
    setInternalExportAuthLoading(true);
    setInternalExportAuthError("");
    try {
      const response = await fetchJson(`${API_BASE}/api/internal-export/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: internalExportPassword }),
      });
      const tokenPayload = normalizeInternalExportTokenResponse(response);
      if (tokenPayload.purpose !== "internal_export" || !tokenPayload.token || !tokenPayload.expiresAt) {
        throw new Error("Internal export verification returned an invalid token.");
      }
      setInternalExportToken(tokenPayload.token);
      setInternalExportTokenExpiresAt(tokenPayload.expiresAt);
      setInternalExportPassword("");
      setInternalExportPasswordModalOpen(false);
      const action = pendingInternalExportAction;
      setPendingInternalExportAction(null);
      if (action) {
        await executeInternalExportAction(action, tokenPayload.token);
      } else {
        setCopyMessage("Password accepted, but export action failed: no pending action was recorded.");
      }
    } catch (err) {
      setInternalExportAuthError(normalizeErrorMessage(err instanceof Error ? err.message : "Password verification failed"));
    } finally {
      setInternalExportAuthLoading(false);
    }
  }

  async function writeClipboardText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!copied) throw new Error("Clipboard fallback failed");
  }

  async function copyInternalDeveloperQaBundle() {
    const filename = internalBundleFilename();
    let bundle = "";
    try {
      bundle = buildInternalDeveloperQaBundle();
      await writeClipboardText(bundle);
      setCopyMessage("Internal developer QA bundle copied");
    } catch {
      if (bundle) {
        setManualCopyModal({ open: true, text: bundle, filename });
        setCopyMessage("Clipboard blocked; manual copy opened");
        return;
      }
      setCopyMessage("Password accepted, but export action failed: internal bundle generation failed.");
    }
  }

  function downloadInternalDeveloperQaBundle() {
    try {
      downloadTextFile(buildInternalDeveloperQaBundle(), internalBundleFilename());
      setCopyMessage("Internal developer QA bundle downloaded");
    } catch (err) {
      setCopyMessage(`Password accepted, but export action failed: ${normalizeErrorMessage(err instanceof Error ? err.message : "download failed")}`);
    }
  }

  function downloadProtectedInvestorReport() {
    downloadTextFile(buildProtectedReport(), protectedInvestorReportFilename());
    setCopyMessage("Protected investor report downloaded");
  }

  async function copyManualBundleAgain() {
    try {
      await writeClipboardText(manualCopyModal.text);
      setCopyMessage("Internal developer QA bundle copied");
    } catch {
      setCopyMessage("Clipboard still blocked; use Select all or Download .txt");
    }
  }

  function selectManualBundleText() {
    const textarea = document.getElementById("manual-internal-bundle-textarea");
    if (textarea) {
      textarea.focus();
      textarea.select();
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
            {decisionModel.verdictSemantics?.hasVerdictClass ? (
              <Card title="Verdict Semantics" subtitle="Backend verdict taxonomy v1. Additive display layer over the live decision." styles={styles}>
                <SectionRow label="Verdict class" value={decisionModel.verdictSemantics.label} styles={styles} />
                <SectionRow label="Interpretation" value={decisionModel.verdictSemantics.summary} styles={styles} />
                <SectionRow label="Boundary" value={decisionModel.verdictSemantics.boundary} styles={styles} />
                <ListBlock
                  title="Evidence still needed"
                  items={decisionModel.verdictSemantics.missingEvidence}
                  emptyText="No evidence-blocked items were surfaced separately."
                  color="#f9d976"
                  styles={styles}
                />
              </Card>
            ) : null}

            <DecisionHeroSupportSections
              model={decisionModel}
              styles={styles}
              onSelectSection={selectAnalysisSection}
            />

            <EvidenceStatusSummaryCard proxy={evidenceStatusProxy} styles={styles} />

            <div style={styles.resultActions}>
              <button onClick={toggleFavorite} style={styles.actionButton}>
                {isFavorite ? "Remove from saved history" : "Save to decision history"}
              </button>
              <button onClick={copyShareLink} style={styles.actionButton}>
                Copy memo link
              </button>
            </div>

            <RiskFlagsStrip items={decisionModel.auditAlerts} styles={styles} />

            <div style={styles.advancedGrid}>
              <AllocationOutcomeCard model={decisionModel} styles={styles} />
              <Card title="Decision Memo" subtitle="Answer first. Reasoning second. Audit third." styles={styles}>
                <SectionRow label="Primary Weakness" value={decisionModel.primaryWeakness} styles={styles} />
                <SectionRow label="Failure Mode" value={decisionModel.failureMode?.primary || "Unavailable"} styles={styles} />
                {decisionModel.whyNotNow && decisionModel.whyNotNow !== decisionModel.summaryMemo ? (
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
          </>
        );
      case "thesis_falsification":
        return (
          <ThesisFalsificationTab
            model={decisionModel}
            displayIdentity={institutionalAssetIdentity}
            styles={styles}
            onSelectSection={selectAnalysisSection}
          />
        );
      case "institutional_checklist":
        return (
          <InstitutionalChecklistTab
            asset={asset}
            analysis={analysis}
            model={decisionModel}
            sourceStatus={sourceStatus}
            providerDiagnostics={providerDiagnostics}
            providerHealth={providerHealth}
            evidenceStatusProxy={evidenceStatusProxy}
            calibrationWarnings={decisionModel.calibrationWarnings}
            styles={styles}
          />
        );
      case "tokenomics":
        return (
          <TokenomicsSupplyIntegrityTab
            model={decisionModel}
            asset={asset}
            styles={styles}
          />
        );
      case "evidence_map":
        return (
          <EvidenceMapTab
            model={decisionModel}
            evidenceStatusProxy={evidenceStatusProxy}
            analysisQualityExplanation={analysisQualityExplanation}
            confidence={confidence}
            meta={meta}
            sourceStatus={sourceStatus}
            providerDiagnostics={providerDiagnostics}
            notableDiagnostics={notableDiagnostics}
            providerHealth={providerHealth}
            providerHealthLoading={providerHealthLoading}
            providerHealthError={providerHealthError}
            officialLinks={officialLinks}
            whitepaperDocs={whitepaperDocs}
            styles={styles}
          />
        );
      case "scoring_transparency":
        return (
          <ScoringTransparencyTab
            analysis={analysis}
            scores={scores}
            scoreContributors={scoreContributors}
            confidence={confidence}
            model={decisionModel}
            styles={styles}
          />
        );
      case "source_queue":
        return (
          <SourceQueuePanel
            model={decisionModel}
            displayIdentity={institutionalAssetIdentity}
            sourceStatus={sourceStatus}
            providerDiagnostics={providerDiagnostics}
            styles={styles}
          />
        );
      case "manual_review":
        return (
          <>
            <ManualReviewPanel
              model={decisionModel}
              sourceStatus={sourceStatus}
              providerDiagnostics={providerDiagnostics}
              evidenceStatusProxy={evidenceStatusProxy}
              calibrationWarnings={decisionModel.calibrationWarnings}
              styles={styles}
            />
            <RisksPanel aiReport={aiReport} fundamentals={fundamentals} security={security} scores={scores} styles={styles} />
          </>
        );
      case "audit_raw":
        return (
          <>
            <Card title="Audit / Raw Details" subtitle="Technical details for verification. Not all raw context affects the final decision." styles={styles}>
              <SectionRow label="Purpose" value="Keep noisy diagnostics, history, drift, provider health, and raw context available without letting them dominate the decision narrative." styles={styles} />
            </Card>
            <Card title="Live Field Availability" subtitle="Compact audit mirror of response-facing fields. Raw arrays stay out of primary decision copy." styles={styles}>
              <SectionRow label="Resolved lens" value={decisionModel.resolvedInstitutionalLens?.lensId || "Unavailable"} styles={styles} />
              <SectionRow label="Question group" value={decisionModel.resolvedInstitutionalLens?.questionGroupId || "Unavailable"} styles={styles} />
              <SectionRow label="Lens-aware explanations" value={decisionModel.lensAwareExplanations ? "Present" : "Unavailable"} styles={styles} />
              <SectionRow label="Institutional questions" value={safeArray(decisionModel.institutionalQuestions).length} styles={styles} />
              <SectionRow label="Calibration warnings" value={safeArray(decisionModel.calibrationWarnings).length} styles={styles} />
              <SectionRow label="Analysis freshness" value={decisionModel.analysisFreshness?.freshnessLabel || "Unavailable"} styles={styles} />
              <SectionRow label="Asset identity resolution" value={decisionModel.assetIdentityResolution ? "Present" : "Unavailable"} styles={styles} />
              <SectionRow label="Tokenomics supply integrity" value={decisionModel.tokenomicsSupplyIntegrity ? "Present" : "Unavailable"} styles={styles} />
              <SectionRow label="Engine Learning Backbone" value={decisionModel.engineLearningBackbone ? "Present" : "Unavailable"} styles={styles} />
              <ListBlock
                title="Resolved lens source boundary"
                items={decisionModel.resolvedInstitutionalLens?.sourceBoundary}
                emptyText="No resolved lens source-boundary entries were attached."
                color="#9bd7ff"
                styles={styles}
              />
            </Card>
            <Card title="Engine Learning Backbone" subtitle="Non-scoring institutional memory: rules, QA checks, source candidates, anomalies, and path-parity diagnostics." styles={styles}>
              <SectionRow label="Version" value={decisionModel.engineLearningBackbone?.artifactVersion || "Unavailable"} styles={styles} />
              <SectionRow label="Rules applied" value={safeArray(decisionModel.engineLearningBackbone?.assetClassRulesApplied).length} styles={styles} />
              <SectionRow label="Findings tracked" value={safeArray(decisionModel.engineLearningBackbone?.findings).length} styles={styles} />
              <SectionRow label="Output QA checks" value={safeArray(decisionModel.engineLearningBackbone?.outputQaChecks).length} styles={styles} />
              <SectionRow label="Scoring boundary" value={decisionModel.engineLearningBackbone?.guardrails?.scoringChanged ? "Unexpected scoring change flag" : "Diagnostic only; scoring unchanged"} styles={styles} />
              <SectionRow label="Provider boundary" value={decisionModel.engineLearningBackbone?.guardrails?.providerBehaviorChanged ? "Unexpected provider behavior flag" : "No provider behavior change"} styles={styles} />
              <ListBlock
                title="Applied rules"
                items={safeArray(decisionModel.engineLearningBackbone?.assetClassRulesApplied).slice(0, 6).map((rule) => `${rule.title || rule.id}: ${rule.outputWarningTemplate || rule.summary || "Rule summary unavailable"}`)}
                emptyText="No engine-learning rules were attached."
                color="#9bd7ff"
                styles={styles}
              />
              <ListBlock
                title="Output QA checks"
                items={safeArray(decisionModel.engineLearningBackbone?.outputQaChecks).slice(0, 6).map((check) => `${check.status || "status"} - ${check.description || check.id || "QA check"}`)}
                emptyText="No output QA checks were attached."
                color="#f9d976"
                styles={styles}
              />
              <ListBlock
                title="Source candidates (not reviewed evidence)"
                items={safeArray(decisionModel.engineLearningBackbone?.sourceCandidates).slice(0, 6).map((candidate) => `${candidate.sourceCandidateTitle || candidate.candidateId || "Source candidate"} - ${candidate.candidateStatus || "candidate"}; scoring active: ${candidate.scoringActive ? "yes" : "no"}`)}
                emptyText="No source candidates were attached for this asset/lens."
                color="#9bd7ff"
                styles={styles}
              />
              <ListBlock
                title="Calibration anomalies"
                items={safeArray(decisionModel.engineLearningBackbone?.calibrationAnomalies).slice(0, 6).map((anomaly) => `${anomaly.asset || "Asset"} - ${anomaly.description || anomaly.anomalyId || "Calibration anomaly"}`)}
                emptyText="No calibration anomalies were attached."
                color="#f9d976"
                styles={styles}
              />
              <ListBlock
                title="Deferred findings"
                items={safeArray(decisionModel.engineLearningBackbone?.deferredFindings).map((finding) => `${finding.title || finding.id}: ${finding.recommendedAction || "Deferred cleanup"}`)}
                emptyText="No deferred engine-learning findings were attached."
                color="#8a94a6"
                styles={styles}
              />
            </Card>
            <Card title="Analysis Freshness / Live Recompute Details" subtitle="Current product output is generated from live full recompute only." styles={styles}>
              <SectionRow label="Analysis source" value={decisionModel.analysisFreshness?.analysisSource || "Analysis source unknown"} styles={styles} />
              <SectionRow label="Freshness status" value={decisionModel.analysisFreshness?.freshnessLabel || "Freshness unknown"} styles={styles} />
              <SectionRow label="Generated at" value={decisionModel.analysisFreshness?.generatedAt || "Unavailable"} styles={styles} />
              <SectionRow label="Read at" value={decisionModel.analysisFreshness?.readAt || "Unavailable"} styles={styles} />
              <SectionRow
                label="Recomputed"
                value={decisionModel.analysisFreshness?.recomputed === null || decisionModel.analysisFreshness?.recomputed === undefined ? "Unknown" : decisionModel.analysisFreshness.recomputed ? "Yes" : "No"}
                styles={styles}
              />
              <SectionRow label="Primary analysis path" value={decisionModel.analysisFreshness?.primaryAnalysisPath || "live_full_recompute"} styles={styles} />
              <SectionRow label="Snapshot disabled" value={decisionModel.analysisFreshness?.snapshotDisabled ? "Yes" : "No"} styles={styles} />
              <SectionRow label="Partial refresh disabled" value={decisionModel.analysisFreshness?.partialRefreshDisabled ? "Yes" : "No"} styles={styles} />
              <ListBlock title="Fresh sections" items={decisionModel.analysisFreshness?.freshSections} emptyText="No fresh section list was attached." color="#9bd7ff" styles={styles} />
              <ListBlock title="Missing sections" items={decisionModel.analysisFreshness?.missingSections} emptyText="No missing section list was attached." color="#f9d976" styles={styles} />
              <ListBlock title="Freshness warnings" items={decisionModel.analysisFreshness?.freshnessWarnings} emptyText="No freshness warning was attached." color="#f9d976" styles={styles} />
            </Card>
            <Card title="Asset Identity / Canonical Chain Details" subtitle="Selected asset, analyzed representation, and provider contract mapping." styles={styles}>
              <SectionRow label="Canonical asset" value={`${decisionModel.assetIdentityResolution?.canonicalAssetName || "Unavailable"} (${decisionModel.assetIdentityResolution?.canonicalAssetSymbol || "Unavailable"})`} styles={styles} />
              <SectionRow label="Canonical network candidate" value={decisionModel.assetIdentityResolution?.canonicalNetworkCandidate || "Unavailable"} styles={styles} />
              <SectionRow label="Analyzed network" value={decisionModel.assetIdentityResolution?.analyzedNetwork || "Unavailable"} styles={styles} />
              <SectionRow label="Analyzed contract" value={decisionModel.assetIdentityResolution?.analyzedContract || "No contract"} styles={styles} />
              <SectionRow label="Representation type" value={decisionModel.assetIdentityResolution?.representationType || "Unknown"} styles={styles} />
              <SectionRow label="Contract scan applicability" value={decisionModel.assetIdentityResolution?.contractScanApplicability || "Unknown"} styles={styles} />
              <SectionRow label="Wrong-asset risk" value={decisionModel.assetIdentityResolution?.wrongAssetRisk || "Unknown"} styles={styles} />
              <ListBlock title="Known provider contracts" items={safeArray(decisionModel.assetIdentityResolution?.allKnownContracts).map((entry) => `${entry.provider}: ${entry.network} ${entry.contractAddress}`)} emptyText="No provider contract mappings were attached." color="#9bd7ff" styles={styles} />
              <ListBlock title="Identity warnings" items={[...safeArray(decisionModel.assetIdentityResolution?.identityWarnings), ...safeArray(decisionModel.assetIdentityResolution?.chainWarnings), ...safeArray(decisionModel.assetIdentityResolution?.contractWarnings)]} emptyText="No identity warnings were attached." color="#f9d976" styles={styles} />
            </Card>
            <TokenomicsSupplyIntegrityCard tokenomics={decisionModel.tokenomicsSupplyIntegrity} styles={styles} />
            <AuditSection title="Provider Diagnostics" subtitle="Advanced evidence provenance" defaultOpen styles={styles}>
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
        activeProductView={activeProductView}
        onOpenOverview={openOverviewView}
        onRunAnalysis={() => openAnalysisView({ scrollToSearch: true })}
        onViewMethodology={openMethodologyView}
        onOpenAnalysis={() => openAnalysisView({ scrollToSearch: false })}
        styles={styles}
      />

      <div style={styles.container}>
        <div style={styles.trustStrip}>
          <span style={styles.trustStripItem}>Research Support Only</span>
          <span style={styles.trustStripItem}>No Investment Advice</span>
          <span style={styles.trustStripItem}>Independent Verification Required</span>
          <span style={styles.trustStripItem}>Third-Party Data Dependent</span>
        </div>

        {activeProductView === "overview" ? (
          <>
            <HomepagePositioning
              onAnalyzeAsset={() => openAnalysisView({ scrollToSearch: true })}
              onViewMethodology={openMethodologyView}
              styles={styles}
            />

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
          </>
        ) : null}

        {activeProductView === "analysis" ? (
          <>
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

            {pendingResolution ? (
              <div ref={selectorSectionRef}>
                <SearchSelectorPanel
                  pendingResolution={pendingResolution}
                  onSelectCandidate={analyzeSelectedCandidate}
                  onDismiss={() => {
                    setPendingResolution(null);
                    setNotice("");
                  }}
                  hasExistingAnalysis={Boolean(data)}
                  styles={styles}
                />
              </div>
            ) : null}

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
                  displayIdentity={institutionalAssetIdentity}
                  styles={styles}
                  onSelectSection={selectAnalysisSection}
                  lastAnalyzed={lastUpdated}
                  showSupportSections={false}
                />

                <div style={styles.terminalNavHeader}>
                  <div>
                    <div style={styles.terminalNavTitle}>Decision Navigation</div>
                    <div style={styles.terminalNavHint}>Institutional workflow tabs keep live scoring, report-only evidence, source queues, and raw audit context separated.</div>
                  </div>
                  <div style={styles.reviewBundleActionGroup}>
                    <button type="button" onClick={downloadProtectedInvestorReport} style={styles.reviewBundleButton}>
                      Download Protected Investor Report
                    </button>
                    {SHOW_INTERNAL_EXPORTS ? (
                      <>
                        <button type="button" onClick={() => requestInternalExportAccess("copyBundle")} style={styles.reviewBundleButton}>
                          Copy Internal Developer QA Bundle
                        </button>
                        <button type="button" onClick={() => requestInternalExportAccess("downloadBundle")} style={styles.reviewBundleButton}>
                          Download Internal Developer QA Bundle
                        </button>
                      </>
                    ) : null}
                    <div style={styles.reviewBundleHint}>
                      Investor report is redacted. Internal QA exports require password verification.
                    </div>
                    {copyMessage ? <div style={styles.copyMessage}>{copyMessage}</div> : null}
                  </div>
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

                <div style={styles.analysisWorkbench}>
                  <main style={styles.analysisMainColumn}>
                    <div
                      ref={activeTabContentRef}
                      tabIndex={-1}
                      aria-live="polite"
                      style={{
                        ...styles.activeTabFocusTarget,
                        ...(tabFocusPulse ? styles.activeTabFocusTargetActive : null),
                      }}
                    >
                      {renderActiveTab()}
                    </div>
                  </main>
                  <AnalysisRightRail
                    model={decisionModel}
                    displayIdentity={institutionalAssetIdentity}
                    evidenceStatusProxy={evidenceStatusProxy}
                    activeTab={activeTab}
                    onSelectSection={selectAnalysisSection}
                    onViewMethodology={openMethodologyView}
                    styles={styles}
                  />
                </div>
              </ResearchErrorBoundary>
            ) : null}
          </>
        ) : null}

        {activeProductView === "methodology" ? (
          <section style={styles.methodologyViewShell}>
            <div style={styles.methodologyViewHeader}>
              <div>
                <div style={styles.productViewEyebrow}>Methodology / How It Works</div>
                <h1 style={styles.methodologyViewTitle}>How ThesisCore tests allocation theses.</h1>
                <p style={styles.methodologyViewText}>
                  A dedicated product view for the engine pipeline, live/report-only boundary, source-backed research workflow, and planned Hybrid Finance thesis layer.
                </p>
              </div>
            </div>
            <HowTheEngineWorksPage styles={styles} />
            <div style={styles.methodologyBottomCta}>
              <div>
                <div style={styles.productViewEyebrow}>Run the methodology</div>
                <h2 style={styles.methodologyViewTitle}>Put an asset through the terminal.</h2>
                <p style={styles.methodologyViewText}>
                  Switch back to Analysis Terminal without resetting the current query, loaded result, active tab, or local watchlist state.
                </p>
              </div>
              <button onClick={() => openAnalysisView({ scrollToSearch: true })} style={styles.primaryButton}>
                Run an Asset Through ThesisCore
              </button>
            </div>
          </section>
        ) : null}

        {internalExportPasswordModalOpen ? (
          <div style={styles.exportModalOverlay} role="presentation">
            <form style={styles.exportModalCard} onSubmit={verifyInternalExportPassword}>
              <div style={styles.exportModalEyebrow}>Internal developer export</div>
              <h2 style={styles.exportModalTitle}>Password required</h2>
              <p style={styles.exportModalText}>
                Internal QA bundles include engine diagnostics and are for private developer review only. Password verification happens on the backend; the token is kept in memory and expires quickly.
              </p>
              <label style={styles.exportModalLabel} htmlFor="internal-export-password">Internal export password</label>
              <input
                id="internal-export-password"
                type="password"
                value={internalExportPassword}
                onChange={(event) => setInternalExportPassword(event.target.value)}
                style={styles.exportModalInput}
                autoFocus
              />
              {internalExportAuthError ? <div style={styles.exportModalError}>{internalExportAuthError}</div> : null}
              <div style={styles.exportModalActions}>
                <button type="submit" disabled={internalExportAuthLoading} style={styles.reviewBundleButton}>
                  {internalExportAuthLoading ? "Verifying..." : "Verify and Continue"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInternalExportPasswordModalOpen(false);
                    setPendingInternalExportAction(null);
                    setInternalExportPassword("");
                    setInternalExportAuthError("");
                  }}
                  style={styles.actionButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {manualCopyModal.open ? (
          <div style={styles.exportModalOverlay} role="presentation">
            <div style={styles.exportModalCard}>
              <div style={styles.exportModalEyebrow}>Clipboard recovery</div>
              <h2 style={styles.exportModalTitle}>Manual Copy Internal Developer QA Bundle</h2>
              <p style={styles.exportModalText}>
                Browser clipboard access was blocked. Select the full internal bundle below, retry clipboard copy, or download the text file.
              </p>
              <textarea
                id="manual-internal-bundle-textarea"
                value={manualCopyModal.text}
                readOnly
                style={styles.exportModalTextarea}
              />
              <div style={styles.exportModalActions}>
                <button type="button" onClick={selectManualBundleText} style={styles.reviewBundleButton}>
                  Select all
                </button>
                <button type="button" onClick={copyManualBundleAgain} style={styles.reviewBundleButton}>
                  Copy again
                </button>
                <button type="button" onClick={() => downloadTextFile(manualCopyModal.text, manualCopyModal.filename || internalBundleFilename())} style={styles.reviewBundleButton}>
                  Download .txt
                </button>
                <button type="button" onClick={() => setManualCopyModal({ open: false, text: "", filename: "" })} style={styles.actionButton}>
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

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

