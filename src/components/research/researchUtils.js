export function formatUsd(value) {
  if (value === null || value === undefined || value === "") return "Unknown";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: num >= 100 ? 0 : 6 })}`;
}

export function formatCompact(value) {
  if (value === null || value === undefined || value === "") return "Unknown";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(num);
}

export function formatPct(value, digits = 2) {
  if (value === null || value === undefined || value === "") return "Unknown";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toFixed(digits)}%`;
}

export function analysisColor(score) {
  if (score >= 75) return "#2fd67b";
  if (score >= 45) return "#ffb020";
  return "#ff6b6b";
}

export function verdictColor(verdict) {
  if (verdict === "HIGH RISK") return "#ff6b6b";
  if (verdict === "CAUTION") return "#ffb020";
  return "#2fd67b";
}

export function sourceColor(status) {
  if (status === "live") return "#2fd67b";
  if (status === "partial" || status === "modeled") return "#7dd3fc";
  if (status === "unsupported" || status === "skipped") return "#ffb020";
  if (status === "unavailable") return "#8a94a6";
  return "#ff6b6b";
}

export function confidenceColor(level) {
  if (level === "high") return "#2fd67b";
  if (level === "medium") return "#ffb020";
  return "#ff6b6b";
}

export function confidenceLabel(level) {
  if (level === "high") return "High confidence";
  if (level === "medium") return "Medium confidence";
  return "Low confidence";
}

export function riskLevelColor(level) {
  if (level === "low") return "#2fd67b";
  if (level === "medium") return "#ffb020";
  if (level === "high") return "#ff8a4c";
  return "#ff6b6b";
}

export function riskLevelLabel(level) {
  if (!level) return "Unknown";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function titleCase(value) {
  if (!value) return "Unknown";
  return String(value)
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function extractRenderableText(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => extractRenderableText(entry, null))
      .filter(Boolean);
    return normalized.length ? normalized.join(", ") : fallback;
  }
  if (typeof value === "object") {
    if (typeof value.summary === "string" && value.summary.trim()) return value.summary;
    if (typeof value.label === "string" && value.label.trim()) return value.label;
    if (typeof value.value === "string" && value.value.trim()) return value.value;
    return fallback;
  }
  return fallback;
}

export function normalizeRenderableList(items) {
  return safeArray(items)
    .map((item) => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        if (typeof item.summary === "string" && item.summary.trim()) {
          const evidence = safeArray(item.evidence)
            .map((entry) => extractRenderableText(entry, null))
            .filter(Boolean);
          return evidence.length ? `${item.summary} (${evidence.join("; ")})` : item.summary;
        }
      }
      return extractRenderableText(item, null);
    })
    .filter(Boolean);
}

const devWarningKeys = new Set();

export function devWarnOnce(key, message, details = undefined) {
  if (!import.meta.env.DEV) return;
  if (devWarningKeys.has(key)) return;
  devWarningKeys.add(key);

  if (details !== undefined) {
    console.warn(`[research-ui] ${message}`, details);
    return;
  }

  console.warn(`[research-ui] ${message}`);
}

export function extractDecisionLabel(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.label || value.value || value.id || null;
  }
  return null;
}

export function assertAnalysisShape(payload, context = "analysis") {
  if (!import.meta.env.DEV) return;

  const root = safeObject(payload);
  const analysis = safeObject(root.analysis);
  const derivedAnalysis = safeObject(root.derivedAnalysis);
  const decisionLayer = safeObject(analysis.decisionLayer);
  const thesisCore = safeObject(analysis.thesisCore);
  const confidence = safeObject(analysis.confidence);

  const posture = decisionLayer.posture;
  if (posture !== undefined && posture !== null && typeof posture !== "string" && typeof posture !== "object") {
    devWarnOnce(`posture-shape-${context}`, "Posture changed shape from expected string/object form.", {
      context,
      posture,
    });
  }

  const hasAnalysis = Object.keys(analysis).length > 0;
  const hasDerived = Object.keys(derivedAnalysis).length > 0;
  const analysisScore = analysis?.scores?.overallScore;
  const derivedScore = derivedAnalysis?.scores?.overallScore;
  if (
    hasAnalysis &&
    hasDerived &&
    analysisScore !== undefined &&
    derivedScore !== undefined &&
    analysisScore !== derivedScore
  ) {
    devWarnOnce(`analysis-derived-diverge-${context}`, "analysis and derivedAnalysis diverge on stored overall score.", {
      context,
      analysisScore,
      derivedScore,
    });
  }

  if (hasAnalysis && !thesisCore?.investability?.status) {
    devWarnOnce(`investability-missing-${context}`, "Investability is missing from thesisCore.", {
      context,
      thesisCore,
    });
  }

  if (hasAnalysis && (confidence.score === undefined || confidence.label === undefined)) {
    devWarnOnce(`confidence-shape-${context}`, "Confidence is missing score or label.", {
      context,
      confidence,
    });
  }
}

export function assertSnapshotShape(snapshotRecord, context = "snapshot") {
  if (!import.meta.env.DEV) return;
  const snapshot = safeObject(snapshotRecord);
  const hasAnalysis = Boolean(snapshot.analysis);
  const hasDerived = Boolean(snapshot.derivedAnalysis);

  if (!hasAnalysis && hasDerived) {
    devWarnOnce(`snapshot-fallback-${context}`, "Snapshot fallback used because analysis is missing and derivedAnalysis was used instead.", {
      context,
      snapshotId: snapshot.snapshotId || null,
    });
  }

  assertAnalysisShape({
    analysis: snapshot.analysis,
    derivedAnalysis: snapshot.derivedAnalysis,
  }, context);
}

export function assertCompareShape(compareData, context = "compare") {
  if (!import.meta.env.DEV) return;
  const root = safeObject(compareData);
  const comparison = safeObject(root.comparison);
  const base = safeObject(root.base);
  const against = safeObject(root.against);

  if (!Object.keys(comparison).length || !Object.keys(base).length || !Object.keys(against).length) {
    devWarnOnce(`compare-malformed-${context}`, "Compare payload malformed fallback used.", {
      context,
      hasComparison: Boolean(Object.keys(comparison).length),
      hasBase: Boolean(Object.keys(base).length),
      hasAgainst: Boolean(Object.keys(against).length),
    });
  }

  assertAnalysisShape({
    analysis: base.analysis,
    derivedAnalysis: base.derivedAnalysis,
  }, `${context}-base`);
  assertAnalysisShape({
    analysis: against.analysis,
    derivedAnalysis: against.derivedAnalysis,
  }, `${context}-against`);
}

