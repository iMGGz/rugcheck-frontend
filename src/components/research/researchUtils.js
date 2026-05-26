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

export function normalizeInstitutionalQuestionsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootQuestions = safeArray(root.institutionalQuestions);
  const nestedQuestions = safeArray(nestedAnalysis.institutionalQuestions);

  return {
    institutionalQuestions: rootQuestions.length ? rootQuestions : nestedQuestions,
    institutionalQuestionsProvenance:
      root.institutionalQuestionsProvenance ||
      nestedAnalysis.institutionalQuestionsProvenance ||
      null,
  };
}

export function normalizeCalibrationWarningsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootWarnings = safeArray(root.calibrationWarnings);
  const nestedWarnings = safeArray(nestedAnalysis.calibrationWarnings);

  return rootWarnings.length ? rootWarnings : nestedWarnings;
}

export function normalizeResolvedInstitutionalLensPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootLens = safeObject(root.resolvedInstitutionalLens);
  const nestedLens = safeObject(nestedAnalysis.resolvedInstitutionalLens);
  const lens = rootLens.lensId ? rootLens : nestedLens;
  return lens.lensId ? {
    ...lens,
    providerClassificationEvidence: safeArray(lens.providerClassificationEvidence),
    matchedSignals: safeArray(lens.matchedSignals),
    ambiguityFlags: safeArray(lens.ambiguityFlags),
    routingSource: safeArray(lens.routingSource),
    sourceBoundary: safeArray(lens.sourceBoundary),
  } : null;
}

export function normalizeLensAwareExplanationsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootExplanations = safeObject(root.lensAwareExplanations);
  const nestedExplanations = safeObject(nestedAnalysis.lensAwareExplanations);
  const explanations = rootExplanations.lensId ? rootExplanations : nestedExplanations;
  return explanations.lensId ? {
    ...explanations,
    evidenceNeeded: safeArray(explanations.evidenceNeeded),
    whatWouldChange: safeArray(explanations.whatWouldChange),
    requiredConditions: safeArray(explanations.requiredConditions),
    sourceQueueRequirements: safeArray(explanations.sourceQueueRequirements),
    boundaryNotes: safeArray(explanations.boundaryNotes),
  } : null;
}

export function normalizeAssetIdentityResolutionPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const asset = safeObject(root.asset || nestedAnalysis.asset);
  const rootIdentity = safeObject(root.assetIdentityResolution);
  const nestedIdentity = safeObject(nestedAnalysis.assetIdentityResolution);
  const assetIdentity = safeObject(asset.assetIdentityResolution);
  const identity = rootIdentity.canonicalAssetName || rootIdentity.canonicalAssetSymbol
    ? rootIdentity
    : nestedIdentity.canonicalAssetName || nestedIdentity.canonicalAssetSymbol
      ? nestedIdentity
      : assetIdentity.canonicalAssetName || assetIdentity.canonicalAssetSymbol
        ? assetIdentity
        : null;

  if (!identity) return null;

  return {
    ...identity,
    canonicalProviderIds: safeObject(identity.canonicalProviderIds),
    allKnownContracts: safeArray(identity.allKnownContracts),
    platformContracts: safeObject(identity.platformContracts),
    oldContracts: safeArray(identity.oldContracts),
    newContracts: safeArray(identity.newContracts),
    explorerLinks: safeArray(identity.explorerLinks),
    officialLinks: safeArray(identity.officialLinks),
    identityWarnings: safeArray(identity.identityWarnings),
    chainWarnings: safeArray(identity.chainWarnings),
    contractWarnings: safeArray(identity.contractWarnings),
    sourceRequirements: safeArray(identity.sourceRequirements),
    sourceBoundary: safeArray(identity.sourceBoundary),
    evidenceSourceSummary: safeArray(identity.evidenceSourceSummary),
  };
}

export function normalizeTokenomicsSupplyIntegrityPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootTokenomics = safeObject(root.tokenomicsSupplyIntegrity);
  const nestedTokenomics = safeObject(nestedAnalysis.tokenomicsSupplyIntegrity);
  const tokenomics = rootTokenomics.supplySummary || rootTokenomics.tokenomicsIntegrityScore !== undefined
    ? rootTokenomics
    : nestedTokenomics.supplySummary || nestedTokenomics.tokenomicsIntegrityScore !== undefined
      ? nestedTokenomics
      : null;

  if (!tokenomics) return null;

  return {
    ...tokenomics,
    supplySummary: safeObject(tokenomics.supplySummary),
    sourceContradictions: safeArray(tokenomics.sourceContradictions),
    providerDisagreements: safeArray(tokenomics.providerDisagreements),
    reviewedSources: safeArray(tokenomics.reviewedSources),
    sourceRequirements: safeArray(tokenomics.sourceRequirements),
    manualReviewTriggers: safeArray(tokenomics.manualReviewTriggers),
    hardBlockers: safeArray(tokenomics.hardBlockers),
    softBlockers: safeArray(tokenomics.softBlockers),
    scoreCaps: safeArray(tokenomics.scoreCaps),
    confidenceCaps: safeArray(tokenomics.confidenceCaps),
    positiveSignals: safeArray(tokenomics.positiveSignals),
    negativeSignals: safeArray(tokenomics.negativeSignals),
    neutralContextualSignals: safeArray(tokenomics.neutralContextualSignals),
    institutionalQuestions: safeArray(tokenomics.institutionalQuestions).map((question) => ({
      ...safeObject(question),
      evidenceUsed: safeArray(question?.evidenceUsed),
      missingEvidence: safeArray(question?.missingEvidence),
      whatWouldChange: safeArray(question?.whatWouldChange),
      sourceBoundary: safeArray(question?.sourceBoundary),
    })),
    whatWouldChange: safeArray(tokenomics.whatWouldChange),
    sourceBoundary: safeArray(tokenomics.sourceBoundary),
    auditRawFields: safeObject(tokenomics.auditRawFields),
  };
}

function firstPresent(...values) {
  return values.find((value) => value !== null && value !== undefined && value !== "");
}

function normalizeSectionNames(value) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, entry]) => {
        const status = typeof entry === "string" ? entry : entry?.status || entry?.availability;
        return status && !["fresh", "live"].includes(String(status).toLowerCase());
      })
      .map(([key]) => key);
  }
  return [];
}

function collectSectionNames(sectionFreshness, statusMatcher) {
  return Object.entries(safeObject(sectionFreshness))
    .filter(([, entry]) => statusMatcher(String(entry?.status || entry?.availability || "").toLowerCase()))
    .map(([key]) => key);
}

function formatSnapshotId(value) {
  if (!value) return null;
  const stringValue = String(value);
  return stringValue.length > 12 ? `${stringValue.slice(0, 8)}...` : stringValue;
}

function buildFreshnessWarnings({ status, freshSections, staleSections, missingSections, source, recomputed }) {
  const warnings = [];
  if (status === "stored_snapshot") {
    warnings.push("Stored snapshot loaded; provider data may not reflect the latest state.");
  }
  if (status === "partial_refresh") {
    warnings.push("Partial refresh loaded; review stale or missing sections before relying on affected tabs.");
  }
  if (status === "cached_recent") {
    warnings.push("Cached/recent memo loaded; verify current provider state when freshness matters.");
  }
  if (status === "unknown") {
    warnings.push("Analysis freshness is unknown; verify before relying on this analysis.");
  }
  if (staleSections.length) {
    warnings.push(`Stale sections require review: ${staleSections.slice(0, 5).join(", ")}.`);
  }
  if (missingSections.length) {
    warnings.push(`Missing sections are unavailable, not negative evidence: ${missingSections.slice(0, 5).join(", ")}.`);
  }
  if (!source) {
    warnings.push("Delivery source was not attached to the frontend payload.");
  }
  if (status !== "fresh_live" && (recomputed === null || recomputed === undefined)) {
    warnings.push("Recomputed status was not attached to the frontend payload.");
  }
  if (!freshSections.length && !staleSections.length && !missingSections.length) {
    warnings.push("Section-level freshness detail is unavailable in the current frontend model.");
  }
  return [...new Set(warnings)];
}

export function normalizeAnalysisFreshnessPayload(responseLike, fallbackSnapshot = null) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const derivedAnalysis = safeObject(root.derivedAnalysis);
  const rawData = safeObject(root.rawData);
  const nestedMeta = safeObject(nestedAnalysis.meta);
  const derivedMeta = safeObject(derivedAnalysis.meta);
  const rootMeta = safeObject(root.meta || nestedMeta || derivedMeta);
  const delivery = safeObject(
    root.delivery ||
    rootMeta.delivery ||
    nestedAnalysis.delivery ||
    nestedMeta.delivery ||
    derivedAnalysis.delivery ||
    derivedMeta.delivery ||
    rawData.delivery ||
    rawData.meta?.delivery,
  );
  const refreshDecision = safeObject(
    root.refreshDecision ||
    rootMeta.refreshDecision ||
    nestedAnalysis.refreshDecision ||
    nestedMeta.refreshDecision ||
    derivedAnalysis.refreshDecision ||
    derivedMeta.refreshDecision ||
    rawData.refreshDecision ||
    rawData.meta?.refreshDecision,
  );
  const sectionFreshness = safeObject(
    root.sectionFreshness ||
    rootMeta.sectionFreshness ||
    nestedAnalysis.sectionFreshness ||
    nestedMeta.sectionFreshness ||
    derivedAnalysis.sectionFreshness ||
    derivedMeta.sectionFreshness ||
    rawData.sectionFreshness ||
    rawData.meta?.sectionFreshness,
  );
  const snapshot = safeObject(fallbackSnapshot || root.snapshot || nestedAnalysis.snapshot || rawData.snapshot);
  const deliverySource = firstPresent(delivery.source, root.analysisSource, root.source, root.deliverySource);
  const sourceText = deliverySource ? String(deliverySource).toLowerCase() : "";
  const refreshMode = firstPresent(refreshDecision.mode, delivery.mode, root.refreshMode);
  const modeText = refreshMode ? String(refreshMode).toLowerCase() : "";
  const recomputed = firstPresent(delivery.recomputed, root.recomputed, refreshDecision.recomputed, null);
  const snapshotId = firstPresent(root.snapshotId, snapshot.snapshotId, delivery.snapshotId, root.analysisSnapshotId);
  const previousSnapshotId = firstPresent(root.previousSnapshotId, snapshot.previousSnapshotId, delivery.previousSnapshotId);
  const generatedAt = firstPresent(root.generatedAt, root.lastAnalyzed, nestedAnalysis.generatedAt, rootMeta.generatedAt, snapshot.generatedAt, delivery.generatedAt, delivery.checkedAt, root.cachedAt);
  const readAt = firstPresent(delivery.readAt, root.readAt, rootMeta.readAt, delivery.checkedAt);
  const previousSnapshotAt = firstPresent(root.previousSnapshotAt, snapshot.previousSnapshotAt, delivery.previousSnapshotAt);
  const snapshotAgeMs = firstPresent(delivery.snapshotAgeMs, root.snapshotAgeMs, rootMeta.snapshotAgeMs);
  const freshnessWindowMs = firstPresent(delivery.freshnessWindowMs, root.freshnessWindowMs, rootMeta.freshnessWindowMs);
  const freshSections = normalizeSectionNames(refreshDecision.freshSections).length
    ? normalizeSectionNames(refreshDecision.freshSections)
    : collectSectionNames(sectionFreshness, (status) => status === "fresh" || status === "live");
  const staleSections = normalizeSectionNames(refreshDecision.staleSections).length
    ? normalizeSectionNames(refreshDecision.staleSections)
    : collectSectionNames(sectionFreshness, (status) => status === "stale");
  const missingSections = [
    ...normalizeSectionNames(refreshDecision.missingSections),
    ...collectSectionNames(sectionFreshness, (status) => status === "missing" || status === "unsupported"),
  ].filter(Boolean);
  const fullRegenerationNeeded = firstPresent(refreshDecision.fullRegenerationNeeded, null);
  const partialRefreshSufficient = firstPresent(refreshDecision.partialRefreshSufficient, null);

  let freshnessStatus = "unknown";
  if (modeText.includes("partial") || sourceText.includes("partial")) {
    freshnessStatus = "partial_refresh";
  } else if (sourceText.includes("snapshot") || modeText.includes("reuse_snapshot") || (snapshotId && recomputed === false)) {
    freshnessStatus = "stored_snapshot";
  } else if (sourceText.includes("cache") || sourceText.includes("memo") || sourceText.includes("recent")) {
    freshnessStatus = "cached_recent";
  } else if (sourceText.includes("live") || recomputed === true || delivery.isFresh === true) {
    freshnessStatus = "fresh_live";
  }

  const freshnessLabel = {
    fresh_live: "Live analysis",
    stored_snapshot: "Stored snapshot",
    partial_refresh: "Partial refresh",
    cached_recent: "Cached/recent memo",
    unknown: "Freshness unknown",
  }[freshnessStatus];
  const summary = freshnessStatus === "fresh_live"
    ? `Live analysis${generatedAt ? ` generated at ${formatDateTime(generatedAt)}` : ""}.`
    : freshnessStatus === "stored_snapshot"
      ? "Stored snapshot preserves prior analysis state; verify current provider state before relying on time-sensitive sections."
      : freshnessStatus === "partial_refresh"
        ? `Partial refresh${freshSections.length ? `: fresh ${freshSections.slice(0, 4).join(", ")}` : ""}${missingSections.length ? `; missing ${missingSections.slice(0, 4).join(", ")}` : ""}.`
        : freshnessStatus === "cached_recent"
          ? "Cached/recent memo loaded; freshness should be checked against delivery metadata."
          : "Freshness unknown. Verify before relying on this analysis.";

  return {
    freshnessStatus,
    freshnessLabel,
    summary,
    analysisSource: deliverySource || null,
    generatedAt: generatedAt || null,
    readAt: readAt || null,
    snapshotId: snapshotId || null,
    snapshotShortId: formatSnapshotId(snapshotId),
    previousSnapshotId: previousSnapshotId || null,
    previousSnapshotAt: previousSnapshotAt || null,
    recomputed: recomputed === null || recomputed === undefined ? null : Boolean(recomputed),
    refreshMode: refreshMode || null,
    fullRegenerationNeeded,
    partialRefreshSufficient,
    freshSections: [...new Set(freshSections)],
    staleSections: [...new Set(staleSections)],
    missingSections: [...new Set(missingSections)],
    sectionFreshness,
    snapshotAgeMs: snapshotAgeMs ?? null,
    freshnessWindowMs: freshnessWindowMs ?? null,
    isSnapshot: freshnessStatus === "stored_snapshot",
    isPartialRefresh: freshnessStatus === "partial_refresh",
    isFreshLive: freshnessStatus === "fresh_live",
    freshnessWarnings: buildFreshnessWarnings({
      status: freshnessStatus,
      freshSections: [...new Set(freshSections)],
      staleSections: [...new Set(staleSections)],
      missingSections: [...new Set(missingSections)],
      source: deliverySource,
      recomputed,
    }),
  };
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

function providerHealthKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeProviderHealthEntry(provider, entry) {
  const safeEntry = safeObject(entry);
  if (!provider && !safeEntry.provider) return null;

  return {
    ...safeEntry,
    provider: safeEntry.provider || provider,
  };
}

export function normalizeProviderHealth(providerHealth) {
  if (!providerHealth) return null;

  const root = safeObject(providerHealth);
  const rawProviders = root.providers;
  const providerEntries = Array.isArray(rawProviders)
    ? rawProviders.map((entry) => normalizeProviderHealthEntry(entry?.provider, entry))
    : Object.entries(safeObject(rawProviders)).map(([provider, entry]) => normalizeProviderHealthEntry(provider, entry));

  const infraEntries = Object.entries(safeObject(root.infra))
    .map(([provider, entry]) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
      if (!("status" in entry) && !("coverage" in entry)) return null;
      return normalizeProviderHealthEntry(provider, entry);
    });

  const providersList = [...providerEntries, ...infraEntries].filter(Boolean);
  const providersByName = providersList.reduce((acc, entry) => {
    const key = providerHealthKey(entry.provider);
    if (key) acc[key] = entry;
    return acc;
  }, {});

  return {
    ...root,
    providersList,
    providersByName,
  };
}

export function getProviderHealthEntry(providerHealth, providerName) {
  const normalized = providerHealth?.providersByName ? providerHealth : normalizeProviderHealth(providerHealth);
  return normalized?.providersByName?.[providerHealthKey(providerName)] || null;
}

export function isProviderHealthDegraded(entry) {
  if (!entry) return false;
  if (entry.status === "failed") return true;
  if (entry.status === "live" || entry.status === "missing_key" || entry.status === "skipped") return false;
  return entry.configured === true && entry.reachable === false;
}

export function providerHealthDisplayTone(entry) {
  if (!entry) return { color: "#8a94a6", label: "Unavailable", configuredLabel: "Unknown", statusLabel: "Unavailable" };

  if (entry.status === "live") {
    return { color: "#d5dcec", label: "Available", configuredLabel: "Yes", statusLabel: "Live" };
  }

  if (entry.status === "missing_key") {
    return { color: "#8a94a6", label: "Not configured", configuredLabel: "No", statusLabel: "Missing Key" };
  }

  if (entry.status === "skipped") {
    return { color: "#aab7cc", label: "Skipped", configuredLabel: "Contextual", statusLabel: "Skipped" };
  }

  if (entry.status === "failed" || entry.reachable === false) {
    return { color: "#ffb020", label: "Provider Issue", configuredLabel: entry.configured === false ? "No" : "Yes", statusLabel: titleCase(entry.status || entry.lastCheckStatus || "failed") };
  }

  return { color: "#aab7cc", label: titleCase(entry.status || "Diagnostic"), configuredLabel: entry.configured === false ? "No" : "Unknown", statusLabel: titleCase(entry.status || entry.lastCheckStatus || "unknown") };
}

