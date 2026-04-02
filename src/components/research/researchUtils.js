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

export function formatDateTime(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
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
    governance_risk: "Governance risk",
    liquidity_risk: "Liquidity risk",
    onchain_score: "On-chain score",
    onchain_concentration: "On-chain concentration",
    project_credibility: "Project credibility",
    warnings: "Warnings",
    alerts: "Alerts",
    quick_verdict_note: "Quick verdict",
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
    ai: "AI provider",
  };

  return labels[provider] || titleCase(provider);
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
    ["anthropic", "AI provider"],
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