export function formatDateTime(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function shortenAddress(value, start = 6, end = 4) {
  if (!value) return "Unavailable";
  const stringValue = String(value);
  if (stringValue.length <= start + end + 3) return stringValue;
  return `${stringValue.slice(0, start)}...${stringValue.slice(-end)}`;
}

export function formatSignedDelta(value, digits = 0, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "Unavailable";
  const num = Number(value);
  const fixed = digits > 0 ? num.toFixed(digits) : Math.round(num).toString();
  return `${num > 0 ? "+" : ""}${fixed}${suffix}`;
}

export function formatTransition(fromValue, toValue) {
  return `${titleCase(fromValue || "unknown")} -> ${titleCase(toValue || "unknown")}`;
}

export function impactColor(level) {
  if (level === "high") return "#ff6b6b";
  if (level === "medium") return "#ffb020";
  if (level === "low") return "#7dd3fc";
  return "#8a94a6";
}

export function moduleAvailabilityTone(value) {
  if (value === "live") return { label: "Live", color: "#2fd67b" };
  if (value === "partial") return { label: "Partial coverage", color: "#7dd3fc" };
  if (value === "unsupported") return { label: "Unsupported", color: "#ffb020" };
  if (value === "missing") return { label: "Unavailable", color: "#8a94a6" };
  return { label: titleCase(value), color: "#8a94a6" };
}

export function diagnosticTone(entry) {
  if (!entry) return { color: "#8a94a6", label: "Unknown" };
  if (entry.status === "failure") return { color: "#ff6b6b", label: "Failed" };
  if (entry.status === "skipped") return { color: "#ffb020", label: "Skipped" };
  if (entry.coverage === "partial" || entry.coverage === "weak") return { color: "#7dd3fc", label: "Partial" };
  if (entry.coverage === "missing" || entry.coverage === "unavailable") return { color: "#8a94a6", label: "Unavailable" };
  return { color: "#2fd67b", label: "Success" };
}

export function compareAreaLabel(area) {
  const labels = {
    overall_score: "Overall score",
    confidence: "Confidence",
    data_quality: "Data quality",
    tokenomics_risk: "Tokenomics risk",
    token_unlocks: "Token unlocks",
    fundraising: "Fundraising",
    product_usage: "Product usage",
    protocol_usage: "Protocol usage",
    protocol_economics: "Protocol economics",
    governance_risk: "Governance risk",
    liquidity_risk: "Liquidity risk",
    onchain_score: "On-chain score",
    onchain_concentration: "On-chain concentration",
    project_credibility: "Project credibility",
    warnings: "Warnings",
    alerts: "Alerts",
    quick_verdict_note: "Decision memo",
  };
  return labels[area] || titleCase(area);
}

export function providerLabel(provider) {
  const labels = {
    coingeckoMarket: "CoinGecko market",
    dexscreener: "DexScreener",
    security: "Security provider",
    officialLinks: "Official links",
    whitepaperDocs: "Docs / whitepaper",
    onChain: "On-chain provider",
    ai: "Decision memo service",
    protocolEconomics: "Protocol economics",
    defillama: "DefiLlama",
  };

  return labels[provider] || titleCase(provider);
}

export function buildAssetLookupQuery(asset, fallbackQuery = "") {
  if (asset?.contractAddress) {
    return `${asset.chain || "unknown"}:${asset.contractAddress.toLowerCase()}`;
  }
  if (asset?.coinmarketcapId) {
    return `cmc:${asset.coinmarketcapId}`;
  }
  if (asset?.coingeckoId) {
    return `gecko:${asset.coingeckoId}`;
  }
  return fallbackQuery;
}

export function buildWatchlistKey(asset) {
  if (!asset) return "";
  if (asset.contractAddress) {
    return `${asset.chain || "unknown"}:${String(asset.contractAddress).toLowerCase()}`;
  }
  if (asset.coinmarketcapId) {
    return `cmc:${asset.coinmarketcapId}`;
  }
  if (asset.coingeckoId) {
    return `gecko:${asset.coingeckoId}`;
  }
  return `${String(asset.chain || "unknown").toLowerCase()}:${String(asset.symbol || asset.name || "unknown").toLowerCase()}`;
}

export function normalizeWatchlistAsset(raw) {
  if (!raw) return null;

  if (typeof raw === "string") {
    const clean = raw.trim();
    if (!clean) return null;
    return {
      name: clean,
      symbol: clean,
      chain: null,
      contractAddress: null,
      coingeckoId: null,
      coinmarketcapId: null,
      logo: null,
      category: null,
    };
  }

  const normalized = {
    name: raw.name || null,
    symbol: raw.symbol || null,
    chain: raw.chain || null,
    contractAddress: raw.contractAddress || null,
    coingeckoId: raw.coingeckoId || null,
    coinmarketcapId: raw.coinmarketcapId ?? null,
    logo: raw.logo || null,
    category: raw.category || null,
  };

  if (!buildWatchlistKey(normalized)) return null;
  return normalized;
}

export function buildWatchlistAssetFromAnalysis(asset, selection = null) {
  if (!asset && !selection) return null;

  return normalizeWatchlistAsset({
    name: asset?.name || selection?.name || null,
    symbol: asset?.symbol || selection?.symbol || null,
    chain: asset?.chain || selection?.chain || null,
    contractAddress: asset?.contractAddress || selection?.contractAddress || null,
    coingeckoId: asset?.coingeckoId || selection?.coingeckoId || null,
    coinmarketcapId: asset?.coinmarketcapId ?? selection?.coinmarketcapId ?? null,
    logo: selection?.logo || null,
    category: asset?.category || selection?.category || null,
  });
}

export function statusMeta(status) {
  if (status === "online") return { label: "Backend online", color: "#2fd67b", tone: "Live API responding" };
  if (status === "degraded") return { label: "Backend degraded", color: "#ffb020", tone: "Service reachable with partial coverage" };
  if (status === "offline") return { label: "Backend offline", color: "#ff6b6b", tone: "Requests are currently failing" };
  return { label: "Checking backend", color: "#8a94a6", tone: "Running health check" };
}

export function normalizeErrorMessage(message) {
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

export function buildAnalysisQualityExplanation({ confidence, providerDiagnostics = [], providerHealth, sourceStatus }) {
  const degradedProviders = [];
  const healthProviders = providerHealth?.providers || {};
  const healthMap = [
    ["coingecko", "CoinGecko"],
    ["dexscreener", "DexScreener"],
    ["goplus", "GoPlus"],
    ["anthropic", "Decision memo service"],
    ["postgres", "Postgres"],
  ];

  for (const [key, label] of healthMap) {
    const entry = healthProviders[key];
    if (entry?.configured && entry?.reachable === false) {
      degradedProviders.push(label);
    }
  }

  const failedDiagnostics = providerDiagnostics.filter((entry) => entry.status === "failure");
  const unsupportedDiagnostics = providerDiagnostics.filter(
    (entry) => entry.status === "skipped" || entry.errorClass === "unsupported" || entry.coverage === "unsupported",
  );
  const weakCoverageDiagnostics = providerDiagnostics.filter((entry) =>
    ["partial", "weak", "missing", "unavailable"].includes(entry.coverage || ""),
  );

  const unsupportedSections = Object.entries(sourceStatus || {})
    .filter(([, status]) => status === "unsupported")
    .map(([key]) => titleCase(key));

  const qualityIsWeak = confidence?.level === "low" || ["fallback", "partial"].includes(confidence?.dataQuality || confidence?.marketDataStatus || "");

  if (qualityIsWeak && (degradedProviders.length || failedDiagnostics.length)) {
    const providers = [...new Set([
      ...degradedProviders,
      ...failedDiagnostics.slice(0, 3).map((entry) => providerLabel(entry.provider)),
    ])];
    return {
      tone: "warning",
      title: "Analysis quality may be limited by upstream providers",
      message: `Some weak or missing sections are likely influenced by provider issues affecting ${providers.join(", ")}.`,
    };
  }

  if (qualityIsWeak && (unsupportedDiagnostics.length || unsupportedSections.length)) {
    const sections = [...new Set([
      ...unsupportedSections,
      ...unsupportedDiagnostics.slice(0, 3).map((entry) => providerLabel(entry.provider)),
    ])];
    return {
      tone: "neutral",
      title: "Analysis is partial because some sections are unsupported",
      message: `The current report is incomplete mainly because ${sections.join(", ")} is not fully supported in this product flow yet.`,
    };
  }

  if (qualityIsWeak && !degradedProviders.length && weakCoverageDiagnostics.length) {
    return {
      tone: "info",
      title: "Providers look healthy, but confirmed token data is still thin",
      message: "Weak confidence appears to come from limited confirmed market, docs, or project evidence for this asset rather than an obvious provider outage.",
    };
  }

  return null;
}

export function buildSectionQualityHint(section, {
  providerDiagnostics = [],
  providerHealth,
  sourceStatus,
  availability,
  officialLinks,
  whitepaperDocs,
  projectCredibility,
  protocolUsage,
  protocolEconomics,
}) {
  const diagnosticsByProvider = Object.fromEntries(
    providerDiagnostics.map((entry) => [entry.provider, entry]),
  );
  const providers = providerHealth?.providers || {};

  if (section === "market") {
    const geckoDiag = diagnosticsByProvider.coingeckoMarket;
    const dexDiag = diagnosticsByProvider.dexscreener;
    const geckoDown = providers.coingecko?.configured && providers.coingecko?.reachable === false;
    const dexDown = providers.dexscreener?.configured && providers.dexscreener?.reachable === false;

    if (geckoDown || dexDown) {
      return {
        tone: "warning",
        message: `Market coverage may be weaker because ${[geckoDown ? "CoinGecko" : null, dexDown ? "DexScreener" : null].filter(Boolean).join(" and ")} is currently degraded.`,
      };
    }

    if (geckoDiag?.coverage === "partial" || geckoDiag?.coverage === "unavailable" || dexDiag?.coverage === "partial") {
      return {
        tone: "info",
        message: "Market data is partial because the backend could resolve the asset, but confirmed market coverage was still thin.",
      };
    }
  }

  if (section === "sources") {
    const linksDiag = diagnosticsByProvider.officialLinks;
    const docsDiag = diagnosticsByProvider.whitepaperDocs;
    const geckoDown = providers.coingecko?.configured && providers.coingecko?.reachable === false;

    if (geckoDown && (linksDiag?.status === "failure" || docsDiag?.status === "failure")) {
      return {
        tone: "warning",
        message: "Source coverage may be weaker because an upstream metadata source is degraded.",
      };
    }

    if (officialLinks?.status === "weak" || whitepaperDocs?.documentationDepth === "missing" || docsDiag?.coverage === "missing") {
      return {
        tone: "neutral",
        message: "Official links or docs are thin because the project did not provide much verifiable source material through the connected sources.",
      };
    }
  }

  if (section === "onchain") {
    const onChainDiag = diagnosticsByProvider.onChain;
    const goplusDown = providers.goplus?.configured && providers.goplus?.reachable === false;

    if (sourceStatus?.onChain === "unsupported" || availability === "unsupported") {
      return {
        tone: "neutral",
        message: "This on-chain section is unsupported for the current asset type or resolution path.",
      };
    }

    if (goplusDown || onChainDiag?.status === "failure") {
      return {
        tone: "warning",
        message: "On-chain coverage may be limited by provider availability rather than by the token alone.",
      };
    }

    if (availability === "partial" || availability === "missing") {
      return {
        tone: "info",
        message: "On-chain coverage is thin because the current asset returned only limited holder or ownership evidence.",
      };
    }
  }

  if (section === "credibility") {
    const linksDiag = diagnosticsByProvider.officialLinks;
    const docsDiag = diagnosticsByProvider.whitepaperDocs;
    const geckoDown = providers.coingecko?.configured && providers.coingecko?.reachable === false;

    if (geckoDown && (linksDiag?.status === "failure" || docsDiag?.status === "failure")) {
      return {
        tone: "warning",
        message: "Project credibility may be under-confirmed because upstream metadata or source collection is degraded.",
      };
    }

    if (projectCredibility?.availability === "missing") {
      return {
        tone: "neutral",
        message: "Credibility is weak here because the project has little backed founder, backer, or company evidence in connected sources.",
      };
    }

    if (projectCredibility?.availability === "partial") {
      return {
        tone: "info",
        message: "Some project identity evidence exists, but founder, backer, or company confirmation is still incomplete.",
      };
    }
  }

  if (section === "protocol") {
    const defillamaDiag = diagnosticsByProvider.defillama;
    const economicsDiag = diagnosticsByProvider.protocolEconomics;
    const defillamaDown = providers.defillama?.configured && providers.defillama?.reachable === false;

    if (defillamaDown) {
      return {
        tone: "warning",
        message: "Protocol usage and value-capture context may be limited because DefiLlama is currently degraded.",
      };
    }

    if (sourceStatus?.protocolUsage === "skipped" && sourceStatus?.protocolEconomics === "skipped") {
      return {
        tone: "neutral",
        message: "Protocol-level usage and economics were skipped because no confident asset-to-protocol mapping was available.",
      };
    }

    if (availability === "partial" || defillamaDiag?.coverage === "partial" || economicsDiag?.coverage === "partial") {
      return {
        tone: "info",
        message: "Protocol context is partial because a protocol match was found, but only part of the TVL, fees, revenue, or volume stack was backed.",
      };
    }

    if (
      availability === "missing"
      || (protocolUsage?.availability === "missing" && protocolEconomics?.availability === "missing")
    ) {
      return {
        tone: "neutral",
        message: "No backed protocol-level usage or economics signal was confirmed for this asset in the connected public sources.",
      };
    }
  }

  return null;
}

export function buildFreshnessBadge(entry) {
  if (!entry) {
    return {
      label: "Freshness unavailable",
      detail: null,
      color: "#8a94a6",
    };
  }

  const status = entry.status || (entry.availability === "unsupported"
    ? "unsupported"
    : entry.availability === "missing"
      ? "missing"
      : null);

  const updatedAt = entry.updatedAt ? formatDateTime(entry.updatedAt) : null;

  if (status === "fresh") {
    return { label: "Fresh", detail: updatedAt ? `Updated ${updatedAt}` : null, color: "#2fd67b" };
  }

  if (status === "stale") {
    return { label: "Stale", detail: updatedAt ? `Last update ${updatedAt}` : null, color: "#ffb020" };
  }

  if (status === "unsupported") {
    return { label: "Unsupported", detail: updatedAt ? `Checked ${updatedAt}` : null, color: "#8a94a6" };
  }

  if (status === "missing") {
    return { label: "Missing", detail: updatedAt ? `Last checked ${updatedAt}` : null, color: "#8a94a6" };
  }

  if (entry.availability === "partial") {
    return { label: "Partial", detail: updatedAt ? `Updated ${updatedAt}` : null, color: "#7dd3fc" };
  }

  return {
    label: "Freshness tracked",
    detail: updatedAt ? `Updated ${updatedAt}` : null,
    color: "#7dd3fc",
  };
}

export function buildWatchlistFreshnessMeta(latestSnapshot) {
  if (!latestSnapshot) {
    return {
      label: "No snapshot yet",
      detail: "Run analysis once to create the first stored snapshot.",
      color: "#8a94a6",
      tone: "neutral",
    };
  }

  const freshness = latestSnapshot.sectionFreshness || {};
  const market = freshness.marketData || null;
  const docs = freshness.officialLinksDocs || null;
  const credibility = freshness.projectCredibility || null;
  const onChain = freshness.onChainMetrics || null;

  const nowMs = Date.now();
  const ageMs = latestSnapshot.generatedAt ? Math.max(0, nowMs - new Date(latestSnapshot.generatedAt).getTime()) : null;
  const marketUpdatedAtMs = market?.updatedAt ? new Date(market.updatedAt).getTime() : null;
  const marketIsStale = Boolean(
    market &&
    market.availability !== "unsupported" &&
    marketUpdatedAtMs &&
    Number.isFinite(marketUpdatedAtMs) &&
    nowMs - marketUpdatedAtMs > market.freshnessWindowMs,
  );

  if (marketIsStale || (ageMs !== null && ageMs > (market?.freshnessWindowMs || 0) && market?.availability !== "unsupported")) {
    return {
      label: "Stale",
      detail: market?.updatedAt ? `Market last checked ${formatDateTime(market.updatedAt)}` : "Latest stored market snapshot is stale.",
      color: "#ffb020",
      tone: "warning",
    };
  }

  const unsupportedSections = [market, docs, credibility, onChain].filter((entry) => entry?.availability === "unsupported");
  const missingOrPartialSections = [market, docs, credibility].filter((entry) =>
    entry && ["partial", "missing"].includes(entry.availability),
  );

  if (latestSnapshot.summary?.dataQuality !== "full" || missingOrPartialSections.length || unsupportedSections.length) {
    let detail = "Recent snapshot exists, but some sections are partial or unsupported.";

    if (unsupportedSections.length && !missingOrPartialSections.length) {
      detail = "Recent snapshot exists, but some sections are unsupported for this asset path.";
    } else if (docs?.availability === "partial" || credibility?.availability === "partial") {
      detail = "Recent snapshot exists, but docs or project evidence are still only partially confirmed.";
    } else if (market?.availability === "missing" || market?.availability === "partial") {
      detail = "Recent snapshot exists, but market coverage is still thin.";
    }

    return {
      label: "Limited coverage",
      detail,
      color: "#7dd3fc",
      tone: "info",
    };
  }

  return {
    label: "Fresh",
    detail: latestSnapshot.generatedAt ? `Latest snapshot ${formatDateTime(latestSnapshot.generatedAt)}` : "Recent snapshot coverage looks current.",
    color: "#2fd67b",
    tone: "positive",
  };
}

export function buildWatchlistTimestampMeta({ latestSnapshot, lastCheckedAt, isRefreshing }) {
  if (isRefreshing) {
    return {
      label: "Checking now",
      value: "Refresh in progress.",
    };
  }

  const snapshotTimeMs = latestSnapshot?.generatedAt ? new Date(latestSnapshot.generatedAt).getTime() : null;
  const checkedTimeMs = lastCheckedAt ? new Date(lastCheckedAt).getTime() : null;
  const hasSnapshotTime = Number.isFinite(snapshotTimeMs);
  const hasCheckedTime = Number.isFinite(checkedTimeMs);

  if (hasCheckedTime && hasSnapshotTime && checkedTimeMs > snapshotTimeMs + 1000) {
    return {
      label: "Last checked",
      value: formatDateTime(lastCheckedAt),
    };
  }

  if (hasSnapshotTime) {
    return {
      label: "Last refreshed",
      value: formatDateTime(latestSnapshot.generatedAt),
    };
  }

  if (hasCheckedTime) {
    return {
      label: "Last checked",
      value: formatDateTime(lastCheckedAt),
    };
  }

  return null;
}

export function buildWatchlistRefreshResultMeta(result) {
  if (!result?.status) return null;

  if (result.status === "updated") {
    return {
      label: "Updated",
      detail: result.detail || "Refresh created a meaningful snapshot update.",
      color: "#2fd67b",
    };
  }

  if (result.status === "no_change") {
    return {
      label: "No change",
      detail: result.detail || "The latest check did not produce a meaningful snapshot change.",
      color: "#8a94a6",
    };
  }

  if (result.status === "failed") {
    return {
      label: "Refresh failed",
      detail: result.detail || "The last refresh attempt did not complete successfully.",
      color: "#ff6b6b",
    };
  }

  return null;
}

export function buildVerdictDisplayData({ aiReport, analysis, asset }) {
  try {
    const safeAnalysis = safeObject(analysis);
    const safeAiReport = safeObject(aiReport);
    const finalVerdict = safeObject(safeAiReport.finalVerdict);
    const decisionLayer = safeObject(safeAnalysis.decisionLayer);
    const thesisCore = safeObject(safeAnalysis.thesisCore);
    const decisionFrame = safeObject(decisionLayer.decisionFrame);
    const investability = safeObject(thesisCore.investability);
    const failureMode = safeObject(thesisCore.failureMode);
    const posture = describePosture(extractDecisionLabel(decisionLayer.posture), safeAnalysis?.assetClassification?.assetClass || null);
    const currentState = describeCurrentState(extractDecisionLabel(decisionLayer.currentState), safeAnalysis?.assetClassification?.assetClass || null);
    const primaryWeakness = buildPrimaryWeaknessText({
      primaryWeakness: thesisCore.primaryWeakness,
      assetClass: safeAnalysis?.assetClassification?.assetClass || null,
    });
    const primaryStrength = buildPrimaryStrengthText({
      primaryStrength: thesisCore.primaryStrength,
      assetClass: safeAnalysis?.assetClassification?.assetClass || null,
    });
    const assetLabel = asset?.symbol || asset?.name || "asset";
    const mustBeTrue = safeArray(decisionFrame.whatMustBeTrue);
    const couldBreak = safeArray(decisionFrame.whatCouldBreak);

    if (!Object.keys(thesisCore).length) {
      devWarnOnce("verdict-fallback-thesiscore", "Missing thesisCore fallback used in verdict display.", {
        asset: assetLabel,
      });
    }

    if (!Object.keys(decisionLayer).length) {
      devWarnOnce("verdict-fallback-decision-layer", "Missing decisionLayer fallback used in verdict display.", {
        asset: assetLabel,
      });
    }

    return {
      recommendation:
        finalVerdict.recommendation
        || decisionFrame.whyNow
        || (
          posture && investability.status
            ? `${titleCase(posture)} | ${titleCase(investability.status)}`
            : posture
              ? titleCase(posture)
              : investability.status
                ? titleCase(investability.status)
                : null
        ),
      summary:
        finalVerdict.summary
        || primaryWeakness
        || decisionFrame.whyNotNow
        || (
          currentState
            ? `${assetLabel} currently maps to ${titleCase(currentState)}.`
            : "Decision memo unavailable from current analysis data."
        ),
      bullCase:
        safeAiReport.bullCase
        || primaryStrength
        || mustBeTrue[0]
        || null,
      bearCase:
        safeAiReport.bearCase
        || failureMode.primary
        || couldBreak[0]
        || null,
      rating:
        finalVerdict.rating
        || posture
        || currentState
        || null,
      score:
        finalVerdict.score
        ?? safeAnalysis?.scores?.overallScore
        ?? null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[research-ui] buildVerdictDisplayData failed and returned safe fallback.", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
        asset: asset?.symbol || asset?.name || null,
      });
    }
    return {
      recommendation: null,
      summary: "Decision memo unavailable from current analysis data.",
      bullCase: null,
      bearCase: null,
      rating: null,
      score: null,
    };
  }
}