export function buildAnalysisQualityExplanation({ confidence, providerDiagnostics = [], providerHealth, sourceStatus }) {
  const degradedProviders = [];
  const normalizedProviderHealth = normalizeProviderHealth(providerHealth);
  const healthMap = [
    ["coingecko", "CoinGecko"],
    ["dexscreener", "DexScreener"],
    ["goplus", "GoPlus"],
    ["anthropic", "Decision memo service"],
    ["postgres", "Postgres"],
  ];

  for (const [key, label] of healthMap) {
    const entry = getProviderHealthEntry(normalizedProviderHealth, key);
    if (isProviderHealthDegraded(entry)) {
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
  const normalizedProviderHealth = normalizeProviderHealth(providerHealth);
  const providerDown = (name) => isProviderHealthDegraded(getProviderHealthEntry(normalizedProviderHealth, name));

  if (section === "market") {
    const geckoDiag = diagnosticsByProvider.coingeckoMarket;
    const dexDiag = diagnosticsByProvider.dexscreener;
    const geckoDown = providerDown("coingecko");
    const dexDown = providerDown("dexscreener");

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
    const geckoDown = providerDown("coingecko");

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
    const goplusDown = providerDown("goplus");

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
    const geckoDown = providerDown("coingecko");

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
    const defillamaDown = providerDown("defillama");

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
    const verdictSemantics = buildVerdictSemanticsDisplay(decisionLayer, thesisCore, safeAnalysis);
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
        verdictSemantics.summary
        || finalVerdict.recommendation
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
        verdictSemantics.boundary
        || finalVerdict.summary
        || primaryWeakness
        || decisionFrame.whyNotNow
        || (
          currentState
            ? `${assetLabel} currently maps to ${titleCase(currentState)}.`
            : "Decision memo unavailable from current analysis data."
        ),
      bullCase:
        verdictSemantics.positiveCase?.[0]
        || safeAiReport.bullCase
        || primaryStrength
        || mustBeTrue[0]
        || null,
      bearCase:
        verdictSemantics.blockedCase?.[0]
        || safeAiReport.bearCase
        || failureMode.primary
        || couldBreak[0]
        || null,
      rating:
        verdictSemantics.label
        || finalVerdict.rating
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

  if (allocationOutcomeKey === "tradable_only" || allocationOutcomeKey === "tradable_only_narrative") {
    return "Token demand is speculative or liquidity-led rather than allocator-grade.";
  }

  if (allocationOutcomeKey === "do_not_allocate_value_capture_failure") {
    return "Protocol or network relevance is not enough; tokenholder value capture remains unproven.";
  }

  if (allocationOutcomeKey === "do_not_allocate_dependency_failure") {
    return "The token thesis is blocked by custody, redemption, backing, wrapper, or other dependency evidence.";
  }

  if (allocationOutcomeKey === "do_not_allocate" || String(allocationOutcomeKey || "").startsWith("do_not_allocate")) {
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

  if (allocationOutcomeKey === "evidence_blocked" || allocationOutcomeKey === "manual_review_required") {
    return whyNotNow || "Allocation is blocked until asset-class-critical evidence is reviewed; this is not confirmed fundamental failure.";
  }

  if (allocationOutcomeKey === "not_allocation_ready") {
    return whyNotNow || primaryWeakness || "Current evidence is not allocation-ready.";
  }

  if (allocationOutcomeKey === "tradable_only" || allocationOutcomeKey === "tradable_only_narrative") {
    return primaryWeakness || failurePrimary || "Speculative interest is not enough to support allocation quality.";
  }

  if (allocationOutcomeKey === "do_not_allocate_value_capture_failure") {
    return primaryWeakness || "Protocol or network relevance is not enough; tokenholder value capture remains unproven.";
  }

  if (allocationOutcomeKey === "do_not_allocate_dependency_failure") {
    return primaryWeakness || "Allocation is blocked by unresolved dependency evidence such as custody, redemption, backing, or wrapper risk.";
  }

  if (allocationOutcomeKey === "avoid_critical_risk") {
    return primaryWeakness || failurePrimary || "A critical live risk dominates the current thesis.";
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
  const decisionLayer = safeObject(safeAnalysis.decisionLayer);
  const verdictSemantics = buildVerdictSemanticsDisplay(decisionLayer, safeAnalysis.thesisCore, safeAnalysis);
  if (verdictSemantics?.hasVerdictClass) {
    return {
      key: verdictSemantics.key,
      label: verdictSemantics.label,
      tone: verdictSemantics.tone,
      shortLabel: verdictSemantics.shortLabel,
    };
  }
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

const VERDICT_CLASS_DISPLAY = {
  capital_worthy: {
    label: "Capital-Worthy",
    shortLabel: "Capital-worthy",
    tone: "positive",
    summary: "Direct thesis support is present and no material blocker is currently evidenced.",
    boundary: "Investable framing still requires independent verification before capital allocation.",
  },
  investable_medium_confidence: {
    label: "Investable - Medium Confidence",
    shortLabel: "Investable / medium",
    tone: "positive",
    summary: "Core thesis support is constructive, while evidence completeness remains partial.",
    boundary: "Medium confidence is a caution label, not evidence completeness.",
  },
  conditional_allocation: {
    label: "Conditional Allocation",
    shortLabel: "Conditional",
    tone: "caution",
    summary: "Allocation depends on named conditions being verified or remaining true.",
    boundary: "Conditions must be source-backed before conviction increases.",
  },
  evidence_blocked: {
    label: "Evidence-Blocked",
    shortLabel: "Evidence-blocked",
    tone: "caution",
    summary: "Allocation is blocked by missing asset-class-critical evidence, not confirmed fundamental failure.",
    boundary: "Research requirements identify evidence still needed; they are not reviewed evidence.",
  },
  manual_review_required: {
    label: "Manual Review Required",
    shortLabel: "Manual review",
    tone: "caution",
    summary: "Human/source review is required before the asset can be treated as allocation-ready.",
    boundary: "Manual review is workflow, not automatic proof of failure.",
  },
  not_allocation_ready: {
    label: "Not Allocation-Ready",
    shortLabel: "Not ready",
    tone: "warning",
    summary: "The current evidence does not justify allocation today.",
    boundary: "Not allocation-ready is a current evidence state, not a permanent verdict.",
  },
  do_not_allocate_fundamental_blocker: {
    label: "Do Not Allocate - Fundamental Blocker",
    shortLabel: "Fundamental blocker",
    tone: "negative",
    summary: "A material fundamental blocker prevents allocation support.",
    boundary: "The blocker must be resolved with live/source-backed evidence before reconsideration.",
  },
  do_not_allocate_value_capture_failure: {
    label: "Do Not Allocate - Value Capture Failure",
    shortLabel: "Value-capture failure",
    tone: "negative",
    summary: "Protocol or network relevance is not enough; tokenholder value capture remains unproven.",
    boundary: "TVL, usage, fees, or network importance do not automatically accrue to tokenholders.",
  },
  do_not_allocate_dependency_failure: {
    label: "Do Not Allocate - Dependency Failure",
    shortLabel: "Dependency failure",
    tone: "negative",
    summary: "Allocation is blocked by unresolved dependency evidence such as custody, redemption, backing, wrapper, or legal-claim risk.",
    boundary: "Dependency assets do not inherit the underlying asset thesis automatically.",
  },
  tradable_only_narrative: {
    label: "Tradable-Only / Narrative-Only",
    shortLabel: "Narrative-only",
    tone: "warning",
    summary: "Narrative and liquidity may make the asset tradable, but durable fundamentals are not established.",
    boundary: "Attention, volume, or community activity is not institutional thesis support.",
  },
  avoid_critical_risk: {
    label: "Avoid - Critical Risk",
    shortLabel: "Avoid",
    tone: "negative",
    summary: "A critical live risk or blocker dominates the current analysis.",
    boundary: "Critical risk must be resolved before allocation review continues.",
  },
};

export function buildVerdictSemanticsDisplay(decisionLayer, thesisCore, analysis) {
  const safeDecisionLayer = safeObject(decisionLayer);
  const safeThesisCore = safeObject(thesisCore);
  const safeAnalysis = safeObject(analysis);
  const verdictClass = typeof safeDecisionLayer.verdictClass === "string"
    ? safeDecisionLayer.verdictClass
    : null;
  const base = verdictClass ? VERDICT_CLASS_DISPLAY[verdictClass] : null;
  const allocationCase = safeObject(safeDecisionLayer.allocationCase);
  const verdictReasons = safeObject(safeDecisionLayer.verdictReasons);
  const researchRequirements = safeArray(safeDecisionLayer.researchRequirements);

  if (!base) {
    return {
      hasVerdictClass: false,
      key: null,
      label: null,
      shortLabel: null,
      tone: null,
      summary: null,
      boundary: null,
      positiveCase: [],
      blockedCase: [],
      missingEvidence: [],
      whatWouldChange: [],
      researchRequirements: [],
      verdictReasons: {
        positiveThesisEvidence: [],
        realBlockers: [],
        evidenceGaps: [],
        reviewOnlyCautions: [],
        notApplicableItems: [],
        whatWouldChangeDecision: [],
      },
    };
  }

  const normalizedReasons = {
    positiveThesisEvidence: normalizeRenderableList(verdictReasons.positiveThesisEvidence),
    realBlockers: normalizeRenderableList(verdictReasons.realBlockers),
    evidenceGaps: normalizeRenderableList(verdictReasons.evidenceGaps),
    reviewOnlyCautions: normalizeRenderableList(verdictReasons.reviewOnlyCautions),
    notApplicableItems: normalizeRenderableList(verdictReasons.notApplicableItems),
    whatWouldChangeDecision: normalizeRenderableList(verdictReasons.whatWouldChangeDecision),
  };

  const positiveCase = dedupeCaseInsensitive([
    ...normalizeRenderableList(allocationCase.forAllocation),
    ...normalizedReasons.positiveThesisEvidence,
    safeThesisCore.primaryStrength,
  ]).slice(0, 5);
  const blockedCase = dedupeCaseInsensitive([
    ...normalizeRenderableList(allocationCase.againstAllocation),
    ...normalizedReasons.realBlockers,
    safeThesisCore.primaryWeakness,
  ]).filter((item) => !isNoMaterialWeakness(item)).slice(0, 5);
  const missingEvidence = dedupeCaseInsensitive([
    ...normalizeRenderableList(allocationCase.missingEvidence),
    ...normalizedReasons.evidenceGaps,
    ...normalizeRenderableList(safeThesisCore.evidenceQuality?.missingCritical),
  ]).slice(0, 5);
  const whatWouldChange = dedupeCaseInsensitive([
    ...normalizeRenderableList(allocationCase.whatWouldChange),
    ...normalizedReasons.whatWouldChangeDecision,
    ...normalizeRenderableList(safeDecisionLayer.decisionFrame?.whatMustBeTrue),
  ]).slice(0, 5);

  return {
    hasVerdictClass: true,
    key: verdictClass,
    verdictClass,
    label: base.label,
    shortLabel: base.shortLabel,
    tone: base.tone,
    summary: base.summary,
    boundary: base.boundary,
    finalVerdictRating: safeAnalysis.aiReport?.finalVerdict?.rating || null,
    positiveCase,
    blockedCase,
    missingEvidence,
    whatWouldChange,
    researchRequirements,
    verdictReasons: normalizedReasons,
  };
}

function normalizeDecisionCandidates(...groups) {
  return groups
    .flatMap((group) => (Array.isArray(group) ? normalizeRenderableList(group) : [extractRenderableText(group, null)]))
    .map((entry) => sanitizeSemanticLabel(entry, null))
    .filter(Boolean);
}

function firstMeaningfulDecisionText(...groups) {
  return normalizeDecisionCandidates(...groups).find((entry) => !isNoMaterialWeakness(entry)) || null;
}

export function derivePrimaryBlocker({
  blockers,
  primaryWeakness,
  failureMode,
  missingCritical,
  auditAlerts,
  topNegativeDrivers,
}) {
  const label = firstMeaningfulDecisionText(
    blockers,
    primaryWeakness,
    failureMode?.primary,
    missingCritical,
    auditAlerts,
    topNegativeDrivers,
  );

  return {
    label: label || "Primary blocker not explicitly available in live response.",
    explanation: label
      ? "Derived from live decision, thesis, risk, or missing-evidence fields."
      : "The live response did not expose a dominant blocker field.",
    badge: label ? "Derived proxy" : "Unavailable",
  };
}

export function deriveWeakestLink({
  evidenceConstraintNote,
  primaryWeakness,
  missingCritical,
  failureMode,
  sourceAgreementSummary,
}) {
  const label = firstMeaningfulDecisionText(
    evidenceConstraintNote,
    primaryWeakness,
    missingCritical,
    sourceAgreementSummary,
    failureMode?.primary,
  );

  return {
    label: label || "Weakest link not explicitly available in live response.",
    explanation: label
      ? "Weakest-link proxy from live confidence, evidence, and thesis fields."
      : "The live response did not expose a dedicated weakest-link field.",
    badge: label ? "Weakest-link proxy" : "Unavailable",
  };
}

export function deriveWhatWouldChangeDecision({
  requiredConditions,
  nextCheckpoints,
  missingCritical,
  whyNotNow,
}) {
  const candidates = normalizeDecisionCandidates(requiredConditions, nextCheckpoints, missingCritical, whyNotNow)
    .filter((entry) => !isNoMaterialWeakness(entry));
  const items = dedupeCaseInsensitive(candidates).slice(0, 4);

  return {
    items: items.length ? items : ["Additional verified evidence required."],
    badge: items.length ? "Live requirements" : "Fallback",
  };
}

export function deriveAssetClassLabel({ assetClass, assetSubtype, primarySector }) {
  const parts = [
    assetClass ? titleCase(assetClass) : null,
    assetSubtype && assetSubtype !== "unknown" ? titleCase(assetSubtype) : null,
    primarySector && primarySector !== "Unknown" ? primarySector : null,
  ].filter(Boolean);

  return dedupeCaseInsensitive(parts).join(" | ") || "Asset class unavailable";
}

export function deriveAssetFramingLabel({ assetClass, assetSubtype, primarySector }) {
  const raw = `${assetClass || ""} ${assetSubtype || ""} ${primarySector || ""}`.toLowerCase();
  if (raw.includes("stable")) return "Trust / Settlement Asset";
  if (raw.includes("wrapped") || raw.includes("lst") || raw.includes("liquid staking")) return "Dependency / Redeemability Asset";
  if (raw.includes("native")) return "Benchmark / Monetary Asset";
  if (raw.includes("gas")) return "Base-Layer Settlement Asset";
  if (raw.includes("defi") || raw.includes("yield")) return "Protocol / Tokenholder-Accrual Thesis";
  if (raw.includes("infrastructure") || raw.includes("oracle") || raw.includes("compute")) return "Infrastructure Utility Thesis";
  if (raw.includes("meme") || raw.includes("narrative")) return "Narrative / Liquidity Thesis";
  return "Digital Asset Allocation Thesis";
}

const RESOLVED_LENS_DISPLAY_LABELS = {
  PAYMENTS_SETTLEMENT: {
    assetClassLabel: "Payments / Settlement Network Token",
    assetFramingLabel: "Payments Settlement Network Thesis",
  },
  GAMING_METAVERSE_CONSUMER: {
    assetClassLabel: "Gaming / GameFi Utility Token",
    assetFramingLabel: "Gaming Demand / Token Sink Thesis",
  },
  RWA_HYBRID_INFRASTRUCTURE: {
    assetClassLabel: "RWA Infrastructure / Hybrid Utility Token",
    assetFramingLabel: "RWA Infrastructure Utility Thesis",
  },
  RWA_HYBRID_ASSET: {
    assetClassLabel: "Tokenized Asset / RWA Thesis",
    assetFramingLabel: "RWA Rights / Redemption Thesis",
  },
  DEFI_PROTOCOL_TOKEN: {
    assetClassLabel: "DeFi Protocol Token / Value-Capture Thesis",
    assetFramingLabel: "Protocol Tokenholder Accrual Thesis",
  },
  STABLECOIN_SETTLEMENT: {
    assetClassLabel: "Stablecoin / Settlement Trust Asset",
    assetFramingLabel: "Stablecoin Trust / Redemption Thesis",
  },
  WRAPPED_ASSET: {
    assetClassLabel: "Wrapped Asset / Backing & Redemption Thesis",
    assetFramingLabel: "Wrapped Representation Dependency Thesis",
  },
  LST_STAKING_DERIVATIVE: {
    assetClassLabel: "Liquid Staking Token / Redemption & Slashing Thesis",
    assetFramingLabel: "Liquid Staking Derivative Thesis",
  },
  ORACLE_INFRASTRUCTURE: {
    assetClassLabel: "Oracle / Infrastructure Token",
    assetFramingLabel: "Oracle Token Necessity Thesis",
  },
  DEPENDENCY_INFRASTRUCTURE: {
    assetClassLabel: "Dependency Infrastructure Token",
    assetFramingLabel: "Infrastructure Token Necessity Thesis",
  },
  DEPIN_COMPUTE_STORAGE: {
    assetClassLabel: "DePIN Infrastructure Token",
    assetFramingLabel: "Resource Network Demand Thesis",
  },
  MEME_NARRATIVE: {
    assetClassLabel: "Meme / Narrative Asset",
    assetFramingLabel: "Narrative / Liquidity Thesis",
  },
  BASE_LAYER_SETTLEMENT: {
    assetClassLabel: "Base-Layer / Settlement Asset",
    assetFramingLabel: "Base-Layer Settlement Thesis",
  },
  NATIVE_MONETARY_BENCHMARK: {
    assetClassLabel: "Base-Layer / Monetary Benchmark Asset",
    assetFramingLabel: "Monetary Benchmark Thesis",
  },
};

const LENS_PRIMARY_COPY = {
  PAYMENTS_SETTLEMENT: {
    positive: "Payment-ledger utility can be evaluated through verified settlement usage, fee/reserve mechanics, validator/finality design, and distribution evidence.",
    blocked: "Allocation confidence depends on verified payment/settlement usage, reserve/fee/burn materiality, validator/finality assumptions, escrow/distribution overhang, and ecosystem dependency.",
  },
  GAMING_METAVERSE_CONSUMER: {
    positive: "Gaming adoption can support the thesis only if gameplay activity creates durable token demand after rewards, emissions, and subsidies are reviewed.",
    blocked: "Gaming activity must be separated from incentive-funded usage; active users, paying users, token sinks, emissions, mintability, and unlocks require reviewed evidence.",
  },
  RWA_HYBRID_INFRASTRUCTURE: {
    positive: "RWA infrastructure relevance can be evaluated only after utility-token economics, fee/staking/gas demand, and canonical network/contract mapping are verified.",
    blocked: "RWA infrastructure relevance does not prove tokenholder value capture. Utility-token economics, legal/RWA rights separation, fee/staking/gas demand, and canonical network/contract mapping require reviewed evidence.",
  },
  RWA_HYBRID_ASSET: {
    positive: "Tokenized-asset classification can support review only if legal claim, redemption, issuer, custodian, collateral, and jurisdiction evidence is source-backed.",
    blocked: "RWA/category metadata is not enforceable rights; legal claim, redemption enforceability, issuer/custodian/collateral, and jurisdiction evidence remain primary requirements.",
  },
  DEFI_PROTOCOL_TOKEN: {
    positive: "Protocol success can support the token thesis only when fee routing, governance rights, buyback/burn, staking, treasury, or other accrual mechanics are source-backed.",
    blocked: "Protocol success does not automatically accrue to tokenholders. Fee switch, fee routing, buyback/burn, treasury, staking, and governance durability must be source-backed.",
  },
  STABLECOIN_SETTLEMENT: {
    positive: "Stablecoin utility is a trust thesis, not an upside thesis; reserve quality, redemption rights, issuer/custodian dependency, peg stress, and controls determine support.",
    blocked: "Reserve quality, redemption rights, issuer/custodian dependency, peg stress, and admin/freeze controls determine trust.",
  },
  WRAPPED_ASSET: {
    positive: "Wrapped exposure can be evaluated only through backing, custodian/merchant model, mint/burn controls, redemption path, and proof-of-reserves.",
    blocked: "Backing, custodian/merchant model, mint/burn, redemption path, and proof-of-reserves determine whether the representation is safe.",
  },
  LST_STAKING_DERIVATIVE: {
    positive: "Liquid staking exposure depends on verified withdrawal/redemption mechanics, slashing/operator risk, depeg/liquidity depth, scanner review, and admin controls.",
    blocked: "Withdrawal queue, slashing/operator risk, depeg/liquidity risk, and protocol/admin controls determine the thesis.",
  },
  ORACLE_INFRASTRUCTURE: {
    positive: "Oracle infrastructure relevance must be tied to token-required service payment, staking, collateral, security, or service-operation mechanics.",
    blocked: "Infrastructure adoption is not tokenholder demand by itself; oracle usage, payment/staking/security mechanics, and durable token necessity require source-backed evidence.",
  },
  DEPIN_COMPUTE_STORAGE: {
    positive: "Resource-network relevance can support the thesis only if payer demand, provider incentives, and token settlement/payment role are durable and source-backed.",
    blocked: "Resource demand, payer mapping, provider incentives, subsidy dependency, and compute/storage usage must be verified before stronger conviction.",
  },
  MEME_NARRATIVE: {
    positive: "Liquidity and narrative can explain tradability, but allocation support requires durable non-narrative utility or enforceable economic rights.",
    blocked: "Narrative and liquidity are tradability context, not durable allocation-thesis support without non-narrative utility or rights.",
  },
  BASE_LAYER_SETTLEMENT: {
    positive: "Base-layer support depends on settlement/gas demand, validator/security economics, issuance/burn/staking mechanics, liveness, and network survivability.",
    blocked: "Settlement/gas demand, validator/security role, issuance/burn/staking economics, liveness, and protocol-upgrade risk require direct evidence.",
  },
  NATIVE_MONETARY_BENCHMARK: {
    positive: "Monetary benchmark support depends on monetary policy, market depth, security budget, settlement reliability, and censorship-resistance evidence.",
    blocked: "Benchmark recognition alone is not enough; monetary policy, market depth, security budget, and settlement resilience still define the thesis.",
  },
};

function resolvedLensIsDisplayAuthoritative(lens) {
  return Boolean(
    lens?.lensId &&
    lens.confidence === "high" &&
    !["GENERAL_LOW_COVERAGE", "AMBIGUOUS_MANUAL_CLASSIFICATION"].includes(lens.lensId),
  );
}

function displayLabelsForResolvedLens(lens) {
  return resolvedLensIsDisplayAuthoritative(lens) ? RESOLVED_LENS_DISPLAY_LABELS[lens.lensId] || null : null;
}

function buildLensAwareVerdictSemantics(baseSemantics, lens, lensAware) {
  if (!resolvedLensIsDisplayAuthoritative(lens) || !lensAware) return baseSemantics;
  const copy = LENS_PRIMARY_COPY[lens.lensId] || {};
  const positiveCase = dedupeCaseInsensitive([
    copy.positive,
    ...(baseSemantics.positiveCase || []),
  ]).slice(0, 5);
  const blockedCase = dedupeCaseInsensitive([
    copy.blocked,
    lensAware.primaryBlocker,
    ...(baseSemantics.blockedCase || []),
  ]).slice(0, 5);

  return {
    ...baseSemantics,
    positiveCase,
    blockedCase,
    summary: copy.blocked || baseSemantics.summary,
    boundary: "Primary display copy is lens-aware and derived from resolvedInstitutionalLens; raw fallback fields remain available in Audit / Raw.",
  };
}

function buildLensAwareSecondaryCopy(lens, lensAware, fallback = {}) {
  if (!resolvedLensIsDisplayAuthoritative(lens) || !lensAware) return fallback;
  const copy = LENS_PRIMARY_COPY[lens.lensId] || {};
  const evidenceNeeded = normalizeRenderableList(lensAware.evidenceNeeded);
  const whatWouldChange = normalizeRenderableList(lensAware.whatWouldChange);
  const requiredConditions = normalizeRenderableList(lensAware.requiredConditions);
  const primaryBlocker = extractRenderableText(lensAware.primaryBlocker, null) || copy.blocked || evidenceNeeded[0] || fallback.primaryWeakness;
  const positive = copy.positive || requiredConditions[0] || fallback.primaryStrength;
  const blocked = copy.blocked || primaryBlocker;
  const driverPool = dedupeCaseInsensitive([
    positive,
    primaryBlocker,
    ...requiredConditions,
    ...evidenceNeeded,
    ...whatWouldChange,
  ]).filter(Boolean);
  return {
    ...fallback,
    whyNow: positive || fallback.whyNow,
    whyNotNow: blocked || fallback.whyNotNow,
    summaryMemo: blocked || fallback.summaryMemo,
    structuredThesisSummary: blocked || fallback.summaryMemo,
    primaryStrength: positive || fallback.primaryStrength,
    primaryWeakness: primaryBlocker || fallback.primaryWeakness,
    failurePrimary: primaryBlocker || fallback.failurePrimary,
    failureTrigger: whatWouldChange[0] || blocked || fallback.failureTrigger,
    tokenDemandTruth: positive
      ? `${positive} Provider metadata and live model outputs remain classification/display context until source-backed evidence confirms the thesis.`
      : fallback.tokenDemandTruth,
    decisionDrivers: driverPool.slice(0, 3),
    blockers: dedupeCaseInsensitive([primaryBlocker, ...evidenceNeeded]).filter(Boolean).slice(0, 4),
    whatCouldBreak: dedupeCaseInsensitive([primaryBlocker, ...evidenceNeeded, ...whatWouldChange]).filter(Boolean).slice(0, 4),
    topPositiveDrivers: positive ? [positive] : fallback.topPositiveDrivers,
    topNegativeDrivers: dedupeCaseInsensitive([primaryBlocker, ...evidenceNeeded]).filter(Boolean).slice(0, 4),
    topNeutralDrivers: whatWouldChange.length ? whatWouldChange.slice(0, 4) : fallback.topNeutralDrivers,
  };
}

export function buildLensSpecificResearchDomains(model = {}, displayIdentity = null) {
  const resolvedLensId = model?.resolvedInstitutionalLens?.lensId || displayIdentity?.lensId;
  const identity = model?.assetIdentityResolution || {};
  const identityNeeds = [
    identity?.canonicalNetworkCandidate || identity?.nativeNetworkCandidate ? `Canonical / analyzed representation: ${identity.canonicalNetworkCandidate || identity.nativeNetworkCandidate}` : null,
    identity?.isMultichain ? "Supported network / contract mapping" : null,
    identity?.migrationStatus && identity.migrationStatus !== "none_detected" ? "Migration / old-new contract mapping" : null,
  ].filter(Boolean);

  const map = {
    PAYMENTS_SETTLEMENT: [
      "Payments / Settlement",
      "Validator / UNL / Finality",
      "Escrow / Distribution",
      "Fee Burn / Reserve Mechanics",
      "Issuer / Ecosystem Dependency",
    ],
    GAMING_METAVERSE_CONSUMER: [
      "Gaming / GameFi",
      "Active Users / Retention",
      "Marketplace / Tournament / In-Game Demand",
      "Token Sinks / Reward Emissions",
      "Mintability / Unlocks",
    ],
    RWA_HYBRID_INFRASTRUCTURE: [
      "RWA Infrastructure",
      "Tokenized Assets",
      "Utility Token vs Security Token Rights",
      "Canonical Chain / Contract Migration",
      "Supply Cap / Emissions",
      ...identityNeeds,
    ],
    DEFI_PROTOCOL_TOKEN: [
      "DeFi Protocol Token",
      "AMM / DEX",
      "Protocol Fees / Fee Switch",
      "Governance Rights",
      "Tokenholder Value Capture",
      "Protocol Revenue / TVL / Volume",
    ],
    RWA_HYBRID_ASSET: [
      "Legal / Economic Claim",
      "Redemption Enforceability",
      "Issuer / Custodian / Collateral",
      "Jurisdiction",
      "Attestations / Backing",
    ],
    ORACLE_INFRASTRUCTURE: [
      "Oracle Service Payment",
      "Staking / Collateral / Security",
      "Data Feed / Network Usage",
      "Token Necessity",
      "Infrastructure Adoption vs Token Demand",
    ],
    DEPIN_COMPUTE_STORAGE: [
      "Resource Demand",
      "Payer Mapping",
      "Provider Incentives",
      "Subsidy Dependency",
      "Token Settlement / Payment Role",
    ],
    STABLECOIN_SETTLEMENT: [
      "Reserve Attestation",
      "Redemption Eligibility",
      "Holder Legal Claim",
      "Issuer / Custodian / Admin Controls",
      "Peg Stress",
    ],
    WRAPPED_ASSET: [
      "Proof-of-Reserves / Backing",
      "Custodian / Merchant Model",
      "Mint / Burn Controls",
      "Redemption Path",
      "Native-Asset Inheritance Boundary",
    ],
    LST_STAKING_DERIVATIVE: [
      "Withdrawal Queue / Redemption",
      "Slashing / Operator Risk",
      "Depeg / Liquidity Depth",
      "Scanner Verification",
      "Protocol / Admin Controls",
    ],
    BASE_LAYER_SETTLEMENT: [
      "Network Activity / Fees",
      "Validator / Security Model",
      "Issuance / Burn / Staking",
      "Liveness / Congestion / Client Risk",
      "Protocol Upgrade Risk",
    ],
    NATIVE_MONETARY_BENCHMARK: [
      "Monetary Policy",
      "Market Depth",
      "Security Budget",
      "Settlement Reliability",
      "Censorship Resistance",
    ],
    MEME_NARRATIVE: [
      "Narrative / Liquidity Tradability",
      "Holder Concentration",
      "Durable Non-Narrative Utility",
      "Economic Rights Boundary",
    ],
  };

  return dedupeCaseInsensitive(map[resolvedLensId] || [
    "Primary-source documentation for the current thesis blockers",
    "Freshness, publisher authenticity, and claim-scope verification",
    "Contradiction checks against provider diagnostics and audit alerts",
  ]);
}

export function deriveManualReviewStatus({ missingCritical, evidenceConflicts, auditAlerts }) {
  if (evidenceConflicts) {
    return {
      label: "Manual review advised",
      detail: "Conflicting or unresolved evidence appears in the live response.",
    };
  }

  if (safeArray(missingCritical).length) {
    return {
      label: "Manual review likely",
      detail: "Critical missing evidence is present in the live response.",
    };
  }

  if (safeArray(auditAlerts).length) {
    return {
      label: "Review signals present",
      detail: "Policy or audit alerts are present in the live response.",
    };
  }

  return {
    label: "No explicit review flag",
    detail: "Institutional manual-review counts are not attached to this live response.",
  };
}

export function formatScoreValue(value) {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return "Unavailable";
  }
  return `${Math.round(Number(value))}/100`;
}

function sourceStatusEntries(sourceStatus) {
  return Object.entries(safeObject(sourceStatus))
    .map(([section, status]) => ({
      section,
      status: typeof status === "string" ? status : extractRenderableText(status, null),
    }))
    .filter((entry) => entry.status);
}

function providerDiagnosticLabel(entry) {
  return providerLabel(entry?.provider || entry?.source || entry?.section || "provider");
}

export function deriveEvidenceStatusProxy({
  model,
  analysis,
  confidence,
  providerDiagnostics = [],
  sourceStatus,
  meta,
  providerHealth,
} = {}) {
  const safeModel = safeObject(model);
  const safeAnalysis = safeObject(analysis);
  const confidenceModel = safeObject(confidence || safeAnalysis.confidence);
  const evidenceDirectness = safeObject(safeAnalysis.evidenceDirectness);
  const diagnostics = safeArray(providerDiagnostics);
  const statusEntries = sourceStatusEntries(sourceStatus);
  const providerNotes = normalizeRenderableList(safeObject(meta).providerNotes);
  const normalizedProviderHealth = normalizeProviderHealth(providerHealth);
  const items = [];
  const warnings = [
    "Live proxy, not full institutional evidence map.",
    "Report-only source overlays are not connected to live scoring.",
    "Source candidates require manual review before they become evidence.",
  ];
  const unavailable = [
    "Institutional evidence-map counts are not attached to this live response.",
    "Source discovery candidate counts are not attached to this live response.",
    "Manual-source overlay status is not attached to this live response.",
  ];

  const missingCritical = normalizeRenderableList(safeModel.missingCritical);
  if (missingCritical.length) {
    items.push({
      key: "missing_critical",
      label: "Missing Critical Evidence",
      valueLabel: "Detected",
      severity: "critical",
      description: missingCritical.slice(0, 2).join("; "),
      sourceLabel: "thesisCore.evidenceQuality.missingCritical",
      isProxy: true,
    });
  }

  const providerGapDiagnostics = diagnostics.filter((entry) => (
    entry.status === "failure" ||
    entry.status === "skipped" ||
    entry.errorClass === "unsupported" ||
    ["missing", "unavailable", "unsupported"].includes(entry.coverage || "")
  ));
  const providerGapStatuses = statusEntries.filter((entry) => (
    ["unsupported", "skipped", "unavailable", "missing"].includes(String(entry.status).toLowerCase())
  ));
  const unreachableProviders = safeArray(normalizedProviderHealth?.providersList)
    .filter((entry) => isProviderHealthDegraded(entry))
    .map((entry) => providerLabel(entry.provider));
  const providerGapLabels = dedupeCaseInsensitive([
    ...providerGapDiagnostics.map(providerDiagnosticLabel),
    ...providerGapStatuses.map((entry) => titleCase(entry.section)),
    ...unreachableProviders,
  ]);
  if (providerGapLabels.length) {
    items.push({
      key: "provider_gap",
      label: "Provider Gap / Not Available",
      valueLabel: "Present",
      severity: "warning",
      description: providerGapLabels.slice(0, 3).join(", "),
      sourceLabel: "provider diagnostics / source status",
      isProxy: true,
    });
  }

  const weakDiagnostics = diagnostics.filter((entry) => ["partial", "weak"].includes(entry.coverage || ""));
  const partialStatuses = statusEntries.filter((entry) => (
    ["partial", "modeled", "weak"].includes(String(entry.status).toLowerCase())
  ));
  const directness = evidenceDirectness.directness || evidenceDirectness.status || null;
  const indirectDirectness = ["mostly_inferred", "descriptive_only", "critical_gaps"].includes(directness);
  const partialLabels = dedupeCaseInsensitive([
    ...weakDiagnostics.map(providerDiagnosticLabel),
    ...partialStatuses.map((entry) => titleCase(entry.section)),
    indirectDirectness ? titleCase(directness) : null,
  ].filter(Boolean));
  if (partialLabels.length) {
    items.push({
      key: "partial_indirect",
      label: "Partial / Indirect Context",
      valueLabel: "Proxy",
      severity: "info",
      description: partialLabels.slice(0, 3).join(", "),
      sourceLabel: "evidenceDirectness / partial provider coverage",
      isProxy: true,
    });
  }

  const auditAlerts = normalizeRenderableList(safeModel.auditAlerts);
  const hasConflict = Boolean(safeModel.evidenceConflicts || safeModel.contradictionNote);
  if (hasConflict || auditAlerts.length) {
    items.push({
      key: "contradiction_audit",
      label: hasConflict ? "Contradiction / Audit Alert" : "Audit Alert",
      valueLabel: "Review required",
      severity: "critical",
      description: hasConflict
        ? "Conflicting or unresolved evidence appears in the live response."
        : auditAlerts.slice(0, 2).join("; "),
      sourceLabel: hasConflict ? "thesisCore/confidence conflict fields" : "policy signals / warnings",
      isProxy: true,
    });
  }

  const manualReviewLabel = safeModel.manualReviewStatus?.label || "";
  const manualReviewIsActive = manualReviewLabel && !manualReviewLabel.toLowerCase().includes("no explicit");
  if (manualReviewIsActive || missingCritical.length || hasConflict || providerGapLabels.length || auditAlerts.length) {
    items.push({
      key: "manual_review_signal",
      label: "Manual Review Signal",
      valueLabel: "Review required",
      severity: "review",
      description: safeModel.manualReviewStatus?.detail || "Live proxy signals indicate analyst review may be warranted.",
      sourceLabel: "manual-review proxy from live response",
      isProxy: true,
    });
  }

  const evidenceStrength = safeModel.evidenceStrength || safeAnalysis?.thesisCore?.evidenceQuality?.strength || null;
  const successfulDiagnostics = diagnostics.filter((entry) => (
    entry.status === "success" && ["strong", "available", "complete", "live"].includes(entry.coverage || "available")
  ));
  const liveStatuses = statusEntries.filter((entry) => ["live", "available", "success"].includes(String(entry.status).toLowerCase()));
  if (evidenceStrength || successfulDiagnostics.length || liveStatuses.length) {
    items.unshift({
      key: "confirmed_context",
      label: "Live Context Available",
      valueLabel: "Present",
      severity: "info",
      description: evidenceStrength
        ? `Live engine context signal: ${titleCase(evidenceStrength)}. This is not institutional question-level support.`
        : `${dedupeCaseInsensitive([
          ...successfulDiagnostics.map(providerDiagnosticLabel),
          ...liveStatuses.map((entry) => titleCase(entry.section)),
        ]).slice(0, 3).join(", ")}. This is not institutional question-level support.`,
      sourceLabel: "live engine/provider context only, not institutional support",
      isProxy: true,
    });
  }

  if (!items.length && (confidenceModel.summary || providerNotes.length)) {
    items.push({
      key: "partial_indirect",
      label: "Partial / Indirect Context",
      valueLabel: "Proxy",
      severity: "neutral",
      description: confidenceModel.summary || providerNotes.slice(0, 2).join("; "),
      sourceLabel: "confidence/provider notes",
      isProxy: true,
    });
  }

  return {
    label: "Live Evidence Proxy",
    summary: items.length
      ? "Derived from the current analysis response. Not the full institutional evidence map."
      : "No evidence-status proxy signals were attached to this live response.",
    items,
    warnings,
    unavailable,
  };
}

export function normalizeEvidenceProxyDisplayLabel(item = {}) {
  const key = String(item.key || "").toLowerCase();
  const rawLabel = String(item.valueLabel || "").toLowerCase();
  const rawSignal = String(item.label || "").toLowerCase();

  if (key.includes("provider") || rawSignal.includes("provider gap") || rawLabel.includes("unavailable")) {
    return {
      statusLabel: "Provider Gap Flagged",
      signalType: "Provider coverage signal",
      meaning: "Provider availability issue or missing provider coverage; not a positive evidence signal.",
      boundaryLabel: "Not Full Evidence Mapping",
      tone: "#aab7cc",
    };
  }

  if (key.includes("partial") || rawLabel.includes("proxy") || rawSignal.includes("indirect")) {
    return {
      statusLabel: "Indirect / Partial Signal",
      signalType: "Indirect context signal",
      meaning: "Indirect context only; requires source review before it can support a thesis.",
      boundaryLabel: "Not Full Evidence Mapping",
      tone: "#aab7cc",
    };
  }

  if (
    key.includes("manual") ||
    key.includes("audit") ||
    key.includes("contradiction") ||
    key.includes("missing") ||
    rawLabel.includes("review") ||
    rawLabel.includes("detected")
  ) {
    return {
      statusLabel: "Review Signal Flagged",
      signalType: "Review workflow signal",
      meaning: "Workflow signal only; not automatic proof of failure.",
      boundaryLabel: "Needs Source Review",
      tone: "#d5dcec",
    };
  }

  if (key.includes("confirmed") || rawLabel.includes("present") || rawLabel.includes("detected")) {
    return {
      statusLabel: "Live Context Available",
      signalType: "Live response context",
      meaning: "Live context exists, but this is not institutional question-level support.",
      boundaryLabel: "Not Full Evidence Mapping",
      tone: "#d5dcec",
    };
  }

  return {
    statusLabel: "Indirect / Partial Signal",
    signalType: "Qualitative review signal",
    meaning: "Current response context only; not a score, support rating, or evidence count.",
    boundaryLabel: "Not Full Evidence Mapping",
    tone: "#aab7cc",
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
  const calibrationWarnings = normalizeCalibrationWarningsPayload(safeAnalysis);
  const resolvedInstitutionalLens = normalizeResolvedInstitutionalLensPayload(safeAnalysis);
  const lensAwareExplanations = normalizeLensAwareExplanationsPayload(safeAnalysis);
  const assetIdentityResolution = normalizeAssetIdentityResolutionPayload(safeAnalysis);
  const tokenomicsSupplyIntegrity = normalizeTokenomicsSupplyIntegrityPayload(safeAnalysis);
  const analysisFreshness = safeAnalysis.analysisFreshness || normalizeAnalysisFreshnessPayload(safeAnalysis);
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
  const primaryBlocker = derivePrimaryBlocker({
    blockers,
    primaryWeakness,
    failureMode: { primary: failurePrimary },
    missingCritical,
    auditAlerts,
    topNegativeDrivers: contributors.negatives,
  });
  const weakestLink = deriveWeakestLink({
    evidenceConstraintNote,
    primaryWeakness,
    missingCritical,
    failureMode: { primary: failurePrimary },
    sourceAgreementSummary: confidenceModel.sourceAgreementSummary,
  });
  const whatWouldChangeDecision = deriveWhatWouldChangeDecision({
    requiredConditions,
    nextCheckpoints: decisionFrame.nextCheckpoints,
    missingCritical,
    whyNotNow: sanitizedWhyNotNow,
  });
  const manualReviewStatus = deriveManualReviewStatus({
    missingCritical,
    evidenceConflicts,
    auditAlerts,
  });
  const rawVerdictSemantics = buildVerdictSemanticsDisplay(decisionLayer, thesisCore, safeAnalysis);
  const lensDisplayLabels = displayLabelsForResolvedLens(resolvedInstitutionalLens);
  const assetClassLabel = lensDisplayLabels?.assetClassLabel || deriveAssetClassLabel({
    assetClass: assetClassification.assetClass || null,
    assetSubtype: assetClassification.subtype || null,
    primarySector: sectorClassification.primarySector || null,
  });
  const assetFramingLabel = lensDisplayLabels?.assetFramingLabel || deriveAssetFramingLabel({
    assetClass: assetClassification.assetClass || null,
    assetSubtype: assetClassification.subtype || null,
    primarySector: sectorClassification.primarySector || null,
  });
  const verdictSemantics = buildLensAwareVerdictSemantics(rawVerdictSemantics, resolvedInstitutionalLens, lensAwareExplanations);
  const institutionalQuestionPayload = normalizeInstitutionalQuestionsPayload(safeAnalysis);
  const displayEvidenceNeeded = lensAwareExplanations?.evidenceNeeded?.length
    ? lensAwareExplanations.evidenceNeeded
    : missingCritical;
  const displayRequiredConditions = lensAwareExplanations?.requiredConditions?.length
    ? lensAwareExplanations.requiredConditions
    : requiredConditions;
  const displayWhatWouldChangeDecision = lensAwareExplanations?.whatWouldChange?.length
    ? {
      items: lensAwareExplanations.whatWouldChange,
      badge: "Lens-aware requirements",
      explanation: "Display wording from resolvedInstitutionalLens; scoring and verdicts are unchanged.",
    }
    : whatWouldChangeDecision;
  const displayPrimaryBlocker = lensAwareExplanations?.primaryBlocker
    ? {
      ...primaryBlocker,
      label: lensAwareExplanations.primaryBlocker,
      explanation: "Lens-aware display wording from resolvedInstitutionalLens. Raw decision-layer blockers remain available in audit context.",
      badge: "Lens-aware requirement",
    }
    : primaryBlocker;
  const displayResearchRequirements = lensAwareExplanations?.sourceQueueRequirements?.length
    ? lensAwareExplanations.sourceQueueRequirements.map((requirement, index) => ({
      id: `lens-aware-${lensAwareExplanations.lensId}-${index}`,
      title: requirement,
      assetClassLens: lensAwareExplanations.lensId,
      reason: "Lens-aware source priority derived from resolvedInstitutionalLens. It does not change scoring.",
      evidenceNeeded: [requirement],
      preferredSourceTypes: ["official_docs", "primary_source", "manual_review"],
      priority: index < 2 ? "high" : "medium",
      verdictImpact: "Could clarify allocation thesis support or blockers if independently verified.",
      currentStatus: "review_required",
      canChangeVerdict: true,
    }))
    : verdictSemantics.researchRequirements;
  const displayVerdictSemantics = lensAwareExplanations ? {
    ...verdictSemantics,
    missingEvidence: displayEvidenceNeeded,
    whatWouldChange: displayWhatWouldChangeDecision.items,
  } : verdictSemantics;
  const lensSecondaryCopy = buildLensAwareSecondaryCopy(resolvedInstitutionalLens, lensAwareExplanations, {
    whyNow: sanitizedWhyNow,
    whyNotNow: sanitizedWhyNotNow,
    summaryMemo,
    primaryStrength,
    primaryWeakness,
    failurePrimary,
    failureTrigger,
    tokenDemandTruth,
    decisionDrivers: dedupedDrivers,
    blockers,
    topPositiveDrivers: cleanUserFacingList(contributors.positives, { limit: 4 }),
    topNegativeDrivers: cleanUserFacingList(contributors.negatives, { limit: 4 }),
    topNeutralDrivers: cleanUserFacingList(contributors.neutralOrMissing, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
  });

  return {
    assetName: asset?.name || asset?.symbol || "Asset",
    overallScore,
    confidenceScore,
    confidenceLabel: confidenceLabelText,
    allocationOutcome,
    verdictSemantics: displayVerdictSemantics,
    verdictClass: displayVerdictSemantics.verdictClass || null,
    allocationCase: verdictSemantics.hasVerdictClass ? {
      forAllocation: verdictSemantics.positiveCase,
      againstAllocation: verdictSemantics.blockedCase,
      missingEvidence: displayEvidenceNeeded,
      whatWouldChange: displayWhatWouldChangeDecision.items,
    } : null,
    institutionalQuestions: institutionalQuestionPayload.institutionalQuestions,
    institutionalQuestionsProvenance: institutionalQuestionPayload.institutionalQuestionsProvenance,
    resolvedInstitutionalLens,
    lensAwareExplanations,
    assetIdentityResolution,
    tokenomicsSupplyIntegrity,
    analysisFreshness,
    calibrationWarnings,
    researchRequirements: displayResearchRequirements,
    verdictReasons: verdictSemantics.verdictReasons,
    primaryStrength: lensSecondaryCopy.primaryStrength || primaryStrength,
    primaryWeakness: lensSecondaryCopy.primaryWeakness || primaryWeakness,
    failureMode: {
      primary: lensSecondaryCopy.failurePrimary || failurePrimary,
      trigger: lensSecondaryCopy.failureTrigger || failureTrigger,
      earlySignals,
    },
    investabilityStatus: investability.status || null,
    currentState: describeCurrentState(extractDecisionLabel(decisionLayer.currentState), assetClassification.assetClass || null),
    posture: describePosture(extractDecisionLabel(decisionLayer.posture), assetClassification.assetClass || null),
    evidenceStrength: evidenceQuality.strength || null,
    evidenceConflicts,
    missingCritical: displayEvidenceNeeded,
    blockers: lensSecondaryCopy.blockers || blockers,
    requiredConditions: displayRequiredConditions,
    decisionDrivers: lensSecondaryCopy.decisionDrivers || dedupedDrivers,
    contradictionNote,
    summaryMemo: lensSecondaryCopy.summaryMemo || summaryMemo,
    structuredThesisSummary: lensSecondaryCopy.structuredThesisSummary || lensSecondaryCopy.summaryMemo || summaryMemo,
    tokenDemandTruth: lensSecondaryCopy.tokenDemandTruth || tokenDemandTruth,
    policySignals,
    warnings: userFacingWarnings,
    auditAlerts,
    evidenceConstraintNote,
    assetClass: assetClassification.assetClass || null,
    assetSubtype: assetClassification.subtype || null,
    assetClassLabel,
    assetFramingLabel,
    primarySector: sectorClassification.primarySector || null,
    secondarySectors: dedupedSecondarySectors,
    assetBadges,
    primaryBlocker: displayPrimaryBlocker,
    weakestLink,
    whatWouldChangeDecision: displayWhatWouldChangeDecision,
    manualReviewStatus,
    whyNow: lensSecondaryCopy.whyNow || sanitizedWhyNow,
    whyNotNow: lensSecondaryCopy.whyNotNow || sanitizedWhyNotNow,
    whatMustBeTrue: lensAwareExplanations?.requiredConditions?.length
      ? displayRequiredConditions
      : cleanUserFacingList(decisionFrame.whatMustBeTrue, {
        limit: 4,
        suppressGenericEpistemic: isBenchmark,
        replacePlaceholders: true,
      }),
    whatCouldBreak: lensSecondaryCopy.whatCouldBreak || cleanUserFacingList(decisionFrame.whatCouldBreak, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
    nextCheckpoints: lensAwareExplanations?.whatWouldChange?.length
      ? displayWhatWouldChangeDecision.items
      : cleanUserFacingList(decisionFrame.nextCheckpoints, {
        limit: 4,
        suppressGenericEpistemic: isBenchmark,
        replacePlaceholders: true,
      }),
    topPositiveDrivers: lensSecondaryCopy.topPositiveDrivers || cleanUserFacingList(contributors.positives, { limit: 4 }),
    topNegativeDrivers: lensSecondaryCopy.topNegativeDrivers || cleanUserFacingList(contributors.negatives, { limit: 4 }),
    topNeutralDrivers: lensSecondaryCopy.topNeutralDrivers || cleanUserFacingList(contributors.neutralOrMissing, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
    keyAlerts: filterUserFacingItems(fundamentals?.risks?.keyAlerts, 4),
  };
}

function bundleValue(value, fallback = "Unavailable in current frontend model") {
  return extractRenderableText(value, fallback) || fallback;
}

function bundleList(items, fallback = "Unavailable in current frontend model", limit = null) {
  const normalized = normalizeRenderableList(items);
  const limited = limit ? normalized.slice(0, limit) : normalized;
  return limited.length ? limited.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
}

function bundleField(label, value) {
  return `${label}: ${bundleValue(value)}`;
}

function bundleSection(title, lines = []) {
  return [
    "",
    `=== ${title} ===`,
    ...lines.filter((line) => line !== null && line !== undefined && line !== ""),
  ].join("\n");
}

function bundleObjectRows(objectValue, fallback = "Unavailable in current frontend model", limit = null) {
  const entries = Object.entries(safeObject(objectValue))
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${extractRenderableText(value, JSON.stringify(value))}`);
  const limited = limit ? entries.slice(0, limit) : entries;
  return limited.length ? limited.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
}

function bundleProviderDiagnostics(providerDiagnostics, limit = 12) {
  const rows = safeArray(providerDiagnostics).slice(0, limit).map((entry, index) => {
    const provider = entry?.provider || entry?.source || entry?.section || `provider_${index + 1}`;
    const status = entry?.status || entry?.coverage || entry?.reason || "diagnostic";
    const reason = entry?.reason || entry?.safeReason || entry?.message || "No reason attached.";
    return `- ${provider}: ${status} | ${reason}`;
  });
  return rows.length ? rows.join("\n") : "- Unavailable in current frontend model";
}

function bundleProviderHealth(providerHealth, limit = 12) {
  const normalized = normalizeProviderHealth(providerHealth);
  const rows = safeArray(normalized?.providersList).slice(0, limit).map((entry) => {
    const provider = entry?.provider || "provider";
    const status = entry?.status || entry?.state || "unknown";
    const reason = entry?.reason || entry?.message || "No reason attached.";
    return `- ${provider}: ${status} | ${reason}`;
  });
  return rows.length ? rows.join("\n") : "- Unavailable in current frontend model";
}

function bundleProviderEvidence(evidence = []) {
  const rows = safeArray(evidence).map((entry) => {
    const provider = entry?.provider || "provider";
    const field = entry?.field || "field";
    const value = entry?.value || "Unavailable";
    const weight = entry?.weight !== undefined ? ` | weight ${entry.weight}` : "";
    return `- ${provider}.${field}: ${value}${weight}`;
  });
  return rows.length ? rows.join("\n") : "- Unavailable in current frontend model";
}

function bundleQuestions(questions = []) {
  const rows = safeArray(questions).map((question, index) => [
    `Question ${index + 1}`,
    `  id: ${bundleValue(question?.questionId)}`,
    `  question: ${bundleValue(question?.questionText)}`,
    `  lens: ${bundleValue(question?.assetClassLens)}`,
    `  answerStatus: ${bundleValue(question?.answerStatus)}`,
    `  verdictImpact: ${bundleValue(question?.verdictImpact)}`,
    `  currentMvpCapability: ${bundleValue(question?.currentMvpCapability)}`,
    `  answerSummary: ${bundleValue(question?.answerSummary)}`,
    `  supportingSignals: ${normalizeRenderableList(question?.supportingSignals).join("; ") || "Unavailable in current frontend model"}`,
    `  missingEvidence: ${normalizeRenderableList(question?.missingEvidence).join("; ") || "Unavailable in current frontend model"}`,
    `  contradictionSignals: ${normalizeRenderableList(question?.contradictionSignals).join("; ") || "Unavailable in current frontend model"}`,
    `  whatWouldChange: ${normalizeRenderableList(question?.whatWouldChange).join("; ") || "Unavailable in current frontend model"}`,
    `  scoringFieldsUsed: ${normalizeRenderableList(question?.scoringFieldsUsed).join("; ") || "Unavailable in current frontend model"}`,
    `  sourceBoundary: ${normalizeRenderableList(question?.sourceBoundary).join("; ") || "Unavailable in current frontend model"}`,
  ].join("\n"));
  return rows.length ? rows.join("\n\n") : "Unavailable in current frontend model";
}

function questionGroupMatchesLens(questions, lens) {
  const safeQuestions = safeArray(questions);
  if (!lens?.questionGroupId || !safeQuestions.length) return "unknown";
  const group = String(lens.questionGroupId || "").toLowerCase();
  const lensId = String(lens.lensId || "").toLowerCase();
  const prefixByGroup = {
    native_benchmark: ["native_"],
    base_layer_settlement: ["base_layer_"],
    stablecoin: ["stablecoin_"],
    wrapped_or_lst: ["wrapped_lst_"],
    defi_l2_oracle_infra: ["protocol_"],
    oracle_infrastructure: ["oracle_"],
    rwa_hybrid: ["rwa_"],
    rwa_hybrid_infrastructure: ["rwa_infra_"],
    depin_compute_storage: ["depin_"],
    payments_settlement_network: ["payments_"],
    gaming_consumer: ["gaming_"],
    meme_narrative: ["meme_"],
    low_coverage_manual_classification: ["low_coverage_"],
  };
  const acceptedPrefixes = prefixByGroup[group] || [];
  const mismatches = safeQuestions.filter((question) => {
    const id = String(question?.questionId || "").toLowerCase();
    const questionLens = String(question?.assetClassLens || "").toLowerCase();
    if (group === "rwa_hybrid" && id.startsWith("rwa_infra_")) return true;
    return !acceptedPrefixes.some((prefix) => id.startsWith(prefix)) &&
      !id.includes(group.replace(/_/g, "")) &&
      !id.includes(group) &&
      questionLens !== lensId &&
      questionLens !== group;
  });
  return mismatches.length ? "unknown" : "yes";
}

function includesGenericPrimaryCopy(text) {
  return /critical tokenomics evidence is missing|utility or vesting support|coverage restraint.*unlock|coverage restraint.*vesting|vesting schedule|next unlock magnitude|resolve the critical pillar|close.*weakest-link gaps|token utility matters for protocol use|confirm token utility or vesting coverage/i.test(String(text || ""));
}

function yesNoUnknown(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "unknown";
}

export function buildReviewBundleText({
  asset,
  analysis,
  data,
  model,
  displayIdentity,
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
  snapshot,
  timelineData,
  compareData,
  aiReport,
  fundamentals,
  security,
} = {}) {
  const safeData = safeObject(data);
  const safeAnalysis = safeObject(analysis || safeData.analysis);
  const safeModel = safeObject(model);
  const safeAsset = safeObject(asset || safeData.asset);
  const safeMeta = safeObject(meta || safeData.meta);
  const safeScores = safeObject(scores || safeData.scores || safeAnalysis.scores);
  const safeConfidence = safeObject(confidence || safeAnalysis.confidence || safeData.confidence);
  const decisionLayer = safeObject(safeAnalysis.decisionLayer);
  const decisionFrame = safeObject(decisionLayer.decisionFrame);
  const thesisCore = safeObject(safeAnalysis.thesisCore);
  const verdictReasons = safeObject(decisionLayer.verdictReasons || safeModel.verdictReasons);
  const allocationCase = safeObject(safeModel.allocationCase || decisionLayer.allocationCase);
  const rawAllocationCase = safeObject(decisionLayer.allocationCase);
  const scoringPolicy = safeObject(safeAnalysis.scoringPolicy);
  const sourceStatusObject = safeObject(sourceStatus || safeData.sourceStatus);
  const providerDiagnosticsList = safeArray(providerDiagnostics || safeMeta.providerDiagnostics);
  const providerNotes = normalizeRenderableList(safeMeta.providerNotes);
  const warnings = normalizeRenderableList(safeData.warnings);
  const lens = safeModel.resolvedInstitutionalLens || normalizeResolvedInstitutionalLensPayload(safeAnalysis);
  const lensAware = safeModel.lensAwareExplanations || normalizeLensAwareExplanationsPayload(safeAnalysis);
  const assetIdentityResolution = safeModel.assetIdentityResolution || normalizeAssetIdentityResolutionPayload(safeData) || normalizeAssetIdentityResolutionPayload(safeAnalysis);
  const tokenomicsSupplyIntegrity = safeModel.tokenomicsSupplyIntegrity || normalizeTokenomicsSupplyIntegrityPayload(safeData) || normalizeTokenomicsSupplyIntegrityPayload(safeAnalysis);
  const questions = safeModel.institutionalQuestions || normalizeInstitutionalQuestionsPayload(safeAnalysis).institutionalQuestions;
  const calibrationWarnings = safeModel.calibrationWarnings || normalizeCalibrationWarningsPayload(safeAnalysis);
  const analysisFreshness = safeModel.analysisFreshness || normalizeAnalysisFreshnessPayload(safeData, snapshot || safeData.snapshot);
  const questionMismatchWarnings = safeArray(calibrationWarnings).filter((warning) => warning?.id === "question_lens_mismatch");
  const providerInternalFlags = safeArray(lens?.ambiguityFlags).filter((flag) => /provider|internal|disagree|conflict|mismatch/i.test(flag));
  const lensAwarePrimaryDisplayActive = resolvedLensIsDisplayAuthoritative(lens) && Boolean(lensAware);
  const filterPrimaryBundleItems = (items) => {
    const normalized = normalizeRenderableList(items);
    return lensAwarePrimaryDisplayActive
      ? normalized.filter((item) => !includesGenericPrimaryCopy(item))
      : normalized;
  };
  const visiblePrimaryText = [
    safeModel.whyNow,
    safeModel.whyNotNow,
    safeModel.summaryMemo,
    safeModel.structuredThesisSummary,
    safeModel.primaryWeakness,
    safeModel.failureMode?.primary,
    safeModel.failureMode?.trigger,
    safeModel.tokenDemandTruth,
    safeModel.primaryBlocker?.label,
    safeModel.weakestLink?.label,
    ...(safeModel.whatWouldChangeDecision?.items || []),
    ...(safeModel.missingCritical || []),
    ...(safeModel.requiredConditions || []),
    ...(safeModel.whatMustBeTrue || []),
    ...(safeModel.whatCouldBreak || []),
    ...(safeModel.nextCheckpoints || []),
    ...(safeModel.decisionDrivers || []),
    ...(safeModel.topPositiveDrivers || []),
    ...(safeModel.topNegativeDrivers || []),
    ...(safeModel.blockers || []),
    ...safeArray(safeModel.researchRequirements).flatMap((requirement) => [
      requirement?.title,
      requirement?.reason,
      ...(requirement?.evidenceNeeded || []),
    ]),
  ].filter(Boolean).join(" ");
  const rawDecisionText = [
    ...(decisionFrame.whatMustBeTrue || []).map((item) => extractRenderableText(item, null)),
    ...(decisionFrame.nextCheckpoints || []).map((item) => extractRenderableText(item, null)),
    ...(decisionLayer.researchRequirements || []).flatMap((requirement) => [
      requirement?.title,
      ...(requirement?.evidenceNeeded || []),
    ]),
  ].filter(Boolean).join(" ");
  const rawGenericVisible = includesGenericPrimaryCopy(visiblePrimaryText);
  const rawGenericAudit = includesGenericPrimaryCopy(rawDecisionText);
  const suggestedResearchDomains = buildLensSpecificResearchDomains(safeModel, displayIdentity);
  const primaryAssetFramingText = [
    displayIdentity?.displayFraming,
    displayIdentity?.displayAssetClass,
    safeModel.assetFramingLabel,
    safeModel.assetClassLabel,
  ].filter(Boolean).join(" ");
  const manualFramingWhileLensResolved = resolvedLensIsDisplayAuthoritative(lens) && /manual classification needed|general low-coverage asset/i.test(primaryAssetFramingText);
  const staleResearchDomains = resolvedLensIsDisplayAuthoritative(lens)
    && suggestedResearchDomains.some((domain) => /manual classification needed|\bAI\b|\bL1\b/i.test(String(domain)))
    && !["BASE_LAYER_SETTLEMENT", "NATIVE_MONETARY_BENCHMARK"].includes(lens?.lensId);
  const genericPrimaryDespiteLens = resolvedLensIsDisplayAuthoritative(lens) && rawGenericVisible;
  const protocolMappingSkipped = lens?.lensId === "DEFI_PROTOCOL_TOKEN" && (
    safeArray(calibrationWarnings).some((warning) => warning?.id === "protocol_mapping_failure_for_major_protocol")
    || /skipped|unavailable|missing|unsupported|unmapped/i.test(String(sourceStatusObject.protocolUsage || sourceStatusObject.protocolEconomics || ""))
  );
  const tokenomicsMissingMaxWithoutRequirement = tokenomicsSupplyIntegrity
    && tokenomicsSupplyIntegrity.maxSupplyStatus === "none_or_unknown"
    && !safeArray(tokenomicsSupplyIntegrity.sourceRequirements).some((item) => /max supply|emission policy/i.test(item));
  const tokenomicsMissingUnlocksWithoutCap = tokenomicsSupplyIntegrity
    && tokenomicsSupplyIntegrity.unlockScheduleStatus === "unknown"
    && ![...safeArray(tokenomicsSupplyIntegrity.confidenceCaps), ...safeArray(tokenomicsSupplyIntegrity.sourceRequirements)].some((item) => /unlock|vesting/i.test(item));
  const tokenomicsMintAdminWithoutWarning = tokenomicsSupplyIntegrity
    && /manual|unknown/i.test(`${tokenomicsSupplyIntegrity.mintAuthorityStatus} ${tokenomicsSupplyIntegrity.adminControlStatus}`)
    && ![...safeArray(tokenomicsSupplyIntegrity.manualReviewTriggers), ...safeArray(tokenomicsSupplyIntegrity.scoreCaps)].some((item) => /mint|admin|authority/i.test(item));
  const tokenomicsContradictionWithoutWarning = tokenomicsSupplyIntegrity
    && safeArray(tokenomicsSupplyIntegrity.sourceContradictions).length
    && !safeArray(tokenomicsSupplyIntegrity.manualReviewTriggers).some((item) => /contradict|inconsistent|provider/i.test(item));
  const tokenomicsHighFdvWithoutDilutionNote = tokenomicsSupplyIntegrity
    && Number(tokenomicsSupplyIntegrity.fdvMarketCapRatio) >= 3
    && ![...safeArray(tokenomicsSupplyIntegrity.softBlockers), ...safeArray(tokenomicsSupplyIntegrity.negativeSignals)].some((item) => /dilution|fdv|float/i.test(item));
  const questionMatchStatus = questionGroupMatchesLens(questions, lens);
  const assetContract = safeAsset.contractAddress || safeAsset.contract || safeAsset.address || safeAsset.tokenAddress;
  const assetChain = safeAsset.chain || safeAsset.network || safeAsset.platform || safeAsset.chainId;
  const providerIds = [
    safeAsset.coingeckoId ? `coingecko: ${safeAsset.coingeckoId}` : null,
    safeAsset.coinmarketcapId ? `coinmarketcap: ${safeAsset.coinmarketcapId}` : null,
    safeAsset.cmcId ? `cmc: ${safeAsset.cmcId}` : null,
  ].filter(Boolean);
  const identityWarnings = safeArray(calibrationWarnings).filter((warning) => /identity|variant|wrapped|bridged/i.test(String(warning?.id || warning?.issue || "")));
  const lastAnalyzed = safeData.lastAnalyzed || safeData.generatedAt || snapshot?.generatedAt || safeData.snapshot?.generatedAt || safeMeta.generatedAt;
  const verdictLabel = safeModel.allocationOutcome?.label || safeModel.verdictSemantics?.label || decisionLayer.finalVerdictLabel || decisionLayer.currentState?.label;
  const verdictClass = safeModel.verdictClass || decisionLayer.verdictClass;
  const boundary = "Research support only. Not financial advice. No price prediction. Provider metadata is not reviewed evidence; source candidates and report-only overlays are not live scoring input.";

  const sections = [
    bundleSection("1. QA Bundle Header", [
      bundleField("Asset symbol", safeAsset.symbol),
      bundleField("Asset name", safeAsset.name || safeModel.assetName),
      bundleField("Canonical identity", safeAsset.id || safeAsset.coingeckoId || safeAsset.cmcId || safeAsset.canonicalId),
      bundleField("Canonical asset", `${assetIdentityResolution?.canonicalAssetName || "Unavailable"} (${assetIdentityResolution?.canonicalAssetSymbol || "Unavailable"})`),
      bundleField("Canonical/native network candidate", assetIdentityResolution?.canonicalNetworkCandidate || assetIdentityResolution?.nativeNetworkCandidate),
      bundleField("Chain / network", assetChain),
      bundleField("Contract", assetContract),
      bundleField("Analyzed network", assetIdentityResolution?.analyzedNetwork),
      bundleField("Analyzed contract", assetIdentityResolution?.analyzedContract),
      bundleField("Representation type", assetIdentityResolution?.representationType),
      bundleField("Wrong-asset risk", assetIdentityResolution?.wrongAssetRisk),
      bundleField("Provider IDs", providerIds.join("; ")),
      bundleField("Identity confidence", lens?.confidence),
      bundleField("Canonical identity confidence", assetIdentityResolution?.identityConfidence),
      "Identity warnings:",
      bundleList([
        ...safeArray(assetIdentityResolution?.identityWarnings),
        ...safeArray(assetIdentityResolution?.chainWarnings),
        ...safeArray(assetIdentityResolution?.contractWarnings),
        ...identityWarnings.map((warning) => `${warning.id || "warning"} | ${warning.issue || "Review identity"} | verdict: ${warning.affectsVerdict ? "affects" : "diagnostic"} | scoring: ${warning.affectsScoring ? "affects" : "diagnostic"}`),
      ]),
      bundleField("Last analyzed timestamp", lastAnalyzed),
      bundleField("Analysis freshness", `${analysisFreshness.freshnessLabel} - ${analysisFreshness.summary}`),
      bundleField("Delivery source", analysisFreshness.analysisSource),
      bundleField("Recomputed", analysisFreshness.recomputed === null || analysisFreshness.recomputed === undefined ? "unknown" : analysisFreshness.recomputed ? "yes" : "no"),
      bundleField("Snapshot ID", analysisFreshness.snapshotId),
      bundleField("Final decision / verdictClass", verdictClass),
      bundleField("Verdict label", verdictLabel),
      bundleField("Overall score", safeModel.overallScore ?? safeScores.overallScore),
      bundleField("Confidence", `${safeModel.confidenceLabel || safeConfidence.level || "Unavailable"}${safeModel.confidenceScore !== null && safeModel.confidenceScore !== undefined ? ` (${safeModel.confidenceScore})` : ""}`),
      bundleField("Asset framing", displayIdentity?.displayFraming || safeModel.assetFramingLabel),
      bundleField("Asset class label", displayIdentity?.displayAssetClass || safeModel.assetClassLabel || safeModel.assetClass),
      bundleField("Sector/lens label", lens?.label || safeModel.primarySector),
      bundleField("Boundary", boundary),
    ]),
    bundleSection("1A. Asset Identity Resolution / Canonical Chain Guardrail", [
      bundleField("Selected asset", `${safeAsset.name || "Unavailable"} (${safeAsset.symbol || "Unavailable"})`),
      bundleField("Canonical provider IDs", [
        assetIdentityResolution?.canonicalProviderIds?.coingeckoId ? `coingecko:${assetIdentityResolution.canonicalProviderIds.coingeckoId}` : null,
        assetIdentityResolution?.canonicalProviderIds?.coinmarketcapId ? `cmc:${assetIdentityResolution.canonicalProviderIds.coinmarketcapId}` : null,
      ].filter(Boolean).join("; ")),
      bundleField("Canonical network candidate", assetIdentityResolution?.canonicalNetworkCandidate),
      bundleField("Native network candidate", assetIdentityResolution?.nativeNetworkCandidate),
      bundleField("Selected network", assetIdentityResolution?.selectedNetwork),
      bundleField("Analyzed representation", `${assetIdentityResolution?.analyzedNetwork || "Unavailable"} ${assetIdentityResolution?.analyzedContract || "no contract"}`),
      bundleField("Contract scan applicability", assetIdentityResolution?.contractScanApplicability),
      bundleField("Migration status", assetIdentityResolution?.migrationStatus),
      bundleField("Wrapped/bridged status", assetIdentityResolution?.bridgedOrWrappedStatus),
      bundleField("Multi-chain", yesNoUnknown(assetIdentityResolution?.isMultichain)),
      bundleField("Chain confidence", assetIdentityResolution?.chainConfidence),
      bundleField("Contract confidence", assetIdentityResolution?.contractConfidence),
      "All known provider contracts:",
      bundleList(safeArray(assetIdentityResolution?.allKnownContracts).map((entry) => `${entry.provider}:${entry.network}:${entry.contractAddress} | ${entry.sourceField} | confidence:${entry.confidence}`)),
      "Old contracts:",
      bundleList(assetIdentityResolution?.oldContracts),
      "New contracts:",
      bundleList(assetIdentityResolution?.newContracts),
      "Identity source requirements:",
      bundleList(assetIdentityResolution?.sourceRequirements),
      "Identity source boundary:",
      bundleList(assetIdentityResolution?.sourceBoundary),
      "Evidence source summary:",
      bundleList(assetIdentityResolution?.evidenceSourceSummary),
    ]),
    bundleSection("2. Resolved Institutional Lens Contract", [
      bundleField("lensId", lens?.lensId),
      bundleField("label", lens?.label),
      bundleField("assetClassGroup", lens?.assetClassGroup),
      bundleField("confidence", lens?.confidence),
      bundleField("questionGroupId", lens?.questionGroupId),
      "matchedSignals:",
      bundleList(lens?.matchedSignals),
      "routingSource:",
      bundleList(lens?.routingSource),
      "providerClassificationEvidence:",
      bundleProviderEvidence(lens?.providerClassificationEvidence),
      "ambiguityFlags:",
      bundleList(lens?.ambiguityFlags),
      bundleField("fallbackReason", lens?.fallbackReason),
      "sourceBoundary:",
      bundleList(lens?.sourceBoundary),
      bundleField("Institutional question IDs/group match resolved lens", questionMatchStatus),
      "question_lens_mismatch warnings:",
      bundleList(questionMismatchWarnings.map((warning) => `${warning.issue || warning.id}: ${warning.recommendedAction || warning.expectedBehavior || "Review required."}`)),
      "Provider/internal disagreement flags:",
      bundleList(providerInternalFlags),
    ]),
    bundleSection("3. Decision Header / Command Header", [
      bundleField("Why allocation could make sense", safeModel.verdictSemantics?.positiveCase?.[0] || safeModel.primaryStrength),
      bundleField("Why allocation is blocked", safeModel.verdictSemantics?.blockedCase?.[0] || safeModel.primaryWeakness),
      bundleField("Final Decision", safeModel.allocationOutcome?.label),
      bundleField("Verdict interpretation", safeModel.verdictSemantics?.summary || safeModel.summaryMemo),
      bundleField("Boundary copy", safeModel.verdictSemantics?.boundary || boundary),
      "CTA/navigation labels carrying decision semantics:",
      bundleList(["View final verdict logic", "Inspect blocker", "Trace evidence", "View requirements"]),
    ]),
    bundleSection("4. Decision Tab / Decision Snapshot", [
      bundleField("Verdict semantics", `${safeModel.verdictSemantics?.label || "Unavailable"} - ${safeModel.verdictSemantics?.summary || "Unavailable"}`),
      "Evidence still needed:",
      bundleList(safeModel.verdictSemantics?.missingEvidence || safeModel.missingCritical),
      bundleField("Primary blocker", safeModel.primaryBlocker?.label),
      bundleField("Primary blocker detail", safeModel.primaryBlocker?.explanation),
      bundleField("Weakest link", safeModel.weakestLink?.label),
      bundleField("Weakest link detail", safeModel.weakestLink?.explanation),
      "What Would Change The Decision:",
      bundleList(safeModel.whatWouldChangeDecision?.items),
      bundleField("Structural quality", safeModel.overallScore),
      bundleField("Evidence support", safeModel.confidenceScore),
      bundleField("Confidence", safeModel.confidenceLabel),
      bundleField("Manual review signal", `${safeModel.manualReviewStatus?.label || "Unavailable"} - ${safeModel.manualReviewStatus?.detail || "Unavailable"}`),
      bundleField("Allocation Decision", safeModel.allocationOutcome?.label),
      bundleField("Current state", safeModel.currentState),
      bundleField("Why Now", safeModel.whyNow || decisionFrame.whyNow),
      bundleField("Why Not Now", safeModel.whyNotNow || decisionFrame.whyNotNow),
      bundleField("Decision Memo", safeModel.summaryMemo),
      bundleField("Primary Weakness", safeModel.primaryWeakness),
      bundleField("Failure Mode", safeModel.failureMode?.primary),
      bundleField("Structured Thesis Summary", safeModel.structuredThesisSummary || safeModel.summaryMemo),
      "Missing critical evidence:",
      bundleList(safeModel.missingCritical),
      "Required conditions:",
      bundleList(safeModel.requiredConditions),
      "Constraint Summary / blockers:",
      bundleList(safeModel.blockers),
      "Top decision drivers:",
      bundleList(safeModel.decisionDrivers),
      "Lens-aware display text:",
      bundleList([
        lensAware?.primaryBlocker,
        ...(lensAware?.evidenceNeeded || []),
        ...(lensAware?.whatWouldChange || []),
        ...(lensAware?.requiredConditions || []),
      ]),
      "Raw/fallback audit text still present in backend fields:",
      bundleList([
        ...(decisionFrame.whatMustBeTrue || []),
        ...(decisionFrame.nextCheckpoints || []),
        ...safeArray(decisionLayer.researchRequirements).map((requirement) => requirement?.title),
      ]),
      bundleField("Raw generic copy still visible in primary areas", yesNoUnknown(rawGenericVisible)),
      bundleField("Raw generic copy present in audit/backend fields", yesNoUnknown(rawGenericAudit)),
    ]),
    bundleSection("5. Thesis Falsification Tab", [
      bundleField("Allocation thesis", safeModel.summaryMemo),
      bundleField("Asset framing", displayIdentity?.displayFraming || safeModel.assetFramingLabel),
      bundleField("Why allocation could make sense", allocationCase.forAllocation?.[0] || safeModel.primaryStrength),
      bundleField("Why allocation is blocked", allocationCase.againstAllocation?.[0] || safeModel.primaryWeakness),
      "Evidence still needed:",
      bundleList(allocationCase.missingEvidence || safeModel.missingCritical),
      "What would change the decision:",
      bundleList(allocationCase.whatWouldChange || safeModel.whatWouldChangeDecision?.items),
      "Review-only cautions:",
      bundleList(filterPrimaryBundleItems(verdictReasons.reviewOnlyCautions)),
      "What Must Be True:",
      bundleList(safeModel.whatMustBeTrue),
      "What Could Break The Thesis:",
      bundleList(safeModel.whatCouldBreak),
      "Live Context Supporting The Thesis:",
      bundleList(verdictReasons.positiveThesisEvidence || safeModel.topPositiveDrivers),
      "Evidence Missing / Provider Gaps:",
      bundleList(filterPrimaryBundleItems(verdictReasons.evidenceGaps || safeModel.missingCritical)),
      bundleField("Weakest Link", safeModel.weakestLink?.label),
      bundleField("False-Positive Risk / Refusal to infer", safeModel.tokenDemandTruth),
      "Manual-review triggers:",
      bundleList(filterPrimaryBundleItems([safeModel.manualReviewStatus?.detail, ...safeModel.auditAlerts])),
      bundleField("Token Demand Truth", safeModel.tokenDemandTruth),
      bundleField("Failure Modes", safeModel.failureMode?.primary),
      "Conviction Drivers:",
      bundleList(filterPrimaryBundleItems(safeModel.decisionDrivers)),
      "Blockers:",
      bundleList(filterPrimaryBundleItems(safeModel.blockers)),
      "Raw allocation-case fallback text:",
      bundleList([
        ...(rawAllocationCase.missingEvidence || []),
        ...(rawAllocationCase.whatWouldChange || []),
        ...(rawAllocationCase.againstAllocation || []),
      ]),
    ]),
    bundleSection("6. Institutional Checklist", [
      bundleField("Current asset lens text", lens?.label || displayIdentity?.displayFraming),
      bundleField("Resolver reason", lens?.fallbackReason || safeArray(lens?.routingSource).join("; ")),
      "Provider-grounded lens panel:",
      bundleList([
        `lensId: ${bundleValue(lens?.lensId)}`,
        `questionGroupId: ${bundleValue(lens?.questionGroupId)}`,
        `confidence: ${bundleValue(lens?.confidence)}`,
        `matchedSignals: ${safeArray(lens?.matchedSignals).join("; ") || "Unavailable"}`,
        `ambiguityFlags: ${safeArray(lens?.ambiguityFlags).join("; ") || "Unavailable"}`,
      ]),
      "Registry / source boundary text:",
      bundleList(lens?.sourceBoundary || lensAware?.boundaryNotes),
      "Institutional questions:",
      bundleQuestions(questions),
    ]),
    bundleSection("6A. Tokenomics Dilution & Supply Integrity", [
      bundleField("Tokenomics integrity score", tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === null || tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === undefined ? null : `${tokenomicsSupplyIntegrity.tokenomicsIntegrityScore}/100`),
      bundleField("Explanation summary", tokenomicsSupplyIntegrity?.explanationSummary),
      bundleField("Evidence confidence", tokenomicsSupplyIntegrity?.evidenceConfidence),
      bundleField("Supply summary", tokenomicsSupplyIntegrity?.supplySummary?.summary),
      bundleField("Max supply status", tokenomicsSupplyIntegrity?.maxSupplyStatus),
      bundleField("Max supply value", tokenomicsSupplyIntegrity?.maxSupplyValue),
      bundleField("Max supply method", tokenomicsSupplyIntegrity?.maxSupplyMethod),
      bundleField("Circulating / total / max", `${bundleValue(tokenomicsSupplyIntegrity?.circulatingSupply)} / ${bundleValue(tokenomicsSupplyIntegrity?.totalSupply)} / ${bundleValue(tokenomicsSupplyIntegrity?.maxSupplyValue)}`),
      bundleField("Market cap / FDV", `${bundleValue(tokenomicsSupplyIntegrity?.marketCap)} / ${bundleValue(tokenomicsSupplyIntegrity?.fdv)}`),
      bundleField("FDV / market cap ratio", tokenomicsSupplyIntegrity?.fdvMarketCapRatio),
      bundleField("Circulating percent of max", tokenomicsSupplyIntegrity?.circulatingPercentOfMax),
      bundleField("Remaining dilution percent", tokenomicsSupplyIntegrity?.remainingDilutionPercent),
      bundleField("Unlock schedule status", tokenomicsSupplyIntegrity?.unlockScheduleStatus),
      bundleField("Next unlock", `${bundleValue(tokenomicsSupplyIntegrity?.nextUnlockDate)} | percent: ${bundleValue(tokenomicsSupplyIntegrity?.nextUnlockPercent)} | USD: ${bundleValue(tokenomicsSupplyIntegrity?.nextUnlockUsdValue)}`),
      bundleField("Unlock / volume ratio", tokenomicsSupplyIntegrity?.unlockToVolumeRatio),
      bundleField("Unlock / liquidity ratio", tokenomicsSupplyIntegrity?.unlockToLiquidityRatio),
      bundleField("Unlock / market cap ratio", tokenomicsSupplyIntegrity?.unlockToMarketCap),
      bundleField("Emission policy status", tokenomicsSupplyIntegrity?.emissionPolicyStatus),
      bundleField("Mint authority status", tokenomicsSupplyIntegrity?.mintAuthorityStatus),
      bundleField("Admin control status", tokenomicsSupplyIntegrity?.adminControlStatus),
      bundleField("Governance supply-change risk", tokenomicsSupplyIntegrity?.governanceSupplyChangeRisk),
      bundleField("Cap mutability status", tokenomicsSupplyIntegrity?.capMutabilityStatus),
      bundleField("Burn mechanism status", tokenomicsSupplyIntegrity?.burnMechanismStatus),
      bundleField("Burn materiality", tokenomicsSupplyIntegrity?.burnMateriality),
      bundleField("Buyback/burn status", tokenomicsSupplyIntegrity?.buybackBurnStatus),
      bundleField("Tokenholder value capture status", tokenomicsSupplyIntegrity?.tokenholderValueCaptureStatus),
      bundleField("Token necessity status", tokenomicsSupplyIntegrity?.tokenNecessityStatus),
      bundleField("Staking reward source", tokenomicsSupplyIntegrity?.stakingRewardSource),
      "Source contradictions:",
      bundleList(tokenomicsSupplyIntegrity?.sourceContradictions),
      "Provider disagreements:",
      bundleList(tokenomicsSupplyIntegrity?.providerDisagreements),
      "Source requirements:",
      bundleList(tokenomicsSupplyIntegrity?.sourceRequirements),
      "Manual review triggers:",
      bundleList(tokenomicsSupplyIntegrity?.manualReviewTriggers),
      "Hard blockers:",
      bundleList(tokenomicsSupplyIntegrity?.hardBlockers),
      "Soft blockers:",
      bundleList(tokenomicsSupplyIntegrity?.softBlockers),
      "Score caps:",
      bundleList(tokenomicsSupplyIntegrity?.scoreCaps),
      "Confidence caps:",
      bundleList(tokenomicsSupplyIntegrity?.confidenceCaps),
      "Positive signals:",
      bundleList(tokenomicsSupplyIntegrity?.positiveSignals),
      "Negative signals:",
      bundleList(tokenomicsSupplyIntegrity?.negativeSignals),
      "Neutral/contextual signals:",
      bundleList(tokenomicsSupplyIntegrity?.neutralContextualSignals),
      "Tokenomics institutional questions:",
      bundleQuestions(tokenomicsSupplyIntegrity?.institutionalQuestions),
      "What would change:",
      bundleList(tokenomicsSupplyIntegrity?.whatWouldChange),
      "Source boundary:",
      bundleList(tokenomicsSupplyIntegrity?.sourceBoundary),
      "Raw audit fields:",
      bundleObjectRows(tokenomicsSupplyIntegrity?.auditRawFields),
    ]),
    bundleSection("7. Evidence Map / Source Trace", [
      "Live provider evidence rows / source statuses:",
      bundleObjectRows(sourceStatusObject),
      "Provider diagnostics summary:",
      bundleProviderDiagnostics(providerDiagnosticsList),
      "Provider notes:",
      bundleList(providerNotes),
      "Evidence coverage signals:",
      bundleList(safeArray(evidenceStatusProxy?.items).map((item) => `${item.label}: ${item.statusLabel || item.status || item.sourceLabel || "context"}`)),
      "Unavailable in live response:",
      bundleList(evidenceStatusProxy?.unavailable),
      "Official links / source trace:",
      bundleObjectRows(officialLinks || safeData.officialLinks),
      "Docs / whitepaper summary:",
      bundleObjectRows(whitepaperDocs || safeData.whitepaperDocs),
      "Provider diagnostics notes:",
      bundleProviderDiagnostics(notableDiagnostics || providerDiagnosticsList),
      bundleField("Boundary notices", "Provider metadata/live provider signal/source candidate/reviewed evidence/report-only overlay/scoring-active evidence must remain distinct."),
      bundleField("Freshness/source boundary", `${analysisFreshness.freshnessLabel}. Missing or stale provider sections are not negative evidence; they require verification before strong conclusions.`),
    ]),
    bundleSection("8. Scoring Transparency", [
      bundleField("Overall score", safeModel.overallScore ?? safeScores.overallScore),
      bundleField("Structural quality", safeModel.overallScore),
      bundleField("Evidence support/confidence proxy", `${safeModel.confidenceScore ?? safeConfidence.score ?? "Unavailable"} / ${safeModel.confidenceLabel || safeConfidence.level || "Unavailable"}`),
      "Scores:",
      bundleObjectRows(safeScores),
      "tokenDemandQuality:",
      bundleObjectRows(safeAnalysis.tokenDemandQuality),
      "evidenceDirectness:",
      bundleObjectRows(safeAnalysis.evidenceDirectness),
      "Policy signals:",
      bundleList(safeModel.policySignals || safeAnalysis.policySignals),
      "Scoring policy / caps / gates / blockers:",
      bundleObjectRows(scoringPolicy),
      "Decision layer:",
      bundleObjectRows({
        verdictClass,
        currentState: safeModel.currentState,
        posture: safeModel.posture,
      }),
      "Unavailable modules / neutral missing:",
      bundleList(safeModel.topNeutralDrivers),
      "What engine refused to infer:",
      bundleList([safeModel.tokenDemandTruth, ...(verdictReasons.notApplicableItems || [])]),
      "Score drivers - positives:",
      bundleList(safeModel.topPositiveDrivers),
      "Score drivers - negatives:",
      bundleList(safeModel.topNegativeDrivers),
      "Caveats / warnings:",
      bundleList([...safeModel.auditAlerts, ...warnings]),
    ]),
    bundleSection("9. Source Queue", [
      bundleField("Source lifecycle explainer", "Candidate -> Manual intake -> ManualSourceEvidenceItem -> Mapping -> Report-only overlay. Candidate/report-only layers are not live scoring input."),
      "Research requirements:",
      bundleList(safeArray(safeModel.researchRequirements).map((requirement) => `${requirement?.title || "Requirement"} | ${requirement?.reason || "No reason"} | impact: ${requirement?.verdictImpact || "Unavailable"}`)),
      "Lens-aware source priorities:",
      bundleList(lensAware?.sourceQueueRequirements),
      "Evidence needed:",
      bundleList(safeArray(safeModel.researchRequirements).flatMap((requirement) => requirement?.evidenceNeeded || [])),
      "Preferred source types:",
      bundleList(safeArray(safeModel.researchRequirements).flatMap((requirement) => requirement?.preferredSourceTypes || [])),
      "Live response gaps that need sources:",
      bundleList([
        ...safeModel.requiredConditions,
        ...safeModel.missingCritical,
        ...(safeModel.whatWouldChangeDecision?.items || []),
      ]),
      "Suggested research domains:",
      bundleList(suggestedResearchDomains),
      bundleField("Source boundary", "Research requirements are not evidence. Report-only evidence does not affect live scoring."),
    ]),
    bundleSection("10. Manual Review", [
      bundleField("Manual review status", safeModel.manualReviewStatus?.label),
      bundleField("Reason", safeModel.manualReviewStatus?.detail),
      "Live review signals:",
      bundleList([
        ...safeModel.missingCritical,
        ...safeModel.requiredConditions,
        ...safeModel.auditAlerts,
      ]),
      "Provider gaps:",
      bundleProviderDiagnostics(notableDiagnostics || providerDiagnosticsList),
      "Analysis freshness review signals:",
      bundleList(analysisFreshness.freshnessWarnings),
      "Calibration warnings:",
      bundleList(safeArray(calibrationWarnings).map((warning) => `${warning.id || "warning"} | ${warning.severity || "severity unavailable"} | verdict: ${warning.affectsVerdict ? "affects" : "diagnostic"} | scoring: ${warning.affectsScoring ? "affects" : "diagnostic"} | boundary: ${warning.sourceBoundary || "Unavailable"} | ${warning.issue || warning.observedBehavior || "Review required"} | ${warning.recommendedAction || "Manual review required"}`)),
      "Verification checklist:",
      bundleList([
        "Confirm source authenticity, freshness, scope, and contradictions.",
        "Do not treat provider metadata as reviewed evidence.",
        "Do not promote source candidates or report-only overlays into live scoring.",
        ...safeModel.requiredConditions,
      ]),
      "Review outcome legend:",
      bundleList(["requires_review", "accepted_for_report", "stale", "rejected", "duplicate", "low_relevance", "contradiction_review"]),
      bundleField("Failure mode matrix", safeModel.failureMode?.primary),
      "Backend risk engine summary / security checks:",
      bundleObjectRows(security || safeData.security),
      "Key alerts:",
      bundleList(safeModel.keyAlerts),
      "Green flags:",
      bundleList(safeModel.topPositiveDrivers),
      "Red flags:",
      bundleList([...safeModel.topNegativeDrivers, ...safeModel.auditAlerts]),
    ]),
    bundleSection("11. Audit / Raw Key Fields", [
      "Provider diagnostics summary:",
      bundleProviderDiagnostics(providerDiagnosticsList),
      "Provider health:",
      bundleProviderHealth(providerHealth),
      "Snapshot/drift summary:",
      bundleObjectRows(snapshot || safeData.snapshot),
      "Analysis Freshness / Snapshot Details:",
      bundleList([
        `status: ${analysisFreshness.freshnessStatus}`,
        `label: ${analysisFreshness.freshnessLabel}`,
        `source: ${analysisFreshness.analysisSource || "unknown"}`,
        `generatedAt: ${analysisFreshness.generatedAt || "unavailable"}`,
        `readAt: ${analysisFreshness.readAt || "unavailable"}`,
        `snapshotId: ${analysisFreshness.snapshotId || "unavailable"}`,
        `previousSnapshotId: ${analysisFreshness.previousSnapshotId || "unavailable"}`,
        `previousSnapshotAt: ${analysisFreshness.previousSnapshotAt || "unavailable"}`,
        `recomputed: ${analysisFreshness.recomputed === null || analysisFreshness.recomputed === undefined ? "unknown" : analysisFreshness.recomputed ? "yes" : "no"}`,
        `refreshMode: ${analysisFreshness.refreshMode || "unavailable"}`,
        `fullRegenerationNeeded: ${analysisFreshness.fullRegenerationNeeded === null || analysisFreshness.fullRegenerationNeeded === undefined ? "unknown" : String(analysisFreshness.fullRegenerationNeeded)}`,
        `partialRefreshSufficient: ${analysisFreshness.partialRefreshSufficient === null || analysisFreshness.partialRefreshSufficient === undefined ? "unknown" : String(analysisFreshness.partialRefreshSufficient)}`,
        `freshSections: ${safeArray(analysisFreshness.freshSections).join(", ") || "unavailable"}`,
        `staleSections: ${safeArray(analysisFreshness.staleSections).join(", ") || "unavailable"}`,
        `missingSections: ${safeArray(analysisFreshness.missingSections).join(", ") || "unavailable"}`,
      ]),
      "Latest stored snapshot:",
      bundleField("latest snapshot id", safeArray(timelineData)[0]?.snapshotId),
      "Historical snapshot deltas if visible:",
      bundleObjectRows(compareData?.compactImpact || compareData?.delta || compareData),
      "Thesis drift:",
      bundleObjectRows(compareData?.thesisDrift || compareData?.thesis),
      "Raw field availability summary:",
      bundleList([
        `analysis: ${Object.keys(safeAnalysis).length ? "present" : "missing"}`,
        `decisionLayer: ${Object.keys(decisionLayer).length ? "present" : "missing"}`,
        `thesisCore: ${Object.keys(thesisCore).length ? "present" : "missing"}`,
        `resolvedInstitutionalLens: ${lens ? "present" : "missing"}`,
        `assetIdentityResolution: ${assetIdentityResolution ? "present" : "missing"}`,
        `lensAwareExplanations: ${lensAware ? "present" : "missing"}`,
        `tokenomicsSupplyIntegrity: ${tokenomicsSupplyIntegrity ? "present" : "missing"}`,
        `institutionalQuestions: ${safeArray(questions).length}`,
        `calibrationWarnings: ${safeArray(calibrationWarnings).length}`,
      ]),
      "Failed/skipped provider list with reasons:",
      bundleProviderDiagnostics(providerDiagnosticsList.filter((entry) => entry?.status !== "success" || ["failed", "skipped", "unavailable", "partial"].includes(entry?.coverage || ""))),
      bundleField("Anthropic fallback status if visible", aiReport?.providerStatus || aiReport?.fallbackReason || safeMeta.aiFallbackStatus),
      "Warnings/errors:",
      bundleList(warnings),
      "Raw fields that may confuse user-facing copy:",
      bundleList([
        rawGenericAudit ? "Generic protocol/unlock/vesting wording exists in raw backend/audit fields." : "No obvious generic raw copy detected by frontend heuristic.",
      ]),
    ]),
    bundleSection("12. Cross-Tab Consistency Checklist", [
      bundleField("Resolved lens matches Decision Header lens", lens && displayIdentity ? yesNoUnknown(String(displayIdentity.displayFraming || displayIdentity.displayAssetClass || "").toLowerCase().includes(String(lens.label || lens.lensId || "").split("/")[0].trim().toLowerCase())) : "unknown"),
      bundleField("Institutional question group matches resolved lens", questionMatchStatus),
      bundleField("Decision wording is lens-specific", yesNoUnknown(Boolean(lensAware))),
      bundleField("Thesis Falsification wording is lens-specific", yesNoUnknown(Boolean(lensAware))),
      bundleField("Source Queue requirements are lens-specific", yesNoUnknown(Boolean(lensAware?.sourceQueueRequirements?.length))),
      bundleField("Manual Review requirements are lens-specific", yesNoUnknown(Boolean(lensAware))),
      bundleField("Evidence Map preserves metadata/evidence boundary", "unknown"),
      bundleField("Scoring Transparency avoids unsupported inference", "unknown"),
      bundleField("Provider metadata is not presented as reviewed evidence", safeArray(lens?.sourceBoundary).length ? "yes" : "unknown"),
      bundleField("Raw generic copy still visible in primary areas", yesNoUnknown(rawGenericVisible)),
      bundleField("High-confidence lens but manual/low-coverage primary framing", yesNoUnknown(manualFramingWhileLensResolved)),
      bundleField("Suggested research domains contain stale fallback labels", yesNoUnknown(staleResearchDomains)),
      bundleField("Primary copy uses generic fallback despite lens-aware copy", yesNoUnknown(genericPrimaryDespiteLens)),
      bundleField("Protocol economics mapping skipped for major protocol token", yesNoUnknown(protocolMappingSkipped)),
      bundleField("Tokenomics max supply missing without source requirement", yesNoUnknown(tokenomicsMissingMaxWithoutRequirement)),
      bundleField("Tokenomics unlocks missing without cap/source requirement", yesNoUnknown(tokenomicsMissingUnlocksWithoutCap)),
      bundleField("Mint/admin controls unresolved without warning", yesNoUnknown(tokenomicsMintAdminWithoutWarning)),
      bundleField("Provider supply contradiction without warning", yesNoUnknown(tokenomicsContradictionWithoutWarning)),
      bundleField("High FDV/market-cap without dilution note", yesNoUnknown(tokenomicsHighFdvWithoutDilutionNote)),
      bundleField("Native asset wrongly penalized for no contract", "unknown"),
      bundleField("Wrapped/stable/LST/RWA missing redemption/reserve source requirements", tokenomicsSupplyIntegrity ? yesNoUnknown(
        ["WRAPPED_ASSET", "STABLECOIN_SETTLEMENT", "LST_STAKING_DERIVATIVE", "RWA_HYBRID_ASSET"].includes(lens?.lensId)
        && !safeArray(tokenomicsSupplyIntegrity.sourceRequirements).some((item) => /reserve|redemption|mint|burn|custodian|legal|collateral|withdrawal/i.test(item)),
      ) : "unknown"),
      bundleField("Calibration warnings visible if present", safeArray(calibrationWarnings).length ? "yes" : "unknown"),
      bundleField("Analysis freshness visible in live tabs", analysisFreshness.freshnessStatus !== "unknown" || analysisFreshness.freshnessWarnings.length ? "yes" : "unknown"),
      bundleField("Frontend appears to render backend fields", lens && questions?.length ? "yes" : "unknown"),
      bundleField("Any obvious institutional-quality wording issues", rawGenericVisible ? "yes" : "unknown"),
    ]),
    bundleSection("13. Institutional QA Notes", [
      bundleField("Potentially embarrassing wording", rawGenericVisible ? "Generic protocol/tokenomics wording appears in primary display fields." : "No obvious generic primary-display wording detected by frontend heuristic."),
      bundleField("Generic copy still visible", rawGenericVisible ? "yes" : rawGenericAudit ? "raw/audit only" : "unknown"),
      bundleField("High-confidence lens framing issue", manualFramingWhileLensResolved ? "Resolved lens is high confidence but primary framing still looks manual/low-coverage." : "No high-confidence lens/manual-framing conflict detected."),
      bundleField("Stale research-domain issue", staleResearchDomains ? "Suggested research domains still include stale Manual Classification/AI/L1 fallback language." : "No stale research-domain fallback detected."),
      bundleField("Protocol economics mapping issue", protocolMappingSkipped ? "Major DeFi protocol mapping appears skipped/unavailable; treat as evidence-blocked, not confirmed absence." : "No major-protocol mapping issue detected by frontend heuristic."),
      bundleField("Lens mismatch risk", questionMismatchWarnings.length ? "question_lens_mismatch warning present" : questionMatchStatus === "yes" ? "low from current frontend model" : "unknown"),
      bundleField("Evidence-overclaim risk", safeArray(lens?.sourceBoundary).length ? "source boundary visible; still verify browser copy" : "unknown"),
      bundleField("Provider gap risk", notableDiagnostics?.length ? `${notableDiagnostics.length} notable provider diagnostics` : "unknown"),
      bundleField("UI clarity risk", "Review in browser; bundle is a QA aid and does not replace visual inspection."),
      bundleField("Recommended follow-up", "Run live cross-tab QA for LINK, ONDO, RENDER, USDC, WBTC, stETH, PEPE, RIO/NAKA, ETH/DAG controls."),
    ]),
  ];

  return [
    "ThesisCore Cross-Tab QA Review Bundle",
    `Generated: ${new Date().toISOString()}`,
    "Purpose: paste this bundle into review to detect lens routing, wording, evidence-boundary, scoring/explanation, and frontend visibility issues.",
    ...sections,
  ].join("\n");
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
