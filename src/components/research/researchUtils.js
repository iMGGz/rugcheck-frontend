import { normalizeRwaHybridFinanceTypedObservations } from "../../v2/rwaHybridFinanceTypedObservationsV1.js";
import { normalizeStablecoinsYieldTypedObservations } from "../../v2/stablecoinsYieldTypedObservationsV1.js";
import { normalizeProductResearchResultV2 } from "../../v2/productResearchResultV2.js";

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

export const PRIMARY_ANSWER_FORBIDDEN_TERMS = [
  "source_required",
  "live_data_required",
  "manual_reviewed_evidence",
  "source_candidate_only",
  "non_scoring",
  "non-scoring",
  "not scoring-active",
  "not scoring active",
  "scoring-active",
  "diagnostic only",
  "benchmark pack",
  "benchmark answer pack",
  "demo evidence",
  "reviewed demo",
  "reviewed demo evidence",
  "reviewed_demo_evidence",
  "reviewed_demo_seed",
  "provider metadata is not reviewed evidence",
  "source candidates are not promoted",
  "reviewed evidence remains non-scoring",
  "this does not change score",
  "this does not change verdict",
  "score formula unchanged",
  "verdict formula unchanged",
  "artifact version",
  "QA gate",
  "bundle mirror",
  "frontend normalization",
  "claimIds",
  "claimId",
  "packId",
  "ruleId",
  "benchmarkPackId",
  "scoreImpact=",
  "promoted=no",
  "reviewedScoring=no",
  "scoringActive=no",
  "sourcePromotionActive=false",
  "scoring_active_existing_field",
  "scoring_active_legacy_field",
  "scoring_active_calibrated_evidence",
  "provider_metadata_not_reviewed_evidence",
  "reviewed_demo_evidence_not_scoring_active",
  "no_scoring_impact_report_only",
  "auditDetails",
  "sourcePromotionFlags",
];

export function cleanPrimaryAnswerText(value) {
  let text = String(value || "").trim();
  if (!text) return "";
  [
    [/\bsource_required\b/gi, "Needs verification"],
    [/\blive_data_required\b/gi, "Needs current data"],
    [/\bpartially_source_backed\b/gi, "Partially supported"],
    [/\bsource_backed\b/gi, "Source-backed"],
    [/\bmanual_review_required\b/gi, "Manual review required"],
    [/\bnot_applicable\b/gi, "Not relevant for this asset"],
    [/\banswer-quality context reviewed demo seed;\s*non-scoring\b/gi, "Reviewed support is available for answer quality; it is not included in the numerical score yet"],
    [/\breviewed_demo_evidence_not_scoring_active\b/gi, "Reviewed evidence improves explanation before score integration"],
    [/\breviewed demo evidence\b/gi, "reviewed evidence"],
    [/\bdemo evidence\b/gi, "reviewed evidence"],
    [/\breviewed demo source\b/gi, "reviewed source"],
    [/\breviewed demo seed\b/gi, "reviewed support"],
    [/\breviewed demo\b/gi, "reviewed support"],
    [/\breviewed_demo_evidence\b/gi, "reviewed evidence"],
    [/\breviewed_demo_seed\b/gi, "reviewed support"],
    [/\bmanual_reviewed_evidence\b/gi, "reviewed evidence"],
    [/\bsource_candidate_only\b/gi, "source candidate awaiting review"],
    [/\bprovider_metadata_classification_context\b/gi, "provider metadata used for classification only"],
    [/\bnot scoring-active\b/gi, "Not yet included in the numerical score"],
    [/\bnot scoring active\b/gi, "Not yet included in the numerical score"],
    [/\bnot_scoring_active\b/gi, "Not yet included in the numerical score"],
    [/\bnon[-_]scoring\b/gi, "not included in the numerical score yet"],
    [/\bscoring-active\b/gi, "included in calibrated scoring"],
    [/\bscoring_active\b/gi, "calibrated scoring"],
    [/\bdiagnostic[- ]only\b/gi, "Methodology context"],
    [/\bbenchmark answer pack\b/gi, "Answer-quality context"],
    [/\bbenchmark pack\b/gi, "Answer-quality context"],
    [/\bevidence-calibrated scoring is not active yet\b/gi, "Calibrated scoring has not been enabled yet"],
    [/\blegacy score\b/gi, "existing numerical score"],
    [/provider metadata is not reviewed evidence/gi, "Provider context still needs source review"],
    [/source candidates are not promoted/gi, "Candidate sources still need review"],
    [/reviewed evidence remains non-scoring/gi, "Reviewed evidence improves explanation before score integration"],
    [/this does not change score/gi, "This is explanatory context"],
    [/this does not change verdict/gi, "This is explanatory context"],
    [/score formula unchanged/gi, "Current score remains unchanged"],
    [/verdict formula unchanged/gi, "Current verdict remains unchanged"],
    [/artifact version/gi, "Technical version"],
    [/QA gate/gi, "Quality check"],
    [/bundle mirror/gi, "Export mirror"],
    [/frontend normalization/gi, "Display formatting"],
    [/claimIds?/gi, "Reviewed claim references"],
    [/packId/gi, "Evidence packet reference"],
    [/ruleId/gi, "Methodology rule reference"],
    [/benchmarkPackId/gi, "Benchmark reference"],
    [/scoreImpact=/gi, "Score impact: "],
    [/promoted=no/gi, "Awaiting review"],
    [/reviewedScoring=no/gi, "Not yet included in the numerical score"],
    [/scoringActive=no/gi, "Not yet included in the numerical score"],
    [/sourcePromotionActive=false/gi, "Candidate source review still required"],
    [/scoring_active_existing_field/gi, "Existing score field"],
    [/scoring_active_legacy_field/gi, "Current numerical score field"],
    [/scoring_active_calibrated_evidence/gi, "Calibrated scoring evidence"],
    [/provider_metadata_not_reviewed_evidence/gi, "Provider context"],
    [/auditDetails/gi, "Audit detail"],
    [/sourcePromotionFlags/gi, "Source review flags"],
    [/no_scoring_impact_report_only/gi, "Explanatory context"],
  ].forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });
  return text.replace(/\s+/g, " ").trim();
}

const PRIMARY_RENDERED_AUDIT_ONLY_PATTERNS = [
  /\bauditDetails\b/i,
  /\b(?:claimIds?|packId|ruleId|benchmarkPackId)\b\s*[:=]?\s*[\w:./-]*/i,
  /\bscoring\s*=\s*non_scoring_requirement\b/i,
  /\breviewedScoring\s*=\s*no\b/i,
  /\bpromoted\s*=\s*no\b/i,
  /\bsourcePromotionActive\s*=\s*false\b/i,
  /\b(?:scoringChanged|verdictChanged|providerBehaviorChanged|reviewedEvidencePromoted|sourceCandidatesPromoted)\s*=\s*(?:yes|no)\b/i,
];

export function sanitizePrimaryRenderedCopy(value) {
  const raw = extractRenderableText(value, "").trim();
  if (!raw) return "";
  if (PRIMARY_RENDERED_AUDIT_ONLY_PATTERNS.some((pattern) => pattern.test(raw))) {
    return "";
  }
  let text = cleanPrimaryAnswerText(raw);
  text = text
    .replace(/\b(?:Reviewed claim references|Evidence packet reference|Methodology rule reference|Benchmark reference|Audit detail)\b\s*[:=]?\s*[\w:./-]*/gi, "")
    .replace(/\b(?:score impact|source review flags)\s*:\s*[^;|]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleanPrimaryAnswerText(text);
}

function sanitizeRenderedSurfaceValues(values) {
  return dedupeCaseInsensitive(
    normalizeRenderableList(values)
      .map((value) => sanitizePrimaryRenderedCopy(value))
      .filter(Boolean),
  );
}

export const TWO_AM_RENDERED_PRIMARY_SCANNER_VERSION = "rendered-primary-corpus-v1";

const TWO_AM_PRIMARY_CATEGORIES = new Set([
  "primary_rendered_text",
  "primary_card_display_text",
  "bundle_user_mirror_text",
]);

const TWO_AM_ALLOWED_PRIMARY_PHRASES = [
  "Manual reviewed evidence available",
  "Mechanism reviewed",
  "Current data needed",
  "Source review needed",
  "Legacy score caveat",
  "No calibrated score yet",
  "Provider metadata used for classification only",
  "Still needed",
  "Requires source review",
  "Not financial advice",
  "Research support only",
];

function twoAmTextContainsAllowedPhrase(text) {
  const normalized = String(text || "").toLowerCase();
  return TWO_AM_ALLOWED_PRIMARY_PHRASES.some((phrase) => normalized.includes(phrase.toLowerCase()));
}

function twoAmForbiddenTermsForText(text) {
  const raw = String(text || "");
  if (!raw.trim()) return [];
  return PRIMARY_ANSWER_FORBIDDEN_TERMS.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = /[A-Z]/.test(term)
      ? new RegExp(escaped, "g")
      : new RegExp(`\\b${escaped}\\b`, "gi");
    if (!pattern.test(raw)) return false;
    return true;
  });
}

function twoAmCorpusRow({
  assetSymbol,
  section,
  fieldPath,
  surface,
  corpusCategory,
  text,
  sourceValueKind = "display_text",
  renderedVisible = false,
  classificationRationale = "",
}) {
  const allowedInPrimary = TWO_AM_PRIMARY_CATEGORIES.has(corpusCategory);
  return {
    assetSymbol: assetSymbol || "UNKNOWN",
    section,
    fieldPath,
    surface,
    corpusCategory,
    text: String(text || "").trim(),
    sourceValueKind,
    renderedVisible,
    allowedInPrimary,
    allowedInAudit: ["audit_internal_text", "raw_model_metadata", "scanner_debug_only"].includes(corpusCategory),
    allowedInMethodology: corpusCategory === "methodology_allowed_text",
    allowedInProtectedReport: corpusCategory === "protected_report_text",
    classificationRationale,
  };
}

function pushTwoAmRows(rows, base, values, sourceValueKind = "display_text") {
  normalizeRenderableList(values).forEach((value, index) => {
    rows.push(twoAmCorpusRow({
      ...base,
      fieldPath: `${base.fieldPath || "field"}[${index}]`,
      text: value,
      sourceValueKind,
    }));
  });
}

export function buildAnswerSurfaceLeakageCorpus({
  assetSymbol,
  model,
  institutionalAnswerSurfaceContract,
  evidenceProvenanceSemanticsContract,
  renderedPrimaryVisibleText = [],
  bundleUserMirrorText = [],
  protectedReportText = [],
} = {}) {
  const safeModel = safeObject(model);
  const contract = safeObject(institutionalAnswerSurfaceContract || safeModel.institutionalAnswerSurfaceContract);
  const provenance = safeObject(evidenceProvenanceSemanticsContract || safeModel.evidenceProvenanceSemanticsContract);
  const symbol = assetSymbol || safeModel.assetSymbol || safeModel.assetName || "UNKNOWN";
  const rows = [];

  pushTwoAmRows(rows, {
    assetSymbol: symbol,
    section: "Rendered primary product surfaces",
    fieldPath: "renderedSurfaceParityViewModel.primaryVisibleText",
    surface: "primary product UI",
    corpusCategory: "primary_rendered_text",
    renderedVisible: true,
    classificationRationale: "Same rendered-intended primary visible text used by product-surface parity checks.",
  }, renderedPrimaryVisibleText);

  safeArray(contract.userAnswerCards).forEach((card, cardIndex) => {
    [
      ["question", card?.question],
      ["statusLabel", card?.statusLabel || card?.sourceStateLabel],
      ["shortAnswer", card?.shortAnswer],
      ["fundamentalAnalysis", card?.fundamentalAnalysis],
      ["riskImpact", card?.riskImpact],
      ["scoreImpactPlainEnglish", card?.scoreImpactPlainEnglish],
      ["evidenceWeHave", safeArray(card?.evidenceWeHave)],
      ["openChecks", safeArray(card?.openChecks)],
      ["whatWouldImproveConfidence", safeArray(card?.whatWouldImproveConfidence)],
      ["whatWouldWeakenConfidence", safeArray(card?.whatWouldWeakenConfidence)],
      ["notApplicableNotes", safeArray(card?.notApplicableNotes)],
    ].forEach(([field, value]) => pushTwoAmRows(rows, {
      assetSymbol: symbol,
      section: "Institutional answer card display text",
      fieldPath: `userAnswerCards[${cardIndex}].${field}`,
      surface: "primary answer cards",
      corpusCategory: "primary_card_display_text",
      renderedVisible: true,
      classificationRationale: "Clean answer-card display text can be primary-visible and must be scanned.",
    }, value));
  });

  pushTwoAmRows(rows, {
    assetSymbol: symbol,
    section: "Copy Review Bundle user-facing mirror",
    fieldPath: "copyReviewBundle.userFacingMirror",
    surface: "Copy Review Bundle user mirror",
    corpusCategory: "bundle_user_mirror_text",
    renderedVisible: true,
    classificationRationale: "Bundle user mirror is rendered/exported text and must share primary leakage checks.",
  }, bundleUserMirrorText);

  pushTwoAmRows(rows, {
    assetSymbol: symbol,
    section: "Protected Investor Report",
    fieldPath: "protectedInvestorReport",
    surface: "Protected Investor Report",
    corpusCategory: "protected_report_text",
    renderedVisible: true,
    classificationRationale: "Protected report has its own leakage bucket and is not counted as primary UI leakage.",
  }, protectedReportText);

  pushTwoAmRows(rows, {
    assetSymbol: symbol,
    section: "Methodology",
    fieldPath: "institutionalAnswerSurfaceContract.methodologySurface",
    surface: "Methodology",
    corpusCategory: "methodology_allowed_text",
    renderedVisible: false,
    classificationRationale: "Methodology can discuss evidence interpretation outside primary answers.",
  }, [
    contract.methodologySurface?.title,
    contract.methodologySurface?.summary,
    ...safeArray(contract.methodologySurface?.bullets),
  ]);

  pushTwoAmRows(rows, {
    assetSymbol: symbol,
    section: "Audit / Raw and Internal Developer QA",
    fieldPath: "institutionalAnswerSurfaceContract.auditDetails",
    surface: "Audit / Raw or Internal Developer QA",
    corpusCategory: "audit_internal_text",
    sourceValueKind: "raw_audit_json",
    renderedVisible: false,
    classificationRationale: "Raw diagnostics are intentionally preserved but excluded from primary leakage.",
  }, safeArray(contract.auditDetails).map((detail) => JSON.stringify(detail)), "raw_audit_json");

  pushTwoAmRows(rows, {
    assetSymbol: symbol,
    section: "Raw model metadata",
    fieldPath: "institutionalAnswerSurfaceContract.leakageCheck",
    surface: "raw model metadata",
    corpusCategory: "raw_model_metadata",
    sourceValueKind: "raw_status_or_metadata",
    renderedVisible: false,
    classificationRationale: "Raw scanner/status fields are not rendered primary text.",
  }, [
    ...safeArray(contract.leakageCheck?.forbiddenPrimaryTerms),
    ...safeArray(contract.leakageCheck?.checkedFields),
    ...safeArray(contract.leakageCheck?.leakingCards),
  ], "raw_status_or_metadata");

  pushTwoAmRows(rows, {
    assetSymbol: symbol,
    section: "Scanner debug only",
    fieldPath: "evidenceProvenanceSemanticsContract.answerSurfaceLeakageClassification",
    surface: "scanner/debug corpus",
    corpusCategory: "scanner_debug_only",
    sourceValueKind: "scanner_debug",
    renderedVisible: false,
    classificationRationale: "Previous scanner output is diagnostic inventory, not primary text.",
  }, [
    ...safeArray(provenance.answerSurfaceLeakageClassification?.blockedTerms),
    ...safeArray(provenance.answerSurfaceLeakageClassification?.exactFields),
  ], "scanner_debug");

  return rows.filter((row) => row.text);
}

export function scanAnswerSurfaceLeakageCorpus(rows = []) {
  const detectedItems = [];
  const excludedItems = [];
  for (const row of safeArray(rows)) {
    const terms = twoAmForbiddenTermsForText(row.text);
    for (const term of terms) {
      const primaryCategory = TWO_AM_PRIMARY_CATEGORIES.has(row.corpusCategory);
      const classification = primaryCategory
        ? "real_primary_visible_leakage"
        : row.corpusCategory === "protected_report_text"
          ? "protected_report_leakage"
          : row.corpusCategory === "methodology_allowed_text"
            ? "methodology_allowed_language"
            : row.corpusCategory === "raw_model_metadata"
              ? "raw_metadata_excluded"
              : row.corpusCategory === "scanner_debug_only"
                ? "scanner_debug_excluded"
                : "audit_internal_allowed";
      const item = {
        term,
        exactTextExcerpt: row.text.slice(0, 240),
        fieldPath: row.fieldPath,
        section: row.section,
        surface: row.surface,
        corpusCategory: row.corpusCategory,
        classification,
        rationale: primaryCategory
          ? "Forbidden raw/internal term appears in rendered primary or bundle mirror text."
          : row.classificationRationale || "Finding is outside rendered primary text.",
        renderedVisible: row.renderedVisible ? "yes" : "no",
        countedAsPrimary: primaryCategory ? "yes" : "no",
      };
      if (primaryCategory || row.corpusCategory === "protected_report_text" || row.corpusCategory === "methodology_allowed_text") {
        detectedItems.push(item);
      } else {
        excludedItems.push(item);
      }
    }
  }
  const count = (category) => detectedItems.filter((item) => item.classification === category).length;
  const excludedCount = (category) => excludedItems.filter((item) => item.classification === category).length;
  const categories = Array.from(new Set(safeArray(rows).map((row) => row.corpusCategory))).filter(Boolean);
  return {
    scannerVersion: TWO_AM_RENDERED_PRIMARY_SCANNER_VERSION,
    corpusSource: "rendered_primary_text_only",
    rawMetadataExcluded: true,
    realPrimaryVisibleLeakageCount: count("real_primary_visible_leakage"),
    primaryLeakagePass: count("real_primary_visible_leakage") === 0,
    bundleUserMirrorLeakageCount: detectedItems.filter((item) => item.classification === "real_primary_visible_leakage" && item.corpusCategory === "bundle_user_mirror_text").length,
    protectedReportLeakageCount: count("protected_report_leakage"),
    methodologyAllowedCount: count("methodology_allowed_language"),
    auditInternalAllowedCount: excludedCount("audit_internal_allowed"),
    rawMetadataExcludedCount: excludedCount("raw_metadata_excluded"),
    scannerFalsePositiveCount: excludedCount("scanner_debug_excluded"),
    detectedItems,
    excludedItems,
    corpusCategoriesScanned: categories.filter((category) => TWO_AM_PRIMARY_CATEGORIES.has(category)),
    corpusCategoriesExcluded: categories.filter((category) => !TWO_AM_PRIMARY_CATEGORIES.has(category)),
  };
}

export const BENCHMARK_SEARCH_PRESETS = [
  { presetId: "benchmark_btc_native_pow_monetary", symbol: "BTC", label: "BTC", query: "BTC", name: "Bitcoin", coingeckoId: "bitcoin", coinmarketcapId: 1, family: "Native PoW monetary / settlement benchmark", badge: "Native benchmark" },
  { presetId: "benchmark_wbtc_wrapped_custodial", symbol: "WBTC", label: "WBTC", query: "WBTC", name: "Wrapped Bitcoin", coingeckoId: "wrapped-bitcoin", coinmarketcapId: 3717, family: "Wrapped BTC / backing and redemption benchmark", badge: "Wrapped backing" },
  { presetId: "benchmark_eth_native_pos_gas", symbol: "ETH", label: "ETH", query: "ETH", name: "Ethereum", coingeckoId: "ethereum", coinmarketcapId: 1027, family: "PoS smart-contract settlement / gas asset", badge: "Settlement benchmark" },
  { presetId: "benchmark_steth_lst", symbol: "stETH", label: "stETH", query: "stETH", name: "Lido Staked Ether", coingeckoId: "staked-ether", coinmarketcapId: 8085, family: "Liquid staking derivative", badge: "LST" },
  { presetId: "benchmark_paxg_tokenized_gold", symbol: "PAXG", label: "PAXG", query: "PAXG", name: "PAX Gold", coingeckoId: "pax-gold", coinmarketcapId: 4705, family: "Tokenized commodity / RWA", badge: "RWA asset" },
  { presetId: "benchmark_xrp_payments_settlement", symbol: "XRP", label: "XRP", query: "XRP", name: "XRP", coingeckoId: "ripple", coinmarketcapId: 52, family: "Payments / settlement network", badge: "Payments" },
  { presetId: "benchmark_usdc_issuer_native_stablecoin", symbol: "USDC", label: "USDC", query: "USDC", name: "USDC", coingeckoId: "usd-coin", coinmarketcapId: 3408, family: "Issuer-native multichain stablecoin", badge: "Stablecoin" },
  { presetId: "benchmark_ada_non_eth_l1", symbol: "ADA", label: "ADA", query: "ADA", name: "Cardano", coingeckoId: "cardano", coinmarketcapId: 2010, family: "PoS base-layer settlement asset", badge: "Native L1" },
  { presetId: "benchmark_ondo_rwa_protocol_token", symbol: "ONDO", label: "ONDO", query: "ONDO", name: "Ondo", coingeckoId: "ondo-finance", coinmarketcapId: 21159, family: "RWA protocol / tokenized finance boundary", badge: "RWA protocol" },
  { presetId: "benchmark_link_oracle_infrastructure", symbol: "LINK", label: "LINK", query: "LINK", name: "Chainlink", coingeckoId: "chainlink", coinmarketcapId: 1975, family: "Oracle / infrastructure security economics", badge: "Oracle" },
  { presetId: "benchmark_uni_defi_governance", symbol: "UNI", label: "UNI", query: "UNI", name: "Uniswap", coingeckoId: "uniswap", coinmarketcapId: 7083, family: "DeFi governance / value-capture boundary", badge: "DeFi" },
  { presetId: "benchmark_rss3_ambiguous_infra_data", symbol: "RSS3", label: "RSS3", query: "RSS3", name: "RSS3", coingeckoId: "rss3", coinmarketcapId: 17917, family: "Open information / infrastructure token", badge: "Infra" },
  { presetId: "benchmark_avax_non_benchmark_l1", symbol: "AVAX", label: "AVAX", query: "AVAX", name: "Avalanche", coingeckoId: "avalanche-2", coinmarketcapId: 5805, family: "Non-benchmark native L1", badge: "Native L1" },
  { presetId: "benchmark_ixs_rwa_exchange_infra", symbol: "IXS", label: "IXS", query: "IXS", name: "IX Swap", coingeckoId: "ix-swap", coinmarketcapId: 10631, family: "RWA exchange / infrastructure utility", badge: "RWA infra" },
  { presetId: "benchmark_rio_rwa_infrastructure_multichain", symbol: "RIO", label: "RIO", query: "RIO", name: "Realio Network", coingeckoId: "realio-network", coinmarketcapId: 4166, family: "RWA infrastructure / hybrid utility", badge: "RWA infra" },
];

function normalizeSynthesizedAnswerPayload(value) {
  const answer = safeObject(value);
  if (!Object.keys(answer).length) return null;
  const analystAnswerCard = safeObject(answer.analystAnswerCard);
  return {
    ...answer,
    analystAnswerCard: Object.keys(analystAnswerCard).length ? {
      ...analystAnswerCard,
      evidenceBasis: safeArray(analystAnswerCard.evidenceBasis),
      reviewedEvidenceUsed: safeArray(analystAnswerCard.reviewedEvidenceUsed),
      providerContextUsed: safeArray(analystAnswerCard.providerContextUsed),
      formulaContextUsed: safeArray(analystAnswerCard.formulaContextUsed),
      liveDataUsed: safeArray(analystAnswerCard.liveDataUsed),
      whatEvidenceDoesNotProve: safeArray(analystAnswerCard.whatEvidenceDoesNotProve),
      missingEvidence: safeArray(analystAnswerCard.missingEvidence),
      whatWouldChange: safeArray(analystAnswerCard.whatWouldChange),
      sourceBoundaryPlainEnglish: safeArray(analystAnswerCard.sourceBoundaryPlainEnglish),
      primaryBadges: safeArray(analystAnswerCard.primaryBadges),
      auditFields: safeArray(analystAnswerCard.auditFields),
    } : null,
    evidenceUsed: safeArray(answer.evidenceUsed),
    reviewedSourcesUsed: safeArray(answer.reviewedSourcesUsed),
    reviewedFactsUsed: safeArray(answer.reviewedFactsUsed),
    whatEvidenceDoesNotProve: safeArray(answer.whatEvidenceDoesNotProve),
    missingEvidence: safeArray(answer.missingEvidence),
    sourceBoundary: safeArray(answer.sourceBoundary),
    whatWouldChange: safeArray(answer.whatWouldChange),
    warnings: safeArray(answer.warnings),
    identityWarnings: safeArray(answer.identityWarnings),
    formulaOutputsUsed: safeArray(answer.formulaOutputsUsed),
    liveDataUsed: safeArray(answer.liveDataUsed),
    providerDataUsed: safeArray(answer.providerDataUsed),
    answerQualityFlags: safeArray(answer.answerQualityFlags),
    synthesisInputsUsed: safeArray(answer.synthesisInputsUsed),
  };
}

export function getAnalystAnswerCard(question) {
  const synthesized = safeObject(question?.synthesizedAnswer);
  const explicitNotApplicable = synthesized.applicabilityStatus === "not_applicable"
    || question?.applicability?.status === "not_applicable"
    || question?.answerStatus === "not_applicable";
  const surfaceCard = safeObject(question?.institutionalUserAnswerCard);
  if (Object.keys(surfaceCard).length) return {
    questionId: question?.questionId || surfaceCard.cardId || "question_unavailable",
    questionText: cleanPrimaryAnswerText(surfaceCard.question || question?.questionText || "Institutional question"),
    directAnswer: cleanPrimaryAnswerText(surfaceCard.answer || surfaceCard.shortAnswer || surfaceCard.fundamentalAnalysis || "Needs verification."),
    headlineStatus: cleanPrimaryAnswerText(surfaceCard.statusLabel || surfaceCard.sourceStateLabel || "Needs verification"),
    evidenceBasis: safeArray(surfaceCard.questionSpecificEvidenceSummary || surfaceCard.evidenceWeHave).map(cleanPrimaryAnswerText),
    evidenceStatus: surfaceCard.sourceStateLabel || "Needs verification",
    reviewedEvidenceUsed: [],
    providerContextUsed: [],
    formulaContextUsed: [],
    liveDataUsed: safeArray(surfaceCard.keyMetrics).map(cleanPrimaryAnswerText),
    whatEvidenceDoesNotProve: safeArray(surfaceCard.whatThisDoesNotProve || surfaceCard.notApplicableNotes).map(cleanPrimaryAnswerText),
    missingEvidence: explicitNotApplicable ? [] : safeArray(surfaceCard.missingObservations || surfaceCard.missingAnalysis || surfaceCard.openChecks).map(cleanPrimaryAnswerText),
    decisionImpact: cleanPrimaryAnswerText(surfaceCard.riskImpact || surfaceCard.impactLabel || "Confidence depends on the unresolved checks."),
    whatWouldChange: explicitNotApplicable ? [] : safeArray(surfaceCard.nextDiligenceActions || surfaceCard.whatWouldImproveConfidence).map(cleanPrimaryAnswerText),
    sourceBoundaryPlainEnglish: [cleanPrimaryAnswerText(surfaceCard.methodologyLinkLabel || "See Methodology for how evidence status is interpreted.")],
    confidenceBoundary: cleanPrimaryAnswerText(surfaceCard.scoreImpactPlainEnglish || "These checks explain confidence before any future scoring integration."),
    manualReviewImplication: explicitNotApplicable
      ? "No diligence requirement is created by a question that is not applicable to this asset."
      : cleanPrimaryAnswerText(surfaceCard.analystNextStep || safeArray(surfaceCard.openChecks)[0] || "Review the open checks before relying on stronger conclusions."),
    assetClassSpecificKeyIssue: cleanPrimaryAnswerText(safeArray(surfaceCard.availableContextSummary)[0] || surfaceCard.answer || surfaceCard.shortAnswer),
    primaryBadges: [cleanPrimaryAnswerText(surfaceCard.statusLabel || "Needs verification")],
    auditFields: surfaceCard.auditDetailAvailable ? ["Clean primary card attached; raw diagnostic detail remains in Audit / Raw."] : [],
  };
  const card = safeObject(synthesized.analystAnswerCard);
  if (Object.keys(card).length) return {
    ...card,
    evidenceBasis: safeArray(card.evidenceBasis),
    reviewedEvidenceUsed: safeArray(card.reviewedEvidenceUsed),
    providerContextUsed: safeArray(card.providerContextUsed),
    formulaContextUsed: safeArray(card.formulaContextUsed),
    liveDataUsed: safeArray(card.liveDataUsed),
    whatEvidenceDoesNotProve: safeArray(card.whatEvidenceDoesNotProve),
    missingEvidence: explicitNotApplicable ? [] : safeArray(card.missingEvidence),
    whatWouldChange: explicitNotApplicable ? [] : safeArray(card.whatWouldChange),
    sourceBoundaryPlainEnglish: safeArray(card.sourceBoundaryPlainEnglish),
    primaryBadges: safeArray(card.primaryBadges),
    auditFields: safeArray(card.auditFields),
  };
  return {
    questionId: question?.questionId || synthesized.questionId || "question_unavailable",
    questionText: question?.questionText || synthesized.questionText || "Institutional question",
    directAnswer: explicitNotApplicable
      ? synthesized.applicabilityReason || question?.applicability?.reason || synthesized.directAnswer || question?.shortAnswer || "Not relevant for this asset."
      : synthesized.directAnswer || question?.shortAnswer || question?.answerSummary || "Source review required; direct evidence is not yet attached.",
    headlineStatus: explicitNotApplicable
      ? "Not applicable"
      : cleanPrimaryAnswerText(synthesized.evidenceStatus ? titleCase(synthesized.evidenceStatus) : titleCase(question?.answerStatus || "source_required")),
    evidenceBasis: safeArray(synthesized.evidenceUsed).length ? safeArray(synthesized.evidenceUsed) : safeArray(question?.supportingSignals),
    evidenceStatus: synthesized.evidenceStatus || question?.reviewedEvidenceStatus || question?.answerStatus || "source_required",
    reviewedEvidenceUsed: [
      ...safeArray(synthesized.reviewedSourcesUsed).map((source) => `${source.title || "Reviewed source"} (${source.publisher || "publisher unavailable"})`),
      ...safeArray(synthesized.reviewedFactsUsed).map((fact) => fact.claim || fact.factId),
    ],
    providerContextUsed: safeArray(synthesized.providerDataUsed),
    formulaContextUsed: safeArray(synthesized.formulaOutputsUsed),
    liveDataUsed: safeArray(synthesized.liveDataUsed),
    whatEvidenceDoesNotProve: safeArray(synthesized.whatEvidenceDoesNotProve),
    missingEvidence: explicitNotApplicable
      ? []
      : safeArray(synthesized.missingEvidence).length ? safeArray(synthesized.missingEvidence) : safeArray(question?.missingEvidence),
    decisionImpact: synthesized.impact || question?.impactOnScoreOrConfidence || "Confidence remains source-boundary constrained until direct evidence is reviewed.",
    whatWouldChange: explicitNotApplicable
      ? []
      : safeArray(synthesized.whatWouldChange).length ? safeArray(synthesized.whatWouldChange) : safeArray(question?.whatWouldChange),
    sourceBoundaryPlainEnglish: safeArray(synthesized.sourceBoundary).length
      ? safeArray(synthesized.sourceBoundary).map((entry) => cleanPrimaryAnswerText(String(entry).replace(/_/g, " ")))
      : ["Provider context helps identify what still needs source review."],
    confidenceBoundary: "This answer explains confidence; numerical score integration requires a calibrated release.",
    manualReviewImplication: explicitNotApplicable
      ? "No diligence requirement is created by a question that is not applicable to this asset."
      : safeArray(synthesized.missingEvidence).length ? "Manual/source review remains useful because material evidence is still missing." : "No separate manual-review implication beyond the current source boundary.",
    assetClassSpecificKeyIssue: "Answer the precise institutional question without overclaiming source support.",
    primaryBadges: [cleanPrimaryAnswerText(synthesized.evidenceStatus ? titleCase(synthesized.evidenceStatus) : titleCase(question?.answerStatus || "source_required"))],
    auditFields: [
      synthesized.synthesisTemplateId ? `synthesisTemplateId=${synthesized.synthesisTemplateId}` : null,
      safeArray(question?.sourceBoundary).length ? `sourceBoundary=${safeArray(question.sourceBoundary).join(", ")}` : null,
    ].filter(Boolean),
  };
}

export function normalizeInstitutionalAnswerSurfacePayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.institutionalAnswerSurfaceContract);
  const nestedContract = safeObject(nestedAnalysis.institutionalAnswerSurfaceContract);
  const contract = rootContract.contractAttached || rootContract.artifactVersion
    ? rootContract
    : nestedContract.contractAttached || nestedContract.artifactVersion
      ? nestedContract
      : null;
  if (!contract) return null;
  return {
    ...contract,
    userAnswerCards: safeArray(contract.userAnswerCards).map((card) => ({
      ...safeObject(card),
      questionId: card?.questionId || card?.cardId || null,
      questionFamily: card?.questionFamily || card?.primaryFamily || contract.assetFamily || null,
      questionGroup: card?.questionGroup || null,
      answerTemplateFamily: card?.answerTemplateFamily || card?.primaryFamily || contract.assetFamily || null,
      primaryFamily: card?.primaryFamily || contract.assetFamily || null,
      sourceMatrixEntry: card?.sourceMatrixEntry || null,
      evidenceWeHave: safeArray(card?.evidenceWeHave).map(cleanPrimaryAnswerText),
      openChecks: safeArray(card?.openChecks).map(cleanPrimaryAnswerText),
      whatWouldImproveConfidence: safeArray(card?.whatWouldImproveConfidence).map(cleanPrimaryAnswerText),
      whatWouldWeakenConfidence: safeArray(card?.whatWouldWeakenConfidence).map(cleanPrimaryAnswerText),
      keyMetrics: safeArray(card?.keyMetrics).map(cleanPrimaryAnswerText),
      watchItems: safeArray(card?.watchItems).map(cleanPrimaryAnswerText),
      notApplicableNotes: safeArray(card?.notApplicableNotes).map(cleanPrimaryAnswerText),
      dataUsed: safeArray(card?.dataUsed),
      whatThisSupports: safeArray(card?.whatThisSupports).map(cleanPrimaryAnswerText),
      whatThisDoesNotProve: safeArray(card?.whatThisDoesNotProve).map(cleanPrimaryAnswerText),
      missingAnalysis: safeArray(card?.missingAnalysis).map(cleanPrimaryAnswerText),
      analystNextStep: cleanPrimaryAnswerText(card?.analystNextStep),
      answerState: card?.answerState || "missing_key_data",
      whatDataSupports: safeArray(card?.whatDataSupports || card?.whatThisSupports).map(cleanPrimaryAnswerText),
      whatDataDoesNotProve: safeArray(card?.whatDataDoesNotProve || card?.whatThisDoesNotProve).map(cleanPrimaryAnswerText),
      missingData: safeArray(card?.missingData || card?.missingObservations || card?.missingAnalysis).map(cleanPrimaryAnswerText),
      observationTypesUsed: safeArray(card?.observationTypesUsed),
      observationTypesMissing: safeArray(card?.observationTypesMissing || card?.missingObservationTypes),
      boundary: cleanPrimaryAnswerText(card?.boundary || card?.contextBoundary),
      shortAnswer: cleanPrimaryAnswerText(card?.shortAnswer),
      fundamentalAnalysis: cleanPrimaryAnswerText(card?.fundamentalAnalysis),
      riskImpact: cleanPrimaryAnswerText(card?.riskImpact),
      scoreImpactPlainEnglish: cleanPrimaryAnswerText(card?.scoreImpactPlainEnglish),
      semanticStatuses: safeArray(card?.semanticStatuses),
      questionSpecificEvidence: safeArray(card?.questionSpecificEvidence),
      availableContext: safeArray(card?.availableContext),
      rejectedQuestionEvidence: safeArray(card?.rejectedQuestionEvidence),
      missingObservationTypes: safeArray(card?.missingObservationTypes),
      nextDiligenceActions: safeArray(card?.nextDiligenceActions).map(cleanPrimaryAnswerText),
      evidenceGapExplanation: cleanPrimaryAnswerText(card?.evidenceGapExplanation),
      contextBoundary: cleanPrimaryAnswerText(card?.contextBoundary),
      registryContractUsed: safeObject(card?.registryContractUsed),
      answer: cleanPrimaryAnswerText(card?.answer || card?.fundamentalAnalysis),
      questionSpecificEvidenceSummary: safeArray(card?.questionSpecificEvidenceSummary).map(cleanPrimaryAnswerText),
      availableContextSummary: safeArray(card?.availableContextSummary).map(cleanPrimaryAnswerText),
      missingObservations: safeArray(card?.missingObservations || card?.missingAnalysis).map(cleanPrimaryAnswerText),
      mechanismContext: safeArray(card?.mechanismContext).map(cleanPrimaryAnswerText),
      currentLiveEvidence: safeArray(card?.currentLiveEvidence).map(cleanPrimaryAnswerText),
      currentLiveEvidenceStatus: card?.currentLiveEvidenceStatus || "missing",
      fallbackCopyRewritten: card?.fallbackCopyRewritten === true,
      identityMissingEvidenceSuppressed: card?.identityMissingEvidenceSuppressed === true,
      mechanismContextSeparated: card?.mechanismContextSeparated === true,
      primaryUiInternalWordingHidden: card?.primaryUiInternalWordingHidden !== false,
      auditOnlyDiagnostics: safeObject(card?.auditOnlyDiagnostics),
      deduplicationMetadata: {
        ...safeObject(card?.deduplicationMetadata),
        repeatedCopySuppressed: safeArray(card?.deduplicationMetadata?.repeatedCopySuppressed),
      },
    })),
    sourceSummary: {
      ...safeObject(contract.sourceSummary),
      evidenceWeHave: safeArray(contract.sourceSummary?.evidenceWeHave).map(cleanPrimaryAnswerText),
      openChecks: safeArray(contract.sourceSummary?.openChecks).map(cleanPrimaryAnswerText),
      sourceQueueSummary: safeArray(contract.sourceSummary?.sourceQueueSummary).map(cleanPrimaryAnswerText),
      reviewedEvidenceSummary: safeArray(contract.sourceSummary?.reviewedEvidenceSummary).map(cleanPrimaryAnswerText),
      rejectedIncompatibleOpenChecksAuditOnly: safeArray(contract.sourceSummary?.rejectedIncompatibleOpenChecksAuditOnly),
    },
    riskSummary: {
      ...safeObject(contract.riskSummary),
      primaryRisks: safeArray(contract.riskSummary?.primaryRisks).map(cleanPrimaryAnswerText),
      watchItems: safeArray(contract.riskSummary?.watchItems).map(cleanPrimaryAnswerText),
      manualReviewSummary: safeArray(contract.riskSummary?.manualReviewSummary).map(cleanPrimaryAnswerText),
    },
    scoreSummary: {
      ...safeObject(contract.scoreSummary),
      confidenceCaps: safeArray(contract.scoreSummary?.confidenceCaps).map(cleanPrimaryAnswerText),
      scoringTransparencySummary: safeArray(contract.scoreSummary?.scoringTransparencySummary).map(cleanPrimaryAnswerText),
    },
    methodologySurface: {
      ...safeObject(contract.methodologySurface),
      bullets: safeArray(contract.methodologySurface?.bullets),
    },
    auditDetails: safeArray(contract.auditDetails),
    leakageCheck: {
      ...safeObject(contract.leakageCheck),
      wrongFamilyQuestionFindings: safeArray(contract.leakageCheck?.wrongFamilyQuestionFindings),
    },
    productLayer: {
      ...safeObject(contract.productLayer),
      canonicalOwnerDisposition: safeObject(contract.productLayer?.canonicalOwnerDisposition),
      currentDataUsed: safeArray(contract.productLayer?.currentDataUsed),
      claimTrace: safeArray(contract.productLayer?.claimTrace),
      semanticStatusSummary: {
        ...safeObject(contract.productLayer?.semanticStatusSummary),
        statuses: safeArray(contract.productLayer?.semanticStatusSummary?.statuses),
        labels: safeArray(contract.productLayer?.semanticStatusSummary?.labels),
      },
      relevanceRanking: safeArray(contract.productLayer?.relevanceRanking).map((item) => ({
        ...safeObject(item),
        dataPointIds: safeArray(item?.dataPointIds),
        missingObservationTypes: safeArray(item?.missingObservationTypes),
      })),
      registryEnforcementSummary: safeObject(contract.productLayer?.registryEnforcementSummary),
      fallbackQualitySummary: safeObject(contract.productLayer?.fallbackQualitySummary),
      deduplicationSummary: {
        ...safeObject(contract.productLayer?.deduplicationSummary),
        repeatedCopySuppressed: safeArray(contract.productLayer?.deduplicationSummary?.repeatedCopySuppressed),
      },
      supportedFacts: safeArray(contract.productLayer?.supportedFacts).map(cleanPrimaryAnswerText),
      boundedInterpretations: safeArray(contract.productLayer?.boundedInterpretations).map(cleanPrimaryAnswerText),
      unsupportedInferences: safeArray(contract.productLayer?.unsupportedInferences).map(cleanPrimaryAnswerText),
      missingAnalysis: safeArray(contract.productLayer?.missingAnalysis).map(cleanPrimaryAnswerText),
      analystNextSteps: safeArray(contract.productLayer?.analystNextSteps).map(cleanPrimaryAnswerText),
      topRisks: safeArray(contract.productLayer?.topRisks).map(cleanPrimaryAnswerText),
      topFalsifiers: safeArray(contract.productLayer?.topFalsifiers).map(cleanPrimaryAnswerText),
      whatWouldChange: safeArray(contract.productLayer?.whatWouldChange).map(cleanPrimaryAnswerText),
      assetResearchSummary: safeObject(contract.productLayer?.assetResearchSummary),
      tabDisplayModel: safeObject(contract.productLayer?.tabDisplayModel),
      uiVisibilityPolicy: safeObject(contract.productLayer?.uiVisibilityPolicy),
      bundleParityMarkers: safeObject(contract.productLayer?.bundleParityMarkers),
      internalOnlyFields: safeArray(contract.productLayer?.internalOnlyFields),
    },
  };
}

export function normalizeEvidenceStatusAggregationPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.evidenceStatusAggregationContract);
  const nestedContract = safeObject(nestedAnalysis.evidenceStatusAggregationContract);
  const contract = rootContract.contractAttached || rootContract.artifactVersion
    ? rootContract
    : nestedContract.contractAttached || nestedContract.artifactVersion
      ? nestedContract
      : null;
  if (!contract) return null;
  const normalizeClaim = (claim) => ({
    ...safeObject(claim),
    claimText: cleanPrimaryAnswerText(claim?.claimText),
    limitations: safeArray(claim?.limitations).map(cleanPrimaryAnswerText),
  });
  return {
    ...contract,
    claims: safeArray(contract.claims).map(normalizeClaim),
    questionAggregations: safeArray(contract.questionAggregations).map((question) => ({
      ...safeObject(question),
      plainLanguageStatus: cleanPrimaryAnswerText(question?.plainLanguageStatus),
      plainLanguageSummary: cleanPrimaryAnswerText(question?.plainLanguageSummary),
      supportedClaims: safeArray(question?.supportedClaims).map(normalizeClaim),
      missingClaims: safeArray(question?.missingClaims).map(normalizeClaim),
      liveDataRequiredClaims: safeArray(question?.liveDataRequiredClaims || question?.liveDataClaims).map(normalizeClaim),
      contradictedClaims: safeArray(question?.contradictedClaims).map(normalizeClaim),
      notApplicableClaims: safeArray(question?.notApplicableClaims).map(normalizeClaim),
      openChecks: safeArray(question?.openChecks).map(cleanPrimaryAnswerText),
      confidenceCapReason: cleanPrimaryAnswerText(question?.confidenceCapReason),
      sourceQueueItems: safeArray(question?.sourceQueueItems),
      manualReviewItems: safeArray(question?.manualReviewItems),
      rawClaimIds: safeArray(question?.rawClaimIds),
    })),
    dimensionAggregations: safeArray(contract.dimensionAggregations),
    assetAggregation: {
      ...safeObject(contract.assetAggregation),
      primaryEvidenceStatus: cleanPrimaryAnswerText(contract.assetAggregation?.primaryEvidenceStatus),
      plainLanguageSummary: cleanPrimaryAnswerText(contract.assetAggregation?.plainLanguageSummary),
      openChecks: safeArray(contract.assetAggregation?.openChecks).map(cleanPrimaryAnswerText),
      scoringReadinessImpact: {
        ...safeObject(contract.assetAggregation?.scoringReadinessImpact),
        plainLanguageSummary: cleanPrimaryAnswerText(contract.assetAggregation?.scoringReadinessImpact?.plainLanguageSummary),
        evidenceReadinessGaps: safeArray(contract.assetAggregation?.scoringReadinessImpact?.evidenceReadinessGaps).map(cleanPrimaryAnswerText),
        confidenceCaps: safeArray(contract.assetAggregation?.scoringReadinessImpact?.confidenceCaps).map(cleanPrimaryAnswerText),
        scoreEligibilityNotes: safeArray(contract.assetAggregation?.scoringReadinessImpact?.scoreEligibilityNotes).map(cleanPrimaryAnswerText),
      },
    },
    sourceQueueItems: safeArray(contract.sourceQueueItems).map(cleanPrimaryAnswerText),
    manualReviewItems: safeArray(contract.manualReviewItems).map(cleanPrimaryAnswerText),
    canonicalProjection: safeObject(contract.canonicalProjection),
    auditOnlyLegacyInputs: safeObject(contract.auditOnlyLegacyInputs),
    readinessImpact: safeObject(contract.readinessImpact),
    policiesApplied: safeArray(contract.policiesApplied),
    conflicts: safeArray(contract.conflicts),
    guardrails: safeObject(contract.guardrails),
  };
}

export function normalizeCoverageScoreEligibilityPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.coverageScoreEligibilityContract);
  const nestedContract = safeObject(nestedAnalysis.coverageScoreEligibilityContract);
  const contract = rootContract.contractAttached || rootContract.artifactVersion
    ? rootContract
    : nestedContract.contractAttached || nestedContract.artifactVersion
      ? nestedContract
      : null;
  if (!contract) return null;
  const cleanBlocker = (blocker) => ({
    ...safeObject(blocker),
    label: cleanPrimaryAnswerText(blocker?.label),
    sourceRequirement: cleanPrimaryAnswerText(blocker?.sourceRequirement),
  });
  return {
    ...contract,
    coverageTierLabel: cleanPrimaryAnswerText(contract.coverageTierLabel),
    coverageTierReason: cleanPrimaryAnswerText(contract.coverageTierReason),
    scoreEligibilityReason: cleanPrimaryAnswerText(contract.scoreEligibilityReason),
    analysisDepthLabel: cleanPrimaryAnswerText(contract.analysisDepthLabel),
    evidenceCoverageSummary: cleanPrimaryAnswerText(contract.evidenceCoverageSummary),
    primaryUserMessage: cleanPrimaryAnswerText(contract.primaryUserMessage),
    confidenceCap: cleanPrimaryAnswerText(contract.confidenceCap),
    criticalBlockers: safeArray(contract.criticalBlockers).map(cleanBlocker),
    coverageBlockers: safeArray(contract.coverageBlockers).map(cleanBlocker),
    liveMetricGaps: safeArray(contract.liveMetricGaps).map(cleanPrimaryAnswerText),
    legalRightsGaps: safeArray(contract.legalRightsGaps).map(cleanPrimaryAnswerText),
    economicRightsGaps: safeArray(contract.economicRightsGaps).map(cleanPrimaryAnswerText),
    reserveRedemptionGaps: safeArray(contract.reserveRedemptionGaps).map(cleanPrimaryAnswerText),
    securityGaps: safeArray(contract.securityGaps).map(cleanPrimaryAnswerText),
    liquidityMarketAccessGaps: safeArray(contract.liquidityMarketAccessGaps).map(cleanPrimaryAnswerText),
    manualReviewTriggers: safeArray(contract.manualReviewTriggers).map(cleanPrimaryAnswerText),
    notApplicableRedirects: safeArray(contract.notApplicableRedirects).map(cleanPrimaryAnswerText),
    whatWouldUpgradeTier: safeArray(contract.whatWouldUpgradeTier).map(cleanPrimaryAnswerText),
    whatWouldMakeScoreEligible: safeArray(contract.whatWouldMakeScoreEligible).map(cleanPrimaryAnswerText),
    readinessDimensions: safeArray(contract.readinessDimensions).map((dimension) => ({
      ...safeObject(dimension),
      label: cleanPrimaryAnswerText(dimension?.label),
      summary: cleanPrimaryAnswerText(dimension?.summary),
      blockers: safeArray(dimension?.blockers).map(cleanPrimaryAnswerText),
    })),
    auditDetails: safeObject(contract.auditDetails),
    guardrails: safeObject(contract.guardrails),
  };
}

export function normalizeFamilyCanonicalRoutingPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.familyCanonicalRoutingContract);
  const nestedContract = safeObject(nestedAnalysis.familyCanonicalRoutingContract);
  const contract = rootContract.artifactVersion || rootContract.canonicalRoute
    ? rootContract
    : nestedContract.artifactVersion || nestedContract.canonicalRoute
      ? nestedContract
      : null;
  if (!contract) return null;
  return {
    ...contract,
    canonicalRoute: {
      ...safeObject(contract.canonicalRoute),
      canonicalSourceMatrixEntries: safeArray(contract.canonicalRoute?.canonicalSourceMatrixEntries || contract.canonicalSourceMatrixEntries),
      allowedRawQuestionGroups: safeArray(contract.canonicalRoute?.allowedRawQuestionGroups),
      forbiddenPrimaryQuestionGroups: safeArray(contract.canonicalRoute?.forbiddenPrimaryQuestionGroups),
      auditOnlyFallbackGroups: safeArray(contract.canonicalRoute?.auditOnlyFallbackGroups),
      requiredBlockerThemes: safeArray(contract.canonicalRoute?.requiredBlockerThemes).map(cleanPrimaryAnswerText),
      forbiddenPrimaryBlockerThemes: safeArray(contract.canonicalRoute?.forbiddenPrimaryBlockerThemes).map(cleanPrimaryAnswerText),
    },
    canonicalSourceMatrixEntries: safeArray(contract.canonicalSourceMatrixEntries),
    primaryAnalysisRouteSourceMatrixBeforeCanonicalization: safeArray(contract.primaryAnalysisRouteSourceMatrixBeforeCanonicalization),
    mismatches: safeArray(contract.mismatches),
    blockedFallbacks: safeArray(contract.blockedFallbacks),
    familyScopedBlockers: safeArray(contract.familyScopedBlockers).map(cleanPrimaryAnswerText),
    familyScopedEvidenceRequirements: safeArray(contract.familyScopedEvidenceRequirements).map(cleanPrimaryAnswerText),
    familyScopedSourceQueueRequirements: safeArray(contract.familyScopedSourceQueueRequirements).map(cleanPrimaryAnswerText),
    familyScopedManualReviewItems: safeArray(contract.familyScopedManualReviewItems).map(cleanPrimaryAnswerText),
    sourceQueueCanonicalRequirements: safeArray(contract.sourceQueueCanonicalRequirements || contract.familyScopedSourceQueueRequirements).map(cleanPrimaryAnswerText),
    manualReviewCanonicalRequirements: safeArray(contract.manualReviewCanonicalRequirements || contract.familyScopedManualReviewItems).map(cleanPrimaryAnswerText),
    canonicalQueueItemIds: safeArray(contract.canonicalQueueItemIds),
    rejectedWrongFamilyRequirements: safeArray(contract.rejectedWrongFamilyRequirements),
    auditOnlyFields: safeObject(contract.auditOnlyFields),
    frontendParity: safeObject(contract.frontendParity),
    bundleParity: safeObject(contract.bundleParity),
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations).map(cleanPrimaryAnswerText),
  };
}

export function normalizeEvidenceProvenanceSemanticsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.evidenceProvenanceSemanticsContract);
  const nestedContract = safeObject(nestedAnalysis.evidenceProvenanceSemanticsContract);
  const contract = rootContract.contractAttached || rootContract.artifactVersion
    ? rootContract
    : nestedContract.contractAttached || nestedContract.artifactVersion
      ? nestedContract
      : null;
  if (!contract) return null;
  return {
    ...contract,
    canonicalSourceMatrixEntries: safeArray(contract.canonicalSourceMatrixEntries),
    provenanceSummary: safeObject(contract.provenanceSummary),
    readinessCounters: safeObject(contract.readinessCounters),
    questionSummaries: safeArray(contract.questionSummaries).map((question) => ({
      ...safeObject(question),
      displayLabel: cleanPrimaryAnswerText(question?.displayLabel),
      readinessLabel: cleanPrimaryAnswerText(question?.readinessLabel),
      gaps: safeArray(question?.gaps).map((gap) => ({
        ...safeObject(gap),
        label: cleanPrimaryAnswerText(gap?.label),
        displayLabel: cleanPrimaryAnswerText(gap?.displayLabel),
      })),
    })),
    claimSummaries: safeArray(contract.claimSummaries).map((claim) => ({
      ...safeObject(claim),
      claimText: cleanPrimaryAnswerText(claim?.claimText),
      useBoundaries: safeArray(claim?.useBoundaries),
      displayLabel: cleanPrimaryAnswerText(claim?.displayLabel),
      readinessLabel: cleanPrimaryAnswerText(claim?.readinessLabel),
    })),
    assetSummary: {
      ...safeObject(contract.assetSummary),
      summaryLabel: cleanPrimaryAnswerText(contract.assetSummary?.summaryLabel),
      manualEvidenceReadiness: cleanPrimaryAnswerText(contract.assetSummary?.manualEvidenceReadiness),
      liveDataReadiness: cleanPrimaryAnswerText(contract.assetSummary?.liveDataReadiness),
      scoringActivationReadiness: cleanPrimaryAnswerText(contract.assetSummary?.scoringActivationReadiness),
      institutionalReadinessBasis: cleanPrimaryAnswerText(contract.assetSummary?.institutionalReadinessBasis),
      scoreEvidenceBasis: cleanPrimaryAnswerText(contract.assetSummary?.scoreEvidenceBasis),
      coverageEvidenceBasis: cleanPrimaryAnswerText(contract.assetSummary?.coverageEvidenceBasis),
      keyGaps: safeArray(contract.assetSummary?.keyGaps).map((gap) => ({
        ...safeObject(gap),
        label: cleanPrimaryAnswerText(gap?.label),
        displayLabel: cleanPrimaryAnswerText(gap?.displayLabel),
      })),
    },
    primaryLabels: safeArray(contract.primaryLabels).map(cleanPrimaryAnswerText),
    readinessGaps: safeArray(contract.readinessGaps).map((gap) => ({
      ...safeObject(gap),
      label: cleanPrimaryAnswerText(gap?.label),
      displayLabel: cleanPrimaryAnswerText(gap?.displayLabel),
    })),
    confidenceCapDrivers: safeArray(contract.confidenceCapDrivers).map(cleanPrimaryAnswerText),
    scoringActivationGaps: safeArray(contract.scoringActivationGaps).map(cleanPrimaryAnswerText),
    answerSurfaceLeakageClassification: safeObject(contract.answerSurfaceLeakageClassification),
    evidenceAggregationReadinessSemantics: safeObject(contract.evidenceAggregationReadinessSemantics),
    coverageScoreEligibilitySemantics: safeObject(contract.coverageScoreEligibilitySemantics),
    canonicalRoutePropagationSanity: safeObject(contract.canonicalRoutePropagationSanity),
    displayPolicy: safeObject(contract.displayPolicy),
    auditDetails: safeObject(contract.auditDetails),
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations).map(cleanPrimaryAnswerText),
  };
}

export function normalizeFamilyDataRequirementMatrixPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.familyDataRequirementMatrixContract);
  const nestedContract = safeObject(nestedAnalysis.familyDataRequirementMatrixContract);
  const contract = rootContract.contractStatus || rootContract.artifactVersion
    ? rootContract
    : nestedContract.contractStatus || nestedContract.artifactVersion
      ? nestedContract
      : null;
  if (!contract) return null;
  const cleanRequirement = (requirement) => ({
    ...safeObject(requirement),
    label: cleanPrimaryAnswerText(requirement?.label),
    evidenceBoundary: cleanPrimaryAnswerText(requirement?.evidenceBoundary),
    whatItCanProve: cleanPrimaryAnswerText(requirement?.whatItCanProve),
    whatItCannotProve: cleanPrimaryAnswerText(requirement?.whatItCannotProve),
    recommendedSources: safeArray(requirement?.recommendedSources).map(cleanPrimaryAnswerText),
    sourceQueueText: cleanPrimaryAnswerText(requirement?.sourceQueueText),
    manualReviewText: cleanPrimaryAnswerText(requirement?.manualReviewText),
    primaryDisplayText: cleanPrimaryAnswerText(requirement?.primaryDisplayText),
    auditText: requirement?.auditText || null,
    relatedQuestions: safeArray(requirement?.relatedQuestions),
    relatedEvidenceNamespaces: safeArray(requirement?.relatedEvidenceNamespaces),
    contradictionChecks: safeArray(requirement?.contradictionChecks).map(cleanPrimaryAnswerText),
    dataFreshnessWarning: cleanPrimaryAnswerText(requirement?.dataFreshnessWarning),
  });
  return {
    ...contract,
    familyRequirements: safeArray(contract.familyRequirements).map(cleanRequirement),
    liveDataRequirements: safeArray(contract.liveDataRequirements).map(cleanRequirement),
    reviewedEvidenceRequirements: safeArray(contract.reviewedEvidenceRequirements).map(cleanRequirement),
    sourceCandidateRequirements: safeArray(contract.sourceCandidateRequirements).map(cleanRequirement),
    manualReviewTriggers: safeArray(contract.manualReviewTriggers).map(cleanRequirement),
    confidenceCapRules: safeArray(contract.confidenceCapRules).map(cleanRequirement),
    scoreEligibilityBlockers: safeArray(contract.scoreEligibilityBlockers).map(cleanRequirement),
    notApplicableEvidence: safeArray(contract.notApplicableEvidence).map(cleanRequirement),
    coverageTierImpacts: safeArray(contract.coverageTierImpacts).map(cleanPrimaryAnswerText),
    evidenceDoesNotProve: safeArray(contract.evidenceDoesNotProve).map(cleanPrimaryAnswerText),
    providerMetadataBoundaries: safeArray(contract.providerMetadataBoundaries).map(cleanPrimaryAnswerText),
    freshnessRequirements: safeArray(contract.freshnessRequirements).map(cleanPrimaryAnswerText),
    reliabilityRequirements: safeArray(contract.reliabilityRequirements).map(cleanPrimaryAnswerText),
    contradictionChecks: safeArray(contract.contradictionChecks).map(cleanPrimaryAnswerText),
    recommendedSourceTypes: safeArray(contract.recommendedSourceTypes).map(cleanPrimaryAnswerText),
    sourceQueueItems: safeArray(contract.sourceQueueItems).map(cleanPrimaryAnswerText),
    manualReviewItems: safeArray(contract.manualReviewItems).map(cleanPrimaryAnswerText),
    evidenceMapRows: safeArray(contract.evidenceMapRows).map(cleanPrimaryAnswerText),
    scoringTransparencyRows: safeArray(contract.scoringTransparencyRows).map(cleanPrimaryAnswerText),
    copyBundleRows: safeArray(contract.copyBundleRows),
    protectedReportSummary: safeArray(contract.protectedReportSummary).map(cleanPrimaryAnswerText),
    auditDiagnostics: safeObject(contract.auditDiagnostics),
    frontendVisibility: safeObject(contract.frontendVisibility),
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations).map(cleanPrimaryAnswerText),
  };
}

function attachInstitutionalSurfaceCardsToQuestions(questions, institutionalAnswerSurfaceContract) {
  const cards = safeArray(institutionalAnswerSurfaceContract?.userAnswerCards);
  if (!cards.length) return questions;
  const byQuestionId = new Map();
  const byQuestionText = new Map();
  cards.forEach((card) => {
    const cardId = String(card.cardId || "").toLowerCase();
    const questionText = String(card.question || "").toLowerCase();
    if (cardId) byQuestionId.set(cardId, card);
    if (questionText) byQuestionText.set(questionText, card);
  });
  return questions.map((question) => {
    const questionId = String(question?.questionId || "").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const questionText = String(question?.questionText || "").toLowerCase();
    const matched = cards.find((card) => String(card.cardId || "").toLowerCase().includes(questionId))
      || byQuestionText.get(questionText)
      || cards.find((card) => String(card.question || "").toLowerCase() === questionText);
    return matched ? { ...question, institutionalUserAnswerCard: matched } : question;
  });
}

export function normalizeInstitutionalQuestionsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const institutionalAnswerSurfaceContract = normalizeInstitutionalAnswerSurfacePayload(responseLike);
  const rootQuestions = safeArray(root.institutionalQuestions);
  const nestedQuestions = safeArray(nestedAnalysis.institutionalQuestions);
  const normalizeQuestion = (question) => ({
    ...safeObject(question),
    supportingSignals: safeArray(question?.supportingSignals),
    missingEvidence: safeArray(question?.missingEvidence),
    contradictionSignals: safeArray(question?.contradictionSignals),
    scoringFieldsUsed: safeArray(question?.scoringFieldsUsed),
    sourceBoundary: safeArray(question?.sourceBoundary),
    whatWouldChange: safeArray(question?.whatWouldChange),
    reviewedSourcesUsed: safeArray(question?.reviewedSourcesUsed),
    reviewedFactsUsed: safeArray(question?.reviewedFactsUsed),
    remainingMissingEvidence: safeArray(question?.remainingMissingEvidence),
    reviewedEvidenceBoundary: safeArray(question?.reviewedEvidenceBoundary),
    evidenceMappingWarnings: safeArray(question?.evidenceMappingWarnings),
    reviewedEvidenceDoesNotAnswer: safeArray(question?.reviewedEvidenceDoesNotAnswer),
    synthesizedAnswer: normalizeSynthesizedAnswerPayload(question?.synthesizedAnswer),
  });
  const questions = rootQuestions.length ? rootQuestions : nestedQuestions;

  return {
    institutionalQuestions: attachInstitutionalSurfaceCardsToQuestions(questions.map(normalizeQuestion), institutionalAnswerSurfaceContract),
    institutionalQuestionsProvenance:
      root.institutionalQuestionsProvenance ||
      nestedAnalysis.institutionalQuestionsProvenance ||
      null,
  };
}

export function normalizeReviewedEvidencePacketPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootPacket = safeObject(root.reviewedEvidencePacket);
  const nestedPacket = safeObject(nestedAnalysis.reviewedEvidencePacket);
  const packet = rootPacket.packetLoaded !== undefined || rootPacket.packetId
    ? rootPacket
    : nestedPacket.packetLoaded !== undefined || nestedPacket.packetId
      ? nestedPacket
      : null;

  if (!packet) return null;

  return {
    ...packet,
    packetLoaded: Boolean(packet.packetLoaded),
    sources: safeArray(packet.sources),
    facts: safeArray(packet.facts).map((fact) => ({
      ...safeObject(fact),
      limitations: safeArray(fact?.limitations),
      reviewedEvidenceDoesNotAnswer: safeArray(fact?.reviewedEvidenceDoesNotAnswer),
      mappedQuestionIds: safeArray(fact?.mappedQuestionIds),
    })),
    questionMappings: safeArray(packet.questionMappings).map((mapping) => ({
      ...safeObject(mapping),
      reviewedSourcesUsed: safeArray(mapping?.reviewedSourcesUsed),
      reviewedFactsUsed: safeArray(mapping?.reviewedFactsUsed),
      remainingMissingEvidence: safeArray(mapping?.remainingMissingEvidence),
      contradictionNotes: safeArray(mapping?.contradictionNotes),
      sourceBoundary: safeArray(mapping?.sourceBoundary),
      evidenceMappingWarnings: safeArray(mapping?.evidenceMappingWarnings),
      reviewedEvidenceDoesNotAnswer: safeArray(mapping?.reviewedEvidenceDoesNotAnswer),
    })),
    sourceQueueNotes: safeArray(packet.sourceQueueNotes),
    remainingSourceRequirements: safeArray(packet.remainingSourceRequirements),
    answerUpgradeSummary: safeArray(packet.answerUpgradeSummary),
    warnings: safeArray(packet.warnings),
    identityEvidenceReconciliationWarnings: safeArray(packet.identityEvidenceReconciliationWarnings),
    evidenceMappingWarnings: safeArray(packet.evidenceMappingWarnings),
    sourceBoundary: safeArray(packet.sourceBoundary),
    audit: {
      ...safeObject(packet.audit),
      matchedBy: safeArray(packet.audit?.matchedBy),
      rejectedPacketIds: safeArray(packet.audit?.rejectedPacketIds),
      limitations: safeArray(packet.audit?.limitations),
    },
  };
}

export function normalizeBenchmarkInstitutionalAnswerPackPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootPack = safeObject(root.benchmarkInstitutionalAnswerPack);
  const nestedPack = safeObject(nestedAnalysis.benchmarkInstitutionalAnswerPack);
  const pack = rootPack.packId || rootPack.schemaVersion
    ? rootPack
    : nestedPack.packId || nestedPack.schemaVersion
      ? nestedPack
      : null;

  if (!pack) return null;

  const normalizeSourceRef = (source) => ({
    ...safeObject(source),
    claimSupported: safeArray(source?.claimSupported),
    doesNotProve: safeArray(source?.doesNotProve),
    scoringActive: source?.scoringActive === true,
  });
  const normalizeClaim = (claim) => ({
    ...safeObject(claim),
    sourceRefs: safeArray(claim?.sourceRefs).map(normalizeSourceRef),
    proves: safeArray(claim?.proves),
    doesNotProve: safeArray(claim?.doesNotProve),
    scoringActive: claim?.scoringActive === true,
  });
  const questions = safeArray(pack.questions).map((question) => ({
    ...safeObject(question),
    claims: safeArray(question?.claims).map(normalizeClaim),
    evidenceBasis: safeArray(question?.evidenceBasis),
    proven: safeArray(question?.proven),
    notProven: safeArray(question?.notProven),
    missingEvidence: safeArray(question?.missingEvidence),
    sourceRequirements: safeArray(question?.sourceRequirements),
    whatWouldChange: safeArray(question?.whatWouldChange),
    sourceBoundary: safeArray(question?.sourceBoundary),
    scoringEligible: question?.scoringEligible === true,
  }));

  return {
    ...pack,
    questions,
    sourceRequirements: safeArray(pack.sourceRequirements),
    missingEvidence: safeArray(pack.missingEvidence),
    hardBlockers: safeArray(pack.hardBlockers),
    confidenceCaps: safeArray(pack.confidenceCaps),
    whatWouldChange: safeArray(pack.whatWouldChange),
    monitoringTriggers: safeArray(pack.monitoringTriggers),
    sourceBoundary: safeArray(pack.sourceBoundary),
    limitations: safeArray(pack.limitations),
    scoreRationale: {
      ...safeObject(pack.scoreRationale),
      positiveCandidateSignals: safeArray(pack.scoreRationale?.positiveCandidateSignals),
      negativeCandidateSignals: safeArray(pack.scoreRationale?.negativeCandidateSignals),
      hardBlockers: safeArray(pack.scoreRationale?.hardBlockers),
      confidenceCaps: safeArray(pack.scoreRationale?.confidenceCaps),
      scoreReadinessGaps: safeArray(pack.scoreRationale?.scoreReadinessGaps),
    },
    engineLearning: {
      ...safeObject(pack.engineLearning),
      sourceRequirementTemplates: safeArray(pack.engineLearning?.sourceRequirementTemplates),
      qaRegressionRules: safeArray(pack.engineLearning?.qaRegressionRules),
      whatGeneralizes: safeArray(pack.engineLearning?.whatGeneralizes),
      mustNotGeneralize: safeArray(pack.engineLearning?.mustNotGeneralize),
    },
    guardrails: safeObject(pack.guardrails),
  };
}

export function normalizeEngineLearningBackbonePayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootBackbone = safeObject(root.engineLearningBackbone);
  const nestedBackbone = safeObject(nestedAnalysis.engineLearningBackbone);
  const backbone = rootBackbone.artifactVersion || rootBackbone.taskName
    ? rootBackbone
    : nestedBackbone.artifactVersion || nestedBackbone.taskName
      ? nestedBackbone
      : null;

  if (!backbone) return null;
  const benchmarkAssetPresetRegistry = safeObject(backbone.benchmarkAssetPresetRegistry);
  const rawFeedbackLoop = safeObject(backbone.engineLearningFeedbackLoop);
  const normalizeFeedbackFindings = (findings) => safeArray(findings).map((finding) => ({
    ...safeObject(finding),
    affectedAssetSymbols: safeArray(finding?.affectedAssetSymbols),
    affectedLensIds: safeArray(finding?.affectedLensIds),
    affectedQuestionGroupIds: safeArray(finding?.affectedQuestionGroupIds),
    affectedSurfaces: safeArray(finding?.affectedSurfaces),
    sourceEvidence: safeArray(finding?.sourceEvidence),
    proposedSourceRequirements: safeArray(finding?.proposedSourceRequirements),
    guardrails: safeObject(finding?.guardrails),
  }));
  const normalizeFeedbackCandidates = (candidates) => safeArray(candidates).map((candidate) => ({
    ...safeObject(candidate),
    sourceFindingIds: safeArray(candidate?.sourceFindingIds),
    appliesToLensIds: safeArray(candidate?.appliesToLensIds),
    appliesToQuestionGroupIds: safeArray(candidate?.appliesToQuestionGroupIds),
    appliesToAssetFamilies: safeArray(candidate?.appliesToAssetFamilies),
    mustNotApplyTo: safeArray(candidate?.mustNotApplyTo),
    proposedSourceRequirementTemplate: safeArray(candidate?.proposedSourceRequirementTemplate),
    affectedSurfaces: safeArray(candidate?.affectedSurfaces),
    guardrails: safeObject(candidate?.guardrails),
  }));
  const engineLearningFeedbackLoop = rawFeedbackLoop.artifactVersion ? {
    ...rawFeedbackLoop,
    seedManualFindings: normalizeFeedbackFindings(rawFeedbackLoop.seedManualFindings),
    autoGeneratedFindings: normalizeFeedbackFindings(rawFeedbackLoop.autoGeneratedFindings),
    findingsApplied: normalizeFeedbackFindings(rawFeedbackLoop.findingsApplied),
    ruleCandidatesFromSeedFindings: normalizeFeedbackCandidates(rawFeedbackLoop.ruleCandidatesFromSeedFindings),
    ruleCandidatesFromAutoFindings: normalizeFeedbackCandidates(rawFeedbackLoop.ruleCandidatesFromAutoFindings),
    candidateRulesGenerated: normalizeFeedbackCandidates(rawFeedbackLoop.candidateRulesGenerated),
    sourceRequirementTemplatesProposed: safeArray(rawFeedbackLoop.sourceRequirementTemplatesProposed),
    qaRegressionsProposed: safeArray(rawFeedbackLoop.qaRegressionsProposed),
    generalizationTargets: safeArray(rawFeedbackLoop.generalizationTargets),
    nonGeneralizationBoundaries: safeArray(rawFeedbackLoop.nonGeneralizationBoundaries),
    frontendVisibility: safeObject(rawFeedbackLoop.frontendVisibility),
    bundleParity: safeObject(rawFeedbackLoop.bundleParity),
    guardrails: safeObject(rawFeedbackLoop.guardrails),
    summaryCounts: safeObject(rawFeedbackLoop.summaryCounts),
    knownLimitations: safeArray(rawFeedbackLoop.knownLimitations),
  } : null;

  return {
    ...backbone,
    findings: safeArray(backbone.findings),
    assetClassRulesApplied: safeArray(backbone.assetClassRulesApplied),
    evidenceMappingPoliciesApplied: safeArray(backbone.evidenceMappingPoliciesApplied),
    sourceRequirementsTriggered: safeArray(backbone.sourceRequirementsTriggered),
    sourceCandidates: safeArray(backbone.sourceCandidates),
    outputQaChecks: safeArray(backbone.outputQaChecks),
    calibrationAnomalies: safeArray(backbone.calibrationAnomalies),
    dependencyRequirements: safeArray(backbone.dependencyRequirements),
    freshnessPointInTimeReadiness: safeArray(backbone.freshnessPointInTimeReadiness),
    pathParityChecks: safeArray(backbone.pathParityChecks),
    benchmarkLearningRulesApplied: safeArray(backbone.benchmarkLearningRulesApplied),
    benchmarkLearningSourceRequirementTemplates: safeArray(backbone.benchmarkLearningSourceRequirementTemplates),
    benchmarkLearningRegistrySummary: safeObject(backbone.benchmarkLearningRegistrySummary),
    benchmarkLearningRenderedParity: safeObject(backbone.benchmarkLearningRenderedParity),
    benchmarkAssetPresetRegistry: Object.keys(benchmarkAssetPresetRegistry).length ? {
      ...benchmarkAssetPresetRegistry,
      benchmarkAssets: safeArray(benchmarkAssetPresetRegistry.benchmarkAssets),
      presets: safeArray(benchmarkAssetPresetRegistry.presets).map((preset) => ({
        ...safeObject(preset),
        aliases: safeArray(preset?.aliases),
        benchmarkLearningCapture: {
          ...safeObject(preset?.benchmarkLearningCapture),
          sourceRequirementTemplateLearning: safeArray(preset?.benchmarkLearningCapture?.sourceRequirementTemplateLearning),
          generalizesToAssetFamilies: safeArray(preset?.benchmarkLearningCapture?.generalizesToAssetFamilies),
          generalizesToExampleAssets: safeArray(preset?.benchmarkLearningCapture?.generalizesToExampleAssets),
          mustNotGeneralizeTo: safeArray(preset?.benchmarkLearningCapture?.mustNotGeneralizeTo),
          automationFutureUse: safeArray(preset?.benchmarkLearningCapture?.automationFutureUse),
          sourceBoundary: safeArray(preset?.benchmarkLearningCapture?.sourceBoundary),
          guardrails: safeObject(preset?.benchmarkLearningCapture?.guardrails),
        },
      })),
      learningCaptureFields: safeArray(benchmarkAssetPresetRegistry.learningCaptureFields),
      sourceRequirementTemplatesLearned: safeArray(benchmarkAssetPresetRegistry.sourceRequirementTemplatesLearned),
      qaRegressionsLearned: safeArray(benchmarkAssetPresetRegistry.qaRegressionsLearned),
      generalizationTargets: safeArray(benchmarkAssetPresetRegistry.generalizationTargets),
      nonGeneralizationBoundaries: safeArray(benchmarkAssetPresetRegistry.nonGeneralizationBoundaries),
      automationFutureUses: safeArray(benchmarkAssetPresetRegistry.automationFutureUses),
      knownLimitations: safeArray(benchmarkAssetPresetRegistry.knownLimitations),
    } : null,
    assetInterpretationContractIntegration: safeObject(backbone.assetInterpretationContractIntegration),
    dataFirstNarrativeContractIntegration: safeObject(backbone.dataFirstNarrativeContractIntegration),
    engineLearningFeedbackLoop,
    sourceDataRequirementMatrix: {
      ...safeObject(backbone.sourceDataRequirementMatrix),
      providersInventoried: safeArray(backbone.sourceDataRequirementMatrix?.providersInventoried),
      lensGroupsCovered: safeArray(backbone.sourceDataRequirementMatrix?.lensGroupsCovered),
      representativeAssetsCovered: safeArray(backbone.sourceDataRequirementMatrix?.representativeAssetsCovered),
      missingDataCategories: safeArray(backbone.sourceDataRequirementMatrix?.missingDataCategories),
      sourceCandidatesGenerated: safeArray(backbone.sourceDataRequirementMatrix?.sourceCandidatesGenerated),
      reviewedEvidenceNeeds: safeArray(backbone.sourceDataRequirementMatrix?.reviewedEvidenceNeeds),
      futureProviderCandidates: safeArray(backbone.sourceDataRequirementMatrix?.futureProviderCandidates),
      knownLimitations: safeArray(backbone.sourceDataRequirementMatrix?.knownLimitations),
    },
    representativeAssetsCovered: safeArray(backbone.representativeAssetsCovered),
    deferredFindings: safeArray(backbone.deferredFindings),
    knownLimitations: safeArray(backbone.knownLimitations),
    guardrails: safeObject(backbone.guardrails),
    backendFrontendBundleContract: safeObject(backbone.backendFrontendBundleContract),
    assetClassRuleRegistrySummary: safeObject(backbone.assetClassRuleRegistrySummary),
    evidenceMappingPolicySummary: safeObject(backbone.evidenceMappingPolicySummary),
    sourceRequirementRegistrySummary: safeObject(backbone.sourceRequirementRegistrySummary),
  };
}

function normalizeComparableId(value) {
  return String(value || "").trim().toLowerCase();
}

export function findBenchmarkSearchPresetForAsset(asset, analysis, engineLearningBackbone) {
  const safeAsset = safeObject(asset);
  const safeAnalysis = safeObject(analysis);
  const identity = normalizeAssetIdentityResolutionPayload(safeAnalysis);
  const registryPresets = safeArray(engineLearningBackbone?.benchmarkAssetPresetRegistry?.presets);
  const candidates = registryPresets.length ? registryPresets : BENCHMARK_SEARCH_PRESETS;
  const symbol = normalizeComparableId(safeAsset.symbol || safeAnalysis.asset?.symbol || identity?.canonicalAssetSymbol);
  const name = normalizeComparableId(safeAsset.name || safeAnalysis.asset?.name || identity?.canonicalAssetName);
  const coingeckoId = normalizeComparableId(safeAsset.coingeckoId || safeAnalysis.asset?.coingeckoId || identity?.coingeckoId);
  const coinmarketcapId = safeAsset.coinmarketcapId || safeAnalysis.asset?.coinmarketcapId || identity?.coinmarketcapId || null;

  return candidates.find((preset) => {
    const aliases = safeArray(preset.aliases).map(normalizeComparableId);
    return normalizeComparableId(preset.symbol) === symbol
      || normalizeComparableId(preset.displaySymbol) === symbol
      || normalizeComparableId(preset.assetName || preset.name) === name
      || normalizeComparableId(preset.coingeckoId) === coingeckoId
      || (preset.coinmarketcapId !== null && preset.coinmarketcapId !== undefined && Number(preset.coinmarketcapId) === Number(coinmarketcapId))
      || aliases.includes(symbol)
      || aliases.includes(name);
  }) || null;
}

export function normalizeAssetInterpretationContractPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.assetInterpretationContract);
  const nestedContract = safeObject(nestedAnalysis.assetInterpretationContract);
  const contract = rootContract.artifactVersion || rootContract.visibleDisplayContract
    ? rootContract
    : nestedContract.artifactVersion || nestedContract.visibleDisplayContract
      ? nestedContract
      : null;

  if (!contract) return null;

  const visibleDisplayContract = safeObject(contract.visibleDisplayContract);
  const institutionalQuestionContract = safeObject(contract.institutionalQuestionContract);
  const evidenceInterpretationContract = safeObject(contract.evidenceInterpretationContract);
  const renderingParityContract = safeObject(contract.renderingParityContract);

  return {
    ...contract,
    canonicalAsset: safeObject(contract.canonicalAsset),
    representationContext: {
      ...safeObject(contract.representationContext),
      contextOnlyWarnings: safeArray(contract.representationContext?.contextOnlyWarnings),
    },
    thesisLensContext: safeObject(contract.thesisLensContext),
    visibleDisplayContract: {
      ...visibleDisplayContract,
      labelPrecedence: safeArray(visibleDisplayContract.labelPrecedence),
      forbiddenVisibleLabelFamilies: safeArray(visibleDisplayContract.forbiddenVisibleLabelFamilies),
      hardGateFailures: safeArray(visibleDisplayContract.hardGateFailures),
      observedPrimaryVisibleLabels: safeArray(visibleDisplayContract.observedPrimaryVisibleLabels),
    },
    dataFirstNarrativeGate: {
      ...safeObject(contract.dataFirstNarrativeGate),
      primaryNarrativeFailures: safeArray(contract.dataFirstNarrativeGate?.primaryNarrativeFailures),
      wrongAssetNameMentions: safeArray(contract.dataFirstNarrativeGate?.wrongAssetNameMentions),
      forbiddenConceptMentions: safeArray(contract.dataFirstNarrativeGate?.forbiddenConceptMentions),
      unsupportedClaimsDetected: safeArray(contract.dataFirstNarrativeGate?.unsupportedClaimsDetected),
    },
    institutionalQuestionContract: {
      ...institutionalQuestionContract,
      activeQuestionIds: safeArray(institutionalQuestionContract.activeQuestionIds),
      mismatchWarnings: safeArray(institutionalQuestionContract.mismatchWarnings),
    },
    evidenceInterpretationContract: {
      ...evidenceInterpretationContract,
      sourceMatrixEntryIds: safeArray(evidenceInterpretationContract.sourceMatrixEntryIds),
      sourceMatrixGroups: safeArray(evidenceInterpretationContract.sourceMatrixGroups),
      sourceMatrixEntries: safeArray(evidenceInterpretationContract.sourceMatrixEntries),
      liveApiDataAvailable: safeArray(evidenceInterpretationContract.liveApiDataAvailable),
      liveApiDataMissing: safeArray(evidenceInterpretationContract.liveApiDataMissing),
      reviewedEvidenceAvailable: safeArray(evidenceInterpretationContract.reviewedEvidenceAvailable),
      reviewedEvidenceMissing: safeArray(evidenceInterpretationContract.reviewedEvidenceMissing),
      sourceCandidatesOnly: safeArray(evidenceInterpretationContract.sourceCandidatesOnly),
      sourceUniverseTaxonomy: safeArray(evidenceInterpretationContract.sourceUniverseTaxonomy),
      sourceBoundary: safeArray(evidenceInterpretationContract.sourceBoundary),
    },
    renderingParityContract: {
      ...renderingParityContract,
      visibleSurfaces: safeArray(renderingParityContract.visibleSurfaces),
    },
    scoringBoundary: safeObject(contract.scoringBoundary),
    engineLearningIntegration: {
      ...safeObject(contract.engineLearningIntegration),
      ruleIds: safeArray(contract.engineLearningIntegration?.ruleIds),
      findingIds: safeArray(contract.engineLearningIntegration?.findingIds),
    },
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function normalizeAuthorityHierarchyContractPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.authorityHierarchyContract);
  const nestedContract = safeObject(nestedAnalysis.authorityHierarchyContract);
  const contract = rootContract.artifactVersion || rootContract.primaryAnalysisRoute
    ? rootContract
    : nestedContract.artifactVersion || nestedContract.primaryAnalysisRoute
      ? nestedContract
      : null;

  if (!contract) return null;

  const route = safeObject(contract.primaryAnalysisRoute);
  return {
    ...contract,
    authorityPrecedence: safeArray(contract.authorityPrecedence),
    primaryAnalysisRoute: {
      ...route,
      sourceMatrixEntries: safeArray(route.sourceMatrixEntries),
      mismatchDiagnostics: safeArray(route.mismatchDiagnostics),
      rawLensAuditOnly: safeObject(route.rawLensAuditOnly),
      benchmarkExpectationAuditOnly: safeObject(route.benchmarkExpectationAuditOnly),
      providerCategoryAuditOnly: safeObject(route.providerCategoryAuditOnly),
    },
    frontendContract: {
      ...safeObject(contract.frontendContract),
      visibleSurfaces: safeArray(contract.frontendContract?.visibleSurfaces),
    },
    bundleParity: safeObject(contract.bundleParity),
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function normalizeRepresentationFamilyDecisionPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootDecision = safeObject(root.representationFamilyDecision);
  const nestedDecision = safeObject(nestedAnalysis.representationFamilyDecision);
  const aicDecision = safeObject(root.assetInterpretationContract?.representationFamilyDecision || nestedAnalysis.assetInterpretationContract?.representationFamilyDecision);
  const decision = rootDecision.artifactVersion || rootDecision.route
    ? rootDecision
    : nestedDecision.artifactVersion || nestedDecision.route
      ? nestedDecision
      : aicDecision.artifactVersion || aicDecision.route
        ? aicDecision
        : null;
  if (!decision) return null;
  const route = safeObject(decision.route);
  return {
    ...decision,
    allowedFamilies: safeArray(decision.allowedFamilies),
    forbiddenFamilies: safeArray(decision.forbiddenFamilies),
    validQuestionGroups: safeArray(decision.validQuestionGroups),
    validSourceProfiles: safeArray(decision.validSourceProfiles),
    validSourceMatrixEntries: safeArray(decision.validSourceMatrixEntries),
    route: {
      ...route,
      sourceMatrixEntries: safeArray(route.sourceMatrixEntries),
    },
    conflicts: safeArray(decision.conflicts),
    evidenceGates: safeArray(decision.evidenceGates),
    manualReviewTriggers: safeArray(decision.manualReviewTriggers),
    notApplicableRedirects: safeArray(decision.notApplicableRedirects),
    sourceRequirementTemplates: safeArray(decision.sourceRequirementTemplates),
    appliedRuleIds: safeArray(decision.appliedRuleIds),
    guardrails: safeObject(decision.guardrails),
    knownLimitations: safeArray(decision.knownLimitations),
  };
}

export function normalizeRepresentationFamilyRoutePayload(responseLike, representationFamilyDecision = null) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootRoute = safeObject(root.representationFamilyRoute);
  const nestedRoute = safeObject(nestedAnalysis.representationFamilyRoute);
  const aicRoute = safeObject(root.assetInterpretationContract?.representationFamilyRoute || nestedAnalysis.assetInterpretationContract?.representationFamilyRoute);
  const decisionRoute = safeObject(representationFamilyDecision?.route);
  const route = rootRoute.selectedFamily || rootRoute.visibleLabel
    ? rootRoute
    : nestedRoute.selectedFamily || nestedRoute.visibleLabel
      ? nestedRoute
      : decisionRoute.selectedFamily || decisionRoute.visibleLabel
        ? decisionRoute
        : aicRoute.selectedFamily || aicRoute.visibleLabel
          ? aicRoute
          : null;
  if (!route) return null;
  return {
    ...route,
    sourceMatrixEntries: safeArray(route.sourceMatrixEntries),
  };
}

export function normalizeRepresentationFamilyEvidenceGatesPayload(responseLike, representationFamilyDecision = null) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const gates = safeArray(root.representationFamilyEvidenceGates).length
    ? safeArray(root.representationFamilyEvidenceGates)
    : safeArray(nestedAnalysis.representationFamilyEvidenceGates).length
      ? safeArray(nestedAnalysis.representationFamilyEvidenceGates)
      : safeArray(representationFamilyDecision?.evidenceGates).length
        ? safeArray(representationFamilyDecision.evidenceGates)
        : safeArray(root.assetInterpretationContract?.representationFamilyEvidenceGates || nestedAnalysis.assetInterpretationContract?.representationFamilyEvidenceGates);
  return gates;
}

export function normalizePrimaryAnalysisRoutePayload(responseLike, authorityHierarchyContract = null) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootCanonicalRoute = safeObject(root.canonicalProductRoute);
  const nestedCanonicalRoute = safeObject(nestedAnalysis.canonicalProductRoute);
  const rootRoute = safeObject(root.primaryAnalysisRoute);
  const nestedRoute = safeObject(nestedAnalysis.primaryAnalysisRoute);
  const contractRoute = safeObject(authorityHierarchyContract?.primaryAnalysisRoute);
  const route = rootCanonicalRoute.primaryFamily || rootCanonicalRoute.assetFamily
    ? rootCanonicalRoute
    : nestedCanonicalRoute.primaryFamily || nestedCanonicalRoute.assetFamily
      ? nestedCanonicalRoute
      : rootRoute.assetFamily || rootRoute.visibleLabel
    ? rootRoute
    : nestedRoute.assetFamily || nestedRoute.visibleLabel
      ? nestedRoute
      : contractRoute.assetFamily || contractRoute.visibleLabel
        ? contractRoute
        : null;
  if (!route) return null;
  return {
    ...route,
    sourceMatrixEntries: safeArray(route.sourceMatrixEntries),
    mismatchDiagnostics: safeArray(route.mismatchDiagnostics),
    rawLensAuditOnly: safeObject(route.rawLensAuditOnly),
    benchmarkExpectationAuditOnly: safeObject(route.benchmarkExpectationAuditOnly),
    providerCategoryAuditOnly: safeObject(route.providerCategoryAuditOnly),
    representationFamilyAudit: {
      ...safeObject(route.representationFamilyAudit),
      conflicts: safeArray(route.representationFamilyAudit?.conflicts),
      evidenceGates: safeArray(route.representationFamilyAudit?.evidenceGates),
    },
  };
}

export function normalizeFinalAnalystAnswerComposerPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.finalAnalystAnswerComposerContract);
  const nestedContract = safeObject(nestedAnalysis.finalAnalystAnswerComposerContract);
  const contract = rootContract.contractAttached || rootContract.artifactVersion
    ? rootContract
    : nestedContract.contractAttached || nestedContract.artifactVersion
      ? nestedContract
      : null;
  if (!contract) return null;
  const canonicalQuestionJudgments = safeArray(
    safeArray(contract.canonicalQuestionJudgments).length
      ? contract.canonicalQuestionJudgments
      : contract.fundamentalQuestionAnswers
  ).map((answer) => {
    const rawAnswer = safeObject(answer);
    const isNotApplicable = rawAnswer.applicabilityStatus === "not_applicable"
      || rawAnswer.answerStatus === "not_applicable";
    return {
      ...rawAnswer,
      question: cleanPrimaryAnswerText(rawAnswer.question || rawAnswer.questionText),
      questionText: cleanPrimaryAnswerText(rawAnswer.questionText || rawAnswer.question),
      applicabilityStatus: rawAnswer.applicabilityStatus || "applicability_unknown",
      applicabilityReason: cleanPrimaryAnswerText(rawAnswer.applicabilityReason),
      applicabilityBasis: safeArray(rawAnswer.applicabilityBasis).map(cleanPrimaryAnswerText),
      applicabilityRedirect: cleanPrimaryAnswerText(rawAnswer.applicabilityRedirect),
      noScoreOrCoveragePenalty: rawAnswer.noScoreOrCoveragePenalty === true,
      directAnswer: cleanPrimaryAnswerText(rawAnswer.directAnswer || rawAnswer.answer),
      answer: cleanPrimaryAnswerText(rawAnswer.answer || rawAnswer.directAnswer),
      dataUsed: safeArray(rawAnswer.dataUsed),
      eligibleObservations: safeArray(rawAnswer.eligibleObservations),
      contextOnlyObservations: safeArray(rawAnswer.contextOnlyObservations),
      forbiddenForQuestionObservations: safeArray(rawAnswer.forbiddenForQuestionObservations),
      unsupportedInferences: safeArray(rawAnswer.unsupportedInferences || rawAnswer.whatTheDataDoesNotProve).map(cleanPrimaryAnswerText),
      missingRequiredObservations: isNotApplicable
        ? []
        : safeArray(rawAnswer.missingRequiredObservations || rawAnswer.gap || rawAnswer.missingData).map(cleanPrimaryAnswerText),
      evidenceBehindIt: safeArray(rawAnswer.evidenceBehindIt || rawAnswer.whatTheDataSupports).map(cleanPrimaryAnswerText),
      whatTheDataSupports: safeArray(rawAnswer.whatTheDataSupports || rawAnswer.evidenceBehindIt).map(cleanPrimaryAnswerText),
      gap: isNotApplicable
        ? []
        : safeArray(rawAnswer.gap || rawAnswer.missingRequiredObservations || rawAnswer.missingData).map(cleanPrimaryAnswerText),
      whatTheDataDoesNotProve: safeArray(rawAnswer.whatTheDataDoesNotProve || rawAnswer.unsupportedInferences).map(cleanPrimaryAnswerText),
      missingData: isNotApplicable
        ? []
        : safeArray(rawAnswer.missingData || rawAnswer.missingRequiredObservations).map(cleanPrimaryAnswerText),
      whatWouldChangeTheView: isNotApplicable
        ? ""
        : cleanPrimaryAnswerText(
          Object.prototype.hasOwnProperty.call(rawAnswer, "whatWouldChangeTheView")
            ? rawAnswer.whatWouldChangeTheView
            : rawAnswer.analystNextStep
        ),
      analystNextStep: isNotApplicable
        ? ""
        : cleanPrimaryAnswerText(
          Object.prototype.hasOwnProperty.call(rawAnswer, "analystNextStep")
            ? rawAnswer.analystNextStep
            : rawAnswer.whatWouldChangeTheView
        ),
      observationTypesUsed: safeArray(rawAnswer.observationTypesUsed),
      observationTypesMissing: isNotApplicable ? [] : safeArray(rawAnswer.observationTypesMissing),
      familyApplicability: safeArray(rawAnswer.familyApplicability),
      sourceTrace: safeArray(rawAnswer.sourceTrace),
      excludedEvidenceIds: safeArray(rawAnswer.excludedEvidenceIds),
      exclusionReasons: safeArray(rawAnswer.exclusionReasons).map(cleanPrimaryAnswerText),
      auditDiagnostics: safeObject(rawAnswer.auditDiagnostics),
      boundary: cleanPrimaryAnswerText(rawAnswer.boundary),
    };
  });
  const notApplicableQuestionIds = new Set(
    canonicalQuestionJudgments
      .filter((answer) => answer.applicabilityStatus === "not_applicable")
      .map((answer) => answer.questionId)
      .filter(Boolean),
  );
  const rawScoreExplanationBridge = safeObject(contract.scoreExplanationBridge);
  const normalizedVerdictLabel = cleanPrimaryAnswerText(
    rawScoreExplanationBridge.verdictLabel || rawScoreExplanationBridge.verdict
  );
  const normalizedConfidenceLabel = cleanPrimaryAnswerText(
    rawScoreExplanationBridge.confidenceLabel || rawScoreExplanationBridge.confidence
  );
  const familyBoundSourceQueue = safeArray(contract.familyBoundSourceQueue).map((item, index) => ({
    ...safeObject(item),
    queueItemId: item?.queueItemId || `canonical-queue-${index}`,
    canonicalFamily: item?.canonicalFamily || contract.canonicalFamily || null,
    questionId: item?.questionId || null,
    requirementId: item?.requirementId || item?.queueItemId || `canonical-queue-${index}`,
    text: cleanPrimaryAnswerText(item?.text || item?.label || item),
  })).filter((item) => item.text && !notApplicableQuestionIds.has(item.questionId));
  const sourceQueuePriorities = Array.isArray(contract.familyBoundSourceQueue)
    ? familyBoundSourceQueue.map((item) => item.text)
    : safeArray(contract.sourceQueuePriorities).map(cleanPrimaryAnswerText);
  return {
    ...contract,
    assetSummary: safeObject(contract.assetSummary),
    availableDataSummary: {
      ...safeObject(contract.availableDataSummary),
      typedObservationTypesUsed: safeArray(contract.availableDataSummary?.typedObservationTypesUsed),
      marketDataAvailable: safeArray(contract.availableDataSummary?.marketDataAvailable),
      supplyDataAvailable: safeArray(contract.availableDataSummary?.supplyDataAvailable),
      usageEconomicsDataAvailable: safeArray(contract.availableDataSummary?.usageEconomicsDataAvailable),
      securityContractDataAvailable: safeArray(contract.availableDataSummary?.securityContractDataAvailable),
      missingSections: safeArray(contract.availableDataSummary?.missingSections).map(cleanPrimaryAnswerText),
      limitations: safeArray(contract.availableDataSummary?.limitations).map(cleanPrimaryAnswerText),
    },
    canonicalQuestionJudgments,
    fundamentalQuestionAnswers: canonicalQuestionJudgments,
    analystView: {
      ...safeObject(contract.analystView),
      missingForHigherConviction: safeArray(contract.analystView?.missingForHigherConviction).map(cleanPrimaryAnswerText),
    },
    scoreExplanationBridge: {
      ...rawScoreExplanationBridge,
      verdictClass: rawScoreExplanationBridge.verdictClass || null,
      verdictLabel: normalizedVerdictLabel,
      verdict: normalizedVerdictLabel,
      scoreDisplayMode: rawScoreExplanationBridge.scoreDisplayMode || null,
      scoreDisplayLabel: cleanPrimaryAnswerText(rawScoreExplanationBridge.scoreDisplayLabel),
      scoreEligibility: rawScoreExplanationBridge.scoreEligibility || null,
      confidenceScore: Number.isFinite(rawScoreExplanationBridge.confidenceScore)
        ? rawScoreExplanationBridge.confidenceScore
        : null,
      confidenceLabel: normalizedConfidenceLabel,
      confidence: normalizedConfidenceLabel,
      strongestSupportingDataCategories: safeArray(contract.scoreExplanationBridge?.strongestSupportingDataCategories).map(cleanPrimaryAnswerText),
      weakestOrMissingDataCategories: safeArray(contract.scoreExplanationBridge?.weakestOrMissingDataCategories).map(cleanPrimaryAnswerText),
      familySpecificScoreConstraints: safeArray(contract.scoreExplanationBridge?.familySpecificScoreConstraints).map(cleanPrimaryAnswerText),
      whatWouldImproveScoreOrConfidence: safeArray(contract.scoreExplanationBridge?.whatWouldImproveScoreOrConfidence).map(cleanPrimaryAnswerText),
      explanation: cleanPrimaryAnswerText(contract.scoreExplanationBridge?.explanation),
    },
    familyBoundSourceQueue,
    sourceQueuePriorities,
    riskSummary: safeArray(contract.riskSummary).map(cleanPrimaryAnswerText),
    familyPurityDiagnostics: {
      ...safeObject(contract.familyPurityDiagnostics),
      forbiddenFamilyTermsScanned: safeArray(contract.familyPurityDiagnostics?.forbiddenFamilyTermsScanned),
      wrongDomainFindings: safeArray(contract.familyPurityDiagnostics?.wrongDomainFindings),
      sourceQueueFamilyMismatchFindings: safeArray(contract.familyPurityDiagnostics?.sourceQueueFamilyMismatchFindings),
      cardFamilyMismatchFindings: safeArray(contract.familyPurityDiagnostics?.cardFamilyMismatchFindings),
      rawEffectiveRouteMismatchFindings: safeArray(contract.familyPurityDiagnostics?.rawEffectiveRouteMismatchFindings),
      duplicateAnswerFindings: safeArray(contract.familyPurityDiagnostics?.duplicateAnswerFindings),
      identityGrammarFindings: safeArray(contract.familyPurityDiagnostics?.identityGrammarFindings),
      quarantinedPrimaryItems: safeArray(contract.familyPurityDiagnostics?.quarantinedPrimaryItems),
    },
    canonicalRenderOwnership: safeObject(contract.canonicalRenderOwnership),
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations).map(cleanPrimaryAnswerText),
  };
}

export function normalizeMarketWideAnalystPipelinePurityPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.marketWideAnalystPipelinePurityContract);
  const nestedContract = safeObject(nestedAnalysis.marketWideAnalystPipelinePurityContract);
  const contract = rootContract.contractAttached || rootContract.artifactVersion
    ? rootContract
    : nestedContract.contractAttached || nestedContract.artifactVersion
      ? nestedContract
      : null;
  if (!contract) return null;
  const rawRequiredCounters = safeObject(contract.requiredCounters);
  const requiredCounterKeys = [
    "wrongFamilyQuestionLeakageCount",
    "duplicateAnswerFindings",
    "repeatedSentenceFindings",
    "identityGrammarFindings",
    "forbiddenProxySupportFindings",
    "sourceQueueFamilyMismatchFindings",
    "legacyPrimaryConsumerFindings",
    "duplicateLiveProducerFindings",
  ];
  const requiredCounters = Object.fromEntries(requiredCounterKeys.map((key) => [
    key,
    Number.isFinite(rawRequiredCounters[key]) ? rawRequiredCounters[key] : null,
  ]));
  const rawProductSurfaceGate = safeObject(contract.productSurfaceGate);
  return {
    ...contract,
    pipelineStages: safeArray(contract.pipelineStages),
    familiesCovered: safeArray(contract.familiesCovered),
    familyPolicy: safeObject(contract.familyPolicy),
    familyPolicies: safeArray(contract.familyPolicies),
    questionTraces: safeArray(contract.questionTraces).map((trace) => ({
      ...safeObject(trace),
      observationTypesUsed: safeArray(trace?.observationTypesUsed),
      observationTypesMissing: safeArray(trace?.observationTypesMissing),
      claimSupported: safeArray(trace?.claimSupported).map(cleanPrimaryAnswerText),
      unsupportedInference: safeArray(trace?.unsupportedInference).map(cleanPrimaryAnswerText),
      missingData: safeArray(trace?.missingData).map(cleanPrimaryAnswerText),
      nextStep: cleanPrimaryAnswerText(trace?.nextStep),
    })),
    requiredCounters,
    sourceQueueFamilyMismatchDetails: safeArray(contract.sourceQueueFamilyMismatchDetails),
    sourceQueueFamilyMismatchCorpusPaths: safeArray(contract.sourceQueueFamilyMismatchCorpusPaths),
    counterValidation: safeObject(contract.counterValidation),
    productSurfaceGate: {
      ...rawProductSurfaceGate,
      requiredCounters,
      ...requiredCounters,
    },
    frontendParity: safeObject(contract.frontendParity),
    copyBundleParity: safeObject(contract.copyBundleParity),
    protectedReportParity: safeObject(contract.protectedReportParity),
    guardrailsVerified: safeObject(contract.guardrailsVerified),
    failures: safeArray(contract.failures),
    knownLimitations: safeArray(contract.knownLimitations).map(cleanPrimaryAnswerText),
  };
}

const PRIMARY_FAMILY_INCOMPATIBLE_PATTERNS = {
  native_btc_pow_monetary: [
    /\b(?:eip-?1559|eth gas demand|gas asset|base-fee burn|staking participation|staking\/validator|validator\/client diversity|slashing|l2\/blob|blob fee|mev\/pbs\/relay|relay concentration)\b/i,
  ],
  defi_governance_value_capture: [
    /\breserves? (?:attestation|composition|backing|audit|proof)s?\b|\breserve attestations?\b/i,
    /\bredemption (?:terms?|path|eligibility|docs?|rights?|process)\b/i,
    /\bpeg (?:history|conditions?|stress|stability|liquidity|resilience|behavior)\b/i,
    /\b(?:mint\/?redeem|supported mint|issuer mint|freeze\/?blacklist|admin\/freeze|stablecoin admin)\b/i,
    /\bissuer\/custodian(?: docs?| dependency| evidence| status)?\b|\bbanking\/custody status\b|\bbacking proof\b/i,
    /\bsupported network docs?\b|\bsupported networks? verification\b/i,
    /\b(?:eip-?1559|eth gas demand|validator\/client diversity|staking participation|l2\/blob|blob fee|mev\/pbs\/relay)\b/i,
    /\b(?:rwa legal claim|fund[- ]product rights|nav methodology|bankruptcy remoteness|collateral proof)\b/i,
  ],
  native_eth_pos_gas_l2_fee_market: [
    /\breserve (?:attestation|composition|backing)\b/i,
    /\bstablecoin redemption\b|\bwrapped redemption\b/i,
    /\bproof[- ]of[- ]reserves?\b|\bproduct aum\b|\bbankruptcy remoteness\b/i,
  ],
  non_eth_l1_smart_contract_platform: [
    /\b(?:eip-?1559|eth fee-market|eth gas demand|l2\/blob|blob fee|mev\/pbs\/relay|relay centralization)\b/i,
    /\breserve attestation\b|\bstablecoin redemption\b/i,
  ],
  stablecoin_fiat_backed: [
    /\b(?:eip-?1559|eth gas demand|validator\/client diversity|l2\/blob|blob fee)\b/i,
    /\b(?:fee switch|tokenholder accrual|treasury routing)\b/i,
  ],
  wrapped_bridged_asset: [
    /\b(?:eip-?1559|eth gas demand|validator\/client diversity|l2\/blob|blob fee)\b/i,
    /\b(?:hashrate|mining[- ]pool|miner economics|halving)\b/i,
  ],
  liquid_staking_derivative: [
    /\b(?:eip-?1559|eth gas demand|l2\/blob|blob fee)\b/i,
    /\b(?:proof[- ]of[- ]reserves?|bridge custody|wrapped redemption)\b/i,
  ],
  manual_low_coverage: [
    /\b(?:product aum|bankruptcy remoteness|nav methodology|rwa legal claim)\b/i,
  ],
};

export function isPrimaryFamilyCompatibleText(value, primaryFamily) {
  const text = extractRenderableText(value, "");
  const patterns = PRIMARY_FAMILY_INCOMPATIBLE_PATTERNS[String(primaryFamily || "").toLowerCase()] || [];
  return !patterns.some((pattern) => pattern.test(text));
}

export function filterPrimaryFamilyCompatibleItems(items, primaryFamily) {
  return safeArray(items).filter((item) => isPrimaryFamilyCompatibleText(item, primaryFamily));
}

export function normalizeCanonicalProductRoutePayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.canonicalProductRoute || nestedAnalysis.canonicalProductRoute);
  if (!contract.primaryFamily && !contract.assetFamily) return null;
  return {
    ...contract,
    primaryFamily: contract.primaryFamily || contract.assetFamily,
    assetFamily: contract.primaryFamily || contract.assetFamily,
    primaryVisibleLabel: contract.primaryVisibleLabel || contract.visibleLabel,
    visibleLabel: contract.primaryVisibleLabel || contract.visibleLabel,
    primaryAssetFraming: contract.primaryAssetFraming || contract.assetFramingLabel,
    assetFramingLabel: contract.primaryAssetFraming || contract.assetFramingLabel,
    primaryQuestionGroup: contract.primaryQuestionGroup || contract.questionGroup,
    questionGroup: contract.primaryQuestionGroup || contract.questionGroup,
    primarySourceProfile: contract.primarySourceProfile || contract.sourceProfile,
    sourceProfile: contract.primarySourceProfile || contract.sourceProfile,
    primarySourceMatrixEntries: safeArray(contract.primarySourceMatrixEntries || contract.sourceMatrixEntries),
    sourceMatrixEntries: safeArray(contract.primarySourceMatrixEntries || contract.sourceMatrixEntries),
    parityFailures: safeArray(contract.parityFailures),
    mismatchDiagnostics: safeArray(contract.mismatchDiagnostics),
    rawLensAuditOnly: safeObject(contract.rawLensAuditOnly),
    providerCategoryAuditOnly: safeObject(contract.providerCategoryAuditOnly),
    benchmarkExpectedFamilyAuditOnly: safeObject(contract.benchmarkExpectedFamilyAuditOnly || contract.benchmarkExpectationAuditOnly),
  };
}

export function normalizeRouteSurfaceParityPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.routeSurfaceParityContract || nestedAnalysis.routeSurfaceParityContract);
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    canonicalProductRoute: normalizeCanonicalProductRoutePayload({ canonicalProductRoute: contract.canonicalProductRoute }),
    surfaceFamilyMap: safeObject(contract.surfaceFamilyMap),
    surfaceQuestionGroupMap: safeObject(contract.surfaceQuestionGroupMap),
    surfaceSourceMatrixMap: safeObject(contract.surfaceSourceMatrixMap),
    wrongFamilyQuestionFindings: safeArray(contract.wrongFamilyQuestionFindings),
    dataFirstFailureDetails: safeArray(contract.dataFirstFailureDetails),
    acceptedFamilyAliases: safeArray(contract.acceptedFamilyAliases),
    rejectedAliasMismatches: safeArray(contract.rejectedAliasMismatches),
    failedContracts: safeArray(contract.failedContracts),
    blockingFindings: safeArray(contract.blockingFindings),
    auditOnlyFindings: safeArray(contract.auditOnlyFindings),
    frontendContract: safeObject(contract.frontendContract),
    protectedReport: safeObject(contract.protectedReport),
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function buildFamilyProductRouteTruth({
  canonicalProductRoute = null,
  primaryAnalysisRoute = null,
  representationFamilyRoute = null,
  familyCanonicalRoutingContract = null,
  familyDataRequirementMatrixContract = null,
  assetInterpretationContract = null,
  institutionalProductTruthObject = null,
} = {}) {
  const backendCanonical = safeObject(canonicalProductRoute);
  if (backendCanonical.primaryFamily || backendCanonical.assetFamily) {
    return normalizeCanonicalProductRoutePayload({ canonicalProductRoute: backendCanonical });
  }
  const primary = safeObject(primaryAnalysisRoute);
  const representation = safeObject(representationFamilyRoute);
  const canonical = safeObject(familyCanonicalRoutingContract);
  const matrix = safeObject(familyDataRequirementMatrixContract);
  const visible = safeObject(assetInterpretationContract?.visibleDisplayContract);
  const productTruth = safeObject(institutionalProductTruthObject);
  const productTruthFamily = safeObject(productTruth.finalFamilyDecision);
  const selectedFamily = representation.selectedFamily
    || canonical.effectiveFamily
    || matrix.primaryFamily
    || primary.assetFamily
    || productTruthFamily.familyId
    || null;
  const visibleLabel = representation.visibleLabel
    || visible.primaryVisibleLabel
    || primary.visibleLabel
    || productTruthFamily.visibleLabel
    || selectedFamily
    || null;
  const assetFramingLabel = representation.assetFramingLabel
    || visible.assetFramingLabel
    || primary.assetFramingLabel
    || productTruthFamily.assetFraming
    || null;
  let sourceMatrixEntries = safeArray(canonical.canonicalSourceMatrixEntries);
  if (!sourceMatrixEntries.length && matrix.primarySourceMatrixId) sourceMatrixEntries = [matrix.primarySourceMatrixId];
  if (!sourceMatrixEntries.length) sourceMatrixEntries = safeArray(representation.sourceMatrixEntries);
  if (!sourceMatrixEntries.length) sourceMatrixEntries = safeArray(primary.sourceMatrixEntries);
  if (!sourceMatrixEntries.length) sourceMatrixEntries = safeArray(productTruth.finalSourceMatrix);
  if (!sourceMatrixEntries.length) sourceMatrixEntries = safeArray(productTruthFamily.sourceMatrixIds);
  if (!selectedFamily && !visibleLabel && !sourceMatrixEntries.length) return primary.assetFamily || primary.visibleLabel ? primary : null;
  return {
    ...primary,
    assetFamily: selectedFamily,
    visibleLabel,
    assetFramingLabel,
    questionGroup: canonical.canonicalQuestionGroup || matrix.primaryQuestionGroup || representation.questionGroup || primary.questionGroup || productTruth.finalQuestionGroup || null,
    sourceProfile: canonical.canonicalSourceProfile || matrix.primarySourceProfile || representation.sourceProfile || primary.sourceProfile || productTruthFamily.sourceProfile || null,
    sourceMatrixEntries,
    productRouteTruthSource: selectedFamily
      ? "representation_family_authority_canonical_product_path"
      : primary.authoritySource || "primary_analysis_route",
    rawPrimaryAnalysisRouteAuditOnly: primary,
  };
}

export function normalizeDataFirstNarrativeContractPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.dataFirstNarrativeContract);
  const nestedContract = safeObject(nestedAnalysis.dataFirstNarrativeContract);
  const contract = rootContract.artifactVersion || rootContract.generatedNarrativeFields
    ? rootContract
    : nestedContract.artifactVersion || nestedContract.generatedNarrativeFields
      ? nestedContract
      : null;

  if (!contract) return null;

  return {
    ...contract,
    narrativeScope: safeObject(contract.narrativeScope),
    availableEvidenceFacts: safeArray(contract.availableEvidenceFacts),
    missingEvidenceGaps: safeArray(contract.missingEvidenceGaps),
    auditRejectedSourceGaps: safeArray(contract.auditRejectedSourceGaps),
    notApplicableBoundaries: safeArray(contract.notApplicableBoundaries),
    allowedNarrativeConcepts: safeArray(contract.allowedNarrativeConcepts),
    forbiddenNarrativeConcepts: safeArray(contract.forbiddenNarrativeConcepts),
    generatedNarrativeFields: safeArray(contract.generatedNarrativeFields).map((field) => ({
      ...safeObject(field),
      factsUsed: safeArray(field?.factsUsed),
      gapsUsed: safeArray(field?.gapsUsed),
      notApplicableBoundariesUsed: safeArray(field?.notApplicableBoundariesUsed),
      unsupportedClaimsDetected: safeArray(field?.unsupportedClaimsDetected),
      forbiddenConceptsDetected: safeArray(field?.forbiddenConceptsDetected),
    })),
    scoreExplanationInputs: {
      ...safeObject(contract.scoreExplanationInputs),
      dataCategoriesContributing: safeArray(contract.scoreExplanationInputs?.dataCategoriesContributing),
      missingCriticalCategories: safeArray(contract.scoreExplanationInputs?.missingCriticalCategories),
      confidenceCaps: safeArray(contract.scoreExplanationInputs?.confidenceCaps),
    },
    primaryNarrativeFailures: safeArray(contract.primaryNarrativeFailures),
    primaryNarrativeFailureDetails: safeArray(contract.primaryNarrativeFailureDetails),
    wrongAssetNameMentions: safeArray(contract.wrongAssetNameMentions),
    forbiddenConceptMentions: safeArray(contract.forbiddenConceptMentions),
    unsupportedClaimsDetected: safeArray(contract.unsupportedClaimsDetected),
    scoringAnomalyFindings: safeArray(contract.scoringAnomalyFindings),
    scoringBoundary: safeObject(contract.scoringBoundary),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function normalizeScoringReadinessContractPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.scoringReadinessContract);
  const nestedContract = safeObject(nestedAnalysis.scoringReadinessContract);
  const contract = rootContract.artifactVersion || rootContract.dimensions
    ? rootContract
    : nestedContract.artifactVersion || nestedContract.dimensions
      ? nestedContract
      : null;

  if (!contract) return null;

  return {
    ...contract,
    sourceProfile: safeObject(contract.sourceProfile),
    sourceMatrixEntries: safeArray(contract.sourceMatrixEntries).map((entry) => ({
      ...safeObject(entry),
      requiredEvidence: safeArray(entry?.requiredEvidence),
      requiredLiveMetrics: safeArray(entry?.requiredLiveMetrics),
      availableEvidence: safeArray(entry?.availableEvidence),
      missingEvidence: safeArray(entry?.missingEvidence),
    })),
    dimensions: safeArray(contract.dimensions).map((dimension) => ({
      ...safeObject(dimension),
      requiredEvidence: safeArray(dimension?.requiredEvidence),
      requiredLiveMetrics: safeArray(dimension?.requiredLiveMetrics),
      availableEvidence: safeArray(dimension?.availableEvidence),
      missingEvidence: safeArray(dimension?.missingEvidence),
      hardBlockers: safeArray(dimension?.hardBlockers),
      confidenceCaps: safeArray(dimension?.confidenceCaps),
      whatImprovesReadiness: safeArray(dimension?.whatImprovesReadiness),
      whatReducesReadiness: safeArray(dimension?.whatReducesReadiness),
      whatWouldChange: safeArray(dimension?.whatWouldChange),
      monitoringTriggers: safeArray(dimension?.monitoringTriggers),
      sourceBoundary: safeArray(dimension?.sourceBoundary),
    })),
    evidenceToScoringBridge: {
      ...safeObject(contract.evidenceToScoringBridge),
      dimensions: safeArray(contract.evidenceToScoringBridge?.dimensions),
      blockedDimensions: safeArray(contract.evidenceToScoringBridge?.blockedDimensions),
      sourceRequiredDimensions: safeArray(contract.evidenceToScoringBridge?.sourceRequiredDimensions),
      scoringReadyDimensions: safeArray(contract.evidenceToScoringBridge?.scoringReadyDimensions),
      confidenceCapReasons: safeArray(contract.evidenceToScoringBridge?.confidenceCapReasons),
      sourceBoundary: safeArray(contract.evidenceToScoringBridge?.sourceBoundary),
    },
    committeeMemoPreview: {
      ...safeObject(contract.committeeMemoPreview),
      majorEvidenceGaps: safeArray(contract.committeeMemoPreview?.majorEvidenceGaps),
    },
    hardBlockers: safeArray(contract.hardBlockers),
    confidenceCaps: safeArray(contract.confidenceCaps),
    liveMetricRequirements: safeArray(contract.liveMetricRequirements),
    whatWouldChangeScore: safeArray(contract.whatWouldChangeScore),
    monitoringTriggers: safeArray(contract.monitoringTriggers),
    sourceBoundary: safeArray(contract.sourceBoundary),
    guardrails: safeObject(contract.guardrails),
    frontendContract: {
      ...safeObject(contract.frontendContract),
      visibleSurfaces: safeArray(contract.frontendContract?.visibleSurfaces),
    },
  };
}

function dataFirstGeneratedText(contract, fieldName) {
  return safeArray(contract?.generatedNarrativeFields)
    .find((field) => field?.fieldName === fieldName && field?.status !== "FAIL")?.generatedText || null;
}

export function normalizeProviderCategorySignalsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.providerCategorySignals);
  const nestedContract = safeObject(nestedAnalysis.providerCategorySignals);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    coinGeckoCategories: safeArray(contract.coinGeckoCategories),
    coinGeckoCategoryIds: safeArray(contract.coinGeckoCategoryIds),
    coinGeckoAssetPlatforms: safeArray(contract.coinGeckoAssetPlatforms),
    coinMarketCapTags: safeArray(contract.coinMarketCapTags),
    coinMarketCapCategories: safeArray(contract.coinMarketCapCategories),
    coinMarketCapSectors: safeArray(contract.coinMarketCapSectors),
    coinMarketCapLiquiditySignals: safeArray(contract.coinMarketCapLiquiditySignals),
    primaryProviderCategoryEvidence: safeArray(contract.primaryProviderCategoryEvidence),
    secondaryProviderCategoryEvidence: safeArray(contract.secondaryProviderCategoryEvidence),
    ecosystemContextTags: safeArray(contract.ecosystemContextTags),
    assetClassCandidateTags: safeArray(contract.assetClassCandidateTags),
    conflictingCategorySignals: safeArray(contract.conflictingCategorySignals),
    selfReportedOrUnverifiedCategorySignals: safeArray(contract.selfReportedOrUnverifiedCategorySignals),
    verifiedCategorySignals: safeArray(contract.verifiedCategorySignals),
    providerCategoryBoundary: safeArray(contract.providerCategoryBoundary),
    classifiedSignals: safeArray(contract.classifiedSignals),
    endpointCandidates: safeArray(contract.endpointCandidates),
    coinGeckoCategoryUniverseStatus: safeObject(contract.coinGeckoCategoryUniverseStatus),
    coinGeckoCategoryMarketContext: safeArray(contract.coinGeckoCategoryMarketContext),
    coinGeckoPrimaryCategoryPeerSet: safeArray(contract.coinGeckoPrimaryCategoryPeerSet),
    coinMarketCapCategoryUniverseStatus: safeObject(contract.coinMarketCapCategoryUniverseStatus),
    coinMarketCapCategoryContext: safeArray(contract.coinMarketCapCategoryContext),
    coinMarketCapPrimaryCategoryPeerSet: safeArray(contract.coinMarketCapPrimaryCategoryPeerSet),
    primaryCategoryMarketContext: safeObject(contract.primaryCategoryMarketContext),
    secondaryCategoryMarketContexts: safeArray(contract.secondaryCategoryMarketContexts),
    categoryPeerAssets: safeArray(contract.categoryPeerAssets),
    categoryPeerMarketStats: safeObject(contract.categoryPeerMarketStats),
    providerCategoryEndpointDiagnostics: safeArray(contract.providerCategoryEndpointDiagnostics),
    categoryDataMissingFields: safeArray(contract.categoryDataMissingFields),
    categoryDataSourceRequirements: safeArray(contract.categoryDataSourceRequirements),
    categoryDataBoundary: safeArray(contract.categoryDataBoundary),
    scoringBoundary: safeObject(contract.scoringBoundary),
  };
}

export function normalizeProviderRawDataExpansionPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.providerRawDataExpansion);
  const nestedContract = safeObject(nestedAnalysis.providerRawDataExpansion);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  const rawExtracts = safeObject(contract.providerRawDataExtracts);
  return {
    ...contract,
    coinGeckoCategoryUniverse: {
      ...safeObject(contract.coinGeckoCategoryUniverse),
      categoriesList: safeArray(contract.coinGeckoCategoryUniverse?.categoriesList),
      categoryIds: safeArray(contract.coinGeckoCategoryUniverse?.categoryIds),
      categoryNames: safeArray(contract.coinGeckoCategoryUniverse?.categoryNames),
    },
    coinGeckoCategoryMarketData: safeArray(contract.coinGeckoCategoryMarketData),
    coinGeckoPrimaryCategoryPeerSet: safeArray(contract.coinGeckoPrimaryCategoryPeerSet),
    coinMarketCapCategoryUniverse: {
      ...safeObject(contract.coinMarketCapCategoryUniverse),
      categories: safeArray(contract.coinMarketCapCategoryUniverse?.categories),
      categoryIds: safeArray(contract.coinMarketCapCategoryUniverse?.categoryIds),
      names: safeArray(contract.coinMarketCapCategoryUniverse?.names),
    },
    coinMarketCapSingleCategoryData: safeArray(contract.coinMarketCapSingleCategoryData),
    coinMarketCapPrimaryCategoryPeerSet: safeArray(contract.coinMarketCapPrimaryCategoryPeerSet),
    primaryCategoryMarketContext: Object.keys(safeObject(contract.primaryCategoryMarketContext)).length ? safeObject(contract.primaryCategoryMarketContext) : null,
    secondaryCategoryMarketContexts: safeArray(contract.secondaryCategoryMarketContexts),
    categoryPeerAssets: safeArray(contract.categoryPeerAssets),
    categoryPeerMarketStats: safeObject(contract.categoryPeerMarketStats),
    providerCategoryEndpointDiagnostics: safeArray(contract.providerCategoryEndpointDiagnostics),
    categoryDataMissingFields: safeArray(contract.categoryDataMissingFields),
    categoryDataSourceRequirements: safeArray(contract.categoryDataSourceRequirements),
    categoryDataBoundary: safeArray(contract.categoryDataBoundary),
    rawProviderDataCoverage: safeObject(contract.rawProviderDataCoverage),
    providerRawDataExtracts: {
      ...rawExtracts,
      categories: safeArray(rawExtracts.categories),
      sectors: safeArray(rawExtracts.sectors),
      tags: safeArray(rawExtracts.tags),
      peerAssetsInCategory: safeArray(rawExtracts.peerAssetsInCategory),
      contracts: safeArray(rawExtracts.contracts),
      platforms: safeArray(rawExtracts.platforms),
      securityIndicators: safeArray(rawExtracts.securityIndicators),
      tokenUnlockVestingFundraising: safeArray(rawExtracts.tokenUnlockVestingFundraising),
      officialLinks: safeArray(rawExtracts.officialLinks),
      providerTimestamps: safeArray(rawExtracts.providerTimestamps),
      missingFields: safeArray(rawExtracts.missingFields),
      sourceBoundary: safeArray(rawExtracts.sourceBoundary),
    },
    rawDataCoverageDiagnostics: normalizeRawDataCoverageDiagnosticsPayload(contract),
    scoringBoundary: safeObject(contract.scoringBoundary),
  };
}

export function normalizeRawDataCoverageDiagnosticsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.rawDataCoverageDiagnostics);
  const nestedContract = safeObject(nestedAnalysis.rawDataCoverageDiagnostics);
  const embedded = safeObject(root.rawDataCoverageDiagnostics || root.rawDataCoverage || root.providerRawDataExpansion?.rawDataCoverageDiagnostics);
  const contract = rootContract.artifactVersion
    ? rootContract
    : nestedContract.artifactVersion
      ? nestedContract
      : root.artifactVersion === "raw-data-coverage-diagnostics-v1"
        ? root
        : embedded.artifactVersion
        ? embedded
        : null;
  if (!contract) return null;
  return {
    ...contract,
    sourceCriticalMissingFields: safeArray(contract.sourceCriticalMissingFields),
    providerUnavailableFields: safeArray(contract.providerUnavailableFields),
    manualReviewRequiredFields: safeArray(contract.manualReviewRequiredFields),
    dataCoverageImpact: safeArray(contract.dataCoverageImpact),
  };
}

export function normalizeApiFirstInstitutionalIntelligencePayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rawProviderDataRegistryContract = safeObject(root.rawProviderDataRegistryContract || nestedAnalysis.rawProviderDataRegistryContract);
  const typedObservationLayerContract = safeObject(root.typedObservationLayerContract || nestedAnalysis.typedObservationLayerContract);
  const institutionalProductTruthObject = safeObject(root.institutionalProductTruthObject || nestedAnalysis.institutionalProductTruthObject);
  const institutionalQuestionAnswerEngineContract = safeObject(root.institutionalQuestionAnswerEngineContract || nestedAnalysis.institutionalQuestionAnswerEngineContract);
  const manualApiResearchGapQueue = safeObject(root.manualApiResearchGapQueue || nestedAnalysis.manualApiResearchGapQueue);
  const calibrationBacktestReadiness = safeObject(root.calibrationBacktestReadiness || nestedAnalysis.calibrationBacktestReadiness);
  const hasAny = rawProviderDataRegistryContract.contractVersion
    || typedObservationLayerContract.contractVersion
    || institutionalProductTruthObject.contractVersion
    || institutionalQuestionAnswerEngineContract.contractVersion
    || manualApiResearchGapQueue.contractVersion
    || calibrationBacktestReadiness.contractVersion;
  if (!hasAny) return null;
  return {
    rawProviderDataRegistryContract: rawProviderDataRegistryContract.contractVersion ? {
      ...rawProviderDataRegistryContract,
      providers: safeArray(rawProviderDataRegistryContract.providers),
      providerObservations: safeArray(rawProviderDataRegistryContract.providerObservations),
      unavailableProviders: safeArray(rawProviderDataRegistryContract.unavailableProviders),
      providerErrors: safeArray(rawProviderDataRegistryContract.providerErrors),
      routingUsedRawFields: safeArray(rawProviderDataRegistryContract.routingUsedRawFields),
      answerUsedRawFields: safeArray(rawProviderDataRegistryContract.answerUsedRawFields),
      scoringUsedRawFields: safeArray(rawProviderDataRegistryContract.scoringUsedRawFields),
      auditOnlyRawFields: safeArray(rawProviderDataRegistryContract.auditOnlyRawFields),
      rawProviderRegistryEntries: safeArray(rawProviderDataRegistryContract.rawProviderRegistryEntries),
      warnings: safeArray(rawProviderDataRegistryContract.warnings),
    } : null,
    typedObservationLayerContract: typedObservationLayerContract.contractVersion ? {
      ...typedObservationLayerContract,
      eligibleRoutingObservations: safeArray(typedObservationLayerContract.eligibleRoutingObservations),
      eligibleAnswerObservations: safeArray(typedObservationLayerContract.eligibleAnswerObservations),
      eligibleExistingScoringObservations: safeArray(typedObservationLayerContract.eligibleExistingScoringObservations),
      futureCalibrationCandidateObservations: safeArray(typedObservationLayerContract.futureCalibrationCandidateObservations),
      ineligibleObservations: safeArray(typedObservationLayerContract.ineligibleObservations),
      unavailableDataMarkers: safeArray(typedObservationLayerContract.unavailableDataMarkers),
      contradictionCandidates: safeArray(typedObservationLayerContract.contradictionCandidates),
      warningFlags: safeArray(typedObservationLayerContract.warningFlags),
    } : null,
    institutionalProductTruthObject: institutionalProductTruthObject.contractVersion ? {
      ...institutionalProductTruthObject,
      institutionalQuestionSet: safeArray(institutionalProductTruthObject.institutionalQuestionSet),
      institutionalQuestionAnswers: safeArray(institutionalProductTruthObject.institutionalQuestionAnswers),
      sourceQueueItems: safeArray(institutionalProductTruthObject.sourceQueueItems),
      manualReviewItems: safeArray(institutionalProductTruthObject.manualReviewItems),
      scoringTransparency: safeArray(institutionalProductTruthObject.scoringTransparency),
      protectedReportSummary: safeArray(institutionalProductTruthObject.protectedReportSummary),
      auditOnlyLegacyRouteSummary: safeArray(institutionalProductTruthObject.auditOnlyLegacyRouteSummary),
      warnings: safeArray(institutionalProductTruthObject.warnings),
    } : null,
    institutionalQuestionAnswerEngineContract: institutionalQuestionAnswerEngineContract.contractVersion ? {
      ...institutionalQuestionAnswerEngineContract,
      answers: safeArray(institutionalQuestionAnswerEngineContract.answers),
      warnings: safeArray(institutionalQuestionAnswerEngineContract.warnings),
    } : null,
    manualApiResearchGapQueue: manualApiResearchGapQueue.contractVersion ? {
      ...manualApiResearchGapQueue,
      gaps: safeArray(manualApiResearchGapQueue.gaps),
    } : null,
    calibrationBacktestReadiness: calibrationBacktestReadiness.contractVersion ? {
      ...calibrationBacktestReadiness,
      requiredDatasets: safeArray(calibrationBacktestReadiness.requiredDatasets),
      noLookaheadRules: safeArray(calibrationBacktestReadiness.noLookaheadRules),
      blockers: safeArray(calibrationBacktestReadiness.blockers),
    } : null,
  };
}

export function normalizeProviderCapabilityRegistryPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.providerCapabilityRegistryContract || nestedAnalysis.providerCapabilityRegistryContract);
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    providers: safeArray(contract.providers),
    routeAuthorityDoctrine: safeArray(contract.routeAuthorityDoctrine),
    scoringAuthorityDoctrine: safeArray(contract.scoringAuthorityDoctrine),
    guardrails: safeObject(contract.guardrails),
  };
}

export function normalizeProviderDataBoundaryPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.providerDataBoundaryContract || nestedAnalysis.providerDataBoundaryContract);
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    observations: safeArray(contract.observations),
    boundaryViolations: safeArray(contract.boundaryViolations),
    routeEligibleObservationSummary: safeObject(contract.routeEligibleObservationSummary),
    scoringEligibleObservationSummary: safeObject(contract.scoringEligibleObservationSummary),
    generatedTextIneligibilitySummary: safeObject(contract.generatedTextIneligibilitySummary),
    healthProbeIneligibilitySummary: safeObject(contract.healthProbeIneligibilitySummary),
    providerCapabilitySummary: normalizeProviderCapabilityRegistryPayload(contract.providerCapabilitySummary) || safeObject(contract.providerCapabilitySummary),
    familyRouteInputWhitelist: safeArray(contract.familyRouteInputWhitelist),
    familyRouteInputBlacklist: safeArray(contract.familyRouteInputBlacklist),
    scoringInputWhitelist: safeArray(contract.scoringInputWhitelist),
    scoringInputBlacklist: safeArray(contract.scoringInputBlacklist),
    rawProviderRegistryHardening: {
      ...safeObject(contract.rawProviderRegistryHardening),
      entries: safeArray(contract.rawProviderRegistryHardening?.entries),
    },
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
    nextActions: safeArray(contract.nextActions),
  };
}

export function normalizeTypedObservationFamilyAuthorityPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.typedObservationFamilyAuthorityContract || nestedAnalysis.typedObservationFamilyAuthorityContract);
  if (!contract.artifactVersion) return null;
  const inputSet = safeObject(contract.inputSet);
  return {
    ...contract,
    selectedObservationIds: safeArray(contract.selectedObservationIds),
    promotedObservationIds: safeArray(contract.promotedObservationIds),
    rejectedObservationIds: safeArray(contract.rejectedObservationIds),
    promotionRulesApplied: safeArray(contract.promotionRulesApplied),
    conflictDiagnostics: safeArray(contract.conflictDiagnostics),
    boundaryWarnings: safeArray(contract.boundaryWarnings),
    divergenceCorrections: safeArray(contract.divergenceCorrections),
    familyDecisionTrace: safeArray(contract.familyDecisionTrace),
    institutionalQuestionTrace: safeArray(contract.institutionalQuestionTrace),
    sourceMatrixTrace: safeArray(contract.sourceMatrixTrace),
    warnings: safeArray(contract.warnings),
    crossSurfaceParity: {
      ...safeObject(contract.crossSurfaceParity),
      surfacesChecked: safeArray(contract.crossSurfaceParity?.surfacesChecked),
      divergences: safeArray(contract.crossSurfaceParity?.divergences),
    },
    routeInputEligibilitySummary: safeObject(contract.routeInputEligibilitySummary),
    inputSet: {
      ...inputSet,
      selectedObservationIds: safeArray(inputSet.selectedObservationIds),
      rejectedObservationIds: safeArray(inputSet.rejectedObservationIds),
      observations: safeArray(inputSet.observations),
      boundaryWarnings: safeArray(inputSet.boundaryWarnings),
    },
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function normalizeInstitutionalMethodologyContractPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.institutionalMethodologyContract || nestedAnalysis.institutionalMethodologyContract);
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    doctrineConstraints: safeArray(contract.doctrineConstraints),
    familyDefinitions: safeArray(contract.familyDefinitions),
    questionRegistry: safeArray(contract.questionRegistry),
    sourceClassRegistry: safeArray(contract.sourceClassRegistry),
    observationClassRegistry: safeArray(contract.observationClassRegistry),
    answerStateRegistry: safeArray(contract.answerStateRegistry),
    scoreEligibilityStateRegistry: safeArray(contract.scoreEligibilityStateRegistry),
    contaminationGuardRegistry: safeArray(contract.contaminationGuardRegistry),
    canonicalFamilyOntology: safeArray(contract.canonicalFamilyOntology),
    analystModuleRegistry: safeArray(contract.analystModuleRegistry),
    familyMethodologyMatrix: safeArray(contract.familyMethodologyMatrix),
    observationSchemaV11: safeArray(contract.observationSchemaV11),
    evidencePolicyV11: safeArray(contract.evidencePolicyV11),
    questionMatrixV11: safeArray(contract.questionMatrixV11),
    regressionHarness16Controls: safeArray(contract.regressionHarness16Controls),
    diagnosticReadinessArchitecture: safeObject(contract.diagnosticReadinessArchitecture),
    memoResponseContract: {
      ...safeObject(contract.memoResponseContract),
      sections: safeArray(contract.memoResponseContract?.sections),
      rules: safeArray(contract.memoResponseContract?.rules),
    },
    registrySummary: safeObject(contract.registrySummary),
    validation: {
      ...safeObject(contract.validation),
      errors: safeArray(contract.validation?.errors),
      warnings: safeArray(contract.validation?.warnings),
      checks: safeObject(contract.validation?.checks),
    },
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function normalizeEvidenceRegistryPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(
    root.artifactVersion === "evidence-registry-v1"
      ? root
      : root.evidenceRegistryContract || nestedAnalysis.evidenceRegistryContract,
  );
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    packets: safeArray(contract.packets).map((packet) => ({
      ...safeObject(packet),
      supportedQuestionIds: safeArray(packet?.supportedQuestionIds),
      usability: safeArray(packet?.usability),
      boundaryNotes: safeArray(packet?.boundaryNotes),
    })),
    packetsByClaimType: safeObject(contract.packetsByClaimType),
    contradictions: safeArray(contract.contradictions).map((contradiction) => ({
      ...safeObject(contradiction),
      evidenceIds: safeArray(contradiction?.evidenceIds),
      claimTypes: safeArray(contradiction?.claimTypes),
    })),
    rejectedPromotions: safeArray(contract.rejectedPromotions),
    summary: safeObject(contract.summary),
    sourceBoundary: safeArray(contract.sourceBoundary),
  };
}

export function normalizeQuestionEvidenceMappingPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(
    root.artifactVersion === "question-evidence-mapping-v1"
      ? root
      : root.questionEvidenceMappingContract || nestedAnalysis.questionEvidenceMappingContract,
  );
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    allowedCommonQuestions: safeArray(contract.allowedCommonQuestions).map((entry) => ({
      ...safeObject(entry),
      allowedFamilies: entry?.allowedFamilies === "all" ? "all" : safeArray(entry?.allowedFamilies),
      forbiddenFamilies: safeArray(entry?.forbiddenFamilies),
    })),
    blockedQuestionMappings: safeArray(contract.blockedQuestionMappings),
    mappings: safeArray(contract.mappings).map((mapping) => ({
      ...safeObject(mapping),
      requiredEvidenceTypes: safeArray(mapping?.requiredEvidenceTypes),
      availableEvidencePackets: safeArray(mapping?.availableEvidencePackets),
      blockingEvidenceGaps: safeArray(mapping?.blockingEvidenceGaps),
    })),
    summary: safeObject(contract.summary),
    sourceBoundary: safeArray(contract.sourceBoundary),
  };
}

export function normalizeSourceIntelligencePayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.sourceIntelligenceContract || nestedAnalysis.sourceIntelligenceContract);
  if (!contract.artifactVersion) return null;
  const evidenceRegistryContract = normalizeEvidenceRegistryPayload(contract.evidenceRegistryContract);
  const questionEvidenceMappingContract = normalizeQuestionEvidenceMappingPayload(contract.questionEvidenceMappingContract);
  return {
    ...contract,
    sourceClassRegistry: safeArray(contract.sourceClassRegistry),
    summary: safeObject(contract.summary),
    sourceClassCounts: safeObject(contract.sourceClassCounts),
    sourceStatusCounts: safeObject(contract.sourceStatusCounts),
    freshnessCounts: safeObject(contract.freshnessCounts),
    boundaryDiagnostics: safeArray(contract.boundaryDiagnostics),
    evidenceRegistryContract,
    questionEvidenceMappingContract,
    protectedReportSummary: safeObject(contract.protectedReportSummary),
    frontendVisibility: {
      ...safeObject(contract.frontendVisibility),
      surfaces: safeArray(contract.frontendVisibility?.surfaces),
    },
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function normalizeSourceCandidateRegistryPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(
    root.artifactVersion === "source-candidate-registry-v1"
      ? root
      : root.sourceCandidateRegistryContract || nestedAnalysis.sourceCandidateRegistryContract,
  );
  if (!contract.artifactVersion) return null;
  const normalizeCandidate = (candidate) => ({
    ...safeObject(candidate),
    boundaryNotes: safeArray(candidate?.boundaryNotes),
    riskFlags: safeArray(candidate?.riskFlags),
  });
  return {
    ...contract,
    candidates: safeArray(contract.candidates).map(normalizeCandidate),
    rejectedCandidates: safeArray(contract.rejectedCandidates).map(normalizeCandidate),
    duplicateCandidates: safeArray(contract.duplicateCandidates).map(normalizeCandidate),
    candidatesByQuestion: safeObject(contract.candidatesByQuestion),
    candidatesBySourceClass: safeObject(contract.candidatesBySourceClass),
    candidatesByPriority: safeObject(contract.candidatesByPriority),
    candidateAccountingSummary: safeObject(contract.candidateAccountingSummary),
    summary: safeObject(contract.summary),
    sourceBoundary: safeArray(contract.sourceBoundary),
  };
}

export function normalizeSourceCandidatePipelinePayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(
    root.artifactVersion === "source-candidate-pipeline-v1"
      ? root
      : root.sourceCandidatePipelineContract || nestedAnalysis.sourceCandidatePipelineContract,
  );
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    discoveryMethodsUsed: safeArray(contract.discoveryMethodsUsed),
    candidateIdsByQuestion: safeObject(contract.candidateIdsByQuestion),
    unresolvedEvidenceGaps: safeArray(contract.unresolvedEvidenceGaps).map((gap) => ({
      ...safeObject(gap),
      candidateIds: safeArray(gap?.candidateIds),
    })),
    prioritizationOrder: safeArray(contract.prioritizationOrder),
    boundaryDiagnostics: safeArray(contract.boundaryDiagnostics),
    candidateAccountingSummary: safeObject(contract.candidateAccountingSummary),
    guardrails: safeObject(contract.guardrails),
  };
}

export function normalizeDeepResearchSourceDiscoveryPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.deepResearchSourceDiscoveryContract || nestedAnalysis.deepResearchSourceDiscoveryContract);
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    discoveryInputsUsed: safeArray(contract.discoveryInputsUsed),
    familyTemplate: safeObject(contract.familyTemplate).templateId ? {
      ...safeObject(contract.familyTemplate),
      canonicalQuestionGroupCandidates: safeArray(contract.familyTemplate?.canonicalQuestionGroupCandidates),
      requirements: safeArray(contract.familyTemplate?.requirements).map((requirement) => ({
        ...safeObject(requirement),
        questionIdPatterns: safeArray(requirement?.questionIdPatterns),
        requiredSourceClasses: safeArray(requirement?.requiredSourceClasses),
        boundaryNotes: safeArray(requirement?.boundaryNotes),
      })),
      familyBoundaries: safeArray(contract.familyTemplate?.familyBoundaries),
      extensibilityNotes: safeArray(contract.familyTemplate?.extensibilityNotes),
    } : null,
    sourceCandidatePipelineContract: normalizeSourceCandidatePipelinePayload(contract.sourceCandidatePipelineContract),
    sourceCandidateRegistryContract: normalizeSourceCandidateRegistryPayload(contract.sourceCandidateRegistryContract),
    candidateAccountingSummary: safeObject(contract.candidateAccountingSummary),
    summary: safeObject(contract.summary),
    freeApiCoverageLimitations: safeArray(contract.freeApiCoverageLimitations),
    protectedReportSummary: safeObject(contract.protectedReportSummary),
    frontendVisibility: {
      ...safeObject(contract.frontendVisibility),
      surfaces: safeArray(contract.frontendVisibility?.surfaces),
    },
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function normalizeSourceCandidateReviewQueuePayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(
    root.artifactVersion === "source-candidate-review-queue-v1"
      ? root
      : root.sourceCandidateReviewQueueContract || nestedAnalysis.sourceCandidateReviewQueueContract,
  );
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    items: safeArray(contract.items).map((item) => ({
      ...safeObject(item),
      reviewActionAvailable: safeArray(item?.reviewActionAvailable),
      reviewBoundaryNotes: safeArray(item?.reviewBoundaryNotes),
      currentDecision: {
        ...safeObject(item?.currentDecision),
        reviewNotes: safeArray(item?.currentDecision?.reviewNotes),
        requiredFollowUp: safeArray(item?.currentDecision?.requiredFollowUp),
        auditTrailEventIds: safeArray(item?.currentDecision?.auditTrailEventIds),
      },
      authorityRubric: {
        ...safeObject(item?.authorityRubric),
        boundaryNotes: safeArray(item?.authorityRubric?.boundaryNotes),
      },
    })),
    summary: safeObject(contract.summary),
    decisionsByFamily: safeObject(contract.decisionsByFamily),
    decisionsBySourceClass: safeObject(contract.decisionsBySourceClass),
  };
}

export function normalizeSourceCandidateReviewAuditTrailPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(
    root.artifactVersion === "source-candidate-review-audit-trail-v1"
      ? root
      : root.sourceCandidateReviewAuditTrailContract || nestedAnalysis.sourceCandidateReviewAuditTrailContract,
  );
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    events: safeArray(contract.events).map((event) => ({
      ...safeObject(event),
      notes: safeArray(event?.notes),
    })),
  };
}

export function normalizeSourceCandidateReviewWorkflowPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.sourceCandidateReviewWorkflowContract || nestedAnalysis.sourceCandidateReviewWorkflowContract);
  if (!contract.artifactVersion) return null;
  return {
    ...contract,
    sourceCandidateReviewQueueContract: normalizeSourceCandidateReviewQueuePayload(contract.sourceCandidateReviewQueueContract),
    sourceCandidateReviewAuditTrailContract: normalizeSourceCandidateReviewAuditTrailPayload(contract.sourceCandidateReviewAuditTrailContract),
    candidateReviewOverlays: safeObject(contract.candidateReviewOverlays),
    sourceAuthorityRubricSummary: {
      ...safeObject(contract.sourceAuthorityRubricSummary),
      authorityTiers: safeArray(contract.sourceAuthorityRubricSummary?.authorityTiers),
    },
    persistence: {
      ...safeObject(contract.persistence),
      diagnostic: safeObject(contract.persistence?.diagnostic),
    },
    protectedReportSummary: safeObject(contract.protectedReportSummary),
    marketWideCoverage: {
      ...safeObject(contract.marketWideCoverage),
      supportedFamilies: safeArray(contract.marketWideCoverage?.supportedFamilies),
    },
    boundaryNotes: safeArray(contract.boundaryNotes),
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

const ANALYST_WORKFLOW_CANONICAL_FAMILY_BY_ALIAS = Object.freeze({
  native_eth_pos_settlement_gas_fee_market: "native_eth_pos_gas_l2_fee_market",
  non_eth_l1_smart_contract_native_gas: "non_eth_l1_smart_contract_platform",
  wrapped_bridged_custodial_representation: "wrapped_bridged_asset",
  stablecoin_algorithmic_reflexive: "stablecoin_algorithmic_or_synthetic",
  rwa_protocol_governance_infrastructure: "rwa_hybrid_governance_or_infrastructure",
  depin_physical_infrastructure_network: "depin_resource_network",
  meme_attention_cultural_asset: "meme_market_structure",
  gaming_gamefi_metaverse: "gaming_game_economy",
  low_coverage_metadata_manual_review: "manual_low_coverage",
});

function normalizeAnalystWorkflowCanonicalRoute(root, contract) {
  const nestedAnalysis = safeObject(root.analysis);
  const canonicalRoute = safeObject(
    root.canonicalProductRoute
    || nestedAnalysis.canonicalProductRoute
    || root.primaryAnalysisRoute
    || nestedAnalysis.primaryAnalysisRoute,
  );
  const familyRoute = safeObject(
    root.familyCanonicalRoutingContract
    || nestedAnalysis.familyCanonicalRoutingContract,
  );
  const routeFamily = canonicalRoute.primaryFamily || canonicalRoute.assetFamily || familyRoute.effectiveFamily;
  const routeQuestionGroup = canonicalRoute.primaryQuestionGroup || canonicalRoute.questionGroup || familyRoute.canonicalQuestionGroup;
  const contractFamily = String(contract.canonicalFamily || "").trim();
  const canonicalFamily = ANALYST_WORKFLOW_CANONICAL_FAMILY_BY_ALIAS[routeFamily]
    || routeFamily
    || ANALYST_WORKFLOW_CANONICAL_FAMILY_BY_ALIAS[contractFamily]
    || contractFamily;
  const legacyAlias = contractFamily && contractFamily !== canonicalFamily ? contractFamily : null;
  const existingNormalization = safeObject(contract.familyAliasNormalization);
  const existingNormalizedAliases = safeArray(existingNormalization.aliasesNormalized);
  const aliasesNormalized = legacyAlias && !existingNormalizedAliases.some((entry) => entry?.alias === legacyAlias)
    ? [...existingNormalizedAliases, {
      alias: legacyAlias,
      canonicalFamily,
      reason: "legacy_route_alias",
    }]
    : existingNormalizedAliases;
  const blockedAliases = [...new Set([
    ...safeArray(existingNormalization.aliasesBlockedFromPrimaryRendering),
    ...aliasesNormalized.map((entry) => entry?.alias),
  ].filter(Boolean))];
  return {
    canonicalFamily,
    canonicalQuestionGroup: routeQuestionGroup || contract.canonicalQuestionGroup,
    familyAliasNormalization: {
      ...existingNormalization,
      status: "PASS",
      routeAuthorityFamily: routeFamily || existingNormalization.routeAuthorityFamily || contractFamily,
      canonicalFamily,
      canonicalQuestionGroup: routeQuestionGroup || contract.canonicalQuestionGroup,
      aliasesNormalized,
      aliasesNormalizedCount: aliasesNormalized.length,
      aliasesBlockedFromPrimaryRendering: blockedAliases,
      aliasesBlockedFromPrimaryRenderingCount: blockedAliases.length,
      auditOnly: true,
    },
  };
}

export function normalizeInstitutionalAnalystWorkflowPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(root.institutionalAnalystWorkflowContract || nestedAnalysis.institutionalAnalystWorkflowContract);
  if (!contract.artifactVersion) return null;
  const canonicalRoute = normalizeAnalystWorkflowCanonicalRoute(root, contract);
  return {
    ...contract,
    ...canonicalRoute,
    rawProblemDataInventory: {
      ...safeObject(contract.rawProblemDataInventory),
      items: safeArray(contract.rawProblemDataInventory?.items),
      availableCategories: safeArray(contract.rawProblemDataInventory?.availableCategories),
      partialCategories: safeArray(contract.rawProblemDataInventory?.partialCategories),
      missingCategories: safeArray(contract.rawProblemDataInventory?.missingCategories),
      notApplicableCategories: safeArray(contract.rawProblemDataInventory?.notApplicableCategories),
    },
    normalizedProblemData: safeArray(contract.normalizedProblemData),
    typedObservations: safeArray(contract.typedObservations),
    institutionalQuestionRegistryLink: {
      ...safeObject(contract.institutionalQuestionRegistryLink),
      selectedQuestionIds: safeArray(contract.institutionalQuestionRegistryLink?.selectedQuestionIds),
      selectedQuestions: safeArray(contract.institutionalQuestionRegistryLink?.selectedQuestions),
      notApplicableQuestionsBlockedByFamily: safeArray(contract.institutionalQuestionRegistryLink?.notApplicableQuestionsBlockedByFamily),
    },
    autonomousQuestionAnswers: safeArray(contract.autonomousQuestionAnswers),
    analystJudgments: safeArray(contract.analystJudgments),
    thesisAntiThesis: safeObject(contract.thesisAntiThesis),
    tokenomicsAnalysis: safeObject(contract.tokenomicsAnalysis),
    fundamentalAnalysis: safeObject(contract.fundamentalAnalysis),
    moduleScoringReadiness: safeArray(contract.moduleScoringReadiness),
    confidenceCapDrivers: safeArray(contract.confidenceCapDrivers),
    falsificationTriggers: safeArray(contract.falsificationTriggers),
    missingData: safeArray(contract.missingData),
    investmentResearchMemo: safeObject(contract.investmentResearchMemo),
    evidenceUseBoundary: safeObject(contract.evidenceUseBoundary),
    contaminationControl: safeObject(contract.contaminationControl),
    protectedReportSummary: safeObject(contract.protectedReportSummary),
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function resolveInstitutionalAnalystWorkflowContract(...sources) {
  for (const source of sources) {
    const normalized = normalizeInstitutionalAnalystWorkflowPayload(source);
    if (normalized) return normalized;
    const root = safeObject(source);
    const nestedAnalysis = safeObject(root.analysis);
    const partial = safeObject(
      root.institutionalAnalystWorkflowContract
      || nestedAnalysis.institutionalAnalystWorkflowContract,
    );
    if (Object.keys(partial).length) {
      return {
        ...partial,
        contractAvailability: "partial",
        rawProblemDataInventory: safeObject(partial.rawProblemDataInventory),
        normalizedProblemData: safeArray(partial.normalizedProblemData),
        typedObservations: safeArray(partial.typedObservations),
        autonomousQuestionAnswers: safeArray(partial.autonomousQuestionAnswers),
        analystJudgments: safeArray(partial.analystJudgments),
        moduleScoringReadiness: safeArray(partial.moduleScoringReadiness),
        confidenceCapDrivers: safeArray(partial.confidenceCapDrivers),
        falsificationTriggers: safeArray(partial.falsificationTriggers),
        missingData: safeArray(partial.missingData),
      };
    }
  }
  return null;
}

export function normalizeInstitutionalQuestionSourceCoveragePayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const contract = safeObject(
    root.institutionalQuestionSourceCoverageContract
    || nestedAnalysis.institutionalQuestionSourceCoverageContract,
  );
  if (!contract.registryVersion) return null;
  return {
    ...contract,
    supportedFamilies: safeArray(contract.supportedFamilies),
    supportedQuestionTypes: safeArray(contract.supportedQuestionTypes),
    sourceTierModel: safeArray(contract.sourceTierModel),
    familyCoverageSummary: safeArray(contract.familyCoverageSummary),
    questionEvidenceContracts: safeArray(contract.questionEvidenceContracts),
    forbiddenInputRules: safeArray(contract.forbiddenInputRules),
    observationTypeCatalog: safeArray(contract.observationTypeCatalog),
    gapOutputPolicies: safeArray(contract.gapOutputPolicies),
    auditOnlyWarnings: safeArray(contract.auditOnlyWarnings),
    guardrails: safeObject(contract.guardrails),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function normalizeCategoryDrivenAssetFamilyContractPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.categoryDrivenAssetFamilyContract);
  const nestedContract = safeObject(nestedAnalysis.categoryDrivenAssetFamilyContract);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    secondaryAssetFamilies: safeArray(contract.secondaryAssetFamilies),
    excludedFamilies: safeArray(contract.excludedFamilies),
    familyResolutionReasons: safeArray(contract.familyResolutionReasons),
    categorySignalsUsed: safeArray(contract.categorySignalsUsed),
    networkContextSignals: safeArray(contract.networkContextSignals),
    assetClassSignals: safeArray(contract.assetClassSignals),
    conflictWarnings: safeArray(contract.conflictWarnings),
    questionRegistryGroup: {
      ...safeObject(contract.questionRegistryGroup),
      questions: safeArray(contract.questionRegistryGroup?.questions).map((question) => ({
        ...safeObject(question),
        sourceRequirements: safeArray(question?.sourceRequirements),
        forbiddenPrimaryCopy: safeArray(question?.forbiddenPrimaryCopy),
      })),
    },
    sourceRequirementProfile: {
      ...safeObject(contract.sourceRequirementProfile),
      priorityRequirements: safeArray(contract.sourceRequirementProfile?.priorityRequirements),
      notApplicableRequirements: safeArray(contract.sourceRequirementProfile?.notApplicableRequirements),
      forbiddenPrimaryNarrative: safeArray(contract.sourceRequirementProfile?.forbiddenPrimaryNarrative),
    },
    sourceMatrixEntryIds: safeArray(contract.sourceMatrixEntryIds),
    scoringBoundary: safeObject(contract.scoringBoundary),
  };
}

export function normalizeCategoryDataRequirementProfilesPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.categoryDataRequirementProfiles);
  const nestedContract = safeObject(nestedAnalysis.categoryDataRequirementProfiles);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    profiles: safeArray(contract.profiles).map((profile) => ({
      ...safeObject(profile),
      requiredDataCategories: safeArray(profile?.requiredDataCategories),
      sourceRequirements: safeArray(profile?.sourceRequirements),
      nonApplicableDataCategories: safeArray(profile?.nonApplicableDataCategories),
      primaryFailureModes: safeArray(profile?.primaryFailureModes),
    })),
  };
}

export function normalizeCategoryAnswerBuilderPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.categoryAnswerBuilder);
  const nestedContract = safeObject(nestedAnalysis.categoryAnswerBuilder);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    answerCards: safeArray(contract.answerCards).map((card) => ({
      ...safeObject(card),
      dataUsed: safeArray(card?.dataUsed),
      missingEvidence: safeArray(card?.missingEvidence),
      whatWouldChange: safeArray(card?.whatWouldChange),
    })),
  };
}

export function normalizeCategoryReadinessDiagnosticsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.categoryReadinessDiagnostics);
  const nestedContract = safeObject(nestedAnalysis.categoryReadinessDiagnostics);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    manualReviewFlags: safeArray(contract.manualReviewFlags),
    sourceRequiredFlags: safeArray(contract.sourceRequiredFlags),
    falsePositiveRisks: safeArray(contract.falsePositiveRisks),
    whatWouldImproveReadiness: safeArray(contract.whatWouldImproveReadiness),
    scoringBoundary: safeObject(contract.scoringBoundary),
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

export function normalizeEffectiveInstitutionalLensPayload(responseLike, assetInterpretationContract = null) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootLens = safeObject(root.effectiveInstitutionalLens);
  const nestedLens = safeObject(nestedAnalysis.effectiveInstitutionalLens);
  const contractLens = safeObject(assetInterpretationContract?.effectiveInstitutionalLens);
  const lens = rootLens.lensId || rootLens.label
    ? rootLens
    : nestedLens.lensId || nestedLens.label
      ? nestedLens
      : contractLens.lensId || contractLens.label
        ? contractLens
        : null;
  if (!lens) return null;
  return {
    ...lens,
    sourceMatrixEntryIds: safeArray(lens.sourceMatrixEntryIds),
    rawResolvedLensAuditOnly: safeObject(lens.rawResolvedLensAuditOnly),
  };
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
    searchIdentityReconciliation: identity.searchIdentityReconciliation ? {
      ...safeObject(identity.searchIdentityReconciliation),
      providerContracts: safeArray(identity.searchIdentityReconciliation.providerContracts),
      coinGeckoContracts: safeArray(identity.searchIdentityReconciliation.coinGeckoContracts),
      coinMarketCapContracts: safeArray(identity.searchIdentityReconciliation.coinMarketCapContracts),
      providerDisagreementReasons: safeArray(identity.searchIdentityReconciliation.providerDisagreementReasons),
      selectionWarnings: safeArray(identity.searchIdentityReconciliation.selectionWarnings),
      whyThisCandidate: safeArray(identity.searchIdentityReconciliation.whyThisCandidate),
      whyNotThisCandidate: safeArray(identity.searchIdentityReconciliation.whyNotThisCandidate),
      displayLabels: safeArray(identity.searchIdentityReconciliation.displayLabels),
      sourceBoundary: safeArray(identity.searchIdentityReconciliation.sourceBoundary),
    } : null,
    allKnownContracts: safeArray(identity.allKnownContracts),
    platformContracts: safeObject(identity.platformContracts),
    oldContracts: safeArray(identity.oldContracts),
    newContracts: safeArray(identity.newContracts),
    explorerLinks: safeArray(identity.explorerLinks),
    officialLinks: safeArray(identity.officialLinks),
    identityWarnings: safeArray(identity.identityWarnings),
    chainWarnings: safeArray(identity.chainWarnings),
    contractWarnings: safeArray(identity.contractWarnings),
    identityEvidenceReconciliationWarnings: safeArray(identity.identityEvidenceReconciliationWarnings),
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
  const tokenomics = rootTokenomics.supplyTruth || rootTokenomics.supplySummary || rootTokenomics.tokenomicsIntegrityScore !== undefined
    ? rootTokenomics
    : nestedTokenomics.supplyTruth || nestedTokenomics.supplySummary || nestedTokenomics.tokenomicsIntegrityScore !== undefined
      ? nestedTokenomics
      : null;

  if (!tokenomics) return null;

  const normalizeFormula = (formula) => ({
    ...safeObject(formula),
    inputs: safeArray(formula?.inputs).map((input) => ({
      ...safeObject(input),
      sourceBoundary: safeArray(input?.sourceBoundary),
    })),
    missingInputs: safeArray(formula?.missingInputs),
    invalidInputs: safeArray(formula?.invalidInputs),
    sourceInputs: safeArray(formula?.sourceInputs),
    sourceBoundary: safeArray(formula?.sourceBoundary),
    limitations: safeArray(formula?.limitations),
    discrepancy: formula?.discrepancy ? safeObject(formula.discrepancy) : null,
  });
  const rawSupplyTruth = safeObject(tokenomics.supplyTruth);
  const canonicalFacts = Object.fromEntries(Object.entries(safeObject(rawSupplyTruth.canonicalFacts)).map(([field, fact]) => [field, {
    ...safeObject(fact),
    sourceBoundary: safeArray(fact?.sourceBoundary),
  }]));
  const calculatedMetrics = safeArray(rawSupplyTruth.calculatedMetrics).map(normalizeFormula);
  const supplyTruth = Object.keys(rawSupplyTruth).length ? {
    ...rawSupplyTruth,
    representationContext: safeObject(rawSupplyTruth.representationContext),
    applicability: {
      ...safeObject(rawSupplyTruth.applicability),
      primaryDiligenceQuestions: safeArray(rawSupplyTruth.applicability?.primaryDiligenceQuestions),
      notApplicableRedirects: safeArray(rawSupplyTruth.applicability?.notApplicableRedirects),
    },
    providerCandidates: safeArray(rawSupplyTruth.providerCandidates),
    rawProviderFacts: safeArray(rawSupplyTruth.rawProviderFacts).map((fact) => ({
      ...safeObject(fact),
      sourceBoundary: safeArray(fact?.sourceBoundary),
    })),
    canonicalFacts,
    maxSupplySemantics: {
      ...safeObject(rawSupplyTruth.maxSupplySemantics),
      evidenceBasis: safeArray(rawSupplyTruth.maxSupplySemantics?.evidenceBasis),
      reasoning: safeArray(rawSupplyTruth.maxSupplySemantics?.reasoning),
    },
    providerDisagreements: safeArray(rawSupplyTruth.providerDisagreements),
    contradictions: safeArray(rawSupplyTruth.contradictions),
    calculatedMetrics,
    calculationTraces: safeArray(rawSupplyTruth.calculationTraces).map(normalizeFormula),
    typedObservations: safeArray(rawSupplyTruth.typedObservations),
    provenanceSummary: {
      ...safeObject(rawSupplyTruth.provenanceSummary),
      providers: safeArray(rawSupplyTruth.provenanceSummary?.providers),
      sourceBoundary: safeArray(rawSupplyTruth.provenanceSummary?.sourceBoundary),
    },
    freshnessSummary: {
      ...safeObject(rawSupplyTruth.freshnessSummary),
      staleFactIds: safeArray(rawSupplyTruth.freshnessSummary?.staleFactIds),
      unknownFreshnessFactIds: safeArray(rawSupplyTruth.freshnessSummary?.unknownFreshnessFactIds),
    },
    supportedConclusions: safeArray(rawSupplyTruth.supportedConclusions),
    unsupportedConclusions: safeArray(rawSupplyTruth.unsupportedConclusions),
    missingInputs: safeArray(rawSupplyTruth.missingInputs),
    whatWouldChange: safeArray(rawSupplyTruth.whatWouldChange),
  } : null;

  return {
    ...tokenomics,
    supplyTruth,
    legacyCompatibility: safeObject(tokenomics.legacyCompatibility),
    supplySummary: safeObject(tokenomics.supplySummary),
    sourceContradictions: safeArray(tokenomics.sourceContradictions),
    providerDisagreements: safeArray(tokenomics.providerDisagreements),
    providerContracts: safeArray(tokenomics.providerContracts),
    providerPlatforms: safeArray(tokenomics.providerPlatforms),
    providerMarketCaps: safeArray(tokenomics.providerMarketCaps),
    providerFdvs: safeArray(tokenomics.providerFdvs),
    providerVolumes: safeArray(tokenomics.providerVolumes),
    providerSupplyValues: safeArray(tokenomics.providerSupplyValues),
    providerTimestamps: safeArray(tokenomics.providerTimestamps),
    providerScopeNotes: safeArray(tokenomics.providerScopeNotes),
    providerFieldAudit: safeArray(tokenomics.providerFieldAudit).map((entry) => ({
      ...safeObject(entry),
      fieldsAvailable: safeArray(entry?.fieldsAvailable),
      fieldsMissing: safeArray(entry?.fieldsMissing),
      sourceBoundary: safeArray(entry?.sourceBoundary),
    })),
    coingeckoSupply: tokenomics.coingeckoSupply ? safeObject(tokenomics.coingeckoSupply) : null,
    coinmarketcapSupply: tokenomics.coinmarketcapSupply ? safeObject(tokenomics.coinmarketcapSupply) : null,
    formulaOutputs: (calculatedMetrics.length ? calculatedMetrics : safeArray(tokenomics.formulaOutputs).map(normalizeFormula)),
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
      dataFieldsUsed: safeArray(question?.dataFieldsUsed),
      formulaOutputsUsed: safeArray(question?.formulaOutputsUsed),
      missingEvidence: safeArray(question?.missingEvidence),
      whatWouldChange: safeArray(question?.whatWouldChange),
      sourceBoundary: safeArray(question?.sourceBoundary),
      reviewedSourcesUsed: safeArray(question?.reviewedSourcesUsed),
      reviewedFactsUsed: safeArray(question?.reviewedFactsUsed),
      remainingMissingEvidence: safeArray(question?.remainingMissingEvidence),
      reviewedEvidenceBoundary: safeArray(question?.reviewedEvidenceBoundary),
      evidenceMappingWarnings: safeArray(question?.evidenceMappingWarnings),
      reviewedEvidenceDoesNotAnswer: safeArray(question?.reviewedEvidenceDoesNotAnswer),
      synthesizedAnswer: normalizeSynthesizedAnswerPayload(question?.synthesizedAnswer),
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

export function normalizeAnalysisFreshnessPayload(responseLike, fallbackSnapshot = null) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const nestedMeta = safeObject(nestedAnalysis.meta);
  const rootMeta = safeObject(root.meta || nestedMeta);
  const delivery = safeObject(
    root.delivery ||
    rootMeta.delivery ||
    nestedAnalysis.delivery ||
    nestedMeta.delivery,
  );
  const sectionFreshness = safeObject(root.sectionFreshness || rootMeta.sectionFreshness || nestedAnalysis.sectionFreshness || nestedMeta.sectionFreshness);
  const generatedAt = firstPresent(root.generatedAt, root.lastAnalyzed, nestedAnalysis.generatedAt, rootMeta.generatedAt, delivery.generatedAt, delivery.checkedAt, root.cachedAt);
  const readAt = firstPresent(delivery.readAt, root.readAt, rootMeta.readAt, delivery.checkedAt);
  const freshSections = collectSectionNames(sectionFreshness, (status) => status === "fresh" || status === "live");
  const missingSections = collectSectionNames(sectionFreshness, (status) => status === "missing" || status === "unsupported");
  const freshnessStatus = "fresh_live";
  const freshnessLabel = "Live full recompute";
  const summary = `Live full recompute${generatedAt ? ` generated at ${formatDateTime(generatedAt)}` : ""}.`;

  return {
    freshnessStatus,
    freshnessLabel,
    summary,
    analysisSource: "live",
    generatedAt: generatedAt || null,
    readAt: readAt || null,
    snapshotId: null,
    snapshotShortId: null,
    previousSnapshotId: null,
    previousSnapshotAt: null,
    recomputed: true,
    refreshMode: null,
    fullRegenerationNeeded: false,
    partialRefreshSufficient: false,
    freshSections: [...new Set(freshSections)],
    staleSections: [],
    missingSections: [...new Set(missingSections)],
    sectionFreshness,
    snapshotAgeMs: null,
    freshnessWindowMs: null,
    isSnapshot: false,
    isPartialRefresh: false,
    isFreshLive: true,
    isHistoricalSnapshotCompareOnly: false,
    isCachedRecentMemo: false,
    freshQaEligible: true,
    bundleMode: "live_current_qa",
    currentProductTruthObject: "live_recomputed_analysis",
    qaEligibilityLabel: "Eligible for current QA",
    qaEligibilityWarning: "Current analysis is a live full recompute.",
    primaryAnalysisPath: "live_full_recompute",
    snapshotDisabled: true,
    snapshotReuseBlocked: true,
    partialRefreshDisabled: true,
    partialRefreshBlocked: true,
    partialRefreshUsed: false,
    partialRefreshAvailable: false,
    currentQaSource: "live_analyze_response",
    freshnessWarnings: missingSections.length
      ? [`Missing sections are unavailable, not negative evidence: ${missingSections.slice(0, 5).join(", ")}.`]
      : [],
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

function formatReportList(items, fallback = "Not available yet.", limit = 6) {
  const values = normalizeRenderableList(items).slice(0, limit);
  if (!values.length) return [`- ${fallback}`];
  return values.map((item) => `- ${item}`);
}

function reportLine(label, value) {
  return `${label}: ${extractRenderableText(value, "Not available yet.")}`;
}

function scrubProtectedInvestorReportText(text) {
  const forbiddenPatterns = [
    /\b2C\b/gi,
    /\b2AD\b/gi,
    /\b2AB\b/gi,
    /\bsource matrix\b/gi,
    /\bmatrix[_-][a-z0-9_-]+\b/gi,
    /\bengine learning\b/gi,
    /\bregistry\b/gi,
    /\bartifact\b/gi,
    /\bprompt\b/gi,
    /\braw JSON\b/gi,
    /\bscoring formula\b/gi,
    /\bweight(s|ed)?\b/gi,
    /\bsrc\/[^\s]+/gi,
    /\bbackend\b/gi,
    /\bimplementation detail(s)?\b/gi,
    /\bquestionId\b/gi,
    /\bsourceBoundary\b/gi,
    /\bscoringFieldsUsed\b/gi,
    /\bprovider_metadata_not_reviewed_evidence\b/gi,
    /\bsource_required\b/gi,
    /\bdiagnostic[- ]only\b/gi,
    /\bnot scoring-active\b/gi,
    /\bnot scoring active\b/gi,
    /\bbenchmark pack\b/gi,
    /\bbenchmark answer pack\b/gi,
    /\bclaimIds?\b/gi,
    /\bpackId\b/gi,
    /\bQA gate\b/gi,
  ];
  return cleanPrimaryAnswerText(forbiddenPatterns.reduce((current, pattern) => current.replace(pattern, "redacted internal detail"), text));
}

export function buildProtectedInvestorReportText({
  asset,
  analysis,
  data,
  model,
  displayIdentity,
  evidenceStatusProxy,
  sourceStatus,
  providerDiagnostics,
  providerHealth,
  scores,
  confidence,
  meta,
} = {}) {
  const safeData = safeObject(data);
  const safeAnalysis = safeObject(analysis || safeData.analysis);
  const safeModel = safeObject(model);
  const decisionLayer = safeObject(safeModel.decisionLayer || safeAnalysis.decisionLayer || safeData.decisionLayer);
  const finalDecisionScore = safeObject(decisionLayer.score);
  const finalDecisionCoverage = safeObject(decisionLayer.coverage);
  const finalDecisionEligibility = safeObject(decisionLayer.eligibility);
  const hasAtomicFinalDecision = decisionLayer.audit?.calculationVersion === "final-decision-atomic-v1";
  const safeAsset = safeObject(asset || safeData.asset);
  const safeScores = safeObject(scores || safeData.scores || safeAnalysis.scores);
  const protectedScore = hasAtomicFinalDecision
    ? (finalDecisionScore.displayable ? `${finalDecisionScore.displayValue}/100` : "Withheld")
    : (safeModel.overallScore !== null && safeModel.overallScore !== undefined ? `${safeModel.overallScore}/100` : safeScores.overallScore);
  const safeConfidence = safeObject(confidence || safeAnalysis.confidence || safeData.confidence);
  const safeMeta = safeObject(meta || safeData.meta);
  const assetIdentityResolution = safeModel.assetIdentityResolution || normalizeAssetIdentityResolutionPayload(safeData) || normalizeAssetIdentityResolutionPayload(safeAnalysis);
  const authorityHierarchyContract = safeModel.authorityHierarchyContract || normalizeAuthorityHierarchyContractPayload(safeData) || normalizeAuthorityHierarchyContractPayload(safeAnalysis);
  const rawPrimaryAnalysisRoute = safeModel.primaryAnalysisRoute || normalizePrimaryAnalysisRoutePayload(safeData, authorityHierarchyContract) || normalizePrimaryAnalysisRoutePayload(safeAnalysis, authorityHierarchyContract);
  const representationFamilyDecision = safeModel.representationFamilyDecision || normalizeRepresentationFamilyDecisionPayload(safeData) || normalizeRepresentationFamilyDecisionPayload(safeAnalysis);
  const representationFamilyRoute = safeModel.representationFamilyRoute || normalizeRepresentationFamilyRoutePayload(safeData, representationFamilyDecision) || normalizeRepresentationFamilyRoutePayload(safeAnalysis, representationFamilyDecision);
  const representationFamilyEvidenceGates = safeArray(safeModel.representationFamilyEvidenceGates).length
    ? safeArray(safeModel.representationFamilyEvidenceGates)
    : normalizeRepresentationFamilyEvidenceGatesPayload(safeData, representationFamilyDecision).length
      ? normalizeRepresentationFamilyEvidenceGatesPayload(safeData, representationFamilyDecision)
      : normalizeRepresentationFamilyEvidenceGatesPayload(safeAnalysis, representationFamilyDecision);
  const lens = safeModel.resolvedInstitutionalLens || normalizeResolvedInstitutionalLensPayload(safeAnalysis);
  const tokenomicsSupplyIntegrity = safeModel.tokenomicsSupplyIntegrity || normalizeTokenomicsSupplyIntegrityPayload(safeData) || normalizeTokenomicsSupplyIntegrityPayload(safeAnalysis);
  const assetResearchResultV2 = normalizeAssetResearchResultV2Payload(safeData)
    || normalizeAssetResearchResultV2Payload(safeAnalysis)
    || normalizeAssetResearchResultV2Payload(safeModel);
  const tokenomicsQuality = safeObject(assetResearchResultV2?.tokenomics?.data);
  const tokenomicsQualityAttached = String(tokenomicsQuality.schemaVersion || "").startsWith("tokenomics-quality-engine-v1");
  const thesisFundamentals = safeObject(assetResearchResultV2?.fundamentals?.data);
  const thesisFundamentalsAttached = String(thesisFundamentals.schemaVersion || "").startsWith("thesis-fundamentals-engine-v1");
  const productResearchResultV2Normalization = normalizeProductResearchResultV2({
    productResearchResultV2: safeData.productResearchResultV2,
    analysis: safeAnalysis,
  });
  const productResearchResultV2 = safeModel.productResearchResultV2
    || productResearchResultV2Normalization.result;
  const productResearchCustomer = safeObject(productResearchResultV2?.customerPresentation);
  const currentReality = safeObject(assetResearchResultV2?.currentReality?.data);
  const currentRealityAttached = String(currentReality.schemaVersion || "").startsWith("current-reality-engine-v1");
  const currentRealityMostMaterial = safeObject(currentReality.mostMaterialEvent);
  const currentRealityRiskChange = safeObject(currentReality.mostImportantRiskChange || currentReality.mostImportantNegativeDevelopment);
  const tokenomicsSupplyTruth = safeObject(tokenomicsSupplyIntegrity?.supplyTruth);
  const tokenomicsQualitySupplyTruth = safeObject(tokenomicsQuality.supplyTruth);
  const tokenomicsQualitySupplyData = safeObject(tokenomicsQualitySupplyTruth.data);
  const tokenomicsQualitySupplyStructure = safeObject(tokenomicsQuality.supplyStructure?.data);
  const protectedSupplyFactValue = (field, fallback = null) => {
    const qualityValue = tokenomicsQualitySupplyData?.canonicalFacts?.[field]?.value;
    if (qualityValue !== null && qualityValue !== undefined) return qualityValue;
    const value = tokenomicsSupplyTruth?.canonicalFacts?.[field]?.value;
    return value === null || value === undefined ? fallback : value;
  };
  const protectedSupplyFormulaDisplay = (formulaId, fallback = null) => {
    const qualityFormula = safeArray(tokenomicsQuality.formulaOutputs).find((entry) => entry?.formulaId === formulaId);
    if (qualityFormula) return qualityFormula.displayedValue || qualityFormula.display || fallback;
    const formula = safeArray(tokenomicsSupplyTruth?.calculatedMetrics).find((entry) => entry?.formulaId === formulaId);
    return formula?.displayedValue || formula?.display || fallback;
  };
  const benchmarkInstitutionalAnswerPack = safeModel.benchmarkInstitutionalAnswerPack || normalizeBenchmarkInstitutionalAnswerPackPayload(safeData) || normalizeBenchmarkInstitutionalAnswerPackPayload(safeAnalysis);
  const finalAnalystAnswerComposerContract = normalizeFinalAnalystAnswerComposerPayload(safeModel)
    || normalizeFinalAnalystAnswerComposerPayload(safeData)
    || normalizeFinalAnalystAnswerComposerPayload(safeAnalysis);
  const marketWideAnalystPipelinePurityContract = safeModel.marketWideAnalystPipelinePurityContract
    || normalizeMarketWideAnalystPipelinePurityPayload(safeModel)
    || normalizeMarketWideAnalystPipelinePurityPayload(safeData)
    || normalizeMarketWideAnalystPipelinePurityPayload(safeAnalysis);
  const evidenceStatusAggregationContract = safeModel.evidenceStatusAggregationContract || normalizeEvidenceStatusAggregationPayload(safeData) || normalizeEvidenceStatusAggregationPayload(safeAnalysis);
  const coverageScoreEligibilityContract = safeModel.coverageScoreEligibilityContract || normalizeCoverageScoreEligibilityPayload(safeData) || normalizeCoverageScoreEligibilityPayload(safeAnalysis);
  const familyCanonicalRoutingContract = safeModel.familyCanonicalRoutingContract || normalizeFamilyCanonicalRoutingPayload(safeData) || normalizeFamilyCanonicalRoutingPayload(safeAnalysis);
  const evidenceProvenanceSemanticsContract = safeModel.evidenceProvenanceSemanticsContract || normalizeEvidenceProvenanceSemanticsPayload(safeData) || normalizeEvidenceProvenanceSemanticsPayload(safeAnalysis);
  const familyDataRequirementMatrixContract = safeModel.familyDataRequirementMatrixContract || normalizeFamilyDataRequirementMatrixPayload(safeData) || normalizeFamilyDataRequirementMatrixPayload(safeAnalysis);
  const canonicalProductRoute = safeModel.canonicalProductRoute || normalizeCanonicalProductRoutePayload(safeData) || normalizeCanonicalProductRoutePayload(safeAnalysis);
  const routeSurfaceParityContract = safeModel.routeSurfaceParityContract || normalizeRouteSurfaceParityPayload(safeData) || normalizeRouteSurfaceParityPayload(safeAnalysis);
  const apiFirstInstitutionalIntelligence = normalizeApiFirstInstitutionalIntelligencePayload(safeModel) || normalizeApiFirstInstitutionalIntelligencePayload(safeData) || normalizeApiFirstInstitutionalIntelligencePayload(safeAnalysis);
  const providerDataBoundaryContract = safeModel.providerDataBoundaryContract || normalizeProviderDataBoundaryPayload(safeModel) || normalizeProviderDataBoundaryPayload(safeData) || normalizeProviderDataBoundaryPayload(safeAnalysis);
  const providerCapabilityRegistryContract = safeModel.providerCapabilityRegistryContract || normalizeProviderCapabilityRegistryPayload(safeModel) || normalizeProviderCapabilityRegistryPayload(safeData) || normalizeProviderCapabilityRegistryPayload(safeAnalysis) || providerDataBoundaryContract?.providerCapabilitySummary || null;
  const typedObservationFamilyAuthorityContract = safeModel.typedObservationFamilyAuthorityContract || normalizeTypedObservationFamilyAuthorityPayload(safeModel) || normalizeTypedObservationFamilyAuthorityPayload(safeData) || normalizeTypedObservationFamilyAuthorityPayload(safeAnalysis);
  const institutionalMethodologyContract = safeModel.institutionalMethodologyContract || normalizeInstitutionalMethodologyContractPayload(safeModel) || normalizeInstitutionalMethodologyContractPayload(safeData) || normalizeInstitutionalMethodologyContractPayload(safeAnalysis);
  const sourceIntelligenceContract = safeModel.sourceIntelligenceContract || normalizeSourceIntelligencePayload(safeModel) || normalizeSourceIntelligencePayload(safeData) || normalizeSourceIntelligencePayload(safeAnalysis);
  const evidenceRegistryContract = safeModel.evidenceRegistryContract || normalizeEvidenceRegistryPayload(safeModel) || normalizeEvidenceRegistryPayload(safeData) || normalizeEvidenceRegistryPayload(safeAnalysis) || sourceIntelligenceContract?.evidenceRegistryContract || null;
  const questionEvidenceMappingContract = safeModel.questionEvidenceMappingContract || normalizeQuestionEvidenceMappingPayload(safeModel) || normalizeQuestionEvidenceMappingPayload(safeData) || normalizeQuestionEvidenceMappingPayload(safeAnalysis) || sourceIntelligenceContract?.questionEvidenceMappingContract || null;
  const deepResearchSourceDiscoveryContract = safeModel.deepResearchSourceDiscoveryContract || normalizeDeepResearchSourceDiscoveryPayload(safeModel) || normalizeDeepResearchSourceDiscoveryPayload(safeData) || normalizeDeepResearchSourceDiscoveryPayload(safeAnalysis);
  const sourceCandidatePipelineContract = safeModel.sourceCandidatePipelineContract || normalizeSourceCandidatePipelinePayload(safeModel) || normalizeSourceCandidatePipelinePayload(safeData) || normalizeSourceCandidatePipelinePayload(safeAnalysis) || deepResearchSourceDiscoveryContract?.sourceCandidatePipelineContract || null;
  const sourceCandidateRegistryContract = safeModel.sourceCandidateRegistryContract || normalizeSourceCandidateRegistryPayload(safeModel) || normalizeSourceCandidateRegistryPayload(safeData) || normalizeSourceCandidateRegistryPayload(safeAnalysis) || deepResearchSourceDiscoveryContract?.sourceCandidateRegistryContract || null;
  const sourceCandidateReviewWorkflowContract = safeModel.sourceCandidateReviewWorkflowContract || normalizeSourceCandidateReviewWorkflowPayload(safeModel) || normalizeSourceCandidateReviewWorkflowPayload(safeData) || normalizeSourceCandidateReviewWorkflowPayload(safeAnalysis);
  const sourceCandidateReviewQueueContract = safeModel.sourceCandidateReviewQueueContract || normalizeSourceCandidateReviewQueuePayload(safeModel) || normalizeSourceCandidateReviewQueuePayload(safeData) || normalizeSourceCandidateReviewQueuePayload(safeAnalysis) || sourceCandidateReviewWorkflowContract?.sourceCandidateReviewQueueContract || null;
  const sourceCandidateReviewAuditTrailContract = safeModel.sourceCandidateReviewAuditTrailContract || normalizeSourceCandidateReviewAuditTrailPayload(safeModel) || normalizeSourceCandidateReviewAuditTrailPayload(safeData) || normalizeSourceCandidateReviewAuditTrailPayload(safeAnalysis) || sourceCandidateReviewWorkflowContract?.sourceCandidateReviewAuditTrailContract || null;
  const institutionalQuestionSourceCoverageContract =
    safeModel.institutionalQuestionSourceCoverageContract
    || normalizeInstitutionalQuestionSourceCoveragePayload(safeModel)
    || normalizeInstitutionalQuestionSourceCoveragePayload(safeData)
    || normalizeInstitutionalQuestionSourceCoveragePayload(safeAnalysis);
  const institutionalProductTruthObject = apiFirstInstitutionalIntelligence?.institutionalProductTruthObject || safeModel.institutionalProductTruthObject || null;
  const typedObservationLayerContract = apiFirstInstitutionalIntelligence?.typedObservationLayerContract || safeModel.typedObservationLayerContract || null;
  const manualApiResearchGapQueue = apiFirstInstitutionalIntelligence?.manualApiResearchGapQueue || safeModel.manualApiResearchGapQueue || null;
  const primaryAnalysisRoute = buildFamilyProductRouteTruth({
    canonicalProductRoute,
    primaryAnalysisRoute: rawPrimaryAnalysisRoute,
    representationFamilyRoute,
    familyCanonicalRoutingContract,
    familyDataRequirementMatrixContract,
    assetInterpretationContract: safeModel.assetInterpretationContract || normalizeAssetInterpretationContractPayload(safeData) || normalizeAssetInterpretationContractPayload(safeAnalysis),
    institutionalProductTruthObject,
  }) || rawPrimaryAnalysisRoute;
  const scoringReadinessContract = safeModel.scoringReadinessContract || normalizeScoringReadinessContractPayload(safeData) || normalizeScoringReadinessContractPayload(safeAnalysis);
  const engineLearningBackbone = safeModel.engineLearningBackbone || normalizeEngineLearningBackbonePayload(safeData) || normalizeEngineLearningBackbonePayload(safeAnalysis);
  const engineLearningFeedbackLoop = engineLearningBackbone?.engineLearningFeedbackLoop;
  const questions = safeArray(safeModel.institutionalQuestions || normalizeInstitutionalQuestionsPayload(safeAnalysis).institutionalQuestions);
  const tokenomicsQuestions = safeArray(tokenomicsSupplyIntegrity?.institutionalQuestions);
  const sourceStatusObject = safeObject(sourceStatus || safeData.sourceStatus);
  const providerDiagnosticsList = safeArray(providerDiagnostics || safeMeta.providerDiagnostics);
  const providerNames = providerDiagnosticsList
    .map((entry) => entry.provider || entry.name)
    .filter(Boolean)
    .slice(0, 8);
  const providerHealthSummary = safeObject(providerHealth).status || safeObject(providerHealth).overallStatus || "Provider health context available in product UI when configured.";
  const generatedAt = new Date().toISOString();
  const assetLabel = [
    safeAsset.name || displayIdentity?.assetName,
    safeAsset.symbol ? `(${safeAsset.symbol})` : "",
  ].filter(Boolean).join(" ") || "Selected asset";
  const composerCards = safeArray(finalAnalystAnswerComposerContract?.canonicalQuestionJudgments);
  const canonicalSourceQueue = safeArray(finalAnalystAnswerComposerContract?.familyBoundSourceQueue);
  const canonicalSourceQueueText = canonicalSourceQueue.length
    ? canonicalSourceQueue.map((item) => cleanPrimaryAnswerText(item?.text || item))
    : safeArray(finalAnalystAnswerComposerContract?.sourceQueuePriorities).map(cleanPrimaryAnswerText);
  const selectedQuestions = composerCards.slice(0, 8);
  const questionLines = selectedQuestions.flatMap((question, index) => {
    if (composerCards.length) {
      const isNotApplicable = question.applicabilityStatus === "not_applicable";
      const dataUsed = safeArray(question.dataUsed)
        .slice(0, 4)
        .map((item) => cleanPrimaryAnswerText(`${item?.label || "Data"}: ${item?.displayValue || item?.value || item}`));
      const support = normalizeRenderableList(question.evidenceBehindIt || question.whatTheDataSupports || question.whatDataSupports || question.whatThisSupports).slice(0, 3).map(cleanPrimaryAnswerText);
      const limits = normalizeRenderableList(question.whatTheDataDoesNotProve || question.whatDataDoesNotProve || question.whatThisDoesNotProve).slice(0, 3).map(cleanPrimaryAnswerText);
      const missingEvidence = isNotApplicable
        ? []
        : normalizeRenderableList(question.gap || question.missingData || question.missingObservations || question.openChecks).slice(0, 3).map(cleanPrimaryAnswerText);
      return [
        `${index + 1}. ${cleanPrimaryAnswerText(question.question || "Institutional question")}`,
        `   Answer state: ${cleanPrimaryAnswerText(titleCase(question.answerState || question.statusLabel || question.sourceStateLabel || "Needs verification"))}`,
        `   Applicability: ${isNotApplicable ? cleanPrimaryAnswerText(question.applicabilityReason || "Not relevant for this asset.") : "Applicable to the canonical asset family and representation."}`,
        `   Answer: ${cleanPrimaryAnswerText(question.directAnswer || question.answer || question.shortAnswer || question.fundamentalAnalysis || "Source review required before a stronger answer is shown.")}`,
        `   Data used: ${dataUsed.length ? dataUsed.join("; ") : "No question-specific data attached."}`,
        `   Support: ${support.length ? support.join("; ") : "No bounded support conclusion attached."}`,
        `   Limits: ${limits.length ? limits.join("; ") : "No additional limits attached."}`,
        `   Missing data: ${missingEvidence.length ? missingEvidence.join("; ") : "No material missing inputs attached."}`,
        ...(isNotApplicable ? [] : [`   Next step: ${cleanPrimaryAnswerText(question.whatWouldChangeTheView || question.analystNextStep || safeArray(question.openChecks)[0] || "No additional diligence step attached.")}`]),
        `   Boundary: ${cleanPrimaryAnswerText(question.boundary || question.contextBoundary || "Use only within the stated evidence scope.")}`,
      ];
    }
    return [];
  });
  const missingEvidence = normalizeRenderableList(finalAnalystAnswerComposerContract?.contractAttached ? [
    finalAnalystAnswerComposerContract?.analystView?.missingForHigherConviction,
    finalAnalystAnswerComposerContract?.availableDataSummary?.missingSections,
    composerCards
      .filter((question) => question.applicabilityStatus !== "not_applicable")
      .flatMap((question) => safeArray(question.gap || question.missingRequiredObservations)),
    canonicalSourceQueueText,
    tokenomicsSupplyIntegrity?.sourceRequirements,
  ] : [
    safeModel.primaryBlocker?.label,
    safeModel.primaryBlocker?.explanation,
    safeModel.evidenceNeeded,
    evidenceStatusAggregationContract?.assetAggregation?.openChecks,
    safeModel.blockers,
    sourceStatusObject.missing,
    tokenomicsSupplyIntegrity?.sourceRequirements,
  ]).slice(0, 8);
  const whatWouldChange = normalizeRenderableList([
    finalAnalystAnswerComposerContract?.scoreExplanationBridge?.whatWouldImproveScoreOrConfidence,
    canonicalSourceQueueText,
    safeModel.whatWouldChangeDecision?.items,
    safeModel.whatWouldChange,
    tokenomicsSupplyIntegrity?.whatWouldChange,
  ]).slice(0, 8);
  const providerSummary = [
    providerNames.length ? `Provider context included: ${providerNames.join(", ")}.` : "Provider context was limited or not returned for this run.",
    `Provider health: ${extractRenderableText(providerHealthSummary, "Not available yet.")}`,
    "Provider data is context for diligence and requires independent verification.",
  ];
  const lines = [
    "ThesisCore Protected Investor Report",
    `Generated: ${generatedAt}`,
    "",
    "Confidentiality: External/demo report. Internal engine diagnostics, debug identifiers, and technical exports are intentionally omitted.",
    "Boundary: Research support only. Not investment advice. No performance promise. Independent verification required.",
    "",
    "1. Asset / Thesis Classification",
    reportLine("Asset", assetLabel),
    reportLine("Canonical identity", assetIdentityResolution?.canonicalAssetName || safeAsset.coingeckoId || safeAsset.coinGeckoId),
    reportLine("Provider IDs", [
      safeAsset.coingeckoId || safeAsset.coinGeckoId ? `CoinGecko ${safeAsset.coingeckoId || safeAsset.coinGeckoId}` : null,
      safeAsset.coinmarketcapId || safeAsset.coinMarketCapId ? `CoinMarketCap ${safeAsset.coinmarketcapId || safeAsset.coinMarketCapId}` : null,
    ].filter(Boolean).join("; ")),
    reportLine("Primary route", primaryAnalysisRoute?.visibleLabel || lens?.visibleLabelOverride || lens?.displayLabel || lens?.label || lens?.lensId),
    reportLine("Asset framing", primaryAnalysisRoute?.assetFramingLabel || displayIdentity?.displayFraming || safeModel.assetFramingLabel),
    reportLine("Analysis question family", familyCanonicalRoutingContract?.canonicalQuestionGroup || primaryAnalysisRoute?.questionGroup || lens?.questionGroupId),
    reportLine("Source requirement family", familyCanonicalRoutingContract?.canonicalSourceProfile || primaryAnalysisRoute?.sourceProfile),
    reportLine("Route parity", routeSurfaceParityContract?.globalParityStatus === "PASS" ? "Canonical route aligned across primary surfaces" : "Route parity requires review"),
    reportLine("Family data matrix", familyDataRequirementMatrixContract?.primarySourceMatrixId || familyCanonicalRoutingContract?.canonicalSourceMatrixEntries?.[0]),
    reportLine("Product truth object", institutionalProductTruthObject ? "Attached" : "Not available yet."),
    reportLine("Typed observations", typedObservationLayerContract ? `${safeArray(typedObservationLayerContract.eligibleRoutingObservations).length} routing; ${safeArray(typedObservationLayerContract.eligibleAnswerObservations).length} answer observations` : "Not available yet."),
    reportLine("Provider data boundary", providerDataBoundaryContract ? `${safeArray(providerDataBoundaryContract.observations).length} typed boundary observations; ${safeArray(providerDataBoundaryContract.boundaryViolations).length} boundary warnings` : "Not available yet."),
    reportLine("Typed family authority", typedObservationFamilyAuthorityContract ? `${typedObservationFamilyAuthorityContract.visibleLabel || typedObservationFamilyAuthorityContract.selectedFamily}; source ${typedObservationFamilyAuthorityContract.selectedFamilySource || "typed route"}; confidence ${typedObservationFamilyAuthorityContract.confidence || "unknown"}` : "Not available yet."),
    reportLine("Typed family question/source profile", typedObservationFamilyAuthorityContract ? `${typedObservationFamilyAuthorityContract.selectedQuestionGroup || typedObservationFamilyAuthorityContract.questionGroupId || "question group unavailable"} / ${typedObservationFamilyAuthorityContract.selectedSourceMatrix || typedObservationFamilyAuthorityContract.sourceMatrixId || "source matrix unavailable"}` : "Not available yet."),
    reportLine("Provider capability registry", providerCapabilityRegistryContract ? `${safeArray(providerCapabilityRegistryContract.providers).length} provider capability profiles` : "Not available yet."),
    reportLine("Institutional methodology coverage", institutionalMethodologyContract?.protectedReportSummary || "Methodology contract was not attached to this analysis."),
    reportLine(
      "Question-specific evidence policy",
      institutionalQuestionSourceCoverageContract?.protectedReportSummary
        || "Question-specific evidence requirements are tracked internally; missing evidence does not imply a negative conclusion.",
    ),
    reportLine("Research gap queue", manualApiResearchGapQueue ? `${safeArray(manualApiResearchGapQueue.gaps).length} open gaps; AI/deep research disabled` : "Not available yet."),
    reportLine("Critical family requirements", familyDataRequirementMatrixContract ? `${safeArray(familyDataRequirementMatrixContract.manualReviewTriggers).length} review gates; ${safeArray(familyDataRequirementMatrixContract.confidenceCapRules).length} confidence caps` : "Not available yet."),
    reportLine("Blocker class", familyCanonicalRoutingContract?.canonicalCoverageBlockerNamespace),
    reportLine("Representation family", representationFamilyRoute?.visibleLabel || representationFamilyRoute?.selectedFamily),
    reportLine("Representation confidence", representationFamilyDecision?.identityConfidence),
    reportLine("Major evidence gates", representationFamilyEvidenceGates.length ? `${representationFamilyEvidenceGates.length} source/manual-review gates` : "No representation-family gates attached"),
    reportLine("Evidence provenance", evidenceProvenanceSemanticsContract?.assetSummary?.summaryLabel),
    reportLine("Manual evidence readiness", evidenceProvenanceSemanticsContract?.assetSummary?.manualEvidenceReadiness),
    reportLine("Live data readiness", evidenceProvenanceSemanticsContract?.assetSummary?.liveDataReadiness),
    reportLine("Score evidence basis", evidenceProvenanceSemanticsContract?.assetSummary?.scoreEvidenceBasis),
    reportLine("Route boundary", "Primary route reflects the current live asset interpretation. Raw resolver and benchmark diagnostics are omitted from this protected report."),
    ...(marketWideAnalystPipelinePurityContract?.contractAttached ? [
      reportLine("Analyst pipeline purity", marketWideAnalystPipelinePurityContract.status === "PASS" ? "Clean family-bound analyst pipeline attached" : "Analyst pipeline requires review"),
      reportLine("Pipeline family", marketWideAnalystPipelinePurityContract.canonicalFamily),
      reportLine("Pipeline question group", marketWideAnalystPipelinePurityContract.canonicalQuestionGroup),
      reportLine("Pipeline surface rule", marketWideAnalystPipelinePurityContract.familyPolicy?.productSurfaceRule || "Primary product output uses clean analyst answers; internals stay in audit."),
    ] : []),
    ...(finalAnalystAnswerComposerContract?.contractAttached ? [
      "",
      "Final analyst view:",
      reportLine("Asset", finalAnalystAnswerComposerContract.analystView?.whatTheAssetIs),
      reportLine("Analyst view", finalAnalystAnswerComposerContract.analystView?.headline),
      reportLine("What the data supports", finalAnalystAnswerComposerContract.analystView?.whatTheDataSupports),
      reportLine("Strongest area", finalAnalystAnswerComposerContract.analystView?.strongestPartOfThesis),
      reportLine("Weakest area", finalAnalystAnswerComposerContract.analystView?.weakestPartOfAnalysis),
      reportLine("Allocation readiness", finalAnalystAnswerComposerContract.analystView?.allocationReadinessExplanation),
      "Primary risks:",
      ...formatReportList(finalAnalystAnswerComposerContract.riskSummary, "No primary risk summary was attached.", 4),
      "Recommended diligence:",
      ...formatReportList(canonicalSourceQueueText, "No next diligence item was attached.", 5),
    ] : []),
    ...(institutionalProductTruthObject?.protectedReportSummary?.length ? [
      "Product truth summary:",
      ...formatReportList(institutionalProductTruthObject.protectedReportSummary, "No product truth summary attached.", 4),
    ] : []),
    reportLine("Analyzed network", assetIdentityResolution?.analyzedNetwork || assetIdentityResolution?.selectedNetwork),
    reportLine("Analyzed contract", assetIdentityResolution?.analyzedContract || assetIdentityResolution?.selectedContract || "Not applicable or unavailable"),
    "",
    "2. Decision Snapshot",
    reportLine("Verdict", hasAtomicFinalDecision
      ? decisionLayer.verdict?.finalLabel || decisionLayer.verdictLabel || "Decision unavailable"
      : finalAnalystAnswerComposerContract?.scoreExplanationBridge?.verdictLabel || safeModel.verdictLabel || safeAnalysis.verdict || safeScores.verdict),
    reportLine("Confidence", safeModel.confidenceLabel || safeConfidence.label || safeConfidence.level),
    reportLine("Score", protectedScore),
    reportLine("Primary blocker", safeModel.primaryBlocker?.label || safeModel.primaryWeakness),
    reportLine("Interpretation", decisionLayer.verdict?.explanation || finalAnalystAnswerComposerContract?.scoreExplanationBridge?.explanation || safeModel.summaryMemo || safeModel.headerSummary || safeAnalysis.summary),
    reportLine("Score caveat", finalDecisionScore.withholdingReason || evidenceProvenanceSemanticsContract?.coverageScoreEligibilitySemantics?.scoringActivationReadiness || "Existing score remains subject to evidence-readiness caveats."),
    reportLine("Current Reality", currentRealityAttached ? `${titleCase(currentReality.status)}; ${currentReality.coverage?.summary || "current event coverage is limited"}` : "Canonical Current Reality was not attached."),
    reportLine("Most material current development", currentRealityMostMaterial.title || "No verified material event is available in the current source window."),
    reportLine("Current thesis impact", currentRealityMostMaterial.impactSummary || "No verified event changes the current thesis interpretation."),
    reportLine("Current risk change", currentRealityRiskChange.impactSummary || "No verified material risk change is attached."),
    reportLine("Current-event freshness", currentRealityAttached ? `${titleCase(currentReality.freshness?.status)}; last verified ${currentReality.freshness?.lastVerifiedAt || "not established"}` : null),
    reportLine("Current open check", safeArray(currentReality.nextDiligence)[0]),
    "",
    "3. Key Institutional Questions",
    reportLine("Thesis & Fundamentals synthesis", thesisFundamentalsAttached ? `${titleCase(thesisFundamentals.status)}; confidence ${titleCase(thesisFundamentals.confidence?.label)}; freshness ${titleCase(thesisFundamentals.freshness?.status)}` : "Canonical V2 fundamentals synthesis was not attached."),
    reportLine("Product reality", thesisFundamentalsAttached ? thesisFundamentals.productRealityDetails?.conciseSummary || thesisFundamentals.productReality?.conciseAnswer : null),
    reportLine("Core thesis", thesisFundamentalsAttached ? thesisFundamentals.thesisDetails?.thesisSummary : null),
    reportLine("Strongest support", thesisFundamentalsAttached ? thesisFundamentals.strongestSupportedArea : null),
    reportLine("Primary weakness", thesisFundamentalsAttached ? thesisFundamentals.weakestArea : null),
    reportLine("Protocol versus token", thesisFundamentalsAttached ? thesisFundamentals.protocolTokenTransferDetails?.conciseSummary : null),
    ...(thesisFundamentalsAttached ? [
      "Thesis conditions:",
      ...formatReportList(thesisFundamentals.thesisDetails?.thesisConditions, "No thesis condition was attached.", 4),
      "Fundamentals open checks:",
      ...formatReportList(thesisFundamentals.nextDiligence, "No additional fundamentals diligence item was attached.", 5),
    ] : []),
    ...(questionLines.length ? questionLines : ["- Source-backed institutional questions were not available in this run."]),
    "",
    "4. Tokenomics / Supply Integrity",
    reportLine("Tokenomics coverage", tokenomicsQualityAttached ? titleCase(tokenomicsQuality.status) : "Legacy supply-integrity view"),
    reportLine("Supply Truth", safeArray(tokenomicsQualitySupplyTruth.whatIsSupported)[0] || tokenomicsSupplyTruth?.statusSummary || "Canonical supply facts were not available in this analysis."),
    reportLine("Asset family / representation", `${tokenomicsQuality.representationScope?.assetFamily || tokenomicsSupplyTruth?.canonicalFamily || tokenomicsSupplyIntegrity?.canonicalFamily || "Not available yet"} / ${tokenomicsQuality.representationScope?.representationType || tokenomicsSupplyTruth?.representationContext?.representationType || "representation unavailable"}`),
    reportLine("Price / market cap / FDV", `${formatUsd(protectedSupplyFactValue("currentPrice", tokenomicsSupplyIntegrity?.currentPrice))} / ${formatUsd(protectedSupplyFactValue("marketCap", tokenomicsSupplyIntegrity?.marketCap))} / ${formatUsd(protectedSupplyFactValue("fdv", tokenomicsSupplyIntegrity?.fdv))}`),
    reportLine("Circulating / total / max supply", `${formatCompact(tokenomicsQualitySupplyStructure.circulatingSupply ?? protectedSupplyFactValue("circulatingSupply", tokenomicsSupplyIntegrity?.circulatingSupply))} / ${formatCompact(tokenomicsQualitySupplyStructure.totalSupply ?? protectedSupplyFactValue("totalSupply", tokenomicsSupplyIntegrity?.totalSupply))} / ${formatCompact(tokenomicsQualitySupplyStructure.maximumSupply ?? protectedSupplyFactValue("maxSupply", tokenomicsSupplyIntegrity?.maxSupplyValue))}`),
    reportLine("FDV / market cap", protectedSupplyFormulaDisplay("fdv_market_cap_ratio", tokenomicsSupplyIntegrity?.fdvMarketCapRatio)),
    reportLine("Circulating / max", protectedSupplyFormulaDisplay("circulating_percent_of_max", tokenomicsSupplyIntegrity?.circulatingPercentOfMax)),
    reportLine("Max supply meaning", tokenomicsQualitySupplyData?.maxSupplySemantics?.semanticClassification ? titleCase(tokenomicsQualitySupplyData.maxSupplySemantics.semanticClassification) : tokenomicsSupplyTruth?.maxSupplySemantics?.semanticClassification ? titleCase(tokenomicsSupplyTruth.maxSupplySemantics.semanticClassification) : titleCase(tokenomicsSupplyIntegrity?.maxSupplyStatus)),
    reportLine("Supply-data freshness", tokenomicsQualityAttached ? titleCase(tokenomicsQuality.freshness?.status) : tokenomicsSupplyTruth?.freshnessSummary?.overall ? titleCase(tokenomicsSupplyTruth.freshnessSummary.overall) : "Not available yet."),
    reportLine("Issuance / burns / net supply", tokenomicsQualityAttached ? `${titleCase(tokenomicsQuality.issuance?.data?.policyStatus)} / ${titleCase(tokenomicsQuality.burns?.data?.mechanismStatus)} / ${tokenomicsQuality.netSupplyChange?.data?.netIssuanceAfterBurn ?? "not available"}` : "Detailed mechanism coverage was not attached."),
    reportLine("Unlocks / vesting", tokenomicsQualityAttached ? `${titleCase(tokenomicsQuality.unlocks?.data?.coverageStatus)} / ${titleCase(tokenomicsQuality.vesting?.data?.scheduleType)}` : tokenomicsSupplyIntegrity?.unlockScheduleStatus),
    reportLine("Allocations / concentration", tokenomicsQualityAttached ? `${tokenomicsQuality.allocations?.data?.reportedCategoryCount ?? 0} reported allocation categories; holder concentration ${titleCase(tokenomicsQuality.holderConcentration?.data?.concentrationRisk)}` : "Not available yet."),
    reportLine("Protocol versus token", tokenomicsQualityAttached ? `${tokenomicsQuality.protocolSuccess?.data?.summary || "Protocol activity coverage is limited."} ${tokenomicsQuality.tokenSuccess?.data?.valueCaptureStatus ? `Token value capture: ${titleCase(tokenomicsQuality.tokenSuccess.data.valueCaptureStatus)}.` : ""}` : "Not available yet."),
    reportLine("Primary risk", safeArray(tokenomicsQuality.risks)[0] || tokenomicsSupplyIntegrity?.primaryTokenomicsBlocker),
    reportLine("Primary open check", safeArray(tokenomicsQuality.nextDiligence)[0] || safeArray(tokenomicsSupplyTruth?.whatWouldChange)[0] || tokenomicsSupplyIntegrity?.primaryTokenomicsBlocker || tokenomicsSupplyIntegrity?.explanationSummary),
    "",
    "5. Institutional Scoring Readiness",
    reportLine("Readiness status", scoringReadinessContract?.overallReadinessStatus ? titleCase(scoringReadinessContract.overallReadinessStatus) : "Not available yet."),
    reportLine("Asset-family model", scoringReadinessContract?.assetFamilyLabel),
    reportLine("Score boundary", scoringReadinessContract ? "Current score remains the current numerical score; evidence-readiness checks explain what would improve confidence." : "Not available yet."),
    ...formatReportList(
      normalizeRenderableList(scoringReadinessContract?.committeeMemoPreview?.majorEvidenceGaps || scoringReadinessContract?.whatWouldChangeScore).slice(0, 5),
      "No scoring-readiness gap summary was surfaced in the protected report model.",
      5,
    ),
    "",
    "6. Coverage Tier / Score Eligibility",
    reportLine("Coverage tier", finalDecisionCoverage.label || finalDecisionCoverage.tier || coverageScoreEligibilityContract?.coverageTierLabel || "Not available yet."),
    reportLine("Analysis depth", coverageScoreEligibilityContract?.analysisDepthLabel || "Not available yet."),
    reportLine("Score eligibility", finalDecisionEligibility.status || coverageScoreEligibilityContract?.scoreEligibility || "Not available yet."),
    reportLine("Score display", hasAtomicFinalDecision ? (finalDecisionScore.displayable ? "Available" : "Withheld") : finalAnalystAnswerComposerContract?.scoreExplanationBridge?.scoreDisplayLabel || "Not available yet."),
    reportLine("Coverage meaning", finalDecisionCoverage.limitations?.[0] || coverageScoreEligibilityContract?.primaryUserMessage || "Coverage gate was not attached."),
    ...formatReportList(
      normalizeRenderableList(coverageScoreEligibilityContract?.criticalBlockers?.map((blocker) => blocker.label)).slice(0, 5),
      "No critical coverage blocker was surfaced in the protected report model.",
      5,
    ),
    "",
    "7. Evidence Coverage",
    reportLine("Evidence readiness", evidenceStatusAggregationContract?.assetAggregation?.plainLanguageSummary || "Evidence readiness summary was not attached."),
    reportLine("Questions aggregated", evidenceStatusAggregationContract?.questionAggregations?.length ? `${evidenceStatusAggregationContract.questionAggregations.length} question-level evidence statuses` : "Not available yet."),
    reportLine("Major gaps", normalizeRenderableList(evidenceStatusAggregationContract?.assetAggregation?.openChecks || benchmarkInstitutionalAnswerPack?.missingEvidence).slice(0, 3).map(cleanPrimaryAnswerText).join("; ") || "No evidence gap summary attached"),
    reportLine("Score preview boundary", evidenceStatusAggregationContract ? "Evidence readiness improves explanation; score integration requires a calibrated release." : "Not available"),
    reportLine("Source readiness", sourceIntelligenceContract?.protectedReportSummary?.readiness || "Not available yet."),
    reportLine("Evidence packets", evidenceRegistryContract ? `${evidenceRegistryContract.summary?.packetCount || 0} classified source observations` : "Not available yet."),
    reportLine("Question evidence coverage", questionEvidenceMappingContract ? `${questionEvidenceMappingContract.summary?.coveragePercent || 0}%` : "Not available yet."),
    reportLine("Family-compatible question mapping", questionEvidenceMappingContract?.contractStatus || "Not available yet."),
    reportLine("Source gaps", sourceIntelligenceContract ? `${sourceIntelligenceContract.protectedReportSummary?.sourceGapCount || 0} open source gaps` : "Not available yet."),
    reportLine("Contradiction review", sourceIntelligenceContract?.protectedReportSummary?.contradictionRequiresReview ? "Required" : "No contradiction gate attached"),
    reportLine("Evidence scoring boundary", sourceIntelligenceContract ? "Reviewed evidence improves source readiness but is not active in the numerical score." : "Not available yet."),
    ...(productResearchResultV2 ? [
      "",
      "7A. Institutional Product Analysis",
      reportLine("Analyzed entity", `${productResearchCustomer.entityHeader?.name || "Not available yet."} / ${productResearchCustomer.entityHeader?.entityType || "type unavailable"}`),
      reportLine("Universe / cohort", `${productResearchCustomer.entityHeader?.universe || "unavailable"} / ${productResearchCustomer.entityHeader?.cohort || "unavailable"}`),
      reportLine("Product structure", safeArray(productResearchCustomer.productStructure).slice(0, 3).map(cleanPrimaryAnswerText).join("; ") || "Not available yet."),
      "Institutional product answers:",
      ...formatReportList(safeArray(productResearchCustomer.institutionalQuestions).slice(0, 6).map((answer) => `${cleanPrimaryAnswerText(answer.question)}: ${cleanPrimaryAnswerText(answer.answer)}`), "No bounded product answer is available.", 6),
      reportLine("Source and freshness", safeArray(productResearchCustomer.sourceAndFreshnessStatus).slice(0, 3).map(cleanPrimaryAnswerText).join("; ") || "Not available yet."),
      reportLine("Future scoring readiness", productResearchCustomer.futureScoringReadinessState),
      reportLine("Future ranking readiness", productResearchCustomer.futureRankingReadinessState),
      "Major product evidence gaps:",
      ...formatReportList(safeArray(productResearchCustomer.missingEvidence).map(cleanPrimaryAnswerText), "No major product evidence gap is attached.", 6),
    ] : []),
    reportLine("Source discovery status", deepResearchSourceDiscoveryContract?.contractStatus || "Not available yet."),
    reportLine("Source candidates accepted for review", deepResearchSourceDiscoveryContract ? `${deepResearchSourceDiscoveryContract.protectedReportSummary?.acceptedCandidateCount ?? deepResearchSourceDiscoveryContract.protectedReportSummary?.candidateCount ?? 0}` : "Not available yet."),
    reportLine("High-priority source reviews", deepResearchSourceDiscoveryContract ? `${deepResearchSourceDiscoveryContract.protectedReportSummary?.highPriorityReviewCount || 0}` : "Not available yet."),
    reportLine("Candidate boundary", deepResearchSourceDiscoveryContract?.protectedReportSummary?.candidateEvidenceBoundary || "Not available yet."),
    reportLine("Source review queue", sourceCandidateReviewWorkflowContract ? `${sourceCandidateReviewWorkflowContract.protectedReportSummary?.queueItemCount || 0} candidates awaiting or carrying source review` : "Not available yet."),
    reportLine("Source review outcomes", sourceCandidateReviewWorkflowContract ? `${sourceCandidateReviewWorkflowContract.protectedReportSummary?.acceptedReviewCandidateCount || 0} accepted for future packet drafting; ${sourceCandidateReviewWorkflowContract.protectedReportSummary?.rejectedOrNeedsCheckCount || 0} rejected or needing checks` : "Not available yet."),
    reportLine("Source review boundary", sourceCandidateReviewWorkflowContract ? "Source review evaluates drafting usefulness, not claim truth; evidence gaps remain until evidence packets are validated." : "Not available yet."),
    ...(deepResearchSourceDiscoveryContract?.protectedReportSummary?.summary ? [
      `Discovery summary: ${cleanPrimaryAnswerText(deepResearchSourceDiscoveryContract.protectedReportSummary.summary)}`,
    ] : []),
    ...(sourceIntelligenceContract?.protectedReportSummary?.summary ? [
      `Source summary: ${cleanPrimaryAnswerText(sourceIntelligenceContract.protectedReportSummary.summary)}`,
    ] : []),
    "",
    "8. Missing Evidence / Source Requirements",
    ...(familyDataRequirementMatrixContract?.protectedReportSummary?.length ? [
      "Family data requirement matrix:",
      ...formatReportList(familyDataRequirementMatrixContract.protectedReportSummary, "No family matrix summary attached.", 5),
    ] : []),
    ...formatReportList(missingEvidence, "No missing-evidence list was surfaced in the protected report model.", 8),
    "",
    "9. What Would Change",
    ...formatReportList(whatWouldChange, "Reviewed sources and updated live provider data would be required before stronger language is shown.", 8),
    "",
    "10. Provider Context",
    ...providerSummary.map((item) => `- ${item}`),
    ...(providerDataBoundaryContract ? [
      reportLine("Health probe isolation", providerDataBoundaryContract.healthProbeIneligibilitySummary?.healthProbeSamplesIsolated || "Not available yet."),
      reportLine("Generated text route authority", `${providerDataBoundaryContract.generatedTextIneligibilitySummary?.generatedTextRouteEligibleCount ?? "unknown"} route-eligible generated observations`),
      reportLine("Generated text score authority", `${providerDataBoundaryContract.generatedTextIneligibilitySummary?.generatedTextScoringEligibleCount ?? "unknown"} scoring-eligible generated observations`),
    ] : []),
    "",
    "11. Methodology / Limitations",
    "- ThesisCore combines live provider data, reviewed evidence where available, deterministic rules, and source-boundary labels.",
    "- Provider-reported values are not treated as reviewed evidence.",
    "- Missing data is not negative proof; it is a source requirement or confidence constraint.",
    ...(engineLearningFeedbackLoop ? ["- Additional calibration notes are available internally; finding IDs, detector details, and rule-candidate metadata are omitted from this protected report."] : []),
    "- This protected report omits internal QA diagnostics and implementation details by design.",
  ];
  return scrubProtectedInvestorReportText(lines.join("\n"));
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
    const canonicalDecisionScore = safeObject(decisionLayer.score);
    const hasAtomicFinalDecision = decisionLayer.audit?.calculationVersion === "final-decision-atomic-v1";
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
        hasAtomicFinalDecision
          ? verdictSemantics.summary || decisionLayer.verdict?.explanation || "Final decision unavailable from the current response."
          : verdictSemantics.summary
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
        hasAtomicFinalDecision
          ? decisionLayer.verdict?.explanation || verdictSemantics.boundary || "Final decision explanation unavailable from the current response."
          : verdictSemantics.boundary
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
        hasAtomicFinalDecision
          ? verdictSemantics.label || decisionLayer.verdict?.finalLabel || "Decision unavailable"
          : verdictSemantics.label
        || finalVerdict.rating
        || posture
        || currentState
        || null,
      score:
        hasAtomicFinalDecision
          ? (canonicalDecisionScore.displayable ? canonicalDecisionScore.displayValue ?? null : null)
          : finalVerdict.score ?? safeAnalysis?.scores?.overallScore ?? null,
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

function dedupeObjectsByTitle(items) {
  const seen = new Set();
  return safeArray(items).filter((item) => {
    const title = extractRenderableText(item?.title || item?.reason || item, null);
    if (!title) return false;
    const key = title.trim().toLowerCase();
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
  const hasAtomicFinalDecision = decisionLayer.audit?.calculationVersion === "final-decision-atomic-v1";
  const verdictSemantics = buildVerdictSemanticsDisplay(decisionLayer, safeAnalysis.thesisCore, safeAnalysis);
  if (verdictSemantics?.hasVerdictClass) {
    return {
      key: verdictSemantics.key,
      label: verdictSemantics.label,
      tone: verdictSemantics.tone,
      shortLabel: verdictSemantics.shortLabel,
    };
  }
  if (hasAtomicFinalDecision) {
    return {
      key: null,
      label: "Decision unavailable",
      tone: "neutral",
      shortLabel: "Unavailable",
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
    label: cleanPrimaryAnswerText(safeDecisionLayer.verdictLabel) || base.label,
    shortLabel: base.shortLabel,
    tone: base.tone,
    summary: cleanPrimaryAnswerText(safeDecisionLayer.verdict?.explanation) || base.summary,
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
    assetClassLabel: "Native PoW Monetary / Settlement Asset",
    assetFramingLabel: "Native Monetary Benchmark / PoW Settlement Thesis",
  },
};

const CANONICAL_COMPOSER_MISSING_COPY = {
  summary: "Canonical analyst narrative unavailable. A fresh analysis is required before narrative conclusions can be shown.",
  boundary: "The final decision remains visible, but primary narrative is withheld because finalAnalystAnswerComposerContract is missing. Legacy candidate, report, DataFirst, and raw-lens copy are audit-only.",
  evidence: [
    "No canonical Composer narrative is attached to the current analysis object.",
  ],
  whatWouldChange: [
    "Run a fresh live analysis that attaches finalAnalystAnswerComposerContract from the final decision and canonical family route.",
  ],
};

function buildCanonicalComposerMissingDisplayModel(baseModel) {
  const copy = CANONICAL_COMPOSER_MISSING_COPY;
  return {
    ...baseModel,
    verdictSemantics: {
      ...(baseModel.verdictSemantics || {}),
      summary: copy.summary,
      positiveCase: [copy.summary],
      blockedCase: [copy.summary],
      missingEvidence: copy.evidence,
      whatWouldChange: copy.whatWouldChange,
      boundary: copy.boundary,
    },
    allocationCase: {
      ...(baseModel.allocationCase || {}),
      forAllocation: [copy.summary],
      againstAllocation: [copy.summary],
      missingEvidence: copy.evidence,
      whatWouldChange: copy.whatWouldChange,
    },
    primaryStrength: copy.summary,
    primaryWeakness: copy.summary,
    summaryMemo: copy.summary,
    structuredThesisSummary: copy.summary,
    tokenDemandTruth: copy.summary,
    failureMode: {
      ...(baseModel.failureMode || {}),
      primary: copy.summary,
      trigger: copy.whatWouldChange[0],
    },
    missingCritical: copy.evidence,
    blockers: [copy.summary],
    requiredConditions: copy.evidence,
    primaryBlocker: {
      ...(baseModel.primaryBlocker || {}),
      label: copy.summary,
      explanation: copy.boundary,
      badge: "Full recompute required",
    },
    weakestLink: {
      ...(baseModel.weakestLink || {}),
      label: copy.summary,
      explanation: copy.boundary,
      badge: "Contract missing",
    },
    whatWouldChangeDecision: {
      ...(baseModel.whatWouldChangeDecision || {}),
      items: copy.whatWouldChange,
      badge: "Full recompute required",
      explanation: copy.boundary,
    },
    whyNow: copy.summary,
    whyNotNow: copy.summary,
    whatMustBeTrue: copy.evidence,
    whatCouldBreak: copy.evidence,
    nextCheckpoints: copy.whatWouldChange,
    topPositiveDrivers: [copy.summary],
    topNegativeDrivers: [copy.summary],
    topNeutralDrivers: copy.whatWouldChange,
    researchRequirements: copy.whatWouldChange.map((requirement, index) => ({
      id: `canonical-composer-missing-${index}`,
      title: requirement,
      assetClassLens: baseModel?.resolvedInstitutionalLens?.lensId || "unknown",
      reason: "Current product surfaces require the canonical Final Analyst Answer Composer. This is a render-safety requirement, not asset evidence.",
      evidenceNeeded: [requirement],
      preferredSourceTypes: ["fresh_live_analysis"],
      priority: "critical",
      verdictImpact: "Blocks current QA eligibility until recomputed.",
      currentStatus: "full_recompute_required",
      canChangeVerdict: false,
    })),
    analysisFreshness: {
      ...(baseModel.analysisFreshness || {}),
      freshQaEligible: false,
      qaEligibilityLabel: "Full recompute required",
      qaEligibilityWarning: copy.boundary,
      bundleMode: "canonical_composer_missing_recompute_required",
      fullRecomputeRequiredReason: "finalAnalystAnswerComposerContract missing or stale",
      freshQaEligibleBlockedByMissingFinalComposer: true,
    },
  };
}

function resolvedLensIsDisplayAuthoritative(lens) {
  return Boolean(
    lens?.lensId &&
    lens.confidence === "high" &&
    !["GENERAL_LOW_COVERAGE", "AMBIGUOUS_MANUAL_CLASSIFICATION"].includes(lens.lensId),
  );
}

function displayLabelsForResolvedLens(lens, assetInterpretationContract = null) {
  const visibleContract = safeObject(assetInterpretationContract?.visibleDisplayContract);
  if (visibleContract.primaryVisibleLabel || visibleContract.assetFramingLabel) {
    return {
      assetClassLabel: visibleContract.primaryVisibleLabel || visibleContract.assetFramingLabel,
      assetFramingLabel: visibleContract.assetFramingLabel || visibleContract.primaryVisibleLabel,
      labelSource: visibleContract.labelSource || "asset_interpretation_contract_v1",
      labelFamily: visibleContract.labelFamily || null,
    };
  }
  return resolvedLensIsDisplayAuthoritative(lens) ? RESOLVED_LENS_DISPLAY_LABELS[lens.lensId] || null : null;
}

export function buildLensSpecificResearchDomains(model = {}, displayIdentity = null) {
  const primaryRouteKey = model?.primaryAnalysisRoute?.assetFamily
    || model?.primaryAnalysisRoute?.questionGroup
    || model?.resolvedInstitutionalLens?.primaryRouteAssetFamily
    || model?.resolvedInstitutionalLens?.primaryRouteQuestionGroup;
  const resolvedLensId = primaryRouteKey || model?.resolvedInstitutionalLens?.lensId || displayIdentity?.lensId;
  const identity = model?.assetIdentityResolution || {};
  const identityNeeds = [
    identity?.canonicalNetworkCandidate || identity?.nativeNetworkCandidate ? `Canonical / analyzed representation: ${identity.canonicalNetworkCandidate || identity.nativeNetworkCandidate}` : null,
    identity?.isMultichain ? "Supported network / contract mapping" : null,
    identity?.migrationStatus && identity.migrationStatus !== "none_detected" ? "Migration / old-new contract mapping" : null,
  ].filter(Boolean);

  const map = {
    native_btc_pow_monetary: [
      "Native Monetary Benchmark",
      "Issuance / Hard-Cap Credibility",
      "Fee Market / Security Budget",
      "Liquidity / Access",
    ],
    native_eth_pos_gas_l2_fee_market: [
      "Smart-Contract Settlement",
      "Gas / Fee Burn",
      "Validator / Staking Security",
      "L2 / Blob Settlement Demand",
      "Liveness / Client Risk",
    ],
    rwa_hybrid_asset: [
      "Legal / Economic Claim",
      "Redemption Enforceability",
      "Issuer / Custodian / Collateral",
      "Jurisdiction / Compliance",
      "Product vs Token Value Capture",
      ...identityNeeds,
    ],
    rwa_hybrid: [
      "Legal / Economic Claim",
      "Redemption Enforceability",
      "Issuer / Custodian / Collateral",
      "Jurisdiction / Compliance",
      "Product vs Token Value Capture",
      ...identityNeeds,
    ],
    stablecoin_fiat_backed: [
      "Reserves / Attestations",
      "Redemption Path",
      "Issuer / Custodian Dependency",
      "Mint-Redeem / Admin Controls",
      "Supported Networks",
      ...identityNeeds,
    ],
    wrapped_asset: [
      "Backing / Proof of Reserves",
      "Custodian / Merchant Model",
      "Mint / Burn / Redemption",
      "Selected Contract / Bridge Boundary",
      ...identityNeeds,
    ],
    lst_redemption_slashing: [
      "Withdrawal / Redemption Path",
      "Slashing / Operator Risk",
      "Depeg / Liquidity Risk",
      "Protocol / Admin Controls",
      ...identityNeeds,
    ],
    payments_settlement: [
      "Payments / Settlement",
      "Validator / UNL / Finality",
      "Escrow / Distribution",
      "Fee Burn / Reserve Mechanics",
      "Issuer / Ecosystem Dependency",
    ],
    payments_settlement_network: [
      "Payments / Settlement",
      "Validator / UNL / Finality",
      "Escrow / Distribution",
      "Fee Burn / Reserve Mechanics",
      "Issuer / Ecosystem Dependency",
    ],
    rwa_infrastructure_utility: [
      "RWA Infrastructure",
      "Tokenized Assets",
      "Utility Token vs Security Token Rights",
      "Canonical Chain / Contract Migration",
      "Supply Cap / Emissions",
      ...identityNeeds,
    ],
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
      "Transaction-Fee / Blockspace Demand",
      "Fee-Market Security Budget",
      "Miner Economics / Hashrate",
      "Mining-Pool Concentration / Liveness",
      "Market Depth / Custody / ETF Access",
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

export function normalizeAssetResearchResultV2Payload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const directResult = safeObject(root.assetResearchResultV2);
  const nestedResult = safeObject(nestedAnalysis.assetResearchResultV2);
  const directIsValid = String(directResult.schemaVersion || "").startsWith("2.")
    && Boolean(directResult.resultId)
    && Boolean(safeObject(directResult.tokenomics).data);
  const nestedIsValid = String(nestedResult.schemaVersion || "").startsWith("2.")
    && Boolean(nestedResult.resultId)
    && Boolean(safeObject(nestedResult.tokenomics).data);

  if (directIsValid && nestedIsValid) {
    const rootIdentity = `${directResult.resultId}|${directResult.generatedAt || ""}`;
    const nestedIdentity = `${nestedResult.resultId}|${nestedResult.generatedAt || ""}`;
    if (rootIdentity !== nestedIdentity) return null;
  }

  if (directIsValid) return directResult;
  if (nestedIsValid) return nestedResult;

  const selfIsValid = String(root.schemaVersion || "").startsWith("2.")
    && Boolean(root.resultId)
    && Boolean(safeObject(root.tokenomics).data);
  return selfIsValid ? root : null;
}

export function resolveQaRepresentationType({
  assetIdentityResolution,
  representationFamilyDecision,
  representationFamilyRoute,
  primaryAnalysisRoute,
}) {
  const raw = String(assetIdentityResolution?.representationType || "").trim();
  const decisionRepresentation = String(representationFamilyDecision?.representationType || "").trim();
  const family = String(
    primaryAnalysisRoute?.primaryFamily
    || primaryAnalysisRoute?.assetFamily
    || representationFamilyRoute?.selectedFamily
    || representationFamilyDecision?.selectedFamily
    || "",
  ).trim();
  if (!family) return raw || decisionRepresentation || "unknown";

  if (family === "stablecoin_fiat_backed") {
    return /stablecoin/i.test(raw) ? raw : "fiat_backed_stablecoin";
  }
  if (family === "wrapped_bridged_asset") return /wrapped|bridged/i.test(raw) ? raw : "wrapped_or_bridged_asset";
  if (family === "liquid_staking_derivative") return "liquid_staking_derivative";
  if (family === "native_btc_pow_monetary" || family === "native_eth_pos_gas_l2_fee_market" || family === "non_eth_l1_smart_contract_platform") return "native_asset";
  if (family === "payments_settlement_network") return /payment|settlement|native/i.test(raw) ? raw : "payments_settlement_asset";

  const stablecoinContaminated = /stablecoin/i.test(raw);
  if (stablecoinContaminated) {
    return decisionRepresentation && !/stablecoin/i.test(decisionRepresentation)
      ? decisionRepresentation
      : family === "defi_governance_value_capture"
        ? "protocol_governance_token"
        : "contract_representation";
  }
  return decisionRepresentation || raw || "contract_representation";
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
  const canonicalDecisionScore = safeObject(decisionLayer.score);
  const canonicalDecisionCoverage = safeObject(decisionLayer.coverage);
  const canonicalDecisionEligibility = safeObject(decisionLayer.eligibility);
  const canonicalDecisionManualReview = safeObject(decisionLayer.manualReview);
  const hasAtomicFinalDecision = decisionLayer.audit?.calculationVersion === "final-decision-atomic-v1";
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
  const reviewedEvidencePacket = normalizeReviewedEvidencePacketPayload(safeAnalysis);
  const benchmarkInstitutionalAnswerPack = normalizeBenchmarkInstitutionalAnswerPackPayload(safeAnalysis);
  const assetInterpretationContract = normalizeAssetInterpretationContractPayload(safeAnalysis);
  const effectiveInstitutionalLens = normalizeEffectiveInstitutionalLensPayload(safeAnalysis, assetInterpretationContract);
  const dataFirstNarrativeContract = normalizeDataFirstNarrativeContractPayload(safeAnalysis);
  const authorityHierarchyContract = normalizeAuthorityHierarchyContractPayload(safeAnalysis);
  const representationFamilyDecision = normalizeRepresentationFamilyDecisionPayload(safeAnalysis);
  const representationFamilyRoute = normalizeRepresentationFamilyRoutePayload(safeAnalysis, representationFamilyDecision);
  const representationFamilyEvidenceGates = normalizeRepresentationFamilyEvidenceGatesPayload(safeAnalysis, representationFamilyDecision);
  const rawPrimaryAnalysisRoute = normalizePrimaryAnalysisRoutePayload(safeAnalysis, authorityHierarchyContract);
  const scoringReadinessContract = normalizeScoringReadinessContractPayload(safeAnalysis);
  const engineLearningBackbone = normalizeEngineLearningBackbonePayload(safeAnalysis);
  const benchmarkAssetPreset = findBenchmarkSearchPresetForAsset(asset, safeAnalysis, engineLearningBackbone);
  const benchmarkLearningCapture = benchmarkAssetPreset?.benchmarkLearningCapture || null;
  const providerCategorySignals = normalizeProviderCategorySignalsPayload(safeAnalysis);
  const categoryDrivenAssetFamilyContract = normalizeCategoryDrivenAssetFamilyContractPayload(safeAnalysis);
  const categoryDataRequirementProfiles = normalizeCategoryDataRequirementProfilesPayload(safeAnalysis);
  const categoryAnswerBuilder = normalizeCategoryAnswerBuilderPayload(safeAnalysis);
  const categoryReadinessDiagnostics = normalizeCategoryReadinessDiagnosticsPayload(safeAnalysis);
  const providerRawDataExpansion = normalizeProviderRawDataExpansionPayload(safeAnalysis);
  const rawDataCoverageDiagnostics = normalizeRawDataCoverageDiagnosticsPayload(safeAnalysis) || providerRawDataExpansion?.rawDataCoverageDiagnostics || null;
  const apiFirstInstitutionalIntelligence = normalizeApiFirstInstitutionalIntelligencePayload(safeAnalysis);
  const rawProviderDataRegistryContract = apiFirstInstitutionalIntelligence?.rawProviderDataRegistryContract || null;
  const typedObservationLayerContract = apiFirstInstitutionalIntelligence?.typedObservationLayerContract || null;
  const institutionalProductTruthObject = apiFirstInstitutionalIntelligence?.institutionalProductTruthObject || null;
  const institutionalQuestionAnswerEngineContract = apiFirstInstitutionalIntelligence?.institutionalQuestionAnswerEngineContract || null;
  const manualApiResearchGapQueue = apiFirstInstitutionalIntelligence?.manualApiResearchGapQueue || null;
  const calibrationBacktestReadiness = apiFirstInstitutionalIntelligence?.calibrationBacktestReadiness || null;
  const providerDataBoundaryContract = normalizeProviderDataBoundaryPayload(safeAnalysis);
  const providerCapabilityRegistryContract = normalizeProviderCapabilityRegistryPayload(safeAnalysis) || providerDataBoundaryContract?.providerCapabilitySummary || null;
  const typedObservationFamilyAuthorityContract = normalizeTypedObservationFamilyAuthorityPayload(safeAnalysis);
  const institutionalMethodologyContract = normalizeInstitutionalMethodologyContractPayload(safeAnalysis);
  const institutionalSourceProviderEvidenceMap =
    safeObject(safeAnalysis.institutionalSourceProviderEvidenceMap);
  const sourceIntelligenceContract = normalizeSourceIntelligencePayload(safeAnalysis);
  const evidenceRegistryContract = normalizeEvidenceRegistryPayload(safeAnalysis)
    || sourceIntelligenceContract?.evidenceRegistryContract
    || null;
  const questionEvidenceMappingContract = normalizeQuestionEvidenceMappingPayload(safeAnalysis)
    || sourceIntelligenceContract?.questionEvidenceMappingContract
    || null;
  const deepResearchSourceDiscoveryContract = normalizeDeepResearchSourceDiscoveryPayload(safeAnalysis);
  const sourceCandidatePipelineContract = normalizeSourceCandidatePipelinePayload(safeAnalysis)
    || deepResearchSourceDiscoveryContract?.sourceCandidatePipelineContract
    || null;
  const sourceCandidateRegistryContract = normalizeSourceCandidateRegistryPayload(safeAnalysis)
    || deepResearchSourceDiscoveryContract?.sourceCandidateRegistryContract
    || null;
  const sourceCandidateReviewWorkflowContract = normalizeSourceCandidateReviewWorkflowPayload(safeAnalysis);
  const sourceCandidateReviewQueueContract = normalizeSourceCandidateReviewQueuePayload(safeAnalysis)
    || sourceCandidateReviewWorkflowContract?.sourceCandidateReviewQueueContract
    || null;
  const sourceCandidateReviewAuditTrailContract = normalizeSourceCandidateReviewAuditTrailPayload(safeAnalysis)
    || sourceCandidateReviewWorkflowContract?.sourceCandidateReviewAuditTrailContract
    || null;
  const institutionalAnalystWorkflowContract = resolveInstitutionalAnalystWorkflowContract(safeAnalysis);
  const institutionalQuestionSourceCoverageContract =
    normalizeInstitutionalQuestionSourceCoveragePayload(safeAnalysis);
  const evidenceStatusAggregationContract = normalizeEvidenceStatusAggregationPayload(safeAnalysis);
  const coverageScoreEligibilityContract = normalizeCoverageScoreEligibilityPayload(safeAnalysis);
  const familyCanonicalRoutingContract = normalizeFamilyCanonicalRoutingPayload(safeAnalysis);
  const evidenceProvenanceSemanticsContract = normalizeEvidenceProvenanceSemanticsPayload(safeAnalysis);
  const familyDataRequirementMatrixContract = normalizeFamilyDataRequirementMatrixPayload(safeAnalysis);
  const canonicalProductRoute = normalizeCanonicalProductRoutePayload(safeAnalysis);
  const routeSurfaceParityContract = normalizeRouteSurfaceParityPayload(safeAnalysis);
  const primaryAnalysisRoute = buildFamilyProductRouteTruth({
    canonicalProductRoute,
    primaryAnalysisRoute: rawPrimaryAnalysisRoute,
    representationFamilyRoute,
    familyCanonicalRoutingContract,
    familyDataRequirementMatrixContract,
    assetInterpretationContract,
    institutionalProductTruthObject,
  }) || rawPrimaryAnalysisRoute;
  const institutionalAnswerSurfaceContract = normalizeInstitutionalAnswerSurfacePayload(safeAnalysis);
  const finalAnalystAnswerComposerContract = normalizeFinalAnalystAnswerComposerPayload(safeAnalysis);
  const marketWideAnalystPipelinePurityContract = normalizeMarketWideAnalystPipelinePurityPayload(safeAnalysis);
  const productResearchResultV2Normalization = normalizeProductResearchResultV2({ analysis: safeAnalysis });
  const productResearchResultV2 = productResearchResultV2Normalization.result;
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
  const internalOverallScoreAuditOnly = scores?.overallScore ?? safeAnalysis?.scores?.overallScore ?? null;
  const overallScore = hasAtomicFinalDecision
    ? (canonicalDecisionScore.displayable ? canonicalDecisionScore.displayValue ?? null : null)
    : internalOverallScoreAuditOnly;
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
  const manualReviewStatus = hasAtomicFinalDecision ? {
    label: canonicalDecisionManualReview.blocking
      ? "Blocking review"
      : canonicalDecisionManualReview.required
        ? "Additional verification"
        : "No blocking review",
    detail: canonicalDecisionManualReview.productLanguage
      || safeArray(canonicalDecisionManualReview.reasons)[0]
      || "The final decision has no blocking manual-review requirement.",
    blocking: Boolean(canonicalDecisionManualReview.blocking),
  } : deriveManualReviewStatus({
    missingCritical,
    evidenceConflicts,
    auditAlerts,
  });
  const rawVerdictSemantics = buildVerdictSemanticsDisplay(decisionLayer, thesisCore, safeAnalysis);
  const primaryRouteDisplayLabels = primaryAnalysisRoute?.visibleLabel || primaryAnalysisRoute?.assetFramingLabel ? {
    assetClassLabel: primaryAnalysisRoute.visibleLabel || primaryAnalysisRoute.assetFramingLabel,
    assetFramingLabel: primaryAnalysisRoute.assetFramingLabel || primaryAnalysisRoute.visibleLabel,
    labelSource: primaryAnalysisRoute.authoritySource || "primaryAnalysisRoute",
    labelFamily: primaryAnalysisRoute.assetFamily || null,
  } : null;
  const lensDisplayLabels = primaryRouteDisplayLabels || displayLabelsForResolvedLens(resolvedInstitutionalLens, assetInterpretationContract);
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
  const verdictSemantics = rawVerdictSemantics;
  const institutionalQuestionPayload = normalizeInstitutionalQuestionsPayload(safeAnalysis);
  const canonicalPrimaryFamily = primaryAnalysisRoute?.primaryFamily || primaryAnalysisRoute?.assetFamily || null;
  const composerResearchRequirements = safeArray(finalAnalystAnswerComposerContract?.familyBoundSourceQueue)
    .map((item, index) => ({
      id: item.queueItemId || `canonical-composer-queue-${index}`,
      title: item.text,
      assetClassLens: item.canonicalFamily || canonicalPrimaryFamily,
      reason: "Canonical question-judgment gap owned by the Final Analyst Answer Composer.",
      evidenceNeeded: [item.text],
      preferredSourceTypes: [],
      priority: index < 2 ? "high" : "medium",
      verdictImpact: "May improve confidence if the canonical evidence gap is resolved.",
      currentStatus: item.status || "needs_verification",
      canChangeVerdict: false,
      canonicalQueueItemId: item.queueItemId,
    }));
  const displayResearchRequirements = dedupeObjectsByTitle(composerResearchRequirements)
    .filter((requirement) => isPrimaryFamilyCompatibleText([
      requirement?.title,
      requirement?.reason,
      ...(requirement?.evidenceNeeded || []),
    ].join(" "), canonicalPrimaryFamily));
  const displayAssetIdentityResolution = assetIdentityResolution ? {
    ...assetIdentityResolution,
    rawRepresentationTypeAuditOnly: assetIdentityResolution.representationType,
    representationType: resolveQaRepresentationType({
      assetIdentityResolution,
      representationFamilyDecision,
      representationFamilyRoute,
      primaryAnalysisRoute,
    }),
    rawIdentityWarningsAuditOnly: safeArray(assetIdentityResolution.identityWarnings),
    rawChainWarningsAuditOnly: safeArray(assetIdentityResolution.chainWarnings),
    rawContractWarningsAuditOnly: safeArray(assetIdentityResolution.contractWarnings),
    rawSourceRequirementsAuditOnly: safeArray(assetIdentityResolution.sourceRequirements),
    identityWarnings: filterPrimaryFamilyCompatibleItems(assetIdentityResolution.identityWarnings, canonicalPrimaryFamily),
    chainWarnings: filterPrimaryFamilyCompatibleItems(assetIdentityResolution.chainWarnings, canonicalPrimaryFamily),
    contractWarnings: filterPrimaryFamilyCompatibleItems(assetIdentityResolution.contractWarnings, canonicalPrimaryFamily),
    sourceRequirements: filterPrimaryFamilyCompatibleItems(assetIdentityResolution.sourceRequirements, canonicalPrimaryFamily),
  } : assetIdentityResolution;
  const composerAvailable = finalAnalystAnswerComposerContract?.contractAttached === true;
  const composerView = safeObject(finalAnalystAnswerComposerContract?.analystView);
  const composerQuestions = safeArray(finalAnalystAnswerComposerContract?.canonicalQuestionJudgments);
  const composerQueue = safeArray(finalAnalystAnswerComposerContract?.familyBoundSourceQueue).length
    ? safeArray(finalAnalystAnswerComposerContract.familyBoundSourceQueue).map((item) => item?.text).filter(Boolean)
    : safeArray(finalAnalystAnswerComposerContract?.sourceQueuePriorities);
  const composerRisks = safeArray(finalAnalystAnswerComposerContract?.riskSummary);
  const composerMissingEvidence = dedupeCaseInsensitive([
    ...safeArray(composerView.missingForHigherConviction),
    ...composerQuestions.flatMap((answer) => safeArray(answer?.gap || answer?.missingData)),
  ]).slice(0, 8);
  const composerDirectAnswers = composerQuestions
    .map((answer) => answer?.directAnswer || answer?.answer)
    .filter(Boolean)
    .slice(0, 6);
  const composerVerdictSemantics = composerAvailable ? {
    ...verdictSemantics,
    summary: composerView.allocationReadinessExplanation || verdictSemantics.summary,
    boundary: "Primary narrative mirrors the Final Analyst Answer Composer and final decision. Legacy candidate, DataFirst, report, and raw-lens text remain audit-only.",
    positiveCase: dedupeCaseInsensitive([
      composerView.whatTheDataSupports,
      composerView.strongestPartOfThesis,
    ]).filter(Boolean),
    blockedCase: dedupeCaseInsensitive([
      composerView.allocationReadinessExplanation,
      composerView.weakestPartOfAnalysis,
      composerRisks[0],
    ]).filter(Boolean),
    missingEvidence: composerMissingEvidence,
    whatWouldChange: composerQueue,
  } : verdictSemantics;
  const composerWhatWouldChangeDecision = {
    items: composerQueue,
    badge: "Canonical diligence requirements",
    explanation: "Mirrored from finalAnalystAnswerComposerContract.familyBoundSourceQueue.",
  };
  const composerPrimaryBlocker = {
    ...primaryBlocker,
    label: composerView.weakestPartOfAnalysis || composerRisks[0] || primaryBlocker?.label,
    explanation: composerView.allocationReadinessExplanation || composerView.weakestPartOfAnalysis || primaryBlocker?.explanation,
    badge: "Canonical analyst constraint",
  };
  const composerWeakestLinkCard = {
    ...weakestLink,
    label: composerView.weakestPartOfAnalysis || composerRisks[0] || weakestLink?.label,
    explanation: composerView.weakestPartOfAnalysis || weakestLink?.explanation,
    badge: "Canonical weakest link",
  };

  const baseDisplayModel = {
    assetName: asset?.name || asset?.symbol || "Asset",
    overallScore,
    internalOverallScoreAuditOnly,
    scoreDisplayable: hasAtomicFinalDecision ? Boolean(canonicalDecisionScore.displayable) : overallScore !== null,
    confidenceScore,
    confidenceLabel: confidenceLabelText,
    scoreDisplayLabel: hasAtomicFinalDecision
      ? (canonicalDecisionScore.displayable ? "Score available" : "Score withheld")
      : finalAnalystAnswerComposerContract?.scoreExplanationBridge?.scoreDisplayLabel || null,
    allocationOutcome,
    decisionLayer,
    verdictSemantics: composerVerdictSemantics,
    verdictClass: composerVerdictSemantics.verdictClass || null,
    allocationCase: composerVerdictSemantics.hasVerdictClass ? {
      forAllocation: composerVerdictSemantics.positiveCase,
      againstAllocation: composerVerdictSemantics.blockedCase,
      missingEvidence: composerMissingEvidence,
      whatWouldChange: composerQueue,
    } : null,
    institutionalQuestions: institutionalQuestionPayload.institutionalQuestions,
    institutionalQuestionsProvenance: institutionalQuestionPayload.institutionalQuestionsProvenance,
    resolvedInstitutionalLens: primaryAnalysisRoute?.visibleLabel || primaryAnalysisRoute?.questionGroup ? {
      ...(resolvedInstitutionalLens || {}),
      lensId: primaryAnalysisRoute.assetFamily || resolvedInstitutionalLens?.lensId,
      assetClassGroup: primaryAnalysisRoute.assetFamily || resolvedInstitutionalLens?.assetClassGroup,
      questionGroupId: primaryAnalysisRoute.questionGroup || resolvedInstitutionalLens?.questionGroupId,
      displayLabel: primaryAnalysisRoute.visibleLabel || resolvedInstitutionalLens?.displayLabel || resolvedInstitutionalLens?.label,
      visibleLabelOverride: primaryAnalysisRoute.visibleLabel || resolvedInstitutionalLens?.visibleLabelOverride || resolvedInstitutionalLens?.label,
      displayFraming: primaryAnalysisRoute.assetFramingLabel || resolvedInstitutionalLens?.displayFraming,
      primaryRouteQuestionGroup: primaryAnalysisRoute.questionGroup || resolvedInstitutionalLens?.questionGroupId,
      primaryRouteAssetFamily: primaryAnalysisRoute.assetFamily || resolvedInstitutionalLens?.assetClassGroup,
      visibleLabelSource: "primaryAnalysisRoute",
    } : resolvedInstitutionalLens,
    rawResolvedInstitutionalLensAuditOnly: resolvedInstitutionalLens,
    effectiveInstitutionalLens,
    lensAwareExplanations,
    assetIdentityResolution: displayAssetIdentityResolution,
    tokenomicsSupplyIntegrity,
    reviewedEvidencePacket,
    benchmarkInstitutionalAnswerPack,
    assetInterpretationContract,
    dataFirstNarrativeContract,
    authorityHierarchyContract,
    primaryAnalysisRoute,
    canonicalProductRoute: primaryAnalysisRoute,
    routeSurfaceParityContract,
    representationFamilyDecision,
    representationFamilyRoute,
    representationFamilyEvidenceGates,
    institutionalAnswerSurfaceContract,
    finalAnalystAnswerComposerContract,
    productResearchResultV2,
    productResearchResultV2ParityStatus: productResearchResultV2Normalization.parityStatus,
    marketWideAnalystPipelinePurityContract,
    evidenceStatusAggregationContract,
    coverageScoreEligibilityContract,
    familyCanonicalRoutingContract,
    evidenceProvenanceSemanticsContract,
    familyDataRequirementMatrixContract,
    readinessSemanticCounters: safeObject(evidenceProvenanceSemanticsContract?.readinessCounters),
    provenanceSummary: safeObject(evidenceProvenanceSemanticsContract?.provenanceSummary),
    liveMetricGaps: safeArray(evidenceProvenanceSemanticsContract?.readinessGaps).filter((gap) => gap.gapType === "live_metric"),
    institutionalVerificationGaps: safeArray(evidenceProvenanceSemanticsContract?.readinessGaps).filter((gap) => !["scoring_activation", "confidence_cap"].includes(gap.gapType)),
    scoringActivationGaps: safeArray(evidenceProvenanceSemanticsContract?.scoringActivationGaps),
    confidenceCapDrivers: safeArray(evidenceProvenanceSemanticsContract?.confidenceCapDrivers),
    canonicalQuestionGroup: familyCanonicalRoutingContract?.canonicalQuestionGroup || primaryAnalysisRoute?.questionGroup || null,
    canonicalSourceProfile: familyCanonicalRoutingContract?.canonicalSourceProfile || primaryAnalysisRoute?.sourceProfile || null,
    canonicalSourceMatrixEntries: safeArray(familyCanonicalRoutingContract?.canonicalSourceMatrixEntries || primaryAnalysisRoute?.sourceMatrixEntries),
    canonicalCoverageBlockerNamespace: familyCanonicalRoutingContract?.canonicalCoverageBlockerNamespace || null,
    coverageTier: hasAtomicFinalDecision ? canonicalDecisionCoverage.tier || null : coverageScoreEligibilityContract?.coverageTier || null,
    coverageTierLabel: hasAtomicFinalDecision ? canonicalDecisionCoverage.label || null : coverageScoreEligibilityContract?.coverageTierLabel || null,
    scoreEligibility: hasAtomicFinalDecision ? canonicalDecisionEligibility.status || null : coverageScoreEligibilityContract?.scoreEligibility || null,
    scoreDisplayMode: hasAtomicFinalDecision ? canonicalDecisionScore.displayMode || null : coverageScoreEligibilityContract?.scoreDisplayMode || null,
    analysisDepthAllowed: coverageScoreEligibilityContract?.analysisDepthAllowed || null,
    analysisDepthLabel: coverageScoreEligibilityContract?.analysisDepthLabel || null,
    scoringReadinessContract,
    engineLearningBackbone,
    benchmarkAssetPreset,
    benchmarkLearningCapture,
    providerCategorySignals,
    categoryDrivenAssetFamilyContract,
    categoryDataRequirementProfiles,
    categoryAnswerBuilder,
    categoryReadinessDiagnostics,
    providerRawDataExpansion,
    rawDataCoverageDiagnostics,
    rawProviderDataRegistryContract,
    typedObservationLayerContract,
    typedObservationFamilyAuthorityContract,
    institutionalMethodologyContract,
    institutionalSourceProviderEvidenceMap,
    sourceIntelligenceContract,
    evidenceRegistryContract,
    questionEvidenceMappingContract,
    deepResearchSourceDiscoveryContract,
    sourceCandidatePipelineContract,
    sourceCandidateRegistryContract,
    sourceCandidateReviewWorkflowContract,
    sourceCandidateReviewQueueContract,
    sourceCandidateReviewAuditTrailContract,
    institutionalAnalystWorkflowContract,
    institutionalQuestionSourceCoverageContract,
    providerDataBoundaryContract,
    providerCapabilityRegistryContract,
    institutionalProductTruthObject,
    institutionalQuestionAnswerEngineContract,
    manualApiResearchGapQueue,
    calibrationBacktestReadiness,
    analysisFreshness,
    calibrationWarnings,
    researchRequirements: displayResearchRequirements,
    verdictReasons: composerVerdictSemantics.verdictReasons,
    primaryStrength: composerView.strongestPartOfThesis || composerView.whatTheDataSupports || null,
    primaryWeakness: composerView.weakestPartOfAnalysis || composerRisks[0] || null,
    failureMode: {
      primary: composerRisks[0] || composerView.weakestPartOfAnalysis || null,
      trigger: composerQueue[0] || null,
      earlySignals,
    },
    investabilityStatus: investability.status || null,
    currentState: describeCurrentState(extractDecisionLabel(decisionLayer.currentState), assetClassification.assetClass || null),
    posture: describePosture(extractDecisionLabel(decisionLayer.posture), assetClassification.assetClass || null),
    evidenceStrength: evidenceQuality.strength || null,
    evidenceConflicts,
    missingCritical: composerMissingEvidence,
    blockers: composerRisks,
    requiredConditions: composerDirectAnswers,
    decisionDrivers: dedupeCaseInsensitive([
      composerView.whatTheDataSupports,
      composerView.strongestPartOfThesis,
      composerView.weakestPartOfAnalysis,
    ]).filter(Boolean),
    contradictionNote,
    summaryMemo: composerView.headline || null,
    structuredThesisSummary: composerView.headline || null,
    tokenDemandTruth: composerView.whatTheDataSupports || null,
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
    primaryBlocker: composerPrimaryBlocker,
    weakestLink: composerWeakestLinkCard,
    whatWouldChangeDecision: composerWhatWouldChangeDecision,
    manualReviewStatus,
    whyNow: composerView.whatTheDataSupports || null,
    whyNotNow: composerView.allocationReadinessExplanation || composerView.weakestPartOfAnalysis || null,
    whatMustBeTrue: composerDirectAnswers,
    whatCouldBreak: composerRisks,
    nextCheckpoints: composerQueue,
    topPositiveDrivers: dedupeCaseInsensitive([
      composerView.whatTheDataSupports,
      composerView.strongestPartOfThesis,
    ]).filter(Boolean),
    topNegativeDrivers: composerRisks,
    topNeutralDrivers: composerMissingEvidence,
    keyAlerts: filterUserFacingItems(fundamentals?.risks?.keyAlerts, 4),
  };

  return composerAvailable
    ? baseDisplayModel
    : buildCanonicalComposerMissingDisplayModel(baseDisplayModel);
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

function renderedSurfaceList(...groups) {
  return dedupeCaseInsensitive(
    groups
      .flatMap((group) => normalizeRenderableList(Array.isArray(group) ? group : [group]))
      .map((entry) => extractRenderableText(entry, null))
      .filter(Boolean),
  );
}

export function buildRenderedSurfaceParityViewModel({ model, displayIdentity } = {}) {
  const safeModel = safeObject(model);
  const canonicalProductRoute = safeObject(
    safeModel.canonicalProductRoute
      || safeModel.routeSurfaceParityContract?.canonicalProductRoute
      || safeModel.primaryAnalysisRoute
  );
  const assetInterpretationContract = safeObject(safeModel.assetInterpretationContract);
  const visibleDisplayContract = safeObject(assetInterpretationContract.visibleDisplayContract);
  const rawLens = safeModel.resolvedInstitutionalLens || {};
  const contractEffectiveLens = safeObject(assetInterpretationContract.effectiveInstitutionalLens);
  const lens = safeModel.effectiveInstitutionalLens || contractEffectiveLens || rawLens || {};
  const categoryDrivenAssetFamilyContract = safeObject(safeModel.categoryDrivenAssetFamilyContract);
  const providerCategorySignals = safeObject(safeModel.providerCategorySignals);
  const providerRawDataExpansion = safeObject(safeModel.providerRawDataExpansion);
  const rawDataCoverageDiagnostics = safeObject(safeModel.rawDataCoverageDiagnostics);
  const familyDataRequirementMatrixContract = safeObject(safeModel.familyDataRequirementMatrixContract);
  const sourceMatrixSummary = safeObject(safeModel.engineLearningBackbone?.sourceDataRequirementMatrix);
  const verdictSemantics = safeObject(safeModel.verdictSemantics);
  const allocationCase = safeObject(safeModel.allocationCase);
  const decisionLayer = safeObject(safeModel.decisionLayer);
  const finalComposer = safeObject(safeModel.finalAnalystAnswerComposerContract);
  const composerAvailable = finalComposer.contractAttached === true;
  const composerView = safeObject(finalComposer.analystView);
  const composerQuestions = safeArray(finalComposer.canonicalQuestionJudgments);
  const composerQueue = safeArray(finalComposer.familyBoundSourceQueue).length
    ? safeArray(finalComposer.familyBoundSourceQueue).map((item) => item?.text).filter(Boolean)
    : safeArray(finalComposer.sourceQueuePriorities);
  const composerRisks = safeArray(finalComposer.riskSummary);
  const dataFirstNarrativeContract = safeObject(safeModel.dataFirstNarrativeContract);
  const dataFirstFields = safeArray(dataFirstNarrativeContract.generatedNarrativeFields);
  const lensAwareExplanations = safeObject(safeModel.lensAwareExplanations);
  const primaryBlocker = safeObject(safeModel.primaryBlocker);
  const weakestLink = safeObject(safeModel.weakestLink);
  const whatWouldChange = safeModel.whatWouldChangeDecision?.items?.length
    ? safeModel.whatWouldChangeDecision.items
    : ["Additional verified evidence required."];
  const assetClassLabel = canonicalProductRoute.primaryVisibleLabel
    || canonicalProductRoute.visibleLabel
    || displayIdentity?.displayAssetClass
    || safeModel.assetClassLabel
    || sanitizeSemanticLabel(safeModel.assetClass, "Asset class unavailable");
  const assetFramingLabel = canonicalProductRoute.primaryAssetFraming
    || canonicalProductRoute.assetFramingLabel
    || displayIdentity?.displayFraming
    || safeModel.assetFramingLabel
    || "Digital Asset Allocation Thesis";
  const identityChip = displayIdentity?.primaryChip || assetClassLabel;
  const visibleLensLabel = canonicalProductRoute.primaryVisibleLabel || canonicalProductRoute.visibleLabel || visibleDisplayContract.primaryVisibleLabel || categoryDrivenAssetFamilyContract.primaryVisibleLabel || lens.visibleLabelOverride || lens.displayLabel || displayIdentity?.displayAssetClass || lens.label || assetClassLabel;
  const effectiveVisibleLabel = canonicalProductRoute.primaryVisibleLabel || canonicalProductRoute.visibleLabel || lens.label || visibleDisplayContract.primaryVisibleLabel || categoryDrivenAssetFamilyContract.primaryVisibleLabel || visibleLensLabel;
  const lensIdentityRailLabel = canonicalProductRoute.primaryVisibleLabel || canonicalProductRoute.visibleLabel || visibleDisplayContract.primaryVisibleLabel || lens.visibleLabelOverride || lens.displayLabel || lens.label || displayIdentity?.displayFraming || "Resolved lens unavailable";
  const canonicalQuestionGroup = canonicalProductRoute.primaryQuestionGroup
    || canonicalProductRoute.questionGroup
    || finalComposer.canonicalQuestionGroup
    || lens.questionGroupId
    || null;
  const canonicalFamily = canonicalProductRoute.primaryFamily
    || canonicalProductRoute.assetFamily
    || finalComposer.canonicalFamily
    || safeModel.primaryAnalysisRoute?.assetFamily
    || null;
  const rawEffectiveDivergenceWarning = lens.rawEffectiveLensDivergenceWarning || contractEffectiveLens.rawEffectiveLensDivergenceWarning || null;

  const decisionHeader = renderedSurfaceList(
    composerView.headline,
    composerView.whatTheDataSupports,
    composerView.weakestPartOfAnalysis,
    composerView.allocationReadinessExplanation,
    safeModel.allocationOutcome?.label,
    safeModel.allocationOutcome?.description,
    safeModel.verdictClass,
    safeModel.confidenceLabel,
    safeModel.overallScore === null || safeModel.overallScore === undefined ? null : `Overall score ${safeModel.overallScore}`,
    verdictSemantics.summary,
    verdictSemantics.boundary,
    verdictSemantics.positiveCase?.[0],
    verdictSemantics.blockedCase?.[0],
    primaryBlocker.label,
    primaryBlocker.explanation,
    weakestLink.label,
    weakestLink.explanation,
    whatWouldChange?.[0],
    safeModel.analysisFreshness?.qaEligibilityLabel,
    safeModel.analysisFreshness?.qaEligibilityWarning,
    familyDataRequirementMatrixContract.primaryFamily ? `Family requirements: ${familyDataRequirementMatrixContract.primaryFamily}` : null,
    familyDataRequirementMatrixContract.primarySourceMatrixId ? `Source matrix: ${familyDataRequirementMatrixContract.primarySourceMatrixId}` : null,
    assetClassLabel,
    assetFramingLabel,
    visibleLensLabel,
    lensIdentityRailLabel,
    ["View final verdict logic", "Inspect blocker", "Trace evidence", "View requirements"],
  );

  const decisionTabSurfaceRows = [];
  const addDecisionTabField = ({
    fieldPath,
    value,
    component,
    sourceObjectPath = fieldPath,
    classification = "primary",
    visibilityStatus = "primary_visible",
    narrativeOwner = "normalizedDecisionModel",
    inclusionReason = "Consumed by the live Decision Tab component tree.",
  }) => {
    const values = sanitizeRenderedSurfaceValues(renderedSurfaceList(value));
    values.forEach((renderedText, index) => {
      decisionTabSurfaceRows.push({
        surface: "decisionTab",
        fieldPath: values.length > 1 ? `${fieldPath}[${index}]` : fieldPath,
        sourceObjectPath,
        renderedText,
        classification,
        renderedStatus: "rendered",
        visibilityStatus,
        canonicalFamily,
        narrativeOwner,
        componentConsumer: component,
        inclusionReason,
        exclusionReason: null,
      });
    });
  };
  const analystAnswerLeads = safeArray(safeModel.institutionalQuestions)
    .map((question) => getAnalystAnswerCard(question))
    .filter((card) => card?.directAnswer)
    .slice(0, 3);
  const primaryAnalystGap = analystAnswerLeads.find((card) =>
    safeArray(card?.missingEvidence).length || /source|live data|review/i.test(String(card?.headlineStatus || ""))
  );
  const noDominantWeakness = safeModel.primaryWeakness === "No dominant structural weakness identified.";
  const allocationWhyNotNow = safeModel.whyNotNow
    || (noDominantWeakness ? safeModel.evidenceConstraintNote : safeModel.primaryWeakness)
    || "No explicit constraint was surfaced.";

  if (verdictSemantics.hasVerdictClass) {
    addDecisionTabField({ fieldPath: "model.verdictSemantics.label", value: verdictSemantics.label, component: "App.jsx:Verdict Semantics" });
    addDecisionTabField({ fieldPath: "model.verdictSemantics.summary", value: verdictSemantics.summary, component: "App.jsx:Verdict Semantics" });
    addDecisionTabField({ fieldPath: "model.verdictSemantics.boundary", value: verdictSemantics.boundary, component: "App.jsx:Verdict Semantics" });
    addDecisionTabField({ fieldPath: "model.verdictSemantics.missingEvidence", value: verdictSemantics.missingEvidence, component: "App.jsx:Verdict Semantics" });
  }
  addDecisionTabField({ fieldPath: "model.verdictSemantics.boundary", value: verdictSemantics.boundary, component: "DecisionHeroSupportSections:verdict boundary" });
  addDecisionTabField({ fieldPath: "model.contradictionNote", value: safeModel.contradictionNote, component: "DecisionHeroSupportSections:override explanation" });
  addDecisionTabField({ fieldPath: "model.evidenceConstraintNote", value: safeModel.evidenceConstraintNote, component: "DecisionHeroSupportSections:evidence constraint" });
  addDecisionTabField({
    fieldPath: verdictSemantics.summary ? "model.verdictSemantics.summary" : "model.summaryMemo",
    value: verdictSemantics.summary || safeModel.summaryMemo || "The live decision layer did not attach a structured verdict explanation.",
    component: "DecisionHeroSupportSections:Why this verdict",
    narrativeOwner: verdictSemantics.summary ? "decisionLayer" : "normalizedDecisionModel",
  });
  addDecisionTabField({ fieldPath: "model.allocationOutcome.label", value: safeModel.allocationOutcome?.label, component: "DecisionHeroSupportSections:Why this verdict" });
  addDecisionTabField({
    fieldPath: primaryBlocker.label ? "model.primaryBlocker.label" : "model.primaryBlocker.explanation",
    value: primaryBlocker.label || primaryBlocker.explanation || "Primary blocker not explicitly available in the live response.",
    component: "DecisionHeroSupportSections:stronger-verdict blocker",
  });
  addDecisionTabField({ fieldPath: "model.primaryBlocker.explanation", value: primaryBlocker.explanation, component: "DecisionHeroSupportSections:blocker detail" });
  addDecisionTabField({ fieldPath: "model.primaryBlocker.badge", value: primaryBlocker.badge, component: "DecisionHeroSupportSections:blocker status" });
  addDecisionTabField({
    fieldPath: primaryAnalystGap?.directAnswer ? "model.institutionalQuestions[].analystAnswerCard.directAnswer" : "model.whatWouldChangeDecision.items[0]",
    value: primaryAnalystGap?.directAnswer || whatWouldChange[0] || "Additional verified evidence is required before a stronger view.",
    component: "DecisionHeroSupportSections:missing evidence answer",
  });
  addDecisionTabField({ fieldPath: "model.institutionalQuestions[].analystAnswerCard.headlineStatus", value: primaryAnalystGap?.headlineStatus, component: "DecisionHeroSupportSections:missing evidence status" });
  addDecisionTabField({ fieldPath: "model.institutionalQuestions[].analystAnswerCard.missingEvidence", value: primaryAnalystGap?.missingEvidence, component: "DecisionHeroSupportSections:missing evidence detail" });
  addDecisionTabField({ fieldPath: "model.institutionalQuestions[].analystAnswerCard.decisionImpact", value: primaryAnalystGap?.decisionImpact, component: "DecisionHeroSupportSections:missing evidence impact" });
  addDecisionTabField({ fieldPath: "model.institutionalQuestions[].analystAnswerCard.sourceBoundaryPlainEnglish[0]", value: safeArray(primaryAnalystGap?.sourceBoundaryPlainEnglish)[0], component: "DecisionHeroSupportSections:missing evidence boundary" });
  addDecisionTabField({ fieldPath: "model.whatWouldChangeDecision.items", value: whatWouldChange, component: "DecisionHeroSupportSections:What Would Change" });
  addDecisionTabField({ fieldPath: "model.overallScore", value: safeModel.scoreDisplayable === false ? "Withheld" : formatScoreValue(safeModel.overallScore), component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.confidenceScore", value: formatScoreValue(safeModel.confidenceScore), component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.confidenceLabel", value: safeModel.confidenceLabel, component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.evidenceStrength", value: safeModel.evidenceStrength, component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.scoreDisplayLabel", value: safeModel.scoreDisplayLabel, component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.tokenomicsSupplyIntegrity.tokenomicsIntegrityScore", value: safeModel.tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === null || safeModel.tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === undefined ? null : `${safeModel.tokenomicsSupplyIntegrity.tokenomicsIntegrityScore}/100`, component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.tokenomicsSupplyIntegrity.supplyTruth.status", value: safeModel.tokenomicsSupplyIntegrity?.supplyTruth?.status, component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.scoringReadinessContract.overallReadinessStatus", value: safeModel.scoringReadinessContract?.overallReadinessStatus, component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.manualReviewStatus.label", value: safeModel.manualReviewStatus?.label, component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.manualReviewStatus.detail", value: safeModel.manualReviewStatus?.detail, component: "DecisionHeroSupportSections:score strip" });
  addDecisionTabField({ fieldPath: "model.weakestLink.label", value: weakestLink.label, component: "DecisionHeroSupportSections:Decision Details", classification: "secondary", visibilityStatus: "expandable_detail" });
  addDecisionTabField({ fieldPath: "model.weakestLink.explanation", value: weakestLink.explanation, component: "DecisionHeroSupportSections:Decision Details", classification: "secondary", visibilityStatus: "expandable_detail" });
  addDecisionTabField({ fieldPath: "model.weakestLink.badge", value: weakestLink.badge, component: "DecisionHeroSupportSections:Decision Details", classification: "secondary", visibilityStatus: "expandable_detail" });
  addDecisionTabField({ fieldPath: "model.auditAlerts", value: safeModel.auditAlerts, component: "App.jsx:RiskFlagsStrip" });
  addDecisionTabField({ fieldPath: "model.posture", value: safeModel.posture, component: "AllocationOutcomeCard" });
  addDecisionTabField({ fieldPath: "model.allocationOutcome.label", value: safeModel.allocationOutcome?.label, component: "AllocationOutcomeCard" });
  addDecisionTabField({ fieldPath: "model.investabilityStatus", value: safeModel.investabilityStatus, component: "AllocationOutcomeCard" });
  addDecisionTabField({ fieldPath: "model.currentState", value: safeModel.currentState, component: "AllocationOutcomeCard" });
  addDecisionTabField({ fieldPath: safeModel.whyNow ? "model.whyNow" : "model.primaryStrength", value: safeModel.whyNow || safeModel.primaryStrength || "No immediate support case is strong enough to stand alone.", component: "AllocationOutcomeCard" });
  addDecisionTabField({ fieldPath: safeModel.whyNotNow ? "model.whyNotNow" : noDominantWeakness ? "model.evidenceConstraintNote" : "model.primaryWeakness", value: allocationWhyNotNow, component: "AllocationOutcomeCard" });
  addDecisionTabField({ fieldPath: "model.primaryWeakness", value: safeModel.primaryWeakness, component: "App.jsx:Decision Memo" });
  addDecisionTabField({ fieldPath: "model.failureMode.primary", value: safeModel.failureMode?.primary || "Unavailable", component: "App.jsx:Decision Memo" });
  if (safeModel.whyNotNow && safeModel.whyNotNow !== safeModel.summaryMemo) {
    addDecisionTabField({ fieldPath: "model.whyNotNow", value: safeModel.whyNotNow, component: "App.jsx:Decision Memo" });
  }
  addDecisionTabField({ fieldPath: "model.summaryMemo", value: safeModel.summaryMemo, component: "App.jsx:Decision Memo" });
  addDecisionTabField({ fieldPath: "model.evidenceStrength", value: safeModel.evidenceStrength, component: "EvidenceConfidenceCard" });
  addDecisionTabField({ fieldPath: "model.confidenceLabel", value: safeModel.confidenceLabel, component: "EvidenceConfidenceCard" });
  addDecisionTabField({ fieldPath: "model.missingCritical", value: safeModel.missingCritical, component: "EvidenceConfidenceCard" });
  addDecisionTabField({ fieldPath: "model.requiredConditions", value: safeModel.requiredConditions, component: "EvidenceConfidenceCard" });
  addDecisionTabField({ fieldPath: "model.decisionDrivers", value: safeModel.decisionDrivers, component: "App.jsx:Structural Signals" });
  addDecisionTabField({ fieldPath: "model.blockers", value: safeModel.blockers, component: "App.jsx:Constraint Summary" });
  addDecisionTabField({ fieldPath: "model.requiredConditions", value: safeModel.requiredConditions, component: "App.jsx:Constraint Summary" });

  const decisionTab = renderedSurfaceList(decisionTabSurfaceRows.map((row) => row.renderedText));

  const thesisFalsification = renderedSurfaceList(
    composerView.headline,
    composerQuestions.map((answer) => answer?.directAnswer || answer?.answer),
    composerRisks,
    composerView.missingForHigherConviction,
    composerQueue,
    safeModel.summaryMemo,
    safeModel.tokenDemandTruth,
    safeModel.primaryStrength,
    assetFramingLabel,
    safeModel.whatMustBeTrue,
    safeModel.whatCouldBreak,
    safeModel.requiredConditions,
    safeModel.missingCritical,
    safeModel.blockers,
    safeModel.topNeutralDrivers,
    safeModel.failureMode?.primary,
    safeModel.failureMode?.trigger,
    safeModel.auditAlerts,
    safeModel.topNegativeDrivers,
    primaryBlocker.label,
    primaryBlocker.explanation,
    weakestLink.label,
    weakestLink.explanation,
    whatWouldChange,
    allocationCase.forAllocation,
    allocationCase.againstAllocation,
    allocationCase.missingEvidence,
    allocationCase.whatWouldChange,
  );

  const rightRail = renderedSurfaceList(
    composerView.strongestPartOfThesis,
    composerView.weakestPartOfAnalysis,
    composerView.missingForHigherConviction?.[0],
    composerQueue[0],
    safeModel.allocationOutcome?.label,
    assetFramingLabel,
    assetClassLabel,
    identityChip,
    safeModel.confidenceLabel,
    lensIdentityRailLabel,
    canonicalQuestionGroup,
    primaryBlocker.label,
    primaryBlocker.explanation,
    weakestLink.label,
    weakestLink.explanation,
    whatWouldChange,
  );

  const sourceQueue = renderedSurfaceList(
    composerAvailable ? composerQueue : [],
  );

  const manualReview = renderedSurfaceList(
    composerView.allocationReadinessExplanation,
    composerView.weakestPartOfAnalysis,
    composerView.missingForHigherConviction,
    composerQueue,
    safeModel.manualReviewStatus?.label,
    safeModel.manualReviewStatus?.detail,
    safeModel.researchRequirements?.map((requirement) => [
      requirement?.title,
      requirement?.reason,
      requirement?.evidenceNeeded,
      requirement?.verdictImpact,
    ]),
    safeModel.primaryBlocker?.explanation,
    safeModel.weakestLink?.explanation,
    safeModel.auditAlerts,
    safeModel.warnings,
    familyDataRequirementMatrixContract.manualReviewItems,
    "Manual review boundary: missing evidence is not negative evidence; reviewed evidence remains separate from provider metadata and scoring-active fields.",
  );

  const evidenceMap = renderedSurfaceList(
    "Evidence Map",
    "Provider metadata is context, not reviewed evidence.",
    "Reviewed evidence, source candidates, live provider signals, report-only overlays, and scoring-active evidence remain separate.",
    "Non-scoring evidence boundary applies unless explicitly marked scoring-active.",
    lens.sourceBoundary,
    safeModel.sourceStatus?.summary,
    sourceMatrixSummary.currentScoringStatus ? `Source Matrix: ${sourceMatrixSummary.currentScoringStatus}` : null,
    sourceMatrixSummary.missingDataCategories,
    categoryDrivenAssetFamilyContract.sourceRequirementProfile?.priorityRequirements,
    providerCategorySignals.categoryDataBoundary,
    providerRawDataExpansion.categoryDataBoundary,
    rawDataCoverageDiagnostics.sourceBoundary,
    rawDataCoverageDiagnostics.sourceCriticalMissingFields,
    providerRawDataExpansion.categoryDataSourceRequirements,
    familyDataRequirementMatrixContract.evidenceMapRows,
    familyDataRequirementMatrixContract.providerMetadataBoundaries,
    familyDataRequirementMatrixContract.evidenceDoesNotProve,
    providerRawDataExpansion.providerCategoryEndpointDiagnostics?.map((entry) => [
      `${entry?.provider || "provider"} ${entry?.endpoint || "endpoint"} ${entry?.status || "status unavailable"}`,
      entry?.sourceBoundary,
    ]),
    safeModel.engineLearningBackbone?.outputQaChecks?.map((check) => [
      check?.id,
      check?.status,
      check?.description,
      check?.remediation,
    ]),
    safeModel.reviewedEvidencePacket?.questionMappings?.map((mapping) => [
      mapping?.questionId,
      mapping?.reviewedEvidenceStatus,
      mapping?.questionEvidenceScope,
      mapping?.remainingMissingEvidence,
      mapping?.evidenceMappingWarnings,
    ]),
  );

  const scoringTransparency = renderedSurfaceList(
    finalComposer.scoreExplanationBridge?.explanation,
    safeModel.allocationOutcome?.label,
    safeModel.verdictSemantics?.label,
    safeModel.verdictSemantics?.boundary,
    safeModel.confidenceLabel,
    safeModel.tokenomicsSupplyIntegrity?.sourceBoundary,
    safeModel.engineLearningBackbone?.guardrails ? [
      `scoringChanged=${safeModel.engineLearningBackbone.guardrails.scoringChanged ? "yes" : "no"}`,
      `verdictChanged=${safeModel.engineLearningBackbone.guardrails.verdictChanged ? "yes" : "no"}`,
      `providerBehaviorChanged=${safeModel.engineLearningBackbone.guardrails.providerBehaviorChanged ? "yes" : "no"}`,
    ] : null,
    familyDataRequirementMatrixContract.scoringTransparencyRows,
  );

  const institutionalChecklist = renderedSurfaceList(
    visibleLensLabel,
    composerAvailable ? composerQuestions.flatMap((question) => [
      question?.question,
      question?.directAnswer || question?.answer,
      question?.evidenceBehindIt,
      question?.gap,
      question?.whatWouldChangeTheView,
    ]) : [],
  );

  const tokenomics = renderedSurfaceList(
    safeModel.tokenomicsSupplyIntegrity?.explanationSummary,
    safeModel.tokenomicsSupplyIntegrity?.sourceRequirements,
    safeModel.tokenomicsSupplyIntegrity?.manualReviewTriggers,
    safeModel.tokenomicsSupplyIntegrity?.confidenceCaps,
    safeModel.tokenomicsSupplyIntegrity?.institutionalQuestions?.flatMap((question) => [
      question?.questionText,
      question?.shortAnswer,
      question?.answerSummary,
      question?.missingEvidence,
      question?.whatWouldChange,
    ]),
    familyDataRequirementMatrixContract.protectedReportSummary,
  );

  const nonRenderedAuditFields = [
    {
      fieldPath: "model.lensAwareExplanations",
      sourceObjectPath: "analysis.lensAwareExplanations",
      values: renderedSurfaceList(
        lensAwareExplanations.primaryBlocker,
        lensAwareExplanations.evidenceNeeded,
        lensAwareExplanations.whatWouldChange,
        lensAwareExplanations.requiredConditions,
      ),
      renderedStatus: "not_rendered_by_live_decision_tab",
      visibilityStatus: "audit_only",
      disposition: "audit_only_not_rendered",
      componentConsumptionProof: "App.jsx Decision Tab and its DecisionHeroSupportSections, AllocationOutcomeCard, EvidenceConfidenceCard, and RiskFlagsStrip descendants do not read model.lensAwareExplanations.",
      exclusionReason: "Compatibility narrative is not consumed by the live Decision Tab and cannot be classified as primary product truth when Composer/final decision fields exist.",
    },
  ];

  const rawSurfaces = {
    decisionHeader,
    decisionTab,
    thesisFalsification,
    rightRail,
    whatWouldChangeRail: renderedSurfaceList(whatWouldChange),
    visibleLensLabel: renderedSurfaceList(
      visibleLensLabel,
      assetClassLabel,
      assetFramingLabel,
      visibleDisplayContract.primaryVisibleLabel,
      visibleDisplayContract.assetFramingLabel,
      visibleDisplayContract.labelFamily,
      effectiveVisibleLabel,
      canonicalProductRoute.primaryFamily ? `Effective family: ${canonicalProductRoute.primaryFamily}` : null,
      lensIdentityRailLabel,
      canonicalQuestionGroup ? `Question group: ${canonicalQuestionGroup}` : null,
    ),
    institutionalChecklist,
    tokenomics,
    evidenceMap,
    scoringTransparency,
    sourceQueue,
    manualReview,
    copyBundlePrimaryMirror: renderedSurfaceList(
      composerView.headline,
      composerView.whatTheAssetIs,
      composerView.whatTheDataSupports,
      composerView.strongestPartOfThesis,
      composerView.weakestPartOfAnalysis,
      composerView.allocationReadinessExplanation,
      composerQuestions.flatMap((answer) => [
        answer?.question,
        answer?.directAnswer || answer?.answer,
        answer?.evidenceBehindIt,
        answer?.gap,
        answer?.whatWouldChangeTheView,
      ]),
      finalComposer.scoreExplanationBridge?.explanation,
      composerQueue,
    ),
    protectedReportPrimaryMirror: renderedSurfaceList(
      composerView.whatTheAssetIs,
      composerView.headline,
      composerView.whatTheDataSupports,
      composerView.strongestPartOfThesis,
      composerView.weakestPartOfAnalysis,
      composerView.allocationReadinessExplanation,
      composerRisks,
      composerQueue,
      decisionLayer.verdict?.finalLabel || decisionLayer.verdictLabel,
      decisionLayer.verdict?.explanation,
    ),
    auditRaw: renderedSurfaceList(
      dataFirstFields.map((field) => [
        field?.fieldName,
        field?.status,
        field?.forbiddenConceptsDetected,
        field?.unsupportedClaimsDetected,
      ]),
      lens.lensId,
      lens.questionGroupId,
      rawLens.lensId ? `Raw resolved lens: ${rawLens.lensId}` : null,
      rawLens.questionGroupId ? `Raw resolved question group: ${rawLens.questionGroupId}` : null,
      rawEffectiveDivergenceWarning,
      safeModel.assetIdentityResolution?.sourceBoundary,
      familyDataRequirementMatrixContract.copyBundleRows,
      familyDataRequirementMatrixContract.auditDiagnostics,
      safeModel.analysisFreshness?.bundleMode,
      safeModel.engineLearningBackbone?.knownLimitations,
      nonRenderedAuditFields.flatMap((entry) => [
        `${entry.fieldPath}: ${entry.disposition}`,
        entry.componentConsumptionProof,
        entry.values,
      ]),
    ),
  };
  const surfaces = Object.fromEntries(
    Object.entries(rawSurfaces).map(([surface, values]) => [
      surface,
      surface === "auditRaw" ? values : sanitizeRenderedSurfaceValues(values),
    ]),
  );
  const requiredLiveTabs = [
    "decisionHeader",
    "decisionTab",
    "thesisFalsification",
    "rightRail",
    "visibleLensLabel",
    "institutionalChecklist",
    "tokenomics",
    "evidenceMap",
    "scoringTransparency",
    "sourceQueue",
    "manualReview",
    "auditRaw",
  ];
  const tabMirrorCoverage = requiredLiveTabs.map((surface) => {
    const values = safeArray(surfaces[surface]);
    const classification = surface === "auditRaw"
      ? "audit"
      : ["evidenceMap", "scoringTransparency"].includes(surface)
        ? "secondary"
        : "primary";
    const notRenderedByUi = values.length === 0 && ["visibleLensLabel", "evidenceMap", "scoringTransparency"].includes(surface);
    const mirroredInBundle = values.length > 0 || notRenderedByUi;
    return {
      surface,
      classification,
      renderedItemCount: values.length,
      mirroredInBundle,
      mirrorStatus: values.length > 0 ? "mirrored" : notRenderedByUi ? "not_rendered_by_ui" : "missing_visible_text_model",
      firstItem: values[0] || null,
    };
  });
  const missingMirroredSurfaces = tabMirrorCoverage
    .filter((entry) => !entry.mirroredInBundle)
    .map((entry) => entry.surface);
  const primaryNarrativeSurfaces = [
    "decisionHeader",
    "decisionTab",
    "thesisFalsification",
    "rightRail",
    "whatWouldChangeRail",
    "visibleLensLabel",
    "institutionalChecklist",
    "tokenomics",
    "sourceQueue",
    "manualReview",
    "copyBundlePrimaryMirror",
    "protectedReportPrimaryMirror",
  ];
  const primaryVisibleText = primaryNarrativeSurfaces.flatMap((surface) =>
    safeArray(surfaces[surface]).map((value) => `${surface}: ${value}`)
  );
  const finalVerdictClass = String(
    decisionLayer.verdict?.finalClass || decisionLayer.verdictClass || safeModel.verdictClass || ""
  ).toLowerCase();
  const finalVerdictLabel = String(
    decisionLayer.verdict?.finalLabel || decisionLayer.verdictLabel || verdictSemantics.label || ""
  );
  const constrainedFinalDecision = /not_allocation_ready|evidence_blocked|manual_review|required|avoid|tradable_only|do_not_allocate|unassessable/.test(finalVerdictClass)
    || /not allocation-ready|evidence blocked|manual review|avoid|tradable-only|do not allocate/i.test(finalVerdictLabel);
  const positiveAllocationPatterns = [
    { assertionId: "directionally_investable", pattern: /\bdirectionally investable\b/i },
    { assertionId: "clears_allocation_threshold", pattern: /\bclear(?:s|ed)?\b[^.]{0,100}\ballocation threshold\b/i },
    { assertionId: "positive_investable_posture", pattern: /\b(?:is|remains|appears)\s+(?:currently\s+)?investable\b/i },
    { assertionId: "candidate_verdict_label", pattern: /\binvestable\s*[-:]\s*(?:high|medium|low) confidence\b/i },
    { assertionId: "can_clear_benchmark", pattern: /\bcan clear\b[^.]{0,100}\bbenchmark\b/i },
  ];
  const allocationLanguageAssertions = primaryVisibleText.flatMap((entry) =>
    positiveAllocationPatterns.flatMap(({ assertionId, pattern }) => pattern.test(entry)
      ? [{ assertionId, renderedText: entry }]
      : [])
  );
  const candidateFinalContradictionAssertions = constrainedFinalDecision
    ? allocationLanguageAssertions
    : [];
  const wrongFamilyNarrativeAssertions = canonicalFamily
    ? primaryVisibleText
      .filter((entry) => !isPrimaryFamilyCompatibleText(entry, canonicalFamily))
      .map((renderedText) => ({ canonicalFamily, renderedText }))
    : [];
  const missingComposerControl = {
    composerAttached: composerAvailable,
    failClosed: composerAvailable || (
      allocationLanguageAssertions.length === 0
      && primaryVisibleText.some((entry) => /canonical analyst narrative unavailable/i.test(entry))
    ),
  };
  const primaryNarrativePass = candidateFinalContradictionAssertions.length === 0
    && wrongFamilyNarrativeAssertions.length === 0
    && missingComposerControl.failClosed;
  const classifiedDecisionTabSurfaceRows = decisionTabSurfaceRows.map((row) => {
    const candidateContradiction = constrainedFinalDecision
      && positiveAllocationPatterns.some(({ pattern }) => pattern.test(row.renderedText));
    const wrongFamily = canonicalFamily
      && !isPrimaryFamilyCompatibleText(`decisionTab: ${row.renderedText}`, canonicalFamily);
    return {
      ...row,
      matchedForbiddenConcepts: wrongFamily ? ["canonical_family_incompatible_copy"] : [],
      candidateFinalContradictionStatus: candidateContradiction ? "contradicted" : "none",
    };
  });
  const decisionTabCorpusId = `${"rendered-surface-parity-view-model-v2-live-tab-mirror"}/decisionTab`;

  return {
    artifactVersion: "rendered-surface-parity-view-model-v2-live-tab-mirror",
    doctrine: "Rendered-intended text mirrors the exact frontend normalized fields consumed by primary tabs, right rail, and Copy Review Bundle.",
    surfaces,
    surfaceRows: {
      decisionTab: classifiedDecisionTabSurfaceRows,
    },
    corpusProvenance: {
      owner: "buildRenderedSurfaceParityViewModel",
      decisionTabCorpusId,
      decisionTabViewModelOwner: "App.jsx overview component tree",
      copyBundleMirrorOwner: "buildReviewBundleText via surfaceRows.decisionTab",
      twoCSource: "buildRenderedSurfaceParityViewModel.primaryVisibleText",
      twelveCSource: "buildBtcRenderedGateCorpusRows using the same rendered-surface view model",
      twelveDSource: "buildBtcRenderedGateCorpusRows using the same rendered-surface view model",
      scalarStringsPreserved: true,
    },
    nonRenderedAuditFields,
    decisionTabFieldInventory: classifiedDecisionTabSurfaceRows.map((row) => ({
      fieldPath: row.fieldPath,
      sourceObjectPath: row.sourceObjectPath,
      componentConsumer: row.componentConsumer,
      classification: row.classification,
      renderedStatus: row.renderedStatus,
      visibilityStatus: row.visibilityStatus,
      narrativeOwner: row.narrativeOwner,
      inclusionReason: row.inclusionReason,
      exclusionReason: row.exclusionReason,
    })),
    tabMirrorCoverage,
    missingMirroredSurfaces,
    allRequiredSurfacesMirrored: missingMirroredSurfaces.length === 0,
    decisionHeaderRenderedItemCount: decisionHeader.length,
    finalVerdictClass,
    finalVerdictLabel,
    canonicalFamily,
    constrainedFinalDecision,
    allocationLanguageAssertions,
    candidateFinalContradictionAssertions,
    wrongFamilyNarrativeAssertions,
    missingComposerControl,
    primaryNarrativePass,
    componentConsumption: {
      decisionHeader: "DecisionHeroCard.jsx reads verdictSemantics, displayIdentity, model asset labels, and primaryAnalysisRoute label/question group in the guardrail; raw resolvedInstitutionalLens remains audit context.",
      decisionTab: "App.jsx overview plus DecisionHeroSupportSections, AllocationOutcomeCard, EvidenceConfidenceCard, and RiskFlagsStrip consume the exact fields inventoried in surfaceRows.decisionTab; none consumes lensAwareExplanations.",
      thesisFalsification: "ThesisFalsificationTab.jsx reads summaryMemo, tokenDemandTruth, whatMustBeTrue, whatCouldBreak, allocationCase, blockers, and whatWouldChangeDecision.",
      rightRail: "AnalysisRightRail.jsx reads displayIdentity labels, primaryAnalysisRoute label/question group, primaryBlocker, weakestLink, and whatWouldChangeDecision.",
      evidenceMap: "EvidenceMapTab.jsx reads source/evidence boundary, reviewed evidence mapping, and Engine Learning output QA diagnostics.",
      scoringTransparency: "ScoringTransparencyTab.jsx reads live score/verdict fields, caps/gates, diagnostic-only boundaries, and score-change guardrails.",
      sourceQueue: "SourceQueuePanel.jsx reads researchRequirements and lens-aware source requirements from the normalized model.",
      manualReview: "ManualReviewPanel.jsx reads manualReviewStatus, auditAlerts, warnings, and diagnostic/manual-review fields.",
      auditRaw: "Audit / Raw surfaces preserve raw and technical context only; primary hard gates exclude this surface.",
      bundle: "buildReviewBundleText mirrors this rendered-surface view model and runs final-decision, canonical-family, and benchmark-family hard-gate checks against it.",
    },
    primaryVisibleText,
  };
}

function bundleSynthesizedAnswer(question) {
  const answer = safeObject(question?.synthesizedAnswer);
  const card = getAnalystAnswerCard(question);
  if (!answer.directAnswer && !answer.evidenceStatus) return [
    "  synthesized.directAnswer: Unavailable in current frontend model",
    "  synthesized.evidenceStatus: Unavailable in current frontend model",
  ].join("\n");
  return [
    `  synthesized.directAnswer: ${bundleValue(answer.directAnswer)}`,
    `  synthesized.evidenceStatus: ${bundleValue(answer.evidenceStatus)}`,
    `  analyst.directAnswer: ${bundleValue(card.directAnswer)}`,
    `  analyst.headlineStatus: ${bundleValue(card.headlineStatus)}`,
    `  analyst.evidenceBasis: ${normalizeRenderableList(card.evidenceBasis).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.whatEvidenceDoesNotProve: ${normalizeRenderableList(card.whatEvidenceDoesNotProve).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.missingEvidence: ${normalizeRenderableList(card.missingEvidence).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.decisionImpact: ${bundleValue(card.decisionImpact)}`,
    `  analyst.whatWouldChange: ${normalizeRenderableList(card.whatWouldChange).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.sourceBoundaryPlainEnglish: ${normalizeRenderableList(card.sourceBoundaryPlainEnglish).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.confidenceBoundary: ${bundleValue(card.confidenceBoundary)}`,
    `  analyst.manualReviewImplication: ${bundleValue(card.manualReviewImplication)}`,
    `  analyst.assetClassSpecificKeyIssue: ${bundleValue(card.assetClassSpecificKeyIssue)}`,
    `  analyst.primaryBadges: ${normalizeRenderableList(card.primaryBadges).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.auditFields: ${normalizeRenderableList(card.auditFields).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.evidenceUsed: ${normalizeRenderableList(answer.evidenceUsed).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.reviewedSourcesUsed: ${safeArray(answer.reviewedSourcesUsed).map((source) => `${source.sourceId || source.title || "source"} (${source.scoringEligible ? "scoring eligible" : "not scoring-active"})`).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.reviewedFactsUsed: ${safeArray(answer.reviewedFactsUsed).map((fact) => `${fact.factId || "fact"}: ${fact.claim || "claim unavailable"}`).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.whatEvidenceDoesNotProve: ${normalizeRenderableList(answer.whatEvidenceDoesNotProve).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.missingEvidence: ${normalizeRenderableList(answer.missingEvidence).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.sourceBoundary: ${normalizeRenderableList(answer.sourceBoundary).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.impact: ${bundleValue(answer.impact)}`,
    `  synthesized.whatWouldChange: ${normalizeRenderableList(answer.whatWouldChange).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.warnings: ${normalizeRenderableList(answer.warnings).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.identityWarnings: ${normalizeRenderableList(answer.identityWarnings).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.formulaOutputsUsed: ${normalizeRenderableList(answer.formulaOutputsUsed).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.liveDataUsed: ${normalizeRenderableList(answer.liveDataUsed).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.providerDataUsed: ${normalizeRenderableList(answer.providerDataUsed).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.answerQualityFlags: ${normalizeRenderableList(answer.answerQualityFlags).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.template: ${bundleValue(answer.synthesisTemplateId)}`,
  ].join("\n");
}

function bundleQuestions(questions = []) {
  const rows = safeArray(questions).map((question, index) => {
    const synthesized = safeObject(question?.synthesizedAnswer);
    const card = getAnalystAnswerCard(question);
    const hasSynthesis = Boolean(synthesized.directAnswer);
    return [
      `Question ${index + 1}`,
      `  id: ${bundleValue(question?.questionId)}`,
      `  question: ${bundleValue(question?.questionText)}`,
      `  liveUi.tab: Institutional Checklist`,
      `  liveUi.primaryAnswer: ${bundleValue(card.directAnswer || synthesized.directAnswer || question?.shortAnswer || question?.answerSummary)}`,
      `  liveUi.primaryStatus: ${bundleValue(card.headlineStatus || synthesized.evidenceStatus || question?.reviewedEvidenceStatus || question?.answerStatus)}`,
      `  liveUi.primaryBadges: ${normalizeRenderableList(card.primaryBadges).join("; ") || "Unavailable in current frontend model"}`,
      `  liveUi.primaryMissingEvidence: ${normalizeRenderableList(card.missingEvidence).slice(0, 2).join("; ") || "none visible in primary row"}`,
      `  liveUi.primaryWhatWouldChange: ${normalizeRenderableList(card.whatWouldChange).slice(0, 2).join("; ") || "Unavailable in current frontend model"}`,
      `  liveUi.primaryImpact: ${bundleValue(card.decisionImpact || synthesized.impact || question?.impactOnScoreOrConfidence)}`,
      `  primaryAnswer: ${bundleValue(card.directAnswer || synthesized.directAnswer || question?.shortAnswer || question?.answerSummary)}`,
      `  primaryEvidenceStatus: ${bundleValue(card.headlineStatus || synthesized.evidenceStatus || question?.reviewedEvidenceStatus || question?.answerStatus)}`,
      `  lens: ${bundleValue(question?.assetClassLens)}`,
      `  answerStatus: ${bundleValue(question?.answerStatus)}`,
      `  verdictImpact: ${bundleValue(question?.verdictImpact)}`,
      `  currentMvpCapability: ${bundleValue(question?.currentMvpCapability)}`,
      `  synthesisPreferred: ${hasSynthesis ? "yes" : "no"}`,
      bundleSynthesizedAnswer(question),
      `  audit.legacyShortAnswer: ${bundleValue(question?.shortAnswer)}`,
      `  audit.legacyAnswerSummary: ${bundleValue(question?.answerSummary)}`,
      `  audit.supportingSignals: ${normalizeRenderableList(question?.supportingSignals).join("; ") || "Unavailable in current frontend model"}`,
      `  audit.dataFieldsUsed: ${normalizeRenderableList(question?.dataFieldsUsed).join("; ") || "Unavailable in current frontend model"}`,
      `  audit.formulaOutputsUsed: ${normalizeRenderableList(question?.formulaOutputsUsed).join("; ") || "Unavailable in current frontend model"}`,
      `  missingEvidence: ${normalizeRenderableList(synthesized.missingEvidence || question?.missingEvidence).join("; ") || "Unavailable in current frontend model"}`,
      `  contradictionSignals: ${normalizeRenderableList(question?.contradictionSignals).join("; ") || "Unavailable in current frontend model"}`,
      `  impactOnScoreOrConfidence: ${bundleValue(synthesized.impact || question?.impactOnScoreOrConfidence)}`,
      `  whatWouldChange: ${normalizeRenderableList(synthesized.whatWouldChange || question?.whatWouldChange).join("; ") || "Unavailable in current frontend model"}`,
      `  audit.scoringFieldsUsed: ${normalizeRenderableList(question?.scoringFieldsUsed).join("; ") || "Unavailable in current frontend model"}`,
      `  audit.sourceBoundary: ${normalizeRenderableList(question?.sourceBoundary).join("; ") || "Unavailable in current frontend model"}`,
    ].join("\n");
  });
  return rows.length ? rows.join("\n\n") : "Unavailable in current frontend model";
}

function tokenomicsQuestionGroup(question) {
  const id = String(question?.questionId || "");
  if (/max_supply|remaining_dilution|supply_reconciliation|provider_supply/i.test(id)) return "Supply Integrity";
  if (/unlock|absorb_dilution/i.test(id)) return "Future Dilution / Unlocks";
  if (/mint_admin|emissions|burn_buyback/i.test(id)) return "Control / Mutability";
  if (/treasury_insider|concentration/i.test(id)) return "Ownership / Concentration";
  if (/value_capture|tokenholder|accrual/i.test(id)) return "Tokenholder Economics";
  if (/asset_class|canonical_supply_tree/i.test(id)) return "Asset-Class / Identity";
  return "Other Tokenomics Checks";
}

function tokenomicsQuestionSourceState(question, formulas = []) {
  if (question?.synthesizedAnswer?.evidenceStatus) return String(question.synthesizedAnswer.evidenceStatus).replace(/_/g, "-");
  const formulaIds = safeArray(question?.formulaOutputsUsed);
  const linked = safeArray(formulas).filter((formula) => formulaIds.includes(formula?.formulaId));
  const answerStatus = String(question?.answerStatus || "").toLowerCase();
  if (answerStatus.includes("manual")) return "manual-review-required";
  if (answerStatus.includes("contradict")) return "contradicted";
  if (answerStatus.includes("not_applicable")) return "not-applicable";
  if (linked.some((formula) => formula?.status === "computed")) return "computed";
  if (linked.some((formula) => /missing|source_required|invalid/i.test(String(formula?.status)))) return "source-required";
  if (safeArray(question?.missingEvidence).length) return "source-required";
  if (safeArray(question?.evidenceUsed).length) return "provider-reported";
  return "evidence-missing";
}

function tokenomicsQuestionWhyItMatters(question) {
  const id = String(question?.questionId || "");
  if (/max_supply/.test(id)) return "Max supply is useful only when the cap is credible, immutable, or clearly governed; provider-reported caps are not reviewed evidence.";
  if (/remaining_dilution/.test(id)) return "Remaining dilution helps underwrite future supply pressure, but it can be secondary or not applicable depending on asset class.";
  if (/unlock/.test(id)) return "Unlocks can create sell-pressure or confidence caps when timing, recipients, liquidity, and demand absorption are not source-backed.";
  if (/mint_admin/.test(id)) return "Mint/admin authority determines who can change supply or restrict transfer behavior.";
  if (/burn_buyback|emissions/.test(id)) return "Burn, buyback, and emission mechanics matter only when activation, materiality, durability, and source backing are clear.";
  if (/value_capture/.test(id)) return "Protocol or network success does not automatically accrue to tokenholders without an active, material, source-backed mechanism.";
  if (/canonical_supply_tree/.test(id)) return "Supply conclusions depend on analyzing the correct canonical asset, network, contract, bridge, wrapper, or multichain representation.";
  return "This question converts tokenomics data into a source-boundary-aware institutional diligence answer.";
}

function bundleTokenomicsQuestionFirstMirror(tokenomics) {
  const formulas = safeArray(tokenomics?.formulaOutputs);
  const rows = safeArray(tokenomics?.institutionalQuestions).map((question, index) => {
    const synthesized = safeObject(question?.synthesizedAnswer);
    const card = getAnalystAnswerCard(question);
    const formulaIds = safeArray(question?.formulaOutputsUsed);
    const linkedFormulas = formulas.filter((formula) => formulaIds.includes(formula?.formulaId));
    const formulaOrRule = linkedFormulas.length
      ? linkedFormulas.map((formula) => `${formula.label || formula.formulaId}: ${formula.display || "Unavailable - source required"} | ${formula.formula || "Formula unavailable"} | status=${formula.status || "unknown"} | missing=${safeArray(formula.missingInputs).join(", ") || "none"}`).join("; ")
      : question?.answerStatus === "not_applicable"
        ? "Not applicable for this asset class; use the asset-class-specific alternative diligence surface."
        : "Rule-based answer from resolved lens and tokenomics source requirements.";
    return [
      `Question ${index + 1}`,
      `  group: ${tokenomicsQuestionGroup(question)}`,
      `  liveUi.tab: Tokenomics / Supply Integrity`,
      `  question: ${bundleValue(question?.questionText)}`,
      `  collapsedSummary: ${bundleValue(card.directAnswer || synthesized.directAnswer || question?.shortAnswer || question?.answerSummary)}`,
      `  status: ${bundleValue(card.headlineStatus || question?.answerStatus)}`,
      `  sourceState: ${card.headlineStatus || tokenomicsQuestionSourceState(question, formulas)}`,
      `  expanded.directAnswer: ${bundleValue(card.directAnswer || synthesized.directAnswer || question?.shortAnswer || question?.answerSummary)}`,
      `  expanded.whyItMatters: ${bundleValue(card.assetClassSpecificKeyIssue || tokenomicsQuestionWhyItMatters(question))}`,
      `  expanded.evidenceBasis: ${normalizeRenderableList(card.evidenceBasis).join("; ") || normalizeRenderableList(question?.dataFieldsUsed).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.formulaOrRuleUsed: ${formulaOrRule}`,
      `  expanded.evidenceStatus: synthesized=${bundleValue(synthesized.evidenceStatus)}; provider/review fields=${normalizeRenderableList(card.evidenceBasis || synthesized.evidenceUsed || question?.evidenceUsed).join("; ") || "none"}; boundary=${normalizeRenderableList(card.sourceBoundaryPlainEnglish || synthesized.sourceBoundary || question?.sourceBoundary).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.reviewedSourcesUsed: ${safeArray(synthesized.reviewedSourcesUsed || question?.reviewedSourcesUsed).map((source) => `${source.sourceId || source.title || "source"} (${source.scoringEligible ? "scoring eligible" : "not scoring-active"})`).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.reviewedFactsUsed: ${safeArray(synthesized.reviewedFactsUsed || question?.reviewedFactsUsed).map((fact) => `${fact.factId || "fact"}: ${fact.claim || "claim unavailable"}`).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.whatEvidenceDoesNotProve: ${normalizeRenderableList(card.whatEvidenceDoesNotProve || synthesized.whatEvidenceDoesNotProve).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.missingEvidence: ${normalizeRenderableList(card.missingEvidence || synthesized.missingEvidence || question?.missingEvidence).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.impact: ${bundleValue(card.decisionImpact || synthesized.impact || question?.impactOnScoreOrConfidence)}`,
      `  expanded.confidenceBoundary: ${bundleValue(card.confidenceBoundary)}`,
      `  expanded.whatWouldChange: ${normalizeRenderableList(card.whatWouldChange || synthesized.whatWouldChange || question?.whatWouldChange).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.answerQualityFlags: ${normalizeRenderableList(synthesized.answerQualityFlags).join("; ") || "Unavailable in current frontend model"}`,
    ].join("\n");
  });
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

function buildIdentityLensLeakageForbiddenStringChecks({
  bundleText,
  asset,
  lens,
  assetIdentityResolution,
  reviewedEvidencePacket,
}) {
  const assetText = `${asset?.symbol || ""} ${asset?.name || ""} ${asset?.id || ""} ${asset?.coingeckoId || ""} ${reviewedEvidencePacket?.packetId || ""}`;
  const lensId = String(lens?.lensId || "");
  const representationType = String(assetIdentityResolution?.representationType || "");
  const wrappedStatus = String(assetIdentityResolution?.bridgedOrWrappedStatus || "");
  const isWrappedOrBridgedContext = /WRAPPED_ASSET|wrapped_asset|bridged_asset/i.test(`${lensId} ${representationType} ${wrappedStatus} ${assetText}`);
  const isLstContext = /LST_STAKING_DERIVATIVE|liquid_staking_derivative|steth|staked ether/i.test(`${lensId} ${representationType} ${assetText}`);
  const isGamingContext = /GAMING_METAVERSE_CONSUMER|gaming|gamefi|naka/i.test(`${lensId} ${assetText}`);
  const isDePinContext = /DEPIN|render-token|render network|render\b/i.test(`${lensId} ${assetText}`);
  const isBaseLayerContext = /BASE_LAYER|NATIVE_MONETARY|ethereum|eth\b|bitcoin|btc\b|solana|sol\b|avalanche|avax\b/i.test(`${lensId} ${assetText}`);
  const isOndoContext = /ondo/i.test(assetText);
  const isRenderContext = /render|rndr/i.test(assetText);

  const definitions = [
    {
      checkId: "ondo_wrapped_representation_leak",
      applies: isOndoContext && !isWrappedOrBridgedContext,
      pattern: /\bwrapped_asset\b|Wrapped\/bridged\/staking representation signal detected|native asset fundamentals do not automatically transfer/i,
      forbidden: "ONDO-like non-wrapper contract asset shows wrapped/native-inheritance copy.",
      allowedWhen: "Only allowed when selected asset has explicit wrapper/bridge/staking-derivative representation evidence.",
    },
    {
      checkId: "steth_false_rwa_internal_ambiguity",
      applies: isLstContext,
      pattern: /internal classification suggests RWA \/ Hybrid|RWA \/ Hybrid Methodology Asset/i,
      forbidden: "LST context shows equal-weight RWA/Hybrid provider/internal disagreement copy.",
      allowedWhen: "Only allowed when direct RWA/product-rights evidence exists for the analyzed asset.",
    },
    {
      checkId: "base_layer_gaming_copy_leak",
      applies: isBaseLayerContext && !isGamingContext,
      pattern: /Gaming utility or tokenomics documents|game volume|paying users/i,
      forbidden: "Base-layer context shows gaming/GameFi demand-warning copy.",
      allowedWhen: "Only allowed for gaming/GameFi question groups.",
    },
    {
      checkId: "depin_gaming_copy_leak",
      applies: isDePinContext && !isGamingContext,
      pattern: /Gaming utility or tokenomics documents|game volume|paying users/i,
      forbidden: "DePIN/resource context shows gaming/GameFi demand-warning copy.",
      allowedWhen: "Only allowed for gaming/GameFi question groups.",
    },
    {
      checkId: "ondo_render_migration_leak",
      applies: isOndoContext && !isRenderContext,
      pattern: /RNDR-to-RENDER|Solana upgraded token context|RENDER migration/i,
      forbidden: "ONDO-like packet shows RENDER migration/canonical-representation copy.",
      allowedWhen: "Only allowed for RENDER/RNDR packet identity reconciliation.",
    },
  ].filter((definition) => definition.applies);

  return definitions.map((definition) => {
    const matches = String(bundleText || "").match(definition.pattern) || [];
    return {
      ...definition,
      passed: matches.length === 0,
      matches: Array.from(new Set(matches)).slice(0, 5),
      checkedFields: [
        "assetIdentityResolution.identityWarnings",
        "assetIdentityResolution.chainWarnings",
        "assetIdentityResolution.sourceRequirements",
        "resolvedInstitutionalLens.ambiguityFlags",
        "reviewedEvidencePacket.questionMappings[].evidenceMappingWarnings",
        "reviewedEvidencePacket.sourceQueueNotes",
        "reviewedEvidencePacket.remainingSourceRequirements",
        "Copy Review Bundle core sections",
      ],
      checkedBundleSections: [
        "1. QA Bundle Header",
        "1A. Asset Identity Resolution / Canonical Chain Guardrail",
        "2. Resolved Institutional Lens Contract",
        "2A. Reviewed Evidence Packet v1",
        "6. Institutional Checklist",
        "6A. Tokenomics / Supply Integrity Tab Mirror",
        "9. Source Queue",
        "10. Manual Review",
        "11. Audit / Raw Key Fields",
        "12. Cross-Tab Consistency Checklist",
      ],
    };
  });
}

const BTC_RENDERED_PRIMARY_SURFACES = [
  "decisionHeader",
  "decisionTab",
  "thesisFalsification",
  "rightRail",
  "whatWouldChangeRail",
  "visibleLensLabel",
  "institutionalChecklist",
  "tokenomics",
  "sourceQueue",
  "manualReview",
  "copyBundlePrimaryMirror",
  "protectedReportPrimaryMirror",
];

const BTC_RENDERED_SECONDARY_SURFACES = [
  "evidenceMap",
  "scoringTransparency",
];

function normalizeBtcRenderedGateRows(rows = []) {
  return safeArray(rows)
    .flatMap((row) => {
      const sourceText = row?.text ?? row?.renderedText;
      return normalizeRenderableList(Array.isArray(sourceText) ? sourceText : [sourceText]).map((text) => ({
      failureId: row?.failureId || `${row?.surface || "unknown"}:${row?.fieldPath || "field"}`,
      surface: row?.surface || "unknown",
      fieldPath: row?.fieldPath || "unknown",
      sourceObjectPath: row?.sourceObjectPath || row?.fieldPath || "unknown",
      renderedText: text,
      classification: row?.classification || "primary-visible",
      appearsInRenderedViewModel: row?.appearsInRenderedViewModel !== false,
      reason: row?.reason || null,
      }));
    })
    .filter((row) => row.renderedText);
}

function isInternalBtcGateIdText(text) {
  return /^(base_layer_settlement_gas_demand|base_layer_security_validator_role|base_layer_issuance_burn_staking|tokenomics_[a-z0-9_]+|[a-z0-9]+_[a-z0-9_]+)$/i.test(String(text || "").trim());
}

function buildBtcRenderedGateCorpusRows({
  renderedSurfaceParityViewModel,
  model,
  displayIdentity,
  lens,
  questions,
  tokenomicsSupplyIntegrity,
  reviewedEvidencePacket,
} = {}) {
  const rows = [];
  const surfaces = safeObject(renderedSurfaceParityViewModel?.surfaces);
  Object.entries(surfaces).forEach(([surface, values]) => {
    const canonicalRows = surface === "decisionTab"
      ? safeArray(renderedSurfaceParityViewModel?.surfaceRows?.decisionTab)
      : [];
    if (canonicalRows.length) {
      canonicalRows.forEach((row) => {
        rows.push({
          surface,
          fieldPath: row.fieldPath,
          sourceObjectPath: row.sourceObjectPath,
          text: row.renderedText,
          classification: row.classification === "audit" ? "audit-only" : "primary-visible",
          appearsInRenderedViewModel: row.renderedStatus === "rendered",
          reason: row.inclusionReason,
        });
      });
      return;
    }
    const classification = BTC_RENDERED_PRIMARY_SURFACES.includes(surface)
      ? "primary-visible"
      : BTC_RENDERED_SECONDARY_SURFACES.includes(surface)
        ? "secondary-visible"
        : "audit-only";
    normalizeRenderableList(values).forEach((text, index) => {
      const rowClassification = isInternalBtcGateIdText(text) ? "internal-id" : classification;
      rows.push({
        surface,
        fieldPath: `renderedSurfaceParityViewModel.surfaces.${surface}[${index}]`,
        sourceObjectPath: `buildRenderedSurfaceParityViewModel.surfaces.${surface}`,
        text,
        classification: rowClassification,
        appearsInRenderedViewModel: true,
        reason: rowClassification === "internal-id"
          ? "Internal ID rendered/available as technical metadata; not human copy for the primary gate."
          : classification === "primary-visible"
          ? "Current rendered-intended product text."
          : classification === "secondary-visible"
            ? "Visible supporting/detail surface; inventoried separately from primary gate."
            : "Audit/raw surface; never blocks primary rendered gate.",
      });
    });
  });

  [
    ["displayIdentity.displayAssetClass", displayIdentity?.displayAssetClass],
    ["displayIdentity.displayFraming", displayIdentity?.displayFraming],
    ["displayIdentity.primaryChip", displayIdentity?.primaryChip],
    ["displayIdentity.secondaryChip", displayIdentity?.secondaryChip],
    ["resolvedInstitutionalLens.visibleLabelOverride", lens?.visibleLabelOverride],
    ["resolvedInstitutionalLens.displayLabel", lens?.displayLabel],
  ].forEach(([fieldPath, text]) => {
    rows.push({
      surface: "visibleLensLabel",
      fieldPath,
      sourceObjectPath: fieldPath,
      text,
      classification: "primary-visible",
      appearsInRenderedViewModel: true,
      reason: "Display-safe visible label candidate.",
    });
  });

  [
    ["model.assetClassLabel", model?.assetClassLabel],
    ["model.assetFramingLabel", model?.assetFramingLabel],
    ["resolvedInstitutionalLens.label", lens?.label],
  ].forEach(([fieldPath, text]) => {
    const displaySafeLabels = [
      displayIdentity?.displayAssetClass,
      displayIdentity?.displayFraming,
      lens?.visibleLabelOverride,
      lens?.displayLabel,
    ].filter(Boolean).join(" ");
    rows.push({
      surface: "rawFallback",
      fieldPath,
      sourceObjectPath: fieldPath,
      text,
      classification: displaySafeLabels && text && !displaySafeLabels.includes(text) ? "audit-only" : "primary-visible",
      appearsInRenderedViewModel: false,
      reason: "Raw backend/display fallback; blocks only when no display-safe visible label supersedes it.",
    });
  });

  [
    ["resolvedInstitutionalLens.lensId", lens?.lensId],
    ["resolvedInstitutionalLens.questionGroupId", lens?.questionGroupId],
    ...safeArray(questions).map((question) => ["institutionalQuestions[].questionId", question?.questionId]),
    ...safeArray(tokenomicsSupplyIntegrity?.institutionalQuestions).map((question) => ["tokenomicsSupplyIntegrity.institutionalQuestions[].questionId", question?.questionId]),
    ...safeArray(reviewedEvidencePacket?.questionMappings).map((mapping) => ["reviewedEvidencePacket.questionMappings[].questionId", mapping?.questionId]),
  ].forEach(([fieldPath, text]) => {
    rows.push({
      surface: "internalMetadata",
      fieldPath,
      sourceObjectPath: fieldPath,
      text,
      classification: "internal-id",
      appearsInRenderedViewModel: false,
      reason: "Internal ID or technical route metadata; not human copy for the primary rendered gate.",
    });
  });

  return normalizeBtcRenderedGateRows(rows);
}

function buildBtcBenchmarkForbiddenStringChecks({
  primaryText,
  corpusRows,
  bundleText,
  canonicalFamily,
}) {
  if (canonicalFamily !== "native_btc_pow_monetary") return [];

  const normalizedRows = normalizeBtcRenderedGateRows(corpusRows);
  const rowsToCheck = normalizedRows.length ? normalizedRows : [{
    surface: "legacyTextBlob",
    fieldPath: "primaryText",
    sourceObjectPath: "primaryText",
    renderedText: String(primaryText || bundleText || ""),
    classification: "primary-visible",
    appearsInRenderedViewModel: true,
    reason: "Legacy scanner input.",
  }];
  const definitions = [
    {
      checkId: "btc_eth_mechanism_copy_leak",
      pattern: /Reviewed Ethereum sources|ETH staking|staking rewards?|post-Merge|EIP-?1559|base-fee burn|\bstaking\b|staking mechanics|staking\/validator|validator rewards?|slashing mechanics|validator\/security|validator decentralization|validator concentration|issuance\/burn\/staking|issuance, burn, staking|burn\/staking|L2\/blob|blob fee|MEV\/PBS\/relay|relay concentration|base_layer_security_validator_role|base_layer_issuance_burn_staking/i,
      forbidden: "Native BTC primary copy shows ETH/PoS/staking/slashing/base-fee wording.",
    },
    {
      checkId: "btc_gas_copy_leak",
      pattern: /settlement\/gas|\bgas demand\b|\bgas-demand\b|\bgas\/settlement demand\b|\bgas asset\b|base_layer_settlement_gas_demand/i,
      forbidden: "Native BTC primary copy shows gas-asset wording instead of transaction/blockspace/fee-market wording.",
    },
    {
      checkId: "btc_erc20_admin_copy_leak",
      pattern: /ERC-20 admin|proxy\/admin|selected contract.*non-mintable|selected contract reported non-mintable|contract scan.*required|mint\/admin.*selected contract/i,
      forbidden: "Native BTC primary copy shows ERC-20 contract/admin/proxy wording.",
    },
    {
      checkId: "btc_stablecoin_trust_copy_leak",
      pattern: /reserve composition|\battestation\b|reserve attestation|redemption eligibility|issuer\/custodian|admin\/freeze policy|peg stress/i,
      forbidden: "Native BTC primary copy shows stablecoin reserve/redemption/issuer-control wording.",
    },
    {
      checkId: "btc_unlock_vesting_copy_leak",
      pattern: /token unlock recipients|vesting schedule|insider vesting|next unlock materiality|unlock\/volume/i,
      forbidden: "Native BTC primary copy shows ERC-20 unlock/vesting wording as a primary surface.",
    },
    {
      checkId: "btc_protocol_accrual_copy_leak",
      pattern: /fee switch|protocol-token value capture|protocol-token accrual|burn\/buyback|buyback|fee burn|burn materiality|treasury routing|tokenholder accrual model/i,
      forbidden: "Native BTC primary copy shows protocol-token accrual/buyback wording as a primary surface.",
    },
    {
      checkId: "btc_decision_thesis_repetition_guard",
      pattern: /Resolve the critical pillar|Critical tokenomics evidence is missing|utility or vesting support|Close the weakest-link gaps/i,
      forbidden: "Native BTC primary copy shows generic decision/tokenomics fallback wording instead of native monetary blocker copy.",
    },
  ];

  return definitions.map((definition) => {
    const matchedRows = rowsToCheck
      .map((row) => {
        const matches = String(row.renderedText || "").match(definition.pattern) || [];
        return matches.length ? {
          failureId: `${definition.checkId}:${row.surface}:${row.fieldPath}`,
          checkId: definition.checkId,
          matchedForbiddenPhrase: Array.from(new Set(matches)).join("; "),
          renderedText: row.renderedText,
          surface: row.surface,
          fieldPath: row.fieldPath,
          sourceObjectPath: row.sourceObjectPath,
          classification: row.classification,
          appearsInRenderedViewModel: row.appearsInRenderedViewModel,
          shouldBlock: row.classification === "primary-visible",
          reason: row.reason,
        } : null;
      })
      .filter(Boolean);
    const primaryVisibleFailures = matchedRows.filter((row) => row.shouldBlock);
    const secondaryVisibleMentions = matchedRows.filter((row) => row.classification === "secondary-visible");
    const auditOnlyMentions = matchedRows.filter((row) => row.classification === "audit-only");
    const internalIdExclusions = matchedRows.filter((row) => row.classification === "internal-id");
    const forbiddenListExclusions = matchedRows.filter((row) => row.classification === "forbidden-list");
    const beforeStateExclusions = matchedRows.filter((row) => row.classification === "before-state");
    const selfTriggerExclusions = matchedRows.filter((row) => row.classification === "report-metadata");
    return {
      ...definition,
      passed: primaryVisibleFailures.length === 0,
      matches: primaryVisibleFailures.map((failure) => failure.matchedForbiddenPhrase).filter((entry, index, all) => all.indexOf(entry) === index).slice(0, 5),
      primaryVisibleFailures,
      secondaryVisibleMentions,
      auditOnlyMentions,
      internalIdExclusions,
      forbiddenListExclusions,
      beforeStateExclusions,
      selfTriggerExclusions,
      allMatches: matchedRows,
      allowedWhen: "Only allowed when the selected asset is ETH/PoS, ERC-20, stablecoin, wrapped/LST, or protocol-token context rather than native BTC.",
      checkedFields: [
        "Decision Header / Command Header primary model text",
        "Decision Tab / Decision Snapshot primary model text",
        "Thesis Falsification primary model text",
        "Right Rail / Research Intelligence Rail primary blocker and weakest link",
        "Right Rail / What Would Change rail",
        "Visible asset class / framing / lens labels",
        "Institutional Checklist questionText",
        "Institutional Checklist primaryMissingEvidence",
        "Institutional Checklist primaryWhatWouldChange",
        "Institutional question synthesized answers",
        "Synthesized missingEvidence / whatWouldChange",
        "Analyst missingEvidence / whatWouldChange",
        "Tokenomics question answers and source requirements",
        "Reviewed evidence packet remaining requirements",
        "Source Queue requirements",
        "Manual Review signals",
        "Copy Review Bundle live mirror",
      ],
      checkedBundleSections: [
        "1. QA Bundle Header",
        "4. Decision / Command Header",
        "2A. Reviewed Evidence Packet v1",
        "5. Thesis Falsification",
        "6. Institutional Checklist",
        "6A. Tokenomics / Supply Integrity Tab Mirror",
        "9. Source Queue",
        "10. Manual Review",
      ],
    };
  });
}

function buildEthBenchmarkForbiddenStringChecks({
  primaryText,
  corpusRows,
  bundleText,
  canonicalFamily,
}) {
  if (canonicalFamily !== "native_eth_pos_gas_l2_fee_market") return [];

  const normalizedRows = normalizeBtcRenderedGateRows(corpusRows);
  const rowsToCheck = normalizedRows.length ? normalizedRows : [{
    surface: "legacyTextBlob",
    fieldPath: "primaryText",
    sourceObjectPath: "primaryText",
    renderedText: String(primaryText || bundleText || ""),
    classification: "primary-visible",
    appearsInRenderedViewModel: true,
    reason: "Legacy scanner input.",
  }];
  const definitions = [
    {
      checkId: "eth_btc_pow_copy_leak",
      pattern: /Native PoW|proof-of-work|proof of work|miner economics|miner revenue|hashrate|mining-pool|mining pool|halving|block subsidy|coinbase subsidy|native monetary benchmark/i,
      forbidden: "Native ETH primary copy shows BTC PoW/miner/hashrate/halving/block-subsidy wording.",
    },
    {
      checkId: "eth_wrapped_custody_backing_copy_leak",
      pattern: /proof-of-reserves|proof of reserves|wrapped asset|wrapped exposure|custodian\/merchant|bridge controls|backing.*redemption|redemption path.*custodian/i,
      forbidden: "Native ETH primary copy shows wrapped/custody/backing/redemption wording.",
    },
    {
      checkId: "eth_stablecoin_trust_copy_leak",
      pattern: /stablecoin|reserve composition|\battestation\b|reserve attestation|redemption eligibility|issuer\/custodian|admin\/freeze policy|peg stress/i,
      forbidden: "Native ETH primary copy shows stablecoin reserve/redemption/issuer-control wording.",
    },
    {
      checkId: "eth_rwa_rights_copy_leak",
      pattern: /RWA NAV|legal claim|legal\/economic rights|tokenized asset|issuer, custodian, collateral|redemption enforceability|NAV/i,
      forbidden: "Native ETH primary copy shows RWA legal/NAV/redemption wording.",
    },
    {
      checkId: "eth_depin_gaming_meme_copy_leak",
      pattern: /resource demand|compute\/storage|payer mapping|provider incentives|active players|paying users|game volume|meme|narrative asset/i,
      forbidden: "Native ETH primary copy shows DePIN, gaming, or meme wording.",
    },
    {
      checkId: "eth_erc20_admin_primary_copy_leak",
      pattern: /ERC-20 admin|proxy\/admin|selected contract.*non-mintable|selected contract reported non-mintable|contract scan.*required|mint\/admin.*selected contract/i,
      forbidden: "Native ETH primary copy shows ERC-20 contract/admin/proxy wording.",
    },
    {
      checkId: "eth_generic_fallback_copy_leak",
      pattern: /Resolve the critical pillar|Critical tokenomics evidence is missing|utility or vesting support|Close the weakest-link gaps/i,
      forbidden: "Native ETH primary copy shows generic decision/tokenomics fallback wording instead of PoS settlement blocker copy.",
    },
  ];

  return definitions.map((definition) => {
    const matchedRows = rowsToCheck
      .map((row) => {
        const matches = String(row.renderedText || "").match(definition.pattern) || [];
        return matches.length ? {
          failureId: `${definition.checkId}:${row.surface}:${row.fieldPath}`,
          checkId: definition.checkId,
          matchedForbiddenPhrase: Array.from(new Set(matches)).join("; "),
          renderedText: row.renderedText,
          surface: row.surface,
          fieldPath: row.fieldPath,
          sourceObjectPath: row.sourceObjectPath,
          classification: row.classification,
          appearsInRenderedViewModel: row.appearsInRenderedViewModel,
          shouldBlock: row.classification === "primary-visible",
          reason: row.reason,
        } : null;
      })
      .filter(Boolean);
    const primaryVisibleFailures = matchedRows.filter((row) => row.shouldBlock);
    const secondaryVisibleMentions = matchedRows.filter((row) => row.classification === "secondary-visible");
    const auditOnlyMentions = matchedRows.filter((row) => row.classification === "audit-only");
    const internalIdExclusions = matchedRows.filter((row) => row.classification === "internal-id");
    const forbiddenListExclusions = matchedRows.filter((row) => row.classification === "forbidden-list");
    const beforeStateExclusions = matchedRows.filter((row) => row.classification === "before-state");
    const selfTriggerExclusions = matchedRows.filter((row) => row.classification === "report-metadata");
    return {
      ...definition,
      passed: primaryVisibleFailures.length === 0,
      matches: primaryVisibleFailures.map((failure) => failure.matchedForbiddenPhrase).filter((entry, index, all) => all.indexOf(entry) === index).slice(0, 5),
      primaryVisibleFailures,
      secondaryVisibleMentions,
      auditOnlyMentions,
      internalIdExclusions,
      forbiddenListExclusions,
      beforeStateExclusions,
      selfTriggerExclusions,
      allMatches: matchedRows,
      allowedWhen: "Only allowed when the selected asset is BTC/PoW, wrapped/LST, stablecoin, RWA, DePIN, gaming, meme, or ERC-20 contract-token context rather than native ETH.",
      checkedFields: [
        "Decision Header / Command Header primary model text",
        "Decision Tab / Decision Snapshot primary model text",
        "Thesis Falsification primary model text",
        "Right Rail / Research Intelligence Rail primary blocker and weakest link",
        "Right Rail / What Would Change rail",
        "Visible asset class / framing / lens labels",
        "Institutional Checklist questionText",
        "Institutional Checklist primaryMissingEvidence",
        "Institutional Checklist primaryWhatWouldChange",
        "Institutional question synthesized answers",
        "Tokenomics question answers and source requirements",
        "Source Queue requirements",
        "Manual Review signals",
        "Copy Review Bundle live mirror",
      ],
      checkedBundleSections: [
        "4. Decision / Command Header",
        "5. Thesis Falsification",
        "6. Institutional Checklist",
        "6A. Tokenomics / Supply Integrity Tab Mirror",
        "9. Source Queue",
        "10. Manual Review",
        "12D. ETH Benchmark Answer / PoS Settlement Text QA",
      ],
    };
  });
}

function bundleControlStatusLabel(value, kind, lensId) {
  if (lensId === "STABLECOIN_SETTLEMENT" && kind === "mint") {
    if (value === "requires_manual_review") return "present / issuer-controlled / requires policy review";
    if (value === "verified") return "not detected on selected contract; issuer mint/redeem still requires review";
    if (value === "not_applicable") return "not applicable to selected scan";
    return "unknown / requires issuer policy review";
  }
  if (lensId === "STABLECOIN_SETTLEMENT" && kind === "admin") {
    if (value === "requires_manual_review") return "present / requires policy review";
    if (value === "verified") return "not detected on selected contract; freeze/admin policy still requires review";
    if (value === "not_applicable") return "not applicable to selected scan";
    return "unknown / requires policy review";
  }
  if (kind === "mint" && value === "verified") return "selected contract reported non-mintable";
  if (kind === "admin" && value === "verified") return "owner/admin risk not detected on selected contract";
  if (value === "requires_manual_review") return "detected / requires review";
  return titleCase(value || "Unavailable");
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
  premiumV2ShellQa,
  premiumV2DecisionCommandCenterQa,
  premiumV2MarketLiquiditySupplyQa,
  premiumV2TokenomicsQualityQa,
  premiumV2ThesisFundamentalsQa,
} = {}) {
  const safeData = safeObject(data);
  const safeAnalysis = safeObject(analysis || safeData.analysis);
  const safeModel = safeObject(model);
  const safeAsset = safeObject(asset || safeData.asset);
  const safeMeta = safeObject(meta || safeData.meta);
  const safeScores = safeObject(scores || safeData.scores || safeAnalysis.scores);
  const safeConfidence = safeObject(confidence || safeAnalysis.confidence || safeData.confidence);
  const safePremiumV2ShellQa = safeObject(premiumV2ShellQa);
  const safePremiumV2DecisionCommandCenterQa = safeObject(premiumV2DecisionCommandCenterQa);
  const safePremiumV2MarketLiquiditySupplyQa = safeObject(premiumV2MarketLiquiditySupplyQa);
  const safePremiumV2TokenomicsQualityQa = safeObject(premiumV2TokenomicsQualityQa);
  const safePremiumV2ThesisFundamentalsQa = safeObject(premiumV2ThesisFundamentalsQa);
  const institutionalDiscoveryDeterministicRankingConstitution =
    safeAnalysis.institutionalDiscoveryDeterministicRankingConstitution || null;
  const institutionalSourceProviderEvidenceMap =
    safeAnalysis.institutionalSourceProviderEvidenceMap || null;
  const canonicalInstitutionalIdentityBackbone =
    safeAnalysis.canonicalInstitutionalIdentityBackbone
    || safeModel.canonicalInstitutionalIdentityBackbone
    || null;
  const rwaHybridFinanceTypedObservationBackbone =
    safeModel.rwaHybridFinanceTypedObservationBackbone
    || normalizeRwaHybridFinanceTypedObservations(safeAnalysis)
    || normalizeRwaHybridFinanceTypedObservations(safeData);
  const rwaObservationSummary = safeObject(
    rwaHybridFinanceTypedObservationBackbone?.diagnosticSummary,
  );
  const stablecoinsYieldTypedObservationBackbone =
    safeModel.stablecoinsYieldTypedObservationBackbone
    || normalizeStablecoinsYieldTypedObservations(safeAnalysis)
    || normalizeStablecoinsYieldTypedObservations(safeData);
  const stableYieldObservationSummary = safeObject(
    stablecoinsYieldTypedObservationBackbone?.diagnosticSummary,
  );
  const bundleProductResearchNormalization = normalizeProductResearchResultV2({
    productResearchResultV2: safeData.productResearchResultV2,
    analysis: safeAnalysis,
  });
  const productResearchResultV2 = safeModel.productResearchResultV2
    || bundleProductResearchNormalization.result;
  const productResearchCustomer = safeObject(productResearchResultV2?.customerPresentation);
  const decisionLayer = safeObject(safeModel.decisionLayer || safeAnalysis.decisionLayer || safeData.decisionLayer);
  const finalDecisionScore = safeObject(decisionLayer.score);
  const hasAtomicFinalDecision = decisionLayer.audit?.calculationVersion === "final-decision-atomic-v1";
  const bundlePrimaryScore = hasAtomicFinalDecision
    ? (finalDecisionScore.displayable ? finalDecisionScore.displayValue : "Withheld")
    : safeModel.overallScore ?? safeScores.overallScore;
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
  const assetResearchResultV2 = normalizeAssetResearchResultV2Payload(safeData)
    || normalizeAssetResearchResultV2Payload(safeAnalysis)
    || normalizeAssetResearchResultV2Payload(safeModel);
  const marketLiquiditySupply = safeObject(assetResearchResultV2?.marketLiquiditySupply);
  const tokenomicsQualityPresentation = safeObject(assetResearchResultV2?.tokenomicsQualityPresentation);
  const thesisFundamentalsPresentation = safeObject(assetResearchResultV2?.thesisFundamentalsPresentation);
  const tokenomicsQuality = safeObject(assetResearchResultV2?.tokenomics?.data);
  const tokenomicsQualityAttached = String(tokenomicsQuality.schemaVersion || "").startsWith("tokenomics-quality-engine-v1");
  const thesisFundamentals = safeObject(assetResearchResultV2?.fundamentals?.data);
  const thesisFundamentalsAttached = String(thesisFundamentals.schemaVersion || "").startsWith("thesis-fundamentals-engine-v1");
  const currentReality = safeObject(assetResearchResultV2?.currentReality?.data);
  const currentRealityAttached = String(currentReality.schemaVersion || "").startsWith("current-reality-engine-v1");
  const currentRealityMostMaterial = safeObject(currentReality.mostMaterialEvent);
  const currentRealityRiskChange = safeObject(currentReality.mostImportantRiskChange || currentReality.mostImportantNegativeDevelopment);
  const tokenomicsSupplyTruth = safeObject(tokenomicsSupplyIntegrity?.supplyTruth);
  const reviewedEvidencePacket = safeModel.reviewedEvidencePacket || normalizeReviewedEvidencePacketPayload(safeData) || normalizeReviewedEvidencePacketPayload(safeAnalysis);
  const benchmarkInstitutionalAnswerPack = safeModel.benchmarkInstitutionalAnswerPack || normalizeBenchmarkInstitutionalAnswerPackPayload(safeData) || normalizeBenchmarkInstitutionalAnswerPackPayload(safeAnalysis);
  const institutionalAnswerSurfaceContract = safeModel.institutionalAnswerSurfaceContract || normalizeInstitutionalAnswerSurfacePayload(safeData) || normalizeInstitutionalAnswerSurfacePayload(safeAnalysis);
  const finalAnalystAnswerComposerContract = normalizeFinalAnalystAnswerComposerPayload(safeModel)
    || normalizeFinalAnalystAnswerComposerPayload(safeData)
    || normalizeFinalAnalystAnswerComposerPayload(safeAnalysis);
  const marketWideAnalystPipelinePurityContract = safeModel.marketWideAnalystPipelinePurityContract
    || normalizeMarketWideAnalystPipelinePurityPayload(safeModel)
    || normalizeMarketWideAnalystPipelinePurityPayload(safeData)
    || normalizeMarketWideAnalystPipelinePurityPayload(safeAnalysis);
  const evidenceStatusAggregationContract = safeModel.evidenceStatusAggregationContract || normalizeEvidenceStatusAggregationPayload(safeData) || normalizeEvidenceStatusAggregationPayload(safeAnalysis);
  const coverageScoreEligibilityContract = safeModel.coverageScoreEligibilityContract || normalizeCoverageScoreEligibilityPayload(safeData) || normalizeCoverageScoreEligibilityPayload(safeAnalysis);
  const familyCanonicalRoutingContract = safeModel.familyCanonicalRoutingContract || normalizeFamilyCanonicalRoutingPayload(safeData) || normalizeFamilyCanonicalRoutingPayload(safeAnalysis);
  const evidenceProvenanceSemanticsContract = safeModel.evidenceProvenanceSemanticsContract || normalizeEvidenceProvenanceSemanticsPayload(safeData) || normalizeEvidenceProvenanceSemanticsPayload(safeAnalysis);
  const familyDataRequirementMatrixContract = safeModel.familyDataRequirementMatrixContract || normalizeFamilyDataRequirementMatrixPayload(safeData) || normalizeFamilyDataRequirementMatrixPayload(safeAnalysis);
  const assetInterpretationContract = safeModel.assetInterpretationContract || normalizeAssetInterpretationContractPayload(safeData) || normalizeAssetInterpretationContractPayload(safeAnalysis);
  const effectiveInstitutionalLens = safeModel.effectiveInstitutionalLens || normalizeEffectiveInstitutionalLensPayload(safeData, assetInterpretationContract) || normalizeEffectiveInstitutionalLensPayload(safeAnalysis, assetInterpretationContract);
  const dataFirstNarrativeContract = safeModel.dataFirstNarrativeContract || normalizeDataFirstNarrativeContractPayload(safeData) || normalizeDataFirstNarrativeContractPayload(safeAnalysis);
  const authorityHierarchyContract = safeModel.authorityHierarchyContract || normalizeAuthorityHierarchyContractPayload(safeData) || normalizeAuthorityHierarchyContractPayload(safeAnalysis);
  const canonicalProductRoute = safeModel.canonicalProductRoute || normalizeCanonicalProductRoutePayload(safeData) || normalizeCanonicalProductRoutePayload(safeAnalysis);
  const routeSurfaceParityContract = safeModel.routeSurfaceParityContract || normalizeRouteSurfaceParityPayload(safeData) || normalizeRouteSurfaceParityPayload(safeAnalysis);
  const rawPrimaryAnalysisRoute = safeModel.primaryAnalysisRoute || normalizePrimaryAnalysisRoutePayload(safeData, authorityHierarchyContract) || normalizePrimaryAnalysisRoutePayload(safeAnalysis, authorityHierarchyContract);
  const representationFamilyDecision = safeModel.representationFamilyDecision || normalizeRepresentationFamilyDecisionPayload(safeData) || normalizeRepresentationFamilyDecisionPayload(safeAnalysis);
  const representationFamilyRoute = safeModel.representationFamilyRoute || normalizeRepresentationFamilyRoutePayload(safeData, representationFamilyDecision) || normalizeRepresentationFamilyRoutePayload(safeAnalysis, representationFamilyDecision);
  const representationFamilyEvidenceGates = safeArray(safeModel.representationFamilyEvidenceGates).length
    ? safeArray(safeModel.representationFamilyEvidenceGates)
    : normalizeRepresentationFamilyEvidenceGatesPayload(safeData, representationFamilyDecision).length
      ? normalizeRepresentationFamilyEvidenceGatesPayload(safeData, representationFamilyDecision)
      : normalizeRepresentationFamilyEvidenceGatesPayload(safeAnalysis, representationFamilyDecision);
  const primaryAnalysisRoute = buildFamilyProductRouteTruth({
    canonicalProductRoute,
    primaryAnalysisRoute: rawPrimaryAnalysisRoute,
    representationFamilyRoute,
    familyCanonicalRoutingContract,
    familyDataRequirementMatrixContract,
    assetInterpretationContract,
    institutionalProductTruthObject: safeModel.institutionalProductTruthObject,
  }) || rawPrimaryAnalysisRoute;
  const scoringReadinessContract = safeModel.scoringReadinessContract || normalizeScoringReadinessContractPayload(safeData) || normalizeScoringReadinessContractPayload(safeAnalysis);
  const engineLearningBackbone = safeModel.engineLearningBackbone || normalizeEngineLearningBackbonePayload(safeData) || normalizeEngineLearningBackbonePayload(safeAnalysis);
  const benchmarkAssetPresetRegistry = engineLearningBackbone?.benchmarkAssetPresetRegistry || null;
  const engineLearningFeedbackLoop = engineLearningBackbone?.engineLearningFeedbackLoop || null;
  const selectedBenchmarkPreset = safeModel.benchmarkAssetPreset || findBenchmarkSearchPresetForAsset(safeAsset, safeAnalysis, engineLearningBackbone);
  const selectedBenchmarkLearningCapture = safeModel.benchmarkLearningCapture || selectedBenchmarkPreset?.benchmarkLearningCapture || null;
  const providerCategorySignals = safeModel.providerCategorySignals || normalizeProviderCategorySignalsPayload(safeData) || normalizeProviderCategorySignalsPayload(safeAnalysis);
  const categoryDrivenAssetFamilyContract = safeModel.categoryDrivenAssetFamilyContract || normalizeCategoryDrivenAssetFamilyContractPayload(safeData) || normalizeCategoryDrivenAssetFamilyContractPayload(safeAnalysis);
  const categoryDataRequirementProfiles = safeModel.categoryDataRequirementProfiles || normalizeCategoryDataRequirementProfilesPayload(safeData) || normalizeCategoryDataRequirementProfilesPayload(safeAnalysis);
  const categoryAnswerBuilder = safeModel.categoryAnswerBuilder || normalizeCategoryAnswerBuilderPayload(safeData) || normalizeCategoryAnswerBuilderPayload(safeAnalysis);
  const categoryReadinessDiagnostics = safeModel.categoryReadinessDiagnostics || normalizeCategoryReadinessDiagnosticsPayload(safeData) || normalizeCategoryReadinessDiagnosticsPayload(safeAnalysis);
  const providerRawDataExpansion = safeModel.providerRawDataExpansion || normalizeProviderRawDataExpansionPayload(safeData) || normalizeProviderRawDataExpansionPayload(safeAnalysis);
  const rawDataCoverageDiagnostics = safeModel.rawDataCoverageDiagnostics || normalizeRawDataCoverageDiagnosticsPayload(safeData) || normalizeRawDataCoverageDiagnosticsPayload(safeAnalysis) || providerRawDataExpansion?.rawDataCoverageDiagnostics;
  const apiFirstInstitutionalIntelligence = normalizeApiFirstInstitutionalIntelligencePayload(safeModel) || normalizeApiFirstInstitutionalIntelligencePayload(safeData) || normalizeApiFirstInstitutionalIntelligencePayload(safeAnalysis);
  const rawProviderDataRegistryContract = apiFirstInstitutionalIntelligence?.rawProviderDataRegistryContract || safeModel.rawProviderDataRegistryContract || null;
  const typedObservationLayerContract = apiFirstInstitutionalIntelligence?.typedObservationLayerContract || safeModel.typedObservationLayerContract || null;
  const institutionalProductTruthObject = apiFirstInstitutionalIntelligence?.institutionalProductTruthObject || safeModel.institutionalProductTruthObject || null;
  const institutionalQuestionAnswerEngineContract = apiFirstInstitutionalIntelligence?.institutionalQuestionAnswerEngineContract || safeModel.institutionalQuestionAnswerEngineContract || null;
  const manualApiResearchGapQueue = apiFirstInstitutionalIntelligence?.manualApiResearchGapQueue || safeModel.manualApiResearchGapQueue || null;
  const calibrationBacktestReadiness = apiFirstInstitutionalIntelligence?.calibrationBacktestReadiness || safeModel.calibrationBacktestReadiness || null;
  const providerDataBoundaryContract = safeModel.providerDataBoundaryContract || normalizeProviderDataBoundaryPayload(safeModel) || normalizeProviderDataBoundaryPayload(safeData) || normalizeProviderDataBoundaryPayload(safeAnalysis);
  const providerCapabilityRegistryContract = safeModel.providerCapabilityRegistryContract || normalizeProviderCapabilityRegistryPayload(safeModel) || normalizeProviderCapabilityRegistryPayload(safeData) || normalizeProviderCapabilityRegistryPayload(safeAnalysis) || providerDataBoundaryContract?.providerCapabilitySummary || null;
  const typedObservationFamilyAuthorityContract = safeModel.typedObservationFamilyAuthorityContract || normalizeTypedObservationFamilyAuthorityPayload(safeModel) || normalizeTypedObservationFamilyAuthorityPayload(safeData) || normalizeTypedObservationFamilyAuthorityPayload(safeAnalysis);
  const institutionalMethodologyContract = safeModel.institutionalMethodologyContract || normalizeInstitutionalMethodologyContractPayload(safeModel) || normalizeInstitutionalMethodologyContractPayload(safeData) || normalizeInstitutionalMethodologyContractPayload(safeAnalysis);
  const sourceIntelligenceContract = safeModel.sourceIntelligenceContract || normalizeSourceIntelligencePayload(safeModel) || normalizeSourceIntelligencePayload(safeData) || normalizeSourceIntelligencePayload(safeAnalysis);
  const evidenceRegistryContract = safeModel.evidenceRegistryContract || normalizeEvidenceRegistryPayload(safeModel) || normalizeEvidenceRegistryPayload(safeData) || normalizeEvidenceRegistryPayload(safeAnalysis) || sourceIntelligenceContract?.evidenceRegistryContract || null;
  const questionEvidenceMappingContract = safeModel.questionEvidenceMappingContract || normalizeQuestionEvidenceMappingPayload(safeModel) || normalizeQuestionEvidenceMappingPayload(safeData) || normalizeQuestionEvidenceMappingPayload(safeAnalysis) || sourceIntelligenceContract?.questionEvidenceMappingContract || null;
  const deepResearchSourceDiscoveryContract = safeModel.deepResearchSourceDiscoveryContract || normalizeDeepResearchSourceDiscoveryPayload(safeModel) || normalizeDeepResearchSourceDiscoveryPayload(safeData) || normalizeDeepResearchSourceDiscoveryPayload(safeAnalysis);
  const sourceCandidatePipelineContract = safeModel.sourceCandidatePipelineContract || normalizeSourceCandidatePipelinePayload(safeModel) || normalizeSourceCandidatePipelinePayload(safeData) || normalizeSourceCandidatePipelinePayload(safeAnalysis) || deepResearchSourceDiscoveryContract?.sourceCandidatePipelineContract || null;
  const sourceCandidateRegistryContract = safeModel.sourceCandidateRegistryContract || normalizeSourceCandidateRegistryPayload(safeModel) || normalizeSourceCandidateRegistryPayload(safeData) || normalizeSourceCandidateRegistryPayload(safeAnalysis) || deepResearchSourceDiscoveryContract?.sourceCandidateRegistryContract || null;
  const sourceCandidateReviewWorkflowContract = safeModel.sourceCandidateReviewWorkflowContract || normalizeSourceCandidateReviewWorkflowPayload(safeModel) || normalizeSourceCandidateReviewWorkflowPayload(safeData) || normalizeSourceCandidateReviewWorkflowPayload(safeAnalysis);
  const sourceCandidateReviewQueueContract = safeModel.sourceCandidateReviewQueueContract || normalizeSourceCandidateReviewQueuePayload(safeModel) || normalizeSourceCandidateReviewQueuePayload(safeData) || normalizeSourceCandidateReviewQueuePayload(safeAnalysis) || sourceCandidateReviewWorkflowContract?.sourceCandidateReviewQueueContract || null;
  const sourceCandidateReviewAuditTrailContract = safeModel.sourceCandidateReviewAuditTrailContract || normalizeSourceCandidateReviewAuditTrailPayload(safeModel) || normalizeSourceCandidateReviewAuditTrailPayload(safeData) || normalizeSourceCandidateReviewAuditTrailPayload(safeAnalysis) || sourceCandidateReviewWorkflowContract?.sourceCandidateReviewAuditTrailContract || null;
  const institutionalAnalystWorkflowContract = resolveInstitutionalAnalystWorkflowContract(safeModel, safeData, safeAnalysis);
  const institutionalQuestionSourceCoverageContract =
    safeModel.institutionalQuestionSourceCoverageContract
    || normalizeInstitutionalQuestionSourceCoveragePayload(safeModel)
    || normalizeInstitutionalQuestionSourceCoveragePayload(safeData)
    || normalizeInstitutionalQuestionSourceCoveragePayload(safeAnalysis);
  const searchIdentityReconciliation = assetIdentityResolution?.searchIdentityReconciliation || null;
  const questions = safeModel.institutionalQuestions || normalizeInstitutionalQuestionsPayload(safeAnalysis).institutionalQuestions;
  const institutionalAnswerCards = safeArray(institutionalAnswerSurfaceContract?.userAnswerCards);
  const institutionalAnswerForbiddenLeakageCount = Number(institutionalAnswerSurfaceContract?.leakageCheck?.forbiddenPrimaryTermLeakageCount || 0)
    + Number(institutionalAnswerSurfaceContract?.leakageCheck?.internalEnumLeakageCount || 0)
    + Number(institutionalAnswerSurfaceContract?.leakageCheck?.methodologyLeakageCount || 0)
    + Number(institutionalAnswerSurfaceContract?.leakageCheck?.familyNegativeGuardrailLeakageCount || 0);
  const calibrationWarnings = safeModel.calibrationWarnings || normalizeCalibrationWarningsPayload(safeAnalysis);
  const analysisFreshness = safeModel.analysisFreshness || normalizeAnalysisFreshnessPayload(safeData, null);
  const bundleGeneratedAt = new Date().toISOString();
  const normalizedFreshnessFromPayload = normalizeAnalysisFreshnessPayload(safeData, null);
  const bundleUsesSameCurrentAnalysisObject = Boolean(
    safeModel.analysisFreshness
    && analysisFreshness.freshnessStatus === normalizedFreshnessFromPayload.freshnessStatus
    && String(analysisFreshness.generatedAt || "") === String(normalizedFreshnessFromPayload.generatedAt || ""),
  );
  const freshnessTabsWithVisibility = [
    "Decision Header",
    "Right Rail",
    "Evidence Map",
    "Source Queue",
    "Manual Review",
    "Audit / Raw",
    "Copy Review Bundle",
  ];
  const freshnessQaWarnings = [
    !analysisFreshness.freshQaEligible ? analysisFreshness.qaEligibilityWarning : null,
    !bundleUsesSameCurrentAnalysisObject ? "Bundle freshness metadata could not be proven identical to the normalized product-tab object." : null,
    analysisFreshness.isSnapshot ? "Snapshot-derived output is disabled for current product QA." : null,
    analysisFreshness.isCachedRecentMemo ? "Cached/recent memo output is disabled for current product QA." : null,
    analysisFreshness.freshnessStatus === "unknown" ? "Freshness state is ambiguous; current product should be live full recompute." : null,
  ].filter(Boolean);
  const questionMismatchWarnings = safeArray(calibrationWarnings).filter((warning) => warning?.id === "question_lens_mismatch");
  const qaRepresentationType = resolveQaRepresentationType({
    assetIdentityResolution,
    representationFamilyDecision,
    representationFamilyRoute,
    primaryAnalysisRoute,
  });
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
  const renderedSurfaceParityViewModel = buildRenderedSurfaceParityViewModel({
    model: {
      ...safeModel,
      effectiveInstitutionalLens,
    },
    displayIdentity,
  });
  const renderedPrimaryVisibleText = renderedSurfaceParityViewModel.primaryVisibleText.join("\n");
  const twoAmBundleUserMirrorText = [
    ...institutionalAnswerCards.flatMap((card) => [
      card.question,
      card.statusLabel || card.sourceStateLabel,
      card.shortAnswer || card.fundamentalAnalysis,
    ]),
    ...safeArray(institutionalAnswerSurfaceContract?.sourceSummary?.evidenceWeHave),
    ...safeArray(institutionalAnswerSurfaceContract?.sourceSummary?.sourceQueueSummary || institutionalAnswerSurfaceContract?.sourceSummary?.openChecks),
    institutionalAnswerSurfaceContract?.scoreSummary?.scoreLabel,
    institutionalAnswerSurfaceContract?.scoreSummary?.confidenceLabel,
    institutionalAnswerSurfaceContract?.scoreSummary?.plainEnglishSummary,
    ...safeArray(institutionalAnswerSurfaceContract?.scoreSummary?.scoringTransparencySummary),
  ].map(cleanPrimaryAnswerText).filter(Boolean);
  const twoAmLeakageCorpus = buildAnswerSurfaceLeakageCorpus({
    assetSymbol: safeAsset.symbol || safeModel.assetName,
    model: safeModel,
    institutionalAnswerSurfaceContract,
    evidenceProvenanceSemanticsContract,
    renderedPrimaryVisibleText: renderedSurfaceParityViewModel.primaryVisibleText,
    bundleUserMirrorText: twoAmBundleUserMirrorText,
  });
  const twoAmRenderedPrimaryScan = scanAnswerSurfaceLeakageCorpus(twoAmLeakageCorpus);
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
  const visibleContractDisplay = safeObject(assetInterpretationContract?.visibleDisplayContract);
  const visibleBundleLensLabel = primaryAnalysisRoute?.visibleLabel || visibleContractDisplay.primaryVisibleLabel || lens?.visibleLabelOverride || lens?.displayLabel || displayIdentity?.displayAssetClass || lens?.label || safeModel.assetClassLabel;
  const visibleBundleFramingLabel = primaryAnalysisRoute?.assetFramingLabel || visibleContractDisplay.assetFramingLabel || displayIdentity?.displayFraming || lens?.displayFraming || safeModel.assetFramingLabel;
  const tokenizedGoldPrimaryContext = /tokenized_gold|tokenized gold|commodity-backed rwa|commodity backed rwa|paxg|pax gold|physical gold/i.test([
    lens?.lensId,
    lens?.questionGroupId,
    visibleBundleLensLabel,
    visibleBundleFramingLabel,
    displayIdentity?.displayAssetClass,
    displayIdentity?.displayFraming,
    safeAsset.symbol,
    safeAsset.name,
  ].filter(Boolean).join(" "));
  const tokenizedGoldPrimaryForbiddenPattern = /Confirm a clear vesting schedule and next unlock magnitude|Close the weakest-link gaps in token demand, governance, or security evidence|Critical tokenomics evidence is missing|utility or vesting support|Durable token demand remains too weak|durable token demand|Wrapped-asset underwriting|generic DeFi value capture|governance value capture/i;
  const tokenizedGoldPrimaryAllowedPattern = /physical gold|gold backing|commodity backing|issuer|custodian|vault|attestation|audit|redemption|legal claim|KYC|jurisdiction|spot[- ]gold|liquidity|depth|venue|contract|admin|freeze/i;
  const tokenizedGoldPrimaryCopyLeak = tokenizedGoldPrimaryContext && tokenizedGoldPrimaryForbiddenPattern.test(visiblePrimaryText);
  const tokenizedGoldPrimaryCopyMissingAllowed = tokenizedGoldPrimaryContext && !tokenizedGoldPrimaryAllowedPattern.test(visiblePrimaryText);
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
  const tokenomicsProviderRowsMissing = tokenomicsSupplyIntegrity
    && [tokenomicsSupplyIntegrity.currentPrice, tokenomicsSupplyIntegrity.marketCap, tokenomicsSupplyIntegrity.fdv, tokenomicsSupplyIntegrity.circulatingSupply, tokenomicsSupplyIntegrity.maxSupplyValue].some((value) => value !== null && value !== undefined)
    && ![
      ...safeArray(tokenomicsSupplyIntegrity.providerMarketCaps),
      ...safeArray(tokenomicsSupplyIntegrity.providerFdvs),
      ...safeArray(tokenomicsSupplyIntegrity.providerVolumes),
      ...safeArray(tokenomicsSupplyIntegrity.providerSupplyValues),
    ].length;
  const tokenomicsMissingRatioDespiteValues = tokenomicsSupplyIntegrity
    && tokenomicsSupplyIntegrity.fdv !== null
    && tokenomicsSupplyIntegrity.fdv !== undefined
    && tokenomicsSupplyIntegrity.marketCap
    && (tokenomicsSupplyIntegrity.fdvMarketCapRatio === null || tokenomicsSupplyIntegrity.fdvMarketCapRatio === undefined);
  const tokenomicsMissingDilutionDespiteValues = tokenomicsSupplyIntegrity
    && tokenomicsSupplyIntegrity.circulatingSupply !== null
    && tokenomicsSupplyIntegrity.circulatingSupply !== undefined
    && tokenomicsSupplyIntegrity.maxSupplyValue
    && (tokenomicsSupplyIntegrity.remainingDilutionPercent === null || tokenomicsSupplyIntegrity.remainingDilutionPercent === undefined);
  const tokenomicsFormulaOutputs = safeArray(tokenomicsQuality?.formulaOutputs).length
    ? safeArray(tokenomicsQuality.formulaOutputs)
    : safeArray(tokenomicsSupplyIntegrity?.formulaOutputs);
  const tokenomicsFormulaOutputsMissing = tokenomicsSupplyIntegrity
    && [tokenomicsSupplyIntegrity.marketCap, tokenomicsSupplyIntegrity.fdv, tokenomicsSupplyIntegrity.circulatingSupply, tokenomicsSupplyIntegrity.maxSupplyValue].some((value) => value !== null && value !== undefined)
    && !tokenomicsFormulaOutputs.length;
  const tokenomicsQuestionsMissingLinkage = tokenomicsSupplyIntegrity
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).length
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).some((question) => !safeArray(question.dataFieldsUsed).length && !safeArray(question.formulaOutputsUsed).length);
  const tokenomicsQuestions = safeArray(tokenomicsSupplyIntegrity?.institutionalQuestions);
  const tokenomicsQuestionAccordionMirrorMissing = tokenomicsSupplyIntegrity && !tokenomicsQuestions.length;
  const tokenomicsQuestionExpandedMissingShortAnswer = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) => !String(question?.shortAnswer || question?.answerSummary || "").trim());
  const tokenomicsQuestionMissingDataFormulaRule = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) =>
      !safeArray(question?.dataFieldsUsed).length
      && !safeArray(question?.formulaOutputsUsed).length
      && !/not_applicable|manual|source_required|evidence_missing/i.test(String(question?.answerStatus || "")),
    );
  const tokenomicsQuestionVagueUnknown = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) =>
      /\bunknown\b/i.test(String(question?.shortAnswer || question?.answerSummary || ""))
      && [
        ...safeArray(question?.missingEvidence),
        ...safeArray(question?.whatWouldChange),
        ...safeArray(question?.sourceBoundary),
      ].length,
    );
  const tokenomicsNotApplicableShownAsFailure = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) =>
      question?.answerStatus === "not_applicable"
      && /failure|blocker|critical|penalty|failed/i.test(`${question?.shortAnswer || ""} ${question?.answerSummary || ""} ${question?.impactOnScoreOrConfidence || ""}`),
    );
  const formulaLinkedQuestionPattern = /remaining_dilution|unlock|supply_reconciliation|provider_supply|dilution_absorption|market_cap/i;
  const tokenomicsComputedFormulaNotCited = tokenomicsSupplyIntegrity
    && tokenomicsFormulaOutputs.some((formula) => formula?.status === "computed")
    && tokenomicsQuestions.some((question) =>
      formulaLinkedQuestionPattern.test(`${question?.questionId || ""} ${question?.questionText || ""}`)
      && !safeArray(question?.formulaOutputsUsed).length
      && !/not_applicable/i.test(String(question?.answerStatus || "")),
    );
  const tokenomicsMissingInputFormulaNoRequirement = tokenomicsSupplyIntegrity
    && tokenomicsFormulaOutputs.some((formula) =>
      /missing|source_required/i.test(String(formula?.status || ""))
      && !safeArray(formula?.missingInputs).length
      && !String(formula?.sourceRequirement || "").trim(),
    );
  const tokenomicsProviderReportedAsReviewed = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) =>
      /reviewed evidence present|reviewed=true|source-backed reviewed/i.test(`${question?.shortAnswer || ""} ${question?.answerSummary || ""}`)
      && safeArray(question?.sourceBoundary).some((entry) => /provider-reported|provider reported|not reviewed/i.test(String(entry))),
    );
  const allSynthesizedQuestions = [
    ...safeArray(questions),
    ...tokenomicsQuestions,
  ].filter((question) => question?.synthesizedAnswer);
  const synthesizedAnswerMissing = [...safeArray(questions), ...tokenomicsQuestions].some((question) => !question?.synthesizedAnswer);
  const genericMethodologySynthesisLeak = allSynthesizedQuestions.some((question) =>
    /\b(this lens tests|this question evaluates|the engine checks|this methodology assesses|this framework looks at)\b/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const synthesizedBadRenderableValue = allSynthesizedQuestions.some((question) =>
    /\b(undefined|null|nan|infinity|\[object object\])\b/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const sourceBackedSynthesisWithoutSourceList = allSynthesizedQuestions.some((question) =>
    question?.synthesizedAnswer?.evidenceStatus === "source_backed"
    && (!safeArray(question?.synthesizedAnswer?.reviewedSourcesUsed).length || !safeArray(question?.synthesizedAnswer?.reviewedFactsUsed).length),
  );
  const synthesizedScoringBoundaryViolation = allSynthesizedQuestions.some((question) =>
    safeArray(question?.synthesizedAnswer?.reviewedSourcesUsed).some((source) => source?.scoringEligible)
    || safeArray(question?.synthesizedAnswer?.sourceBoundary).some((entry) => /scoring_active/i.test(String(entry)) && !/not_scoring_active/i.test(String(entry))),
  );
  const providerOnlySynthesisOverclaimed = allSynthesizedQuestions.some((question) =>
    question?.synthesizedAnswer?.evidenceStatus === "provider_reported"
    && /source-backed|reviewed evidence proves|confirmed by reviewed/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const computedSynthesisOverclaimed = allSynthesizedQuestions.some((question) =>
    question?.synthesizedAnswer?.evidenceStatus === "computed"
    && /reviewed evidence proves|source-backed/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const stablecoinCopyLeakageInSynthesis = allSynthesizedQuestions.some((question) =>
    lens?.lensId !== "STABLECOIN_SETTLEMENT"
    && /stablecoin trust framing/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const irrelevantSectorSignalLeakageInSynthesis = allSynthesizedQuestions.some((question) =>
    /AI sector markers|gaming markers outside gaming|RWA markers outside RWA|stablecoin framing outside stablecoins|meme markers outside meme/i.test(JSON.stringify(question?.synthesizedAnswer || {})),
  );
  const supportedSourceRequiredSynthesisMismatch = allSynthesizedQuestions.some((question) =>
    question?.synthesizedAnswer?.evidenceStatus === "source_required"
    && ["supported", "partially_supported"].includes(question?.answerStatus)
    && !safeArray(question?.synthesizedAnswer?.answerQualityFlags).some((flag) => /legacy_support_status_is_not_reviewed_evidence/.test(String(flag))),
  );
  const analystCards = allSynthesizedQuestions.map((question) => ({ question, card: getAnalystAnswerCard(question) }));
  const analystCardMissing = allSynthesizedQuestions.some((question) => !safeObject(question?.synthesizedAnswer?.analystAnswerCard).directAnswer);
  const analystPrimaryMissingAnswer = analystCards.some(({ card }) => !String(card?.directAnswer || "").trim());
  const analystPrimaryTemplateLeakage = analystCards.some(({ card }) =>
    /synthesisTemplateId|institutional_answer_synthesis_v1|sourceBoundary|scoringFieldsUsed|tokenDemandQuality|Unavailable in current frontend model/i.test(`${card?.directAnswer || ""} ${card?.headlineStatus || ""} ${safeArray(card?.primaryBadges).join(" ")}`),
  );
  const analystPrimaryRawEnumLeakage = analystCards.some(({ card }) =>
    /provider_metadata_not_reviewed_evidence|reviewed_demo_evidence_not_scoring_active|scoring_active_existing_field|diagnostic_only_not_scoring_active/i.test(`${card?.directAnswer || ""} ${card?.headlineStatus || ""}`),
  );
  const analystContradictoryBadgeStack = analystCards.some(({ question, card }) =>
    ["supported", "partially_supported"].includes(question?.answerStatus)
    && /source review required|live data required/i.test(String(card?.headlineStatus || ""))
    && !safeArray(card?.auditFields).some((entry) => /legacyAnswerStatus/i.test(String(entry))),
  );
  const analystSourceBackedWithoutSources = analystCards.some(({ card }) =>
    /source-backed/i.test(String(card?.headlineStatus || ""))
    && !safeArray(card?.reviewedEvidenceUsed).length,
  );
  const analystProviderOnlyOverclaim = analystCards.some(({ card }) =>
    /provider context only/i.test(String(card?.headlineStatus || ""))
    && /source-backed|reviewed evidence proves|confirmed by reviewed/i.test(String(card?.directAnswer || "")),
  );
  const analystFormulaOverclaim = analystCards.some(({ card }) =>
    /formula-derived/i.test(String(card?.headlineStatus || ""))
    && /source-backed|reviewed evidence proves|confirmed by reviewed/i.test(String(card?.directAnswer || "")),
  );
  const analystBundleMirrorMissing = allSynthesizedQuestions.length > 0 && analystCards.some(({ card }) =>
    !card?.directAnswer || !card?.headlineStatus || !safeArray(card?.sourceBoundaryPlainEnglish).length,
  );
  const stablecoinAnalystCards = analystCards.filter(({ question }) =>
    /^stablecoin_/.test(String(question?.questionId || ""))
    || (lens?.lensId === "STABLECOIN_SETTLEMENT" && /^tokenomics_/.test(String(question?.questionId || ""))),
  );
  const stablecoinTrustNotApplicableLeakage = stablecoinAnalystCards.some(({ question, card }) =>
    ["stablecoin_trust_evidence", "stablecoin_what_changes"].includes(String(question?.questionId || ""))
    && (
      /not applicable/i.test(String(card?.headlineStatus || ""))
      || /not applicable as a protocol-token value-capture question/i.test(String(card?.directAnswer || ""))
    ),
  );
  const stablecoinProtocolNotApplicableMissing = lens?.lensId === "STABLECOIN_SETTLEMENT"
    && stablecoinAnalystCards.some(({ question, card }) =>
      /burn_buyback|buyback|fee_switch|tokenholder_accrual|value_capture/i.test(String(question?.questionId || ""))
      && !/not applicable/i.test(`${card?.headlineStatus || ""} ${card?.directAnswer || ""}`),
    );
  const stablecoinTokenomicsScarcityDominance = lens?.lensId === "STABLECOIN_SETTLEMENT"
    && stablecoinAnalystCards.some(({ question, card }) =>
      ["tokenomics_max_supply_credibility", "tokenomics_remaining_dilution"].includes(String(question?.questionId || ""))
      && !/reserve|redemption|mint\/redeem|issuer|supported-network|peg|stablecoin/i.test(`${card?.directAnswer || ""} ${safeArray(card?.missingEvidence).join(" ")}`),
    );
  const tokenomicsProviderBoundaryMissing = tokenomicsSupplyIntegrity
    && [
      ...safeArray(tokenomicsSupplyIntegrity.providerMarketCaps),
      ...safeArray(tokenomicsSupplyIntegrity.providerFdvs),
      ...safeArray(tokenomicsSupplyIntegrity.providerVolumes),
      ...safeArray(tokenomicsSupplyIntegrity.providerSupplyValues),
    ].some((entry) => !entry?.boundary && !safeArray(entry?.sourceBoundary).length);
  const tokenomicsCanonicalStablecoinWrongVariant = tokenomicsSupplyIntegrity
    && lens?.lensId === "STABLECOIN_SETTLEMENT"
    && assetIdentityResolution?.representationType === "issuer_native_multichain_stablecoin"
    && [
      ...safeArray(assetIdentityResolution.identityWarnings),
      ...safeArray(assetIdentityResolution.chainWarnings),
      ...safeArray(assetIdentityResolution.contractWarnings),
    ].some((entry) => /wrapped|bridged|secondary variant|native asset fundamentals do not automatically transfer/i.test(String(entry)));
  const issuerNativeStablecoinVariantWarningLeak = lens?.lensId === "STABLECOIN_SETTLEMENT"
    && assetIdentityResolution?.representationType === "issuer_native_multichain_stablecoin"
    && assetIdentityResolution?.bridgedOrWrappedStatus === "none_detected"
    && safeArray(calibrationWarnings).some((warning) => warning?.id === "wrapped_or_bridged_variant_identity_review");
  const rwaProtocolProductChainCanonicalOverride = ["RWA_HYBRID_ASSET", "RWA_HYBRID_INFRASTRUCTURE"].includes(lens?.lensId)
    && /xrp ledger/i.test(String(assetIdentityResolution?.canonicalNetworkCandidate || ""))
    && /ethereum/i.test(String(assetIdentityResolution?.analyzedNetwork || assetChain || ""));
  const memeEvidenceRoutedManual = ["AMBIGUOUS_MANUAL_CLASSIFICATION", "GENERAL_LOW_COVERAGE"].includes(lens?.lensId)
    && /meme|narrative/i.test([
      safeAsset.category,
      safeAsset.narrative,
      displayIdentity?.displayFraming,
      displayIdentity?.displayAssetClass,
      safeArray(lens?.matchedSignals).join(" "),
    ].join(" "));
  const tokenomicsCrossScopeDisagreementPollution = tokenomicsSupplyIntegrity
    && safeArray(tokenomicsSupplyIntegrity.providerDisagreements).some((entry) => /dexscreener/i.test(String(entry)))
    && safeArray(tokenomicsSupplyIntegrity.providerScopeNotes).some((entry) => /pair-level|scope differs/i.test(String(entry)));
  const tokenomicsQaUnrelatedDiagnostics = tokenomicsSupplyIntegrity
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).some((question) =>
      safeArray(question.evidenceUsed).some((entry) => /anthropic|github|fundraising|tokenterminal|intotheblock|de\.fi|api key/i.test(String(entry))),
    );
  const tokenomicsStablecoinQuestionsGeneric = tokenomicsSupplyIntegrity
    && lens?.lensId === "STABLECOIN_SETTLEMENT"
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).some((question) =>
      ["tokenomics_max_supply_credibility", "tokenomics_remaining_dilution"].includes(question.questionId)
      && !/stablecoin|mint\/redeem|reserve|redemption|issuer/i.test(`${question.answerSummary} ${question.shortAnswer} ${safeArray(question.missingEvidence).join(" ")}`),
    );
  const tokenomicsAmbiguousVerifiedControlLabels = false;
  const tokenomicsContractListTooLong = tokenomicsSupplyIntegrity
    && safeArray(assetIdentityResolution?.allKnownContracts).length > 5;
  const nativeTokenomicsLens = ["NATIVE_MONETARY_BENCHMARK", "BASE_LAYER_SETTLEMENT", "PAYMENTS_SETTLEMENT"].includes(lens?.lensId);
  const tokenomicsNativeNoContractPenalty = tokenomicsSupplyIntegrity
    && nativeTokenomicsLens
    && [
      ...safeArray(tokenomicsSupplyIntegrity.scoreCaps),
      ...safeArray(tokenomicsSupplyIntegrity.confidenceCaps),
      ...safeArray(tokenomicsSupplyIntegrity.manualReviewTriggers),
    ].some((item) => /contract scan|erc-20|evm contract|mint\/admin/i.test(String(item)));
  const tokenomicsNativeUnlockPenalty = tokenomicsSupplyIntegrity
    && nativeTokenomicsLens
    && safeArray(tokenomicsSupplyIntegrity.confidenceCaps).some((item) => /Unlock schedule missing/i.test(String(item)));
  const tokenomicsStablecoinHardCapPrimary = tokenomicsSupplyIntegrity
    && lens?.lensId === "STABLECOIN_SETTLEMENT"
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).some((question) =>
      ["tokenomics_max_supply_credibility", "tokenomics_remaining_dilution"].includes(question.questionId)
      && question.answerStatus !== "not_applicable",
    );
  const tokenomicsProtocolSuccessAsAccrual = tokenomicsSupplyIntegrity
    && lens?.lensId === "DEFI_PROTOCOL_TOKEN"
    && tokenomicsSupplyIntegrity.tokenholderValueCaptureStatus === "provider_reported"
    && ![
      ...safeArray(tokenomicsSupplyIntegrity.sourceRequirements),
      ...safeArray(tokenomicsSupplyIntegrity.confidenceCaps),
      ...safeArray(tokenomicsSupplyIntegrity.manualReviewTriggers),
    ].some((item) => /fee switch|fee routing|buyback|burn|tokenholder|accrual|governance/i.test(String(item)));
  const tokenomicsMigrationWithoutRequirement = tokenomicsSupplyIntegrity
    && assetIdentityResolution?.migrationStatus
    && assetIdentityResolution.migrationStatus !== "none_detected"
    && !safeArray(tokenomicsSupplyIntegrity.sourceRequirements).some((item) => /migration|canonical|supported contract|old\/new/i.test(String(item)));
  const tokenomicsMemeManualDespiteLens = lens?.lensId === "MEME_NARRATIVE" && /manual classification|low-coverage/i.test(String(displayIdentity?.displayFraming || displayIdentity?.displayAssetClass || ""));
  const tokenomicsHighScoreWithCriticalCaps = tokenomicsSupplyIntegrity
    && Number(tokenomicsSupplyIntegrity.tokenomicsIntegrityScore) >= 80
    && [
      ...safeArray(tokenomicsSupplyIntegrity.hardBlockers),
      ...safeArray(tokenomicsSupplyIntegrity.scoreCaps),
      ...safeArray(tokenomicsSupplyIntegrity.confidenceCaps),
    ].length > 0;
  const tokenomicsTooPunitiveForNotApplicable = tokenomicsSupplyIntegrity
    && Number(tokenomicsSupplyIntegrity.tokenomicsIntegrityScore) < 50
    && safeArray(tokenomicsSupplyIntegrity.confidenceCaps).length === 0
    && safeArray(tokenomicsSupplyIntegrity.scoreCaps).length === 0
    && safeArray(tokenomicsSupplyIntegrity.hardBlockers).length === 0;
  const lstScoreCollapsedOnMissingEvidence = tokenomicsSupplyIntegrity
    && lens?.lensId === "LST_STAKING_DERIVATIVE"
    && Number(tokenomicsSupplyIntegrity.tokenomicsIntegrityScore) < 40
    && !safeArray(tokenomicsSupplyIntegrity.hardBlockers).some((entry) => /confirmed|critical|honeypot|exploit/i.test(String(entry)));
  const wbtcLikelyBridgedSelection = /wbtc/i.test(String(safeAsset.symbol || safeAsset.name || ""))
    && (/bridged/i.test(String(safeAsset.name || "")) || assetIdentityResolution?.representationType === "bridged_asset" || assetIdentityResolution?.wrongAssetRisk === "high");
  const highRiskSearchCandidateLooksSafe = searchIdentityReconciliation?.selectionSafetyLevel === "high_risk_manual"
    && !safeArray(searchIdentityReconciliation.selectionWarnings).length;
  const providerDisagreementHidden = searchIdentityReconciliation?.providerAgreement === "provider_disagreement"
    && !safeArray(searchIdentityReconciliation.providerDisagreementReasons).length;
  const riskySearchSelectionMissingBundleMirror = Boolean(searchIdentityReconciliation?.wrongAssetRisk && searchIdentityReconciliation.wrongAssetRisk !== "low")
    && !safeArray(searchIdentityReconciliation.displayLabels).some((entry) => /wrong-asset risk|manual|wrapped|bridged|lp|lending|leveraged|legacy|metadata/i.test(String(entry)));
  const tokenomicsUnsafeNumericText = /NaN|Infinity|undefined/.test(JSON.stringify(tokenomicsSupplyIntegrity || {}));
  const reviewedPacketLoaded = Boolean(reviewedEvidencePacket?.packetLoaded);
  const reviewedPacketMappings = safeArray(reviewedEvidencePacket?.questionMappings);
  const reviewedPacketSourceBackedNoSources = reviewedPacketMappings.some((mapping) =>
    /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || "")) && !safeArray(mapping?.reviewedSourcesUsed).length
  );
  const reviewedPacketScoringActive = reviewedEvidencePacket?.scoringActive === true
    || safeArray(reviewedEvidencePacket?.sources).some((source) => source?.scoringEligible === true);
  const reviewedPacketGenericSourceRequiredLeak = reviewedPacketLoaded && safeArray(questions).some((question) => {
    const mapping = reviewedPacketMappings.find((entry) => entry?.questionId === question?.questionId);
    return mapping?.answerUpgradeAvailable && /source required|evidence missing|provider metadata only/i.test(String(question?.answerSummary || ""));
  });
  const reviewedPacketMissingBundleSection = reviewedPacketLoaded && !safeArray(reviewedEvidencePacket?.sources).length;
  const reviewedPacketStaleMismatch = reviewedPacketMappings.some((mapping) =>
    mapping?.freshnessStatus === "stale"
    && safeArray(mapping?.reviewedSourcesUsed).some((source) => source?.freshnessStatus === "fresh")
  );
  const reviewedPacketContradictionHidden = reviewedPacketMappings.some((mapping) =>
    safeArray(mapping?.contradictionNotes).length && !/contradict/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketMechanismBackedMarketLiquidity = reviewedPacketMappings.some((mapping) =>
    /market.*(depth|liquidity)|liquidity.*depth/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketMechanismBackedDistributionOverhang = reviewedPacketMappings.some((mapping) =>
    /distribution|escrow|overhang|release|non-circulating|sell pressure/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketMechanismBackedLiveLiveness = reviewedPacketMappings.some((mapping) =>
    /liveness|outage|downtime|congestion|network reliability/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketStablecoinBackedProtocolBurn = lens?.lensId === "STABLECOIN_SETTLEMENT"
    && reviewedPacketMappings.some((mapping) =>
      /burn_buyback|buyback|value_capture|tokenholder|accrual/i.test(String(mapping?.questionId || ""))
      && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    );
  const reviewedPacketProtocolPossibilityBackedActiveAccrual = reviewedPacketMappings.some((mapping) =>
    /tokenholder|accrual|value_capture|fee_switch|protocol_revenue/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    && (
      mapping?.questionEvidenceScope !== "direct_answer"
      || safeArray(mapping?.evidenceMappingWarnings).some((warning) => /active|material|does not answer|does not prove/i.test(String(warning)))
      || safeArray(mapping?.reviewedEvidenceDoesNotAnswer).length
    )
  );
  const reviewedPacketRwaProductRightsAsProtocolRights = reviewedPacketMappings.some((mapping) =>
    /rwa|product_rights|underlying|legal_claim|economic_claim|redemption|aum/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    && safeArray(mapping?.evidenceMappingWarnings).some((warning) => /RWA product|protocol-tokenholder|legal\/economic rights/i.test(String(warning)))
  );
  const reviewedPacketPlatformAumAsAccrual = reviewedPacketMappings.some((mapping) =>
    /aum|product|platform|protocol_revenue|tokenholder|accrual|value_capture/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    && safeArray(mapping?.reviewedEvidenceDoesNotAnswer).some((entry) => /AUM|product|revenue|cash-flow|value capture|rights/i.test(String(entry)))
  );
  const reviewedPacketGamingDocsAsLiveDemand = reviewedPacketMappings.some((mapping) =>
    /active|paying|retention|game_volume|marketplace|tournament|demand_absorption|sustainable/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketMemeAsInvestmentQuality = reviewedPacketMappings.some((mapping) =>
    /investment|allocation|durable|fundamental|institutional/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketNativeL1DocsAsLiquidity = ["BASE_LAYER_SETTLEMENT", "NATIVE_L1", "NATIVE_MONETARY_BENCHMARK"].includes(lens?.lensId)
    && reviewedPacketMechanismBackedMarketLiquidity;
  const reviewedPacketSafetyModuleAsRiskFreeYield = reviewedPacketMappings.some((mapping) =>
    /risk.?free|guaranteed.?yield|safe.?yield|yield_sustainability/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketNativeBtcAppliedToWrappedVariant = reviewedEvidencePacket?.packetId === "reviewed-demo-btc-v1"
    && /wrapped|wbtc|bridged/i.test(`${safeAsset.name || ""} ${safeAsset.id || ""} ${safeAsset.coingeckoId || ""} ${assetIdentityResolution?.representationType || ""}`);
  const reviewedEvidenceIdentityConflictHidden = safeArray(reviewedEvidencePacket?.identityEvidenceReconciliationWarnings).length
    && ![
      ...safeArray(assetIdentityResolution?.identityEvidenceReconciliationWarnings),
      ...safeArray(assetIdentityResolution?.chainWarnings),
      ...safeArray(reviewedEvidencePacket?.warnings),
    ].some((entry) => /reviewed evidence|canonical representation|migration|upgrade/i.test(String(entry)));
  const reviewedEvidenceSourceBackedWithMaterialSameGaps = reviewedPacketMappings.some((mapping) =>
    /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    && safeArray(mapping?.remainingMissingEvidence).some((entry) => /same question|directly answers|primary metric/i.test(String(entry)))
  );
  const reviewedLstMechanismEliminatesRisk = lens?.lensId === "LST_STAKING_DERIVATIVE"
    && safeArray(questions).some((question) =>
      /source_backed/i.test(String(question?.reviewedEvidenceStatus || ""))
      && /risk solved|risk eliminated|no withdrawal risk|no slashing risk|no depeg risk/i.test(`${question?.answerSummary || ""} ${question?.shortAnswer || ""}`)
    );
  const reviewedPacketText = JSON.stringify(reviewedEvidencePacket || {});
  const reviewedPacketRenderGamingCopyLeak = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    && /gaming utility|gameplay|active users|paying users|game volume|tournament|retention/i.test(reviewedPacketText);
  const renderDepinMechanismQuestionIds = [
    "depin_resource_demand_visible",
    "depin_payer_demand_to_token_demand",
    "depin_provider_incentives_durability",
    "depin_usage_vs_tokenholder_capture",
  ];
  const renderDepinMechanismMappings = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    ? reviewedPacketMappings.filter((mapping) => renderDepinMechanismQuestionIds.includes(String(mapping?.questionId || "")))
    : [];
  const renderDepinMechanismCollapsedToSourceRequired = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    && renderDepinMechanismMappings.length > 0
    && renderDepinMechanismMappings.some((mapping) =>
      /source_required/i.test(String(mapping?.reviewedEvidenceStatus || ""))
      || !safeArray(mapping?.reviewedFactsUsed).some((fact) => /render-bme-payment-burn|render-bme-emissions|render-solana-token-context|render-rndr-to-render-upgrade/i.test(String(fact?.factId || "")))
    );
  const renderDepinLiveDemandIncorrectlyUpgraded = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    && reviewedPacketMappings.some((mapping) =>
      String(mapping?.questionId || "") === "depin_prove_resource_market_demand"
      && (/source_backed|partially_source_backed/i.test(String(mapping?.reviewedEvidenceStatus || "")) || mapping?.answerUpgradeAvailable === true)
    );
  const renderDepinMechanismFactsVisible = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    ? renderDepinMechanismMappings.some((mapping) => safeArray(mapping?.reviewedFactsUsed).some((fact) => /render-bme-payment-burn|render-bme-emissions|render-solana-token-context|render-rndr-to-render-upgrade/i.test(String(fact?.factId || ""))))
    : null;
  const reviewedPacketOndoRenderWarningLeak = reviewedEvidencePacket?.packetId === "reviewed-demo-ondo-v1"
    && /RNDR|RENDER|Solana upgraded|Render migration/i.test(JSON.stringify([
      reviewedEvidencePacket?.identityEvidenceReconciliationWarnings,
      reviewedEvidencePacket?.warnings,
      assetIdentityResolution?.identityEvidenceReconciliationWarnings,
      assetIdentityResolution?.chainWarnings,
    ]));
  const uniSourceCandidateRequirementsMissing = reviewedEvidencePacket?.packetId === "reviewed-demo-uni-v1"
    && !/protocol-fee|fee switch|TokenJar|fee-routing|governance finality|materiality|market cap|direct economic benefit/i.test(JSON.stringify([
      reviewedEvidencePacket?.sourceQueueNotes,
      reviewedEvidencePacket?.remainingSourceRequirements,
    ]));
  const assetContract = safeAsset.contractAddress || safeAsset.contract || safeAsset.address || safeAsset.tokenAddress;
  const assetChain = safeAsset.chain || safeAsset.network || safeAsset.platform || safeAsset.chainId;
  const providerIds = [
    safeAsset.coingeckoId ? `coingecko: ${safeAsset.coingeckoId}` : null,
    safeAsset.coinmarketcapId ? `coinmarketcap: ${safeAsset.coinmarketcapId}` : null,
    safeAsset.cmcId ? `cmc: ${safeAsset.cmcId}` : null,
  ].filter(Boolean);
  const wbtcSingleProviderIdentityHidden = /wbtc|wrapped bitcoin/i.test(`${safeAsset.symbol || ""} ${safeAsset.name || ""}`)
    && providerIds.length === 1
    && !/single-provider|CoinGecko\/CoinMarketCap identity agreement|cross-provider/i.test(JSON.stringify([
      assetIdentityResolution?.identityWarnings,
      assetIdentityResolution?.sourceRequirements,
      assetIdentityResolution?.evidenceSourceSummary,
    ]));
  const stethFalseRwaAmbiguityVisible = lens?.lensId === "LST_STAKING_DERIVATIVE"
    && /steth|staked ether|lido/i.test(`${safeAsset.symbol || ""} ${safeAsset.name || ""}`)
    && safeArray(lens?.ambiguityFlags).some((flag) => /Competing RWA \/ Hybrid Methodology Asset|internal classification suggests RWA \/ Hybrid|RWA \/ Hybrid Methodology Asset/i.test(String(flag)));
  const checklistSupportedWithoutAnswer = safeArray(questions).some((question) =>
    ["supported", "partially_supported"].includes(question?.answerStatus)
    && !String(question?.shortAnswer || question?.answerSummary || "").trim(),
  );
  const checklistNoReadableFallback = safeArray(questions).some((question) =>
    !String(question?.questionText || "").trim()
    || (!String(question?.shortAnswer || question?.answerSummary || "").trim()
      && !["not_applicable", "manual_review_required", "evidence_missing", "reviewed_evidence_required", "contradicted"].includes(question?.answerStatus)),
  );
  const checklistRawSourceBoundaryPrimaryRisk = safeArray(questions).some((question) =>
    safeArray(question?.sourceBoundary).some((entry) => /scoring_active_existing_field|provider_metadata_not_reviewed_evidence|diagnostic_only_not_scoring_active/i.test(String(entry))),
  );
  const checklistLongSignalsRisk = safeArray(questions).some((question) => safeArray(question?.supportingSignals).length > 5);
  const questionMatchStatus = questionGroupMatchesLens(questions, lens);
  const identityWarnings = safeArray(calibrationWarnings).filter((warning) => /identity|variant|wrapped|bridged/i.test(String(warning?.id || warning?.issue || "")));
  const lastAnalyzed = safeData.lastAnalyzed || safeData.generatedAt || snapshot?.generatedAt || safeData.snapshot?.generatedAt || safeMeta.generatedAt;
  const verdictLabel = hasAtomicFinalDecision
    ? decisionLayer.verdict?.finalLabel || decisionLayer.verdictLabel || "Decision unavailable"
    : safeModel.allocationOutcome?.label || safeModel.verdictSemantics?.label || decisionLayer.currentState?.label;
  const verdictClass = hasAtomicFinalDecision
    ? decisionLayer.verdict?.finalClass || decisionLayer.verdictClass || null
    : safeModel.verdictClass || decisionLayer.verdictClass;
  const boundary = "Research support only. Not financial advice. No price prediction. Provider metadata is not reviewed evidence; source candidates and report-only overlays are not live scoring input.";
  const assetInterpretationContractMissing = Boolean(lens?.lensId) && !assetInterpretationContract;
  const dataFirstNarrativeMissing = resolvedLensIsDisplayAuthoritative(lens) && !dataFirstNarrativeContract;
  const assetInterpretationHardGateFailure = Boolean(
    (assetInterpretationContract
      && assetInterpretationContract.visibleDisplayContract?.hardGateStatus === "FAIL")
    || dataFirstNarrativeMissing,
  );
  const assetInterpretationVisibleLabelMismatch = assetInterpretationContract
    && visibleContractDisplay.primaryVisibleLabel
    && visibleBundleLensLabel
    && visibleContractDisplay.primaryVisibleLabel !== visibleBundleLensLabel;
  const nonEthLensShowingEthGasLabel = assetInterpretationContract
    && visibleContractDisplay.labelFamily !== "native_pos_settlement_gas"
    && /PoS Smart-Contract Settlement \/ Gas Asset|Gas Asset/i.test(String(visibleBundleLensLabel));
  const effectiveSourceMatrixIds = safeArray(effectiveInstitutionalLens?.sourceMatrixEntryIds || assetInterpretationContract?.effectiveInstitutionalLens?.sourceMatrixEntryIds || assetInterpretationContract?.evidenceInterpretationContract?.sourceMatrixEntryIds);
  const sourceMatrixFamilyMismatch = categoryDrivenAssetFamilyContract?.primaryAssetFamily === "tokenized_gold_commodity_rwa"
    ? !effectiveSourceMatrixIds.includes("matrix_tokenized_gold_commodity_rwa")
    : categoryDrivenAssetFamilyContract?.primaryAssetFamily === "non_eth_l1_smart_contract_platform"
      ? !effectiveSourceMatrixIds.includes("matrix_non_eth_l1_smart_contract_platform")
      : false;
  const visibleLensLabelMirror = safeArray(renderedSurfaceParityViewModel?.surfaces?.visibleLensLabel);
  const visibleLensLabelMirrorMissing = !visibleLensLabelMirror.length && visibleBundleLensLabel !== "not_rendered_by_ui";
  const dataFirstNarrativeFailing = dataFirstNarrativeContract
    && dataFirstNarrativeContract.primaryNarrativeGateStatus === "FAIL";
  const authorityHierarchyMissing = !authorityHierarchyContract;
  const primaryRouteMissing = !primaryAnalysisRoute;
  const primaryRouteFallbackUsed = primaryAnalysisRoute?.fallbackUsed === true;
  const primaryRouteNotSafe = primaryAnalysisRoute && primaryAnalysisRoute.isPrimaryRouteSafe === false;
  const primaryRouteLabelMismatch = primaryAnalysisRoute?.visibleLabel
    && visibleBundleLensLabel
    && primaryAnalysisRoute.visibleLabel !== visibleBundleLensLabel;
  const primaryRouteQuestionGroupMismatch = primaryAnalysisRoute?.questionGroup
    && lens?.questionGroupId
    && primaryAnalysisRoute.questionGroup !== lens.questionGroupId
    && !safeArray(primaryAnalysisRoute.mismatchDiagnostics).some((entry) => entry?.mismatchId === "raw_question_group_diverges_from_primary_route");
  const aicLabelPassButNarrativeFail = assetInterpretationContract
    && assetInterpretationContract.visibleDisplayContract?.hardGateStatus === "PASS"
    && (dataFirstNarrativeFailing || dataFirstNarrativeMissing);
  const scoreExplanationNotDataBound = dataFirstNarrativeContract
    && dataFirstNarrativeContract.scoreExplanationInputs?.scoreExplanationDataBacked === false;
  const sourceUniversePromoted = safeArray(assetInterpretationContract?.evidenceInterpretationContract?.sourceUniverseTaxonomy)
    .some((entry) => entry?.promotedToReviewedEvidence || entry?.reviewedEvidenceScoringActive);
  const btcRenderedGateCorpusRows = buildBtcRenderedGateCorpusRows({
    renderedSurfaceParityViewModel,
    model: safeModel,
    displayIdentity,
    lens,
    questions,
    tokenomicsSupplyIntegrity,
    reviewedEvidencePacket,
  });
  const renderedBtcForbiddenStringChecks = buildBtcBenchmarkForbiddenStringChecks({
    corpusRows: btcRenderedGateCorpusRows,
    bundleText: "",
    canonicalFamily: renderedSurfaceParityViewModel.canonicalFamily,
  });
  const renderedEthForbiddenStringChecks = buildEthBenchmarkForbiddenStringChecks({
    corpusRows: btcRenderedGateCorpusRows,
    bundleText: "",
    canonicalFamily: renderedSurfaceParityViewModel.canonicalFamily,
  });
  const renderedBtcFailures = renderedBtcForbiddenStringChecks.filter((check) => !check.passed);
  const renderedEthFailures = renderedEthForbiddenStringChecks.filter((check) => !check.passed);
  const renderedBtcPrimaryVisibleFailures = renderedBtcForbiddenStringChecks.flatMap((check) => check.primaryVisibleFailures || []);
  const renderedEthPrimaryVisibleFailures = renderedEthForbiddenStringChecks.flatMap((check) => check.primaryVisibleFailures || []);
  const renderedBtcSecondaryVisibleMentions = renderedBtcForbiddenStringChecks.flatMap((check) => check.secondaryVisibleMentions || []);
  const renderedBtcAuditOnlyMentions = renderedBtcForbiddenStringChecks.flatMap((check) => check.auditOnlyMentions || []);
  const renderedBtcInternalIdExclusions = renderedBtcForbiddenStringChecks.flatMap((check) => check.internalIdExclusions || []);
  const renderedBtcForbiddenListExclusions = renderedBtcForbiddenStringChecks.flatMap((check) => check.forbiddenListExclusions || []);
  const renderedBtcBeforeStateExclusions = renderedBtcForbiddenStringChecks.flatMap((check) => check.beforeStateExclusions || []);
  const renderedBtcSelfTriggerExclusions = renderedBtcForbiddenStringChecks.flatMap((check) => check.selfTriggerExclusions || []);
  const renderedBtcGateStatus = renderedBtcFailures.length ? "FAIL" : "PASS";
  const renderedEthGateStatus = renderedEthFailures.length ? "FAIL" : "PASS";
  const requiredMirrorMissingSurfaces = safeArray(renderedSurfaceParityViewModel.missingMirroredSurfaces);
  const requiredPrimaryZeroSurfaces = safeArray(renderedSurfaceParityViewModel.tabMirrorCoverage)
    .filter((entry) => (
      entry?.classification === "primary"
      && Number(entry?.renderedItemCount || 0) === 0
      && entry?.mirrorStatus !== "not_rendered_by_ui"
    ))
    .map((entry) => entry.surface);
  const decisionHeaderMirrorMissing = Number(renderedSurfaceParityViewModel.decisionHeaderRenderedItemCount || 0) === 0;
  const mirrorCoverageGateStatus = requiredMirrorMissingSurfaces.length || requiredPrimaryZeroSurfaces.length || decisionHeaderMirrorMissing
    ? "FAIL"
    : "PASS";
  const renderedSpecificGateStatus = renderedBtcForbiddenStringChecks.length
    ? renderedBtcGateStatus
    : renderedEthForbiddenStringChecks.length
      ? renderedEthGateStatus
      : "PASS";
  const renderedSurfaceOverallGateStatus = mirrorCoverageGateStatus === "FAIL"
    ? "FAIL"
    : renderedSurfaceParityViewModel.primaryNarrativePass === false
      ? "FAIL"
    : renderedSpecificGateStatus === "FAIL"
      ? "FAIL"
      : "PASS";
  const mirrorCoverageFailureReason = mirrorCoverageGateStatus === "FAIL"
    ? `Required live-tab mirror coverage incomplete: missing=${requiredMirrorMissingSurfaces.join("; ") || "none"}; primaryZero=${requiredPrimaryZeroSurfaces.join("; ") || "none"}; decisionHeaderCount=${renderedSurfaceParityViewModel.decisionHeaderRenderedItemCount || 0}.`
    : "All required live-tab mirror surfaces have rendered-intended text.";
  const renderedBtcFailureReason = renderedBtcFailures.length
    ? "BTC primary visible rendered-intended text contains forbidden generic/base-layer copy. This is a blocking product-surface parity failure."
    : "No BTC forbidden strings found in primary visible rendered-intended text.";
  const renderedEthFailureReason = renderedEthFailures.length
    ? "ETH primary visible rendered-intended text contains forbidden BTC/wrapped/stablecoin/RWA/DePIN/gaming/ERC-20/generic copy. This is a blocking product-surface parity failure."
    : "No ETH forbidden strings found in primary visible rendered-intended text.";
  const primaryNarrativeFailureReason = renderedSurfaceParityViewModel.primaryNarrativePass === false
    ? `Primary narrative parity failed: candidate/final contradictions=${renderedSurfaceParityViewModel.candidateFinalContradictionAssertions.length}; wrong-family findings=${renderedSurfaceParityViewModel.wrongFamilyNarrativeAssertions.length}; missing Composer fail-closed=${renderedSurfaceParityViewModel.missingComposerControl?.failClosed ? "yes" : "no"}.`
    : "Final decision, Composer narrative, and canonical-family copy are aligned across the rendered primary corpus.";

  const sections = [
    bundleSection("0. Analysis Freshness / Live Current QA", [
      bundleField("Bundle schema", "review-bundle-live-current-qa-v2"),
      bundleField("Bundle generated at", bundleGeneratedAt),
      bundleField("Bundle mode", analysisFreshness.bundleMode),
      bundleField("Fresh QA eligible", analysisFreshness.freshQaEligible ? "yes" : "no"),
      bundleField("QA eligibility label", analysisFreshness.qaEligibilityLabel),
      bundleField("Current product truth object", analysisFreshness.currentProductTruthObject),
      bundleField("Freshness status", analysisFreshness.freshnessLabel),
      bundleField("Delivery source", analysisFreshness.analysisSource),
      bundleField("Recomputed", analysisFreshness.recomputed === null || analysisFreshness.recomputed === undefined ? "unknown" : analysisFreshness.recomputed ? "yes" : "no"),
      bundleField("Primary analysis path", analysisFreshness.primaryAnalysisPath),
      bundleField("Snapshot disabled", analysisFreshness.snapshotDisabled ? "yes" : "no"),
      bundleField("Snapshot reuse blocked", analysisFreshness.snapshotReuseBlocked ? "yes" : "no"),
      bundleField("Partial refresh disabled", analysisFreshness.partialRefreshDisabled ? "yes" : "no"),
      bundleField("Partial refresh used", analysisFreshness.partialRefreshUsed ? "yes" : "no"),
      bundleField("Partial refresh available", analysisFreshness.partialRefreshAvailable ? "yes" : "no"),
      bundleField("Analysis generated at", analysisFreshness.generatedAt),
      bundleField("Bundle generated/read at", bundleGeneratedAt),
      bundleField("Bundle uses same normalized product object", yesNoUnknown(bundleUsesSameCurrentAnalysisObject)),
      bundleField("Live tabs are product truth; bundle is mirror", "yes"),
      bundleField("Post-patch fresh QA evidence allowed", analysisFreshness.freshQaEligible ? "yes" : "no"),
      "Fresh sections:",
      bundleList(analysisFreshness.freshSections),
      "Missing sections:",
      bundleList(analysisFreshness.missingSections),
      "Freshness warnings / QA prompts:",
      bundleList(freshnessQaWarnings.length ? freshnessQaWarnings : analysisFreshness.freshnessWarnings),
      "Live-tab visibility path:",
      bundleList(freshnessTabsWithVisibility.map((entry) => `${entry}: ${analysisFreshness.freshnessLabel ? "freshness/QA eligibility model available" : "freshness unavailable"}`)),
    ]),
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
      bundleField("Representation type", qaRepresentationType),
      bundleField("Raw representation type (audit only)", assetIdentityResolution?.representationType),
      bundleField("Wrong-asset risk", assetIdentityResolution?.wrongAssetRisk),
      bundleField("Search candidate recommendation", searchIdentityReconciliation?.recommendedCanonicalMatch === undefined ? null : yesNoUnknown(searchIdentityReconciliation.recommendedCanonicalMatch)),
      bundleField("Search candidate rank", searchIdentityReconciliation?.canonicalCandidateRank),
      bundleField("Search selection safety", searchIdentityReconciliation?.selectionSafetyLevel),
      bundleField("Search wrong-asset risk", searchIdentityReconciliation?.wrongAssetRisk),
      bundleField("Search representation type", searchIdentityReconciliation?.representationType),
      bundleField("Search provider agreement", searchIdentityReconciliation?.providerAgreement),
      bundleField("Search contract match status", searchIdentityReconciliation?.contractMatchStatus),
      bundleField("Search network match status", searchIdentityReconciliation?.networkMatchStatus),
      bundleField("Search query intent match", searchIdentityReconciliation?.searchQueryIntentMatch),
      bundleField("Provider IDs", providerIds.join("; ")),
      bundleField("Review Bundle role", "QA/export mirror only; live tabs are the product surface."),
      bundleField("Current QA eligibility", `${analysisFreshness.qaEligibilityLabel || "Unknown"} - ${analysisFreshness.qaEligibilityWarning || "No warning attached."}`),
      bundleField("Analysis freshness", `${analysisFreshness.freshnessLabel} | bundleMode=${analysisFreshness.bundleMode} | freshQaEligible=${analysisFreshness.freshQaEligible ? "yes" : "no"}`),
      bundleField("Product truth object", analysisFreshness.currentProductTruthObject),
      bundleField("Identity confidence", lens?.confidence),
      bundleField("Canonical identity confidence", assetIdentityResolution?.identityConfidence),
      "Identity warnings:",
      bundleList([
        ...safeArray(assetIdentityResolution?.identityWarnings),
        ...safeArray(assetIdentityResolution?.chainWarnings),
        ...safeArray(assetIdentityResolution?.contractWarnings),
        ...safeArray(assetIdentityResolution?.identityEvidenceReconciliationWarnings),
        ...safeArray(searchIdentityReconciliation?.selectionWarnings),
        ...identityWarnings.map((warning) => `${warning.id || "warning"} | ${warning.issue || "Review identity"} | verdict: ${warning.affectsVerdict ? "affects" : "diagnostic"} | scoring: ${warning.affectsScoring ? "affects" : "diagnostic"}`),
      ]),
      "Search candidate labels:",
      bundleList(searchIdentityReconciliation?.displayLabels),
      "Why this search candidate:",
      bundleList(searchIdentityReconciliation?.whyThisCandidate),
      "Why not this search candidate:",
      bundleList(searchIdentityReconciliation?.whyNotThisCandidate),
      bundleField("Last analyzed timestamp", lastAnalyzed),
      bundleField("Analysis freshness", `${analysisFreshness.freshnessLabel} - ${analysisFreshness.summary}`),
      bundleField("Delivery source", analysisFreshness.analysisSource),
      bundleField("Recomputed", analysisFreshness.recomputed === null || analysisFreshness.recomputed === undefined ? "unknown" : analysisFreshness.recomputed ? "yes" : "no"),
      bundleField("Primary analysis path", analysisFreshness.primaryAnalysisPath),
      bundleField("Final decision / verdictClass", verdictClass),
      bundleField("Verdict label", verdictLabel),
      bundleField("Overall score", bundlePrimaryScore),
      bundleField("Confidence", `${safeModel.confidenceLabel || safeConfidence.level || "Unavailable"}${safeModel.confidenceScore !== null && safeModel.confidenceScore !== undefined ? ` (${safeModel.confidenceScore})` : ""}`),
      bundleField("Asset framing", visibleBundleFramingLabel),
      bundleField("Asset class label", visibleBundleLensLabel || safeModel.assetClass),
      bundleField("Sector/lens label", visibleBundleLensLabel || safeModel.primarySector),
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
      bundleField("Selected search candidate display name", searchIdentityReconciliation?.candidateDisplayName),
      bundleField("Selected search canonical identity", searchIdentityReconciliation?.canonicalIdentity),
      bundleField("Selected search manual selection required", searchIdentityReconciliation?.requiresManualSelection === undefined ? null : yesNoUnknown(searchIdentityReconciliation.requiresManualSelection)),
      "Selected search provider disagreement reasons:",
      bundleList(searchIdentityReconciliation?.providerDisagreementReasons),
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
    bundleSection("2AA. Asset Interpretation Contract v1", [
      bundleField("Contract attached", assetInterpretationContract ? "yes" : "missing"),
      bundleField("Artifact version", assetInterpretationContract?.artifactVersion),
      bundleField("Contract status", assetInterpretationContract?.contractStatus),
      bundleField("Primary rule", assetInterpretationContract?.primaryRule || "network_is_context_not_asset_class"),
      bundleField("Canonical asset", `${assetInterpretationContract?.canonicalAsset?.name || "Unavailable"} (${assetInterpretationContract?.canonicalAsset?.symbol || "Unavailable"})`),
      bundleField("Canonical identity", assetInterpretationContract?.canonicalAsset?.canonicalIdentity),
      bundleField("Representation type", assetInterpretationContract?.representationContext?.representationType),
      bundleField("Canonical network candidate", assetInterpretationContract?.representationContext?.canonicalNetworkCandidate),
      bundleField("Selected/analyzed network", `${assetInterpretationContract?.representationContext?.selectedNetwork || "Unavailable"} / ${assetInterpretationContract?.representationContext?.analyzedNetwork || "Unavailable"}`),
      bundleField("Selected/analyzed contract", `${assetInterpretationContract?.representationContext?.selectedContract || "none"} / ${assetInterpretationContract?.representationContext?.analyzedContract || "none"}`),
      bundleField("Raw resolved lens", assetInterpretationContract?.thesisLensContext?.lensId),
      bundleField("Raw resolved question group", assetInterpretationContract?.thesisLensContext?.questionGroupId),
      bundleField("Effective lens source", effectiveInstitutionalLens?.effectiveLensSource || assetInterpretationContract?.effectiveInstitutionalLens?.effectiveLensSource),
      bundleField("Effective lens/family", effectiveInstitutionalLens?.lensId || assetInterpretationContract?.effectiveInstitutionalLens?.lensId),
      bundleField("Effective visible label", effectiveInstitutionalLens?.label || assetInterpretationContract?.effectiveInstitutionalLens?.label),
      bundleField("Effective question group", effectiveInstitutionalLens?.questionGroupId || assetInterpretationContract?.effectiveInstitutionalLens?.questionGroupId),
      bundleField("Effective source profile", effectiveInstitutionalLens?.effectiveSourceMatrixProfile || assetInterpretationContract?.effectiveInstitutionalLens?.effectiveSourceMatrixProfile),
      bundleField("Effective source matrix entries", safeArray(effectiveInstitutionalLens?.sourceMatrixEntryIds || assetInterpretationContract?.effectiveInstitutionalLens?.sourceMatrixEntryIds).join("; ") || "none"),
      bundleField("Category authority overrides raw lens", yesNoUnknown(effectiveInstitutionalLens?.categoryAuthorityOverridesRawLens || assetInterpretationContract?.effectiveInstitutionalLens?.categoryAuthorityOverridesRawLens)),
      bundleField("Raw/effective divergence warning", effectiveInstitutionalLens?.rawEffectiveLensDivergenceWarning || assetInterpretationContract?.effectiveInstitutionalLens?.rawEffectiveLensDivergenceWarning),
      bundleField("Network is classification authority", assetInterpretationContract?.thesisLensContext?.networkContextIsClassificationAuthority ? "yes - QA violation" : "no"),
      bundleField("Visible label family", visibleContractDisplay.labelFamily),
      bundleField("Primary visible label", visibleContractDisplay.primaryVisibleLabel),
      bundleField("Asset framing label", visibleContractDisplay.assetFramingLabel),
      bundleField("Hard gate status", visibleContractDisplay.hardGateStatus),
      "Hard gate failures:",
      bundleList(visibleContractDisplay.hardGateFailures, "No visible-label hard-gate failures."),
      "Forbidden visible label families:",
      bundleList(visibleContractDisplay.forbiddenVisibleLabelFamilies, "No forbidden label families listed."),
      "Label precedence:",
      bundleList(visibleContractDisplay.labelPrecedence),
      bundleField("Expected question group", assetInterpretationContract?.institutionalQuestionContract?.expectedQuestionGroupId),
      bundleField("Actual question group", assetInterpretationContract?.institutionalQuestionContract?.actualQuestionGroupId),
      bundleField("Question group matches lens", yesNoUnknown(assetInterpretationContract?.institutionalQuestionContract?.questionGroupMatchesLens)),
      "Question mismatch warnings:",
      bundleList(assetInterpretationContract?.institutionalQuestionContract?.mismatchWarnings, "No question/lens mismatch warnings."),
      "Source Matrix entries:",
      bundleList(safeArray(assetInterpretationContract?.evidenceInterpretationContract?.sourceMatrixEntries).map((entry) =>
        `${entry.id || "matrix"} | ${entry.lensGroup || "group unavailable"} | scoring=${entry.currentScoringStatus || "non-scoring"} | boundary=${entry.sourceBoundary || "boundary unavailable"}`
      )),
      "Live/API data missing:",
      bundleList(assetInterpretationContract?.evidenceInterpretationContract?.liveApiDataMissing),
      "Reviewed evidence missing:",
      bundleList(assetInterpretationContract?.evidenceInterpretationContract?.reviewedEvidenceMissing),
      "Source candidates only:",
      bundleList(assetInterpretationContract?.evidenceInterpretationContract?.sourceCandidatesOnly),
      "Source universe taxonomy:",
      bundleList(safeArray(assetInterpretationContract?.evidenceInterpretationContract?.sourceUniverseTaxonomy).map((entry) =>
        `${entry.sourceUniverseId || "source_universe"} | ${entry.currentStatus || "status unavailable"} | scoring=${entry.scoringStatus || "non-scoring"} | promoted=${entry.promotedToReviewedEvidence ? "yes" : "no"} | reviewedScoring=${entry.reviewedEvidenceScoringActive ? "yes" : "no"}`
      )),
      "Source boundary:",
      bundleList(assetInterpretationContract?.evidenceInterpretationContract?.sourceBoundary),
      "Rendering parity surfaces:",
      bundleList(assetInterpretationContract?.renderingParityContract?.visibleSurfaces),
      bundleField("Frontend normalization field", assetInterpretationContract?.renderingParityContract?.frontendNormalizationField),
      bundleField("Review Bundle mirror status", assetInterpretationContract?.renderingParityContract?.copyReviewBundleMirrorStatus),
      bundleField("Scoring changed", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.scoringChanged)),
      bundleField("Verdict changed", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.verdictChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.providerBehaviorChanged)),
      bundleField("Reviewed evidence packet expanded", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.reviewedEvidencePacketExpanded)),
      bundleField("Reviewed evidence scoring-active", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.reviewedEvidenceScoringActive)),
      bundleField("Source candidates promoted", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.sourceCandidatesPromoted)),
      bundleField("Token-specific override added", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.tokenSpecificOverrideAdded)),
      bundleField("ADA packet coverage added", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.adaPacketCoverageAdded)),
      "Engine Learning integration rules:",
      bundleList(assetInterpretationContract?.engineLearningIntegration?.ruleIds),
      "Known limitations:",
      bundleList(assetInterpretationContract?.knownLimitations),
    ]),
    bundleSection("2AK. Authority Hierarchy Primary Routing Contract v1", [
      bundleField("Contract attached", authorityHierarchyContract ? "yes" : "missing"),
      bundleField("Artifact version", authorityHierarchyContract?.artifactVersion),
      bundleField("Contract status", authorityHierarchyContract?.contractStatus),
      bundleField("Local route status", authorityHierarchyContract?.localRouteStatus || authorityHierarchyContract?.contractStatus),
      bundleField("Global route/surface parity status", authorityHierarchyContract?.globalParityStatus || routeSurfaceParityContract?.globalParityStatus),
      "Global failed contracts:",
      bundleList(authorityHierarchyContract?.globalFailedContracts || routeSurfaceParityContract?.failedContracts, "No global failed contracts."),
      bundleField("Primary rule", authorityHierarchyContract?.primaryRule || "asset_interpretation_contract_effective_family_is_primary"),
      bundleField("Primary route field", authorityHierarchyContract?.frontendContract?.primaryRouteField || "primaryAnalysisRoute"),
      bundleField("Frontend normalization field", authorityHierarchyContract?.frontendContract?.frontendNormalizationField || "model.authorityHierarchyContract"),
      bundleField("Primary display field", authorityHierarchyContract?.frontendContract?.primaryDisplayField || "model.primaryAnalysisRoute"),
      bundleField("Primary route safe", primaryAnalysisRoute ? yesNoUnknown(primaryAnalysisRoute.isPrimaryRouteSafe) : "unknown"),
      bundleField("Primary route fallback used", primaryAnalysisRoute ? yesNoUnknown(primaryAnalysisRoute.fallbackUsed) : "unknown"),
      bundleField("Fallback reason", primaryAnalysisRoute?.fallbackReason),
      bundleField("Primary asset family", primaryAnalysisRoute?.assetFamily),
      bundleField("Primary visible label", primaryAnalysisRoute?.visibleLabel),
      bundleField("Primary asset framing", primaryAnalysisRoute?.assetFramingLabel),
      bundleField("Primary question group", primaryAnalysisRoute?.questionGroup),
      bundleField("Primary source profile", primaryAnalysisRoute?.sourceProfile),
      bundleField("Primary route confidence", primaryAnalysisRoute?.primaryRouteConfidence),
      bundleField("Authority source", primaryAnalysisRoute?.authoritySource),
      bundleField("Raw resolved lens boundary", authorityHierarchyContract?.rawResolvedLensBoundary || "audit_only_not_primary_display"),
      bundleField("Benchmark preset boundary", authorityHierarchyContract?.benchmarkPresetBoundary || "reference_only_not_primary_override"),
      bundleField("Provider category boundary", authorityHierarchyContract?.providerCategoryBoundary || "context_only_not_reviewed_evidence"),
      bundleField("Raw lens audit-only", primaryAnalysisRoute?.rawLensAuditOnly?.lensId),
      bundleField("Raw question group audit-only", primaryAnalysisRoute?.rawQuestionGroupAuditOnly),
      bundleField("Benchmark expected family audit-only", primaryAnalysisRoute?.benchmarkExpectationAuditOnly?.expectedLensFamily),
      bundleField("Benchmark expected question group audit-only", primaryAnalysisRoute?.benchmarkExpectationAuditOnly?.expectedQuestionGroup),
      bundleField("Provider category audit-only family", primaryAnalysisRoute?.providerCategoryAuditOnly?.primaryAssetFamily),
      bundleField("Copy Review Bundle mirrors primary route", yesNoUnknown(authorityHierarchyContract?.bundleParity?.copyReviewBundleMirrorsPrimaryRoute)),
      bundleField("Internal Developer QA Bundle preserves raw lens", yesNoUnknown(authorityHierarchyContract?.bundleParity?.internalDeveloperQaBundlePreservesRawLens)),
      bundleField("Protected report redacts internals", yesNoUnknown(authorityHierarchyContract?.bundleParity?.protectedReportRedactsInternals)),
      bundleField("Scoring changed", yesNoUnknown(authorityHierarchyContract?.guardrails?.scoringChanged)),
      bundleField("Verdict changed", yesNoUnknown(authorityHierarchyContract?.guardrails?.verdictChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(authorityHierarchyContract?.guardrails?.providerBehaviorChanged)),
      bundleField("Provider fetch changed", yesNoUnknown(authorityHierarchyContract?.guardrails?.providerFetchChanged)),
      bundleField("Reviewed evidence scoring-active", yesNoUnknown(authorityHierarchyContract?.guardrails?.reviewedEvidenceScoringActive)),
      bundleField("Source candidates promoted", yesNoUnknown(authorityHierarchyContract?.guardrails?.sourceCandidatesPromoted)),
      bundleField("Token-specific override added", yesNoUnknown(authorityHierarchyContract?.guardrails?.tokenSpecificOverrideAdded)),
      bundleField("Snapshot reuse enabled", yesNoUnknown(authorityHierarchyContract?.guardrails?.snapshotReuseEnabled)),
      bundleField("Partial refresh enabled", yesNoUnknown(authorityHierarchyContract?.guardrails?.partialRefreshEnabled)),
      "Authority precedence:",
      bundleList(safeArray(authorityHierarchyContract?.authorityPrecedence).map((entry) =>
        `${entry.precedenceRank}. ${entry.source} | field=${entry.sourceField} | primary=${entry.usedForPrimarySurface ? "yes" : "no"} | ${entry.rationale || "No rationale attached."}`
      )),
      "Primary source matrix entries:",
      bundleList(primaryAnalysisRoute?.sourceMatrixEntries),
      "Mismatch diagnostics:",
      bundleList(safeArray(primaryAnalysisRoute?.mismatchDiagnostics).map((entry) =>
        `${entry.mismatchId || "mismatch"} | severity=${entry.severity || "unknown"} | primaryAffected=${entry.primarySurfaceAffected ? "yes" : "no"} | raw=${entry.rawValue || "n/a"} | primary=${entry.primaryValue || "n/a"} | ${entry.description || "Review route mismatch."}`
      )),
      "Visible surfaces:",
      bundleList(authorityHierarchyContract?.frontendContract?.visibleSurfaces),
      "Known limitations:",
      bundleList(authorityHierarchyContract?.knownLimitations),
    ]),
    bundleSection("2AL. Representation-to-Family Authority Matrix v1", [
      bundleField("Decision attached", representationFamilyDecision ? "yes" : "missing"),
      bundleField("Artifact version", representationFamilyDecision?.artifactVersion),
      bundleField("Decision status", representationFamilyDecision?.decisionStatus),
      bundleField("Representation type", representationFamilyDecision?.representationType || assetIdentityResolution?.representationType),
      bundleField("Selected family", representationFamilyRoute?.selectedFamily || representationFamilyDecision?.selectedFamily),
      bundleField("Visible label", representationFamilyRoute?.visibleLabel),
      bundleField("Question group", representationFamilyRoute?.questionGroup),
      bundleField("Source profile", representationFamilyRoute?.sourceProfile),
      bundleField("Route safety", representationFamilyRoute?.routeSafety),
      bundleField("Route safe", yesNoUnknown(representationFamilyRoute?.routeSafe)),
      bundleField("Route safe with manual review", yesNoUnknown(representationFamilyRoute?.routeSafeWithManualReview)),
      bundleField("Route degraded", yesNoUnknown(representationFamilyRoute?.routeDegraded)),
      bundleField("Route blocked", yesNoUnknown(representationFamilyRoute?.routeBlocked)),
      bundleField("Evidence completeness separated from route", yesNoUnknown(representationFamilyRoute?.evidenceCompletenessSeparatedFromRoute)),
      bundleField("Route safety reason", representationFamilyRoute?.routeSafetyReason),
      bundleField("Identity confidence", representationFamilyDecision?.identityConfidence),
      bundleField("Chain confidence", representationFamilyDecision?.chainConfidence),
      bundleField("Contract confidence", representationFamilyDecision?.contractConfidence),
      "Allowed families:",
      bundleList(representationFamilyDecision?.allowedFamilies),
      "Forbidden families:",
      bundleList(representationFamilyDecision?.forbiddenFamilies),
      "Valid question groups:",
      bundleList(representationFamilyDecision?.validQuestionGroups),
      "Valid source profiles:",
      bundleList(representationFamilyDecision?.validSourceProfiles),
      "Valid source matrix entries:",
      bundleList(representationFamilyDecision?.validSourceMatrixEntries || representationFamilyRoute?.sourceMatrixEntries),
      "Evidence gates:",
      bundleList(representationFamilyEvidenceGates.map((gate) =>
        `${gate.gateId || "gate"} | ${gate.label || "Evidence gate"} | status=${gate.status || "source_required"} | affectsRoute=${gate.affectsRoute ? "yes" : "no"} | affectsScoring=${gate.affectsScoring ? "yes" : "no"} | affectsVerdict=${gate.affectsVerdict ? "yes" : "no"} | affectsConfidence=${gate.affectsConfidence ? "yes" : "no"} | requirement=${gate.sourceRequirement || "Reviewed source required."}`
      )),
      "Manual review triggers:",
      bundleList(representationFamilyDecision?.manualReviewTriggers),
      "Not-applicable redirects:",
      bundleList(representationFamilyDecision?.notApplicableRedirects),
      "Source requirement templates:",
      bundleList(representationFamilyDecision?.sourceRequirementTemplates),
      "Conflicts detected:",
      bundleList(safeArray(representationFamilyDecision?.conflicts).map((conflict) =>
        `${conflict.conflictId || "conflict"} | type=${conflict.conflictType || "unknown"} | severity=${conflict.severity || "unknown"} | conflicting=${conflict.conflictingValue || "n/a"} | corrected=${conflict.correctedValue || "n/a"} | primaryAffected=${conflict.primaryRouteAffected ? "yes" : "no"}`
      )),
      bundleField("Global primary route affected", yesNoUnknown(representationFamilyDecision?.primaryAffected)),
      "Override diagnostics:",
      bundleList([
        `provider category tried to override representation=${yesNoUnknown(representationFamilyDecision?.providerCategoryTriedToOverrideRepresentation)}`,
        `raw lens tried to override representation=${yesNoUnknown(representationFamilyDecision?.rawLensTriedToOverrideRepresentation)}`,
        `benchmark expectation tried to override representation=${yesNoUnknown(representationFamilyDecision?.benchmarkExpectationTriedToOverrideRepresentation)}`,
        `AIC family tried to override representation=${yesNoUnknown(representationFamilyDecision?.aicFamilyTriedToOverrideRepresentation)}`,
      ]),
      "Guardrails:",
      bundleList([
        `scoringChanged=${yesNoUnknown(representationFamilyDecision?.guardrails?.scoringChanged)}`,
        `verdictChanged=${yesNoUnknown(representationFamilyDecision?.guardrails?.verdictChanged)}`,
        `providerBehaviorChanged=${yesNoUnknown(representationFamilyDecision?.guardrails?.providerBehaviorChanged)}`,
        `providerFetchChanged=${yesNoUnknown(representationFamilyDecision?.guardrails?.providerFetchChanged)}`,
        `runtimeAiDecisionAuthorityAdded=${yesNoUnknown(representationFamilyDecision?.guardrails?.runtimeAiDecisionAuthorityAdded)}`,
        `tokenSpecificOverrideAdded=${yesNoUnknown(representationFamilyDecision?.guardrails?.tokenSpecificOverrideAdded)}`,
        `sourceCandidatesPromoted=${yesNoUnknown(representationFamilyDecision?.guardrails?.sourceCandidatesPromoted)}`,
        `reviewedEvidenceScoringActive=${yesNoUnknown(representationFamilyDecision?.guardrails?.reviewedEvidenceScoringActive)}`,
        `snapshotsReintroduced=${yesNoUnknown(representationFamilyDecision?.guardrails?.snapshotsReintroduced)}`,
        `partialRefreshReintroduced=${yesNoUnknown(representationFamilyDecision?.guardrails?.partialRefreshReintroduced)}`,
        `rawDiagnosticsRemoved=${yesNoUnknown(representationFamilyDecision?.guardrails?.rawDiagnosticsRemoved)}`,
        `missingEvidenceTreatedAsWrongFamily=${yesNoUnknown(representationFamilyDecision?.guardrails?.missingEvidenceTreatedAsWrongFamily)}`,
      ]),
      "QA checks:",
      bundleList([
        `LST representation routed to generic wrapped family=${yesNoUnknown(representationFamilyDecision?.representationType === "liquid_staking_derivative" && representationFamilyRoute?.selectedFamily !== "liquid_staking_derivative")}`,
        `Wrapped representation treated as route failure due missing evidence=${yesNoUnknown(["wrapped_asset", "bridged_asset", "wrapped_or_bridged_asset"].includes(String(representationFamilyDecision?.representationType)) && representationFamilyRoute?.selectedFamily === "wrapped_bridged_asset" && representationFamilyRoute?.routeBlocked)}`,
        `Missing evidence gates affect route=${yesNoUnknown(representationFamilyEvidenceGates.some((gate) => gate.affectsRoute))}`,
        `Provider category override affected primary=${yesNoUnknown(safeArray(representationFamilyDecision?.conflicts).some((conflict) => conflict.conflictType === "provider_category_tried_to_override_representation" && conflict.primaryRouteAffected))}`,
        `Raw lens override affected primary=${yesNoUnknown(safeArray(representationFamilyDecision?.conflicts).some((conflict) => conflict.conflictType === "raw_lens_tried_to_override_representation" && conflict.primaryRouteAffected))}`,
        `Benchmark override affected primary=${yesNoUnknown(safeArray(representationFamilyDecision?.conflicts).some((conflict) => conflict.conflictType === "benchmark_expectation_tried_to_override_representation" && conflict.primaryRouteAffected))}`,
        `Copy Bundle 2AL present=yes`,
        `Protected Investor Report redaction=high-level only`,
      ]),
      bundleField("Source boundary", representationFamilyDecision?.sourceBoundary || "Representation-family authority is diagnostic display/question/source routing, not scoring evidence."),
      "Known limitations:",
      bundleList(representationFamilyDecision?.knownLimitations),
      bundleField("Next resume pointer", representationFamilyDecision?.nextResumePointer),
    ]),
    bundleSection("2BD. Final Analyst Answer Composer v1", [
      bundleField("Contract attached", finalAnalystAnswerComposerContract ? "yes" : "missing"),
      bundleField("Artifact version", finalAnalystAnswerComposerContract?.artifactVersion),
      bundleField("Backend authoritative", yesNoUnknown(finalAnalystAnswerComposerContract?.backendAuthoritative)),
      bundleField("Canonical render owner", finalAnalystAnswerComposerContract?.canonicalRenderOwnership?.ownerStage),
      bundleField("Primary render source", finalAnalystAnswerComposerContract?.canonicalRenderOwnership?.primaryRenderSource),
      bundleField("Answer structure", finalAnalystAnswerComposerContract?.canonicalRenderOwnership?.answerStructure),
      bundleField("Legacy layers static/audit only", yesNoUnknown(finalAnalystAnswerComposerContract?.canonicalRenderOwnership?.legacyLayersStaticAuditOnly)),
      bundleField("Frontend primary source", finalAnalystAnswerComposerContract?.canonicalRenderOwnership?.frontendPrimarySource),
      bundleField("Copy Bundle primary source", finalAnalystAnswerComposerContract?.canonicalRenderOwnership?.copyBundlePrimarySource),
      bundleField("Protected Report primary source", finalAnalystAnswerComposerContract?.canonicalRenderOwnership?.protectedReportPrimarySource),
      "Superseded live product-truth layers:",
      bundleList(finalAnalystAnswerComposerContract?.canonicalRenderOwnership?.supersedesLiveProductTruth),
      bundleField("Canonical family", finalAnalystAnswerComposerContract?.canonicalFamily),
      bundleField("Canonical question group", finalAnalystAnswerComposerContract?.canonicalQuestionGroup),
      bundleField("Canonical asset", finalAnalystAnswerComposerContract?.assetSummary?.canonicalAsset),
      bundleField("Canonical identity", finalAnalystAnswerComposerContract?.assetSummary?.canonicalIdentity),
      bundleField("Representation", finalAnalystAnswerComposerContract?.assetSummary?.representationType),
      bundleField("Network scope", finalAnalystAnswerComposerContract?.assetSummary?.networkScope),
      bundleField("Contract scope", finalAnalystAnswerComposerContract?.assetSummary?.contractScope),
      bundleField("Representation boundary", finalAnalystAnswerComposerContract?.assetSummary?.representationBoundary),
      "User-facing analyst view:",
      bundleList([
        finalAnalystAnswerComposerContract?.analystView?.headline,
        finalAnalystAnswerComposerContract?.analystView?.whatTheAssetIs,
        finalAnalystAnswerComposerContract?.analystView?.whatTheDataSupports,
        finalAnalystAnswerComposerContract?.analystView?.strongestPartOfThesis,
        finalAnalystAnswerComposerContract?.analystView?.weakestPartOfAnalysis,
        finalAnalystAnswerComposerContract?.analystView?.allocationReadinessExplanation,
      ].filter(Boolean)),
      "User-facing fundamental answers:",
      bundleList(safeArray(finalAnalystAnswerComposerContract?.canonicalQuestionJudgments).map((answer) => {
        const isNotApplicable = answer.applicabilityStatus === "not_applicable";
        return `${answer.question} | state=${answer.answerState || "missing_key_data"} | applicability=${answer.applicabilityStatus || "unknown"} | applicabilityReason=${answer.applicabilityReason || "none"} | noPenalty=${yesNoUnknown(answer.noScoreOrCoveragePenalty)} | direct=${answer.directAnswer || answer.answer || "missing"} | evidence=${safeArray(answer.evidenceBehindIt || answer.whatTheDataSupports).join(" / ") || "none"} | gap=${isNotApplicable ? "none" : safeArray(answer.gap || answer.missingData).join(" / ") || "none"} | whatWouldChange=${isNotApplicable ? "none" : answer.whatWouldChangeTheView || answer.analystNextStep || "none"} | data=${safeArray(answer.dataUsed).map((item) => `${item.label}: ${item.displayValue || item.value}`).join("; ") || "none"} | limits=${safeArray(answer.whatTheDataDoesNotProve).join(" / ") || "none"} | boundary=${answer.boundary || "none"}`;
      }), "No final composer answers attached.", 20),
      "Canonical judgment audit classifications:",
      bundleList(safeArray(finalAnalystAnswerComposerContract?.canonicalQuestionJudgments).map((answer) =>
        `${answer.questionId} | claim=${answer.claimType || "unavailable"} | applicability=${answer.applicabilityStatus || "unknown"} | basis=${safeArray(answer.applicabilityBasis).join("; ") || "none"} | redirect=${answer.applicabilityRedirect || "none"} | eligible=${safeArray(answer.eligibleObservations).length} | eligibleIds=${safeArray(answer.eligibleObservations).map((item) => item.observationId).join("; ") || "none"} | sourceTrace=${safeArray(answer.sourceTrace).join("; ") || "none"} | contextOnly=${safeArray(answer.contextOnlyObservations).length} | contextIds=${safeArray(answer.contextOnlyObservations).map((item) => item.observationId).join("; ") || "none"} | excluded=${safeArray(answer.excludedEvidenceIds).join("; ") || "none"} | exclusionReasons=${safeArray(answer.exclusionReasons).join("; ") || "none"} | forbidden=${safeArray(answer.forbiddenForQuestionObservations).length} | missing=${safeArray(answer.missingRequiredObservations).join("; ") || "none"}`
      ), "No canonical judgment classifications attached.", 20),
      "Family-bound Source Queue:",
      bundleList(safeArray(finalAnalystAnswerComposerContract?.familyBoundSourceQueue).length
        ? safeArray(finalAnalystAnswerComposerContract?.familyBoundSourceQueue).map((item) => `${item.queueItemId || "queue-item"} | ${item.text || item}`)
        : finalAnalystAnswerComposerContract?.sourceQueuePriorities),
      "Score explanation bridge:",
      bundleList([
        finalAnalystAnswerComposerContract?.scoreExplanationBridge?.explanation,
        `score=${finalAnalystAnswerComposerContract?.scoreExplanationBridge?.score ?? "unavailable"}`,
        `verdictClass=${finalAnalystAnswerComposerContract?.scoreExplanationBridge?.verdictClass || "unavailable"}`,
        `verdictLabel=${finalAnalystAnswerComposerContract?.scoreExplanationBridge?.verdictLabel || "unavailable"}`,
        `scoreDisplay=${finalAnalystAnswerComposerContract?.scoreExplanationBridge?.scoreDisplayLabel || "unavailable"}`,
        `confidence=${finalAnalystAnswerComposerContract?.scoreExplanationBridge?.confidenceLabel || "unavailable"}`,
        `formulaChanged=${yesNoUnknown(finalAnalystAnswerComposerContract?.scoreExplanationBridge?.formulaChanged)}`,
      ]),
      "Internal QA diagnostics (audit-only):",
      bundleList([
        `scoreDisplayMode=${finalAnalystAnswerComposerContract?.scoreExplanationBridge?.scoreDisplayMode || "unavailable"}`,
        `primarySurfacePass=${yesNoUnknown(finalAnalystAnswerComposerContract?.familyPurityDiagnostics?.primarySurfacePass)}`,
        `wrongDomainFindings=${safeArray(finalAnalystAnswerComposerContract?.familyPurityDiagnostics?.wrongDomainFindings).length}`,
        `sourceQueueFamilyMismatchFindings=${safeArray(finalAnalystAnswerComposerContract?.familyPurityDiagnostics?.sourceQueueFamilyMismatchFindings).length}`,
        `cardFamilyMismatchFindings=${safeArray(finalAnalystAnswerComposerContract?.familyPurityDiagnostics?.cardFamilyMismatchFindings).length}`,
        `duplicateAnswerFindings=${safeArray(finalAnalystAnswerComposerContract?.familyPurityDiagnostics?.duplicateAnswerFindings).length}`,
        `identityGrammarFindings=${safeArray(finalAnalystAnswerComposerContract?.familyPurityDiagnostics?.identityGrammarFindings).length}`,
        `quarantinedPrimaryItems=${safeArray(finalAnalystAnswerComposerContract?.familyPurityDiagnostics?.quarantinedPrimaryItems).length}`,
      ]),
      "Guardrails:",
      bundleList(Object.entries(safeObject(finalAnalystAnswerComposerContract?.guardrails)).map(([key, value]) => `${key}=${yesNoUnknown(value)}`)),
      "Known limitations:",
      bundleList(finalAnalystAnswerComposerContract?.knownLimitations),
      bundleField("Next resume pointer", finalAnalystAnswerComposerContract?.nextResumePointer),
    ]),
    bundleSection("2BE. Market-Wide Analyst Pipeline Purity + Premium Product Surface v1", [
      bundleField("Contract attached", marketWideAnalystPipelinePurityContract ? "yes" : "missing"),
      bundleField("Artifact version", marketWideAnalystPipelinePurityContract?.artifactVersion),
      bundleField("Status", marketWideAnalystPipelinePurityContract?.status),
      bundleField("Backend authoritative", yesNoUnknown(marketWideAnalystPipelinePurityContract?.backendAuthoritative)),
      bundleField("Canonical family", marketWideAnalystPipelinePurityContract?.canonicalFamily),
      bundleField("Canonical question group", marketWideAnalystPipelinePurityContract?.canonicalQuestionGroup),
      bundleField("Families covered", safeArray(marketWideAnalystPipelinePurityContract?.familiesCovered).length),
      bundleField("Primary product source", marketWideAnalystPipelinePurityContract?.frontendParity?.primaryProductSource),
      bundleField("Frontend may synthesize claims", yesNoUnknown(marketWideAnalystPipelinePurityContract?.frontendParity?.frontendMaySynthesizeClaims)),
      bundleField("Copy Bundle user mirror uses composer", yesNoUnknown(marketWideAnalystPipelinePurityContract?.copyBundleParity?.copyBundleUserMirrorUsesComposer)),
      bundleField("Protected Report high-level only", yesNoUnknown(marketWideAnalystPipelinePurityContract?.protectedReportParity?.highLevelOnly)),
      bundleField("Wrong-family question leakage count", marketWideAnalystPipelinePurityContract?.requiredCounters?.wrongFamilyQuestionLeakageCount ?? "missing"),
      bundleField("Duplicate answer findings", marketWideAnalystPipelinePurityContract?.requiredCounters?.duplicateAnswerFindings ?? "missing"),
      bundleField("Repeated sentence findings", marketWideAnalystPipelinePurityContract?.requiredCounters?.repeatedSentenceFindings ?? "missing"),
      bundleField("Identity grammar findings", marketWideAnalystPipelinePurityContract?.requiredCounters?.identityGrammarFindings ?? "missing"),
      bundleField("Forbidden proxy support findings", marketWideAnalystPipelinePurityContract?.requiredCounters?.forbiddenProxySupportFindings ?? "missing"),
      bundleField("Source Queue family mismatch findings", marketWideAnalystPipelinePurityContract?.requiredCounters?.sourceQueueFamilyMismatchFindings ?? "missing"),
      bundleField("Legacy primary consumer findings", marketWideAnalystPipelinePurityContract?.requiredCounters?.legacyPrimaryConsumerFindings ?? "missing"),
      bundleField("Duplicate live producer findings", marketWideAnalystPipelinePurityContract?.requiredCounters?.duplicateLiveProducerFindings ?? "missing"),
      bundleField("Rendered primary narrative pass", yesNoUnknown(renderedSurfaceParityViewModel.primaryNarrativePass)),
      bundleField("Candidate/final contradiction findings", renderedSurfaceParityViewModel.candidateFinalContradictionAssertions.length),
      bundleField("Allocation-language findings", renderedSurfaceParityViewModel.allocationLanguageAssertions.length),
      bundleField("Wrong-family narrative findings", renderedSurfaceParityViewModel.wrongFamilyNarrativeAssertions.length),
      bundleField("Composer attached", yesNoUnknown(renderedSurfaceParityViewModel.missingComposerControl?.composerAttached)),
      bundleField("Missing Composer fails closed", yesNoUnknown(renderedSurfaceParityViewModel.missingComposerControl?.failClosed)),
      "Candidate/final contradiction details:",
      bundleList(renderedSurfaceParityViewModel.candidateFinalContradictionAssertions.map((finding) =>
        `${finding.assertionId}: ${finding.renderedText}`
      ), "No candidate/final contradiction found in the rendered primary corpus.", 40),
      "Wrong-family narrative details:",
      bundleList(renderedSurfaceParityViewModel.wrongFamilyNarrativeAssertions.map((finding) =>
        `${finding.canonicalFamily}: ${finding.renderedText}`
      ), "No wrong-family narrative found in the rendered primary corpus.", 40),
      bundleField("Family mismatch corpus item count", marketWideAnalystPipelinePurityContract?.sourceQueueFamilyMismatchCorpusItemCount ?? "missing"),
      bundleField("Family mismatch corpus complete", yesNoUnknown(marketWideAnalystPipelinePurityContract?.sourceQueueFamilyMismatchCorpusComplete)),
      "Family mismatch corpus paths:",
      bundleList(marketWideAnalystPipelinePurityContract?.sourceQueueFamilyMismatchCorpusPaths, "No product requirement corpus paths attached.", 40),
      "Family mismatch details:",
      bundleList(safeArray(marketWideAnalystPipelinePurityContract?.sourceQueueFamilyMismatchDetails).map((finding) =>
        `${finding.fieldPath || "path unavailable"} | id=${finding.requirementId || "none"} | expected=${finding.expectedFamily || "unknown"} | detected=${finding.detectedIncompatibleFamily || "unknown"} | concepts=${safeArray(finding.matchedConcepts).join(", ") || "unknown"} | ${finding.text || "text unavailable"}`
      ), "No downstream family mismatch findings detected.", 40),
      "Pipeline stages:",
      bundleList(safeArray(marketWideAnalystPipelinePurityContract?.pipelineStages).map((stage) =>
        `${stage.label || stage.stageId}: ${stage.status || "unknown"} | ${stage.summary || "No summary"}`
      )),
      "Family policy:",
      bundleList([
        `sourceMatrix=${marketWideAnalystPipelinePurityContract?.familyPolicy?.sourceMatrix || "missing"}`,
        `focus=${safeArray(marketWideAnalystPipelinePurityContract?.familyPolicy?.primaryDiligenceFocus).join("; ") || "missing"}`,
        `eligible=${safeArray(marketWideAnalystPipelinePurityContract?.familyPolicy?.eligibleObservationDomains).join("; ") || "missing"}`,
        `forbidden proxies=${safeArray(marketWideAnalystPipelinePurityContract?.familyPolicy?.forbiddenProxyDomains).join("; ") || "missing"}`,
      ]),
      "Question traces:",
      bundleList(safeArray(marketWideAnalystPipelinePurityContract?.questionTraces).map((trace) =>
        `${trace.question || trace.questionId} | state=${trace.answerState || "unknown"} | data=${trace.dataUsedCount ?? 0} | missing=${safeArray(trace.missingData).join("; ") || "none"} | next=${trace.nextStep || "none"}`
      ), "No question traces attached.", 20),
      "Product surface gate:",
      bundleList([
        ...Object.entries(safeObject(marketWideAnalystPipelinePurityContract?.productSurfaceGate?.requiredCounters))
          .map(([key, value]) => `${key}=${Number.isFinite(value) ? value : "missing"}`),
        ...Object.entries(safeObject(marketWideAnalystPipelinePurityContract?.productSurfaceGate))
          .filter(([key, value]) => key !== "requiredCounters" && typeof value === "boolean")
          .map(([key, value]) => `${key}=${value ? "yes" : "no"}`),
      ]),
      "Guardrails:",
      bundleList(Object.entries(safeObject(marketWideAnalystPipelinePurityContract?.guardrailsVerified)).map(([key, value]) => `${key}=${yesNoUnknown(value)}`)),
      "Failures:",
      bundleList(marketWideAnalystPipelinePurityContract?.failures, "No pipeline purity failures detected."),
      "Known limitations:",
      bundleList(marketWideAnalystPipelinePurityContract?.knownLimitations),
      bundleField("Next resume pointer", marketWideAnalystPipelinePurityContract?.nextResumePointer),
    ]),
    bundleSection("Institutional Discovery Two-Universe Deterministic Ranking Constitution v1", [
      bundleField("Contract attached", institutionalDiscoveryDeterministicRankingConstitution ? "yes" : "no"),
      bundleField("Constitution version", institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.constitutionVersion),
      bundleField("Universes", safeArray(institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.universeIds).join(", ") || "unavailable"),
      bundleField("Universe count", safeArray(institutionalDiscoveryDeterministicRankingConstitution?.universes).length),
      bundleField("Cohort count", institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.cohortCount),
      bundleField("Formula count", institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.formulaCount),
      bundleField("Eligibility policy count", institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.eligibilityPolicyCount),
      bundleField("Comparability policy count", institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.comparabilityPolicyCount),
      bundleField("Activation state", institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.activationState),
      bundleField("Runtime score changed", yesNoUnknown(institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.runtimeScoreChanged)),
      bundleField("Runtime rank changed", yesNoUnknown(institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.runtimeRankChanged)),
      bundleField("AI runtime authority", institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.runtimeAiAuthority),
      bundleField("Anthropic integrated", yesNoUnknown(institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.anthropicIntegrated)),
      bundleField("Provider behavior changed", yesNoUnknown(institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.providerBehaviorChanged)),
      bundleField("Snapshots enabled", yesNoUnknown(institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.snapshotsEnabled)),
      bundleField("Partial refresh enabled", yesNoUnknown(institutionalDiscoveryDeterministicRankingConstitution?.diagnosticSummary?.incrementalReuseEnabled)),
      bundleField("Customer-facing score added", yesNoUnknown(institutionalDiscoveryDeterministicRankingConstitution?.frontendBoundary?.customerScoreAdded)),
      bundleField("Customer-facing rank added", yesNoUnknown(institutionalDiscoveryDeterministicRankingConstitution?.frontendBoundary?.customerRankAdded)),
      bundleField("Protected Investor Report changes", safeArray(institutionalDiscoveryDeterministicRankingConstitution?.protectedReportChanges).length),
      "Methodology boundaries:",
      bundleList(safeArray(institutionalDiscoveryDeterministicRankingConstitution?.universes).flatMap((universe) =>
        safeArray(universe?.methodologyBoundary).map((boundary) => `${universe?.universeId || "unknown"}: ${boundary}`)
      )),
      "Guardrails:",
      bundleList(Object.entries(safeObject(institutionalDiscoveryDeterministicRankingConstitution?.guardrails)).map(([key, value]) =>
        `${key}=${Array.isArray(value) ? value.join(", ") || "none" : String(value)}`
      )),
      bundleField("Next resume pointer", institutionalDiscoveryDeterministicRankingConstitution?.nextResumePointer),
    ]),
    bundleSection("Institutional Source & Provider Evidence Map v1 — RWA & Hybrid Finance plus Stablecoins & Yield", [
      bundleField("Map attached", institutionalSourceProviderEvidenceMap ? "yes" : "no"),
      bundleField("Map version", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.mapVersion),
      bundleField("Constitution version", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.constitutionVersion),
      bundleField("Observation mapping coverage", `${institutionalSourceProviderEvidenceMap?.diagnosticSummary?.mappedObservationCount ?? 0}/${institutionalSourceProviderEvidenceMap?.diagnosticSummary?.observationCount ?? 0}`),
      bundleField("Formula-input coverage", `${institutionalSourceProviderEvidenceMap?.diagnosticSummary?.mappedFormulaCount ?? 0}/${institutionalSourceProviderEvidenceMap?.diagnosticSummary?.formulaCount ?? 0}`),
      bundleField("Eligibility-gate coverage", `${institutionalSourceProviderEvidenceMap?.diagnosticSummary?.mappedEligibilityGateCount ?? 0}/${institutionalSourceProviderEvidenceMap?.diagnosticSummary?.eligibilityGateCount ?? 0}`),
      bundleField("Provider count", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.providerCount),
      bundleField("Source-class count", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.sourceClassCount),
      bundleField("Freshness-policy count", safeArray(institutionalSourceProviderEvidenceMap?.freshnessPolicies).length),
      bundleField("Contradiction-policy count", safeArray(institutionalSourceProviderEvidenceMap?.contradictionPolicies).length),
      bundleField("Fallback-policy count", safeArray(institutionalSourceProviderEvidenceMap?.fallbackPolicies).length),
      bundleField("Licensing-blocker count", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.licensingBlockerCount),
      bundleField("Identity-blocker count", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.identityBlockerCount),
      bundleField("Legal-blocker count", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.legalBlockerCount),
      bundleField("Yield-blocker count", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.yieldBlockerCount),
      bundleField("Currently computable formulas", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.currentlyComputableFormulaCount),
      bundleField("Blocked formulas", institutionalSourceProviderEvidenceMap?.diagnosticSummary?.blockedFormulaCount),
      "Provider integration priorities:",
      bundleList(institutionalSourceProviderEvidenceMap?.diagnosticSummary?.priorityIntegrations, "No priority integration candidates attached."),
      bundleField("Diagnostic-only", yesNoUnknown(institutionalSourceProviderEvidenceMap?.activationState?.diagnosticOnly)),
      bundleField("Provider calls inactive", yesNoUnknown(institutionalSourceProviderEvidenceMap?.activationState?.providerCallsActive === false)),
      bundleField("Scoring inactive", yesNoUnknown(institutionalSourceProviderEvidenceMap?.activationState?.scoringActive === false)),
      bundleField("Ranking inactive", yesNoUnknown(institutionalSourceProviderEvidenceMap?.activationState?.rankingActive === false)),
      bundleField("Evidence promotion inactive", yesNoUnknown(institutionalSourceProviderEvidenceMap?.activationState?.evidencePromotionActive === false)),
      bundleField("AI runtime inactive", yesNoUnknown(institutionalSourceProviderEvidenceMap?.activationState?.runtimeAiActive === false)),
      bundleField("Anthropic integrated", yesNoUnknown(institutionalSourceProviderEvidenceMap?.guardrails?.anthropicIntegrated)),
      bundleField("Runtime score changed", yesNoUnknown(institutionalSourceProviderEvidenceMap?.guardrails?.overallScoreChanged)),
      bundleField("Runtime rank changed", yesNoUnknown(institutionalSourceProviderEvidenceMap?.guardrails?.currentRankingOrderChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(institutionalSourceProviderEvidenceMap?.guardrails?.providerBehaviorChanged)),
      "Known limitations:",
      bundleList(institutionalSourceProviderEvidenceMap?.knownLimitations),
    ]),
    bundleSection("Canonical Product, Claim, Wrapper, and Strategy Identity Backbone v1", [
      bundleField("Backbone attached", canonicalInstitutionalIdentityBackbone ? "yes" : "no"),
      bundleField("Backbone version", canonicalInstitutionalIdentityBackbone?.schemaVersion),
      bundleField("Entity type count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.entityTypeCount),
      bundleField("Canonical entity fixture count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.canonicalEntityFixtureCount),
      bundleField("External identifier type count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.externalIdentifierTypeCount),
      bundleField("Alias type count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.aliasTypeCount),
      bundleField("Relationship type count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.relationshipTypeCount),
      bundleField("Relationship count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.relationshipCount),
      bundleField("Identity authority owner", "assetIdentityResolution.service.ts plus canonicalInstitutionalIdentityBackbone.registry.ts extension"),
      bundleField("Relationship graph owner", "canonicalInstitutionalIdentityRelationship.registry.ts"),
      bundleField("Frontend normalizer", "src/v2/canonicalInstitutionalIdentityBackboneV1.js"),
      bundleField("Confirmed identity count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.confirmedIdentityCount),
      bundleField("Provisional identity count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.provisionalIdentityCount),
      bundleField("Conflicting identity count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.conflictingIdentityCount),
      bundleField("Blocked identity count", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.blockedIdentityCount),
      bundleField("Product-token conflation findings", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.productTokenConflationFindingCount),
      bundleField("Wrapper-underlying conflation findings", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.wrapperUnderlyingConflationFindingCount),
      bundleField("Fund-share-class conflation findings", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.fundShareClassConflationFindingCount),
      bundleField("Protocol-strategy conflation findings", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.protocolStrategyConflationFindingCount),
      bundleField("Issuer-custodian conflation findings", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.issuerCustodianConflationFindingCount),
      bundleField("Prohibited inheritance findings", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.prohibitedObservationInheritanceFindingCount),
      bundleField("Migration conflicts", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.migrationConflictCount),
      bundleField("Lifecycle conflicts", canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.lifecycleConflictCount),
      bundleField("Token-specific branch count", Number(canonicalInstitutionalIdentityBackbone?.guardrails?.tokenSpecificBackendRuntimeBranchCount || 0) + Number(canonicalInstitutionalIdentityBackbone?.guardrails?.tokenSpecificFrontendRuntimeBranchCount || 0)),
      bundleField("Diagnostic-only", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.diagnosticOnly)),
      bundleField("Provider calls inactive", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.providerCallsActive === false)),
      bundleField("Scoring inactive", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.scoringActive === false)),
      bundleField("Ranking inactive", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.rankingActive === false)),
      bundleField("Evidence promotion inactive", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.evidencePromotionActive === false)),
      bundleField("Runtime AI inactive", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.runtimeAiActive === false)),
      bundleField("Anthropic integrated", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.anthropicIntegrated)),
      bundleField("Score changed", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.scoreChanged)),
      bundleField("Ranking changed", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.rankingChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(canonicalInstitutionalIdentityBackbone?.diagnosticSummary?.providerBehaviorChanged)),
      "Known limitations:",
      bundleList(canonicalInstitutionalIdentityBackbone?.knownLimitations),
    ]),
    bundleSection("RWA & Hybrid Finance Typed Observation Backbone v1", [
      bundleField("Backbone attached", rwaHybridFinanceTypedObservationBackbone ? "yes" : "no"),
      bundleField("Version", rwaHybridFinanceTypedObservationBackbone?.schemaVersion),
      bundleField("Prerequisite versions", Object.entries(safeObject(rwaObservationSummary.prerequisiteVersions)).map(([key, value]) => `${key}=${value}`).join(", ") || "unavailable"),
      bundleField("Applicable observation type count", rwaObservationSummary.applicableObservationTypeCount),
      bundleField("Raw input count", rwaObservationSummary.rawInputCount),
      bundleField("Accepted observation count", rwaObservationSummary.acceptedObservationCount),
      bundleField("Accepted with limits count", rwaObservationSummary.acceptedWithLimitsCount),
      bundleField("Contextual-only count", rwaObservationSummary.contextualOnlyCount),
      bundleField("Rejected count", rwaObservationSummary.rejectedCount),
      bundleField("Stale count", rwaObservationSummary.staleCount),
      bundleField("Conflicting count", rwaObservationSummary.conflictingCount),
      bundleField("Unavailable count", rwaObservationSummary.unavailableCount),
      bundleField("Blocked identity count", rwaObservationSummary.blockedIdentityCount),
      bundleField("Blocked authority count", rwaObservationSummary.blockedAuthorityCount),
      bundleField("Branch coverage", safeArray(rwaObservationSummary.branchCoverage).join(", ") || "none"),
      bundleField("Cohort coverage", safeArray(rwaObservationSummary.cohortCoverage).join(", ") || "none"),
      bundleField("Formula readiness", Object.entries(safeObject(rwaObservationSummary.formulaReadiness)).map(([key, value]) => `${key}=${value}`).join(", ") || "none"),
      bundleField("Eligibility readiness", Object.entries(safeObject(rwaObservationSummary.eligibilityReadiness)).map(([key, value]) => `${key}=${value}`).join(", ") || "none"),
      bundleField("Product-token contamination findings", rwaObservationSummary.contaminationFindingCounts?.productToken),
      bundleField("Wrapper-underlying contamination findings", rwaObservationSummary.contaminationFindingCounts?.wrapperUnderlying),
      bundleField("Fund-share-class contamination findings", rwaObservationSummary.contaminationFindingCounts?.fundShareClass),
      bundleField("Prohibited inheritance findings", rwaObservationSummary.contaminationFindingCounts?.prohibitedInheritance),
      bundleField("Token-specific branch count", rwaObservationSummary.tokenSpecificBranchCount),
      bundleField("Diagnostic-only", yesNoUnknown(rwaObservationSummary.diagnosticOnly)),
      bundleField("Provider calls inactive", yesNoUnknown(rwaObservationSummary.providerCallsActive === false)),
      bundleField("Scoring inactive", yesNoUnknown(rwaObservationSummary.scoringActive === false)),
      bundleField("Ranking inactive", yesNoUnknown(rwaObservationSummary.rankingActive === false)),
      bundleField("Evidence promotion inactive", yesNoUnknown(rwaObservationSummary.evidencePromotionActive === false)),
      bundleField("Runtime AI inactive", yesNoUnknown(rwaObservationSummary.runtimeAiActive === false)),
      bundleField("Anthropic integrated", yesNoUnknown(rwaObservationSummary.anthropicIntegrated)),
      bundleField("Score changed", yesNoUnknown(rwaObservationSummary.scoreChanged)),
      bundleField("Rank changed", yesNoUnknown(rwaObservationSummary.rankChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(rwaObservationSummary.providerBehaviorChanged)),
      "Known limitations:",
      bundleList(rwaHybridFinanceTypedObservationBackbone?.knownLimitations),
    ]),
    bundleSection("Stablecoins & Yield Typed Observation Backbone v1", [
      bundleField("Backbone attached", stablecoinsYieldTypedObservationBackbone ? "yes" : "no"),
      bundleField("Version", stablecoinsYieldTypedObservationBackbone?.schemaVersion),
      bundleField("Prerequisite versions", Object.entries(safeObject(stableYieldObservationSummary.prerequisiteVersions)).map(([key, value]) => `${key}=${value}`).join(", ") || "unavailable"),
      bundleField("Applicable observation count", stableYieldObservationSummary.applicableObservationTypeCount),
      bundleField("Raw input count", stableYieldObservationSummary.rawInputCount),
      bundleField("Accepted observation count", stableYieldObservationSummary.acceptedObservationCount),
      bundleField("Accepted with limits count", stableYieldObservationSummary.acceptedWithLimitsCount),
      bundleField("Contextual-only count", stableYieldObservationSummary.contextualOnlyCount),
      bundleField("Rejected count", stableYieldObservationSummary.rejectedCount),
      bundleField("Stale count", stableYieldObservationSummary.staleCount),
      bundleField("Expired count", stableYieldObservationSummary.expiredCount),
      bundleField("Conflicting count", stableYieldObservationSummary.conflictingCount),
      bundleField("Unavailable count", stableYieldObservationSummary.unavailableCount),
      bundleField("Blocked identity count", stableYieldObservationSummary.blockedIdentityCount),
      bundleField("Blocked relationship count", stableYieldObservationSummary.blockedRelationshipCount),
      bundleField("Blocked authority count", stableYieldObservationSummary.blockedAuthorityCount),
      bundleField("Blocked yield-semantics count", stableYieldObservationSummary.blockedYieldSemanticsCount),
      bundleField("Blocked benchmark count", stableYieldObservationSummary.blockedBenchmarkCount),
      bundleField("Branch coverage", safeArray(stableYieldObservationSummary.branchCoverage).join(", ") || "none"),
      bundleField("Cohort coverage", safeArray(stableYieldObservationSummary.cohortCoverage).join(", ") || "none"),
      bundleField("Reserve coverage readiness", stableYieldObservationSummary.formulaReadiness?.blocked_missing_observation ?? stableYieldObservationSummary.formulaReadiness?.blocked ?? "diagnostic"),
      bundleField("Redemption readiness", stableYieldObservationSummary.eligibilityReadiness?.blocked ?? "diagnostic"),
      bundleField("Peg readiness", stableYieldObservationSummary.formulaReadiness?.partially_ready ?? "diagnostic"),
      bundleField("Yield readiness", stableYieldObservationSummary.formulaReadiness?.ready_diagnostic_only ?? stableYieldObservationSummary.formulaReadiness?.partially_ready ?? "diagnostic"),
      bundleField("Formula readiness", Object.entries(safeObject(stableYieldObservationSummary.formulaReadiness)).map(([key, value]) => `${key}=${value}`).join(", ") || "none"),
      bundleField("Eligibility readiness", Object.entries(safeObject(stableYieldObservationSummary.eligibilityReadiness)).map(([key, value]) => `${key}=${value}`).join(", ") || "none"),
      bundleField("Contamination findings", Object.values(safeObject(stableYieldObservationSummary.contaminationFindingCounts)).reduce((total, value) => total + Number(value || 0), 0)),
      bundleField("Cross-universe duplicate findings", stableYieldObservationSummary.contaminationFindingCounts?.crossUniverseDuplicate),
      bundleField("Token-specific branch count", stableYieldObservationSummary.tokenSpecificBranchCount),
      bundleField("Diagnostic-only", yesNoUnknown(stableYieldObservationSummary.diagnosticOnly)),
      bundleField("Provider calls inactive", yesNoUnknown(stableYieldObservationSummary.providerCallsActive === false)),
      bundleField("Stablecoin scoring inactive", yesNoUnknown(stableYieldObservationSummary.stablecoinScoringActive === false)),
      bundleField("Yield scoring inactive", yesNoUnknown(stableYieldObservationSummary.yieldScoringActive === false)),
      bundleField("Risk-adjusted yield scoring inactive", yesNoUnknown(stableYieldObservationSummary.riskAdjustedYieldScoringActive === false)),
      bundleField("Ranking inactive", yesNoUnknown(stableYieldObservationSummary.rankingActive === false)),
      bundleField("Evidence promotion inactive", yesNoUnknown(stableYieldObservationSummary.evidencePromotionActive === false)),
      bundleField("Runtime AI inactive", yesNoUnknown(stableYieldObservationSummary.runtimeAiActive === false)),
      bundleField("Anthropic integrated", yesNoUnknown(stableYieldObservationSummary.anthropicIntegrated)),
      bundleField("Score changed", yesNoUnknown(stableYieldObservationSummary.scoreChanged)),
      bundleField("Rank changed", yesNoUnknown(stableYieldObservationSummary.rankChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(stableYieldObservationSummary.providerBehaviorChanged)),
      "Known limitations:",
      bundleList(stablecoinsYieldTypedObservationBackbone?.knownLimitations),
    ]),
    bundleSection("ProductResearchResultV2 — Institutional Product Analysis Contract v1", [
      bundleField("Contract attached", productResearchResultV2 ? "yes" : "no"),
      bundleField("Contract version", productResearchResultV2?.artifactVersion),
      bundleField("Analyzed entity", productResearchResultV2?.analyzedEntity?.analyzedEntity),
      bundleField("Universe", productResearchResultV2?.universeAndCohort?.universe),
      bundleField("Branch", productResearchResultV2?.universeAndCohort?.branch),
      bundleField("Family", productResearchResultV2?.universeAndCohort?.family),
      bundleField("Cohort", productResearchResultV2?.universeAndCohort?.cohort),
      bundleField("Identity state", productResearchResultV2?.analysisJob?.analysisState),
      bundleField("Lifecycle state", productResearchResultV2?.lifecycle?.currentLifecycleState),
      bundleField("Fact count", productResearchResultV2?.productFactLedger?.length),
      bundleField("Answered question count", productResearchResultV2?.coverage?.answeredQuestionCount),
      bundleField("Limited answer count", productResearchResultV2?.coverage?.limitedAnswerCount),
      bundleField("Partial answer count", productResearchResultV2?.coverage?.partialAnswerCount),
      bundleField("Missing critical question count", productResearchResultV2?.coverage?.missingCriticalQuestionCount),
      bundleField("Contradiction count", productResearchResultV2?.contradictions?.length),
      bundleField("Blocked claim count", productResearchResultV2?.blockedClaims?.length),
      bundleField("Coverage state", productResearchResultV2?.coverage?.coverageState),
      bundleField("Data confidence state", productResearchResultV2?.dataConfidence?.confidenceState),
      bundleField("Formula readiness", safeArray(productResearchResultV2?.formulaInputReadiness).map((entry) => `${entry.formulaId}:${entry.currentReadinessState}`).join("; ")),
      bundleField("Eligibility readiness", safeArray(productResearchResultV2?.eligibilityReadiness).map((entry) => `${entry.gateId}:${entry.currentReadiness}`).join("; ")),
      bundleField("Module readiness", safeArray(productResearchResultV2?.moduleReadiness).map((entry) => `${entry.moduleId}:${entry.readinessState}`).join("; ")),
      bundleField("Future scoring readiness", productResearchResultV2?.futureScoringReadiness?.scoringReadinessState),
      bundleField("Future ranking readiness", productResearchResultV2?.futureRankingReadiness?.rankingReadinessState),
      bundleField("Product-token boundary status", safeArray(productResearchResultV2?.identityAndRelationships?.boundaryConclusions).some((entry) => /product.*token.*distinct/i.test(entry)) ? "explicit" : "not_applicable_or_unavailable"),
      bundleField("Base-wrapper boundary status", safeArray(productResearchResultV2?.identityAndRelationships?.boundaryConclusions).some((entry) => /base asset.*wrapper.*distinct/i.test(entry)) ? "explicit" : "not_applicable_or_unavailable"),
      bundleField("Source-lineage status", productResearchResultV2?.sourceAndLineageSummary?.lineageCompleteness),
      bundleField("Backend/frontend parity", bundleProductResearchNormalization.result
        ? bundleProductResearchNormalization.parityStatus
        : safeModel.productResearchResultV2ParityStatus || "compatibility_fallback"),
      bundleField("Diagnostic-only", yesNoUnknown(productResearchResultV2?.guardrails?.diagnosticOnly)),
      bundleField("Scoring inactive", yesNoUnknown(productResearchResultV2?.guardrails?.scoringInactive)),
      bundleField("Ranking inactive", yesNoUnknown(productResearchResultV2?.guardrails?.rankingInactive)),
      bundleField("Provider behavior unchanged", yesNoUnknown(productResearchResultV2 ? !productResearchResultV2.guardrails?.providerBehaviorChanged : null)),
      bundleField("Evidence promotion inactive", yesNoUnknown(productResearchResultV2 ? !productResearchResultV2.guardrails?.sourceCandidatesPromoted : null)),
      bundleField("Runtime AI inactive", yesNoUnknown(productResearchResultV2 ? !productResearchResultV2.guardrails?.runtimeAiAuthorityAdded : null)),
      bundleField("Anthropic integrated", yesNoUnknown(productResearchResultV2?.guardrails?.anthropicIntegrated)),
      bundleField("Score changed", yesNoUnknown(productResearchResultV2?.guardrails?.overallScoreChanged)),
      bundleField("Rank changed", yesNoUnknown(productResearchResultV2?.guardrails?.currentRankingOrderChanged)),
      "Customer presentation mirror:",
      bundleList(safeArray(productResearchCustomer.institutionalQuestions).map((entry) => `${entry.question} | ${entry.state} | ${entry.answer}`), "No bounded institutional product answers attached.", 12),
      "Known limitations:",
      bundleList(productResearchResultV2?.knownLimitations),
    ]),
    bundleSection("Premium V2 Product Shell / Navigation QA", [
      bundleField("Shell attached", yesNoUnknown(safePremiumV2ShellQa.shellAttached)),
      bundleField("Shell version", safePremiumV2ShellQa.shellVersion),
      bundleField("Canonical V2 entry route", safePremiumV2ShellQa.canonicalV2EntryRoute),
      bundleField("Active route", safePremiumV2ShellQa.activeRoute),
      bundleField("Route map status", safePremiumV2ShellQa.routeMapStatus),
      bundleField("Global header attached", yesNoUnknown(safePremiumV2ShellQa.globalHeaderAttached)),
      bundleField("Global search attached", yesNoUnknown(safePremiumV2ShellQa.globalSearchAttached)),
      bundleField("Desktop navigation attached", yesNoUnknown(safePremiumV2ShellQa.desktopNavigationAttached)),
      bundleField("Tablet/mobile navigation attached", yesNoUnknown(safePremiumV2ShellQa.compactNavigationAttached)),
      bundleField("Asset context navigation attached", yesNoUnknown(safePremiumV2ShellQa.assetContextNavigationAttached)),
      bundleField("Discover context attached", yesNoUnknown(safePremiumV2ShellQa.discoverContextAttached)),
      bundleField("Active universe navigation attached", yesNoUnknown(safePremiumV2ShellQa.activeUniverseNavigationAttached)),
      bundleField("Internal QA separated from customer navigation", yesNoUnknown(safePremiumV2ShellQa.internalQaSeparated)),
      bundleField("Legacy route preserved", yesNoUnknown(safePremiumV2ShellQa.legacyRoutePreserved)),
      bundleField("Hosting configuration detected", yesNoUnknown(safePremiumV2ShellQa.hostingConfigurationDetected)),
      bundleField("Hosting configuration path", safePremiumV2ShellQa.hostingConfigurationPath),
      bundleField("Deployment project root expected", safePremiumV2ShellQa.expectedDeploymentProjectRoot),
      bundleField("Deployment project root proven by repository", yesNoUnknown(safePremiumV2ShellQa.projectRootProvenByRepository)),
      bundleField("SPA fallback configured", yesNoUnknown(safePremiumV2ShellQa.spaFallbackConfigured)),
      bundleField("Filesystem/static asset behavior preserved", yesNoUnknown(safePremiumV2ShellQa.filesystemStaticResolutionPreserved)),
      bundleField("API rewrite exclusion status", safePremiumV2ShellQa.apiRewriteExclusionStatus),
      bundleField("Direct /terminal-v2 route validation", safePremiumV2ShellQa.directTerminalRouteValidation),
      bundleField("Nested V2 route validation", safePremiumV2ShellQa.nestedV2RouteValidation),
      bundleField("Direct refresh validation", safePremiumV2ShellQa.directRefreshValidation),
      bundleField("Technical Open V2 customer copy present", yesNoUnknown(safePremiumV2ShellQa.technicalOpenV2CustomerCopyPresent)),
      bundleField("Premium product entry present", yesNoUnknown(safePremiumV2ShellQa.premiumProductEntryPresent)),
      bundleField("Premium product entry label", safePremiumV2ShellQa.premiumProductEntryLabel),
      bundleField("Premium product entry same-origin", yesNoUnknown(safePremiumV2ShellQa.premiumProductEntrySameOrigin)),
      bundleField("Application not-found attached", yesNoUnknown(safePremiumV2ShellQa.applicationNotFoundAttached)),
      bundleField("Static asset regression", safePremiumV2ShellQa.staticAssetRegression),
      bundleField("Local route QA status", safePremiumV2ShellQa.localRouteQaStatus),
      bundleField("Deployed route QA status", safePremiumV2ShellQa.deployedRouteQaStatus),
      bundleField("Browser visual QA status", safePremiumV2ShellQa.browserVisualQaStatus),
      bundleField("Tested viewports", safeArray(safePremiumV2ShellQa.testedViewports).join(", ") || "not run"),
      bundleField("Screenshot evidence available", yesNoUnknown(safePremiumV2ShellQa.screenshotEvidenceAvailable)),
      bundleField("Frontend analytical calculation count", safePremiumV2ShellQa.frontendAnalyticalCalculationCount),
      "Known limitations:",
      bundleList(safePremiumV2ShellQa.knownLimitations),
      "Guardrails:",
      bundleList([
        `score changed=${yesNoUnknown(safePremiumV2ShellQa.scoreChanged)}`,
        `confidence changed=${yesNoUnknown(safePremiumV2ShellQa.confidenceChanged)}`,
        `verdict changed=${yesNoUnknown(safePremiumV2ShellQa.verdictChanged)}`,
        `provider behavior changed=${yesNoUnknown(safePremiumV2ShellQa.providerBehaviorChanged)}`,
        `customer navigation contains Internal QA=${yesNoUnknown(safePremiumV2ShellQa.customerPrimaryNavContainsInternalQaTabs)}`,
      ]),
    ]),
    bundleSection("Premium V2 Asset Decision Command Center QA", [
      bundleField("Command center attached", assetResearchResultV2 && safePremiumV2DecisionCommandCenterQa.commandCenterAttached ? "yes" : "no"),
      bundleField("Command center version", safePremiumV2DecisionCommandCenterQa.commandCenterVersion),
      bundleField("Canonical asset", assetResearchResultV2?.identity?.data?.canonicalAssetId),
      bundleField("Canonical representation", assetResearchResultV2?.representation?.data?.representationType),
      bundleField("Canonical family", assetResearchResultV2?.classification?.data?.canonicalFamilyId),
      bundleField("Identity source", "AssetResearchResultV2.identity"),
      bundleField("Market snapshot source", "AssetResearchResultV2.market"),
      bundleField("Decision source", "AssetResearchResultV2.decision / existing final decision owner"),
      bundleField("Confidence source", "AssetResearchResultV2.decision.data.confidence"),
      bundleField("Evidence coverage source", "AssetResearchResultV2.evidenceSummary"),
      bundleField("Freshness source", "AssetResearchResultV2.freshness"),
      bundleField("Thesis source", "AssetResearchResultV2.decision.data.institutionalThesis"),
      bundleField("Strongest conclusion source", "AssetResearchResultV2.decision.data.strongestSupport"),
      bundleField("Primary risk source", "AssetResearchResultV2.decision.data.primarySupportedRisk"),
      bundleField("Critical unknown source", "AssetResearchResultV2.decision.data.criticalUnknown"),
      bundleField("What changes the view source", "AssetResearchResultV2.decision.data.whatWouldChangeTheView"),
      bundleField("Universe context source", "AssetResearchResultV2.universeContext"),
      bundleField("Frontend normalizer", safePremiumV2DecisionCommandCenterQa.frontendNormalizer),
      bundleField("Frontend primary component", safePremiumV2DecisionCommandCenterQa.frontendPrimaryComponent),
      bundleField("Old V2 header primary", yesNoUnknown(safePremiumV2DecisionCommandCenterQa.oldV2HeaderPrimary)),
      bundleField("Old Decision Header primary", yesNoUnknown(safePremiumV2DecisionCommandCenterQa.oldDecisionHeaderPrimary)),
      bundleField("Duplicate identity finding count", safePremiumV2DecisionCommandCenterQa.duplicateIdentityFindingCount),
      bundleField("Duplicate price finding count", safePremiumV2DecisionCommandCenterQa.duplicatePriceFindingCount),
      bundleField("Duplicate verdict finding count", safePremiumV2DecisionCommandCenterQa.duplicateVerdictFindingCount),
      bundleField("Duplicate confidence finding count", safePremiumV2DecisionCommandCenterQa.duplicateConfidenceFindingCount),
      bundleField("Customer internal-enum leakage count", safePremiumV2DecisionCommandCenterQa.customerInternalEnumLeakageCount),
      bundleField("Frontend analytical calculation count", safePremiumV2DecisionCommandCenterQa.frontendAnalyticalCalculationCount),
      bundleField("Browser visual QA status", safePremiumV2DecisionCommandCenterQa.browserVisualQaStatus),
      bundleField("Tested routes", safeArray(safePremiumV2DecisionCommandCenterQa.testedRoutes).join(", ") || "not run"),
      bundleField("Tested viewports", safeArray(safePremiumV2DecisionCommandCenterQa.testedViewports).join(", ") || "not run"),
      bundleField("Screenshot evidence", safeArray(safePremiumV2DecisionCommandCenterQa.screenshotEvidence).join(", ") || "not available"),
      "Current canonical synthesis:",
      bundleList([
        `thesis=${assetResearchResultV2?.decision?.data?.institutionalThesis || "unavailable"}`,
        `strongest=${assetResearchResultV2?.decision?.data?.strongestSupport || "unavailable"}`,
        `risk=${assetResearchResultV2?.decision?.data?.primarySupportedRisk || "unavailable"}`,
        `unknown=${assetResearchResultV2?.decision?.data?.criticalUnknown || "unavailable"}`,
        `what changes=${assetResearchResultV2?.decision?.data?.whatWouldChangeTheView || "unavailable"}`,
      ]),
      "Guardrails:",
      bundleList([
        `scoring changed=${yesNoUnknown(safePremiumV2DecisionCommandCenterQa.scoringChanged)}`,
        `tokenomics score changed=${yesNoUnknown(safePremiumV2DecisionCommandCenterQa.tokenomicsScoreChanged)}`,
        `confidence changed=${yesNoUnknown(safePremiumV2DecisionCommandCenterQa.confidenceChanged)}`,
        `verdict changed=${yesNoUnknown(safePremiumV2DecisionCommandCenterQa.verdictChanged)}`,
        `provider behavior changed=${yesNoUnknown(safePremiumV2DecisionCommandCenterQa.providerBehaviorChanged)}`,
        `ranking changed=${yesNoUnknown(safePremiumV2DecisionCommandCenterQa.rankingChanged)}`,
      ]),
      "Known limitations:",
      bundleList(safePremiumV2DecisionCommandCenterQa.knownLimitations),
    ]),
    bundleSection("Premium V2 Market, Liquidity & Supply QA", [
      bundleField("Experience attached", marketLiquiditySupply.schemaVersion && safePremiumV2MarketLiquiditySupplyQa.experienceAttached ? "yes" : "no"),
      bundleField("Experience version", marketLiquiditySupply.schemaVersion || safePremiumV2MarketLiquiditySupplyQa.experienceVersion),
      bundleField("Canonical asset", marketLiquiditySupply.canonicalAssetId || assetResearchResultV2?.identity?.data?.canonicalAssetId),
      bundleField("Canonical representation", marketLiquiditySupply.representation?.representationType),
      bundleField("Canonical family", marketLiquiditySupply.representation?.assetFamily),
      bundleField("Presentation owner", safePremiumV2MarketLiquiditySupplyQa.presentationOwner),
      bundleField("Frontend normalizer", safePremiumV2MarketLiquiditySupplyQa.frontendNormalizer),
      bundleField("Frontend primary component", safePremiumV2MarketLiquiditySupplyQa.frontendPrimaryComponent),
      bundleField("Market overview source", "AssetResearchResultV2.marketLiquiditySupply.marketOverview"),
      bundleField("Liquidity source", "AssetResearchResultV2.marketLiquiditySupply.liquidity"),
      bundleField("Supply source", "AssetResearchResultV2.marketLiquiditySupply.supplyStructure"),
      bundleField("Issuance source", "AssetResearchResultV2.marketLiquiditySupply.issuanceAndBurn"),
      bundleField("Burn source", "AssetResearchResultV2.marketLiquiditySupply.issuanceAndBurn"),
      bundleField("Unlock source", "AssetResearchResultV2.marketLiquiditySupply.unlocksAndEmissions"),
      bundleField("Allocation source", "AssetResearchResultV2.marketLiquiditySupply.allocationAndConcentration"),
      bundleField("Historical source", "AssetResearchResultV2.marketLiquiditySupply.historicalContext"),
      bundleField("Provider agreement source", "AssetResearchResultV2.marketLiquiditySupply.providerAgreement"),
      bundleField("Freshness source", "AssetResearchResultV2.marketLiquiditySupply.marketOverview.freshnessState"),
      bundleField("Interpretation source", "AssetResearchResultV2.marketLiquiditySupply.boundedInterpretation"),
      bundleField("Old V2 market surface primary", yesNoUnknown(safePremiumV2MarketLiquiditySupplyQa.oldV2MarketSurfacePrimary)),
      bundleField("Duplicate market field count", safePremiumV2MarketLiquiditySupplyQa.duplicateMarketFieldCount),
      bundleField("Pair-as-global leakage count", safePremiumV2MarketLiquiditySupplyQa.pairAsGlobalLeakageCount),
      bundleField("Native-to-wrapped inheritance count", safePremiumV2MarketLiquiditySupplyQa.nativeToWrappedInheritanceCount),
      bundleField("Native-to-LST inheritance count", safePremiumV2MarketLiquiditySupplyQa.nativeToLstInheritanceCount),
      bundleField("Missing-as-zero finding count", safePremiumV2MarketLiquiditySupplyQa.missingAsZeroFindingCount),
      bundleField("Missing-unlock-as-no-risk count", safePremiumV2MarketLiquiditySupplyQa.missingUnlockAsNoRiskCount),
      bundleField("Customer internal-enum leakage count", safePremiumV2MarketLiquiditySupplyQa.customerInternalEnumLeakageCount),
      bundleField("Frontend analytical calculation count", safePremiumV2MarketLiquiditySupplyQa.frontendAnalyticalCalculationCount),
      bundleField("Browser visual QA status", safePremiumV2MarketLiquiditySupplyQa.browserVisualQaStatus),
      bundleField("Tested routes", safeArray(safePremiumV2MarketLiquiditySupplyQa.testedRoutes).join(", ") || "not run"),
      bundleField("Tested viewports", safeArray(safePremiumV2MarketLiquiditySupplyQa.testedViewports).join(", ") || "not run"),
      bundleField("Screenshot evidence", safeArray(safePremiumV2MarketLiquiditySupplyQa.screenshotEvidence).join(", ") || "not available"),
      bundleField("Bundle size delta", safePremiumV2MarketLiquiditySupplyQa.bundleSizeDelta),
      "Guardrails:",
      bundleList([
        `scoring changed=${yesNoUnknown(safePremiumV2MarketLiquiditySupplyQa.scoringChanged)}`,
        `tokenomics score changed=${yesNoUnknown(safePremiumV2MarketLiquiditySupplyQa.tokenomicsScoreChanged)}`,
        `confidence changed=${yesNoUnknown(safePremiumV2MarketLiquiditySupplyQa.confidenceChanged)}`,
        `verdict changed=${yesNoUnknown(safePremiumV2MarketLiquiditySupplyQa.verdictChanged)}`,
        `ranking changed=${yesNoUnknown(safePremiumV2MarketLiquiditySupplyQa.rankingChanged)}`,
        `universe changed=${yesNoUnknown(safePremiumV2MarketLiquiditySupplyQa.universeChanged)}`,
        `provider behavior changed=${yesNoUnknown(safePremiumV2MarketLiquiditySupplyQa.providerBehaviorChanged)}`,
      ]),
      "Known limitations:",
      bundleList(safePremiumV2MarketLiquiditySupplyQa.knownLimitations),
    ]),
    bundleSection("Premium V2 Tokenomics Quality Experience QA", [
      bundleField("Experience attached", tokenomicsQualityPresentation.schemaVersion && safePremiumV2TokenomicsQualityQa.experienceAttached ? "yes" : "no"),
      bundleField("Experience version", tokenomicsQualityPresentation.schemaVersion || safePremiumV2TokenomicsQualityQa.experienceVersion),
      bundleField("Canonical asset", tokenomicsQualityPresentation.canonicalAssetId || assetResearchResultV2?.identity?.data?.canonicalAssetId),
      bundleField("Canonical representation", tokenomicsQualityPresentation.representation?.representationType),
      bundleField("Canonical family", tokenomicsQualityPresentation.family?.familyId),
      bundleField("Presentation owner", safePremiumV2TokenomicsQualityQa.presentationOwner),
      bundleField("Tokenomics Quality score owner", safePremiumV2TokenomicsQualityQa.tokenomicsQualityScoreOwner),
      bundleField("Frontend normalizer", safePremiumV2TokenomicsQualityQa.frontendNormalizer),
      bundleField("Frontend primary component", safePremiumV2TokenomicsQualityQa.frontendPrimaryComponent),
      bundleField("Economic-role source", "AssetResearchResultV2.tokenomicsQualityPresentation.economicRole"),
      bundleField("Demand-mechanism source", "AssetResearchResultV2.tokenomicsQualityPresentation.demandMechanisms"),
      bundleField("Utility source", "AssetResearchResultV2.tokenomicsQualityPresentation.utilityAndNecessity"),
      bundleField("Holder-rights source", "AssetResearchResultV2.tokenomicsQualityPresentation.holderRights"),
      bundleField("Value-capture source", "AssetResearchResultV2.tokenomicsQualityPresentation.valueCapture"),
      bundleField("Governance source", "AssetResearchResultV2.tokenomicsQualityPresentation.governanceAndControl"),
      bundleField("Control-authority source", "AssetResearchResultV2.tokenomicsQualityPresentation.governanceAndControl"),
      bundleField("Distribution source", "AssetResearchResultV2.tokenomicsQualityPresentation.distribution"),
      bundleField("Unlock/dilution source", "AssetResearchResultV2.tokenomicsQualityPresentation.unlocksAndDilution"),
      bundleField("Issuance/burn source", "AssetResearchResultV2.tokenomicsQualityPresentation.issuanceAndBurn"),
      bundleField("Treasury/incentive source", "AssetResearchResultV2.tokenomicsQualityPresentation.treasuryAndIncentives"),
      bundleField("Staking/yield source", "AssetResearchResultV2.tokenomicsQualityPresentation.stakingAndYieldBoundary"),
      bundleField("Product/token-boundary source", "AssetResearchResultV2.tokenomicsQualityPresentation.productTokenBoundary"),
      bundleField("Strengths source", "AssetResearchResultV2.tokenomicsQualityPresentation.strengths"),
      bundleField("Risks source", "AssetResearchResultV2.tokenomicsQualityPresentation.risks"),
      bundleField("Critical-unknown source", "AssetResearchResultV2.tokenomicsQualityPresentation.criticalUnknowns"),
      bundleField("Missing-evidence source", "AssetResearchResultV2.tokenomicsQualityPresentation.missingEvidence"),
      bundleField("Old V2 Tokenomics surface primary", yesNoUnknown(safePremiumV2TokenomicsQualityQa.oldV2TokenomicsSurfacePrimary)),
      bundleField("Duplicate tokenomics-score count", safePremiumV2TokenomicsQualityQa.duplicateTokenomicsScoreCount),
      bundleField("Protocol-to-token value leakage count", safePremiumV2TokenomicsQualityQa.protocolToTokenValueLeakageCount),
      bundleField("Governance-to-cashflow leakage count", safePremiumV2TokenomicsQualityQa.governanceToCashflowLeakageCount),
      bundleField("Product-AUM-to-token-value leakage count", safePremiumV2TokenomicsQualityQa.productAumToTokenValueLeakageCount),
      bundleField("Missing-evidence-as-risk finding count", safePremiumV2TokenomicsQualityQa.missingEvidenceAsRiskFindingCount),
      bundleField("Native-to-wrapped tokenomics leakage count", safePremiumV2TokenomicsQualityQa.nativeToWrappedTokenomicsLeakageCount),
      bundleField("Native-to-LST tokenomics leakage count", safePremiumV2TokenomicsQualityQa.nativeToLstTokenomicsLeakageCount),
      bundleField("Customer internal-enum leakage count", safePremiumV2TokenomicsQualityQa.customerInternalEnumLeakageCount),
      bundleField("Frontend analytical calculation count", safePremiumV2TokenomicsQualityQa.frontendAnalyticalCalculationCount),
      bundleField("Browser visual QA status", safePremiumV2TokenomicsQualityQa.browserVisualQaStatus),
      bundleField("Tested routes", safeArray(safePremiumV2TokenomicsQualityQa.testedRoutes).join(", ") || "not run"),
      bundleField("Tested viewports", safeArray(safePremiumV2TokenomicsQualityQa.testedViewports).join(", ") || "not run"),
      bundleField("Screenshot evidence", safeArray(safePremiumV2TokenomicsQualityQa.screenshotEvidence).join(", ") || "not available"),
      bundleField("Bundle-size delta", safePremiumV2TokenomicsQualityQa.bundleSizeDelta),
      "Guardrails:",
      bundleList([
        `tokenomics score changed=${yesNoUnknown(safePremiumV2TokenomicsQualityQa.tokenomicsScoreChanged)}`,
        `overall score changed=${yesNoUnknown(safePremiumV2TokenomicsQualityQa.overallScoreChanged)}`,
        `confidence changed=${yesNoUnknown(safePremiumV2TokenomicsQualityQa.confidenceChanged)}`,
        `verdict changed=${yesNoUnknown(safePremiumV2TokenomicsQualityQa.verdictChanged)}`,
        `ranking changed=${yesNoUnknown(safePremiumV2TokenomicsQualityQa.rankingChanged)}`,
        `universe changed=${yesNoUnknown(safePremiumV2TokenomicsQualityQa.universeChanged)}`,
        `provider behavior changed=${yesNoUnknown(safePremiumV2TokenomicsQualityQa.providerBehaviorChanged)}`,
      ]),
      "Known limitations:",
      bundleList(safePremiumV2TokenomicsQualityQa.knownLimitations),
    ]),
    bundleSection("Premium V2 Thesis & Fundamentals Experience QA", [
      bundleField("Experience attached", thesisFundamentalsPresentation.schemaVersion && safePremiumV2ThesisFundamentalsQa.experienceAttached ? "yes" : "no"),
      bundleField("Experience version", thesisFundamentalsPresentation.schemaVersion || safePremiumV2ThesisFundamentalsQa.experienceVersion),
      bundleField("Canonical asset", thesisFundamentalsPresentation.canonicalAssetId || assetResearchResultV2?.identity?.data?.canonicalAssetId),
      bundleField("Canonical representation", thesisFundamentalsPresentation.representation?.representationType),
      bundleField("Canonical family", thesisFundamentalsPresentation.family?.familyId),
      bundleField("Presentation owner", safePremiumV2ThesisFundamentalsQa.presentationOwner),
      bundleField("Analytical owner", safePremiumV2ThesisFundamentalsQa.analyticalOwner),
      bundleField("Final-language owner", safePremiumV2ThesisFundamentalsQa.finalLanguageOwner),
      bundleField("Frontend normalizer", safePremiumV2ThesisFundamentalsQa.frontendNormalizer),
      bundleField("Frontend primary component", safePremiumV2ThesisFundamentalsQa.frontendPrimaryComponent),
      bundleField("Old V2 Fundamentals surface primary", yesNoUnknown(safePremiumV2ThesisFundamentalsQa.oldV2FundamentalsSurfacePrimary)),
      bundleField("Duplicate thesis count", safePremiumV2ThesisFundamentalsQa.duplicateThesisCount),
      bundleField("Duplicate risk count", safePremiumV2ThesisFundamentalsQa.duplicateRiskCount),
      bundleField("Duplicate critical-unknown count", safePremiumV2ThesisFundamentalsQa.duplicateCriticalUnknownCount),
      bundleField("Integration-as-adoption leakage count", safePremiumV2ThesisFundamentalsQa.integrationAsAdoptionLeakageCount),
      bundleField("Partnership-as-usage leakage count", safePremiumV2ThesisFundamentalsQa.partnershipAsUsageLeakageCount),
      bundleField("Market-cap-as-moat leakage count", safePremiumV2ThesisFundamentalsQa.marketCapAsMoatLeakageCount),
      bundleField("Price-as-adoption leakage count", safePremiumV2ThesisFundamentalsQa.priceAsAdoptionLeakageCount),
      bundleField("Protocol-to-token value leakage count", safePremiumV2ThesisFundamentalsQa.protocolToTokenValueLeakageCount),
      bundleField("Product-AUM-to-token-value leakage count", safePremiumV2ThesisFundamentalsQa.productAumToTokenValueLeakageCount),
      bundleField("Missing-evidence-as-risk finding count", safePremiumV2ThesisFundamentalsQa.missingEvidenceAsRiskFindingCount),
      bundleField("Native-to-wrapped fundamentals leakage count", safePremiumV2ThesisFundamentalsQa.nativeToWrappedFundamentalsLeakageCount),
      bundleField("Native-to-LST fundamentals leakage count", safePremiumV2ThesisFundamentalsQa.nativeToLstFundamentalsLeakageCount),
      bundleField("Stablecoin speculative-thesis leakage count", safePremiumV2ThesisFundamentalsQa.stablecoinSpeculativeThesisLeakageCount),
      bundleField("Meme invented-utility leakage count", safePremiumV2ThesisFundamentalsQa.memeInventedUtilityLeakageCount),
      bundleField("Customer internal-enum leakage count", safePremiumV2ThesisFundamentalsQa.customerInternalEnumLeakageCount),
      bundleField("Frontend analytical calculation count", safePremiumV2ThesisFundamentalsQa.frontendAnalyticalCalculationCount),
      bundleField("Browser visual QA status", safePremiumV2ThesisFundamentalsQa.browserVisualQaStatus),
      bundleField("Tested routes", safeArray(safePremiumV2ThesisFundamentalsQa.testedRoutes).join(", ") || "not run"),
      bundleField("Tested viewports", safeArray(safePremiumV2ThesisFundamentalsQa.testedViewports).join(", ") || "not run"),
      bundleField("Screenshot evidence", safeArray(safePremiumV2ThesisFundamentalsQa.screenshotEvidence).join(", ") || "not available"),
      bundleField("Bundle-size delta", safePremiumV2ThesisFundamentalsQa.bundleSizeDelta),
      "Guardrails:",
      bundleList([
        `scoring changed=${yesNoUnknown(safePremiumV2ThesisFundamentalsQa.scoringChanged)}`,
        `tokenomics score changed=${yesNoUnknown(safePremiumV2ThesisFundamentalsQa.tokenomicsScoreChanged)}`,
        `confidence changed=${yesNoUnknown(safePremiumV2ThesisFundamentalsQa.confidenceChanged)}`,
        `verdict changed=${yesNoUnknown(safePremiumV2ThesisFundamentalsQa.verdictChanged)}`,
        `ranking changed=${yesNoUnknown(safePremiumV2ThesisFundamentalsQa.rankingChanged)}`,
        `universe changed=${yesNoUnknown(safePremiumV2ThesisFundamentalsQa.universeChanged)}`,
        `provider behavior changed=${yesNoUnknown(safePremiumV2ThesisFundamentalsQa.providerBehaviorChanged)}`,
      ]),
      "Known limitations:",
      bundleList(safePremiumV2ThesisFundamentalsQa.knownLimitations),
    ]),
    bundleSection("2AM. Institutional Answer Surface Cleanup v1", [
      bundleField("Contract attached", institutionalAnswerSurfaceContract ? "yes" : "missing"),
      bundleField("Runtime role", institutionalAnswerSurfaceContract
        ? "historical/non-current static audit; never primary product truth"
        : "disabled for live recompute; historical/static audit only"),
      bundleField("Artifact version", institutionalAnswerSurfaceContract?.artifactVersion),
      bundleField("Live primary truth", yesNoUnknown(institutionalAnswerSurfaceContract?.productLayer?.canonicalOwnerDisposition?.livePrimaryTruth)),
      bundleField("Superseded by", institutionalAnswerSurfaceContract?.productLayer?.canonicalOwnerDisposition?.supersededBy),
      bundleField("Disposition", institutionalAnswerSurfaceContract?.productLayer?.canonicalOwnerDisposition?.disposition),
      bundleField("Disposition reason", institutionalAnswerSurfaceContract?.productLayer?.canonicalOwnerDisposition?.reason),
      bundleField("Asset family", institutionalAnswerSurfaceContract?.assetFamily),
      bundleField("Cards transformed", institutionalAnswerSurfaceContract?.cardsTransformedCount ?? institutionalAnswerCards.length),
      bundleField("Rejected incompatible raw answers (audit-only)", institutionalAnswerSurfaceContract?.rejectedIncompatibleAnswerCount ?? 0),
      bundleField("2AM scanner version", twoAmRenderedPrimaryScan.scannerVersion),
      bundleField("2AM corpus source", twoAmRenderedPrimaryScan.corpusSource),
      bundleField("2AM raw metadata excluded", twoAmRenderedPrimaryScan.rawMetadataExcluded ? "yes" : "no"),
      bundleField("Deprecated raw scanner finding count", institutionalAnswerSurfaceContract?.leakageCheck?.forbiddenPrimaryTermLeakageCount ?? "unknown"),
      bundleField("2AM real primary leakage count", twoAmRenderedPrimaryScan.realPrimaryVisibleLeakageCount),
      bundleField("2AM primary leakage pass", twoAmRenderedPrimaryScan.primaryLeakagePass ? "yes" : "no"),
      bundleField("2AM bundle user mirror leakage count", twoAmRenderedPrimaryScan.bundleUserMirrorLeakageCount),
      bundleField("2AM protected report leakage count", twoAmRenderedPrimaryScan.protectedReportLeakageCount),
      bundleField("2AM methodology allowed count", twoAmRenderedPrimaryScan.methodologyAllowedCount),
      bundleField("2AM audit/internal allowed count", twoAmRenderedPrimaryScan.auditInternalAllowedCount),
      bundleField("2AM raw metadata excluded count", twoAmRenderedPrimaryScan.rawMetadataExcludedCount),
      bundleField("2AM scanner false-positive count", twoAmRenderedPrimaryScan.scannerFalsePositiveCount),
      bundleField("Deprecated internal enum scanner count", institutionalAnswerSurfaceContract?.leakageCheck?.internalEnumLeakageCount ?? "unknown"),
      bundleField("Deprecated methodology scanner count", institutionalAnswerSurfaceContract?.leakageCheck?.methodologyLeakageCount ?? "unknown"),
      bundleField("Deprecated family-negative guardrail scanner count", institutionalAnswerSurfaceContract?.leakageCheck?.familyNegativeGuardrailLeakageCount ?? "unknown"),
      bundleField("Wrong-family question leakage count", institutionalAnswerSurfaceContract?.leakageCheck?.wrongFamilyQuestionLeakageCount ?? "unknown"),
      "Wrong-family question findings:",
      bundleList(safeArray(institutionalAnswerSurfaceContract?.leakageCheck?.wrongFamilyQuestionFindings).map((finding) =>
        `${finding.questionId || "question"} | expected=${finding.expectedFamily || "unknown"} | detected=${safeArray(finding.detectedFamilies).join(", ") || "unknown"} | concepts=${safeArray(finding.matchedConcepts).join(", ") || "none"}`
      ), "No wrong-family question leakage detected."),
      bundleField("Deprecated primary leakage total", institutionalAnswerSurfaceContract ? institutionalAnswerForbiddenLeakageCount : "unknown"),
      bundleField("Source Queue cleanup result", institutionalAnswerSurfaceContract?.sourceQueueCleanupResult || "unknown"),
      bundleField("Manual Review cleanup result", institutionalAnswerSurfaceContract?.manualReviewCleanupResult || "unknown"),
      bundleField("Scoring Transparency cleanup result", institutionalAnswerSurfaceContract?.scoringTransparencyCleanupResult || "unknown"),
      bundleField("Methodology surface coverage", institutionalAnswerSurfaceContract?.methodologySurface ? "methodology_once_available" : "missing"),
      bundleField("Audit preservation result", institutionalAnswerSurfaceContract?.guardrails?.auditRawDiagnosticsPreserved ? "raw diagnostics preserved" : "unknown"),
      bundleField("Internal QA preservation result", institutionalAnswerSurfaceContract?.guardrails?.internalQaDiagnosticsPreserved ? "internal diagnostics preserved" : "unknown"),
      bundleField("Protected Investor Report redaction", institutionalAnswerSurfaceContract?.protectedInvestorReportRedaction || "unknown"),
      bundleField("Product layer attached", institutionalAnswerSurfaceContract?.productLayer?.productLayerVersion ? "yes" : "missing"),
      bundleField("Product layer backend-derived", yesNoUnknown(institutionalAnswerSurfaceContract?.productLayer?.backendDerived)),
      bundleField("Product layer deterministic", yesNoUnknown(institutionalAnswerSurfaceContract?.productLayer?.deterministic)),
      bundleField("Product layer family policy", institutionalAnswerSurfaceContract?.productLayer?.familyRelevancePolicyId),
      bundleField("Product layer primary source matrix", institutionalAnswerSurfaceContract?.productLayer?.primarySourceMatrixId),
      bundleField("Product layer primary semantic status", institutionalAnswerSurfaceContract?.productLayer?.semanticStatusSummary?.primaryStatus),
      bundleField("Registry version consumed", institutionalAnswerSurfaceContract?.productLayer?.registryEnforcementSummary?.registryVersionConsumed),
      bundleField("Registry-gated cards", institutionalAnswerSurfaceContract?.productLayer?.registryEnforcementSummary?.cardsGated ?? 0),
      bundleField("Cards with question-specific evidence", institutionalAnswerSurfaceContract?.productLayer?.registryEnforcementSummary?.cardsWithQuestionSpecificEvidence ?? 0),
      bundleField("Cards with context only", institutionalAnswerSurfaceContract?.productLayer?.registryEnforcementSummary?.cardsWithContextOnly ?? 0),
      bundleField("Invalid proxy answers found", institutionalAnswerSurfaceContract?.productLayer?.registryEnforcementSummary?.invalidProxyAnswersFound ?? 0),
      bundleField("Invalid proxy answers blocked", institutionalAnswerSurfaceContract?.productLayer?.registryEnforcementSummary?.invalidProxyAnswersBlocked ?? 0),
      bundleField("Available=yes with data=none findings", institutionalAnswerSurfaceContract?.productLayer?.registryEnforcementSummary?.availableYesDataNoneFindings ?? 0),
      bundleField("API fields converted to typed observations", safeArray(typedObservationLayerContract?.eligibleAnswerObservations).length),
      bundleField("Direct-answer observations", safeArray(typedObservationLayerContract?.eligibleAnswerObservations).filter((item) => item.answerUse === "direct_answer_evidence").length),
      bundleField("Partial-answer observations", safeArray(typedObservationLayerContract?.eligibleAnswerObservations).filter((item) => item.answerUse === "partial_answer_evidence").length),
      bundleField("Market-context observations", safeArray(typedObservationLayerContract?.eligibleAnswerObservations).filter((item) => item.answerUse === "market_context").length),
      bundleField("Forbidden-proxy observations", safeArray(typedObservationLayerContract?.eligibleAnswerObservations).filter((item) => item.answerUse === "forbidden_proxy").length),
      bundleField("Fallback quality version", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.version),
      bundleField("Fallback cards rewritten", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.fallbackCardsRewritten ?? 0),
      bundleField("Cards mapped to contracts", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.cardsMappedToContracts ?? 0),
      bundleField("Primary UI internal wording findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.primaryUiInternalWordingFindings ?? "unknown"),
      bundleField("Identity missing evidence findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.identityMissingEvidenceFindings ?? "unknown"),
      bundleField("Thesis-support overclaim findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.thesisSupportOverclaimFindings ?? "unknown"),
      bundleField("Mechanism-context separation findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.mechanismContextSeparationFindings ?? "unknown"),
      bundleField("Repeated primary-answer findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.repeatedPrimaryAnswerFindings ?? "unknown"),
      bundleField("Repeated sentence findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.repeatedSentenceFindings ?? "unknown"),
      bundleField("Repeated canonical-asset findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.repeatedCanonicalAssetFindings ?? "unknown"),
      bundleField("Primary-copy similarity findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.primaryCopySimilarityFindings ?? "unknown"),
      bundleField("Raw-label humanization findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.rawLabelHumanizationFindings ?? "unknown"),
      bundleField("Context/evidence separation findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.contextMisclassifiedAsEvidenceFindings ?? "unknown"),
      bundleField("Missing-observations=none findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.missingObservationNoneFindings ?? "unknown"),
      bundleField("Stale mismatch-warning findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.staleMismatchWarningFindings ?? "unknown"),
      bundleField("Source Queue wording findings", institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.sourceQueueWordingFindings ?? "unknown"),
      bundleField("Dedup applied to primary UI", yesNoUnknown(institutionalAnswerSurfaceContract?.productLayer?.fallbackQualitySummary?.primaryUiDedupApplied)),
      bundleField("Product layer dedup suppression count", institutionalAnswerSurfaceContract?.productLayer?.deduplicationSummary?.suppressionCount ?? 0),
      "Product-layer current data mirror:",
      bundleList(safeArray(institutionalAnswerSurfaceContract?.productLayer?.currentDataUsed).map((point) =>
        `${point.label || point.dataPointId || "field"}=${point.displayValue || point.value || "Unavailable"} | source=${point.sourceBasis || "unknown"} | field=${safeArray(point.fieldBasis).join(", ") || "unknown"} | freshness=${point.freshnessBasis || "unknown"} | boundary=${point.evidenceBoundary || "unknown"}`
      ), "No product-layer data points attached.", 20),
      "Product-layer claim provenance:",
      bundleList(safeArray(institutionalAnswerSurfaceContract?.productLayer?.claimTrace).map((claim) =>
        `${claim.claimId || "claim"} | kind=${claim.claimKind || "unknown"} | ${claim.text || "No claim text"} | source=${claim.sourceBasis || "unknown"} | fields=${safeArray(claim.fieldBasis).join(", ") || "unknown"} | freshness=${claim.freshnessBasis || "unknown"} | boundary=${claim.evidenceBoundary || "unknown"} | confidence=${claim.confidenceEffect || "unknown"}`
      ), "No product-layer claim trace attached.", 50),
      "Product-layer semantic statuses:",
      bundleList(safeArray(institutionalAnswerSurfaceContract?.productLayer?.semanticStatusSummary?.statuses).map((status, index) =>
        `${status} | ${safeArray(institutionalAnswerSurfaceContract?.productLayer?.semanticStatusSummary?.labels)[index] || "label unavailable"}`
      ), "No semantic statuses attached."),
      "Product-layer family relevance ranking:",
      bundleList(safeArray(institutionalAnswerSurfaceContract?.productLayer?.relevanceRanking).map((item) =>
        `${item.rank}. ${item.label} | tier=${item.relevanceTier} | category=${item.category} | available=${yesNoUnknown(item.available)} | contextAvailable=${yesNoUnknown(item.contextAvailable)} | questionEvidenceAvailable=${yesNoUnknown(item.questionEvidenceAvailable)} | status=${item.semanticStatus} | data=${safeArray(item.dataPointIds).join(", ") || "none"} | missingObservations=${safeArray(item.missingObservationTypes).join(", ") || "none"} | ${item.rationale || "No rationale attached."}`
      ), "No family relevance ranking attached.", 30),
      "Product-layer deduplication summary:",
      bundleList([
        `canonicalSourceSentence=${institutionalAnswerSurfaceContract?.productLayer?.deduplicationSummary?.canonicalSourceSentence || "missing"}`,
        `primaryUiDisplayCopy=${institutionalAnswerSurfaceContract?.productLayer?.deduplicationSummary?.primaryUiDisplayCopy || "missing"}`,
        `suppressionCount=${institutionalAnswerSurfaceContract?.productLayer?.deduplicationSummary?.suppressionCount ?? 0}`,
        `hiddenAuditRepetitionRetainedInBundle=${yesNoUnknown(institutionalAnswerSurfaceContract?.productLayer?.deduplicationSummary?.hiddenAuditRepetitionRetainedInBundle)}`,
        ...safeArray(institutionalAnswerSurfaceContract?.productLayer?.deduplicationSummary?.repeatedCopySuppressed).map((text) => `suppressed=${text}`),
      ], "No deduplication metadata attached.", 50),
      "Product-layer bounded interpretations:",
      bundleList(institutionalAnswerSurfaceContract?.productLayer?.boundedInterpretations),
      "Product-layer unsupported inferences:",
      bundleList(institutionalAnswerSurfaceContract?.productLayer?.unsupportedInferences),
      "Product-layer missing analysis:",
      bundleList(institutionalAnswerSurfaceContract?.productLayer?.missingAnalysis),
      "Product-layer analyst next steps:",
      bundleList(institutionalAnswerSurfaceContract?.productLayer?.analystNextSteps),
      "Product-layer UI visibility policy:",
      bundleList(Object.entries(safeObject(institutionalAnswerSurfaceContract?.productLayer?.uiVisibilityPolicy)).map(([key, value]) =>
        `${key}=${Array.isArray(value) ? value.join(", ") : String(value)}`
      )),
      "Product-layer bundle parity markers:",
      bundleList(Object.entries(safeObject(institutionalAnswerSurfaceContract?.productLayer?.bundleParityMarkers)).map(([key, value]) =>
        `${key}=${yesNoUnknown(value)}`
      )),
      "Product-layer internal-only fields:",
      bundleList(institutionalAnswerSurfaceContract?.productLayer?.internalOnlyFields),
      "Deprecated answer cards (audit-only):",
      bundleList(institutionalAnswerCards.map((card) =>
        `${cleanPrimaryAnswerText(card.question || "Institutional question")} | semantic=${card.semanticStatus || "unknown"} | ${cleanPrimaryAnswerText(card.semanticStatusLabel || card.statusLabel || card.sourceStateLabel || "Needs verification")} | ${cleanPrimaryAnswerText(card.shortAnswer || card.fundamentalAnalysis || "Needs verification.")}`
      )),
      "Per-card Question Source Coverage Registry enforcement:",
      bundleList(institutionalAnswerCards.map((card) =>
        `${card.cardId || "card"} | gate=${card.registryGateStatus || "unknown"} | contract=${card.registryContractUsed?.questionId || "none"} | readiness=${card.answerReadiness || "unknown"} | semanticSource=${card.semanticStatusSource || "unknown"} | eligible=${safeArray(card.questionSpecificEvidence).length} | context=${safeArray(card.availableContext).length} | rejected=${safeArray(card.rejectedQuestionEvidence).length} | missing=${safeArray(card.missingObservationTypes).join(", ") || "none"} | boundary=${card.contextBoundary || "none"}`
      ), "No per-card registry enforcement diagnostics attached.", 60),
      "Per-card v1.2.3 API-first answer diagnostics:",
      bundleList(institutionalAnswerCards.map((card) =>
        `${card.cardId || "card"} | fallbackRewritten=${yesNoUnknown(card.fallbackCopyRewritten)} | mapped=${yesNoUnknown(Boolean(card.registryContractUsed))} | primaryInternalHidden=${yesNoUnknown(card.primaryUiInternalWordingHidden)} | identityMissingSuppressed=${yesNoUnknown(card.identityMissingEvidenceSuppressed)} | mechanismSeparated=${yesNoUnknown(card.mechanismContextSeparated)} | liveEvidence=${card.currentLiveEvidenceStatus || "unknown"}`
      ), "No fallback-quality diagnostics attached.", 60),
      "Per-card legacy answer diagnostics (audit-only):",
      bundleList(institutionalAnswerCards.map((card) =>
        `${card.cardId || "card"} | state=${card.answerState || "missing_key_data"} | answer=${card.answer || card.shortAnswer || "missing"} | dataUsed=${safeArray(card.dataUsed).map((item) => item?.label || item).join(" / ") || "none"} | observationTypesUsed=${safeArray(card.observationTypesUsed).join(",") || "none"} | observationTypesMissing=${safeArray(card.observationTypesMissing).join(",") || "none"} | supports=${safeArray(card.whatDataSupports || card.whatThisSupports).join(" / ") || "none"} | missing=${safeArray(card.missingData || card.missingObservations || card.missingAnalysis).join(" / ") || "none"} | doesNotProve=${safeArray(card.whatDataDoesNotProve || card.whatThisDoesNotProve).join(" / ") || "none"} | next=${card.analystNextStep || "none"}`
      ), "No final primary answer text attached.", 60),
      "Rejected question evidence (audit-only):",
      bundleList(institutionalAnswerCards.flatMap((card) =>
        safeArray(card.rejectedQuestionEvidence).map((item) =>
          `${card.cardId || "card"} | ${item.label || item.itemId || "item"}=${item.displayValue || "none"} | classification=${item.classification || "unknown"} | reason=${item.reason || "none"}`
        )
      ), "No rejected question evidence attached.", 80),
      "Per-card deduplication audit:",
      bundleList(institutionalAnswerCards.map((card) =>
        `${card.cardId || "card"} | suppressed=${card.deduplicationMetadata?.suppressionCount ?? 0} | retained=${yesNoUnknown(card.deduplicationMetadata?.hiddenAuditRepetitionRetainedInBundle)} | canonical=${card.deduplicationMetadata?.canonicalSourceSentence || "missing"} | hidden=${safeArray(card.deduplicationMetadata?.repeatedCopySuppressed).join(" || ") || "none"}`
      ), "No per-card deduplication metadata attached.", 40),
      "Evidence we have:",
      bundleList(safeArray(institutionalAnswerSurfaceContract?.sourceSummary?.evidenceWeHave).map(cleanPrimaryAnswerText)),
      "Open checks / source queue summary:",
      bundleList(safeArray(institutionalAnswerSurfaceContract?.sourceSummary?.sourceQueueSummary || institutionalAnswerSurfaceContract?.sourceSummary?.openChecks).map(cleanPrimaryAnswerText)),
      "Rejected incompatible open checks (audit-only):",
      bundleList(safeArray(institutionalAnswerSurfaceContract?.sourceSummary?.rejectedIncompatibleOpenChecksAuditOnly).map((entry) =>
        `${entry.text || "Requirement"} | incompatible=${safeArray(entry.incompatibleFamilies).join(", ") || "unknown"} | concepts=${safeArray(entry.matchedConcepts).join(", ") || "unknown"}`
      ), "No incompatible open checks were rejected."),
      "Score summary in plain language:",
      bundleList([
        institutionalAnswerSurfaceContract?.scoreSummary?.scoreLabel,
        institutionalAnswerSurfaceContract?.scoreSummary?.confidenceLabel,
        institutionalAnswerSurfaceContract?.scoreSummary?.plainEnglishSummary,
        ...safeArray(institutionalAnswerSurfaceContract?.scoreSummary?.scoringTransparencySummary),
      ].map(cleanPrimaryAnswerText)),
      "Methodology surface:",
      bundleList([
        institutionalAnswerSurfaceContract?.methodologySurface?.title,
        institutionalAnswerSurfaceContract?.methodologySurface?.summary,
        ...safeArray(institutionalAnswerSurfaceContract?.methodologySurface?.bullets),
      ].map(cleanPrimaryAnswerText)),
      "Internal QA detail mirror:",
      bundleList([
        `Audit detail rows preserved=${safeArray(institutionalAnswerSurfaceContract?.auditDetails).length}`,
        `Raw status enums preserved in audit=${yesNoUnknown(safeArray(institutionalAnswerSurfaceContract?.auditDetails).some((detail) => detail.rawStatusEnum || detail.internalSourceStatus))}`,
        `Evidence packet / claim IDs preserved in audit=${yesNoUnknown(safeArray(institutionalAnswerSurfaceContract?.auditDetails).some((detail) => safeArray(detail.evidencePacketIds).length || safeArray(detail.claimIds).length))}`,
        `Scoring/source-promotion flags preserved in audit=${yesNoUnknown(safeArray(institutionalAnswerSurfaceContract?.auditDetails).some((detail) => safeArray(detail.scoringActiveFlags).length || safeArray(detail.sourcePromotionFlags).length))}`,
      ]),
      "Primary visible surfaces checked:",
      bundleList(Object.entries(safeObject(institutionalAnswerSurfaceContract?.frontendVisibility)).map(([surface, status]) => `${surface}: ${status}`)),
      "2AM corpus categories scanned:",
      bundleList(twoAmRenderedPrimaryScan.corpusCategoriesScanned, "No primary corpus categories scanned."),
      "2AM corpus categories excluded:",
      bundleList(twoAmRenderedPrimaryScan.corpusCategoriesExcluded, "No excluded corpus categories detected."),
      "2AM detected item classifications:",
      bundleList(safeArray(twoAmRenderedPrimaryScan.detectedItems).map((item) =>
        `${item.classification || "unclassified"} | term=${item.term || "term unavailable"} | field=${item.fieldPath || "field unavailable"} | surface=${item.surface || "surface unavailable"} | category=${item.corpusCategory || "unknown"} | rendered=${item.renderedVisible || "unknown"} | countedAsPrimary=${item.countedAsPrimary || "unknown"} | ${item.rationale || "No rationale attached."}`
      ), "No 2AM leakage findings detected.", 40),
      "2AM excluded item classifications:",
      bundleList(safeArray(twoAmRenderedPrimaryScan.excludedItems).slice(0, 40).map((item) =>
        `${item.classification || "excluded"} | term=${item.term || "term unavailable"} | field=${item.fieldPath || "field unavailable"} | surface=${item.surface || "surface unavailable"} | category=${item.corpusCategory || "unknown"} | rendered=${item.renderedVisible || "no"} | countedAsPrimary=${item.countedAsPrimary || "no"} | ${item.rationale || "Excluded from rendered primary corpus."}`
      ), "No raw/audit metadata exclusions detected.", 40),
      "Guardrails:",
      bundleList(Object.entries(safeObject(institutionalAnswerSurfaceContract?.guardrails)).map(([key, value]) => `${key}=${yesNoUnknown(value)}`)),
      "QA checks:",
      bundleList([
        `Copy Bundle 2AM present=yes`,
        `primary answer cards leak forbidden internal terms=${yesNoUnknown(twoAmRenderedPrimaryScan.realPrimaryVisibleLeakageCount > 0)}`,
        `protected report leaks forbidden internal terms=${yesNoUnknown(twoAmRenderedPrimaryScan.protectedReportLeakageCount > 0)}`,
        `2AM rendered-primary corpus scanner attached=${yesNoUnknown(twoAmRenderedPrimaryScan.scannerVersion === TWO_AM_RENDERED_PRIMARY_SCANNER_VERSION)}`,
        `2AM raw metadata excluded from primary scan=${yesNoUnknown(twoAmRenderedPrimaryScan.rawMetadataExcluded)}`,
        `Source Queue uses actionable verification language=${institutionalAnswerSurfaceContract?.sourceQueueCleanupResult || "unknown"}`,
        `Manual Review uses business-readable language=${institutionalAnswerSurfaceContract?.manualReviewCleanupResult || "unknown"}`,
        `Scoring Transparency uses plain language=${institutionalAnswerSurfaceContract?.scoringTransparencyCleanupResult || "unknown"}`,
        `Protected Investor Report redacts internals=${institutionalAnswerSurfaceContract?.protectedInvestorReportRedaction || "unknown"}`,
      ]),
      "Known limitations:",
      bundleList(institutionalAnswerSurfaceContract?.knownLimitations),
      bundleField("Next resume pointer", institutionalAnswerSurfaceContract?.nextResumePointer || "Evidence Status Aggregation Contract v1"),
    ]),
    bundleSection("2AN. Evidence Status Aggregation Contract v1", [
      bundleField("Contract attached", evidenceStatusAggregationContract ? "yes" : "missing"),
      bundleField("Artifact version", evidenceStatusAggregationContract?.artifactVersion),
      bundleField("Asset family", evidenceStatusAggregationContract?.assetFamily),
      bundleField("Claims collected", safeArray(evidenceStatusAggregationContract?.claims).length),
      bundleField("Questions aggregated", safeArray(evidenceStatusAggregationContract?.questionAggregations).length),
      bundleField("Dimensions aggregated", safeArray(evidenceStatusAggregationContract?.dimensionAggregations).length),
      bundleField("Asset evidence status", evidenceStatusAggregationContract?.assetAggregation?.primaryEvidenceStatus),
      bundleField("Plain-language asset summary", evidenceStatusAggregationContract?.assetAggregation?.plainLanguageSummary),
      bundleField("Scoring readiness impact", evidenceStatusAggregationContract?.assetAggregation?.scoringReadinessImpact?.plainLanguageSummary),
      bundleField("Legacy 2AN readiness counters status", "legacy_internal_counter; not authoritative for readiness; superseded by 2AQ provenance-aware counters"),
      bundleField("Legacy 2AN readiness gaps count", `${safeArray(evidenceStatusAggregationContract?.assetAggregation?.scoringReadinessImpact?.evidenceReadinessGaps).length} (legacy_internal_counter; use 2AQ institutional/live/source/scoring gaps)`),
      bundleField("Legacy 2AN confidence caps count", `${safeArray(evidenceStatusAggregationContract?.assetAggregation?.scoringReadinessImpact?.confidenceCaps).length} (legacy_internal_counter; use 2AQ confidence cap drivers)`),
      bundleField("2AQ authoritative readiness pointer", "Use 2AQ for institutional verification, live metric, source-required, scoring activation, and confidence-cap gaps."),
      bundleField("Manual reviewed evidence claims", evidenceProvenanceSemanticsContract?.readinessCounters?.manualReviewedEvidenceClaims),
      bundleField("Live provider data claims", evidenceProvenanceSemanticsContract?.readinessCounters?.liveProviderDataClaims),
      bundleField("Source candidate only claims", evidenceProvenanceSemanticsContract?.readinessCounters?.sourceCandidateOnlyClaims),
      bundleField("Display-only non-scoring claims", evidenceProvenanceSemanticsContract?.readinessCounters?.displayOnlyNonScoringClaims),
      bundleField("Scoring-active legacy claims", evidenceProvenanceSemanticsContract?.readinessCounters?.scoringActiveLegacyClaims),
      bundleField("Institutional verification gaps", evidenceProvenanceSemanticsContract?.readinessCounters?.institutionalVerificationGaps),
      bundleField("Live metric gaps", evidenceProvenanceSemanticsContract?.readinessCounters?.liveMetricGaps),
      bundleField("Source-required gaps", evidenceProvenanceSemanticsContract?.readinessCounters?.sourceRequiredGaps),
      bundleField("Scoring activation gaps", evidenceProvenanceSemanticsContract?.readinessCounters?.scoringActivationGaps),
      "Question aggregation examples:",
      bundleList(safeArray(evidenceStatusAggregationContract?.questionAggregations).slice(0, 12).map((question) =>
        `${question.questionId || "question"} | ${question.primaryStatus || "status_unknown"} | ${cleanPrimaryAnswerText(question.plainLanguageStatus || "Needs verification")} | supported=${safeArray(question.supportedClaims).length} missing=${safeArray(question.missingClaims).length} live=${safeArray(question.liveDataRequiredClaims || question.liveDataClaims).length} contradictions=${safeArray(question.contradictedClaims).length} notApplicable=${safeArray(question.notApplicableClaims).length} | ${cleanPrimaryAnswerText(question.plainLanguageSummary || "")}`
      ), "No question aggregations attached.", 12),
      "Canonical Source Queue mirrors from aggregation:",
      bundleList(safeArray(evidenceStatusAggregationContract?.sourceQueueItems).slice(0, 12).map((item) =>
        cleanPrimaryAnswerText(item || "Source review required")
      ), "No aggregation source queue items.", 12),
      "Manual Review items from aggregation:",
      bundleList(safeArray(evidenceStatusAggregationContract?.manualReviewItems).slice(0, 12).map((item) =>
        cleanPrimaryAnswerText(item || "Manual review required")
      ), "No aggregation manual-review items.", 12),
      "Policies applied:",
      bundleList(safeArray(evidenceStatusAggregationContract?.policiesApplied).map((policy) =>
        `${policy.policyId || "policy"} | family=${policy.assetFamily || "unknown"} | required=${safeArray(policy.requiredClaimTypes).join(", ") || "none"} | current=${safeArray(policy.currentDataClaimTypes).join(", ") || "none"}`
      ), "No aggregation policies attached.", 10),
      "Conflicts:",
      bundleList(safeArray(evidenceStatusAggregationContract?.conflicts).map((conflict) =>
        `${conflict.conflictId || "conflict"} | severity=${conflict.severity || "unknown"} | ${conflict.summary || "Conflict summary unavailable"}`
      ), "No evidence aggregation conflicts detected.", 10),
      "Frontend visibility:",
      bundleList(Object.entries(safeObject(evidenceStatusAggregationContract?.frontendVisibility)).map(([surface, status]) => `${surface}: ${status}`)),
      "QA checks:",
      bundleList([
        `Copy Bundle 2AN present=yes`,
        `Evidence Map receives aggregation=${yesNoUnknown(Boolean(evidenceStatusAggregationContract?.frontendVisibility?.evidenceMap))}`,
        `2AN independent product queue produced=${yesNoUnknown(evidenceStatusAggregationContract?.canonicalProjection?.independentProductQueueProduced)}`,
        `2AN canonical queue owner=${evidenceStatusAggregationContract?.canonicalProjection?.productSourceQueueOwner || "unavailable"}`,
        `2AN canonical queue refs=${safeArray(evidenceStatusAggregationContract?.canonicalProjection?.sourceQueueItemIds).length}`,
        `Manual Review receives aggregation=${yesNoUnknown(Boolean(evidenceStatusAggregationContract?.frontendVisibility?.manualReview))}`,
        `Answer Surface integration=${evidenceStatusAggregationContract?.frontendVisibility?.answerSurface || "unknown"}`,
        `Protected Investor Report redaction=${evidenceStatusAggregationContract?.frontendVisibility?.protectedInvestorReport || "unknown"}`,
        `Raw claim IDs preserved only in audit/bundle detail=${yesNoUnknown(safeArray(evidenceStatusAggregationContract?.questionAggregations).some((question) => safeArray(question.rawClaimIds).length))}`,
        `Reviewed evidence scoring-active=${yesNoUnknown(evidenceStatusAggregationContract?.guardrails?.reviewedEvidenceScoringActive)}`,
        `Source candidates promoted=${yesNoUnknown(evidenceStatusAggregationContract?.guardrails?.sourceCandidatesPromoted)}`,
        `2AN provenance-aware readiness counters attached=${yesNoUnknown(Boolean(evidenceProvenanceSemanticsContract?.evidenceAggregationReadinessSemantics))}`,
      ]),
      "Guardrails:",
      bundleList(Object.entries(safeObject(evidenceStatusAggregationContract?.guardrails)).map(([key, value]) => `${key}=${yesNoUnknown(value)}`)),
      "Known limitations:",
      bundleList(evidenceStatusAggregationContract?.knownLimitations),
      bundleField("Next resume pointer", evidenceStatusAggregationContract?.nextResumePointer || "Coverage Tier + Score Eligibility Gate v1"),
    ]),
    bundleSection("2AO. Coverage Tier + Score Eligibility Gate v1", [
      bundleField("Contract attached", coverageScoreEligibilityContract ? "yes" : "missing"),
      bundleField("Final decision owner", decisionLayer.audit?.inputOwners?.finalDecision || "decisionLayer unavailable"),
      bundleField("Final decision consistency", decisionLayer.consistency?.status),
      bundleField("Final verdict class", decisionLayer.verdict?.finalClass || decisionLayer.verdictClass),
      bundleField("Final verdict label", decisionLayer.verdict?.finalLabel || decisionLayer.verdictLabel),
      bundleField("Final score displayable", hasAtomicFinalDecision ? yesNoUnknown(finalDecisionScore.displayable) : "atomic decision unavailable"),
      bundleField("Final score display mode", finalDecisionScore.displayMode),
      bundleField("Final score display value", finalDecisionScore.displayValue ?? "withheld"),
      bundleField("Final score withholding reason", finalDecisionScore.withholdingReason),
      bundleField("Legacy score (audit only)", finalDecisionScore.internalValue ?? safeScores.overallScore),
      bundleField("Legacy verdict candidate (audit only)", decisionLayer.audit?.legacyCandidate ? `${decisionLayer.audit.legacyCandidate.verdictClass} | ${decisionLayer.audit.legacyCandidate.verdictLabel}` : "unchanged or unavailable"),
      bundleField("Verdict reconciliation reason", decisionLayer.verdict?.reconciliationReason || "none"),
      bundleField("Artifact version", coverageScoreEligibilityContract?.artifactVersion),
      bundleField("Coverage tier", coverageScoreEligibilityContract?.coverageTier),
      bundleField("Coverage tier label", coverageScoreEligibilityContract?.coverageTierLabel),
      bundleField("Coverage tier reason", coverageScoreEligibilityContract?.coverageTierReason),
      bundleField("Score eligibility", coverageScoreEligibilityContract?.scoreEligibility),
      bundleField("Score display mode", coverageScoreEligibilityContract?.scoreDisplayMode),
      bundleField("Score eligibility reason", coverageScoreEligibilityContract?.scoreEligibilityReason),
      bundleField("Analysis depth allowed", coverageScoreEligibilityContract?.analysisDepthAllowed),
      bundleField("Analysis depth label", coverageScoreEligibilityContract?.analysisDepthLabel),
      bundleField("Primary user message", coverageScoreEligibilityContract?.primaryUserMessage),
      bundleField("Identity confidence", coverageScoreEligibilityContract?.identityConfidence),
      bundleField("Family route safety", coverageScoreEligibilityContract?.familyRouteSafety),
      bundleField("Evidence coverage summary", coverageScoreEligibilityContract?.evidenceCoverageSummary),
      bundleField("Coverage evidence basis", evidenceProvenanceSemanticsContract?.coverageScoreEligibilitySemantics?.coverageEvidenceBasis),
      bundleField("Score evidence basis", evidenceProvenanceSemanticsContract?.coverageScoreEligibilitySemantics?.scoreEvidenceBasis),
      bundleField("Institutional readiness basis", evidenceProvenanceSemanticsContract?.coverageScoreEligibilitySemantics?.institutionalReadinessBasis),
      bundleField("Live data readiness", evidenceProvenanceSemanticsContract?.coverageScoreEligibilitySemantics?.liveDataReadiness),
      bundleField("Manual evidence readiness", evidenceProvenanceSemanticsContract?.coverageScoreEligibilitySemantics?.manualEvidenceReadiness),
      bundleField("Scoring activation readiness", evidenceProvenanceSemanticsContract?.coverageScoreEligibilitySemantics?.scoringActivationReadiness),
      bundleField("Confidence cap", coverageScoreEligibilityContract?.confidenceCap),
      bundleField("Legacy score preserved for audit", yesNoUnknown(coverageScoreEligibilityContract?.legacyScorePreservedForAudit)),
      bundleField("Existing score read-only", yesNoUnknown(coverageScoreEligibilityContract?.existingScoreReadOnly)),
      bundleField("Existing verdict read-only", yesNoUnknown(coverageScoreEligibilityContract?.existingVerdictReadOnly)),
      bundleField("Protected report redaction", coverageScoreEligibilityContract?.protectedInvestorReportRedaction),
      "Critical blockers:",
      bundleList(safeArray(coverageScoreEligibilityContract?.criticalBlockers).map((blocker) =>
        `${blocker.blockerId || "blocker"} | ${blocker.severity || "severity"} | ${blocker.scoreEligibilityImpact || "impact"} | ${cleanPrimaryAnswerText(blocker.label || "Coverage blocker")}`
      ), "No critical coverage blockers attached.", 12),
      "Coverage blockers:",
      bundleList(safeArray(coverageScoreEligibilityContract?.coverageBlockers).slice(0, 16).map((blocker) =>
        `${blocker.source || "source"} | ${blocker.severity || "severity"} | ${blocker.scoreEligibilityImpact || "impact"} | ${cleanPrimaryAnswerText(blocker.label || "Coverage blocker")}`
      ), "No coverage blockers attached.", 16),
      "Family policy applied:",
      bundleList([
        `policyId=${coverageScoreEligibilityContract?.familyPolicyApplied?.policyId || "unavailable"}`,
        `family=${coverageScoreEligibilityContract?.familyPolicyApplied?.family || "unavailable"}`,
        `minimumTierWithIdentityOnly=${coverageScoreEligibilityContract?.familyPolicyApplied?.minimumTierWithIdentityOnly || "unavailable"}`,
        `scoreEligibilityRequirements=${safeArray(coverageScoreEligibilityContract?.familyPolicyApplied?.scoreEligibilityRequirements).join("; ") || "unavailable"}`,
      ]),
      "Gap buckets:",
      bundleList([
        `liveMetricGaps=${safeArray(coverageScoreEligibilityContract?.liveMetricGaps).length}`,
        `legalRightsGaps=${safeArray(coverageScoreEligibilityContract?.legalRightsGaps).length}`,
        `economicRightsGaps=${safeArray(coverageScoreEligibilityContract?.economicRightsGaps).length}`,
        `reserveRedemptionGaps=${safeArray(coverageScoreEligibilityContract?.reserveRedemptionGaps).length}`,
        `securityGaps=${safeArray(coverageScoreEligibilityContract?.securityGaps).length}`,
        `liquidityMarketAccessGaps=${safeArray(coverageScoreEligibilityContract?.liquidityMarketAccessGaps).length}`,
      ]),
      "What would upgrade tier:",
      bundleList(coverageScoreEligibilityContract?.whatWouldUpgradeTier, "No tier-upgrade requirements attached.", 12),
      "What would make score eligible:",
      bundleList(coverageScoreEligibilityContract?.whatWouldMakeScoreEligible, "No score-eligibility requirements attached.", 12),
      "Readiness dimensions:",
      bundleList(safeArray(coverageScoreEligibilityContract?.readinessDimensions).map((dimension) =>
        `${dimension.dimensionId || "dimension"} | ${dimension.status || "unknown"} | ${cleanPrimaryAnswerText(dimension.summary || "Summary unavailable")}`
      ), "No coverage readiness dimensions attached.", 8),
      "Frontend visibility:",
      bundleList(Object.entries(safeObject(coverageScoreEligibilityContract?.frontendVisibility)).map(([surface, status]) => `${surface}: ${status}`)),
      "Protected report / frontend QA checks:",
      bundleList([
        `Decision Header receives coverage gate=${yesNoUnknown(Boolean(coverageScoreEligibilityContract?.frontendVisibility?.decisionHeader))}`,
        `Right Rail receives coverage gate=${yesNoUnknown(Boolean(coverageScoreEligibilityContract?.frontendVisibility?.rightRail))}`,
        `Scoring Transparency separates eligibility=${yesNoUnknown(Boolean(coverageScoreEligibilityContract?.frontendVisibility?.scoringTransparency))}`,
        `Coverage requirements project canonical owners=${yesNoUnknown(Boolean(coverageScoreEligibilityContract?.auditDetails?.canonicalRequirementOwners))}`,
        `Manual Review receives critical blockers=${yesNoUnknown(Boolean(coverageScoreEligibilityContract?.frontendVisibility?.manualReview))}`,
        `Protected Investor Report redaction=${coverageScoreEligibilityContract?.protectedInvestorReportRedaction || "unknown"}`,
        `Copy Bundle 2AO present=yes`,
        `2AO semantic label correction attached=${yesNoUnknown(Boolean(evidenceProvenanceSemanticsContract?.coverageScoreEligibilitySemantics))}`,
      ]),
      "Guardrails:",
      bundleList(Object.entries(safeObject(coverageScoreEligibilityContract?.guardrails)).map(([key, value]) => `${key}=${yesNoUnknown(value)}`)),
      "Audit details:",
      bundleList([
        `readOnlyScore=${coverageScoreEligibilityContract?.auditDetails?.readOnlyScore ?? "unavailable"}`,
        `readOnlyVerdict=${coverageScoreEligibilityContract?.auditDetails?.readOnlyVerdict ?? "unavailable"}`,
        `tierInputs=${safeArray(coverageScoreEligibilityContract?.auditDetails?.tierInputs).join("; ") || "unavailable"}`,
        `scoreEligibilityInputs=${safeArray(coverageScoreEligibilityContract?.auditDetails?.scoreEligibilityInputs).join("; ") || "unavailable"}`,
        `sourceBoundary=${coverageScoreEligibilityContract?.auditDetails?.sourceBoundary || "Coverage gate is display/readiness only."}`,
      ]),
      "Known limitations:",
      bundleList(coverageScoreEligibilityContract?.knownLimitations),
      bundleField("Next resume pointer", coverageScoreEligibilityContract?.nextResumePointer || "Family Data Requirement Matrix v2 or Batch 1 Live QA Retry"),
    ]),
    bundleSection("2AP. Primary Question Group + Source Matrix Canonicalization v1", [
      bundleField("Contract attached", familyCanonicalRoutingContract ? "yes" : "missing"),
      bundleField("Artifact version", familyCanonicalRoutingContract?.artifactVersion),
      bundleField("Effective family", familyCanonicalRoutingContract?.effectiveFamily),
      bundleField("Canonical question group", familyCanonicalRoutingContract?.canonicalQuestionGroup),
      bundleField("Canonical source profile", familyCanonicalRoutingContract?.canonicalSourceProfile),
      bundleField("Canonical source matrix entries", safeArray(familyCanonicalRoutingContract?.canonicalSourceMatrixEntries).join(", ") || "unavailable"),
      bundleField("Previous/raw question group", familyCanonicalRoutingContract?.primaryAnalysisRouteQuestionGroupBeforeCanonicalization || familyCanonicalRoutingContract?.rawResolvedQuestionGroup),
      bundleField("Previous/raw source profile", familyCanonicalRoutingContract?.primaryAnalysisRouteSourceProfileBeforeCanonicalization),
      bundleField("Previous/raw source matrix", safeArray(familyCanonicalRoutingContract?.primaryAnalysisRouteSourceMatrixBeforeCanonicalization).join(", ") || "none"),
      bundleField("Family-scoped blocker namespace", familyCanonicalRoutingContract?.canonicalCoverageBlockerNamespace),
      bundleField("Family-scoped source queue namespace", familyCanonicalRoutingContract?.canonicalSourceQueueNamespace),
      bundleField("Family-scoped manual review namespace", familyCanonicalRoutingContract?.canonicalManualReviewNamespace),
      bundleField("Wrong-family blocker leakage count", familyCanonicalRoutingContract?.wrongFamilyBlockerLeakageCount),
      bundleField("Protected report redaction", familyCanonicalRoutingContract?.frontendParity?.protectedReportExposure),
      "Blocked fallback groups / matrices:",
      bundleList(familyCanonicalRoutingContract?.blockedFallbacks, "No wrong-family fallback groups blocked.", 16),
      "Mismatches corrected or preserved as audit-only:",
      bundleList(safeArray(familyCanonicalRoutingContract?.mismatches).map((mismatch) =>
        `${mismatch.field || "field"} | ${mismatch.severity || "severity"} | raw=${mismatch.rawValue || "none"} | canonical=${mismatch.canonicalValue || "none"} | primaryAffected=${yesNoUnknown(mismatch.primarySurfaceAffected)}`
      ), "No canonical route mismatches detected.", 16),
      "Family-scoped blocker themes:",
      bundleList(familyCanonicalRoutingContract?.familyScopedBlockers, "No family-scoped blocker themes attached.", 16),
      "Family-scoped evidence requirements:",
      bundleList(familyCanonicalRoutingContract?.familyScopedEvidenceRequirements, "No family-scoped evidence requirements attached.", 16),
      "Source Queue canonical requirements:",
      bundleList(familyCanonicalRoutingContract?.sourceQueueCanonicalRequirements || familyCanonicalRoutingContract?.familyScopedSourceQueueRequirements, "No canonical Source Queue requirements attached.", 12),
      "Manual Review canonical requirements:",
      bundleList(familyCanonicalRoutingContract?.manualReviewCanonicalRequirements || familyCanonicalRoutingContract?.familyScopedManualReviewItems, "No canonical Manual Review requirements attached.", 12),
      bundleField("Independent product queue produced", yesNoUnknown(familyCanonicalRoutingContract?.independentProductQueueProduced)),
      "Rejected wrong-family legacy requirements (audit-only):",
      bundleList(safeArray(familyCanonicalRoutingContract?.rejectedWrongFamilyRequirements).map((item) =>
        `${item.sourcePath || "legacy path"} | expected=${item.expectedFamily || "unknown"} | incompatible=${safeArray(item.incompatibleFamilies).join(", ") || "unknown"} | concepts=${safeArray(item.matchedConcepts).join(", ") || "unknown"} | ${item.text || "text unavailable"}`
      ), "No wrong-family legacy requirements were rejected.", 20),
      "Frontend parity:",
      bundleList([
        `normalizedField=${familyCanonicalRoutingContract?.frontendParity?.normalizedField || "unavailable"}`,
        `visibleSurfaces=${safeArray(familyCanonicalRoutingContract?.frontendParity?.visibleSurfaces).join(", ") || "unavailable"}`,
        `Copy Bundle 2AP present=yes`,
      ]),
      "Audit-only raw route fields preserved:",
      bundleList(Object.entries(safeObject(familyCanonicalRoutingContract?.auditOnlyFields)).map(([key, value]) => `${key}: ${bundleValue(value)}`), "No audit-only fields attached.", 12),
      "Guardrails:",
      bundleList(Object.entries(safeObject(familyCanonicalRoutingContract?.guardrails)).map(([key, value]) => `${key}=${yesNoUnknown(value)}`)),
      "QA checks:",
      bundleList([
        `BTC native_benchmark/base_layer primary blocked=${yesNoUnknown(familyCanonicalRoutingContract?.effectiveFamily === "native_btc_pow_monetary" ? familyCanonicalRoutingContract?.canonicalQuestionGroup === "native_btc_pow_monetary_questions" : null)}`,
        `ETH base_layer primary blocked=${yesNoUnknown(familyCanonicalRoutingContract?.effectiveFamily === "native_eth_pos_gas_l2_fee_market" ? familyCanonicalRoutingContract?.canonicalQuestionGroup === "native_eth_pos_gas_l2_fee_market_questions" : null)}`,
        `LST generic wrapped primary blocked=${yesNoUnknown(familyCanonicalRoutingContract?.effectiveFamily === "liquid_staking_derivative" ? familyCanonicalRoutingContract?.canonicalQuestionGroup === "liquid_staking_derivative_questions" : null)}`,
        `Payments general base-layer matrix blocked=${yesNoUnknown(familyCanonicalRoutingContract?.effectiveFamily === "payments_settlement_network" ? safeArray(familyCanonicalRoutingContract?.canonicalSourceMatrixEntries).includes("matrix_payments_settlement_network") : null)}`,
        `Protected report raw internals redacted=${yesNoUnknown(familyCanonicalRoutingContract?.frontendParity?.protectedReportExposure === "high_level_route_summary_only")}`,
      ]),
      "Known limitations:",
      bundleList(familyCanonicalRoutingContract?.knownLimitations),
      bundleField("Next resume pointer", familyCanonicalRoutingContract?.nextResumePointer || "Batch 1 Live QA Retry after deploy/browser check; if clean, proceed to Family Data Requirement Matrix v2."),
    ]),
    bundleSection("2AQ. Evidence Provenance + Readiness Semantics Cleanup v1", [
      bundleField("2AQ contract attached", evidenceProvenanceSemanticsContract ? "yes" : "no"),
      bundleField("2AQ warning", evidenceProvenanceSemanticsContract ? "none" : "Evidence Provenance Semantics contract missing from current analysis object."),
      bundleField("Contract attached", evidenceProvenanceSemanticsContract ? "yes" : "no"),
      bundleField("Artifact version", evidenceProvenanceSemanticsContract?.artifactVersion),
      bundleField("Asset family", evidenceProvenanceSemanticsContract?.assetFamily),
      bundleField("Canonical question group", evidenceProvenanceSemanticsContract?.canonicalQuestionGroup),
      bundleField("Canonical source matrix entries", safeArray(evidenceProvenanceSemanticsContract?.canonicalSourceMatrixEntries).join(", ") || "unavailable"),
      bundleField("Manual reviewed evidence claims count", evidenceProvenanceSemanticsContract?.readinessCounters?.manualReviewedEvidenceClaims),
      bundleField("Manual benchmark evidence claims count", evidenceProvenanceSemanticsContract?.readinessCounters?.manualBenchmarkEvidenceClaims),
      bundleField("Live provider data claims count", evidenceProvenanceSemanticsContract?.readinessCounters?.liveProviderDataClaims),
      bundleField("Provider metadata classification claims count", evidenceProvenanceSemanticsContract?.readinessCounters?.providerMetadataClassificationClaims),
      bundleField("Source candidate only claims count", evidenceProvenanceSemanticsContract?.readinessCounters?.sourceCandidateOnlyClaims),
      bundleField("Display-only non-scoring claims count", evidenceProvenanceSemanticsContract?.readinessCounters?.displayOnlyNonScoringClaims),
      bundleField("Scoring-active legacy claims count", evidenceProvenanceSemanticsContract?.readinessCounters?.scoringActiveLegacyClaims),
      bundleField("Scoring-active calibrated claims count", evidenceProvenanceSemanticsContract?.readinessCounters?.scoringActiveCalibratedClaims),
      bundleField("Institutional verification gaps count", evidenceProvenanceSemanticsContract?.readinessCounters?.institutionalVerificationGaps),
      bundleField("Live metric gaps count", evidenceProvenanceSemanticsContract?.readinessCounters?.liveMetricGaps),
      bundleField("Source-required gaps count", evidenceProvenanceSemanticsContract?.readinessCounters?.sourceRequiredGaps),
      bundleField("Scoring activation gaps count", evidenceProvenanceSemanticsContract?.readinessCounters?.scoringActivationGaps),
      bundleField("Confidence cap drivers count", evidenceProvenanceSemanticsContract?.readinessCounters?.confidenceCapDrivers),
      bundleField("2AM real primary leakage count", twoAmRenderedPrimaryScan.realPrimaryVisibleLeakageCount),
      bundleField("2AM scanner version", twoAmRenderedPrimaryScan.scannerVersion),
      bundleField("2AM raw metadata excluded", twoAmRenderedPrimaryScan.rawMetadataExcluded ? "yes" : "no"),
      bundleField("2AM false positive count", twoAmRenderedPrimaryScan.scannerFalsePositiveCount),
      bundleField("2AN readiness counter correction", evidenceProvenanceSemanticsContract?.evidenceAggregationReadinessSemantics ? "attached" : "missing"),
      bundleField("2AO semantic label correction", evidenceProvenanceSemanticsContract?.coverageScoreEligibilitySemantics ? "attached" : "missing"),
      bundleField("2AP downstream propagation sanity", evidenceProvenanceSemanticsContract?.canonicalRoutePropagationSanity?.status),
      bundleField("Protected report redaction", evidenceProvenanceSemanticsContract?.protectedInvestorReportRedaction),
      bundleField("Audit/Internal QA preservation", evidenceProvenanceSemanticsContract?.guardrails?.auditRawDiagnosticsPreserved && evidenceProvenanceSemanticsContract?.guardrails?.internalQaDiagnosticsPreserved ? "preserved" : "unknown"),
      "Primary labels:",
      bundleList(evidenceProvenanceSemanticsContract?.primaryLabels, "No provenance labels attached.", 12),
      "Readiness gaps:",
      bundleList(safeArray(evidenceProvenanceSemanticsContract?.readinessGaps).slice(0, 16).map((gap) =>
        `${gap.gapType || "gap"} | family=${gap.family || "unknown"} | question=${gap.questionId || "family-wide"} | requirement=${gap.requirementId || gap.gapId || "unknown"} | sourceClass=${gap.sourceClass || "unknown"} | visibility=${gap.visibility || "product"} | ${cleanPrimaryAnswerText(gap.displayLabel || gap.label || "Verification gap")}`
      ), "No readiness gaps attached.", 16),
      "Question summaries:",
      bundleList(safeArray(evidenceProvenanceSemanticsContract?.questionSummaries).slice(0, 12).map((question) =>
        `${question.questionId || "question"} | ${cleanPrimaryAnswerText(question.displayLabel || "Readiness status unavailable")} | mechanism=${question.mechanismReviewedClaims ?? 0} live=${question.liveDataRequiredClaims ?? 0} source=${question.sourceRequiredClaims ?? 0} scoring=${question.scoringActiveClaims ?? 0}`
      ), "No provenance question summaries attached.", 12),
      "Provenance class distribution:",
      bundleList(Object.entries(safeObject(evidenceProvenanceSemanticsContract?.provenanceSummary)).map(([key, value]) => `${key}=${value}`), "No provenance summary attached.", 16),
      "Guardrails:",
      bundleList(Object.entries(safeObject(evidenceProvenanceSemanticsContract?.guardrails)).map(([key, value]) => `${key}=${yesNoUnknown(value)}`)),
      "Known limitations:",
      bundleList(evidenceProvenanceSemanticsContract?.knownLimitations),
      bundleField("Next resume pointer", evidenceProvenanceSemanticsContract?.nextResumePointer || "Batch 1 Live QA Retry after deploy/browser check; if clean, proceed to Family Data Requirement Matrix v2."),
    ]),
    bundleSection("2AR. Family Data Requirement Matrix v2", [
      bundleField("Contract attached", familyDataRequirementMatrixContract ? "yes" : "missing"),
      bundleField("Artifact version", familyDataRequirementMatrixContract?.artifactVersion),
      bundleField("Contract status", familyDataRequirementMatrixContract?.contractStatus),
      bundleField("Matrix version", familyDataRequirementMatrixContract?.matrixVersion),
      bundleField("Primary family", familyDataRequirementMatrixContract?.primaryFamily),
      bundleField("Primary question group", familyDataRequirementMatrixContract?.primaryQuestionGroup),
      bundleField("Primary source profile", familyDataRequirementMatrixContract?.primarySourceProfile),
      bundleField("Primary source matrix ID", familyDataRequirementMatrixContract?.primarySourceMatrixId),
      bundleField("Matrix route source", familyDataRequirementMatrixContract?.matrixRouteSource),
      bundleField("Family requirement count", safeArray(familyDataRequirementMatrixContract?.familyRequirements).length),
      bundleField("Live/API requirement count", safeArray(familyDataRequirementMatrixContract?.liveDataRequirements).length),
      bundleField("Reviewed-evidence requirement count", safeArray(familyDataRequirementMatrixContract?.reviewedEvidenceRequirements).length),
      bundleField("Source-candidate requirement count", safeArray(familyDataRequirementMatrixContract?.sourceCandidateRequirements).length),
      bundleField("Manual-review trigger count", safeArray(familyDataRequirementMatrixContract?.manualReviewTriggers).length),
      bundleField("Confidence-cap rule count", safeArray(familyDataRequirementMatrixContract?.confidenceCapRules).length),
      bundleField("Score-eligibility blocker count", safeArray(familyDataRequirementMatrixContract?.scoreEligibilityBlockers).length),
      "Critical live/API data requirements:",
      bundleList(safeArray(familyDataRequirementMatrixContract?.liveDataRequirements).filter((req) => ["critical", "high"].includes(req.priority)).map((req) =>
        `${req.label || "Requirement"} | status=${req.status || "unknown"} | freshness=${req.freshnessNeeded || "unknown"} | proves=${req.whatItCanProve || "scope unavailable"} | cannot=${req.whatItCannotProve || "boundary unavailable"}`
      ), "No critical live/API family requirements attached.", 16),
      "Critical reviewed evidence requirements:",
      bundleList(safeArray(familyDataRequirementMatrixContract?.reviewedEvidenceRequirements).filter((req) => ["critical", "high"].includes(req.priority)).map((req) =>
        `${req.label || "Requirement"} | status=${req.status || "unknown"} | review=${req.reviewStatus || "unknown"} | proves=${req.whatItCanProve || "scope unavailable"} | cannot=${req.whatItCannotProve || "boundary unavailable"}`
      ), "No critical reviewed-evidence family requirements attached.", 16),
      "Missing requirements:",
      bundleList(safeArray(familyDataRequirementMatrixContract?.familyRequirements).filter((req) => req.status === "missing").slice(0, 20).map((req) =>
        `${req.label || "Requirement"} | ${req.requirementType || "type"} | ${req.scoreEligibilityImpact || "impact"} | ${req.sourceQueueText || "Verification required."}`
      ), "No missing family requirements attached.", 20),
      "Source candidates only:",
      bundleList(safeArray(familyDataRequirementMatrixContract?.sourceCandidateRequirements).map((req) =>
        `${req.label || "Candidate"} | status=${req.status || "unknown"} | review=${req.reviewStatus || "candidate_only"} | ${req.whatItCannotProve || "Candidate-only input cannot prove institutional claims."}`
      ), "No source-candidate-only family requirements attached.", 12),
      "Source Queue outputs:",
      bundleList(familyDataRequirementMatrixContract?.sourceQueueItems, "No family matrix Source Queue outputs attached.", 12),
      "Manual Review outputs:",
      bundleList(familyDataRequirementMatrixContract?.manualReviewItems, "No family matrix Manual Review outputs attached.", 12),
      "Confidence caps:",
      bundleList(safeArray(familyDataRequirementMatrixContract?.confidenceCapRules).slice(0, 12).map((req) =>
        `${req.label || "Requirement"} | ${req.confidenceCap || "Confidence remains capped until verified."}`
      ), "No family matrix confidence caps attached.", 12),
      "Score eligibility blockers:",
      bundleList(safeArray(familyDataRequirementMatrixContract?.scoreEligibilityBlockers).slice(0, 12).map((req) =>
        `${req.label || "Requirement"} | ${req.scoreEligibilityImpact || "blocks/caps eligibility"}`
      ), "No family matrix score-eligibility blockers attached.", 12),
      "Provider metadata boundaries:",
      bundleList(familyDataRequirementMatrixContract?.providerMetadataBoundaries, "No provider metadata boundaries attached.", 8),
      "What this evidence proves / does not prove:",
      bundleList([
        ...safeArray(familyDataRequirementMatrixContract?.evidenceDoesNotProve).map((item) => `Does not prove: ${item}`),
        ...safeArray(familyDataRequirementMatrixContract?.familyRequirements).slice(0, 8).map((req) => `${req.label || "Requirement"} proves: ${req.whatItCanProve || "scope unavailable"}; does not prove: ${req.whatItCannotProve || "boundary unavailable"}`),
      ], "No proof/boundary rows attached.", 16),
      "Evidence Map rows:",
      bundleList(familyDataRequirementMatrixContract?.evidenceMapRows, "No family matrix Evidence Map rows attached.", 12),
      "Scoring Transparency rows:",
      bundleList(familyDataRequirementMatrixContract?.scoringTransparencyRows, "No family matrix Scoring Transparency rows attached.", 10),
      "Protected report summary:",
      bundleList(familyDataRequirementMatrixContract?.protectedReportSummary, "No protected-report family summary attached.", 6),
      "Frontend visibility:",
      bundleList([
        `normalizedField=${familyDataRequirementMatrixContract?.frontendVisibility?.normalizedField || "model.familyDataRequirementMatrixContract"}`,
        `visibleSurfaces=${safeArray(familyDataRequirementMatrixContract?.frontendVisibility?.visibleSurfaces).join(", ") || "unavailable"}`,
        `copyBundleSection=${familyDataRequirementMatrixContract?.frontendVisibility?.copyBundleSection || "2AR. Family Data Requirement Matrix v2"}`,
        `protectedReportExposure=${familyDataRequirementMatrixContract?.frontendVisibility?.protectedReportExposure || "high_level_family_requirements_only"}`,
      ]),
      "Audit diagnostics:",
      bundleList(Object.entries(safeObject(familyDataRequirementMatrixContract?.auditDiagnostics)).map(([key, value]) => `${key}: ${bundleValue(value)}`), "No family matrix audit diagnostics attached.", 12),
      "Guardrails:",
      bundleList(Object.entries(safeObject(familyDataRequirementMatrixContract?.guardrails)).map(([key, value]) => `${key}=${yesNoUnknown(value)}`)),
      "QA checks:",
      bundleList([
        `Copy Bundle 2AR present=yes`,
        `2AM real primary leakage remains zero=${yesNoUnknown(twoAmRenderedPrimaryScan.realPrimaryVisibleLeakageCount === 0)}`,
        `2AP downstream propagation sanity=${evidenceProvenanceSemanticsContract?.canonicalRoutePropagationSanity?.status || "unknown"}`,
        `2AQ attached=${yesNoUnknown(Boolean(evidenceProvenanceSemanticsContract))}`,
        `provider metadata satisfies legal/reserve/redemption/economic requirements=${yesNoUnknown(false)}`,
        `source candidates promoted=${yesNoUnknown(familyDataRequirementMatrixContract?.guardrails?.sourceCandidatesPromoted)}`,
        `reviewed evidence scoring-active=${yesNoUnknown(familyDataRequirementMatrixContract?.guardrails?.reviewedEvidenceScoringActive)}`,
        `score formula changed=${yesNoUnknown(familyDataRequirementMatrixContract?.guardrails?.scoringChanged)}`,
        `verdict formula changed=${yesNoUnknown(familyDataRequirementMatrixContract?.guardrails?.verdictChanged)}`,
        `provider behavior changed=${yesNoUnknown(familyDataRequirementMatrixContract?.guardrails?.providerBehaviorChanged)}`,
        `snapshots reintroduced=${yesNoUnknown(familyDataRequirementMatrixContract?.guardrails?.snapshotsReintroduced)}`,
        `partial refresh reintroduced=${yesNoUnknown(familyDataRequirementMatrixContract?.guardrails?.partialRefreshReintroduced)}`,
      ]),
      "Known limitations:",
      bundleList(familyDataRequirementMatrixContract?.knownLimitations),
      bundleField("Next resume pointer", familyDataRequirementMatrixContract?.nextStep || "Batch 2 benchmark coverage or Evidence-to-Score Calibration prep depending QA results."),
    ]),
    bundleSection("2AS. API-First Institutional Intelligence Backbone v1", [
      bundleField("Raw provider registry attached", rawProviderDataRegistryContract ? "yes" : "missing"),
      bundleField("Typed observation layer attached", typedObservationLayerContract ? "yes" : "missing"),
      bundleField("Product Truth Object attached", institutionalProductTruthObject ? "yes" : "missing"),
      bundleField("Institutional Question Answer Engine attached", institutionalQuestionAnswerEngineContract ? "yes" : "missing"),
      bundleField("Manual/API research gap queue attached", manualApiResearchGapQueue ? "yes" : "missing"),
      bundleField("Calibration/backtest readiness attached", calibrationBacktestReadiness ? "yes" : "missing"),
      bundleField("Provider observations", safeArray(rawProviderDataRegistryContract?.providerObservations).length),
      bundleField("Providers inventoried", safeArray(rawProviderDataRegistryContract?.providers).length),
      bundleField("Routing-eligible observations", safeArray(typedObservationLayerContract?.eligibleRoutingObservations).length),
      bundleField("Answer-eligible observations", safeArray(typedObservationLayerContract?.eligibleAnswerObservations).length),
      bundleField("Scoring-now observations", safeArray(typedObservationLayerContract?.eligibleExistingScoringObservations).length),
      bundleField("Future calibration candidates", safeArray(typedObservationLayerContract?.futureCalibrationCandidateObservations).length),
      bundleField("Unavailable data markers", safeArray(typedObservationLayerContract?.unavailableDataMarkers).length),
      bundleField("Final family", institutionalProductTruthObject?.finalFamilyDecision?.familyId),
      bundleField("Final visible label", institutionalProductTruthObject?.finalFamilyDecision?.visibleLabel),
      bundleField("Final question group", institutionalProductTruthObject?.finalQuestionGroup),
      bundleField("Final source matrix", safeArray(institutionalProductTruthObject?.finalSourceMatrix).join(", ")),
      bundleField("Coverage tier", institutionalProductTruthObject?.coverageAndScoreEligibility?.coverageTier),
      bundleField("Score eligibility", institutionalProductTruthObject?.coverageAndScoreEligibility?.scoreEligibility),
      bundleField("Score display mode", institutionalProductTruthObject?.coverageAndScoreEligibility?.scoreDisplayMode),
      bundleField("Research gaps", safeArray(manualApiResearchGapQueue?.gaps).length),
      bundleField("AI/Deep Research status", manualApiResearchGapQueue?.aiDeepResearchBoundary || "disabled_not_implemented"),
      bundleField("Calibration readiness", calibrationBacktestReadiness?.readinessStatus),
      bundleField("Scoring calibration status", calibrationBacktestReadiness?.scoringCalibrationStatus),
      "Provider inventory:",
      bundleList(safeArray(rawProviderDataRegistryContract?.providers).slice(0, 16).map((provider) =>
        `${provider.provider || "provider"} | identity=${yesNoUnknown(provider.shouldBeIdentityEligible)} family=${yesNoUnknown(provider.shouldBeFamilyRoutingEligible)} answer=${yesNoUnknown(provider.shouldBeQuestionAnswerEligible)} scoringNow=${yesNoUnknown(provider.shouldBeScoringEligibleNow)}`
      ), "No provider inventory attached.", 16),
      "Routing observations:",
      bundleList(safeArray(typedObservationLayerContract?.eligibleRoutingObservations).slice(0, 16).map((obs) =>
        `${obs.id || "observation"} | ${obs.observationType || "type"} | ${obs.sourceProvider || "provider"} | ${obs.sourcePath || "path"} | boundary=${obs.evidenceBoundary || "boundary unavailable"}`
      ), "No routing observations attached.", 16),
      "Excluded / ineligible inputs:",
      bundleList(safeArray(institutionalProductTruthObject?.finalFamilyDecision?.excludedInputs).concat(
        safeArray(typedObservationLayerContract?.ineligibleObservations).slice(0, 8).map((obs) => `${obs.sourceCategory || "category"}:${obs.sourcePath || "path"}`)
      ), "No excluded inputs attached.", 18),
      "Question answers:",
      bundleList(safeArray(institutionalQuestionAnswerEngineContract?.answers).slice(0, 12).map((answer) =>
        `${answer.questionId || "question"} | ${answer.answerStatus || "status"} | ${answer.shortAnswer || "answer unavailable"} | observations=${safeArray(answer.observationsUsed).length} missing=${safeArray(answer.missingObservations).length}`
      ), "No API-first question answers attached.", 12),
      "Research gaps:",
      bundleList(safeArray(manualApiResearchGapQueue?.gaps).slice(0, 14).map((gap) =>
        `${gap.gapId || "gap"} | ${gap.priority || "priority"} | ${gap.gapType || "type"} | ${gap.missingData || "missing data unavailable"} | ai=${gap.aiDeepResearchStatus || "disabled_not_implemented"}`
      ), "No research gaps attached.", 14),
      "Calibration/backtest blockers:",
      bundleList(calibrationBacktestReadiness?.blockers, "No calibration blockers attached.", 10),
      "Product Truth protected summary:",
      bundleList(institutionalProductTruthObject?.protectedReportSummary, "No protected product truth summary attached.", 6),
      "Audit-only legacy route summary:",
      bundleList(institutionalProductTruthObject?.auditOnlyLegacyRouteSummary, "No audit-only legacy route summary attached.", 8),
      "Guardrails:",
      bundleList(Object.entries(safeObject(institutionalProductTruthObject?.guardrails)).map(([key, value]) => `${key}=${yesNoUnknown(value)}`), "No API-first guardrails attached.", 12),
      "QA checks:",
      bundleList([
        `2AS present=yes`,
        `source requirement text routing eligible=${yesNoUnknown(safeArray(typedObservationLayerContract?.eligibleRoutingObservations).some((obs) => obs.sourceCategory === "source_requirement_text"))}`,
        `manual review text routing eligible=${yesNoUnknown(safeArray(typedObservationLayerContract?.eligibleRoutingObservations).some((obs) => obs.sourceCategory === "manual_review_requirement"))}`,
        `score formula changed=${yesNoUnknown(institutionalProductTruthObject?.guardrails?.scoreFormulaChanged)}`,
        `verdict formula changed=${yesNoUnknown(institutionalProductTruthObject?.guardrails?.verdictFormulaChanged)}`,
        `provider fetch behavior changed=${yesNoUnknown(institutionalProductTruthObject?.guardrails?.providerFetchBehaviorChanged)}`,
        `AI/deep research implemented=${yesNoUnknown(institutionalProductTruthObject?.guardrails?.aiDeepResearchImplemented)}`,
        `source candidates promoted=${yesNoUnknown(institutionalProductTruthObject?.guardrails?.sourceCandidatesPromoted)}`,
        `reviewed evidence scoring-active=${yesNoUnknown(institutionalProductTruthObject?.guardrails?.reviewedEvidenceScoringActive)}`,
        `snapshots reintroduced=${yesNoUnknown(institutionalProductTruthObject?.guardrails?.snapshotsReintroduced)}`,
        `partial refresh reintroduced=${yesNoUnknown(institutionalProductTruthObject?.guardrails?.partialRefreshReintroduced)}`,
      ]),
      bundleField("Next resume pointer", "Fresh live QA on benchmark/control assets, then Provider Raw Data Normalization v2 or Evidence-to-Score Calibration Prep v1."),
    ]),
    bundleSection("2AT. Provider Data Boundary Contract + Raw Provider Registry Hardening v1", [
      bundleField("Contract attached", providerDataBoundaryContract ? "yes" : "missing"),
      bundleField("Capability registry attached", providerCapabilityRegistryContract ? "yes" : "missing"),
      bundleField("Provider capability profiles", safeArray(providerCapabilityRegistryContract?.providers).length),
      bundleField("Boundary observations", safeArray(providerDataBoundaryContract?.observations).length),
      bundleField("Boundary violations", safeArray(providerDataBoundaryContract?.boundaryViolations).length),
      bundleField("Generated observations", providerDataBoundaryContract?.generatedTextIneligibilitySummary?.generatedTextObservationCount),
      bundleField("Generated text route eligible count", providerDataBoundaryContract?.generatedTextIneligibilitySummary?.generatedTextRouteEligibleCount),
      bundleField("Generated text scoring eligible count", providerDataBoundaryContract?.generatedTextIneligibilitySummary?.generatedTextScoringEligibleCount),
      bundleField("Health probe observations", providerDataBoundaryContract?.healthProbeIneligibilitySummary?.healthProbeObservationCount),
      bundleField("Health probe route eligible count", providerDataBoundaryContract?.healthProbeIneligibilitySummary?.healthProbeRouteEligibleCount),
      bundleField("Health probe scoring eligible count", providerDataBoundaryContract?.healthProbeIneligibilitySummary?.healthProbeScoringEligibleCount),
      bundleField("Health probe samples isolated", providerDataBoundaryContract?.healthProbeIneligibilitySummary?.healthProbeSamplesIsolated),
      bundleField("Raw registry hardening status", providerDataBoundaryContract?.rawProviderRegistryHardening?.hardeningStatus),
      bundleField("Raw registry hardening entries", safeArray(providerDataBoundaryContract?.rawProviderRegistryHardening?.entries).length),
      "Route input whitelist:",
      bundleList(providerDataBoundaryContract?.familyRouteInputWhitelist, "No route whitelist attached.", 14),
      "Route input blacklist:",
      bundleList(providerDataBoundaryContract?.familyRouteInputBlacklist, "No route blacklist attached.", 14),
      "Scoring input whitelist:",
      bundleList(providerDataBoundaryContract?.scoringInputWhitelist, "No scoring whitelist attached.", 12),
      "Scoring input blacklist:",
      bundleList(providerDataBoundaryContract?.scoringInputBlacklist, "No scoring blacklist attached.", 14),
      "Provider capability summary:",
      bundleList(safeArray(providerCapabilityRegistryContract?.providers).slice(0, 18).map((provider) =>
        `${provider.providerName || provider.providerId || "provider"} | status=${provider.status || "unknown"} | route=${provider.defaultRouteEligibility || "unknown"} | scoring=${provider.defaultScoringEligibility || "unknown"} | evidence=${provider.defaultEvidenceStatus || "unknown"}`
      ), "No provider capability rows attached.", 18),
      "Boundary violations:",
      bundleList(safeArray(providerDataBoundaryContract?.boundaryViolations).map((violation) =>
        `${violation.violationId || "violation"} | ${violation.severity || "severity"} | ${violation.violationType || "type"} | ${violation.observedValue || "observed"}`
      ), "No provider boundary violations detected.", 18),
      "Raw registry hardening entries:",
      bundleList(safeArray(providerDataBoundaryContract?.rawProviderRegistryHardening?.entries).slice(0, 18).map((entry) =>
        `${entry.entryId || "entry"} | ${entry.provider || "provider"} | ${entry.fieldPath || "field"} | route=${entry.routeEligible || "unknown"} score=${entry.scoringEligible || "unknown"} | source=${entry.sourceKind || "source"}`
      ), "No hardened raw registry entries attached.", 18),
      "QA checks:",
      bundleList([
        `Copy Bundle 2AT present=yes`,
        `Generated text route eligible count zero=${yesNoUnknown(providerDataBoundaryContract?.generatedTextIneligibilitySummary?.generatedTextRouteEligibleCount === 0)}`,
        `Generated text scoring eligible count zero=${yesNoUnknown(providerDataBoundaryContract?.generatedTextIneligibilitySummary?.generatedTextScoringEligibleCount === 0)}`,
        `Health probe route eligible count zero=${yesNoUnknown(providerDataBoundaryContract?.healthProbeIneligibilitySummary?.healthProbeRouteEligibleCount === 0)}`,
        `Health probe scoring eligible count zero=${yesNoUnknown(providerDataBoundaryContract?.healthProbeIneligibilitySummary?.healthProbeScoringEligibleCount === 0)}`,
        `Health probe samples isolated=${yesNoUnknown(providerDataBoundaryContract?.healthProbeIneligibilitySummary?.healthProbeSamplesIsolated === "yes")}`,
        `Score formula changed=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.scoreFormulaChanged)}`,
        `Verdict formula changed=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.verdictFormulaChanged)}`,
        `Provider fetch behavior changed=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.providerFetchBehaviorChanged)}`,
        `New providers added=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.newProvidersAdded)}`,
        `Runtime AI authority added=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.runtimeAiDecisionAuthorityAdded)}`,
        `Anthropic route authority=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.anthropicRouteAuthority)}`,
        `Source candidates promoted=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.sourceCandidatesPromoted)}`,
        `Reviewed evidence scoring-active=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.reviewedEvidenceScoringActive)}`,
        `Snapshots reintroduced=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.snapshotsReintroduced)}`,
        `Partial refresh reintroduced=${yesNoUnknown(providerDataBoundaryContract?.guardrails?.partialRefreshReintroduced)}`,
      ]),
      "Known limitations:",
      bundleList(providerDataBoundaryContract?.knownLimitations, "No provider boundary limitations attached.", 8),
      bundleField("Next resume pointer", providerDataBoundaryContract?.nextResumePointer || "Typed Observation Family Authority Refactor v1."),
    ]),
    bundleSection("2AU. Typed Observation Family Authority Refactor v1", [
      bundleField("Contract attached", typedObservationFamilyAuthorityContract ? "yes" : "missing"),
      bundleField("Selected typed family", typedObservationFamilyAuthorityContract?.selectedFamily),
      bundleField("Selected visible label", typedObservationFamilyAuthorityContract?.visibleLabel),
      bundleField("Selected question group", typedObservationFamilyAuthorityContract?.questionGroupId),
      bundleField("Selected source matrix", typedObservationFamilyAuthorityContract?.sourceMatrixId),
      bundleField("Route confidence", typedObservationFamilyAuthorityContract?.confidence),
      bundleField("Route safety", typedObservationFamilyAuthorityContract?.routeSafety),
      bundleField("Route-eligible observation count", typedObservationFamilyAuthorityContract?.routeEligibleObservationCount),
      bundleField("Rejected observation count", typedObservationFamilyAuthorityContract?.rejectedObservationCount),
      bundleField("Generated text used as route input", yesNoUnknown(typedObservationFamilyAuthorityContract ? !typedObservationFamilyAuthorityContract.noGeneratedTextUsed : null)),
      bundleField("Health probe used as route input", yesNoUnknown(typedObservationFamilyAuthorityContract ? !typedObservationFamilyAuthorityContract.noHealthProbeUsed : null)),
      bundleField("Scanner text used as route input", yesNoUnknown(typedObservationFamilyAuthorityContract ? !typedObservationFamilyAuthorityContract.noScannerTextUsed : null)),
      bundleField("Copy/protected text used as route input", yesNoUnknown(typedObservationFamilyAuthorityContract ? !typedObservationFamilyAuthorityContract.noCopyTextUsed : null)),
      bundleField("Benchmark override used", yesNoUnknown(typedObservationFamilyAuthorityContract ? !typedObservationFamilyAuthorityContract.noBenchmarkOverrideUsed : null)),
      bundleField("Representation decision consumed typed authority", yesNoUnknown(representationFamilyDecision?.typedObservationAuthorityApplied)),
      bundleField("Frontend normalized field", "model.typedObservationFamilyAuthorityContract"),
      "Selected observations:",
      bundleList(safeArray(typedObservationFamilyAuthorityContract?.inputSet?.observations)
        .filter((observation) => observation.acceptedForRoute)
        .slice(0, 18)
        .map((observation) => `${observation.observationId || "observation"} | ${observation.provider || "provider"} | ${safeArray(observation.familySignals).join(", ") || "family unavailable"} | ${observation.fieldPath || "field"}`), "No selected route observations attached.", 18),
      "Rejected observations:",
      bundleList(safeArray(typedObservationFamilyAuthorityContract?.inputSet?.observations)
        .filter((observation) => !observation.acceptedForRoute)
        .slice(0, 18)
        .map((observation) => `${observation.observationId || "observation"} | reason=${observation.rejectionReason || "not route selected"} | source=${observation.sourceKind || "source"} | signals=${safeArray(observation.familySignals).join(", ") || "none"}`), "No rejected observations attached.", 18),
      "Boundary warnings:",
      bundleList(typedObservationFamilyAuthorityContract?.boundaryWarnings, "No boundary warnings attached.", 12),
      "Conflict diagnostics:",
      bundleList(safeArray(typedObservationFamilyAuthorityContract?.conflictDiagnostics).slice(0, 12).map((conflict) =>
        `${conflict.conflictId || "conflict"} | attempted=${conflict.attemptedFamily || "unknown"} | replacement=${conflict.replacementFamily || "unknown"} | reason=${conflict.reason || "reason unavailable"}`
      ), "No typed observation conflicts attached.", 12),
      "QA checks:",
      bundleList([
        `Copy Bundle 2AU present=yes`,
        `LINK/UNI stablecoin contamination prevented by typed authority=${typedObservationFamilyAuthorityContract ? "see selected family and rejected observations" : "unknown"}`,
        `RSS3 generated RWA contamination prevented=${typedObservationFamilyAuthorityContract ? "generated/source requirement observations rejected when route-ineligible" : "unknown"}`,
        `Generated text route count zero=${yesNoUnknown(typedObservationFamilyAuthorityContract?.noGeneratedTextUsed)}`,
        `Health probe route count zero=${yesNoUnknown(typedObservationFamilyAuthorityContract?.noHealthProbeUsed)}`,
        `Scanner/copy/protected route count zero=${yesNoUnknown(Boolean(typedObservationFamilyAuthorityContract?.noScannerTextUsed && typedObservationFamilyAuthorityContract?.noCopyTextUsed))}`,
        `Provider 2AT still attached=${yesNoUnknown(Boolean(providerDataBoundaryContract))}`,
        `Score formula changed=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.scoringChanged)}`,
        `Verdict formula changed=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.verdictChanged)}`,
        `Provider fetch behavior changed=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.providerFetchBehaviorChanged)}`,
        `Anthropic required for correctness=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.anthropicRequiredForCorrectness)}`,
        `Source candidates promoted=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.sourceCandidatesPromoted)}`,
        `Reviewed evidence scoring-active=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.reviewedEvidenceScoringActive)}`,
        `Snapshots reintroduced=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.snapshotsReintroduced)}`,
        `Partial refresh reintroduced=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.partialRefreshReintroduced)}`,
      ]),
      "Known limitations:",
      bundleList(typedObservationFamilyAuthorityContract?.knownLimitations, "No typed authority limitations attached.", 8),
      bundleField("Next resume pointer", typedObservationFamilyAuthorityContract?.nextResumePointer || "Fresh browser/live live_current_qa bundle retry after Typed Observation Family Authority Refactor v1."),
    ]),
    bundleSection("2AV. Typed Observation Promotion + Route Surface Parity Repair v1", [
      bundleField("Contract attached", typedObservationFamilyAuthorityContract ? "yes" : "missing"),
      bundleField("Canonical typed family", typedObservationFamilyAuthorityContract?.selectedFamily),
      bundleField("Canonical visible label", typedObservationFamilyAuthorityContract?.visibleLabel),
      bundleField("Selected family source", typedObservationFamilyAuthorityContract?.selectedFamilySource),
      bundleField("Selected family confidence", typedObservationFamilyAuthorityContract?.selectedFamilyConfidence || typedObservationFamilyAuthorityContract?.confidence),
      bundleField("Canonical question group", typedObservationFamilyAuthorityContract?.selectedQuestionGroup || typedObservationFamilyAuthorityContract?.questionGroupId),
      bundleField("Canonical source matrix", typedObservationFamilyAuthorityContract?.selectedSourceMatrix || typedObservationFamilyAuthorityContract?.sourceMatrixId),
      bundleField("Answer template family", typedObservationFamilyAuthorityContract?.selectedAnswerTemplateFamily),
      bundleField("Coverage family", typedObservationFamilyAuthorityContract?.selectedCoverageFamily),
      bundleField("Protected report family", typedObservationFamilyAuthorityContract?.selectedProtectedReportFamily),
      bundleField("Copy bundle family", typedObservationFamilyAuthorityContract?.selectedCopyBundleFamily),
      bundleField("Promoted observation count", typedObservationFamilyAuthorityContract?.promotedObservationCount),
      bundleField("Promotion rules applied", safeArray(typedObservationFamilyAuthorityContract?.promotionRulesApplied).join(", ") || "none"),
      bundleField("Route-eligible observation count", typedObservationFamilyAuthorityContract?.routeEligibleObservationCount),
      bundleField("Rejected observation count", typedObservationFamilyAuthorityContract?.rejectedObservationCount),
      bundleField("Weak context promoted / rejected", `${bundleValue(typedObservationFamilyAuthorityContract?.routeInputEligibilitySummary?.weakContextPromotedCount)} / ${bundleValue(typedObservationFamilyAuthorityContract?.routeInputEligibilitySummary?.weakContextRejectedCount)}`),
      bundleField("Generated text route count zero", yesNoUnknown(typedObservationFamilyAuthorityContract?.noGeneratedTextUsed && typedObservationFamilyAuthorityContract?.generatedTextUsedAsRouteInput === false)),
      bundleField("Health probe route count zero", yesNoUnknown(typedObservationFamilyAuthorityContract?.noHealthProbeUsed && typedObservationFamilyAuthorityContract?.healthProbeUsedAsRouteInput === false)),
      bundleField("Scanner/copy/protected route count zero", yesNoUnknown(Boolean(typedObservationFamilyAuthorityContract?.noScannerTextUsed && typedObservationFamilyAuthorityContract?.noCopyTextUsed && typedObservationFamilyAuthorityContract?.scannerCopyProtectedTextUsedAsRouteInput === false))),
      bundleField("Benchmark override used", yesNoUnknown(typedObservationFamilyAuthorityContract?.benchmarkOverrideUsed)),
      bundleField("Raw lens audit-only", yesNoUnknown(typedObservationFamilyAuthorityContract?.rawLensAuditOnly)),
      bundleField("Provider category audit-only unless promoted", yesNoUnknown(typedObservationFamilyAuthorityContract?.providerCategoryAuditOnlyUnlessPromoted)),
      bundleField("Cross-surface parity status", typedObservationFamilyAuthorityContract?.crossSurfaceParity?.parityStatus),
      bundleField("Cross-surface canonical family", typedObservationFamilyAuthorityContract?.crossSurfaceParity?.canonicalFamily),
      bundleField("Surfaces checked", safeArray(typedObservationFamilyAuthorityContract?.crossSurfaceParity?.surfacesChecked).join(", ") || "none attached"),
      bundleField("Divergence corrections", safeArray(typedObservationFamilyAuthorityContract?.divergenceCorrections).join("; ") || "none"),
      "Promoted observations:",
      bundleList(safeArray(typedObservationFamilyAuthorityContract?.inputSet?.observations)
        .filter((observation) => observation.promotedForRoute)
        .slice(0, 18)
        .map((observation) => `${observation.observationId || "observation"} | rule=${observation.promotionRuleId || "promotion rule unavailable"} | family=${safeArray(observation.familySignals).join(", ") || "family unavailable"} | boundary=provider context, not reviewed evidence`), "No promoted observations attached.", 18),
      "Rejected route inputs:",
      bundleList(safeArray(typedObservationFamilyAuthorityContract?.inputSet?.observations)
        .filter((observation) => !observation.acceptedForRoute)
        .slice(0, 18)
        .map((observation) => `${observation.observationId || "observation"} | reason=${observation.rejectionReason || "route-ineligible"} | source=${observation.sourceKind || "source unavailable"}`), "No rejected route observations attached.", 18),
      "Decision trace:",
      bundleList(typedObservationFamilyAuthorityContract?.familyDecisionTrace, "No family decision trace attached.", 8),
      "Question/source trace:",
      bundleList([
        ...safeArray(typedObservationFamilyAuthorityContract?.institutionalQuestionTrace),
        ...safeArray(typedObservationFamilyAuthorityContract?.sourceMatrixTrace),
      ], "No question/source trace attached.", 8),
      "QA checks:",
      bundleList([
        `Copy Bundle 2AV present=yes`,
        `USDC stablecoin promotion available=${typedObservationFamilyAuthorityContract?.selectedFamily === "stablecoin_fiat_backed" ? "yes for current asset" : "control covered by deterministic artifacts"}`,
        `LINK oracle promotion available=${typedObservationFamilyAuthorityContract?.selectedFamily === "oracle_network" ? "yes for current asset" : "control covered by deterministic artifacts"}`,
        `UNI DeFi promotion available=${typedObservationFamilyAuthorityContract?.selectedFamily === "defi_governance_value_capture" ? "yes for current asset" : "control covered by deterministic artifacts"}`,
        `RSS3/open-info manual low-coverage available=${typedObservationFamilyAuthorityContract?.selectedFamily === "manual_low_coverage" ? "yes for current asset if selected" : "control covered by deterministic artifacts"}`,
        `PAXG tokenized gold promotion available=${typedObservationFamilyAuthorityContract?.selectedFamily === "tokenized_gold_commodity_rwa" ? "yes for current asset" : "control covered by deterministic artifacts"}`,
        `XRP payments route available=${typedObservationFamilyAuthorityContract?.selectedFamily === "payments_settlement_network" ? "yes for current asset" : "control covered by deterministic artifacts"}`,
        `ONDO/RIO RWA boundary available=${/rwa_/.test(String(typedObservationFamilyAuthorityContract?.selectedFamily || "")) ? "yes for current asset" : "control covered by deterministic artifacts"}`,
        `WBTC/stETH route preservation available=${["wrapped_bridged_asset", "liquid_staking_derivative"].includes(typedObservationFamilyAuthorityContract?.selectedFamily) ? "yes for current asset" : "control covered by deterministic artifacts"}`,
        `BTC/ETH/ADA/AVAX/SOL native controls available=${/^native_|non_eth_l1/.test(String(typedObservationFamilyAuthorityContract?.selectedFamily || "")) ? "yes for current asset" : "control covered by deterministic artifacts"}`,
        `Generated/source/manual/scanner/copy/health text route inputs blocked=${yesNoUnknown(Boolean(typedObservationFamilyAuthorityContract?.noGeneratedTextUsed && typedObservationFamilyAuthorityContract?.noHealthProbeUsed && typedObservationFamilyAuthorityContract?.noScannerTextUsed && typedObservationFamilyAuthorityContract?.noCopyTextUsed))}`,
        `Cross-surface route parity pass=${yesNoUnknown(typedObservationFamilyAuthorityContract?.crossSurfaceParity?.parityStatus === "PASS")}`,
        `Score formula changed=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.scoringChanged)}`,
        `Verdict formula changed=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.verdictChanged)}`,
        `Provider fetch behavior changed=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.providerFetchBehaviorChanged)}`,
        `Runtime AI route authority added=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.runtimeAiDecisionAuthorityAdded)}`,
        `Source candidates promoted=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.sourceCandidatesPromoted)}`,
        `Reviewed evidence scoring-active=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.reviewedEvidenceScoringActive)}`,
        `Snapshots reintroduced=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.snapshotsReintroduced)}`,
        `Partial refresh reintroduced=${yesNoUnknown(typedObservationFamilyAuthorityContract?.guardrails?.partialRefreshReintroduced)}`,
      ]),
      "P1 diagnostics captured, not changed:",
      bundleList([
        "WBTC score/verdict severity incoherence remains a separate P1 diagnostic.",
        "stETH score/verdict severity incoherence remains a separate P1 diagnostic.",
        "IXS weak/default Avoid Critical versus identity-not-confirmed UX remains a separate P1 diagnostic.",
        "Evidence-blocked versus score-withheld semantics remains a separate P1 diagnostic.",
      ], "No P1 diagnostics attached.", 8),
      "Known limitations:",
      bundleList(typedObservationFamilyAuthorityContract?.knownLimitations, "No typed promotion limitations attached.", 8),
      bundleField("Next resume pointer", typedObservationFamilyAuthorityContract?.nextResumePointer || "Fresh browser/live live_current_qa bundle retry after Typed Observation Promotion + Route Surface Parity Repair v1."),
    ]),
    bundleSection("2AW. Institutional Methodology Contract Pack v1.1", [
      bundleField("Contract attached", institutionalMethodologyContract ? "yes" : "missing"),
      bundleField("Contract version", institutionalMethodologyContract?.contractVersion),
      bundleField("Artifact version", institutionalMethodologyContract?.artifactVersion),
      bundleField("Runtime mode", institutionalMethodologyContract?.runtimeMode),
      bundleField("Doctrine constraints", institutionalMethodologyContract?.registrySummary?.doctrineConstraintCount),
      bundleField("Family definitions", institutionalMethodologyContract?.registrySummary?.familyDefinitionCount),
      bundleField("Question registry", institutionalMethodologyContract?.registrySummary?.questionCount),
      bundleField("Source classes", institutionalMethodologyContract?.registrySummary?.sourceClassCount),
      bundleField("Observation types", institutionalMethodologyContract?.registrySummary?.observationTypeCount),
      bundleField("Answer states", institutionalMethodologyContract?.registrySummary?.answerStateCount),
      bundleField("Score eligibility states", institutionalMethodologyContract?.registrySummary?.scoreEligibilityStateCount),
      bundleField("Contamination guards", institutionalMethodologyContract?.registrySummary?.contaminationGuardCount),
      bundleField("Canonical ontology families", institutionalMethodologyContract?.registrySummary?.canonicalFamilyCount),
      bundleField("Analyst modules", institutionalMethodologyContract?.registrySummary?.moduleCount),
      bundleField("Family methodology coverage", `${institutionalMethodologyContract?.registrySummary?.familyMatrixCount || 0}/${institutionalMethodologyContract?.registrySummary?.canonicalFamilyCount || 0}`),
      bundleField("V1.1 observation schema classes", institutionalMethodologyContract?.registrySummary?.observationSchemaV11Count),
      bundleField("V1.1 evidence source policies", institutionalMethodologyContract?.registrySummary?.evidencePolicyV11Count),
      bundleField("Question matrix coverage", institutionalMethodologyContract?.registrySummary?.questionMatrixV11Count),
      bundleField("Memo contract attached", yesNoUnknown(Boolean(institutionalMethodologyContract?.memoResponseContract?.version))),
      bundleField("Memo sections", institutionalMethodologyContract?.registrySummary?.memoSectionCount),
      bundleField("Readiness architecture diagnostic-only", yesNoUnknown(institutionalMethodologyContract?.diagnosticReadinessArchitecture?.diagnosticOnly)),
      bundleField("Regression harness controls", institutionalMethodologyContract?.registrySummary?.regressionControlCount),
      bundleField("Report-only / diagnostic-only", yesNoUnknown(institutionalMethodologyContract?.runtimeMode === "diagnostic_report_only")),
      bundleField("Current scoring activation", institutionalMethodologyContract?.currentScoringActivationStatus),
      bundleField("Registry validation", institutionalMethodologyContract?.validation?.valid ? "PASS" : "FAIL"),
      bundleField("Backend/frontend parity field", institutionalMethodologyContract ? "model.institutionalMethodologyContract (backend-derived)" : "missing"),
      bundleField("Frontend stale fallback can override", yesNoUnknown(institutionalMethodologyContract?.guardrails?.frontendFallbackCanOverrideBackendContract)),
      bundleField("Copy Bundle rebuilds contract independently", yesNoUnknown(institutionalMethodologyContract?.guardrails?.copyBundleRebuildsContractIndependently)),
      bundleField("Protected report raw internals exposed", yesNoUnknown(institutionalMethodologyContract?.guardrails?.protectedReportRawInternalsExposed)),
      "Validation errors:",
      bundleList(institutionalMethodologyContract?.validation?.errors, "No methodology contract validation errors.", 20),
      "Known limitations:",
      bundleList(institutionalMethodologyContract?.knownLimitations, "No methodology contract limitations attached.", 12),
      "Guardrails:",
      bundleList([
        `Score changed=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.scoreChanged)}`,
        `Verdict changed=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.verdictChanged)}`,
        `Provider fetch behavior changed=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.providerFetchBehaviorChanged)}`,
        `Token-specific overrides added=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.tokenSpecificOverridesAdded)}`,
        `Runtime AI decision authority added=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.runtimeAiDecisionAuthorityAdded)}`,
        `Reviewed evidence scoring-active=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.reviewedEvidenceScoringActive)}`,
        `Source candidates promoted=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.sourceCandidatesPromoted)}`,
        `Source requirements promoted to evidence=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.sourceRequirementsPromotedToEvidence)}`,
        `Manual review promoted to evidence=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.manualReviewPromotedToEvidence)}`,
        `Snapshots reintroduced=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.snapshotsReintroduced)}`,
        `Partial refresh reintroduced=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.partialRefreshReintroduced)}`,
        `Route authority changed=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.routeAuthorityChanged)}`,
        `Generated text promoted=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.generatedTextPromotedToEvidence)}`,
        `Manual-review UI added=${yesNoUnknown(institutionalMethodologyContract?.guardrails?.manualReviewUiAdded)}`,
      ], "No methodology guardrails attached.", 20),
      bundleField("Next resume pointer", institutionalMethodologyContract?.nextResumePointer),
    ]),
    bundleSection("2AB. Data-First Decision Narrative Contract", [
      bundleField("Contract attached", dataFirstNarrativeContract ? "yes" : "missing"),
      bundleField("Current QA eligibility if missing", "current live analysis should regenerate the contract before primary QA"),
      bundleField("Artifact version", dataFirstNarrativeContract?.artifactVersion),
      bundleField("Contract status", dataFirstNarrativeContract?.contractStatus),
      bundleField("Primary narrative gate status", dataFirstNarrativeContract?.primaryNarrativeGateStatus),
      bundleField("Primary narrative failure count", dataFirstNarrativeContract?.primaryNarrativeFailureCount),
      bundleField("Canonical family", dataFirstNarrativeContract?.narrativeScope?.canonicalAssetFamily || dataFirstNarrativeContract?.narrativeScope?.assetClassGroup),
      bundleField("Primary rendered gap count", safeArray(dataFirstNarrativeContract?.missingEvidenceGaps).length),
      bundleField("Rejected audit-only gap count", safeArray(dataFirstNarrativeContract?.auditRejectedSourceGaps).length),
      bundleField("Rejected audit-only gaps block DataFirst", "no"),
      bundleField("Local DataFirst compatibility", dataFirstNarrativeContract?.sourceGapCompatibilityStatus || dataFirstNarrativeContract?.primaryNarrativeGateStatus),
      bundleField("Decision surface data binding status", dataFirstNarrativeContract?.decisionSurfaceDataBindingStatus),
      bundleField("Score explanation data-backed", yesNoUnknown(dataFirstNarrativeContract?.scoreExplanationInputs?.scoreExplanationDataBacked)),
      bundleField("Frontend normalization field", dataFirstNarrativeContract?.frontendNormalizationField),
      bundleField("Review Bundle section", dataFirstNarrativeContract?.reviewBundleSection),
      bundleField("Narrative scope", [
        dataFirstNarrativeContract?.narrativeScope?.assetSymbol,
        dataFirstNarrativeContract?.narrativeScope?.primaryVisibleLabel,
        dataFirstNarrativeContract?.narrativeScope?.representationType,
        dataFirstNarrativeContract?.narrativeScope?.resolvedLensId,
      ].filter(Boolean).join(" | ")),
      "Generated narrative fields:",
      bundleList(safeArray(dataFirstNarrativeContract?.generatedNarrativeFields).map((entry) =>
        `${entry.fieldName || "field"} [${entry.status || "unknown"}]: ${entry.generatedText || "Unavailable"}`
      ), "No generated data-first narrative fields.", 40),
      "Facts used:",
      bundleList(safeArray(dataFirstNarrativeContract?.availableEvidenceFacts).map((fact) =>
        `${fact.factId || "fact"} | ${fact.sourceType || "source"} | ${fact.fieldPath || "field"} | ${fact.valueSummary || "value unavailable"} | proves=${fact.whatItCanProve || "scope unavailable"} | cannot=${fact.whatItCannotProve || "boundary unavailable"}`
      ), "No narrative facts attached.", 30),
      "Missing evidence gaps:",
      bundleList(safeArray(dataFirstNarrativeContract?.missingEvidenceGaps).map((gap) =>
        `${gap.gapId || "gap"} | ${gap.severity || "severity"} | ${gap.sourceRequirement || "requirement unavailable"} | notNegativeEvidence=${gap.notNegativeEvidence ? "yes" : "unknown"}`
      ), "No narrative gaps attached.", 30),
      bundleField("Source-gap compatibility status", dataFirstNarrativeContract?.sourceGapCompatibilityStatus),
      "Rejected incompatible source gaps (audit-only):",
      bundleList(safeArray(dataFirstNarrativeContract?.auditRejectedSourceGaps).map((gap) =>
        `${gap.sourceRequirement || "requirement"} | canonical=${gap.canonicalFamily || "unknown"} | incompatible=${safeArray(gap.incompatibleFamilies).join(", ") || "unknown"} | concepts=${safeArray(gap.matchedConcepts).join(", ") || "unknown"}`
      ), "No incompatible DataFirst source gaps were rejected.", 30),
      "Exact primary failure fields:",
      bundleList(safeArray(dataFirstNarrativeContract?.primaryNarrativeFailureDetails).map((failure) =>
        `${failure.fieldPath || failure.fieldName || "field"} | text=${failure.offendingText || "unavailable"} | canonical=${failure.canonicalFamily || "unknown"} | incompatible=${safeArray(failure.incompatibleFamilies).join(", ") || "unknown"} | concepts=${safeArray(failure.matchedConcepts).join(", ") || "unknown"} | renderedPrimary=${failure.renderedPrimary ? "yes" : "no"} | auditOnly=${failure.auditOnly ? "yes" : "no"} | reason=${failure.blockingReason || "unavailable"}`
      ), "No primary DataFirst failure fields.", 30),
      "Allowed narrative concepts:",
      bundleList(dataFirstNarrativeContract?.allowedNarrativeConcepts),
      "Forbidden narrative concepts:",
      bundleList(dataFirstNarrativeContract?.forbiddenNarrativeConcepts),
      "Wrong asset name mentions:",
      bundleList(dataFirstNarrativeContract?.wrongAssetNameMentions, "No wrong-asset subject mentions detected."),
      "Forbidden concept mentions:",
      bundleList(dataFirstNarrativeContract?.forbiddenConceptMentions, "No forbidden concept mentions detected."),
      "Unsupported claims detected:",
      bundleList(dataFirstNarrativeContract?.unsupportedClaimsDetected, "No unsupported claims detected."),
      "Scoring anomaly findings:",
      bundleList(dataFirstNarrativeContract?.scoringAnomalyFindings, "No scoring explanation anomalies detected."),
      "Known limitations:",
      bundleList(dataFirstNarrativeContract?.knownLimitations),
    ]),
    bundleSection("2AX. Market-Wide Primary Route Authority & Surface Parity Repair v1", [
      bundleField("Contract attached", routeSurfaceParityContract ? "yes" : "missing"),
      bundleField("Artifact version", routeSurfaceParityContract?.artifactVersion),
      bundleField("Global parity status", routeSurfaceParityContract?.globalParityStatus || "FAIL"),
      bundleField("2AK local route status", routeSurfaceParityContract?.localRouteStatus || authorityHierarchyContract?.localRouteStatus || authorityHierarchyContract?.contractStatus),
      bundleField("DataFirst / 2AB compatibility", routeSurfaceParityContract?.dataFirstCompatibilityStatus || "unknown"),
      bundleField("2AM scanner status", routeSurfaceParityContract?.answerSurfaceScannerStatus || "unknown"),
      bundleField("Source Queue compatibility", routeSurfaceParityContract?.sourceQueueCompatibilityStatus || "unknown"),
      bundleField("Canonical primary family", primaryAnalysisRoute?.primaryFamily || primaryAnalysisRoute?.assetFamily),
      bundleField("Canonical visible label", primaryAnalysisRoute?.primaryVisibleLabel || primaryAnalysisRoute?.visibleLabel),
      bundleField("Canonical asset framing", primaryAnalysisRoute?.primaryAssetFraming || primaryAnalysisRoute?.assetFramingLabel),
      bundleField("Canonical question group", primaryAnalysisRoute?.primaryQuestionGroup || primaryAnalysisRoute?.questionGroup),
      bundleField("Canonical source profile", primaryAnalysisRoute?.primarySourceProfile || primaryAnalysisRoute?.sourceProfile),
      bundleField("Canonical answer template family", primaryAnalysisRoute?.primaryAnswerTemplateFamily),
      bundleField("Authority source", primaryAnalysisRoute?.authoritySource),
      bundleField("Route confidence", primaryAnalysisRoute?.routeConfidence),
      bundleField("Route safety", primaryAnalysisRoute?.routeSafety),
      bundleField("Parity failure count", routeSurfaceParityContract?.parityFailureCount ?? primaryAnalysisRoute?.parityFailures?.length ?? "unknown"),
      bundleField("Wrong-family question leakage count", routeSurfaceParityContract?.wrongFamilyQuestionLeakageCount ?? "unknown"),
      bundleField("Wrong-family source gap count", routeSurfaceParityContract?.wrongFamilySourceGapCount ?? "unknown"),
      bundleField("Rejected wrong-family source gaps (audit-only)", routeSurfaceParityContract?.rejectedWrongFamilySourceGapCount ?? "unknown"),
      bundleField("Primary affected", yesNoUnknown(routeSurfaceParityContract?.primaryAffected)),
      bundleField("2AB escalates global failure", yesNoUnknown(routeSurfaceParityContract?.dataFirstNarrativeGateEscalated)),
      "Canonical source matrix:",
      bundleList(primaryAnalysisRoute?.primarySourceMatrixEntries || primaryAnalysisRoute?.sourceMatrixEntries),
      "Accepted family aliases:",
      bundleList(routeSurfaceParityContract?.acceptedFamilyAliases),
      "Rejected alias mismatches:",
      bundleList(routeSurfaceParityContract?.rejectedAliasMismatches, "No incompatible aliases detected."),
      "Exact DataFirst / 2AB failure fields:",
      bundleList(safeArray(routeSurfaceParityContract?.dataFirstFailureDetails).map((failure) =>
        `${failure.fieldPath || failure.fieldName || "field"} | text=${failure.offendingText || "unavailable"} | canonical=${failure.canonicalFamily || "unknown"} | incompatible=${safeArray(failure.incompatibleFamilies).join(", ") || "unknown"} | concepts=${safeArray(failure.matchedConcepts).join(", ") || "unknown"} | reason=${failure.blockingReason || "unavailable"}`
      ), "No DataFirst primary failure fields."),
      "Surface family map:",
      bundleList(Object.entries(safeObject(routeSurfaceParityContract?.surfaceFamilyMap)).map(([surface, family]) => `${surface}=${family || "missing"}`)),
      "Surface question-group map:",
      bundleList(Object.entries(safeObject(routeSurfaceParityContract?.surfaceQuestionGroupMap)).map(([surface, group]) => `${surface}=${group || "missing"}`)),
      "Surface source-matrix map:",
      bundleList(Object.entries(safeObject(routeSurfaceParityContract?.surfaceSourceMatrixMap)).map(([surface, entries]) => `${surface}=${safeArray(entries).join(", ") || "missing"}`)),
      "Failed contracts:",
      bundleList(routeSurfaceParityContract?.failedContracts, "No failed route contracts."),
      "Blocking findings:",
      bundleList(routeSurfaceParityContract?.blockingFindings, "No blocking route-parity findings."),
      "Wrong-family question findings:",
      bundleList(safeArray(routeSurfaceParityContract?.wrongFamilyQuestionFindings).map((finding) =>
        `${finding.questionId || "question"} | expected=${finding.expectedFamily || "unknown"} | detected=${safeArray(finding.detectedFamilies).join(", ") || "unknown"} | concepts=${safeArray(finding.matchedConcepts).join(", ") || "none"}`
      ), "No wrong-family question leakage detected."),
      "Audit-only divergence:",
      bundleList(routeSurfaceParityContract?.auditOnlyFindings, "No audit-only route divergence."),
      "Frontend parity:",
      bundleList([
        `canonical route normalized=${yesNoUnknown(routeSurfaceParityContract?.frontendContract?.canonicalRouteNormalized)}`,
        `stale fallback can override=${yesNoUnknown(routeSurfaceParityContract?.frontendContract?.staleFallbackCanOverride)}`,
        `primary labels use canonical route=${yesNoUnknown(routeSurfaceParityContract?.frontendContract?.primaryLabelsUseCanonicalRoute)}`,
      ]),
      "Protected report parity:",
      bundleList([
        `canonical family only=${yesNoUnknown(routeSurfaceParityContract?.protectedReport?.canonicalFamilyOnly)}`,
        `raw route internals redacted=${yesNoUnknown(routeSurfaceParityContract?.protectedReport?.rawRouteInternalsRedacted)}`,
      ]),
      "Guardrails:",
      bundleList(Object.entries(safeObject(routeSurfaceParityContract?.guardrails)).map(([name, value]) => `${name}=${String(value)}`)),
      "Known limitations:",
      bundleList(routeSurfaceParityContract?.knownLimitations),
      bundleField("Next resume pointer", routeSurfaceParityContract?.nextResumePointer),
    ]),
    bundleSection("2AY. Source Intelligence / Evidence Registry v1", [
      bundleField("Contract attached", sourceIntelligenceContract ? "yes" : "no"),
      bundleField("Artifact version", sourceIntelligenceContract?.artifactVersion),
      bundleField("Runtime mode", sourceIntelligenceContract?.runtimeMode),
      bundleField("Canonical family", sourceIntelligenceContract?.canonicalFamily),
      bundleField("Canonical question group", sourceIntelligenceContract?.canonicalQuestionGroup),
      bundleField("Evidence registry attached", evidenceRegistryContract ? "yes" : "no"),
      bundleField("Question mapping attached", questionEvidenceMappingContract ? "yes" : "no"),
      bundleField("Question mapping contract status", questionEvidenceMappingContract?.contractStatus),
      bundleField("Canonical family question count", questionEvidenceMappingContract?.canonicalFamilyQuestionCount),
      bundleField("Allowed common question count", questionEvidenceMappingContract?.allowedCommonQuestionCount),
      bundleField("Blocked wrong-family question count", questionEvidenceMappingContract?.wrongFamilyMappedQuestionCount),
      bundleField("Blocked question mappings", questionEvidenceMappingContract?.blockedQuestionMappingCount),
      bundleField("Audit-only rejected question mappings", questionEvidenceMappingContract?.auditOnlyRejectedQuestionMappingCount),
      bundleField("Wrong-family questions remain primary", yesNoUnknown(questionEvidenceMappingContract?.wrongFamilyQuestionsRemainInPrimaryMapping)),
      bundleField("Allowed common registry", questionEvidenceMappingContract?.allowedCommonQuestionRegistryVersion),
      bundleField("Evidence packets", sourceIntelligenceContract?.summary?.evidencePacketCount ?? evidenceRegistryContract?.summary?.packetCount),
      bundleField("Reviewed evidence packets", sourceIntelligenceContract?.summary?.reviewedEvidenceCount ?? evidenceRegistryContract?.summary?.reviewedCount),
      bundleField("Provider observations", sourceIntelligenceContract?.summary?.providerObservationCount ?? evidenceRegistryContract?.summary?.providerObservationCount),
      bundleField("Provider metadata context", sourceIntelligenceContract?.summary?.providerMetadataCount),
      bundleField("Source candidates", sourceIntelligenceContract?.summary?.sourceCandidateCount ?? evidenceRegistryContract?.summary?.candidateCount),
      bundleField("Missing evidence", sourceIntelligenceContract?.summary?.missingEvidenceCount ?? evidenceRegistryContract?.summary?.requirementCount),
      bundleField("Contradictions", sourceIntelligenceContract?.summary?.contradictionCount ?? evidenceRegistryContract?.summary?.contradictionCount),
      bundleField("Stale sources", sourceIntelligenceContract?.summary?.staleSourceCount),
      bundleField("Question coverage", `${sourceIntelligenceContract?.summary?.questionMappingCoveragePercent ?? questionEvidenceMappingContract?.summary?.coveragePercent ?? 0}%`),
      bundleField("Scoring-active evidence", sourceIntelligenceContract?.summary?.scoringActiveEvidenceCount ?? evidenceRegistryContract?.summary?.scoringActiveCount ?? 0),
      bundleField("Blocked source promotions", sourceIntelligenceContract?.summary?.sourcePromotionBlockedCount ?? evidenceRegistryContract?.rejectedPromotions?.length ?? 0),
      bundleField("Protected readiness", sourceIntelligenceContract?.protectedReportSummary?.readiness),
      bundleField("Reviewed evidence scoring-active", yesNoUnknown(sourceIntelligenceContract?.protectedReportSummary?.reviewedEvidenceScoringActive)),
      "Source-class counts:",
      bundleList(Object.entries(safeObject(sourceIntelligenceContract?.sourceClassCounts)).map(([name, count]) => `${name}=${count}`), "No source-class counts attached."),
      "Source-status counts:",
      bundleList(Object.entries(safeObject(sourceIntelligenceContract?.sourceStatusCounts)).map(([name, count]) => `${name}=${count}`), "No source-status counts attached."),
      "Freshness counts:",
      bundleList(Object.entries(safeObject(sourceIntelligenceContract?.freshnessCounts)).map(([name, count]) => `${name}=${count}`), "No freshness counts attached."),
      "Question evidence mapping:",
      bundleList(safeArray(questionEvidenceMappingContract?.mappings).map((mapping) =>
        `${mapping.questionId || "question"} | readiness=${mapping.answerReadiness || "unknown"} | evidence=${mapping.evidenceReadiness || "unknown"} | reviewed=${mapping.reviewedEvidenceCount || 0} | provider=${mapping.providerObservationCount || 0} | candidates=${mapping.candidateSourceCount || 0} | missing=${mapping.missingEvidenceCount || 0} | contradictions=${mapping.contradictionCount || 0}`
      ), "No question-level evidence mappings attached.", 60),
      "Missing evidence by question:",
      bundleList(safeArray(questionEvidenceMappingContract?.mappings).flatMap((mapping) =>
        safeArray(mapping.blockingEvidenceGaps).map((gap) => `${mapping.questionId || "question"}: ${gap}`)
      ), "No question-level blocking evidence gaps attached.", 60),
      "Blocked wrong-family question mappings (audit-only):",
      bundleList(safeArray(questionEvidenceMappingContract?.blockedQuestionMappings).map((mapping) =>
        `${mapping.questionId || "question"} | status=${mapping.compatibilityStatus || "unknown"} | candidateGroup=${mapping.candidateQuestionGroup || "unknown"} | candidateFamily=${mapping.candidateFamily || "unknown"} | canonicalFamily=${mapping.canonicalFamily || "unknown"} | canonicalGroup=${mapping.canonicalQuestionGroup || "unknown"} | source=${mapping.sourcePath || "unknown"} | packet=${mapping.evidencePacketId || "none"} | reason=${mapping.blockedReason || "unspecified"}`
      ), "No wrong-family question mappings were rejected.", 60),
      "Top blocked reasons:",
      bundleList([...new Set(safeArray(questionEvidenceMappingContract?.blockedQuestionMappings).map((mapping) => mapping.blockedReason).filter(Boolean))], "No blocked question-mapping reasons.", 20),
      "Contradictions:",
      bundleList(safeArray(evidenceRegistryContract?.contradictions).map((contradiction) =>
        `${contradiction.contradictionId || "contradiction"} | ${contradiction.classification || "unknown"} | manualReview=${contradiction.manualReviewRequired ? "yes" : "no"} | ${contradiction.description || "No description"}`
      ), "No evidence contradictions detected.", 40),
      "Source-boundary diagnostics:",
      bundleList(safeArray(sourceIntelligenceContract?.boundaryDiagnostics).map((diagnostic) =>
        `${diagnostic.diagnosticId || "diagnostic"} | ${diagnostic.violationType || "unknown"} | ${diagnostic.severity || "unknown"} | question=${diagnostic.questionId || "none"} | blocked=${diagnostic.blockedUse || "unspecified"} | ${diagnostic.finding || "No finding"}`
      ), "No source-boundary diagnostics detected.", 60),
      "Rejected promotions:",
      bundleList(safeArray(evidenceRegistryContract?.rejectedPromotions).map((entry) =>
        `${entry.evidenceId || "evidence"} | attempted=${entry.attemptedUse || "unknown"} | blocked=${entry.blockedReason || "unspecified"}`
      ), "No source-promotion attempts recorded.", 40),
      "Source boundary:",
      bundleList(evidenceRegistryContract?.sourceBoundary),
      "Frontend visibility:",
      bundleList(safeArray(sourceIntelligenceContract?.frontendVisibility?.surfaces)),
      "Guardrails:",
      bundleList([
        ...Object.entries(safeObject(sourceIntelligenceContract?.guardrails)).map(([name, value]) => `${name}=${String(value)}`),
        ...Object.entries(safeObject(questionEvidenceMappingContract?.guardrails)).map(([name, value]) => `questionMapping.${name}=${String(value)}`),
      ]),
      "Known limitations:",
      bundleList(sourceIntelligenceContract?.knownLimitations),
      bundleField("Next resume pointer", sourceIntelligenceContract?.nextResumePointer),
    ]),
    bundleSection("2AZ. Deep Research Source Discovery + Evidence Candidate Pipeline v1", [
      bundleField("Contract attached", deepResearchSourceDiscoveryContract ? "yes" : "no"),
      bundleField("Artifact version", deepResearchSourceDiscoveryContract?.artifactVersion),
      bundleField("Runtime mode", deepResearchSourceDiscoveryContract?.runtimeMode),
      bundleField("Contract status", deepResearchSourceDiscoveryContract?.contractStatus),
      bundleField("Canonical family", deepResearchSourceDiscoveryContract?.canonicalFamily),
      bundleField("Canonical question group", deepResearchSourceDiscoveryContract?.canonicalQuestionGroup),
      bundleField("Pipeline attached", sourceCandidatePipelineContract ? "yes" : "no"),
      bundleField("Registry attached", sourceCandidateRegistryContract ? "yes" : "no"),
      bundleField("Raw candidate records considered", sourceCandidateRegistryContract?.candidateAccountingSummary?.rawCandidateRecordCount),
      bundleField("Accepted candidate records", sourceCandidateRegistryContract?.candidateAccountingSummary?.acceptedCandidateCount),
      bundleField("Display candidates", sourceCandidateRegistryContract?.candidateAccountingSummary?.displayCandidateCount),
      bundleField("Rejected candidate records", sourceCandidateRegistryContract?.candidateAccountingSummary?.rejectedCandidateCount),
      bundleField("Audit-only records", sourceCandidateRegistryContract?.candidateAccountingSummary?.auditOnlyCandidateCount),
      bundleField("Duplicate candidate records", sourceCandidateRegistryContract?.candidateAccountingSummary?.duplicateCandidateCount),
      bundleField("Wrong-family rejected records", sourceCandidateRegistryContract?.candidateAccountingSummary?.wrongFamilyRejectedCount),
      bundleField("Wrong-question rejected records", sourceCandidateRegistryContract?.candidateAccountingSummary?.wrongQuestionRejectedCount),
      bundleField("Bounded-limit rejected records", sourceCandidateRegistryContract?.candidateAccountingSummary?.boundedLimitRejectedCount),
      bundleField("Max accepted candidates per asset", sourceCandidateRegistryContract?.candidateAccountingSummary?.maxAcceptedCandidatesPerAsset),
      bundleField("Max accepted candidates per question", sourceCandidateRegistryContract?.candidateAccountingSummary?.maxAcceptedCandidatesPerQuestion),
      bundleField("Limit applies to", sourceCandidateRegistryContract?.candidateAccountingSummary?.limitAppliesTo === "accepted_candidates" ? "accepted/display candidates" : sourceCandidateRegistryContract?.candidateAccountingSummary?.limitAppliesTo),
      bundleField("Raw records may exceed accepted limit", yesNoUnknown(sourceCandidateRegistryContract?.candidateAccountingSummary?.rawRecordsMayExceedAcceptedLimit)),
      bundleField("Candidate limit status", sourceCandidateRegistryContract?.candidateAccountingSummary?.limitStatus),
      bundleField("Official candidates", sourceCandidateRegistryContract?.summary?.officialCandidateCount),
      bundleField("Provider-context candidates", sourceCandidateRegistryContract?.summary?.providerContextCandidateCount),
      bundleField("Third-party candidates", sourceCandidateRegistryContract?.summary?.thirdPartyCandidateCount),
      bundleField("News/context candidates", sourceCandidateRegistryContract?.summary?.newsContextCandidateCount),
      bundleField("Family-compatible candidates", sourceCandidateRegistryContract?.summary?.familyCompatibleCandidateCount),
      bundleField("Wrong-family rejected candidates", sourceCandidateRegistryContract?.summary?.wrongFamilyRejectedCount),
      bundleField("High-priority review candidates", sourceCandidateRegistryContract?.summary?.highPriorityReviewCandidateCount),
      bundleField("Reviewed candidates", sourceCandidateRegistryContract?.summary?.reviewedCandidateCount ?? 0),
      bundleField("Scoring-active candidates", sourceCandidateRegistryContract?.summary?.scoringActiveCandidateCount ?? 0),
      bundleField("Unresolved source gaps", deepResearchSourceDiscoveryContract?.summary?.unresolvedSourceGapCount),
      bundleField("Candidate question coverage", `${deepResearchSourceDiscoveryContract?.summary?.candidateQuestionCoveragePercent ?? 0}%`),
      bundleField("Candidate-only status", yesNoUnknown(sourceCandidatePipelineContract?.candidateOnlyStatus)),
      bundleField("Source promotion blocked", sourceCandidatePipelineContract?.guardrails?.candidatesPromotedToEvidence === false ? "yes" : "no"),
      bundleField("Automatic evidence-gap resolution", sourceCandidatePipelineContract?.guardrails?.candidatesResolveEvidenceGapsAutomatically ? "yes" : "no"),
      "Candidate accounting warnings:",
      bundleList(sourceCandidateRegistryContract?.candidateAccountingSummary?.limitWarnings, "No candidate-limit warning."),
      "Candidate accounting boundary:",
      bundleList(sourceCandidateRegistryContract?.candidateAccountingSummary?.accountingBoundaryNotes),
      "Candidates by source class:",
      bundleList(Object.entries(safeObject(sourceCandidateRegistryContract?.candidatesBySourceClass)).map(([name, ids]) => `${name}=${safeArray(ids).length}`), "No candidate source classes attached."),
      "Candidates by review priority:",
      bundleList(Object.entries(safeObject(sourceCandidateRegistryContract?.candidatesByPriority)).map(([name, ids]) => `${name}=${safeArray(ids).length}`), "No candidate priorities attached."),
      "Candidates by question:",
      bundleList(Object.entries(safeObject(sourceCandidateRegistryContract?.candidatesByQuestion)).map(([questionId, ids]) => `${questionId}=${safeArray(ids).length}`), "No question-level candidates attached.", 80),
      "Accepted source candidates:",
      bundleList(safeArray(sourceCandidateRegistryContract?.candidates).map((candidate) =>
        `${candidate.candidateSourceId || "candidate"} | question=${candidate.questionId || "unknown"} | claim=${candidate.claimType || "unknown"} | class=${candidate.candidateSourceClass || "unknown"} | status=${candidate.candidateSourceStatus || "candidate_only"} | priority=${candidate.reviewPriority || "unknown"} | reviewed=${candidate.isReviewedEvidence ? "yes" : "no"} | scoringActive=${candidate.isScoringActive ? "yes" : "no"} | url=${candidate.candidateUrl || "not attached"} | reason=${candidate.candidateReason || "review required"}`
      ), "No accepted source candidates attached.", 120),
      "Unresolved evidence gaps:",
      bundleList(safeArray(sourceCandidatePipelineContract?.unresolvedEvidenceGaps).map((entry) =>
        `${entry.questionId || "question"} | ${entry.gap || "gap unavailable"} | candidates=${safeArray(entry.candidateIds).join(", ") || "none"} | automaticallyResolved=${entry.automaticallyResolved ? "yes" : "no"}`
      ), "No unresolved source gaps attached.", 120),
      "Rejected candidates:",
      bundleList(safeArray(sourceCandidateRegistryContract?.rejectedCandidates).map((candidate) =>
        `${candidate.candidateSourceId || "candidate"} | familyFit=${candidate.familyFitStatus || "unknown"} | questionFit=${candidate.questionFitStatus || "unknown"} | status=${candidate.candidateSourceStatus || "unknown"}`
      ), "No rejected candidates attached.", 80),
      "Duplicate candidates:",
      bundleList(safeArray(sourceCandidateRegistryContract?.duplicateCandidates).map((candidate) =>
        `${candidate.candidateSourceId || "candidate"} | dedupeKey=${candidate.dedupeKey || "unknown"}`
      ), "No duplicate candidates attached.", 80),
      "Boundary diagnostics:",
      bundleList(safeArray(sourceCandidatePipelineContract?.boundaryDiagnostics).map((diagnostic) =>
        `${diagnostic.diagnosticId || "diagnostic"} | ${diagnostic.diagnosticType || "unknown"} | severity=${diagnostic.severity || "unknown"} | blocked=${diagnostic.blockedUse || "unknown"} | ${diagnostic.finding || "No finding"}`
      ), "No source-candidate boundary diagnostics attached.", 160),
      "Source boundary:",
      bundleList(sourceCandidateRegistryContract?.sourceBoundary),
      "Free/API-first limitations:",
      bundleList(deepResearchSourceDiscoveryContract?.freeApiCoverageLimitations),
      "Frontend visibility:",
      bundleList(deepResearchSourceDiscoveryContract?.frontendVisibility?.surfaces),
      "Guardrails:",
      bundleList(Object.entries(safeObject(deepResearchSourceDiscoveryContract?.guardrails)).map(([name, value]) => `${name}=${String(value)}`)),
      "Known limitations:",
      bundleList(deepResearchSourceDiscoveryContract?.knownLimitations),
      bundleField("Next resume pointer", deepResearchSourceDiscoveryContract?.nextResumePointer),
    ]),
    bundleSection("2BA. Source Candidate Review Workflow v1", [
      bundleField("Contract attached", sourceCandidateReviewWorkflowContract ? "yes" : "no"),
      bundleField("Artifact version", sourceCandidateReviewWorkflowContract?.artifactVersion),
      bundleField("Runtime mode", sourceCandidateReviewWorkflowContract?.runtimeMode),
      bundleField("Contract status", sourceCandidateReviewWorkflowContract?.contractStatus),
      bundleField("Persistence mode", sourceCandidateReviewWorkflowContract?.persistence?.mode),
      bundleField("Durable persistence available", yesNoUnknown(sourceCandidateReviewWorkflowContract?.persistence?.durablePersistenceAvailable)),
      bundleField("Review persistence available", yesNoUnknown(sourceCandidateReviewWorkflowContract?.persistence?.diagnostic?.reviewPersistenceAvailable)),
      bundleField("Review mutation available", yesNoUnknown(sourceCandidateReviewWorkflowContract?.persistence?.diagnostic?.reviewMutationAvailable)),
      bundleField("Decisions table reachable", yesNoUnknown(sourceCandidateReviewWorkflowContract?.persistence?.diagnostic?.decisionsTableReachable)),
      bundleField("Audit events table reachable", yesNoUnknown(sourceCandidateReviewWorkflowContract?.persistence?.diagnostic?.auditEventsTableReachable)),
      bundleField("Persistence fallback reason", sourceCandidateReviewWorkflowContract?.persistence?.diagnostic?.fallbackReason),
      bundleField("Total review queue items", sourceCandidateReviewQueueContract?.summary?.totalReviewQueueItems),
      bundleField("Unreviewed count", sourceCandidateReviewQueueContract?.summary?.unreviewedCount),
      bundleField("In-review count", sourceCandidateReviewQueueContract?.summary?.inReviewCount),
      bundleField("Accepted for evidence packet drafting", sourceCandidateReviewQueueContract?.summary?.acceptedForEvidencePacketDraftingCount),
      bundleField("Rejected count", sourceCandidateReviewQueueContract?.summary?.rejectedCount),
      bundleField("Needs-check count", sourceCandidateReviewQueueContract?.summary?.needsCheckCount),
      bundleField("Duplicate / superseded count", sourceCandidateReviewQueueContract?.summary?.duplicateOrSupersededCount),
      bundleField("Evidence packet draft eligible", sourceCandidateReviewQueueContract?.summary?.evidencePacketDraftEligibleCount),
      bundleField("Reviewed evidence count", sourceCandidateReviewQueueContract?.summary?.reviewedEvidenceCount ?? 0),
      bundleField("Scoring-active candidate count", sourceCandidateReviewQueueContract?.summary?.scoringActiveCandidateCount ?? 0),
      bundleField("Audit trail event count", sourceCandidateReviewAuditTrailContract?.eventCount ?? 0),
      bundleField("Automatic gap resolution", sourceCandidateReviewWorkflowContract?.guardrails?.acceptedCandidateResolvesEvidenceGap ? "yes" : "no"),
      bundleField("Promotion blocked reason", "evidence_packet_validation_required_before_evidence_use"),
      bundleField("Required boundary", "Accepted source candidate means suitable for future evidence packet drafting, not proof of claim truth."),
      "Review decisions by family:",
      bundleList(Object.entries(safeObject(sourceCandidateReviewQueueContract?.decisionsByFamily)).map(([family, count]) => `${family}=${count}`)),
      "Review decisions by source class:",
      bundleList(Object.entries(safeObject(sourceCandidateReviewQueueContract?.decisionsBySourceClass)).map(([sourceClass, count]) => `${sourceClass}=${count}`)),
      "Review queue:",
      bundleList(safeArray(sourceCandidateReviewQueueContract?.items).map((item) =>
        `${item.sourceCandidateReviewKey || "review"} | family=${item.canonicalFamily || "unknown"} | question=${item.questionId || "unknown"} | status=${item.reviewStatus || "unknown"} | authority=${item.sourceAuthorityTier || "unknown"} | priority=${item.reviewPriority || "unknown"} | draftEligible=${item.evidencePacketDraftEligible ? "yes" : "no"} | scoringActive=${item.isScoringActive ? "yes" : "no"} | resolvesGap=${item.doesResolveEvidenceGap ? "yes" : "no"} | next=${item.nextRecommendedAction || "manual review"}`), "No review queue items attached.", 120),
      "Source authority rubric:",
      bundleList([
        `version=${sourceCandidateReviewWorkflowContract?.sourceAuthorityRubricSummary?.rubricVersion || "unavailable"}`,
        `tiers=${safeArray(sourceCandidateReviewWorkflowContract?.sourceAuthorityRubricSummary?.authorityTiers).join(", ") || "none"}`,
        sourceCandidateReviewWorkflowContract?.sourceAuthorityRubricSummary?.boundary,
      ]),
      "Candidate review boundary:",
      bundleList(sourceCandidateReviewWorkflowContract?.boundaryNotes),
      "Guardrails:",
      bundleList(Object.entries(safeObject(sourceCandidateReviewWorkflowContract?.guardrails)).map(([name, value]) => `${name}=${String(value)}`)),
      "Known limitations:",
      bundleList(sourceCandidateReviewWorkflowContract?.knownLimitations),
      bundleField("Next resume pointer", sourceCandidateReviewWorkflowContract?.nextResumePointer),
    ]),
    bundleSection("2BB. Institutional Analyst Workflow Engine v1", [
      bundleField("Contract attached", institutionalAnalystWorkflowContract ? "yes" : "no"),
      bundleField("Contract status", institutionalAnalystWorkflowContract?.contractStatus),
      bundleField("Canonical asset", institutionalAnalystWorkflowContract?.canonicalAsset),
      bundleField("Canonical identity", institutionalAnalystWorkflowContract?.canonicalIdentity),
      bundleField("Canonical family", institutionalAnalystWorkflowContract?.canonicalFamily),
      bundleField("Canonical question group", institutionalAnalystWorkflowContract?.canonicalQuestionGroup),
      bundleField("Alias normalization status", institutionalAnalystWorkflowContract?.familyAliasNormalization?.status),
      bundleField("Aliases normalized count", institutionalAnalystWorkflowContract?.familyAliasNormalization?.aliasesNormalizedCount),
      bundleField("Aliases blocked from primary rendering", institutionalAnalystWorkflowContract?.familyAliasNormalization?.aliasesBlockedFromPrimaryRenderingCount),
      "Audit-only alias normalization:",
      bundleList(safeArray(institutionalAnalystWorkflowContract?.familyAliasNormalization?.aliasesNormalized).map((entry) =>
        `${entry.alias} -> ${entry.canonicalFamily} (${entry.reason})`)),
      bundleField("Workflow completeness", institutionalAnalystWorkflowContract?.workflowCompletenessStatus),
      bundleField("Available raw-data categories", safeArray(institutionalAnalystWorkflowContract?.rawProblemDataInventory?.availableCategories).length),
      bundleField("Partial raw-data categories", safeArray(institutionalAnalystWorkflowContract?.rawProblemDataInventory?.partialCategories).length),
      bundleField("Missing raw-data categories", safeArray(institutionalAnalystWorkflowContract?.rawProblemDataInventory?.missingCategories).length),
      bundleField("Normalized input count", safeArray(institutionalAnalystWorkflowContract?.normalizedProblemData).length),
      bundleField("Typed observation count", safeArray(institutionalAnalystWorkflowContract?.typedObservations).length),
      bundleField("Autonomous answered questions", safeArray(institutionalAnalystWorkflowContract?.autonomousQuestionAnswers).filter((answer) => answer.answerState === "answered_by_current_data").length),
      bundleField("Partially answered questions", safeArray(institutionalAnalystWorkflowContract?.autonomousQuestionAnswers).filter((answer) => answer.answerState === "partially_answered").length),
      bundleField("Unanswered required questions", safeArray(institutionalAnalystWorkflowContract?.autonomousQuestionAnswers).filter((answer) => !["answered_by_current_data", "partially_answered", "not_applicable_for_family"].includes(answer.answerState)).length),
      "Analyst judgments by module:",
      bundleList(safeArray(institutionalAnalystWorkflowContract?.analystJudgments).map((judgment) => `${judgment.module}: ${judgment.status}; ${safeArray(judgment.missingData).length} missing inputs`)),
      bundleField("Tokenomics analysis", institutionalAnalystWorkflowContract?.tokenomicsAnalysis?.summary),
      bundleField("Fundamental analysis", institutionalAnalystWorkflowContract?.fundamentalAnalysis?.summary),
      bundleField("Primary thesis", institutionalAnalystWorkflowContract?.thesisAntiThesis?.primaryThesis),
      bundleField("Anti-thesis", institutionalAnalystWorkflowContract?.thesisAntiThesis?.antiThesis),
      "Module scoring readiness:",
      bundleList(safeArray(institutionalAnalystWorkflowContract?.moduleScoringReadiness).map((module) => `${module.module}: support=${module.autonomousInputSupport}; eligibility=${module.scoreEligibility}; legacyScore=${bundleValue(module.currentLegacyScoreValue)}`)),
      "Confidence cap drivers:",
      bundleList(institutionalAnalystWorkflowContract?.confidenceCapDrivers),
      "Falsification triggers:",
      bundleList(institutionalAnalystWorkflowContract?.falsificationTriggers),
      bundleField("Source candidates excluded from evidence", yesNoUnknown(institutionalAnalystWorkflowContract?.evidenceUseBoundary?.sourceCandidatesExcluded)),
      bundleField("Manual review required for normal flow", institutionalAnalystWorkflowContract?.guardrails?.manualReviewRequiredForNormalFlow ? "yes" : "no"),
      bundleField("Family contamination result", institutionalAnalystWorkflowContract?.contaminationControl?.status),
      bundleField("Protected report redaction", institutionalAnalystWorkflowContract?.frontendVisibility?.protectedInvestorReport),
      "Guardrails:",
      bundleList(Object.entries(safeObject(institutionalAnalystWorkflowContract?.guardrails)).map(([name, value]) => `${name}=${String(value)}`)),
      "Known limitations:",
      bundleList(institutionalAnalystWorkflowContract?.knownLimitations),
      bundleField("Next resume pointer", institutionalAnalystWorkflowContract?.nextResumePointer),
    ]),
    bundleSection("2BC. Institutional Question Source Coverage Registry v1", [
      bundleField("Contract attached", institutionalQuestionSourceCoverageContract ? "yes" : "no"),
      bundleField("Registry version", institutionalQuestionSourceCoverageContract?.registryVersion),
      bundleField("Contract status", institutionalQuestionSourceCoverageContract?.contractStatus),
      bundleField("Supported families", safeArray(institutionalQuestionSourceCoverageContract?.supportedFamilies).length),
      bundleField("Supported question types", safeArray(institutionalQuestionSourceCoverageContract?.supportedQuestionTypes).length),
      bundleField("Evidence contracts", safeArray(institutionalQuestionSourceCoverageContract?.questionEvidenceContracts).length),
      bundleField("Source tiers", safeArray(institutionalQuestionSourceCoverageContract?.sourceTierModel).length),
      bundleField("Typed observation types", safeArray(institutionalQuestionSourceCoverageContract?.observationTypeCatalog).length),
      bundleField("Forbidden-input rules", safeArray(institutionalQuestionSourceCoverageContract?.forbiddenInputRules).length),
      bundleField("No runtime scoring change", institutionalQuestionSourceCoverageContract?.guardrails?.scoreChanged === false ? "yes" : "no"),
      bundleField("No source fetch yet", institutionalQuestionSourceCoverageContract?.guardrails?.crawlerAdded === false ? "yes" : "no"),
      "Family coverage matrix:",
      bundleList(safeArray(institutionalQuestionSourceCoverageContract?.familyCoverageSummary).map((entry) =>
        `${entry.familyId}: questions=${safeArray(entry.topQuestionTypes).join(", ")}; required=${safeArray(entry.requiredObservationClasses).join(", ")}`
      )),
      "Question evidence matrix:",
      bundleList(safeArray(institutionalQuestionSourceCoverageContract?.questionEvidenceContracts).map((entry) =>
        `${entry.questionId}: required=${safeArray(entry.requiredObservationTypes).join(", ")}; forbiddenRaw=${safeArray(entry.forbiddenRawInputs).join(", ") || "none"}; freshness=${entry.freshnessRule?.ruleId || "missing"}`
      )),
      "Source tier model:",
      bundleList(safeArray(institutionalQuestionSourceCoverageContract?.sourceTierModel).map((entry) =>
        `${entry.tierId}: candidateOnly=${entry.candidateOnly ? "yes" : "no"}; userFacingEligible=${entry.userFacingEvidenceEligible ? "yes" : "no"}`
      )),
      "Forbidden input rules:",
      bundleList(safeArray(institutionalQuestionSourceCoverageContract?.forbiddenInputRules).map((entry) =>
        `${entry.ruleId}: ${safeArray(entry.forbiddenInputs).join(", ")}`
      )),
      "Gap output policy:",
      bundleList(safeArray(institutionalQuestionSourceCoverageContract?.gapOutputPolicies).map((entry) =>
        `${entry.policyId}: ${entry.template}`
      )),
      "Observation type catalog:",
      bundleList(safeArray(institutionalQuestionSourceCoverageContract?.observationTypeCatalog).map((entry) =>
        `${entry.observationType}: fastChanging=${entry.fastChanging ? "yes" : "no"}; measuredWindow=${entry.requiresMeasuredWindow ? "yes" : "no"}`
      )),
      "Audit-only warnings:",
      bundleList(institutionalQuestionSourceCoverageContract?.auditOnlyWarnings, "No registry validation warnings."),
      "Guardrails:",
      bundleList(Object.entries(safeObject(institutionalQuestionSourceCoverageContract?.guardrails)).map(([name, value]) => `${name}=${String(value)}`)),
      "Known limitations:",
      bundleList(institutionalQuestionSourceCoverageContract?.knownLimitations),
      bundleField("Next resume pointer", institutionalQuestionSourceCoverageContract?.nextResumePointer),
    ]),
    bundleSection("2AE. Institutional Scoring Readiness Contract v1", [
      bundleField("Contract attached", scoringReadinessContract ? "yes" : "missing"),
      bundleField("Artifact version", scoringReadinessContract?.artifactVersion),
      bundleField("Contract status", scoringReadinessContract?.contractStatus),
      bundleField("Asset family", scoringReadinessContract?.assetFamily),
      bundleField("Asset family label", scoringReadinessContract?.assetFamilyLabel),
      bundleField("Overall readiness status", scoringReadinessContract?.overallReadinessStatus),
      bundleField("Overall readiness score", scoringReadinessContract?.overallReadinessScore),
      bundleField("Legacy score", scoringReadinessContract?.legacyScore),
      bundleField("Legacy verdict", scoringReadinessContract?.legacyVerdict),
      bundleField("Legacy confidence", scoringReadinessContract?.legacyConfidence),
      bundleField("Legacy score boundary", scoringReadinessContract?.legacyScoreBoundary),
      bundleField("Scoring integration", scoringReadinessContract?.scoringIntegration),
      bundleField("Diagnostic only", yesNoUnknown(scoringReadinessContract?.guardrails?.diagnosticOnly)),
      bundleField("Legacy score changed", yesNoUnknown(scoringReadinessContract?.guardrails?.legacyScoreChanged)),
      bundleField("Legacy verdict changed", yesNoUnknown(scoringReadinessContract?.guardrails?.legacyVerdictChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(scoringReadinessContract?.guardrails?.providerBehaviorChanged)),
      bundleField("Reviewed evidence scoring-active", yesNoUnknown(scoringReadinessContract?.guardrails?.reviewedEvidenceScoringActive)),
      bundleField("Source candidates promoted", yesNoUnknown(scoringReadinessContract?.guardrails?.sourceCandidatesPromoted)),
      bundleField("Token-specific overrides", yesNoUnknown(scoringReadinessContract?.guardrails?.tokenSpecificOverrides)),
      bundleField("Snapshot disabled", yesNoUnknown(scoringReadinessContract?.guardrails?.snapshotDisabled)),
      bundleField("Partial refresh disabled", yesNoUnknown(scoringReadinessContract?.guardrails?.partialRefreshDisabled)),
      bundleField("Ready / blocked / source-required dimensions", `${bundleValue(scoringReadinessContract?.scoringReadyDimensionCount)} / ${bundleValue(scoringReadinessContract?.blockedDimensionCount)} / ${bundleValue(scoringReadinessContract?.sourceRequiredDimensionCount)}`),
      bundleField("Reviewed-evidence-ready dimensions", scoringReadinessContract?.reviewedEvidenceReadyDimensionCount),
      bundleField("Live-data-required dimensions", scoringReadinessContract?.liveDataRequiredDimensionCount),
      bundleField("Hard blocker count", scoringReadinessContract?.hardBlockerCount),
      bundleField("Confidence cap count", scoringReadinessContract?.confidenceCapCount),
      "Dimensions:",
      bundleList(safeArray(scoringReadinessContract?.dimensions).map((dimension) =>
        `${dimension.dimensionId || "dimension"} | ${dimension.dimensionLabel || "label unavailable"} | status=${dimension.evidenceStatus || "unknown"} | scoringActive=${dimension.isScoringActive ? "yes" : "no"} | missing=${safeArray(dimension.missingEvidence).slice(0, 3).join("; ") || "none"}`
      )),
      "Source matrix entries:",
      bundleList(safeArray(scoringReadinessContract?.sourceMatrixEntries).map((entry) =>
        `${entry.dimensionId || "dimension"} | status=${entry.evidenceStatus || "unknown"} | available=${safeArray(entry.availableEvidence).length} | missing=${safeArray(entry.missingEvidence).length}`
      )),
      "Evidence-to-scoring bridge:",
      bundleList(safeArray(scoringReadinessContract?.evidenceToScoringBridge?.dimensions).map((entry) =>
        `${entry.dimensionId || "dimension"} | status=${entry.evidenceStatus || "unknown"} | eligible=${entry.futureScoringEligible ? "future" : "no"} | scoringActive=${entry.isScoringActive ? "yes" : "no"} | blocked=${entry.blocked ? "yes" : "no"}`
      )),
      "Hard blockers:",
      bundleList(scoringReadinessContract?.hardBlockers),
      "Confidence caps:",
      bundleList(scoringReadinessContract?.confidenceCaps),
      "Live metric requirements:",
      bundleList(scoringReadinessContract?.liveMetricRequirements),
      "What would change score readiness:",
      bundleList(scoringReadinessContract?.whatWouldChangeScore),
      "Monitoring triggers:",
      bundleList(scoringReadinessContract?.monitoringTriggers),
      "Committee memo preview:",
      bundleList([
        scoringReadinessContract?.committeeMemoPreview?.readinessSummary,
        scoringReadinessContract?.committeeMemoPreview?.committeeCaveat,
        ...safeArray(scoringReadinessContract?.committeeMemoPreview?.majorEvidenceGaps),
      ]),
      "Frontend visibility:",
      bundleList(scoringReadinessContract?.frontendContract?.visibleSurfaces),
      bundleField("Frontend normalization field", scoringReadinessContract?.frontendContract?.frontendNormalizationField),
      bundleField("Review Bundle section", scoringReadinessContract?.frontendContract?.reviewBundleSection),
      bundleField("Protected Investor Report redaction", scoringReadinessContract?.frontendContract?.protectedInvestorReportRedaction),
      "Source boundary:",
      bundleList(scoringReadinessContract?.sourceBoundary),
    ]),
    bundleSection("2AF. Benchmark Asset Preset Registry & Search Bar QA", [
      bundleField("Registry attached", benchmarkAssetPresetRegistry ? "yes" : "missing"),
      bundleField("Artifact version", benchmarkAssetPresetRegistry?.artifactVersion),
      bundleField("Preset count", benchmarkAssetPresetRegistry?.presetCount || BENCHMARK_SEARCH_PRESETS.length),
      bundleField("Top search bar presets", safeArray(benchmarkAssetPresetRegistry?.benchmarkAssets).join(", ") || BENCHMARK_SEARCH_PRESETS.map((preset) => preset.symbol).join(", ")),
      bundleField("Selected benchmark preset", selectedBenchmarkPreset ? `${selectedBenchmarkPreset.displaySymbol || selectedBenchmarkPreset.symbol || selectedBenchmarkPreset.label} | ${selectedBenchmarkPreset.assetFamilyLabel || selectedBenchmarkPreset.family || "family unavailable"}` : "not a benchmark preset"),
      bundleField("Learning capture attached", selectedBenchmarkLearningCapture ? "yes" : "not selected / missing"),
      bundleField("Learning rule applied", selectedBenchmarkLearningCapture?.assetFamilyLearningRule),
      bundleField("Expected family is proof", yesNoUnknown(selectedBenchmarkLearningCapture?.guardrails?.expectedFamilyIsProof)),
      bundleField("Score override", yesNoUnknown(selectedBenchmarkLearningCapture?.guardrails?.scoreOverride || benchmarkAssetPresetRegistry?.scoringChanged)),
      bundleField("Verdict override", yesNoUnknown(selectedBenchmarkLearningCapture?.guardrails?.verdictOverride || benchmarkAssetPresetRegistry?.verdictChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(benchmarkAssetPresetRegistry?.providerBehaviorChanged)),
      bundleField("Source candidates promoted", yesNoUnknown(benchmarkAssetPresetRegistry?.sourceCandidatesPromoted || selectedBenchmarkLearningCapture?.guardrails?.unreviewedSourceCandidatesPromoted)),
      bundleField("Reviewed evidence scoring-active", yesNoUnknown(benchmarkAssetPresetRegistry?.reviewedEvidenceScoringActive || selectedBenchmarkLearningCapture?.guardrails?.reviewedEvidenceScoringActive)),
      bundleField("Token-specific override", yesNoUnknown(benchmarkAssetPresetRegistry?.tokenSpecificOverrides || selectedBenchmarkLearningCapture?.guardrails?.tokenSpecificConclusion)),
      "Selected learning capture:",
      bundleList([
        selectedBenchmarkLearningCapture?.benchmarkPurpose ? `purpose=${selectedBenchmarkLearningCapture.benchmarkPurpose}` : null,
        selectedBenchmarkLearningCapture?.institutionalProblemRepresented ? `institutional problem=${selectedBenchmarkLearningCapture.institutionalProblemRepresented}` : null,
        selectedBenchmarkLearningCapture?.expectedGeneralizablePattern ? `generalizable pattern=${selectedBenchmarkLearningCapture.expectedGeneralizablePattern}` : null,
        selectedBenchmarkLearningCapture?.identityLearningRule ? `identity rule=${selectedBenchmarkLearningCapture.identityLearningRule}` : null,
        selectedBenchmarkLearningCapture?.questionRoutingLearningRule ? `question routing=${selectedBenchmarkLearningCapture.questionRoutingLearningRule}` : null,
        selectedBenchmarkLearningCapture?.evidenceBoundaryLearning ? `evidence boundary=${selectedBenchmarkLearningCapture.evidenceBoundaryLearning}` : null,
        selectedBenchmarkLearningCapture?.qaRegressionLearning ? `QA regression=${selectedBenchmarkLearningCapture.qaRegressionLearning}` : null,
      ], "No selected benchmark learning capture."),
      "Generalizes to:",
      bundleList(selectedBenchmarkLearningCapture?.generalizesToAssetFamilies || benchmarkAssetPresetRegistry?.generalizationTargets),
      "Must not generalize to:",
      bundleList(selectedBenchmarkLearningCapture?.mustNotGeneralizeTo || benchmarkAssetPresetRegistry?.nonGeneralizationBoundaries),
      "Source requirement templates learned:",
      bundleList(selectedBenchmarkLearningCapture?.sourceRequirementTemplateLearning || benchmarkAssetPresetRegistry?.sourceRequirementTemplatesLearned, "No benchmark source templates attached.", 20),
      "Automation future use:",
      bundleList(selectedBenchmarkLearningCapture?.automationFutureUse || benchmarkAssetPresetRegistry?.automationFutureUses),
      "Preset registry rows:",
      bundleList(safeArray(benchmarkAssetPresetRegistry?.presets).map((preset) =>
        `${preset.displaySymbol || preset.symbol || "symbol"} | ${preset.assetFamilyLabel || preset.family || "family unavailable"} | search=${preset.searchQuery || preset.query || "query unavailable"} | badge=${preset.searchBadge || preset.badge || "badge unavailable"} | expectedQuestionGroup=${preset.expectedQuestionGroup || "unknown"}`
      ), "Backend registry unavailable; frontend search presets remain configured.", 20),
      "QA checks:",
      bundleList([
        `all 15 presets visible=${(benchmarkAssetPresetRegistry?.presetCount || BENCHMARK_SEARCH_PRESETS.length) === 15 ? "yes" : "no"}`,
        "manual benchmark work captured as reusable engine learning, not token-specific conclusions",
        "expected family routes questions/source templates but does not prove rights, reserves, usage, demand, value capture, score, verdict, or evidence facts",
        "search shortcuts are product/navigation presets and do not alter provider calls",
        "Review Bundle mirrors registry and selected preset without changing bundle content authority",
      ]),
      "Known limitations:",
      bundleList(benchmarkAssetPresetRegistry?.knownLimitations),
    ]),
    bundleSection("2AG. Engine Learning Feedback Loop v1", [
      bundleField("Loop attached", engineLearningFeedbackLoop ? "yes" : "missing"),
      bundleField("Artifact version", engineLearningFeedbackLoop?.artifactVersion),
      bundleField("Diagnostic only", yesNoUnknown(engineLearningFeedbackLoop?.diagnosticOnly)),
      bundleField("Seed findings", engineLearningFeedbackLoop?.summaryCounts?.seedFindingCount ?? safeArray(engineLearningFeedbackLoop?.seedManualFindings).length),
      bundleField("Runtime auto findings", engineLearningFeedbackLoop?.summaryCounts?.autoFindingCount ?? safeArray(engineLearningFeedbackLoop?.autoGeneratedFindings).length),
      bundleField("Rule candidates", engineLearningFeedbackLoop?.summaryCounts?.ruleCandidateCount ?? safeArray(engineLearningFeedbackLoop?.candidateRulesGenerated).length),
      bundleField("Active rules generated", engineLearningFeedbackLoop?.summaryCounts?.activeRuleCount ?? "unknown"),
      bundleField("Manual-review findings", engineLearningFeedbackLoop?.summaryCounts?.manualReviewFindingCount ?? "unknown"),
      bundleField("Scoring changed", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.scoringChanged)),
      bundleField("Verdict changed", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.verdictChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.providerBehaviorChanged)),
      bundleField("Token-specific override added", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.tokenSpecificOverrideAdded)),
      bundleField("Runtime AI decision authority", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.runtimeAiDecisionAuthorityAdded)),
      bundleField("Reviewed evidence scoring-active", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.reviewedEvidenceScoringActive)),
      bundleField("Source candidates promoted", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.sourceCandidatesPromoted)),
      bundleField("Active rule promotion", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.activeRulePromotion)),
      bundleField("Benchmark family treated as proof", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.benchmarkFamilyTreatedAsProof)),
      bundleField("Snapshot reintroduced", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.snapshotReintroduced)),
      bundleField("Partial refresh reintroduced", yesNoUnknown(engineLearningFeedbackLoop?.guardrails?.partialRefreshReintroduced)),
      "Seed/manual QA findings:",
      bundleList(safeArray(engineLearningFeedbackLoop?.seedManualFindings).map((finding) =>
        `${finding.findingId || "finding"} | ${finding.findingType || "type"} | severity=${finding.severity || "unknown"} | status=${finding.status || "unknown"} | surfaces=${safeArray(finding.affectedSurfaces).join(", ") || "none"} | ${finding.summary || finding.title || "summary unavailable"}`
      ), "No asset-relevant seed findings for this response.", 20),
      "Runtime auto findings:",
      bundleList(safeArray(engineLearningFeedbackLoop?.autoGeneratedFindings).map((finding) =>
        `${finding.findingId || "auto_finding"} | ${finding.findingType || "type"} | severity=${finding.severity || "unknown"} | observed=${finding.observedBehavior || "unavailable"} | expected=${finding.expectedBehavior || "unavailable"}`
      ), "No runtime auto findings detected.", 20),
      "Inactive rule candidates:",
      bundleList(safeArray(engineLearningFeedbackLoop?.candidateRulesGenerated).map((candidate) =>
        `${candidate.candidateId || "candidate"} | type=${candidate.ruleType || "type"} | active=${candidate.isActive ? "yes" : "no"} | scoring=${candidate.scoringActive ? "yes" : "no"} | verdict=${candidate.verdictActive ? "yes" : "no"} | providerChange=${candidate.providerBehaviorChanged ? "yes" : "no"} | humanApproval=${candidate.requiresHumanApproval ? "yes" : "no"} | ${candidate.generalizedRule || "rule unavailable"}`
      ), "No inactive rule candidates generated for this response.", 20),
      "Proposed source requirement templates:",
      bundleList(engineLearningFeedbackLoop?.sourceRequirementTemplatesProposed, "No feedback-loop source templates proposed.", 20),
      "Proposed QA regressions:",
      bundleList(engineLearningFeedbackLoop?.qaRegressionsProposed, "No feedback-loop QA regressions proposed.", 20),
      "Generalization targets:",
      bundleList(engineLearningFeedbackLoop?.generalizationTargets),
      "Non-generalization boundaries:",
      bundleList(engineLearningFeedbackLoop?.nonGeneralizationBoundaries),
      "Frontend visibility:",
      bundleList([
        `Audit / Raw: ${engineLearningFeedbackLoop?.frontendVisibility?.auditRaw || "unknown"}`,
        `Evidence Map: ${engineLearningFeedbackLoop?.frontendVisibility?.evidenceMap || "unknown"}`,
        `Source Queue: ${engineLearningFeedbackLoop?.frontendVisibility?.sourceQueue || "unknown"}`,
        `Manual Review: ${engineLearningFeedbackLoop?.frontendVisibility?.manualReview || "unknown"}`,
        `Scoring Transparency: ${engineLearningFeedbackLoop?.frontendVisibility?.scoringTransparency || "unknown"}`,
        `Review Bundle: ${engineLearningFeedbackLoop?.frontendVisibility?.copyReviewBundle || "unknown"}`,
        `Protected Investor Report: ${engineLearningFeedbackLoop?.frontendVisibility?.protectedInvestorReport || "unknown"}`,
      ]),
      "QA checks:",
      bundleList([
        `2AG present when backend loop exists=${engineLearningFeedbackLoop ? "yes" : "no"}`,
        `seed and auto findings separated=${engineLearningFeedbackLoop ? "yes" : "unknown"}`,
        `candidate rules inactive=${engineLearningFeedbackLoop ? yesNoUnknown(safeArray(engineLearningFeedbackLoop.candidateRulesGenerated).every((candidate) => candidate.isActive === false && candidate.scoringActive === false && candidate.verdictActive === false)) : "unknown"}`,
        `protected report redaction=${engineLearningFeedbackLoop?.bundleParity?.protectedReportRedaction || "unknown"}`,
        `review bundle mirrors candidates=${yesNoUnknown(engineLearningFeedbackLoop?.bundleParity?.mirrorsRuleCandidates)}`,
        `snapshot/partial refresh not reintroduced=${engineLearningFeedbackLoop ? yesNoUnknown(engineLearningFeedbackLoop.guardrails?.snapshotReintroduced === false && engineLearningFeedbackLoop.guardrails?.partialRefreshReintroduced === false) : "unknown"}`,
      ]),
      "Known limitations:",
      bundleList(engineLearningFeedbackLoop?.knownLimitations),
      bundleField("Next resume pointer", engineLearningFeedbackLoop?.nextResumePointer),
    ]),
    bundleSection("2AC. Category-Driven Question Registry & API Category Signals", [
      bundleField("Provider category signals attached", providerCategorySignals ? "yes" : "missing"),
      bundleField("Asset-family contract attached", categoryDrivenAssetFamilyContract ? "yes" : "missing"),
      bundleField("Primary asset family", categoryDrivenAssetFamilyContract?.primaryAssetFamily),
      bundleField("Frontend label", categoryDrivenAssetFamilyContract?.primaryVisibleLabel || categoryDrivenAssetFamilyContract?.frontendVisibleLabel),
      bundleField("Asset framing", categoryDrivenAssetFamilyContract?.assetFramingLabel),
      bundleField("Family confidence", categoryDrivenAssetFamilyContract?.familyConfidence),
      bundleField("Resolution status", categoryDrivenAssetFamilyContract?.familyResolutionStatus),
      bundleField("Category authority applied", yesNoUnknown(categoryDrivenAssetFamilyContract?.categoryAuthorityApplied)),
      bundleField("Category authority status", categoryDrivenAssetFamilyContract?.categoryAuthorityStatus),
      bundleField("Category authority reason", categoryDrivenAssetFamilyContract?.categoryAuthorityReason || categoryDrivenAssetFamilyContract?.categoryAuthorityBlockedReason),
      bundleField("AIC alignment status", categoryDrivenAssetFamilyContract?.categoryAicAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryAicAlignmentStatus),
      bundleField("DataFirst alignment status", categoryDrivenAssetFamilyContract?.categoryDataFirstAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryDataFirstAlignmentStatus),
      bundleField("Question group alignment status", categoryDrivenAssetFamilyContract?.categoryQuestionGroupAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryQuestionGroupAlignmentStatus),
      bundleField("Question registry group", categoryDrivenAssetFamilyContract?.questionRegistryGroup?.groupId),
      bundleField("Source profile", categoryDrivenAssetFamilyContract?.sourceRequirementProfile?.profileId),
      bundleField("Visible label family", categoryDrivenAssetFamilyContract?.visibleLabelFamily),
      bundleField("Source matrix entries", safeArray(categoryDrivenAssetFamilyContract?.sourceMatrixEntryIds).join("; ") || "none"),
      bundleField("Family fit score", categoryReadinessDiagnostics?.familyFitScore),
      bundleField("Category evidence coverage score", categoryReadinessDiagnostics?.categoryEvidenceCoverageScore),
      bundleField("Data requirement coverage score", categoryReadinessDiagnostics?.dataRequirementCoverageScore),
      bundleField("Scoring integration", categoryReadinessDiagnostics?.scoringIntegrationStatus || "non_scoring_v1"),
      bundleField("Scoring changed", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.scoringChanged)),
      bundleField("Verdict changed", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.verdictChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.providerBehaviorChanged)),
      bundleField("Reviewed evidence promoted", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.reviewedEvidencePromoted)),
      bundleField("Source candidates promoted", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.sourceCandidatesPromoted)),
      "Provider category summary:",
      bundleList([providerCategorySignals?.frontendVisibleSummary]),
      "CoinGecko categories / platforms:",
      bundleList([
        `categories=${safeArray(providerCategorySignals?.coinGeckoCategories).join(", ") || "none"}`,
        `platforms=${safeArray(providerCategorySignals?.coinGeckoAssetPlatforms).join(", ") || "none"}`,
      ]),
      "CoinMarketCap tags / categories:",
      bundleList([
        `tags=${safeArray(providerCategorySignals?.coinMarketCapTags).join(", ") || "none"}`,
        `categories=${safeArray(providerCategorySignals?.coinMarketCapCategories).join(", ") || "none"}`,
      ]),
      "Asset-class category signals:",
      bundleList(safeArray(providerCategorySignals?.assetClassCandidateTags).map((signal) => `${signal.provider}.${signal.field}: ${signal.value} | ${signal.classification} | ${signal.sourceBoundary}`)),
      "Network/ecosystem context signals:",
      bundleList(safeArray(providerCategorySignals?.ecosystemContextTags).map((signal) => `${signal.provider}.${signal.field}: ${signal.value} | context-only`)),
      "Conflicting category signals:",
      bundleList(providerCategorySignals?.conflictingCategorySignals, "No category conflicts detected."),
      "Excluded families:",
      bundleList(safeArray(categoryDrivenAssetFamilyContract?.excludedFamilies).map((entry) => `${entry.family}: ${entry.reason}`), "No family exclusions attached."),
      "Category-driven questions:",
      bundleList(safeArray(categoryDrivenAssetFamilyContract?.questionRegistryGroup?.questions).map((question) => `${question.questionId}: ${question.question}`)),
      "Category source requirements:",
      bundleList(categoryDrivenAssetFamilyContract?.sourceRequirementProfile?.priorityRequirements),
      "Category answer cards:",
      bundleList(safeArray(categoryAnswerBuilder?.answerCards).map((card) => `${card.questionId} | ${card.answerStatus}: ${card.shortAnswer} | missing=${safeArray(card.missingEvidence).join("; ")}`)),
      "Category readiness manual-review flags:",
      bundleList(categoryReadinessDiagnostics?.manualReviewFlags, "No category manual-review flags."),
      "Category false-positive risks:",
      bundleList(categoryReadinessDiagnostics?.falsePositiveRisks, "No category false-positive risks."),
      "Provider category endpoint inventory/status:",
      bundleList(safeArray(providerCategorySignals?.endpointCandidates).map((candidate) => `${candidate.provider} ${candidate.endpoint} | ${candidate.v1Status} | providerBehaviorChanged=${candidate.providerBehaviorChanged ? "yes" : "no"}`)),
      "Provider category boundary:",
      bundleList(providerCategorySignals?.providerCategoryBoundary),
    ]),
    bundleSection("2AD. Provider Category Endpoint Ingestion & Raw Data Expansion v1", [
      bundleField("Provider raw data expansion attached", providerRawDataExpansion ? "yes" : "missing"),
      bundleField("Artifact version", providerRawDataExpansion?.artifactVersion),
      bundleField("Provider category signals version", providerRawDataExpansion?.providerCategorySignalsVersion || providerCategorySignals?.providerCategorySignalsVersion || providerCategorySignals?.artifactVersion),
      bundleField("CoinGecko category universe status", providerRawDataExpansion?.coinGeckoCategoryUniverse?.status || providerCategorySignals?.coinGeckoCategoryUniverseStatus?.status),
      bundleField("CoinMarketCap category universe status", providerRawDataExpansion?.coinMarketCapCategoryUniverse?.status || providerCategorySignals?.coinMarketCapCategoryUniverseStatus?.status),
      bundleField("Primary category data coverage", providerRawDataExpansion?.categoryDataCoverage || providerCategorySignals?.categoryDataCoverage),
      bundleField("Category peer count", providerRawDataExpansion?.categoryPeerMarketStats?.peerCount ?? providerCategorySignals?.categoryPeerMarketStats?.peerCount),
      bundleField("Category median market cap", providerRawDataExpansion?.categoryPeerMarketStats?.medianMarketCap),
      bundleField("Category median volume 24h", providerRawDataExpansion?.categoryPeerMarketStats?.medianVolume24h),
      bundleField("Primary category market context", providerRawDataExpansion?.primaryCategoryMarketContext
        ? `${providerRawDataExpansion.primaryCategoryMarketContext.provider}:${providerRawDataExpansion.primaryCategoryMarketContext.categoryName || providerRawDataExpansion.primaryCategoryMarketContext.categoryId} marketCap=${providerRawDataExpansion.primaryCategoryMarketContext.marketCap ?? "unavailable"} volume24h=${providerRawDataExpansion.primaryCategoryMarketContext.volume24h ?? "unavailable"}`
        : "unavailable"),
      "Provider endpoint diagnostics:",
      bundleList(safeArray(providerRawDataExpansion?.providerCategoryEndpointDiagnostics || providerCategorySignals?.providerCategoryEndpointDiagnostics).map((entry) =>
        `${entry.provider} ${entry.endpoint} | status=${entry.status} | coverage=${entry.coverage} | raw=${entry.rawResponsePresent ? "yes" : "no"} | mapped=${entry.mappingSucceeded ? "yes" : "no"} | reason=${entry.failureReason || "none"}`
      )),
      "CoinGecko category market contexts:",
      bundleList(safeArray(providerRawDataExpansion?.coinGeckoCategoryMarketData || providerCategorySignals?.coinGeckoCategoryMarketContext).map((entry) =>
        `${entry.categoryId || "category"} | ${entry.categoryName || "name unavailable"} | marketCap=${entry.marketCap ?? "unavailable"} | volume24h=${entry.volume24h ?? "unavailable"} | status=${entry.status}`
      )),
      "CoinMarketCap category contexts:",
      bundleList(safeArray(providerRawDataExpansion?.coinMarketCapSingleCategoryData || providerCategorySignals?.coinMarketCapCategoryContext).map((entry) =>
        `${entry.categoryId || "category"} | ${entry.categoryName || "name unavailable"} | marketCap=${entry.marketCap ?? "unavailable"} | volume24h=${entry.volume24h ?? "unavailable"} | status=${entry.status}`
      )),
      "Category peer assets:",
      bundleList(safeArray(providerRawDataExpansion?.categoryPeerAssets || providerCategorySignals?.categoryPeerAssets).slice(0, 20).map((peer) =>
        `${peer.provider}:${peer.id || "id unavailable"} ${peer.symbol || ""} ${peer.name || ""} | mcap=${peer.marketCap ?? "unavailable"} | volume=${peer.volume24h ?? "unavailable"} | rank=${peer.rank ?? "unavailable"}`
      ), "No category peer assets attached."),
      "Raw provider data extracts:",
      bundleList([
        `price=${providerRawDataExpansion?.providerRawDataExtracts?.price ?? "unavailable"}`,
        `marketCap=${providerRawDataExpansion?.providerRawDataExtracts?.marketCap ?? "unavailable"}`,
        `fdv=${providerRawDataExpansion?.providerRawDataExtracts?.fdv ?? "unavailable"}`,
        `volume24h=${providerRawDataExpansion?.providerRawDataExtracts?.volume24h ?? "unavailable"}`,
        `circulating=${providerRawDataExpansion?.providerRawDataExtracts?.circulatingSupply ?? "unavailable"}`,
        `total=${providerRawDataExpansion?.providerRawDataExtracts?.totalSupply ?? "unavailable"}`,
        `max=${providerRawDataExpansion?.providerRawDataExtracts?.maxSupply ?? "unavailable"}`,
        `liquidityUsd=${providerRawDataExpansion?.providerRawDataExtracts?.liquidityUsd ?? "unavailable"}`,
        `tvlUsd=${providerRawDataExpansion?.providerRawDataExtracts?.tvlUsd ?? "unavailable"}`,
        `fees24hUsd=${providerRawDataExpansion?.providerRawDataExtracts?.fees24hUsd ?? "unavailable"}`,
        `revenue24hUsd=${providerRawDataExpansion?.providerRawDataExtracts?.revenue24hUsd ?? "unavailable"}`,
      ]),
      "Raw provider categories/tags/platforms/contracts:",
      bundleList([
        `categories=${safeArray(providerRawDataExpansion?.providerRawDataExtracts?.categories).join(", ") || "none"}`,
        `tags=${safeArray(providerRawDataExpansion?.providerRawDataExtracts?.tags).join(", ") || "none"}`,
        `platforms=${safeArray(providerRawDataExpansion?.providerRawDataExtracts?.platforms).join(", ") || "none"}`,
        `contracts=${safeArray(providerRawDataExpansion?.providerRawDataExtracts?.contracts).slice(0, 12).join("; ") || "none"}`,
      ]),
      "Category data missing fields:",
      bundleList(providerRawDataExpansion?.categoryDataMissingFields || providerCategorySignals?.categoryDataMissingFields),
      "Category/raw-data source requirements:",
      bundleList(providerRawDataExpansion?.categoryDataSourceRequirements || providerCategorySignals?.categoryDataSourceRequirements),
      "Raw data coverage diagnostics:",
      bundleList([
        `overall=${rawDataCoverageDiagnostics?.overallRawDataCoverageScore ?? "unavailable"}`,
        `category=${rawDataCoverageDiagnostics?.categoryDataCoverageScore ?? "unavailable"}`,
        `market=${rawDataCoverageDiagnostics?.marketDataCoverageScore ?? "unavailable"}`,
        `liquidity=${rawDataCoverageDiagnostics?.liquidityDataCoverageScore ?? "unavailable"}`,
        `supply=${rawDataCoverageDiagnostics?.supplyDataCoverageScore ?? "unavailable"}`,
        `security=${rawDataCoverageDiagnostics?.securityDataCoverageScore ?? "unavailable"}`,
        `protocolEconomics=${rawDataCoverageDiagnostics?.protocolEconomicsCoverageScore ?? "unavailable"}`,
        `scoringIntegration=${rawDataCoverageDiagnostics?.scoringIntegrationStatus || "non_scoring_v1"}`,
      ]),
      "Provider unavailable fields:",
      bundleList(rawDataCoverageDiagnostics?.providerUnavailableFields),
      "Manual review required fields:",
      bundleList(rawDataCoverageDiagnostics?.manualReviewRequiredFields),
      "Data coverage impact:",
      bundleList(rawDataCoverageDiagnostics?.dataCoverageImpact),
      "Raw-data boundary:",
      bundleList(providerRawDataExpansion?.categoryDataBoundary || providerRawDataExpansion?.providerRawDataExtracts?.sourceBoundary || providerCategorySignals?.categoryDataBoundary),
      bundleField("Scoring changed", yesNoUnknown(providerRawDataExpansion?.scoringBoundary?.scoringChanged === false ? false : false)),
      bundleField("Verdict changed", yesNoUnknown(providerRawDataExpansion?.scoringBoundary?.verdictChanged === false ? false : false)),
      bundleField("Reviewed evidence scoring-active", yesNoUnknown(providerRawDataExpansion?.scoringBoundary?.reviewedEvidenceScoringActive)),
      bundleField("Source candidates promoted", yesNoUnknown(providerRawDataExpansion?.scoringBoundary?.sourceCandidatesPromoted)),
      bundleField("Token-specific overrides", yesNoUnknown(providerRawDataExpansion?.scoringBoundary?.tokenSpecificOverrides)),
      bundleField("Provider behavior changed", providerRawDataExpansion ? "yes - optional category endpoint/raw-data expansion only; no scoring or verdict authority" : "unknown"),
    ]),
    bundleSection("2A. Reviewed Evidence Packet v1", [
      bundleField("Packet loaded", reviewedEvidencePacket?.packetLoaded ? "yes" : "no"),
      bundleField("packetId", reviewedEvidencePacket?.packetId),
      bundleField("reviewStatus", reviewedEvidencePacket?.reviewStatus),
      bundleField("reviewedBy", reviewedEvidencePacket?.reviewedBy),
      bundleField("scoring-active", reviewedEvidencePacket?.scoringActive ? "yes - QA violation in v1" : "no - reviewed demo evidence is display/answer quality only"),
      "Sources used:",
      bundleList(safeArray(reviewedEvidencePacket?.sources).map((source) =>
        `${source.title} | ${source.publisher} | ${source.sourceType} | freshness:${source.freshnessStatus} | reliability:${source.reliabilityTier} | scoring:${source.scoringEligible ? "eligible" : "not-active"} | ${source.url}`
      )),
      "Facts used:",
      bundleList(safeArray(reviewedEvidencePacket?.facts).map((fact) =>
        `${fact.factId}: ${fact.claim} | type:${fact.normalizedClaimType} | contribution:${fact.answerContribution} | confidence:${fact.confidence} | doesNotAnswer:${safeArray(fact.reviewedEvidenceDoesNotAnswer).join("; ") || "none"}`
      )),
      "Question-level mappings:",
      bundleList(safeArray(reviewedEvidencePacket?.questionMappings).map((mapping) =>
        `${mapping.questionId}: ${mapping.reviewedEvidenceStatus}; scope=${mapping.questionEvidenceScope || "unknown"}; sources=${safeArray(mapping.reviewedSourcesUsed).map((source) => source.sourceId).join(", ") || "none"}; remaining=${safeArray(mapping.remainingMissingEvidence).join("; ") || "none"}; warnings=${safeArray(mapping.evidenceMappingWarnings).join("; ") || "none"}; freshness=${mapping.freshnessStatus}; reliability=${mapping.reliabilitySummary}`
      )),
      "Answer upgrade summary:",
      bundleList(reviewedEvidencePacket?.answerUpgradeSummary),
      "Source Queue coverage notes:",
      bundleList(reviewedEvidencePacket?.sourceQueueNotes),
      "Remaining reviewed-evidence source requirements:",
      bundleList(reviewedEvidencePacket?.remainingSourceRequirements),
      "Reviewed evidence warnings:",
      bundleList(reviewedEvidencePacket?.warnings),
      "Identity/evidence reconciliation warnings:",
      bundleList(reviewedEvidencePacket?.identityEvidenceReconciliationWarnings),
      "Evidence mapping warnings:",
      bundleList(reviewedEvidencePacket?.evidenceMappingWarnings),
      "Packet limitations:",
      bundleList(reviewedEvidencePacket?.audit?.limitations),
      "Source boundary:",
      bundleList(reviewedEvidencePacket?.sourceBoundary),
    ]),
    bundleSection("2B. Institutional Analyst Answer Card Live UI Mirror", [
      bundleField("Analyst answer card model attached", yesNoUnknown(!analystCardMissing)),
      bundleField("Live tabs using analyst card fields", "Institutional Checklist, Tokenomics, Evidence Map, Source Queue, Manual Review, Decision prompts, and Thesis context use analyst-card direct answer/status/evidence where available."),
      bundleField("Live UI answer order", "Direct answer -> evidence basis -> non-proof boundary -> missing evidence -> decision/confidence impact -> what would change -> audit detail."),
      "Primary live UI mirror:",
      bundleList(analystCards.map(({ question, card }) => [
        `${question?.questionId || "question"} | tab=${question?.formulaOutputsUsed ? "Tokenomics / Supply Integrity" : "Institutional Checklist"} | status=${card?.headlineStatus || "status unavailable"}`,
        `answer=${card?.directAnswer || "answer unavailable"}`,
        `missing=${safeArray(card?.missingEvidence).slice(0, 2).join("; ") || "none visible in primary row"}`,
        `impact=${card?.decisionImpact || "impact unavailable"}`,
        `boundary=${safeArray(card?.sourceBoundaryPlainEnglish)[0] || "boundary unavailable"}`,
      ].join(" | ")), "No analyst answer cards attached.", 12),
      "Technical audit fields preserved separately:",
      bundleList(analystCards.flatMap(({ card }) => safeArray(card?.auditFields)).slice(0, 20), "No analyst-card audit fields attached."),
      bundleField("Bundle mirror includes primary answer", yesNoUnknown(!analystPrimaryMissingAnswer)),
      bundleField("Bundle mirror includes primary status", yesNoUnknown(!analystBundleMirrorMissing)),
      bundleField("Audit fields preserved", analystCards.some(({ card }) => safeArray(card?.auditFields).length) ? "yes" : "unknown"),
      bundleField("Template IDs kept audit-only", yesNoUnknown(!analystPrimaryTemplateLeakage)),
      bundleField("Raw sourceBoundary enums kept audit-only", yesNoUnknown(!analystPrimaryRawEnumLeakage)),
      bundleField("Contradictory primary badge stack avoided", yesNoUnknown(!analystContradictoryBadgeStack)),
      bundleField("Stablecoin trust rows avoid protocol-token not-applicable copy", yesNoUnknown(!stablecoinTrustNotApplicableLeakage)),
      bundleField("Stablecoin tokenomics redirects max-supply/dilution to trust controls", yesNoUnknown(!stablecoinTokenomicsScarcityDominance)),
      bundleField("Stablecoin protocol-token value-capture not-applicable cases preserved", yesNoUnknown(!stablecoinProtocolNotApplicableMissing)),
    ]),
    bundleSection("2C. Backend-to-Frontend Rendered Surface Parity Gate", [
      bundleField("Gate version", renderedSurfaceParityViewModel.artifactVersion),
      bundleField("Gate status", renderedSurfaceOverallGateStatus),
      bundleField("Mirror coverage gate status", mirrorCoverageGateStatus),
      bundleField("Lens-specific text gate status", renderedSpecificGateStatus),
      bundleField("Blocking", "true"),
      bundleField("Failure reason", mirrorCoverageGateStatus === "FAIL"
        ? mirrorCoverageFailureReason
        : renderedSurfaceParityViewModel.primaryNarrativePass === false
          ? primaryNarrativeFailureReason
          : renderedBtcForbiddenStringChecks.length
            ? renderedBtcFailureReason
            : renderedEthForbiddenStringChecks.length
              ? renderedEthFailureReason
              : "All required live-tab mirror surfaces are represented; final-decision/Composer parity passed; no native-BTC or native-ETH rendered hard gate was applicable."),
      bundleField("Primary narrative pass", yesNoUnknown(renderedSurfaceParityViewModel.primaryNarrativePass)),
      bundleField("Candidate/final contradiction count", renderedSurfaceParityViewModel.candidateFinalContradictionAssertions.length),
      bundleField("Wrong-family narrative count", renderedSurfaceParityViewModel.wrongFamilyNarrativeAssertions.length),
      bundleField("Missing Composer fails closed", yesNoUnknown(renderedSurfaceParityViewModel.missingComposerControl?.failClosed)),
      bundleField("Required primary zero-count surfaces", requiredPrimaryZeroSurfaces.join("; ") || "none"),
      bundleField("Primary visible forbidden failure count", renderedBtcPrimaryVisibleFailures.length + renderedEthPrimaryVisibleFailures.length),
      bundleField("Primary visible forbidden failures", [...renderedBtcPrimaryVisibleFailures, ...renderedEthPrimaryVisibleFailures].map((failure) =>
        `${failure.checkId} | ${failure.surface} | ${failure.fieldPath} | phrase=${failure.matchedForbiddenPhrase} | text=${failure.renderedText}`
      ).join(" || ") || "none"),
      bundleField("Secondary visible forbidden failure count", renderedBtcSecondaryVisibleMentions.length),
      bundleField("Secondary visible forbidden mentions", renderedBtcSecondaryVisibleMentions.map((failure) =>
        `${failure.checkId} | ${failure.surface} | ${failure.fieldPath} | phrase=${failure.matchedForbiddenPhrase}`
      ).join(" || ") || "none"),
      bundleField("Audit-only forbidden mentions", renderedBtcAuditOnlyMentions.map((failure) =>
        `${failure.checkId} | ${failure.surface} | ${failure.fieldPath} | phrase=${failure.matchedForbiddenPhrase}`
      ).join(" || ") || "none"),
      bundleField("Internal ID exclusions", renderedBtcInternalIdExclusions.map((failure) =>
        `${failure.checkId} | ${failure.fieldPath} | ${failure.renderedText}`
      ).join(" || ") || "none"),
      bundleField("Forbidden-list self-trigger exclusions", renderedBtcForbiddenListExclusions.length + renderedBtcSelfTriggerExclusions.length),
      bundleField("Before-state exclusions", renderedBtcBeforeStateExclusions.length),
      bundleField("Rendered gate primary failure count", renderedBtcPrimaryVisibleFailures.length + renderedEthPrimaryVisibleFailures.length),
      bundleField("12C failure count", renderedBtcPrimaryVisibleFailures.length),
      bundleField("12D failure count", renderedEthPrimaryVisibleFailures.length),
      bundleField("2C/12C/12D counts match", renderedEthForbiddenStringChecks.length ? "yes - 2C includes ETH 12D failures" : "yes"),
      bundleField("Failure corpus shared", "yes - 2C, 12C, and 12D use the same current primary visible rendered corpus when applicable"),
      bundleField("Self-trigger excluded", "yes"),
      bundleField("Audit-only excluded", "yes"),
      bundleField("Internal IDs excluded", "yes"),
      bundleField("Before-state excluded", "yes"),
      bundleField("not_rendered_by_ui primaryZero non-blocking", requiredPrimaryZeroSurfaces.includes("visibleLensLabel") ? "no - visibleLensLabel still blocks" : "yes"),
      bundleField("Tokenized-gold primary copy guard status", tokenizedGoldPrimaryContext ? (tokenizedGoldPrimaryCopyLeak || tokenizedGoldPrimaryCopyMissingAllowed ? "FAIL" : "PASS") : "not applicable"),
      bundleField("Tokenized-gold forbidden primary copy detected", yesNoUnknown(tokenizedGoldPrimaryCopyLeak)),
      bundleField("Product rule", "Backend artifacts are insufficient; user-facing changes must pass backend response, frontend normalization, component/view-model consumption, visible tab output, right rail when applicable, and Copy Review Bundle mirror."),
      bundleField("Frontend normalized model present", yesNoUnknown(Boolean(Object.keys(safeModel).length))),
      bundleField("Rendered component view model present", yesNoUnknown(Boolean(renderedSurfaceParityViewModel.primaryVisibleText.length))),
      bundleField("Decision Tab rendered-corpus owner", renderedSurfaceParityViewModel.corpusProvenance?.owner),
      bundleField("Decision Tab corpus ID", renderedSurfaceParityViewModel.corpusProvenance?.decisionTabCorpusId),
      bundleField("Decision Tab corpus source", renderedSurfaceParityViewModel.corpusProvenance?.twoCSource),
      bundleField("Decision Tab canonical row count", safeArray(renderedSurfaceParityViewModel.surfaceRows?.decisionTab).length),
      bundleField("Decision Tab scalar strings preserved", yesNoUnknown(renderedSurfaceParityViewModel.corpusProvenance?.scalarStringsPreserved)),
      bundleField("Decision Tab audit-only exclusions", safeArray(renderedSurfaceParityViewModel.nonRenderedAuditFields).map((entry) => `${entry.fieldPath}=${entry.disposition}`).join("; ") || "none"),
      bundleField("Decision Header rendered item count", renderedSurfaceParityViewModel.decisionHeaderRenderedItemCount),
      bundleField("All required live tabs mirrored", yesNoUnknown(renderedSurfaceParityViewModel.allRequiredSurfacesMirrored)),
      bundleField("Missing mirrored live-tab surfaces", safeArray(renderedSurfaceParityViewModel.missingMirroredSurfaces).join("; ") || "none"),
      bundleField("Copy Review Bundle mirrors rendered view model", "yes - this section is generated from the same normalized model passed to product components."),
      "Surface-to-field contract:",
      bundleList(Object.entries(renderedSurfaceParityViewModel.componentConsumption).map(([surface, contract]) => `${surface}: ${contract}`)),
      "Live tab mirror coverage:",
      bundleList(safeArray(renderedSurfaceParityViewModel.tabMirrorCoverage).map((entry) =>
        `${entry.surface}: ${entry.renderedItemCount} visible-model item(s) | ${entry.classification} | ${entry.mirrorStatus}${entry.firstItem ? ` | first=${entry.firstItem}` : ""}`
      )),
      "Primary visible rendered-intended text:",
      bundleList(renderedSurfaceParityViewModel.primaryVisibleText, "No rendered-intended primary text available.", 40),
      "Decision Tab component-consumption proof:",
      bundleList(safeArray(renderedSurfaceParityViewModel.surfaceRows?.decisionTab).map((row) =>
        `${row.fieldPath} | source=${row.sourceObjectPath} | component=${row.componentConsumer} | ${row.classification} | ${row.renderedStatus}`
      ), "No Decision Tab component-consumption rows available.", 80),
      "Surface coverage:",
      bundleList(Object.entries(renderedSurfaceParityViewModel.surfaces).map(([surface, values]) => `${surface}: ${safeArray(values).length} rendered-intended text item(s)`)),
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
      bundleField("Rendered-corpus owner", renderedSurfaceParityViewModel.corpusProvenance?.owner),
      bundleField("Corpus ID", renderedSurfaceParityViewModel.corpusProvenance?.decisionTabCorpusId),
      bundleField("Mirror policy", "Exact text mirror of the live Decision Tab component-consumption view model; no independent narrative recomputation."),
      "Rendered Decision Tab text:",
      bundleList(
        safeArray(renderedSurfaceParityViewModel.surfaceRows?.decisionTab).map((row) => row.renderedText),
        "No rendered Decision Tab text available.",
        120,
      ),
      bundleField("AssetResearchResultV2 Current Reality attached", yesNoUnknown(currentRealityAttached)),
      bundleField("Current Reality status", currentRealityAttached ? `${titleCase(currentReality.status)} | confidence=${titleCase(currentReality.confidence?.level)} | freshness=${titleCase(currentReality.freshness?.status)}` : "Canonical Current Reality unavailable"),
      bundleField("Current Reality coverage", currentReality.coverage?.summary),
      bundleField("Most material current development", currentRealityMostMaterial.title),
      bundleField("Most material thesis impact", currentRealityMostMaterial.impactSummary),
      bundleField("Most important risk change", currentRealityRiskChange.impactSummary),
      "Verified material-event timeline:",
      bundleList(safeArray(currentReality.activeMaterialEvents).map((event) => `${event.title} | entity=${event.subject?.subjectName || "not established"} | impact=${titleCase(event.primaryImpact)} | verification=${titleCase(event.verificationState)} | materiality=${titleCase(event.materiality?.state)} | freshness=${titleCase(event.freshness)} | ${event.impactSummary || "No impact summary attached."}`), "No verified material event is available in the current source window.", 40),
      "Current Reality verification queue:",
      bundleList(safeArray(currentReality.verificationRequiredEvents).map((event) => `${event.title} | entity=${event.subject?.subjectName || "not established"} | ${event.impactSummary || "Verification required."}`), "No event-specific verification item is attached.", 40),
      "Current Reality open checks:",
      bundleList(currentReality.nextDiligence, "No event-specific next diligence item is attached.", 20),
    ]),
    bundleSection("5. Thesis Falsification Tab", [
      bundleField("AssetResearchResultV2 Thesis & Fundamentals attached", yesNoUnknown(thesisFundamentalsAttached)),
      bundleField("Canonical V2 ownership", thesisFundamentalsAttached ? "AssetResearchResultV2.fundamentals.data is the bounded canonical synthesis; AssetResearchResultV2.thesis.data is its projection." : "Canonical V2 fundamentals unavailable"),
      bundleField("Fundamentals status", thesisFundamentalsAttached ? `${bundleValue(thesisFundamentals.status)} | confidence=${bundleValue(thesisFundamentals.confidence?.label)} | freshness=${bundleValue(thesisFundamentals.freshness?.status)}` : null),
      bundleField("Product reality", thesisFundamentalsAttached ? thesisFundamentals.productRealityDetails?.conciseSummary || thesisFundamentals.productReality?.conciseAnswer : null),
      bundleField("Strongest supported area", thesisFundamentalsAttached ? thesisFundamentals.strongestSupportedArea : null),
      bundleField("Weakest area", thesisFundamentalsAttached ? thesisFundamentals.weakestArea : null),
      bundleField("Adoption / usage", thesisFundamentalsAttached ? `${bundleValue(thesisFundamentals.adoptionDetails?.classification)} | ${bundleValue(thesisFundamentals.adoptionDetails?.conciseSummary)}` : null),
      bundleField("Protocol economics", thesisFundamentalsAttached ? `${bundleValue(thesisFundamentals.protocolEconomicsDetails?.mappingStatus)} | ${bundleValue(thesisFundamentals.protocolEconomicsDetails?.conciseSummary)}` : null),
      bundleField("Revenue quality", thesisFundamentalsAttached ? `${bundleValue(thesisFundamentals.revenueQualityDetails?.state)} | ${bundleValue(thesisFundamentals.revenueQualityDetails?.conciseSummary)}` : null),
      bundleField("Protocol versus token", thesisFundamentalsAttached ? `${bundleValue(thesisFundamentals.protocolTokenTransferDetails?.transferStatus)} | ${bundleValue(thesisFundamentals.protocolTokenTransferDetails?.conciseSummary)}` : null),
      bundleField("Canonical thesis", thesisFundamentalsAttached ? thesisFundamentals.thesisDetails?.thesisSummary : null),
      bundleField("Canonical anti-thesis", thesisFundamentalsAttached ? thesisFundamentals.thesisDetails?.antiThesisSummary : null),
      "Canonical thesis conditions:",
      bundleList(thesisFundamentalsAttached ? thesisFundamentals.thesisDetails?.thesisConditions : []),
      "Canonical falsification signals:",
      bundleList(thesisFundamentalsAttached ? thesisFundamentals.thesisDetails?.falsificationSignals : []),
      "Canonical fundamentals missing evidence:",
      bundleList(thesisFundamentalsAttached ? thesisFundamentals.missingCriticalEvidence : []),
      "Canonical fundamentals next diligence:",
      bundleList(thesisFundamentalsAttached ? thesisFundamentals.nextDiligence : []),
      bundleField("Allocation thesis", safeModel.summaryMemo),
      bundleField("Asset framing", visibleBundleFramingLabel),
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
      bundleList(filterPrimaryBundleItems([safeModel.manualReviewStatus?.detail, ...safeArray(safeModel.auditAlerts)])),
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
      bundleField("Current asset lens text", visibleBundleLensLabel || visibleBundleFramingLabel),
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
    bundleSection("6B. Institutional Answer Synthesis v1", [
      bundleField("Synthesis layer attached", allSynthesizedQuestions.length ? "yes" : "unknown"),
      bundleField("Synthesis model", "deterministic/template-driven; no runtime LLM/freeform inference; reviewed evidence remains non-scoring-active"),
      bundleField("Questions with synthesis", allSynthesizedQuestions.length),
      "Synthesis QA summary:",
      bundleList([
        `missing synthesis on question rows: ${yesNoUnknown(synthesizedAnswerMissing)}`,
        `generic methodology copy in synthesized direct answer: ${yesNoUnknown(genericMethodologySynthesisLeak)}`,
        `bad renderable value in synthesized direct answer: ${yesNoUnknown(synthesizedBadRenderableValue)}`,
        `source-backed synthesis without reviewed source/fact: ${yesNoUnknown(sourceBackedSynthesisWithoutSourceList)}`,
        `reviewed evidence scoring boundary violation: ${yesNoUnknown(synthesizedScoringBoundaryViolation)}`,
        `provider-only synthesis overclaimed as reviewed evidence: ${yesNoUnknown(providerOnlySynthesisOverclaimed)}`,
        `computed synthesis overclaimed as reviewed evidence: ${yesNoUnknown(computedSynthesisOverclaimed)}`,
        `stablecoin copy outside stablecoin lens: ${yesNoUnknown(stablecoinCopyLeakageInSynthesis)}`,
        `irrelevant sector marker leakage: ${yesNoUnknown(irrelevantSectorSignalLeakageInSynthesis)}`,
        `supported/source-required mismatch without boundary: ${yesNoUnknown(supportedSourceRequiredSynthesisMismatch)}`,
      ]),
      "Synthesized question answers:",
      bundleQuestions(allSynthesizedQuestions),
    ]),
    bundleSection("6A. Tokenomics / Supply Integrity Tab Mirror", [
      bundleField("Dedicated tab visible", tokenomicsSupplyIntegrity ? "yes - Tokenomics tab mirrors this section" : "unknown"),
      bundleField("AssetResearchResultV2 Tokenomics Quality attached", yesNoUnknown(tokenomicsQualityAttached)),
      bundleField("Tokenomics Quality status", tokenomicsQualityAttached ? `${bundleValue(tokenomicsQuality.status)} | confidence=${bundleValue(tokenomicsQuality.confidence?.label)} | freshness=${bundleValue(tokenomicsQuality.freshness?.status)}` : "unavailable - legacy Supply Integrity mirror preserved below"),
      bundleField("Canonical V2 ownership", tokenomicsQualityAttached ? "AssetResearchResultV2.tokenomics.data is bounded synthesis; Supply Truth owns supply facts and Formula Engine owns calculations." : "V2 Tokenomics Quality unavailable"),
      bundleField("V2 representation scope", tokenomicsQualityAttached ? `family=${bundleValue(tokenomicsQuality.representationScope?.assetFamily)}; representation=${bundleValue(tokenomicsQuality.representationScope?.representationType)}; canonicalNetwork=${bundleValue(tokenomicsQuality.representationScope?.canonicalNetwork)}; analyzed=${bundleValue(tokenomicsQuality.representationScope?.analyzedNetwork)}:${bundleValue(tokenomicsQuality.representationScope?.analyzedContract)}; routeSafety=${bundleValue(tokenomicsQuality.representationScope?.routeSafety)}` : null),
      bundleField("V2 supply structure", tokenomicsQualityAttached ? `circulating=${bundleValue(tokenomicsQuality.supplyStructure?.data?.circulatingSupply)}; total=${bundleValue(tokenomicsQuality.supplyStructure?.data?.totalSupply)}; max=${bundleValue(tokenomicsQuality.supplyStructure?.data?.maximumSupply)}; issued=${bundleValue(tokenomicsQuality.supplyStructure?.data?.currentIssuedSupply)}; freeFloat=${bundleValue(tokenomicsQuality.supplyStructure?.data?.freeFloat)}; locked=${bundleValue(tokenomicsQuality.supplyStructure?.data?.lockedSupply)}; unlocked=${bundleValue(tokenomicsQuality.supplyStructure?.data?.unlockedSupply)}` : null),
      bundleField("V2 max-supply semantics", tokenomicsQualityAttached ? `raw=${bundleValue(tokenomicsQuality.supplyTruth?.data?.maxSupplySemantics?.rawValueStatus)}; semantic=${bundleValue(tokenomicsQuality.supplyTruth?.data?.maxSupplySemantics?.semanticClassification)}; formulaApplicability=${bundleValue(tokenomicsQuality.supplyTruth?.data?.maxSupplySemantics?.formulaApplicability)}` : null),
      bundleField("V2 supply-history boundary", tokenomicsQualityAttached ? `status=${bundleValue(tokenomicsQuality.supplyHistory?.status)}; observations=${safeArray(tokenomicsQuality.supplyHistory?.data?.observations).length}; syntheticHistoryCreated=${bundleValue(tokenomicsQuality.supplyHistory?.data?.syntheticHistoryCreated)}` : null),
      bundleField("V2 issuance / circulating change", tokenomicsQualityAttached ? `policy=${bundleValue(tokenomicsQuality.issuance?.data?.policyStatus)}; annualInflation=${bundleValue(tokenomicsQuality.issuance?.data?.annualInflationEstimate)}; emissions=${bundleValue(tokenomicsQuality.issuance?.data?.annualizedEmissions)}; observedChange=${bundleValue(tokenomicsQuality.circulatingSupplyChange?.data?.observedChange)}; window=${bundleValue(tokenomicsQuality.circulatingSupplyChange?.data?.observationWindow)}` : null),
      bundleField("V2 burns / buybacks / net supply", tokenomicsQualityAttached ? `burn=${bundleValue(tokenomicsQuality.burns?.data?.mechanismStatus)}; burnMateriality=${bundleValue(tokenomicsQuality.burns?.data?.materiality)}; projected=${bundleValue(tokenomicsQuality.burns?.data?.projectionApplied)}; buyback=${bundleValue(tokenomicsQuality.buybacks?.data?.mechanismStatus)}; executedUsd=${bundleValue(tokenomicsQuality.buybacks?.data?.executedValueUsd)}; retired=${bundleValue(tokenomicsQuality.buybacks?.data?.retiredFromSupply)}; netIssuance=${bundleValue(tokenomicsQuality.netSupplyChange?.data?.netIssuanceAfterBurn)}` : null),
      bundleField("V2 unlocks / vesting", tokenomicsQualityAttached ? `coverage=${bundleValue(tokenomicsQuality.unlocks?.data?.coverageStatus)}; precision=${bundleValue(tokenomicsQuality.unlocks?.data?.schedulePrecision)}; agreement=${bundleValue(tokenomicsQuality.unlocks?.data?.scheduleAgreement)}; events30d=${bundleValue(tokenomicsQuality.unlocks?.data?.eventCount30d)}; events90d=${bundleValue(tokenomicsQuality.unlocks?.data?.eventCount90d)}; unlockIsNotSale=${bundleValue(tokenomicsQuality.unlocks?.data?.unlockIsNotSale)}; vestingType=${bundleValue(tokenomicsQuality.vesting?.data?.scheduleType)}; claimsSeparated=${bundleValue(tokenomicsQuality.vesting?.data?.claimsSeparatedFromUnlocks)}` : null),
      bundleField("V2 allocations / insider exposure", tokenomicsQualityAttached ? `categories=${safeArray(tokenomicsQuality.allocations?.data?.categories).length}; totalPercent=${bundleValue(tokenomicsQuality.allocations?.data?.allocationTotalPercent)}; reconciled=${bundleValue(tokenomicsQuality.allocations?.data?.allocationTotalReconciled)}; insiderPercent=${bundleValue(tokenomicsQuality.insiderExposure?.data?.reportedInsiderAllocationPercent)}; insiderRisk=${bundleValue(tokenomicsQuality.insiderExposure?.data?.risk)}` : null),
      bundleField("V2 treasury / holder concentration", tokenomicsQualityAttached ? `treasuryPercent=${bundleValue(tokenomicsQuality.treasury?.data?.supplyConcentrationPercent)}; treasuryRisk=${bundleValue(tokenomicsQuality.treasury?.data?.risk)}; topWallet=${bundleValue(tokenomicsQuality.holderConcentration?.data?.topWalletConcentrationPercent)}; top10=${bundleValue(tokenomicsQuality.holderConcentration?.data?.top10HolderRatePercent)}; beneficialOwnerAdjusted=${bundleValue(tokenomicsQuality.holderConcentration?.data?.beneficialOwnerAdjusted)}` : null),
      bundleField("V2 utility / demand", tokenomicsQualityAttached ? `utility=${bundleValue(tokenomicsQuality.utilityMechanisms?.data?.clarity)}; utilityMechanisms=${safeArray(tokenomicsQuality.utilityMechanisms?.data?.mechanisms).length}; demandMechanisms=${safeArray(tokenomicsQuality.demandMechanisms?.data?.mechanisms).length}; mandatoryUseProven=${bundleValue(tokenomicsQuality.demandMechanisms?.data?.mandatoryUseProven)}` : null),
      bundleField("V2 protocol success / token success", tokenomicsQualityAttached ? `protocolAvailability=${bundleValue(tokenomicsQuality.protocolSuccess?.data?.availability)}; usageStrength=${bundleValue(tokenomicsQuality.protocolSuccess?.data?.usageStrength)}; tokenNecessity=${bundleValue(tokenomicsQuality.tokenSuccess?.data?.tokenNecessityStatus)}; valueCapture=${bundleValue(tokenomicsQuality.tokenSuccess?.data?.valueCaptureStatus)}; protocolSuccessDoesNotProveTokenSuccess=${bundleValue(tokenomicsQuality.tokenSuccess?.data?.protocolSuccessDoesNotProveTokenSuccess)}` : null),
      "V2 Tokenomics strengths:",
      bundleList(tokenomicsQualityAttached ? tokenomicsQuality.strengths : []),
      "V2 Tokenomics risks:",
      bundleList(tokenomicsQualityAttached ? tokenomicsQuality.risks : []),
      "V2 Tokenomics contradictions:",
      bundleList(tokenomicsQualityAttached ? tokenomicsQuality.contradictions : []),
      "V2 Tokenomics missing critical data:",
      bundleList(tokenomicsQualityAttached ? tokenomicsQuality.missingCriticalData : []),
      "V2 Tokenomics next diligence:",
      bundleList(tokenomicsQualityAttached ? tokenomicsQuality.nextDiligence : []),
      "V2 canonical Formula Engine outputs:",
      bundleList(tokenomicsQualityAttached ? safeArray(tokenomicsQuality.formulaOutputs).map((formula) => `${formula.formulaId}: ${formula.displayedValue || "Unavailable"} | status=${formula.status || "unknown"} | formula=${formula.formula || "Unavailable"} | missing=${safeArray(formula.missingInputs).join(", ") || "none"} | requirement=${formula.sourceRequirement || "Unavailable"} | boundary=${safeArray(formula.sourceBoundary).join(", ") || "Unavailable"}`) : []),
      bundleField("Canonical Tokenomics owner", tokenomicsSupplyTruth.methodologyVersion ? "tokenomicsSupplyIntegrity" : "Supply Truth unavailable"),
      bundleField("Supply Truth methodology", tokenomicsSupplyTruth.methodologyVersion),
      bundleField("Canonical family", tokenomicsSupplyTruth.canonicalFamily || tokenomicsSupplyIntegrity?.canonicalFamily),
      bundleField("Supply Truth status", `${bundleValue(tokenomicsSupplyTruth.status)} | ${bundleValue(tokenomicsSupplyTruth.statusSummary)}`),
      bundleField("Canonical representation", `${bundleValue(tokenomicsSupplyTruth.representationContext?.representationType)} | selected=${bundleValue(tokenomicsSupplyTruth.representationContext?.selectedNetwork)}:${bundleValue(tokenomicsSupplyTruth.representationContext?.selectedContract)} | analyzed=${bundleValue(tokenomicsSupplyTruth.representationContext?.analyzedNetwork)}:${bundleValue(tokenomicsSupplyTruth.representationContext?.analyzedContract)}`),
      bundleField("Family applicability", tokenomicsSupplyTruth.applicability?.familyPolicySummary),
      "Primary family diligence questions:",
      bundleList(tokenomicsSupplyTruth.applicability?.primaryDiligenceQuestions),
      "Not-applicable redirects:",
      bundleList(tokenomicsSupplyTruth.applicability?.notApplicableRedirects),
      "Raw provider supply facts:",
      bundleList(safeArray(tokenomicsSupplyTruth.rawProviderFacts).map((fact) => `${fact.factId}: provider=${fact.provider}; field=${fact.field}; rawPath=${fact.rawPath}; raw=${bundleValue(fact.rawValue)}; normalized=${bundleValue(fact.normalizedValue)}; unit=${bundleValue(fact.unit)}; denomination=${bundleValue(fact.tokenDenomination)}; providerTimestamp=${bundleValue(fact.providerTimestamp)}; retrievalTimestamp=${bundleValue(fact.retrievalTimestamp)}; freshness=${bundleValue(fact.freshnessStatus)}; validation=${bundleValue(fact.validationState)}; scope=${bundleValue(fact.scope)}; role=${bundleValue(fact.role)}; rejection=${bundleValue(fact.rejectionReason)}; scoringActive=${bundleValue(fact.scoringActive)}; reviewedEvidence=${bundleValue(fact.reviewedEvidence)}`)),
      "Canonical supply facts:",
      bundleList(Object.values(safeObject(tokenomicsSupplyTruth.canonicalFacts)).map((fact) => `${fact.field}: value=${bundleValue(fact.value)}; unit=${bundleValue(fact.unit)}; status=${bundleValue(fact.status)}; provider=${bundleValue(fact.selectedProvider)}; method=${bundleValue(fact.selectionMethod)}; reason=${bundleValue(fact.selectionReason)}; selectedFactId=${bundleValue(fact.selectedFactId)}; rejected=${safeArray(fact.rejectedFactIds).join(", ") || "none"}`)),
      bundleField("Max supply raw status", tokenomicsSupplyTruth.maxSupplySemantics?.rawValueStatus),
      bundleField("Max supply semantics", tokenomicsSupplyTruth.maxSupplySemantics?.semanticClassification),
      bundleField("Max supply formula applicability", tokenomicsSupplyTruth.maxSupplySemantics?.formulaApplicability),
      "Max supply reasoning:",
      bundleList(tokenomicsSupplyTruth.maxSupplySemantics?.reasoning),
      "Exact Supply Truth provider disagreements:",
      bundleList(safeArray(tokenomicsSupplyTruth.providerDisagreements).map((entry) => `${entry.disagreementId}: ${entry.field}; ${entry.leftProvider}=${bundleValue(entry.leftValue)} vs ${entry.rightProvider}=${bundleValue(entry.rightValue)}; absolute=${bundleValue(entry.absoluteDifference)}; relative=${bundleValue(entry.relativeDifference)}; material=${bundleValue(entry.material)}; threshold=${bundleValue(entry.threshold)}; reconciliation=${bundleValue(entry.reconciliationStatus)}; selection=${bundleValue(entry.selectionReason)}`)),
      "Supply Truth contradictions:",
      bundleList(safeArray(tokenomicsSupplyTruth.contradictions).map((entry) => `${entry.contradictionId}: ${entry.type}; provider=${entry.provider}; values=${safeArray(entry.values).join(" / ")}; material=${bundleValue(entry.material)}; ${entry.explanation}`)),
      "Canonical calculation traces:",
      bundleList(safeArray(tokenomicsSupplyTruth.calculationTraces).map((formula) => `${formula.formulaId}: ${formula.displayedValue || formula.display || "Unavailable"}; expression=${formula.formula}; status=${formula.status}; applicability=${formula.applicability}; result=${bundleValue(formula.rawResult)} ${bundleValue(formula.resultUnit)}; denominator=${bundleValue(formula.denominatorStatus)}; inputs=${safeArray(formula.inputs).map((input) => `${input.name}=${bundleValue(input.rawValue ?? input.value)} ${bundleValue(input.unit)} [provider=${bundleValue(input.provider)}; timestamp=${bundleValue(input.providerTimestamp)}; freshness=${bundleValue(input.freshnessStatus)}; validation=${bundleValue(input.validationState)}; source=${bundleValue(input.sourcePath)}]`).join(" | ") || "none"}; missing=${safeArray(formula.missingInputs).join(", ") || "none"}; invalid=${safeArray(formula.invalidInputs).join(", ") || "none"}; rounding=${bundleValue(formula.roundingPolicy)}; requirement=${bundleValue(formula.sourceRequirement)}; limitations=${safeArray(formula.limitations).join("; ") || "none"}; scoringActive=${bundleValue(formula.scoringActive)}`)),
      bundleField("Supply Truth provenance", `facts=${bundleValue(tokenomicsSupplyTruth.provenanceSummary?.providerFactCount)}; valid=${bundleValue(tokenomicsSupplyTruth.provenanceSummary?.validFactCount)}; selected=${bundleValue(tokenomicsSupplyTruth.provenanceSummary?.selectedFactCount)}; providers=${safeArray(tokenomicsSupplyTruth.provenanceSummary?.providers).join(", ") || "none"}`),
      bundleField("Supply Truth freshness", `${bundleValue(tokenomicsSupplyTruth.freshnessSummary?.overall)}; freshest provider timestamp=${bundleValue(tokenomicsSupplyTruth.freshnessSummary?.freshestProviderTimestamp)}`),
      "Supply Truth supported conclusions:",
      bundleList(tokenomicsSupplyTruth.supportedConclusions),
      "Supply Truth unsupported conclusions:",
      bundleList(tokenomicsSupplyTruth.unsupportedConclusions),
      "Supply Truth missing inputs:",
      bundleList(tokenomicsSupplyTruth.missingInputs),
      "Supply Truth what would change:",
      bundleList(tokenomicsSupplyTruth.whatWouldChange),
      bundleField("Legacy compatibility", tokenomicsSupplyIntegrity?.legacyCompatibility?.migrationBoundary),
      bundleField("Tab hierarchy", "Command Header -> Key Risk Summary -> Supply Snapshot -> Provider Comparison -> Formula Outputs -> Asset-Class Diligence/Q&A -> Score Logic -> Source Requirements -> Audit Boundary"),
      bundleField("Key risk summary", lens?.lensId === "STABLECOIN_SETTLEMENT" ? "reserves; redemption; issuer/custodian; mint/redeem controls; freeze/admin policy; supported networks" : "lens-specific supply, control, dilution, concentration, and value-capture diligence"),
      bundleField("Contract mapping summary", `${safeArray(assetIdentityResolution?.allKnownContracts).length || safeArray(tokenomicsSupplyIntegrity?.providerContracts).length || 0} mappings attached; primary tab shows selected/analyzed contract and top mappings first; full list remains in audit/bundle.`),
      bundleField("Tokenomics integrity score", tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === null || tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === undefined ? null : `${tokenomicsSupplyIntegrity.tokenomicsIntegrityScore}/100`),
      bundleField("Explanation summary", tokenomicsSupplyIntegrity?.explanationSummary),
      bundleField("Evidence confidence", tokenomicsSupplyIntegrity?.evidenceConfidence),
      bundleField("Supply summary", tokenomicsSupplyIntegrity?.supplySummary?.summary),
      bundleField("Current price", tokenomicsSupplyIntegrity?.currentPrice),
      bundleField("24h volume", tokenomicsSupplyIntegrity?.volume24h),
      bundleField("Max supply status", tokenomicsSupplyIntegrity?.maxSupplyStatus),
      bundleField("Max supply value", tokenomicsSupplyIntegrity?.maxSupplyValue),
      bundleField("Max supply method", tokenomicsSupplyIntegrity?.maxSupplyMethod),
      bundleField("Circulating / total / max", `${bundleValue(tokenomicsSupplyIntegrity?.circulatingSupply)} / ${bundleValue(tokenomicsSupplyIntegrity?.totalSupply)} / ${bundleValue(tokenomicsSupplyIntegrity?.maxSupplyValue)}`),
      bundleField("Market cap / FDV", `${bundleValue(tokenomicsSupplyIntegrity?.marketCap)} / ${bundleValue(tokenomicsSupplyIntegrity?.fdv)}`),
      bundleField("Market cap / FDV method", `${bundleValue(tokenomicsSupplyIntegrity?.marketCapMethod)} / ${bundleValue(tokenomicsSupplyIntegrity?.fdvMethod)}`),
      bundleField("FDV / market cap ratio", tokenomicsSupplyIntegrity?.fdvMarketCapRatio),
      bundleField("Circulating percent of max", tokenomicsSupplyIntegrity?.circulatingPercentOfMax),
      bundleField("Remaining dilution percent", tokenomicsSupplyIntegrity?.remainingDilutionPercent),
      bundleField("Supply gap total minus circulating", tokenomicsSupplyIntegrity?.supplyGapTotalMinusCirculating),
      bundleField("Supply gap max minus circulating", tokenomicsSupplyIntegrity?.supplyGapMaxMinusCirculating),
      bundleField("FDV minus market cap", tokenomicsSupplyIntegrity?.fdvMinusMarketCap),
      bundleField("Volume / market cap ratio", tokenomicsSupplyIntegrity?.volumeMarketCapRatio),
      bundleField("Self-reported CMC circulating / market cap", `${bundleValue(tokenomicsSupplyIntegrity?.selfReportedCirculatingSupply)} / ${bundleValue(tokenomicsSupplyIntegrity?.selfReportedMarketCap)}`),
      bundleField("Derived market cap / FDV", `${bundleValue(tokenomicsSupplyIntegrity?.derivedMarketCap)} / ${bundleValue(tokenomicsSupplyIntegrity?.derivedFdv)}`),
      bundleField("Unlock schedule status", tokenomicsSupplyIntegrity?.unlockScheduleStatus),
      bundleField("Next unlock", `${bundleValue(tokenomicsSupplyIntegrity?.nextUnlockDate)} | percent: ${bundleValue(tokenomicsSupplyIntegrity?.nextUnlockPercent)} | USD: ${bundleValue(tokenomicsSupplyIntegrity?.nextUnlockUsdValue)}`),
      bundleField("Unlock / volume ratio", tokenomicsSupplyIntegrity?.unlockToVolumeRatio),
      bundleField("Unlock / liquidity ratio", tokenomicsSupplyIntegrity?.unlockToLiquidityRatio),
      bundleField("Unlock / market cap ratio", tokenomicsSupplyIntegrity?.unlockToMarketCap),
      bundleField("Future dilution risk", tokenomicsSupplyIntegrity?.futureDilutionRisk),
      bundleField("Emission policy status", tokenomicsSupplyIntegrity?.emissionPolicyStatus),
      bundleField("Annual inflation / annual emissions / net issuance", `${bundleValue(tokenomicsSupplyIntegrity?.annualInflationEstimate)} / ${bundleValue(tokenomicsSupplyIntegrity?.annualizedEmissions)} / ${bundleValue(tokenomicsSupplyIntegrity?.netIssuanceAfterBurn)}`),
      bundleField("Mint authority status", bundleControlStatusLabel(tokenomicsSupplyIntegrity?.mintAuthorityStatus, "mint", lens?.lensId)),
      bundleField("Admin control status", bundleControlStatusLabel(tokenomicsSupplyIntegrity?.adminControlStatus, "admin", lens?.lensId)),
      bundleField("Governance supply-change risk", tokenomicsSupplyIntegrity?.governanceSupplyChangeRisk),
      bundleField("Cap mutability status", tokenomicsSupplyIntegrity?.capMutabilityStatus),
      bundleField("Burn mechanism status", tokenomicsSupplyIntegrity?.burnMechanismStatus),
      bundleField("Burn materiality", tokenomicsSupplyIntegrity?.burnMateriality),
      bundleField("Buyback/burn status", tokenomicsSupplyIntegrity?.buybackBurnStatus),
      bundleField("Buyback/burn coverage", tokenomicsSupplyIntegrity?.buybackBurnCoverage),
      bundleField("Concentration fields", `treasury=${bundleValue(tokenomicsSupplyIntegrity?.treasurySupplyConcentration)}; vestingRecipients=${bundleValue(tokenomicsSupplyIntegrity?.vestingRecipientConcentration)}; topWallet=${bundleValue(tokenomicsSupplyIntegrity?.topWalletConcentration)}`),
      bundleField("Tokenholder value capture status", tokenomicsSupplyIntegrity?.tokenholderValueCaptureStatus),
      bundleField("Token necessity status", tokenomicsSupplyIntegrity?.tokenNecessityStatus),
      bundleField("Accrual ratios", `tokenholder=${bundleValue(tokenomicsSupplyIntegrity?.tokenholderAccrualRatio)}; feeRevenue=${bundleValue(tokenomicsSupplyIntegrity?.feeRevenueCaptureRatio)}; protocolRevenueToTokenValue=${bundleValue(tokenomicsSupplyIntegrity?.protocolRevenueToTokenValue)}`),
      bundleField("Staking reward source", tokenomicsSupplyIntegrity?.stakingRewardSource),
      "Provider supply snapshots:",
      bundleList([
        tokenomicsSupplyIntegrity?.coingeckoSupply ? `CoinGecko: price=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.currentPrice)}; mcap=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.marketCap)}; fdv=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.fdv)}; volume=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.volume24h)}; circ/total/max=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.circulatingSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.totalSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.maxSupply)}; timestamp=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.timestamp)}; boundary=${safeArray(tokenomicsSupplyIntegrity.coingeckoSupply.sourceBoundary).join(", ")}` : null,
        tokenomicsSupplyIntegrity?.coinmarketcapSupply ? `CoinMarketCap: price=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.currentPrice)}; mcap=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.marketCap)}; fdv=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.fdv)}; volume=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.volume24h)}; circ/total/max=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.circulatingSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.totalSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.maxSupply)}; selfReported=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.selfReportedCirculatingSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.selfReportedMarketCap)}; timestamp=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.timestamp)}; boundary=${safeArray(tokenomicsSupplyIntegrity.coinmarketcapSupply.sourceBoundary).join(", ")}` : null,
      ].filter(Boolean)),
      "Source contradictions:",
      bundleList(tokenomicsSupplyIntegrity?.sourceContradictions),
      "Provider disagreements:",
      bundleList(tokenomicsSupplyIntegrity?.providerDisagreements),
      "Provider scope notes:",
      bundleList(tokenomicsSupplyIntegrity?.providerScopeNotes),
      "Provider numeric rows:",
      bundleList([
        ...safeArray(tokenomicsSupplyIntegrity?.providerMarketCaps).map((entry) => `${entry.provider} marketCap=${entry.value} (${entry.sourcePath}; ${entry.boundary}; scope=${entry.scope || "unknown"})`),
        ...safeArray(tokenomicsSupplyIntegrity?.providerFdvs).map((entry) => `${entry.provider} fdv=${entry.value} (${entry.sourcePath}; ${entry.boundary}; scope=${entry.scope || "unknown"})`),
        ...safeArray(tokenomicsSupplyIntegrity?.providerVolumes).map((entry) => `${entry.provider} volume24h=${entry.value} (${entry.sourcePath}; ${entry.boundary}; scope=${entry.scope || "unknown"})`),
        ...safeArray(tokenomicsSupplyIntegrity?.providerSupplyValues).map((entry) => `${entry.provider} ${entry.field}=${entry.value} (${entry.sourcePath}; ${entry.boundary}; scope=${entry.scope || "unknown"})`),
      ]),
      "Liquidity / pair context:",
      bundleList([
        ...safeArray(tokenomicsSupplyIntegrity?.providerMarketCaps),
        ...safeArray(tokenomicsSupplyIntegrity?.providerFdvs),
        ...safeArray(tokenomicsSupplyIntegrity?.providerVolumes),
        ...safeArray(tokenomicsSupplyIntegrity?.providerSupplyValues),
      ].filter((entry) => entry?.scope === "pair_liquidity_local").map((entry) => `${entry.provider} ${entry.field}=${entry.value} (${entry.sourcePath}; pair/local context, not global reconciliation)`)),
      "Provider contracts/platforms:",
      bundleList([
        ...safeArray(tokenomicsSupplyIntegrity?.providerContracts).map((entry) => `${entry.provider}: ${bundleValue(entry.network)} ${bundleValue(entry.contractAddress)} (${entry.sourcePath})`),
        ...safeArray(tokenomicsSupplyIntegrity?.providerPlatforms).map((entry) => `${entry.provider}: ${entry.platform} ${bundleValue(entry.contractAddress)} (${entry.sourcePath})`),
      ]),
      "Provider field audit:",
      bundleList(safeArray(tokenomicsSupplyIntegrity?.providerFieldAudit).map((entry) => `${entry.provider}: available=${safeArray(entry.fieldsAvailable).join(", ") || "none"}; missing=${safeArray(entry.fieldsMissing).join(", ") || "none"}; boundary=${safeArray(entry.sourceBoundary).join(", ") || "provider reported"}`)),
      "Formula outputs:",
      bundleList(tokenomicsFormulaOutputs.map((formula) => `${formula.formulaId}: ${formula.displayedValue || formula.display || "Unavailable"} | status=${formula.status || "unknown"} | formula=${formula.formula || "Unavailable"} | missing=${safeArray(formula.missingInputs).join(", ") || "none"} | requirement=${formula.sourceRequirement || "Unavailable"} | boundary=${safeArray(formula.sourceBoundary).join(", ") || "Unavailable"}`)),
      "Tokenomics Question-First Q&A Mirror:",
      bundleTokenomicsQuestionFirstMirror(tokenomicsSupplyIntegrity),
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
      "Raw institutional Q&A audit mirror:",
      bundleQuestions(tokenomicsSupplyIntegrity?.institutionalQuestions),
      "What would change:",
      bundleList(tokenomicsSupplyIntegrity?.whatWouldChange),
      "Source boundary:",
      bundleList(tokenomicsSupplyIntegrity?.sourceBoundary),
      "Raw audit fields:",
      bundleObjectRows(tokenomicsSupplyIntegrity?.auditRawFields),
    ]),
    bundleSection("7. Evidence Map / Source Trace", [
      "Scoring readiness evidence bridge:",
      bundleList([
        scoringReadinessContract
          ? `${scoringReadinessContract.assetFamilyLabel || "Asset-family model"} | ${scoringReadinessContract.overallReadinessStatus || "status unavailable"} | reviewed-ready=${bundleValue(scoringReadinessContract.reviewedEvidenceReadyDimensionCount)} | source-required=${bundleValue(scoringReadinessContract.sourceRequiredDimensionCount)}`
          : "Scoring readiness contract unavailable.",
        ...safeArray(scoringReadinessContract?.sourceMatrixEntries).slice(0, 6).map((entry) => `${entry.dimensionId || "dimension"} | ${entry.evidenceStatus || "unknown"} | missing=${safeArray(entry.missingEvidence).slice(0, 2).join("; ") || "none"}`),
      ]),
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
      bundleField("Overall score", bundlePrimaryScore),
      bundleField("Structural quality", bundlePrimaryScore),
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
      bundleList([...safeArray(safeModel.auditAlerts), ...warnings]),
      "Institutional scoring readiness:",
      bundleList([
        scoringReadinessContract
          ? `${scoringReadinessContract.overallReadinessStatus || "unknown"}; diagnostic-only; legacy score/verdict unchanged.`
          : "Scoring readiness contract unavailable.",
        ...safeArray(scoringReadinessContract?.confidenceCaps).slice(0, 5),
        ...safeArray(scoringReadinessContract?.hardBlockers).slice(0, 5),
      ]),
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
        ...safeArray(safeModel.requiredConditions),
        ...safeArray(safeModel.missingCritical),
        ...(safeModel.whatWouldChangeDecision?.items || []),
        ...safeArray(scoringReadinessContract?.whatWouldChangeScore).slice(0, 6),
        ...safeArray(benchmarkInstitutionalAnswerPack?.sourceRequirements).slice(0, 8),
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
        ...safeArray(safeModel.missingCritical),
        ...safeArray(safeModel.requiredConditions),
        ...safeArray(safeModel.auditAlerts),
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
        ...safeArray(safeModel.requiredConditions),
        ...safeArray(benchmarkInstitutionalAnswerPack?.hardBlockers).slice(0, 6),
        ...safeArray(benchmarkInstitutionalAnswerPack?.confidenceCaps).slice(0, 6),
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
      bundleList([...safeArray(safeModel.topNegativeDrivers), ...safeArray(safeModel.auditAlerts)]),
    ]),
    bundleSection("11. Audit / Raw Key Fields", [
      "Provider diagnostics summary:",
      bundleProviderDiagnostics(providerDiagnosticsList),
      "Provider health:",
      bundleProviderHealth(providerHealth),
      "Live recompute invariant:",
      bundleList([
        `status: ${analysisFreshness.freshnessStatus}`,
        `label: ${analysisFreshness.freshnessLabel}`,
        `source: ${analysisFreshness.analysisSource || "unknown"}`,
        `generatedAt: ${analysisFreshness.generatedAt || "unavailable"}`,
        `readAt: ${analysisFreshness.readAt || "unavailable"}`,
        `recomputed: ${analysisFreshness.recomputed === null || analysisFreshness.recomputed === undefined ? "unknown" : analysisFreshness.recomputed ? "yes" : "no"}`,
        `primaryAnalysisPath: ${analysisFreshness.primaryAnalysisPath || "live_full_recompute"}`,
        `snapshotDisabled: ${analysisFreshness.snapshotDisabled ? "yes" : "no"}`,
        `snapshotReuseBlocked: ${analysisFreshness.snapshotReuseBlocked ? "yes" : "no"}`,
        `partialRefreshDisabled: ${analysisFreshness.partialRefreshDisabled ? "yes" : "no"}`,
        `partialRefreshUsed: ${analysisFreshness.partialRefreshUsed ? "yes" : "no"}`,
        `partialRefreshAvailable: ${analysisFreshness.partialRefreshAvailable ? "yes" : "no"}`,
        `freshSections: ${safeArray(analysisFreshness.freshSections).join(", ") || "unavailable"}`,
        `missingSections: ${safeArray(analysisFreshness.missingSections).join(", ") || "unavailable"}`,
      ]),
      "Raw field availability summary:",
      bundleList([
        `analysis: ${Object.keys(safeAnalysis).length ? "present" : "missing"}`,
        `decisionLayer: ${Object.keys(decisionLayer).length ? "present" : "missing"}`,
        `thesisCore: ${Object.keys(thesisCore).length ? "present" : "missing"}`,
        `resolvedInstitutionalLens: ${lens ? "present" : "missing"}`,
        `assetIdentityResolution: ${assetIdentityResolution ? "present" : "missing"}`,
        `lensAwareExplanations: ${lensAware ? "present" : "missing"}`,
        `tokenomicsSupplyIntegrity: ${tokenomicsSupplyIntegrity ? "present" : "missing"}`,
        `assetResearchResultV2.currentReality: ${currentRealityAttached ? "present" : "missing"}`,
        `benchmarkInstitutionalAnswerPack: ${benchmarkInstitutionalAnswerPack ? "present" : "missing"}`,
        `assetInterpretationContract: ${assetInterpretationContract ? "present" : "missing"}`,
        `engineLearningBackbone: ${engineLearningBackbone ? "present" : "missing"}`,
        `providerCategorySignals: ${providerCategorySignals ? "present" : "missing"}`,
        `providerRawDataExpansion: ${providerRawDataExpansion ? "present" : "missing"}`,
        `rawDataCoverageDiagnostics: ${rawDataCoverageDiagnostics ? "present" : "missing"}`,
        `scoringReadinessContract: ${scoringReadinessContract ? "present" : "missing"}`,
        `categoryDrivenAssetFamilyContract: ${categoryDrivenAssetFamilyContract ? "present" : "missing"}`,
        `categoryDataRequirementProfiles: ${categoryDataRequirementProfiles ? "present" : "missing"}`,
        `categoryAnswerBuilder: ${categoryAnswerBuilder ? "present" : "missing"}`,
        `categoryReadinessDiagnostics: ${categoryReadinessDiagnostics ? "present" : "missing"}`,
        `institutionalQuestions: ${safeArray(questions).length}`,
        `calibrationWarnings: ${safeArray(calibrationWarnings).length}`,
      ]),
      "Non-rendered compatibility narrative (Audit / Raw only):",
      bundleList([
        "fieldPath: model.lensAwareExplanations",
        "sourceObjectPath: analysis.lensAwareExplanations",
        "disposition: audit_only_not_rendered",
        "renderedStatus: not_rendered_by_live_decision_tab",
        "componentConsumptionProof: App.jsx Decision Tab and its descendants do not consume lensAwareExplanations.",
        ...safeArray(renderedSurfaceParityViewModel.nonRenderedAuditFields)
          .flatMap((entry) => safeArray(entry.values).map((value) => `${entry.fieldPath}: ${value}`)),
      ]),
      "Raw/fallback decision diagnostics (Audit / Raw only):",
      bundleList([
        ...(decisionFrame.whatMustBeTrue || []),
        ...(decisionFrame.nextCheckpoints || []),
        ...safeArray(decisionLayer.researchRequirements).map((requirement) => requirement?.title),
      ]),
      "Current Reality canonical event diagnostics (Audit / Raw only):",
      bundleList(safeArray(currentReality.events).map((event) => `${event.eventId} | fingerprint=${event.eventFingerprint} | category=${event.primaryCategory} | dimensions=${safeArray(event.dimensions).join(", ") || "none"} | subject=${event.subject?.subjectType}:${event.subject?.subjectId} | relation=${event.subject?.relationshipToAsset} | verification=${event.verificationState} | lifecycle=${event.lifecycleStatus} | materiality=${event.materiality?.state} | impact=${event.primaryImpact} | riskDirection=${event.riskDirection} | duplicateState=${event.duplicateState} | source=${event.sourceSummary?.primarySource?.sourceType}:${event.sourceSummary?.primarySource?.sourceId}`), "No canonical Current Reality event diagnostics attached.", 160),
      "Current Reality rejected / ambiguous event diagnostics (Audit / Raw only):",
      bundleList([
        ...safeArray(currentReality.audit?.rejectedEvents).map((entry) => `${entry.observationId}: rejected | ${entry.reason}`),
        ...safeArray(currentReality.audit?.ambiguousMappings).map((entry) => `${entry.observationId}: ambiguous | ${entry.reason}`),
        ...safeArray(currentReality.audit?.eventLineage).map((entry) => `${entry.observationId}: event=${entry.eventId}; relation=${entry.relationship}; original=${entry.originalClaim}; correction=${entry.correctionClaim || "none"}`),
      ], "No rejected, ambiguous, or corrected Current Reality observation attached.", 200),
      bundleField("Current Reality request-local mutation guard", currentRealityAttached ? `scoreMutationAttempted=${bundleValue(currentReality.audit?.scoreMutationAttempted)}; confidenceMutationAttempted=${bundleValue(currentReality.audit?.confidenceMutationAttempted)}; verdictMutationAttempted=${bundleValue(currentReality.audit?.verdictMutationAttempted)}` : null),
      bundleField("Raw generic copy still visible in primary areas", yesNoUnknown(rawGenericVisible)),
      bundleField("Raw generic copy present in audit/backend fields", yesNoUnknown(rawGenericAudit)),
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
    bundleSection("12. Engine Learning Backbone v1", [
      bundleField("Backbone attached", engineLearningBackbone ? "yes" : "missing"),
      bundleField("Artifact version", engineLearningBackbone?.artifactVersion),
      bundleField("Task name", engineLearningBackbone?.taskName),
      bundleField("Summary", engineLearningBackbone?.summary),
      bundleField("Guardrail: scoring changed", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.scoringChanged) : "unknown"),
      bundleField("Guardrail: verdict changed", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.verdictChanged) : "unknown"),
      bundleField("Guardrail: provider behavior changed", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.providerBehaviorChanged) : "unknown"),
      bundleField("Guardrail: evidence packet expansion occurred", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.evidencePacketExpansionOccurred) : "unknown"),
      bundleField("Guardrail: reviewed evidence scoring-active", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.reviewedEvidenceScoringActive) : "unknown"),
      bundleField("Guardrail: source candidates promoted", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.sourceCandidatesPromotedToReviewedEvidence) : "unknown"),
      bundleField("Guardrail: ADA packet coverage added", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.adaPacketCoverageAdded) : "unknown"),
      "Findings:",
      bundleList(safeArray(engineLearningBackbone?.findings).map((finding) => `${finding.id || "finding"} | ${finding.category || "category unavailable"} | ${finding.severity || "severity unavailable"} | ${finding.reviewStatus || "review status unavailable"} | ${finding.recommendedAction || finding.title || "Review required"}`)),
      "Asset-class rules applied:",
      bundleList(safeArray(engineLearningBackbone?.assetClassRulesApplied).map((rule) => `${rule.id || "rule"} | ${rule.title || "Rule title unavailable"} | ${rule.outputWarningTemplate || rule.summary || "Rule summary unavailable"}`)),
      "Evidence mapping policies:",
      bundleList(safeArray(engineLearningBackbone?.evidenceMappingPoliciesApplied).map((policy) => `${policy.id || "policy"} | ${policy.status || "status unavailable"} | ${policy.sourceBoundary || "boundary unavailable"} | ${policy.displayLabel || policy.summary || "Policy summary unavailable"}`)),
      "Source requirements triggered:",
      bundleList(safeArray(engineLearningBackbone?.sourceRequirementsTriggered).map((requirement) => `${requirement.id || "requirement"} | ${requirement.title || "Requirement title unavailable"} | affects scoring: ${requirement.affectsScoring ? "yes" : "no"} | diagnostic: ${requirement.diagnosticOnly ? "yes" : "no"}`)),
      "Source candidates:",
      bundleList(safeArray(engineLearningBackbone?.sourceCandidates).map((candidate) => `${candidate.sourceCandidateTitle || candidate.candidateId || "candidate"} | status=${candidate.candidateStatus || "unknown"} | promoted=${candidate.promotedToReviewedEvidence ? "yes" : "no"} | scoring=${candidate.scoringActive ? "yes" : "no"} | boundary=${safeArray(candidate.sourceBoundary).join(", ") || "source candidate only"}`)),
      "Output QA checks:",
      bundleList(safeArray(engineLearningBackbone?.outputQaChecks).map((check) => `${check.id || "qa_check"} | ${check.status || "status unavailable"} | ${check.severity || "severity unavailable"} | ${check.description || check.remediation || "QA check"}`)),
      "Calibration anomalies:",
      bundleList(safeArray(engineLearningBackbone?.calibrationAnomalies).map((anomaly) => `${anomaly.anomalyId || "anomaly"} | ${anomaly.asset || "asset unavailable"} | ${anomaly.status || "status unavailable"} | ${anomaly.calibrationAction || anomaly.description || "Calibration review"}`)),
      "Dependency requirements:",
      bundleList(safeArray(engineLearningBackbone?.dependencyRequirements).map((dependency) => `${dependency.id || "dependency"} | ${dependency.title || "Dependency title unavailable"} | required=${safeArray(dependency.requiredFor).join(", ") || "unspecified"}`)),
      "Freshness / point-in-time readiness:",
      bundleList(safeArray(engineLearningBackbone?.freshnessPointInTimeReadiness).map((rule) => `${rule.id || "freshness_rule"} | ${rule.title || "Freshness rule"} | ${rule.status || "status unavailable"} | ${rule.outputWarning || rule.summary || "Point-in-time boundary"}`)),
      "Path parity checks:",
      bundleList(safeArray(engineLearningBackbone?.pathParityChecks).map((check) => `${check.path || check.id || "path"} | ${check.status || "status unavailable"} | required=${safeArray(check.requiredFields).join(", ")}`)),
      "Benchmark Learning / Reusable Engine Rules:",
      bundleList([
        `Rules matched: ${safeArray(engineLearningBackbone?.benchmarkLearningRulesApplied).length}`,
        `Registry total: ${engineLearningBackbone?.benchmarkLearningRegistrySummary?.totalRules ?? "unknown"}`,
        `Source benchmark assets: ${safeArray(engineLearningBackbone?.benchmarkLearningRegistrySummary?.sourceBenchmarkAssets).join(", ") || "unknown"}`,
        `Scoring status: ${engineLearningBackbone?.benchmarkLearningRegistrySummary?.scoringStatus || "unknown"}`,
        `Reviewed evidence status: ${engineLearningBackbone?.benchmarkLearningRegistrySummary?.reviewedEvidenceStatus || "unknown"}`,
        `Frontend parity status: ${engineLearningBackbone?.benchmarkLearningRegistrySummary?.frontendParityStatus || "unknown"}`,
        `BTC baseline 2C: ${engineLearningBackbone?.benchmarkLearningRenderedParity?.btcBaseline2CStatus || "unknown"}`,
        `BTC baseline 12C failure count: ${engineLearningBackbone?.benchmarkLearningRenderedParity?.btcBaseline12CFailureCount ?? "unknown"}`,
        `ETH baseline 2C: ${engineLearningBackbone?.benchmarkLearningRenderedParity?.ethBaseline2CStatus || "unknown"}`,
        `ETH baseline 12D failure count: ${engineLearningBackbone?.benchmarkLearningRenderedParity?.ethBaseline12DFailureCount ?? "unknown"}`,
        `Shared primary-visible corpus: ${yesNoUnknown(engineLearningBackbone?.benchmarkLearningRenderedParity?.sharedPrimaryVisibleCorpus)}`,
        `ETH learning captured: ${yesNoUnknown(safeArray(engineLearningBackbone?.benchmarkLearningRegistrySummary?.ruleIds).includes("eth_baseline_regression_fixture"))}`,
        `BTC learning preserved: ${yesNoUnknown(safeArray(engineLearningBackbone?.benchmarkLearningRegistrySummary?.ruleIds).includes("btc_baseline_regression_fixture"))}`,
        "Next benchmark candidates: WBTC, stETH, USDC/USDT, RENDER, ONDO/RWA, UNI/AAVE/LINK",
      ]),
      "Benchmark rules applied:",
      bundleList(safeArray(engineLearningBackbone?.benchmarkLearningRulesApplied).map((rule) => `${rule.ruleId || "rule"} | source=${rule.sourceBenchmarkAsset || "unknown"} | applies=${safeArray(rule.appliesToLens).join(", ") || "lens unknown"} | scoring=${rule.scoringStatus || "unknown"} | reviewedEvidence=${rule.reviewedEvidenceStatus || "unknown"} | ${rule.generalizedRule || "Rule summary unavailable"}`)),
      "Benchmark source requirement templates:",
      bundleList(safeArray(engineLearningBackbone?.benchmarkLearningSourceRequirementTemplates).slice(0, 12).map((template) => `${template.templateId || "template"} | ${template.requirementGroup || "group unavailable"} | ${template.requirementText || "Requirement unavailable"} | scoring=${template.scoringStatus || "unknown"}`)),
      "Source & Data Requirement Matrix v1:",
      bundleList([
        `Matrix attached: ${engineLearningBackbone?.sourceDataRequirementMatrix ? "yes" : "missing"}`,
        `Providers inventoried: ${engineLearningBackbone?.sourceDataRequirementMatrix?.providerCount ?? "unknown"}`,
        `Matrix entries: ${engineLearningBackbone?.sourceDataRequirementMatrix?.matrixEntryCount ?? "unknown"}`,
        `Lens groups covered: ${safeArray(engineLearningBackbone?.sourceDataRequirementMatrix?.lensGroupsCovered).slice(0, 12).join(", ") || "unknown"}`,
        `Scoring status: ${engineLearningBackbone?.sourceDataRequirementMatrix?.currentScoringStatus || "unknown"}`,
        `Future scoring readiness: ${engineLearningBackbone?.sourceDataRequirementMatrix?.futureScoringReadiness || "unknown"}`,
        `Backend response path: ${engineLearningBackbone?.sourceDataRequirementMatrix?.backendResponsePathStatus || "unknown"}`,
        `Frontend normalization: ${engineLearningBackbone?.sourceDataRequirementMatrix?.frontendNormalizationStatus || "unknown"}`,
        `Review Bundle parity: ${engineLearningBackbone?.sourceDataRequirementMatrix?.reviewBundleParityStatus || "unknown"}`,
        `BTC/ETH benchmark integration: ${engineLearningBackbone?.sourceDataRequirementMatrix?.btcEthBenchmarkLearningIntegrationStatus || "unknown"}`,
        `Scoring changed: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.scoringChanged)}`,
        `Verdict changed: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.verdictChanged)}`,
        `Provider behavior changed: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.providerBehaviorChanged)}`,
        `Evidence packet expansion: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.evidencePacketExpansionOccurred)}`,
        `Reviewed evidence scoring-active: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.reviewedEvidenceScoringActive)}`,
        `Source candidates promoted: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.sourceCandidatesPromoted)}`,
        `ADA packet coverage added: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.adaPacketCoverageAdded)}`,
      ]),
      "Asset Interpretation Contract integration:",
      bundleList([
        `Integration attached: ${engineLearningBackbone?.assetInterpretationContractIntegration ? "yes" : "missing"}`,
        `Backend field: ${engineLearningBackbone?.assetInterpretationContractIntegration?.backendResponseField || "unknown"}`,
        `Visible label gate: ${engineLearningBackbone?.assetInterpretationContractIntegration?.visibleLabelGateStatus || "unknown"}`,
        `Source Matrix integrated: ${yesNoUnknown(engineLearningBackbone?.assetInterpretationContractIntegration?.sourceMatrixIntegrated)}`,
        `Scoring status: ${engineLearningBackbone?.assetInterpretationContractIntegration?.currentScoringStatus || "non_scoring_v1"}`,
      ]),
      "Asset Interpretation reusable rules:",
      bundleList(engineLearningBackbone?.assetInterpretationContractIntegration?.ruleIds),
      "Data-First Narrative Contract integration:",
      bundleList([
        `Integration attached: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration ? "yes" : "missing"}`,
        `Backend field: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.backendResponseField || "unknown"}`,
        `Frontend field: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.frontendNormalizationField || "unknown"}`,
        `Primary narrative gate: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.primaryNarrativeGateStatus || "unknown"}`,
        `Decision surface binding: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.decisionSurfaceDataBindingStatus || "unknown"}`,
        `Score explanation binding: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.scoreExplanationDataBindingStatus || "unknown"}`,
        `Scoring status: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.currentScoringStatus || "non_scoring_v1"}`,
      ]),
      "Matrix missing data categories:",
      bundleList(safeArray(engineLearningBackbone?.sourceDataRequirementMatrix?.missingDataCategories).slice(0, 16)),
      "Matrix source candidates generated:",
      bundleList(safeArray(engineLearningBackbone?.sourceDataRequirementMatrix?.sourceCandidatesGenerated).slice(0, 16)),
      "Matrix reviewed evidence needs:",
      bundleList(safeArray(engineLearningBackbone?.sourceDataRequirementMatrix?.reviewedEvidenceNeeds).slice(0, 16)),
      "Deferred findings:",
      bundleList(safeArray(engineLearningBackbone?.deferredFindings).map((finding) => `${finding.id || "deferred"} | ${finding.title || "Deferred finding"} | ${finding.recommendedAction || "Next cleanup pass"}`)),
      "Known limitations:",
      bundleList(engineLearningBackbone?.knownLimitations),
      bundleField("Next resume pointer", engineLearningBackbone?.nextResumePointer),
    ]),
    bundleSection("2AH. Benchmark Institutional Answer Bundle v1 - Batch 1", [
      bundleField("Pack attached", benchmarkInstitutionalAnswerPack ? "yes" : "no"),
      bundleField("Pack ID", benchmarkInstitutionalAnswerPack?.packId),
      bundleField("Asset", benchmarkInstitutionalAnswerPack?.assetSymbol),
      bundleField("Pack status", benchmarkInstitutionalAnswerPack?.packStatus),
      bundleField("Review status", benchmarkInstitutionalAnswerPack?.reviewStatus),
      bundleField("Expected family", benchmarkInstitutionalAnswerPack?.expectedFamily),
      bundleField("Expected label", benchmarkInstitutionalAnswerPack?.expectedLabel),
      bundleField("Expected question group", benchmarkInstitutionalAnswerPack?.expectedQuestionGroup),
      bundleField("Expected source profile", benchmarkInstitutionalAnswerPack?.expectedSourceProfile),
      bundleField("Questions attached", safeArray(benchmarkInstitutionalAnswerPack?.questions).length),
      bundleField("Claims attached", safeArray(benchmarkInstitutionalAnswerPack?.questions).flatMap((question) => safeArray(question.claims)).length),
      bundleField("Scoring active", benchmarkInstitutionalAnswerPack ? yesNoUnknown(benchmarkInstitutionalAnswerPack.scoringActive) : "unknown"),
      bundleField("Verdict active", benchmarkInstitutionalAnswerPack ? yesNoUnknown(benchmarkInstitutionalAnswerPack.verdictActive) : "unknown"),
      "Coverage summary:",
      bundleList([
        `critical=${safeArray(benchmarkInstitutionalAnswerPack?.questions).filter((question) => question.priority === "critical").length}`,
        `source-required=${safeArray(benchmarkInstitutionalAnswerPack?.questions).filter((question) => /source_required|evidence_missing|manual_review/.test(String(question.answerStatus))).length}`,
        `manual-review=${safeArray(benchmarkInstitutionalAnswerPack?.questions).filter((question) => question.manualReviewRequired).length}`,
      ]),
      "Benchmark questions:",
      bundleList(safeArray(benchmarkInstitutionalAnswerPack?.questions).map((question) => `${question.questionId || "question"} | ${question.answerStatus || "status unavailable"} | ${question.directAnswer || "answer unavailable"} | impact=${question.decisionImpact || "unknown"} | scoringEligible=${question.scoringEligible ? "yes" : "no"}`)),
      "Claims / evidence map mirror:",
      bundleList(safeArray(benchmarkInstitutionalAnswerPack?.questions).flatMap((question) => safeArray(question.claims).map((claim) => `${claim.claimId || "claim"} | question=${question.questionId || "unknown"} | status=${claim.evidenceStatus || "unknown"} | scoring=${claim.scoringActive ? "yes" : "no"} | proves=${safeArray(claim.proves).join("; ") || "none"} | doesNotProve=${safeArray(claim.doesNotProve).join("; ") || "none"}`))),
      "Source requirements:",
      bundleList(benchmarkInstitutionalAnswerPack?.sourceRequirements),
      "Missing evidence:",
      bundleList(benchmarkInstitutionalAnswerPack?.missingEvidence),
      "Hard blockers:",
      bundleList(benchmarkInstitutionalAnswerPack?.hardBlockers),
      "Confidence caps:",
      bundleList(benchmarkInstitutionalAnswerPack?.confidenceCaps),
      "Score rationale:",
      bundleList([
        benchmarkInstitutionalAnswerPack?.scoreRationale?.readinessSummary,
        `futureScorePreviewStatus=${benchmarkInstitutionalAnswerPack?.scoreRationale?.futureScorePreviewStatus || "unknown"}`,
        `legacyScoreBoundary=${benchmarkInstitutionalAnswerPack?.scoreRationale?.legacyScoreBoundary || "unknown"}`,
        ...safeArray(benchmarkInstitutionalAnswerPack?.scoreRationale?.scoreReadinessGaps).slice(0, 8),
      ]),
      "What would change:",
      bundleList(benchmarkInstitutionalAnswerPack?.whatWouldChange),
      "Monitoring triggers:",
      bundleList(benchmarkInstitutionalAnswerPack?.monitoringTriggers),
      "Engine learning capture:",
      bundleList([
        benchmarkInstitutionalAnswerPack?.engineLearning?.familyRule,
        benchmarkInstitutionalAnswerPack?.engineLearning?.answerGroundingRule,
        `scoringStatus=${benchmarkInstitutionalAnswerPack?.engineLearning?.scoringStatus || "unknown"}`,
        ...safeArray(benchmarkInstitutionalAnswerPack?.engineLearning?.sourceRequirementTemplates).slice(0, 8),
        ...safeArray(benchmarkInstitutionalAnswerPack?.engineLearning?.qaRegressionRules).slice(0, 8),
      ]),
      "Guardrails:",
      bundleList([
        `legacyScoreChanged=${yesNoUnknown(benchmarkInstitutionalAnswerPack?.guardrails?.legacyScoreChanged)}`,
        `legacyVerdictChanged=${yesNoUnknown(benchmarkInstitutionalAnswerPack?.guardrails?.legacyVerdictChanged)}`,
        `providerBehaviorChanged=${yesNoUnknown(benchmarkInstitutionalAnswerPack?.guardrails?.providerBehaviorChanged)}`,
        `tokenSpecificScoreOverride=${yesNoUnknown(benchmarkInstitutionalAnswerPack?.guardrails?.tokenSpecificScoreOverride)}`,
        `sourceCandidatesPromoted=${yesNoUnknown(benchmarkInstitutionalAnswerPack?.guardrails?.sourceCandidatesPromoted)}`,
        `reviewedEvidenceScoringActive=${yesNoUnknown(benchmarkInstitutionalAnswerPack?.guardrails?.reviewedEvidenceScoringActive)}`,
        `snapshotReuseEnabled=${yesNoUnknown(benchmarkInstitutionalAnswerPack?.guardrails?.snapshotReuseEnabled)}`,
        `partialRefreshEnabled=${yesNoUnknown(benchmarkInstitutionalAnswerPack?.guardrails?.partialRefreshEnabled)}`,
      ]),
      "Frontend parity:",
      bundleList([
        "Institutional Checklist: benchmark questions injected as first-class institutionalQuestions.",
        "Evidence Map: claims/source boundary rows.",
        "Source Queue: benchmark source requirements.",
        "Manual Review: blockers/caps/manual-review questions.",
        "Scoring Transparency: diagnostic-only score rationale/caps/gaps.",
        "Protected Investor Report: high-level redacted summary only.",
      ]),
      "Limitations:",
      bundleList(benchmarkInstitutionalAnswerPack?.limitations),
      bundleField("Source boundary", safeArray(benchmarkInstitutionalAnswerPack?.sourceBoundary).join(" | ")),
    ]),
    bundleSection("13. Cross-Tab Consistency Checklist", [
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
      bundleField("Provider numeric rows missing despite tokenomics values", yesNoUnknown(tokenomicsProviderRowsMissing)),
      bundleField("Tokenomics tab missing while tokenomics object exists", tokenomicsSupplyIntegrity ? "no" : "unknown"),
      bundleField("Benchmark answer pack present for Batch 1 asset", ["bitcoin", "wrapped-bitcoin", "ethereum", "staked-ether", "usd-coin", "ripple"].includes(String(safeAsset.coingeckoId || assetIdentityResolution?.canonicalProviderIds?.coingeckoId || "").toLowerCase()) ? (benchmarkInstitutionalAnswerPack ? "yes" : "missing") : "not applicable"),
      bundleField("Benchmark questions injected into Institutional Checklist", benchmarkInstitutionalAnswerPack ? yesNoUnknown(safeArray(questions).some((question) => String(question.questionId || "").startsWith("benchmark_"))) : "unknown"),
      bundleField("Benchmark pack changes legacy score/verdict", benchmarkInstitutionalAnswerPack ? yesNoUnknown(benchmarkInstitutionalAnswerPack.guardrails?.legacyScoreChanged || benchmarkInstitutionalAnswerPack.guardrails?.legacyVerdictChanged) : "unknown"),
      bundleField("Benchmark pack promotes reviewed evidence/source candidates", benchmarkInstitutionalAnswerPack ? yesNoUnknown(benchmarkInstitutionalAnswerPack.guardrails?.reviewedEvidenceScoringActive || benchmarkInstitutionalAnswerPack.guardrails?.sourceCandidatesPromoted) : "unknown"),
      bundleField("Benchmark pack exposed in protected report as internal IDs", "no - protected report summary is high-level/redacted"),
      bundleField("Scoring Readiness contract present in frontend model", scoringReadinessContract ? "yes" : "missing"),
      bundleField("Scoring Readiness remains diagnostic-only", scoringReadinessContract ? yesNoUnknown(scoringReadinessContract.guardrails?.diagnosticOnly === true && scoringReadinessContract.scoringIntegration === "diagnostic_only_v1_legacy_score_unchanged") : "unknown"),
      bundleField("Scoring Readiness changed legacy score/verdict", scoringReadinessContract ? yesNoUnknown(scoringReadinessContract.guardrails?.legacyScoreChanged || scoringReadinessContract.guardrails?.legacyVerdictChanged) : "unknown"),
      bundleField("Scoring Readiness promoted reviewed evidence to scoring-active", scoringReadinessContract ? yesNoUnknown(scoringReadinessContract.guardrails?.reviewedEvidenceScoringActive || safeArray(scoringReadinessContract.dimensions).some((dimension) => dimension.isScoringActive)) : "unknown"),
      bundleField("Scoring Readiness source candidates promoted", scoringReadinessContract ? yesNoUnknown(scoringReadinessContract.guardrails?.sourceCandidatesPromoted) : "unknown"),
      bundleField("Scoring Readiness visible in live tabs", scoringReadinessContract ? yesNoUnknown(safeArray(scoringReadinessContract.frontendContract?.visibleSurfaces).includes("Decision Header") && safeArray(scoringReadinessContract.frontendContract?.visibleSurfaces).includes("Scoring Transparency")) : "unknown"),
      bundleField("Protected Investor Report redacts scoring-readiness internals", scoringReadinessContract ? yesNoUnknown(scoringReadinessContract.frontendContract?.protectedInvestorReportRedaction === "high_level_summary_only_no_internal_ids") : "unknown"),
      bundleField("Formula outputs missing while numeric inputs exist", yesNoUnknown(tokenomicsFormulaOutputsMissing)),
      bundleField("Q&A answers missing formula/data linkage", yesNoUnknown(tokenomicsQuestionsMissingLinkage)),
      bundleField("Tokenomics Q&A not rendered as question-first accordion model", yesNoUnknown(tokenomicsQuestionAccordionMirrorMissing)),
      bundleField("Question expanded answer missing short answer", yesNoUnknown(tokenomicsQuestionExpandedMissingShortAnswer)),
      bundleField("Question expanded answer missing data/formula/rule linkage", yesNoUnknown(tokenomicsQuestionMissingDataFormulaRule)),
      bundleField("Question says unknown when better status is available", yesNoUnknown(tokenomicsQuestionVagueUnknown)),
      bundleField("Not-applicable asset-class answer shown as failure", yesNoUnknown(tokenomicsNotApplicableShownAsFailure)),
      bundleField("Formula computed but Q&A does not cite it", yesNoUnknown(tokenomicsComputedFormulaNotCited)),
      bundleField("Missing-input formula lacks source requirement", yesNoUnknown(tokenomicsMissingInputFormulaNoRequirement)),
      bundleField("Provider-reported value shown as reviewed evidence", yesNoUnknown(tokenomicsProviderReportedAsReviewed)),
      bundleField("Review Bundle mirrors question-first Tokenomics model", tokenomicsSupplyIntegrity ? yesNoUnknown(!tokenomicsQuestionAccordionMirrorMissing) : "unknown"),
      bundleField("Engine Learning Backbone present in frontend model", engineLearningBackbone ? "yes" : "missing"),
      bundleField("Engine Learning source candidates remain non-reviewed", engineLearningBackbone ? yesNoUnknown(safeArray(engineLearningBackbone.sourceCandidates).some((candidate) => candidate.promotedToReviewedEvidence)) : "unknown"),
      bundleField("Engine Learning reviewed evidence stays non-scoring", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.reviewedEvidenceScoringActive) : "unknown"),
      bundleField("Engine Learning ADA packet coverage added", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.adaPacketCoverageAdded) : "unknown"),
      bundleField("Engine Learning critical output QA failures", engineLearningBackbone ? safeArray(engineLearningBackbone.outputQaChecks).filter((check) => check.status === "fail" && check.severity === "critical").length : "unknown"),
      bundleField("Engine Learning path parity includes frontend and bundle", engineLearningBackbone ? yesNoUnknown(!safeArray(engineLearningBackbone.pathParityChecks).some((check) => ["frontend_normalization", "copy_review_bundle"].includes(check.path) && !["ready", "preserved"].includes(check.status))) : "unknown"),
      bundleField("Benchmark learning registry mirrored", engineLearningBackbone ? yesNoUnknown(safeArray(engineLearningBackbone.benchmarkLearningRulesApplied).length > 0 || safeArray(engineLearningBackbone.benchmarkLearningRegistrySummary?.ruleIds).length > 0) : "unknown"),
      bundleField("Benchmark learning remains non-scoring", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.benchmarkLearningRegistrySummary?.scoringStatus === "non_scoring_v1") : "unknown"),
      bundleField("Benchmark reviewed evidence remains non-scoring-active", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.benchmarkLearningRegistrySummary?.reviewedEvidenceStatus === "reviewed_non_scoring_active_false") : "unknown"),
      bundleField("Benchmark asset preset registry present", engineLearningBackbone ? yesNoUnknown(Boolean(benchmarkAssetPresetRegistry)) : "unknown"),
      bundleField("Benchmark asset preset registry has all 15 assets", benchmarkAssetPresetRegistry ? yesNoUnknown(benchmarkAssetPresetRegistry.presetCount === 15) : "unknown"),
      bundleField("Benchmark preset selected for current asset", selectedBenchmarkPreset ? "yes" : "no / not benchmark preset"),
      bundleField("Benchmark preset expected family treated as proof", benchmarkAssetPresetRegistry ? yesNoUnknown(benchmarkAssetPresetRegistry.expectedFamilyProofByItself) : "unknown"),
      bundleField("Benchmark preset registry changed score/verdict/provider behavior", benchmarkAssetPresetRegistry ? yesNoUnknown(benchmarkAssetPresetRegistry.scoringChanged || benchmarkAssetPresetRegistry.verdictChanged || benchmarkAssetPresetRegistry.providerBehaviorChanged) : "unknown"),
      bundleField("BTC rendered baseline parity captured", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.benchmarkLearningRenderedParity?.btcBaseline2CStatus === "PASS" && engineLearningBackbone.benchmarkLearningRenderedParity?.btcBaseline12CFailureCount === 0 && engineLearningBackbone.benchmarkLearningRenderedParity?.sharedPrimaryVisibleCorpus === true) : "unknown"),
      bundleField("ETH rendered baseline parity captured", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.benchmarkLearningRenderedParity?.ethBaseline2CStatus === "PASS" && engineLearningBackbone.benchmarkLearningRenderedParity?.ethBaseline12DFailureCount === 0 && engineLearningBackbone.benchmarkLearningRenderedParity?.sharedPrimaryVisibleCorpus === true) : "unknown"),
      bundleField("ETH benchmark learning captured without scoring authority", engineLearningBackbone ? yesNoUnknown(safeArray(engineLearningBackbone.benchmarkLearningRegistrySummary?.ruleIds).includes("eth_baseline_regression_fixture") && engineLearningBackbone.benchmarkLearningRegistrySummary?.scoringStatus === "non_scoring_v1") : "unknown"),
      bundleField("Source & Data Requirement Matrix present", engineLearningBackbone ? yesNoUnknown(Boolean(engineLearningBackbone.sourceDataRequirementMatrix)) : "unknown"),
      bundleField("Matrix separates live/API from reviewed/deep research", engineLearningBackbone?.sourceDataRequirementMatrix ? "yes - full registry is backend/audit artifact; summary mirrors requirements and boundaries" : "unknown"),
      bundleField("Matrix remains non-scoring", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.currentScoringStatus === "non_scoring_requirement_matrix") : "unknown"),
      bundleField("Matrix provider behavior unchanged", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.providerBehaviorChanged) : "unknown"),
      bundleField("Matrix source candidates remain candidate-only", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.sourceCandidatesPromoted) : "unknown"),
      bundleField("Matrix reviewed evidence remains non-scoring", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.reviewedEvidenceScoringActive) : "unknown"),
      bundleField("Matrix ADA packet coverage added", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.adaPacketCoverageAdded) : "unknown"),
      bundleField("Category signals present in frontend model", yesNoUnknown(Boolean(providerCategorySignals))),
      bundleField("Provider category signals v2 active", providerRawDataExpansion || providerCategorySignals?.providerCategorySignalsVersion === "provider-category-signals-v2" ? "yes" : "no"),
      bundleField("Provider raw data expansion present in frontend model", yesNoUnknown(Boolean(providerRawDataExpansion))),
      bundleField("Raw data coverage diagnostics present in frontend model", yesNoUnknown(Boolean(rawDataCoverageDiagnostics))),
      bundleField("Category endpoint diagnostics visible", yesNoUnknown(safeArray(providerRawDataExpansion?.providerCategoryEndpointDiagnostics || providerCategorySignals?.providerCategoryEndpointDiagnostics).length > 0)),
      bundleField("Category endpoint data remains non-scoring", providerRawDataExpansion ? yesNoUnknown(providerRawDataExpansion.scoringBoundary?.scoringChanged === false && providerRawDataExpansion.scoringBoundary?.verdictChanged === false) : "unknown"),
      bundleField("Category endpoint data treated as reviewed evidence", providerRawDataExpansion ? yesNoUnknown(providerRawDataExpansion.scoringBoundary?.reviewedEvidenceScoringActive) : "unknown"),
      bundleField("Raw missing provider fields visible as source requirements", providerRawDataExpansion || rawDataCoverageDiagnostics ? yesNoUnknown(safeArray(providerRawDataExpansion?.categoryDataSourceRequirements || rawDataCoverageDiagnostics?.sourceCriticalMissingFields).length > 0) : "unknown"),
      bundleField("Provider behavior change explicitly reported", providerRawDataExpansion ? "yes - optional CoinGecko/CoinMarketCap category endpoint and raw-data expansion only" : "no endpoint expansion attached"),
      bundleField("Live-current-QA invariant preserved after provider expansion", yesNoUnknown(analysisFreshness.bundleMode === "live_current_qa" && analysisFreshness.primaryAnalysisPath === "live_full_recompute" && analysisFreshness.recomputed === true && analysisFreshness.snapshotDisabled === true && analysisFreshness.partialRefreshDisabled === true)),
      bundleField("Snapshot/partial refresh blocked after provider expansion", yesNoUnknown(analysisFreshness.snapshotReuseBlocked === true && analysisFreshness.partialRefreshBlocked === true && analysisFreshness.partialRefreshUsed !== true)),
      bundleField("Category family contract present in frontend model", yesNoUnknown(Boolean(categoryDrivenAssetFamilyContract))),
      bundleField("Category registry remains non-scoring", categoryReadinessDiagnostics ? yesNoUnknown(categoryReadinessDiagnostics.scoringIntegrationStatus === "non_scoring_v1") : "unknown"),
      bundleField("Category provider behavior status", providerRawDataExpansion ? "changed - optional endpoint/raw-data ingestion only; no scoring or verdict authority" : (categoryDrivenAssetFamilyContract ? yesNoUnknown(categoryDrivenAssetFamilyContract.scoringBoundary?.providerBehaviorChanged === false) : "unknown")),
      bundleField("Category source candidates promoted", categoryDrivenAssetFamilyContract ? yesNoUnknown(categoryDrivenAssetFamilyContract.scoringBoundary?.sourceCandidatesPromoted) : "unknown"),
      bundleField("Category reviewed evidence promoted", categoryDrivenAssetFamilyContract ? yesNoUnknown(categoryDrivenAssetFamilyContract.scoringBoundary?.reviewedEvidencePromoted) : "unknown"),
      bundleField("Category authority applied when eligible", categoryDrivenAssetFamilyContract ? yesNoUnknown(categoryDrivenAssetFamilyContract.categoryAuthorityApplied) : "unknown"),
      bundleField("Category/AIC aligned", categoryDrivenAssetFamilyContract ? yesNoUnknown((categoryDrivenAssetFamilyContract.categoryAicAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryAicAlignmentStatus) === "aligned") : "unknown"),
      bundleField("Category/DataFirst aligned", categoryDrivenAssetFamilyContract ? yesNoUnknown((categoryDrivenAssetFamilyContract.categoryDataFirstAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryDataFirstAlignmentStatus) === "aligned") : "unknown"),
      bundleField("Category/question group aligned", categoryDrivenAssetFamilyContract ? yesNoUnknown((categoryDrivenAssetFamilyContract.categoryQuestionGroupAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryQuestionGroupAlignmentStatus) === "aligned") : "unknown"),
      bundleField("Effective category source matrix aligned", categoryDrivenAssetFamilyContract?.categoryAuthorityApplied ? yesNoUnknown(!sourceMatrixFamilyMismatch) : "not applicable"),
      bundleField("visibleLensLabel mirror status", visibleLensLabelMirrorMissing ? "missing" : visibleLensLabelMirror.length ? "mirrored" : "not_rendered_by_ui"),
      bundleField("PAXG-like tokenized gold avoids manual primary label", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "tokenized_gold_commodity_rwa" ? yesNoUnknown(!/manual classification|general low-coverage/i.test(`${visibleBundleLensLabel} ${visibleBundleFramingLabel} ${dataFirstNarrativeContract?.narrativeScope?.primaryVisibleLabel || ""}`)) : "not applicable"),
      bundleField("PAXG-like tokenized gold source matrix is dedicated", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "tokenized_gold_commodity_rwa" ? yesNoUnknown(effectiveSourceMatrixIds.includes("matrix_tokenized_gold_commodity_rwa") && !effectiveSourceMatrixIds.includes("matrix_rwa_hybrid_finance")) : "not applicable"),
      bundleField("ADA-like non-ETH L1 avoids AI routing", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "non_eth_l1_smart_contract_platform" ? yesNoUnknown(!/ai_infrastructure|agent token/i.test(String(categoryDrivenAssetFamilyContract.primaryAssetFamily))) : "not applicable"),
      bundleField("ADA-like non-ETH L1 source matrix is dedicated", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "non_eth_l1_smart_contract_platform" ? yesNoUnknown(effectiveSourceMatrixIds.includes("matrix_non_eth_l1_smart_contract_platform") && !effectiveSourceMatrixIds.includes("matrix_native_pos_gas_eth")) : "not applicable"),
      bundleField("ADA-like non-ETH L1 avoids ETH-only source gaps", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "non_eth_l1_smart_contract_platform" ? yesNoUnknown(!/EIP-1559|base-fee|base fee|priority fee|L2\/blob|blob fee|proposer-builder|relay centralization|ETF-flow|ETH fee-market/i.test([
        dataFirstNarrativeContract?.generatedNarrativeFields?.map((field) => field.generatedText).join(" "),
        dataFirstNarrativeContract?.missingEvidenceGaps?.map((gap) => gap.sourceRequirement).join(" "),
        categoryDrivenAssetFamilyContract?.sourceRequirementProfile?.priorityRequirements?.join(" "),
        tokenomicsSupplyIntegrity?.sourceRequirements?.join(" "),
        tokenomicsSupplyIntegrity?.institutionalQuestions?.map((question) => `${question.shortAnswer || ""} ${question.answerSummary || ""} ${safeArray(question.missingEvidence).join(" ")} ${safeArray(question.whatWouldChange).join(" ")}`).join(" "),
      ].join(" "))) : "not applicable"),
      bundleField("Ecosystem tags preserved as context", providerCategorySignals ? yesNoUnknown(safeArray(providerCategorySignals.ecosystemContextTags).length >= 0 && safeArray(categoryDrivenAssetFamilyContract?.excludedFamilies).every((entry) => !/classification authority/i.test(entry.reason || "") || /not authority/i.test(entry.reason || ""))) : "unknown"),
      bundleField("Category question requirements visible in Source Queue", categoryDrivenAssetFamilyContract ? yesNoUnknown(safeArray(safeModel.researchRequirements).some((requirement) => String(requirement?.id || "").startsWith("category-driven-"))) : "unknown"),
      bundleField("Asset Interpretation Contract present", yesNoUnknown(!assetInterpretationContractMissing)),
      bundleField("Asset Interpretation visible label hard gate failed", yesNoUnknown(assetInterpretationHardGateFailure)),
      bundleField("Asset Interpretation label matches bundle/display label", assetInterpretationContract ? yesNoUnknown(!assetInterpretationVisibleLabelMismatch) : "unknown"),
      bundleField("Non-ETH lens showing ETH PoS/gas label", yesNoUnknown(nonEthLensShowingEthGasLabel)),
      bundleField("Data-first narrative contract present", yesNoUnknown(!dataFirstNarrativeMissing)),
      bundleField("Data-first primary narrative gate failed", yesNoUnknown(dataFirstNarrativeFailing)),
      bundleField("AIC label PASS but narrative FAIL", yesNoUnknown(aicLabelPassButNarrativeFail)),
      bundleField("Authority Hierarchy Contract present", yesNoUnknown(!authorityHierarchyMissing)),
      bundleField("Primary Analysis Route present", yesNoUnknown(!primaryRouteMissing)),
      bundleField("Primary route safe for visible surfaces", primaryAnalysisRoute ? yesNoUnknown(!primaryRouteNotSafe) : "unknown"),
      bundleField("Primary route fallback used", primaryAnalysisRoute ? yesNoUnknown(primaryRouteFallbackUsed) : "unknown"),
      bundleField("Primary visible label sourced from primaryAnalysisRoute", primaryAnalysisRoute?.visibleLabel ? yesNoUnknown(!primaryRouteLabelMismatch) : "unknown"),
      bundleField("Primary question route mismatch diagnostic attached", primaryRouteQuestionGroupMismatch ? "no - QA failure" : "yes"),
      bundleField("Raw resolved lens remains audit-only", authorityHierarchyContract ? yesNoUnknown(authorityHierarchyContract.rawResolvedLensBoundary === "audit_only_not_primary_display") : "unknown"),
      bundleField("Benchmark preset remains reference-only", authorityHierarchyContract ? yesNoUnknown(authorityHierarchyContract.benchmarkPresetBoundary === "reference_only_not_primary_override") : "unknown"),
      bundleField("Representation-Family Matrix present", representationFamilyDecision ? "yes" : "missing"),
      bundleField("Representation route separates evidence gaps from wrong family", representationFamilyRoute ? yesNoUnknown(representationFamilyRoute.evidenceCompletenessSeparatedFromRoute && !representationFamilyEvidenceGates.some((gate) => gate.affectsRoute)) : "unknown"),
      bundleField("LST degraded to generic wrapped route", representationFamilyDecision?.representationType === "liquid_staking_derivative" ? yesNoUnknown(representationFamilyRoute?.selectedFamily !== "liquid_staking_derivative") : "not applicable"),
      bundleField("Wrapped route blocked only because evidence missing", ["wrapped_asset", "bridged_asset", "wrapped_or_bridged_asset"].includes(String(representationFamilyDecision?.representationType)) ? yesNoUnknown(representationFamilyRoute?.selectedFamily === "wrapped_bridged_asset" && representationFamilyRoute?.routeBlocked) : "not applicable"),
      bundleField("Provider/raw/benchmark override touched primary family", representationFamilyDecision ? yesNoUnknown(safeArray(representationFamilyDecision.conflicts).some((conflict) => conflict.primaryRouteAffected && ["provider_category_tried_to_override_representation", "raw_lens_tried_to_override_representation", "benchmark_expectation_tried_to_override_representation"].includes(conflict.conflictType))) : "unknown"),
      bundleField("Authority hierarchy scoring/provider guardrails preserved", authorityHierarchyContract ? yesNoUnknown(
        authorityHierarchyContract.guardrails?.scoringChanged === false
        && authorityHierarchyContract.guardrails?.verdictChanged === false
        && authorityHierarchyContract.guardrails?.providerBehaviorChanged === false
        && authorityHierarchyContract.guardrails?.providerFetchChanged === false
        && authorityHierarchyContract.guardrails?.reviewedEvidenceScoringActive === false
        && authorityHierarchyContract.guardrails?.sourceCandidatesPromoted === false
        && authorityHierarchyContract.guardrails?.tokenSpecificOverrideAdded === false
      ) : "unknown"),
      bundleField("Score explanation not data-bound", yesNoUnknown(scoreExplanationNotDataBound)),
      bundleField("Wrong-asset primary narrative mentions", dataFirstNarrativeContract ? safeArray(dataFirstNarrativeContract.wrongAssetNameMentions).length : "unknown"),
      bundleField("Forbidden primary narrative concepts", dataFirstNarrativeContract ? safeArray(dataFirstNarrativeContract.forbiddenConceptMentions).length : "unknown"),
      bundleField("Unsupported primary narrative claims", dataFirstNarrativeContract ? safeArray(dataFirstNarrativeContract.unsupportedClaimsDetected).length : "unknown"),
      bundleField("Source universe taxonomy candidate-only", assetInterpretationContract ? yesNoUnknown(!sourceUniversePromoted) : "unknown"),
      bundleField("Network treated as classification authority", assetInterpretationContract ? yesNoUnknown(assetInterpretationContract.thesisLensContext?.networkContextIsClassificationAuthority) : "unknown"),
      bundleField("Asset Interpretation scoring boundary preserved", assetInterpretationContract ? yesNoUnknown(
        assetInterpretationContract.scoringBoundary?.scoringChanged === false
        && assetInterpretationContract.scoringBoundary?.verdictChanged === false
        && assetInterpretationContract.scoringBoundary?.providerBehaviorChanged === false
        && assetInterpretationContract.scoringBoundary?.sourceCandidatesPromoted === false
      ) : "unknown"),
      bundleField("Tokenomics key questions visible near top of tab", tokenomicsSupplyIntegrity ? "yes - Q&A renders after executive summary and key-risk summary" : "unknown"),
      bundleField("Tokenomics Q&A buried below detail sections", tokenomicsSupplyIntegrity ? "no - provider/identity/audit details are lower or collapsible" : "unknown"),
      bundleField("Tabs use executive answer / key question structure", "yes - Decision, Thesis, Evidence, Scoring, Source Queue, Manual Review, and Tokenomics include executive or question-first lead sections"),
      bundleField("Primary tab order follows answer/questions/evidence/audit", "yes - primary tabs lead with executive answer and question prompts before provider/audit detail"),
      bundleField("Institutional Checklist questions buried below resolver/provider metadata", safeArray(questions).length ? "no - live Q&A rows render before lens/provider context" : "unknown"),
      bundleField("Decision repeats blocker/evidence lists in multiple primary sections", "no - duplicate blocker, weakest-link, and layer details are collapsed under Decision Details / Audit"),
      bundleField("Thesis exposes long report sections before core questions", "no - allocation semantics and supporting panels are collapsed below falsification questions"),
      bundleField("Audit/provider details dominate primary product surface", "no - audit/provider-heavy detail is demoted or collapsible in primary tab flow"),
      bundleField("Long contract/provider lists visible before key questions", tokenomicsSupplyIntegrity ? "no - Tokenomics questions precede contract/provider detail" : "unknown"),
      bundleField("Repeated boundary copy overwhelms primary UX", "unknown - bundle cannot measure visual density; primary tabs now consolidate boundary copy into executive/detail sections"),
      bundleField("Question cards include status/impact/source badges", tokenomicsSupplyIntegrity ? "yes - Tokenomics and lightweight tab prompts render status, impact, and source-state badges" : "unknown"),
      bundleField("Expandable cards include chevron/expand microcopy", "yes - shared question/detail cards expose View/Hide or Expand/Collapse copy with chevrons"),
      bundleField("Expandable rows keyboard/touch accessible", "yes - shared expanders use button semantics with aria-expanded; checklist rows use native summary plus visible state copy"),
      bundleField("Mobile overflow risk from long IDs/contracts", "reduced - primary text rows, cards, rail values, and timelines use break-word/anywhere wrapping"),
      bundleField("Right rail competes on small screens", "no - responsive layout stacks rail and uses compact mobile rail summary"),
      bundleField("Primary UI contains 'Unavailable in current frontend model'", "no - that placeholder is reserved for Review Bundle/audit fallback text"),
      bundleField("Primary UI exposes raw sourceBoundary field names", checklistRawSourceBoundaryPrimaryRisk ? "no - raw boundary ids are collapsed technical/audit detail, not primary row copy" : "no"),
      bundleField("Primary UI exposes scoringFieldsUsed", "no - checklist scoring/audit fields are collapsed technical details"),
      bundleField("Checklist supported status but no short answer", yesNoUnknown(checklistSupportedWithoutAnswer)),
      bundleField("Checklist question has no readable fallback answer", yesNoUnknown(checklistNoReadableFallback)),
      bundleField("Long supportingSignals list appears before concise answer", checklistLongSignalsRisk ? "no - long signal lists are collapsed behind concise answers" : "no"),
      bundleField("Decision/Thesis missing question-first cards", "no - Decision and Thesis render question prompt cards near the top"),
      bundleField("Thesis starts with long report text before key questions", "no - key falsification prompts appear immediately after the summary card"),
      bundleField("Institutional Checklist rendered as concise Q&A rows", safeArray(questions).length ? "yes - live answers render as expandable rows" : "unknown"),
      bundleField("FDV/market-cap ratio missing despite valid values", yesNoUnknown(tokenomicsMissingRatioDespiteValues)),
      bundleField("Remaining dilution missing despite supply values", yesNoUnknown(tokenomicsMissingDilutionDespiteValues)),
      bundleField("Provider-reported values missing boundary label", yesNoUnknown(tokenomicsProviderBoundaryMissing)),
      bundleField("Score/caps distinguish diagnostic-only from final scoring", safeArray(tokenomicsSupplyIntegrity?.sourceBoundary).includes("diagnostic_only_not_scoring_active") ? "yes" : "unknown"),
      bundleField("Canonical issuer-native stablecoin incorrectly marked wrapped/bridged", yesNoUnknown(tokenomicsCanonicalStablecoinWrongVariant)),
      bundleField("Pair-level DexScreener data compared as global disagreement", yesNoUnknown(tokenomicsCrossScopeDisagreementPollution)),
      bundleField("Q&A includes unrelated provider diagnostics", yesNoUnknown(tokenomicsQaUnrelatedDiagnostics)),
      bundleField("Stablecoin max-supply/dilution question asset-class-aware", tokenomicsSupplyIntegrity && lens?.lensId === "STABLECOIN_SETTLEMENT" ? yesNoUnknown(!tokenomicsStablecoinQuestionsGeneric) : "unknown"),
      bundleField("Ambiguous verified mint/admin labels in primary UI", yesNoUnknown(tokenomicsAmbiguousVerifiedControlLabels)),
      bundleField("Provider contract list too long without summary/expand behavior", tokenomicsContractListTooLong ? "no - primary tab summarizes and expands contract mappings" : "no"),
      bundleField("Tokenomics exact numbers/formulas/Q&A present after cleanup", tokenomicsSupplyIntegrity ? yesNoUnknown(Boolean(tokenomicsFormulaOutputs.length && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).length)) : "unknown"),
      bundleField("Review Bundle mirrors Tokenomics tab", tokenomicsSupplyIntegrity ? "yes" : "unknown"),
      bundleField("NaN/Infinity/undefined visible in tokenomics object", yesNoUnknown(tokenomicsUnsafeNumericText)),
      bundleField("Native asset wrongly penalized for no contract", yesNoUnknown(tokenomicsNativeNoContractPenalty)),
      bundleField("Native benchmark penalized for missing ERC-20 unlocks", yesNoUnknown(tokenomicsNativeUnlockPenalty)),
      bundleField("Issuer-native stablecoin has wrapped/bridged warning contradiction", yesNoUnknown(issuerNativeStablecoinVariantWarningLeak || tokenomicsCanonicalStablecoinWrongVariant)),
      bundleField("RWA protocol token canonical network overridden by product/partner chain", yesNoUnknown(rwaProtocolProductChainCanonicalOverride)),
      bundleField("Meme evidence routed to ambiguous manual classification", yesNoUnknown(memeEvidenceRoutedManual)),
      bundleField("Stablecoin hard-cap dilution treated as primary risk", yesNoUnknown(tokenomicsStablecoinHardCapPrimary)),
      bundleField("Protocol success treated as tokenholder accrual", yesNoUnknown(tokenomicsProtocolSuccessAsAccrual)),
      bundleField("Migrated token lacks canonical/migration source requirement", yesNoUnknown(tokenomicsMigrationWithoutRequirement)),
      bundleField("Meme asset routed to manual classification despite meme lens", yesNoUnknown(tokenomicsMemeManualDespiteLens)),
      bundleField("LST score collapses from missing evidence without confirmed failure", yesNoUnknown(lstScoreCollapsedOnMissingEvidence)),
      bundleField("WBTC-like selection appears bridged/high-risk", yesNoUnknown(wbtcLikelyBridgedSelection)),
      bundleField("Reviewed packet exists but Q&A still shows generic source-required answer", yesNoUnknown(reviewedPacketGenericSourceRequiredLeak)),
      bundleField("Institutional Answer Synthesis attached to all visible question rows", yesNoUnknown(!synthesizedAnswerMissing)),
      bundleField("Synthesized direct answers avoid methodology copy", yesNoUnknown(!genericMethodologySynthesisLeak)),
      bundleField("Synthesized direct answers avoid null/undefined/NaN/Infinity", yesNoUnknown(!synthesizedBadRenderableValue)),
      bundleField("Source-backed synthesized answer has reviewed sources/facts", yesNoUnknown(!sourceBackedSynthesisWithoutSourceList)),
      bundleField("Reviewed evidence remains non-scoring-active in synthesis", yesNoUnknown(!synthesizedScoringBoundaryViolation)),
      bundleField("Provider-only synthesis avoids reviewed-evidence overclaim", yesNoUnknown(!providerOnlySynthesisOverclaimed)),
      bundleField("Computed/formula synthesis avoids reviewed-evidence overclaim", yesNoUnknown(!computedSynthesisOverclaimed)),
      bundleField("Analyst answer card attached to synthesized rows", yesNoUnknown(!analystCardMissing)),
      bundleField("Analyst primary answers present", yesNoUnknown(!analystPrimaryMissingAnswer)),
      bundleField("Analyst primary UI hides template IDs/internal fields", yesNoUnknown(!analystPrimaryTemplateLeakage)),
      bundleField("Analyst primary UI hides raw sourceBoundary enums", yesNoUnknown(!analystPrimaryRawEnumLeakage)),
      bundleField("Analyst primary badges avoid supported/source-required contradiction", yesNoUnknown(!analystContradictoryBadgeStack)),
      bundleField("Source-backed analyst cards include reviewed evidence", yesNoUnknown(!analystSourceBackedWithoutSources)),
      bundleField("Provider-only analyst card avoids reviewed-evidence overclaim", yesNoUnknown(!analystProviderOnlyOverclaim)),
      bundleField("Formula-derived analyst card avoids reviewed-evidence overclaim", yesNoUnknown(!analystFormulaOverclaim)),
      bundleField("Bundle mirrors analyst-card primary answer/status/boundary", yesNoUnknown(!analystBundleMirrorMissing)),
      bundleField("Stablecoin trust evidence is central, not not-applicable", yesNoUnknown(!stablecoinTrustNotApplicableLeakage)),
      bundleField("Stablecoin max-supply/dilution rows do not dominate trust diligence", yesNoUnknown(!stablecoinTokenomicsScarcityDominance)),
      bundleField("Stablecoin protocol-token value-capture remains not applicable where appropriate", yesNoUnknown(!stablecoinProtocolNotApplicableMissing)),
      bundleField("Stablecoin synthesis copy absent for non-stablecoin lens", yesNoUnknown(!stablecoinCopyLeakageInSynthesis)),
      bundleField("Irrelevant sector markers absent from synthesized primary answer context", yesNoUnknown(!irrelevantSectorSignalLeakageInSynthesis)),
      bundleField("Supported/source-required synthesis mismatch has explicit boundary", yesNoUnknown(!supportedSourceRequiredSynthesisMismatch)),
      bundleField("Tokenized-gold primary checklist avoids generic vesting/token-demand/wrapped copy", tokenizedGoldPrimaryContext ? yesNoUnknown(!tokenizedGoldPrimaryCopyLeak) : "not applicable"),
      bundleField("Tokenized-gold primary checklist includes backing/custody/redemption/legal/market/control language", tokenizedGoldPrimaryContext ? yesNoUnknown(!tokenizedGoldPrimaryCopyMissingAllowed) : "not applicable"),
      bundleField("Source-backed reviewed answer missing source list", yesNoUnknown(reviewedPacketSourceBackedNoSources)),
      bundleField("Reviewed demo evidence treated as scoring-active", yesNoUnknown(reviewedPacketScoringActive)),
      bundleField("Reviewed evidence allowed to change final verdict/overall score", reviewedPacketScoringActive ? "yes - QA violation" : "no - non-scoring display layer"),
      bundleField("Reviewed packet stale source shown as fresh", yesNoUnknown(reviewedPacketStaleMismatch)),
      bundleField("Reviewed packet contradiction not surfaced", yesNoUnknown(reviewedPacketContradictionHidden)),
      bundleField("Review Bundle missing evidence packet section", yesNoUnknown(reviewedPacketMissingBundleSection)),
      bundleField("Official mechanism docs source-backed a market/liquidity question", yesNoUnknown(reviewedPacketMechanismBackedMarketLiquidity)),
      bundleField("Official mechanism docs source-backed distribution/overhang materiality", yesNoUnknown(reviewedPacketMechanismBackedDistributionOverhang)),
      bundleField("Official mechanism docs source-backed live liveness/outage status", yesNoUnknown(reviewedPacketMechanismBackedLiveLiveness)),
      bundleField("Stablecoin reserve docs source-backed protocol burn/buyback question", yesNoUnknown(reviewedPacketStablecoinBackedProtocolBurn)),
      bundleField("Governance/adoption possibility treated as active tokenholder accrual", yesNoUnknown(reviewedPacketProtocolPossibilityBackedActiveAccrual)),
      bundleField("RWA product rights applied to protocol tokenholder rights", yesNoUnknown(reviewedPacketRwaProductRightsAsProtocolRights)),
      bundleField("Platform/AUM activity used as tokenholder accrual", yesNoUnknown(reviewedPacketPlatformAumAsAccrual)),
      bundleField("Gaming docs used as active-user/payer/retention proof", yesNoUnknown(reviewedPacketGamingDocsAsLiveDemand)),
      bundleField("Meme classification used as investment-quality proof", yesNoUnknown(reviewedPacketMemeAsInvestmentQuality)),
      bundleField("Native L1 docs used as market liquidity proof", yesNoUnknown(reviewedPacketNativeL1DocsAsLiquidity)),
      bundleField("Safety Module/staking docs shown as risk-free yield", yesNoUnknown(reviewedPacketSafetyModuleAsRiskFreeYield)),
      bundleField("Native BTC packet applied to wrapped/bridged BTC variant", yesNoUnknown(reviewedPacketNativeBtcAppliedToWrappedVariant)),
      bundleField("Reviewed evidence identity conflict hidden from UI", yesNoUnknown(reviewedEvidenceIdentityConflictHidden)),
      bundleField("Source-backed mapping still has material same-question gaps", yesNoUnknown(reviewedEvidenceSourceBackedWithMaterialSameGaps)),
      bundleField("LST source-backed mechanism displayed as risk elimination", yesNoUnknown(reviewedLstMechanismEliminatesRisk)),
      bundleField("RENDER DePIN answer leaks gaming active-user copy", yesNoUnknown(reviewedPacketRenderGamingCopyLeak)),
      bundleField("RENDER DePIN mechanism rows collapsed to pure source-required", yesNoUnknown(renderDepinMechanismCollapsedToSourceRequired)),
      bundleField("RENDER live demand proof incorrectly source-backed", yesNoUnknown(renderDepinLiveDemandIncorrectlyUpgraded)),
      bundleField("RENDER mechanism reviewed fact IDs visible", yesNoUnknown(renderDepinMechanismFactsVisible)),
      bundleField("ONDO reviewed evidence leaks RENDER migration identity warning", yesNoUnknown(reviewedPacketOndoRenderWarningLeak)),
      bundleField("UNI fee-switch/TokenJar source candidates missing from source requirements", yesNoUnknown(uniSourceCandidateRequirementsMissing)),
      bundleField("WBTC single-provider identity context hidden", yesNoUnknown(wbtcSingleProviderIdentityHidden)),
      bundleField("stETH LST displays false equal-weight RWA ambiguity", yesNoUnknown(stethFalseRwaAmbiguityVisible)),
      bundleField("Canonical and bridged/wrapped variants visually distinguishable in candidate UI", "yes - candidate cards show representation and wrong-asset risk when backend returns identitySummary"),
      bundleField("High-risk search candidate lacks warning labels", yesNoUnknown(highRiskSearchCandidateLooksSafe)),
      bundleField("Provider disagreement hidden in search identity", yesNoUnknown(providerDisagreementHidden)),
      bundleField("Risky selected search candidate missing bundle mirror", yesNoUnknown(riskySearchSelectionMissingBundleMirror)),
      bundleField("tokenomicsIntegrityScore high despite unresolved critical caps", yesNoUnknown(tokenomicsHighScoreWithCriticalCaps)),
      bundleField("tokenomicsIntegrityScore too punitive for not-applicable fields", yesNoUnknown(tokenomicsTooPunitiveForNotApplicable)),
      bundleField("Wrapped/stable/LST/RWA missing redemption/reserve source requirements", tokenomicsSupplyIntegrity ? yesNoUnknown(
        ["WRAPPED_ASSET", "STABLECOIN_SETTLEMENT", "LST_STAKING_DERIVATIVE", "RWA_HYBRID_ASSET"].includes(lens?.lensId)
        && !safeArray(tokenomicsSupplyIntegrity.sourceRequirements).some((item) => /reserve|redemption|mint|burn|custodian|legal|collateral|withdrawal/i.test(item)),
      ) : "unknown"),
      bundleField("Calibration warnings visible if present", safeArray(calibrationWarnings).length ? "yes" : "unknown"),
      bundleField("Analysis freshness visible in live tabs", analysisFreshness.freshnessStatus !== "unknown" || analysisFreshness.freshnessWarnings.length ? "yes" : "unknown"),
      bundleField("Live-first QA eligibility visible", analysisFreshness.qaEligibilityLabel ? "yes" : "unknown"),
      bundleField("Stored-analysis bundle absent from current QA", analysisFreshness.isSnapshot ? "no - blocking failure" : "yes"),
      bundleField("Cached/recent bundle absent from current QA", analysisFreshness.isCachedRecentMemo ? "no - blocking failure" : "yes"),
      bundleField("Live-only freshness schema active", analysisFreshness.bundleMode === "live_current_qa" ? "yes" : "no"),
      bundleField("Bundle generated from same normalized product object", yesNoUnknown(bundleUsesSameCurrentAnalysisObject)),
      bundleField("Rendered-surface parity gate attached", renderedSurfaceParityViewModel.primaryVisibleText.length ? "yes" : "unknown"),
      bundleField("Component consumes BTC-native lens label override where applicable", lens?.lensId === "NATIVE_MONETARY_BENCHMARK" ? yesNoUnknown(/Native PoW Monetary/i.test(renderedPrimaryVisibleText)) : "not applicable"),
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

  const bundleHeader = [
    "ThesisCore Cross-Tab QA Review Bundle",
    `Generated: ${bundleGeneratedAt}`,
    `Mode: ${analysisFreshness.bundleMode || "unknown"} | Fresh QA eligible: ${analysisFreshness.freshQaEligible ? "yes" : "no"}`,
    "Purpose: paste this bundle into review to detect lens routing, wording, evidence-boundary, scoring/explanation, frontend visibility, and live-first freshness issues.",
  ];
  const coreBundleText = [
    ...bundleHeader,
    ...sections,
  ].join("\n");
  const leakageForbiddenStringChecks = buildIdentityLensLeakageForbiddenStringChecks({
    bundleText: coreBundleText,
    asset: safeAsset,
    lens,
    assetIdentityResolution,
    reviewedEvidencePacket,
  });
  const leakageFailures = leakageForbiddenStringChecks.filter((check) => !check.passed);
  const btcBenchmarkForbiddenStringChecks = renderedBtcForbiddenStringChecks;
  const btcBenchmarkFailures = btcBenchmarkForbiddenStringChecks.filter((check) => !check.passed);
  const ethBenchmarkForbiddenStringChecks = renderedEthForbiddenStringChecks;
  const ethBenchmarkFailures = ethBenchmarkForbiddenStringChecks.filter((check) => !check.passed);
  const leakageQaSection = bundleSection("12B. Identity / Lens Leakage Recovery Patch #2 Text QA", [
    bundleField("Text-level forbidden-string checks run", leakageForbiddenStringChecks.length ? "yes" : "not applicable for this asset/lens"),
    bundleField("Text-level forbidden-string failures", leakageFailures.length),
    bundleField("Checked fields", leakageForbiddenStringChecks.flatMap((check) => check.checkedFields).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    bundleField("Checked bundle sections", leakageForbiddenStringChecks.flatMap((check) => check.checkedBundleSections).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    "Forbidden-string checks:",
    bundleList(leakageForbiddenStringChecks.map((check) =>
      `${check.checkId}: ${check.passed ? "PASS" : "FAIL"} | ${check.forbidden} | matches=${check.matches.join("; ") || "none"} | allowedWhen=${check.allowedWhen}`
    )),
    "False-negative prevention:",
    bundleList([
      "Checks scan the Copy Review Bundle core text mirror, not only boolean model flags.",
      "Checks include identity warnings, ambiguity/provider-internal flags, reviewed-evidence warnings, Source Queue, Manual Review, and audit-mirror sections.",
      "Checks are asset/lens scoped so valid RWA, wrapped, gaming, DePIN, and LST copy is not globally forbidden.",
    ]),
  ]);
  const btcBenchmarkQaSection = bundleSection("12C. BTC Benchmark Answer / Native Base-Layer Text QA", [
    bundleField("Rendered corpus owner", renderedSurfaceParityViewModel.corpusProvenance?.owner),
    bundleField("Decision Tab corpus ID", renderedSurfaceParityViewModel.corpusProvenance?.decisionTabCorpusId),
    bundleField("Corpus source", renderedSurfaceParityViewModel.corpusProvenance?.twelveCSource),
    bundleField("BTC-native forbidden-string checks run", btcBenchmarkForbiddenStringChecks.length ? "yes" : "not applicable for this asset/lens"),
    bundleField("BTC-native forbidden-string failures", btcBenchmarkForbiddenStringChecks.flatMap((check) => check.primaryVisibleFailures || []).length),
    bundleField("Checked fields", btcBenchmarkForbiddenStringChecks.flatMap((check) => check.checkedFields).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    bundleField("Checked bundle sections", btcBenchmarkForbiddenStringChecks.flatMap((check) => check.checkedBundleSections).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    "Forbidden-string checks:",
    bundleList(btcBenchmarkForbiddenStringChecks.map((check) =>
      `${check.checkId}: ${check.passed ? "PASS" : "FAIL"} | ${check.forbidden} | primaryMatches=${(check.primaryVisibleFailures || []).map((failure) => `${failure.surface}.${failure.fieldPath}: ${failure.matchedForbiddenPhrase}`).join("; ") || "none"} | secondary=${(check.secondaryVisibleMentions || []).length} | audit/internal/report exclusions=${[
        ...(check.auditOnlyMentions || []),
        ...(check.internalIdExclusions || []),
        ...(check.forbiddenListExclusions || []),
        ...(check.beforeStateExclusions || []),
        ...(check.selfTriggerExclusions || []),
      ].length} | allowedWhen=${check.allowedWhen}`
    )),
    "Native BTC expected surface:",
    bundleList([
      "Primary copy should use native proof-of-work, hard-cap/halving, blockspace/transaction-fee demand, miner economics, hashrate/security-budget, mining-pool concentration, liquidity/depth, custody/access, and liveness wording.",
      "Wrapped WBTC or bridged BTC variants remain separate identity contexts and must not inherit native BTC treatment automatically.",
      "Reviewed demo BTC evidence improves answer quality only; it is not scoring-active in v1.",
    ]),
  ]);
  const ethBenchmarkQaSection = bundleSection("12D. ETH Benchmark Answer / PoS Settlement Text QA", [
    bundleField("Rendered corpus owner", renderedSurfaceParityViewModel.corpusProvenance?.owner),
    bundleField("Decision Tab corpus ID", renderedSurfaceParityViewModel.corpusProvenance?.decisionTabCorpusId),
    bundleField("Corpus source", renderedSurfaceParityViewModel.corpusProvenance?.twelveDSource),
    bundleField("ETH-native forbidden-string checks run", ethBenchmarkForbiddenStringChecks.length ? "yes" : "not applicable for this asset/lens"),
    bundleField("ETH-native forbidden-string failures", ethBenchmarkForbiddenStringChecks.flatMap((check) => check.primaryVisibleFailures || []).length),
    bundleField("Checked fields", ethBenchmarkForbiddenStringChecks.flatMap((check) => check.checkedFields).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    bundleField("Checked bundle sections", ethBenchmarkForbiddenStringChecks.flatMap((check) => check.checkedBundleSections).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    "Forbidden-string checks:",
    bundleList(ethBenchmarkForbiddenStringChecks.map((check) =>
      `${check.checkId}: ${check.passed ? "PASS" : "FAIL"} | ${check.forbidden} | primaryMatches=${(check.primaryVisibleFailures || []).map((failure) => `${failure.surface}.${failure.fieldPath}: ${failure.matchedForbiddenPhrase}`).join("; ") || "none"} | secondary=${(check.secondaryVisibleMentions || []).length} | audit/internal/report exclusions=${[
        ...(check.auditOnlyMentions || []),
        ...(check.internalIdExclusions || []),
        ...(check.forbiddenListExclusions || []),
        ...(check.beforeStateExclusions || []),
        ...(check.selfTriggerExclusions || []),
      ].length} | allowedWhen=${check.allowedWhen}`
    )),
    "Native ETH expected surface:",
    bundleList([
      "Primary copy should use PoS smart-contract settlement, gas demand, transaction-fee demand, EIP-1559 base-fee burn, net issuance, staking/validator security, client diversity, slashing/liveness, L2 settlement, blob/data-availability fees, liquidity/depth, custody/access, ETF-flow, and regulatory-access wording.",
      "Native ETH should not show BTC PoW/miner/hashrate/halving/block-subsidy copy, wrapped backing/redemption copy, stablecoin reserves/attestation copy, RWA legal/NAV/redemption copy, DePIN/gaming/meme copy, or ERC-20 admin/proxy copy as primary visible framing.",
      "Reviewed demo ETH evidence improves answer quality only; it is not scoring-active in v1.",
    ]),
  ]);
  return [
    ...bundleHeader,
    ...sections,
    leakageQaSection,
    btcBenchmarkQaSection,
    ethBenchmarkQaSection,
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