export function normalizeSignalList(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry === "object") {
          return entry.label || entry.signal || entry.code || entry.id || null;
        }
        return null;
      })
      .filter(Boolean)
      .map((entry) => titleCase(entry));
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, entryValue]) => Boolean(entryValue))
      .map(([key]) => titleCase(key));
  }

  return [];
}

const TECHNICAL_NOISE_PATTERNS = [
  /provider/i,
  /api\b/i,
  /auth/i,
  /upstream/i,
  /timeout/i,
  /missing[_\s-]?key/i,
  /rate[_\s-]?limit/i,
  /mapping[_\s-]?failed/i,
  /empty[_\s-]?payload/i,
  /unsupported[_\s-]?asset/i,
  /diagnostic/i,
];

export function isTechnicalNoiseText(value) {
  const text = extractRenderableText(value, "");
  if (!text) return false;
  return TECHNICAL_NOISE_PATTERNS.some((pattern) => pattern.test(text));
}

export function filterUserFacingItems(items, limit = null) {
  const filtered = normalizeRenderableList(items).filter((entry) => !isTechnicalNoiseText(entry));
  if (limit === null) return filtered;
  return filtered.slice(0, limit);
}

const INTERNAL_SEMANTIC_LABELS = new Map([
  ["none_material", "No dominant structural weakness identified."],
  ["none material", "No dominant structural weakness identified."],
  ["fundamentally_supported", "Fundamentally supported"],
  ["adoption_supported", "Adoption supported"],
  ["narrative_supported", "Narrative-led support"],
  ["speculative", "Speculative"],
  ["structurally_fragile", "Structurally fragile"],
  ["governance_constrained", "Governance constrained"],
  ["underverified", "Underverified"],
  ["deteriorating", "Deteriorating"],
  ["mixed", "Mixed change"],
  ["high_conviction_candidate", "High-conviction candidate"],
  ["constructive_but_needs_confirmation", "Constructive but requires confirmation"],
  ["watchlist", "Monitor closely"],
  ["speculative_only", "Speculative only"],
  ["fragile", "Fragile"],
  ["avoid_for_now", "Avoid for now"],
  ["unassessable", "Insufficient verified evidence"],
  ["investable", "Investable"],
  ["conditionally_investable", "Conditionally investable"],
  ["non_investable", "Not investable"],
]);

function normalizeSemanticKey(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase().replace(/\s+/g, "_");
}

export function sanitizeSemanticLabel(value, fallback = "Unavailable") {
  const text = extractRenderableText(value, null);
  if (!text) return fallback;
  const normalizedKey = normalizeSemanticKey(text);
  if (INTERNAL_SEMANTIC_LABELS.has(normalizedKey)) {
    return INTERNAL_SEMANTIC_LABELS.get(normalizedKey);
  }
  return text;
}

export function isNoMaterialWeakness(value) {
  const text = sanitizeSemanticLabel(value, "");
  if (!text) return false;
  return text === "No dominant structural weakness identified.";
}

export function hasConcreteConflict(evidenceQuality, confidenceModel) {
  const evidenceSummary = extractRenderableText(evidenceQuality?.summary, "");
  const confidenceSummary = extractRenderableText(confidenceModel?.sourceAgreementSummary, "");
  const conflictEvidence = [
    evidenceSummary,
    confidenceSummary,
    ...normalizeRenderableList(evidenceQuality?.conflictEvidence),
    ...normalizeRenderableList(evidenceQuality?.conflicts),
  ].filter(Boolean);

  return conflictEvidence.some((entry) => /\bconflict|\bdisagree|\binconsistent|\bcontradict/i.test(entry));
}

export function isBenchmarkAssetClass(assetClass) {
  return ["native_asset", "gas_asset"].includes(assetClass || "");
}

function dedupeCaseInsensitive(items) {
  const seen = new Set();
  return safeArray(items).filter((item) => {
    const text = extractRenderableText(item, null);
    if (!text) return false;
    const key = text.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const GENERIC_EPISTEMIC_PATTERNS = [
  /one or more critical pillars remain unresolved/i,
  /weakest-link uncertainty constrains conviction/i,
  /critical parts of the thesis (still )?rely too heavily on inference/i,
  /evidence quality is insufficient to support top-tier confidence/i,
  /conflicting evidence remains unresolved/i,
];

const GENERIC_PLACEHOLDER_PATTERNS = [
  /^confirm the missing structural support\.?$/i,
  /^confirm missing structural support\.?$/i,
  /^show stronger structural support\.?$/i,
];

function isGenericEpistemicText(value) {
  const text = extractRenderableText(value, "");
  return Boolean(text && GENERIC_EPISTEMIC_PATTERNS.some((pattern) => pattern.test(text)));
}

function replaceGenericCondition(value) {
  const text = sanitizeSemanticLabel(value, null);
  if (!text) return null;
  if (GENERIC_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(text))) {
    return "Further direct evidence would increase conviction.";
  }
  return text;
}

function cleanUserFacingList(items, {
  limit = null,
  suppressGenericEpistemic = false,
  replacePlaceholders = false,
} = {}) {
  let cleaned = filterUserFacingItems(items, null)
    .map((item) => (replacePlaceholders ? replaceGenericCondition(item) : sanitizeSemanticLabel(item, null)))
    .filter(Boolean);

  if (suppressGenericEpistemic) {
    cleaned = cleaned.filter((item) => !isGenericEpistemicText(item));
  }

  const deduped = dedupeCaseInsensitive(cleaned).map((item) => extractRenderableText(item, null)).filter(Boolean);
  if (limit === null) return deduped;
  return deduped.slice(0, limit);
}

function chooseEpistemicNote({ isBenchmark, primaryWeakness, evidenceDirectness }) {
  if (isBenchmark && isNoMaterialWeakness(primaryWeakness)) {
    return "Benchmark thesis is structurally supported, while confidence remains constrained by evidence completeness.";
  }

  const directness = evidenceDirectness?.directness;
  if (directness === "mostly_inferred") return "Critical parts of the thesis rely too heavily on inference.";
  if (directness === "descriptive_only") return "Evidence quality is insufficient to support top-tier confidence.";
  if (directness === "critical_gaps") return "Weakest-link uncertainty constrains conviction.";
  return null;
}

export function buildAssetBadges({ assetClass, assetSubtype, primarySector }) {
  const rawBadges = [];

  if (assetClass === "native_asset") rawBadges.push("Benchmark Asset");
  else if (assetClass === "gas_asset") rawBadges.push("Base-Layer Asset");
  else if (assetClass) rawBadges.push(titleCase(assetClass));

  if (assetSubtype && assetSubtype !== "unknown") {
    rawBadges.push(titleCase(assetSubtype));
  }

  if (primarySector && primarySector !== "Unknown") {
    rawBadges.push(primarySector);
  }

  return dedupeCaseInsensitive(rawBadges).map((badge) => extractRenderableText(badge, null)).filter(Boolean);
}

export function describeCurrentState(currentState, assetClass) {
  const normalized = normalizeSemanticKey(currentState);
  if (isBenchmarkAssetClass(assetClass)) {
    if (normalized === "narrative_supported") return "Benchmark adoption and monetary role";
    if (normalized === "adoption_supported") return "Benchmark network adoption";
    if (normalized === "fundamentally_supported") return "Benchmark structural support";
  }
  return sanitizeSemanticLabel(currentState, "Unavailable");
}

export function describePosture(posture, assetClass) {
  const normalized = normalizeSemanticKey(posture);
  if (isBenchmarkAssetClass(assetClass) && normalized === "watchlist") {
    return "Conditionally investable benchmark";
  }
  return sanitizeSemanticLabel(posture, "Unavailable");
}

export function buildPrimaryStrengthText({ primaryStrength, assetClass }) {
  const text = sanitizeSemanticLabel(primaryStrength, null);
  if (text) return text;

  if (assetClass === "native_asset") {
    return "Benchmark liquidity, durability, and monetary role remain the core structural support.";
  }

  if (assetClass === "gas_asset") {
    return "Base-layer network role, usage, and settlement demand remain the core structural support.";
  }

  return null;
}

export function buildPrimaryWeaknessText({ primaryWeakness, assetClass }) {
  const text = sanitizeSemanticLabel(primaryWeakness, null);
  if (text) return text;

  if (isBenchmarkAssetClass(assetClass)) {
    return "No dominant structural weakness identified.";
  }

  return "No dominant structural weakness was surfaced.";
}

export function buildFailurePrimaryText({ failurePrimary, primaryWeakness, assetClass }) {
  const text = sanitizeSemanticLabel(failurePrimary, null);
  const noMaterialWeakness = isNoMaterialWeakness(primaryWeakness);

  if (isBenchmarkAssetClass(assetClass) && noMaterialWeakness) {
    return "No dominant failure mode is currently identified for the benchmark thesis.";
  }

  return text || primaryWeakness || "A structural break in the current thesis would invalidate allocation support.";
}

export function buildTokenDemandTruth({ allocationOutcomeKey, primaryStrength, assetClass, primaryWeakness }) {
  if (assetClass === "native_asset") {
    return primaryStrength
      ? "The thesis rests on benchmark liquidity, durability, and monetary relevance rather than token-style upside framing."
      : "Benchmark demand support is present, but the current evidence does not justify a stronger allocation stance.";
  }

  if (assetClass === "gas_asset") {
    return primaryStrength
      ? "The thesis rests on base-layer usage, settlement demand, and network role rather than generic token-narrative support."
      : "Base-layer demand support is visible, but the structural case is not yet clean enough for stronger conviction.";
  }

  if (primaryStrength) {
    return "Token-demand support is evidenced, but it does not override structural constraints.";
  }

  if (allocationOutcomeKey === "tradable_only") {
    return "Token demand is speculative or liquidity-led rather than allocator-grade.";
  }

  if (allocationOutcomeKey === "do_not_allocate") {
    return "Token-demand support does not clear the allocation bar.";
  }

  return `Token-demand support remains conditional on stronger structural confirmation${primaryWeakness ? ` against ${primaryWeakness.toLowerCase()}` : ""}.`;
}

export function buildSummaryMemo({
  allocationOutcomeKey,
  whyNow,
  whyNotNow,
  primaryStrength,
  primaryWeakness,
  failurePrimary,
  assetClass,
}) {
  if (allocationOutcomeKey === "capital_worthy") {
    return whyNow
      || primaryStrength
      || (assetClass === "native_asset"
        ? "Benchmark durability and liquidity remain the dominant support."
        : assetClass === "gas_asset"
          ? "Base-layer role and network usage remain the dominant support."
          : primaryWeakness);
  }

  if (allocationOutcomeKey === "conditional_allocation") {
    return whyNotNow || primaryWeakness || failurePrimary;
  }

  if (allocationOutcomeKey === "tradable_only") {
    return primaryWeakness || failurePrimary || "Speculative interest is not enough to support allocation quality.";
  }

  return primaryWeakness || failurePrimary || whyNotNow;
}

export function hasRealStructuralInvalidator(primaryWeakness) {
  const weakness = sanitizeSemanticLabel(primaryWeakness, "");
  if (!weakness || isNoMaterialWeakness(weakness)) return false;
  return true;
}

export function deriveAllocationOutcome(analysis, scores) {
  const safeAnalysis = safeObject(analysis);
  const thesisCore = safeObject(safeAnalysis.thesisCore);
  const investability = safeObject(thesisCore.investability);
  const mirroredInvestability = safeObject(safeAnalysis.investability);
  const status = investability.status || null;
  const mirroredStatus = mirroredInvestability.status || null;
  const resolvedStatus = status || mirroredStatus;
  const overallScore = scores?.overallScore ?? safeAnalysis?.scores?.overallScore ?? null;

  if (resolvedStatus === "investable") {
    return {
      key: "capital_worthy",
      label: "Capital-Worthy",
      tone: "positive",
      shortLabel: "Capital-worthy",
    };
  }

  if (resolvedStatus === "conditionally_investable") {
    return {
      key: "conditional_allocation",
      label: "Conditional Allocation",
      tone: "caution",
      shortLabel: "Conditional",
    };
  }

  if (resolvedStatus === "speculative_only") {
    return {
      key: "tradable_only",
      label: "Tradable Only",
      tone: "warning",
      shortLabel: "Tradable only",
    };
  }

  if (resolvedStatus === "non_investable" || resolvedStatus === "unassessable") {
    return {
      key: "do_not_allocate",
      label: "Do Not Allocate",
      tone: "negative",
      shortLabel: "Do not allocate",
    };
  }

  if (overallScore !== null && overallScore >= 70) {
    return {
      key: "conditional_allocation",
      label: "Conditional Allocation",
      tone: "caution",
      shortLabel: "Conditional",
    };
  }

  return {
    key: "do_not_allocate",
    label: "Do Not Allocate",
    tone: "negative",
    shortLabel: "Do not allocate",
  };
}

function buildDecisionDrivers({ contributors, prioritySignals, primaryStrength, primaryWeakness, blockers }) {
  const topDrivers = filterUserFacingItems(safeArray(contributors?.topDrivers), null);
  const negativeDrivers = filterUserFacingItems(contributors?.negatives, null)
    .map((entry) => entry.replace(/^\-\s*/, ""))
    .slice(0, 2);
  const positiveDrivers = filterUserFacingItems(contributors?.positives, null)
    .map((entry) => entry.replace(/^\-\s*/, ""))
    .slice(0, 2);
  const signals = filterUserFacingItems(prioritySignals, 3);
  const gatingBlockers = filterUserFacingItems(blockers, 2);

  const merged = [
    ...topDrivers,
    ...(primaryWeakness ? [primaryWeakness] : []),
    ...(primaryStrength ? [primaryStrength] : []),
    ...gatingBlockers,
    ...negativeDrivers,
    ...positiveDrivers,
    ...signals,
  ];

  return [...new Set(merged)].filter(Boolean).slice(0, 3);
}

function buildConfidenceSupportLabel(confidenceModel) {
  if (typeof confidenceModel?.level === "string" && confidenceModel.level.trim()) {
    return `${titleCase(confidenceModel.level)} evidence support`;
  }

  if (typeof confidenceModel?.label === "string" && confidenceModel.label.trim()) {
    return confidenceModel.label
      .replace(/confidence/gi, "evidence support")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "Evidence support unavailable";
}

export function buildDecisionTerminalModel({
  analysis,
  scores,
  confidence,
  scoreContributors,
  fundamentals,
  warnings,
  asset,
}) {
  const safeAnalysis = safeObject(analysis);
  const thesisCore = safeObject(safeAnalysis.thesisCore);
  const decisionLayer = safeObject(safeAnalysis.decisionLayer);
  const decisionFrame = safeObject(decisionLayer.decisionFrame);
  const investability = safeObject(thesisCore.investability);
  const failureMode = safeObject(thesisCore.failureMode);
  const evidenceQuality = safeObject(thesisCore.evidenceQuality);
  const evidenceDirectness = safeObject(safeAnalysis.evidenceDirectness);
  const contributors = safeObject(safeAnalysis.contributors || scoreContributors);
  const assetClassification = safeObject(safeAnalysis.assetClassification);
  const sectorClassification = safeObject(safeAnalysis.sectorClassification);
  const confidenceModel = safeObject(confidence || safeAnalysis.confidence);
  const policySignals = normalizeSignalList(safeAnalysis.policySignals);
  const warningsList = normalizeRenderableList(warnings);
  const userFacingWarnings = filterUserFacingItems(warningsList);
  const isBenchmark = isBenchmarkAssetClass(assetClassification.assetClass || null);
  const blockers = cleanUserFacingList(investability.blockers, {
    suppressGenericEpistemic: isBenchmark,
    replacePlaceholders: true,
  });
  const requiredConditions = cleanUserFacingList(investability.requiredConditions, {
    suppressGenericEpistemic: isBenchmark,
    replacePlaceholders: true,
  });
  const missingCritical = normalizeRenderableList(evidenceQuality.missingCritical).slice(0, 3);
  const primaryStrength = buildPrimaryStrengthText({
    primaryStrength: thesisCore.primaryStrength,
    assetClass: assetClassification.assetClass || null,
  });
  const primaryWeakness = buildPrimaryWeaknessText({
    primaryWeakness: thesisCore.primaryWeakness,
    assetClass: assetClassification.assetClass || null,
  });
  const allocationOutcome = deriveAllocationOutcome(safeAnalysis, scores);
  const overallScore = scores?.overallScore ?? safeAnalysis?.scores?.overallScore ?? null;
  const confidenceScore = confidenceModel?.score ?? null;
  const confidenceLabelText = buildConfidenceSupportLabel(confidenceModel);
  const prioritySignals = cleanUserFacingList(decisionLayer.prioritySignals, {
    suppressGenericEpistemic: isBenchmark,
  });
  const decisionDrivers = buildDecisionDrivers({
    contributors,
    prioritySignals,
    primaryStrength,
    primaryWeakness,
    blockers,
  });
  const failurePrimary = buildFailurePrimaryText({
    failurePrimary: failureMode.primary,
    primaryWeakness,
    assetClass: assetClassification.assetClass || null,
  });
  const failureTrigger = sanitizeSemanticLabel(failureMode.trigger, "A structural break in the current thesis would invalidate allocation support.");
  const earlySignals = normalizeRenderableList(failureMode.earlySignals).slice(0, 3);
  const contradictionApplies = Boolean(
    overallScore !== null
    && overallScore >= 65
    && allocationOutcome.key !== "capital_worthy"
    && hasRealStructuralInvalidator(primaryWeakness)
  );
  const contradictionNote = contradictionApplies
    ? `Surface metrics are overridden by failed token-thesis conditions. Dominant constraint: ${primaryWeakness}.`
    : null;
  const sanitizedWhyNow = sanitizeSemanticLabel(decisionFrame.whyNow, null);
  const rawWhyNotNow = sanitizeSemanticLabel(decisionFrame.whyNotNow, null);
  const epistemicNote = chooseEpistemicNote({
    isBenchmark,
    primaryWeakness,
    evidenceDirectness,
  });
  const sanitizedWhyNotNow =
    isBenchmark && isNoMaterialWeakness(primaryWeakness) && isGenericEpistemicText(rawWhyNotNow)
      ? null
      : rawWhyNotNow;
  const summaryMemo = isBenchmark && isNoMaterialWeakness(primaryWeakness)
    ? (sanitizedWhyNow || epistemicNote || primaryStrength)
    : buildSummaryMemo({
    allocationOutcomeKey: allocationOutcome.key,
    whyNow: sanitizedWhyNow,
    whyNotNow: sanitizedWhyNotNow,
    primaryStrength,
    primaryWeakness,
    failurePrimary,
    assetClass: assetClassification.assetClass || null,
  });
  const tokenDemandTruth = buildTokenDemandTruth({
    allocationOutcomeKey: allocationOutcome.key,
    primaryStrength,
    assetClass: assetClassification.assetClass || null,
    primaryWeakness,
  });
  const auditAlerts = dedupeCaseInsensitive([...policySignals, ...userFacingWarnings]).slice(0, 6);
  const evidenceConflicts = hasConcreteConflict(evidenceQuality, confidenceModel);
  const evidenceConstraintNote = missingCritical.length || warningsList.some((entry) => isTechnicalNoiseText(entry))
    ? "Incomplete external evidence increases conservatism in this assessment."
    : epistemicNote
      ? epistemicNote
    : null;
  const dedupedDrivers = dedupeCaseInsensitive(decisionDrivers).slice(0, 3);
  const dedupedSecondarySectors = dedupeCaseInsensitive(safeArray(sectorClassification.secondarySectors));
  const assetBadges = buildAssetBadges({
    assetClass: assetClassification.assetClass || null,
    assetSubtype: assetClassification.subtype || null,
    primarySector: sectorClassification.primarySector || null,
  });

  return {
    assetName: asset?.name || asset?.symbol || "Asset",
    overallScore,
    confidenceScore,
    confidenceLabel: confidenceLabelText,
    allocationOutcome,
    primaryStrength,
    primaryWeakness,
    failureMode: {
      primary: failurePrimary,
      trigger: failureTrigger,
      earlySignals,
    },
    investabilityStatus: investability.status || null,
    currentState: describeCurrentState(extractDecisionLabel(decisionLayer.currentState), assetClassification.assetClass || null),
    posture: describePosture(extractDecisionLabel(decisionLayer.posture), assetClassification.assetClass || null),
    evidenceStrength: evidenceQuality.strength || null,
    evidenceConflicts,
    missingCritical,
    blockers,
    requiredConditions,
    decisionDrivers: dedupedDrivers,
    contradictionNote,
    summaryMemo,
    tokenDemandTruth,
    policySignals,
    warnings: userFacingWarnings,
    auditAlerts,
    evidenceConstraintNote,
    assetClass: assetClassification.assetClass || null,
    assetSubtype: assetClassification.subtype || null,
    primarySector: sectorClassification.primarySector || null,
    secondarySectors: dedupedSecondarySectors,
    assetBadges,
    whyNow: sanitizedWhyNow,
    whyNotNow: sanitizedWhyNotNow,
    whatMustBeTrue: cleanUserFacingList(decisionFrame.whatMustBeTrue, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
    whatCouldBreak: cleanUserFacingList(decisionFrame.whatCouldBreak, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
    nextCheckpoints: cleanUserFacingList(decisionFrame.nextCheckpoints, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
    topPositiveDrivers: cleanUserFacingList(contributors.positives, { limit: 4 }),
    topNegativeDrivers: cleanUserFacingList(contributors.negatives, { limit: 4 }),
    topNeutralDrivers: cleanUserFacingList(contributors.neutralOrMissing, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
    keyAlerts: filterUserFacingItems(fundamentals?.risks?.keyAlerts, 4),
  };
}

export function buildMethodologyPrinciples() {
  return [
    "Truth before allocation",
    "False positives are risk",
    "Protocol quality is not token quality",
    "Confidence is earned, not assumed",
    "Capital deserves deterministic judgment",
  ];
}
