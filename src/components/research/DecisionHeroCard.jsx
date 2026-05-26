import React from "react";
import { Card } from "./researchPrimitives";
import { formatDateTime, formatScoreValue, safeArray, sanitizeSemanticLabel } from "./researchUtils";

function outcomeColor(outcomeKey) {
  if (outcomeKey === "capital_worthy") return "#2fd67b";
  if (outcomeKey === "investable_medium_confidence") return "#2fd67b";
  if (outcomeKey === "conditional_allocation") return "#ffb020";
  if (outcomeKey === "evidence_blocked") return "#ffb020";
  if (outcomeKey === "manual_review_required") return "#ffb020";
  if (outcomeKey === "not_allocation_ready") return "#ff8a4c";
  if (outcomeKey === "tradable_only" || outcomeKey === "tradable_only_narrative") return "#ff8a4c";
  if (String(outcomeKey || "").startsWith("do_not_allocate")) return "#ff6b6b";
  if (outcomeKey === "avoid_critical_risk") return "#ff6b6b";
  return "#ff6b6b";
}

function statusToneColor(label) {
  const text = String(label || "").toLowerCase();
  if (text.includes("scoring")) return "#7dd3fc";
  if (text.includes("review") || text.includes("proxy") || text.includes("fallback")) return "#ffb020";
  if (text.includes("unavailable")) return "#8a94a6";
  return "#d5dcec";
}

function StatusBadge({ label, styles, color = null }) {
  const badgeColor = color || statusToneColor(label);
  return (
    <span
      style={{
        ...styles.decisionHeaderStatusBadge,
        color: badgeColor,
        borderColor: `${badgeColor}55`,
        background: `${badgeColor}16`,
      }}
    >
      {label}
    </span>
  );
}

function InteractiveActionButton({ children, onClick, styles, variant = "secondary" }) {
  const [interactiveState, setInteractiveState] = React.useState({
    hover: false,
    focus: false,
    pressed: false,
  });
  const isPrimary = variant === "primary";
  const baseStyle = isPrimary ? styles.decisionHeaderPrimaryButton : styles.decisionHeaderTextButton;
  const hoverStyle = isPrimary ? styles.decisionHeaderPrimaryButtonHover : styles.decisionHeaderTextButtonHover;
  const focusStyle = isPrimary ? styles.decisionHeaderPrimaryButtonFocus : styles.decisionHeaderTextButtonFocus;
  const pressedStyle = isPrimary ? styles.decisionHeaderPrimaryButtonPressed : styles.decisionHeaderTextButtonPressed;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setInteractiveState((state) => ({ ...state, hover: true }))}
      onMouseLeave={() => setInteractiveState((state) => ({ ...state, hover: false, pressed: false }))}
      onMouseDown={() => setInteractiveState((state) => ({ ...state, pressed: true }))}
      onMouseUp={() => setInteractiveState((state) => ({ ...state, pressed: false }))}
      onFocus={() => setInteractiveState((state) => ({ ...state, focus: true }))}
      onBlur={() => setInteractiveState({ hover: false, focus: false, pressed: false })}
      style={{
        ...baseStyle,
        ...(interactiveState.hover ? hoverStyle : null),
        ...(interactiveState.focus ? focusStyle : null),
        ...(interactiveState.pressed ? pressedStyle : null),
      }}
    >
      {children}
    </button>
  );
}

function DecisionInsightCard({ title, value, detail, badge, accent, cta, onClick, styles }) {
  return (
    <div style={{ ...styles.decisionInsightCard, borderColor: `${accent}33` }}>
      <div style={styles.decisionInsightHeader}>
        <div style={styles.decisionInsightTitle}>{title}</div>
        {badge ? <StatusBadge label={badge} styles={styles} color={accent} /> : null}
      </div>
      <div style={styles.decisionInsightValue}>{value}</div>
      {detail ? <div style={styles.decisionInsightDetail}>{detail}</div> : null}
      {cta ? (
        <InteractiveActionButton onClick={onClick} styles={styles}>
          {cta} -&gt;
        </InteractiveActionButton>
      ) : null}
    </div>
  );
}

function ScoreTile({ label, value, detail, styles }) {
  return (
    <div style={styles.decisionScoreTile}>
      <div style={styles.decisionScoreLabel}>{label}</div>
      <div style={styles.decisionScoreValue}>{value}</div>
      {detail ? <div style={styles.decisionScoreDetail}>{detail}</div> : null}
    </div>
  );
}

function IdentityAndLensGuardrail({ asset, model, styles, onSelectSection }) {
  const lens = model?.resolvedInstitutionalLens || {};
  const identity = model?.assetIdentityResolution || {};
  const freshness = model?.analysisFreshness || {};
  const tokenomics = model?.tokenomicsSupplyIntegrity || {};
  const warnings = safeArray(model?.calibrationWarnings);
  const identityWarnings = warnings.filter((warning) => /identity|variant|wrapped|bridged/i.test(String(warning?.id || warning?.issue || "")));
  const providerIds = [
    asset?.coingeckoId ? `CoinGecko: ${asset.coingeckoId}` : null,
    asset?.coinmarketcapId ? `CoinMarketCap: ${asset.coinmarketcapId}` : null,
  ].filter(Boolean);
  if (!lens?.lensId && !identityWarnings.length && !asset?.chain && !asset?.contractAddress && !providerIds.length && !freshness.freshnessLabel) return null;

  return (
    <div style={styles.decisionLayerLegend}>
      <div style={styles.decisionLayerLegendHeader}>
        <div>
          <div style={styles.decisionLayerLegendEyebrow}>Resolved Lens / Identity Guardrail</div>
          <div style={styles.decisionLayerLegendCopy}>
            The selected asset identity and provider-grounded lens route the live research workflow. Provider metadata is classification context, not reviewed evidence.
          </div>
        </div>
        <InteractiveActionButton onClick={() => onSelectSection?.("institutional_checklist")} styles={styles}>
          Inspect lens -&gt;
        </InteractiveActionButton>
      </div>
      <div style={styles.decisionLayerLegendGrid}>
        <LayerLegendItem
          title={lens.label || "Resolved lens unavailable"}
          detail={`Lens: ${lens.lensId || "unavailable"}; question group: ${lens.questionGroupId || "unavailable"}.`}
          badge={lens.confidence ? `${lens.confidence} confidence` : "Lens pending"}
          tone="#7dd3fc"
          styles={styles}
        />
        <LayerLegendItem
          title="Selected identity"
          detail={`Canonical network: ${identity.canonicalNetworkCandidate || "unavailable"}; analyzed: ${identity.analyzedNetwork || asset?.chain || "unavailable"} ${identity.analyzedContract || asset?.contractAddress || "no contract"}.`}
          badge={identity.wrongAssetRisk ? `Wrong-asset risk: ${identity.wrongAssetRisk}` : identityWarnings.length ? "Manual review required" : "Identity context"}
          tone={identity.wrongAssetRisk === "high" || identityWarnings.length ? "#ffb020" : "#d5dcec"}
          styles={styles}
        />
        <LayerLegendItem
          title={identity.representationType ? `Representation: ${identity.representationType}` : "Representation unavailable"}
          detail={`Providers: ${providerIds.join(", ") || "unavailable"}; contract scan: ${identity.contractScanApplicability || "unknown"}.`}
          badge={identity.isNativeAsset ? "Native/no contract" : identity.isMultichain ? "Multi-chain review" : identity.isContractRepresentation ? "Representation review" : "Identity context"}
          tone={identity.isNativeAsset ? "#2fd67b" : identity.isContractRepresentation || identity.isMultichain ? "#ffb020" : "#7dd3fc"}
          styles={styles}
        />
        {identityWarnings.slice(0, 1).map((warning) => (
          <LayerLegendItem
            key={warning.id}
            title="Diagnostic warning"
            detail={warning.issue || warning.recommendedAction || "Identity or variant warning requires review."}
            badge={warning.affectsScoring ? "Affects scoring" : "Diagnostic only"}
            tone="#ffb020"
            styles={styles}
          />
        ))}
        {[...safeArray(identity.identityWarnings), ...safeArray(identity.chainWarnings), ...safeArray(identity.contractWarnings)].slice(0, 1).map((warning) => (
          <LayerLegendItem
            key={`asset-identity-${warning}`}
            title="Identity guardrail"
            detail={warning}
            badge="Manual verification"
            tone="#ffb020"
            styles={styles}
          />
        ))}
        <LayerLegendItem
          title={freshness.freshnessLabel || "Freshness unknown"}
          detail={[
            freshness.generatedAt ? `Generated: ${formatDateTime(freshness.generatedAt)}` : "Generated: unavailable",
            freshness.snapshotShortId ? `Snapshot: ${freshness.snapshotShortId}` : "Snapshot: unavailable",
            `Recomputed: ${freshness.recomputed === null || freshness.recomputed === undefined ? "unknown" : freshness.recomputed ? "yes" : "no"}`,
          ].join("; ")}
          badge={freshness.isPartialRefresh ? "Partial refresh" : freshness.isSnapshot ? "Stored snapshot" : freshness.isFreshLive ? "Live analysis" : "Verify freshness"}
          tone={freshness.isFreshLive ? "#2fd67b" : freshness.isPartialRefresh || freshness.isSnapshot ? "#ffb020" : "#8a94a6"}
          styles={styles}
        />
        {tokenomics.tokenomicsIntegrityScore !== undefined ? (
          <LayerLegendItem
            title="Tokenomics supply integrity"
            detail={`Separate integrity signal: ${tokenomics.tokenomicsIntegrityScore}/100; max supply: ${tokenomics.maxSupplyStatus || "unknown"}; unlock coverage: ${tokenomics.unlockScheduleStatus || "unknown"}.`}
            badge="Diagnostic, not overall scoring"
            tone="#9bd7ff"
            styles={styles}
          />
        ) : null}
      </div>
    </div>
  );
}

function LayerLegendItem({ title, detail, badge, tone, styles }) {
  return (
    <div style={styles.decisionLayerLegendItem}>
      <div style={styles.decisionLayerLegendTopline}>
        <span style={{ ...styles.decisionLayerDot, background: tone }} />
        <span style={styles.decisionLayerLegendTitle}>{title}</span>
      </div>
      <div style={styles.decisionLayerLegendDetail}>{detail}</div>
      <StatusBadge label={badge} styles={styles} color={tone} />
    </div>
  );
}

export function DecisionHeroSupportSections({ model, styles, onSelectSection = null }) {
  const primaryBlocker = model?.primaryBlocker || {};
  const weakestLink = model?.weakestLink || {};
  const whatWouldChange = model?.whatWouldChangeDecision?.items || ["Additional verified evidence required."];
  const manualReviewStatus = model?.manualReviewStatus || {};
  const verdictSemantics = model?.verdictSemantics || {};
  const semanticBoundary = verdictSemantics.boundary || "Research support only. No price prediction or investment advice.";

  return (
    <>
      {verdictSemantics.hasVerdictClass ? (
        <div style={styles.verdictBoundaryBanner}>
          <div style={styles.verdictBoundaryTitle}>
            {verdictSemantics.key === "evidence_blocked" || verdictSemantics.key === "manual_review_required"
              ? "Evidence-blocked, not confirmed failure"
              : "Verdict semantics boundary"}
          </div>
          <div style={styles.verdictBoundaryText}>{semanticBoundary}</div>
        </div>
      ) : null}

      {(model?.contradictionNote || model?.evidenceConstraintNote) ? (
        <div style={styles.decisionNoticeGrid}>
          {model?.contradictionNote ? (
            <div style={styles.contradictionBanner}>
              <div style={styles.contradictionTitle}>Override Explanation</div>
              <div style={styles.contradictionText}>{model.contradictionNote}</div>
            </div>
          ) : null}
          {model?.evidenceConstraintNote ? (
            <div style={styles.evidenceConstraintBanner}>
              <div style={styles.evidenceConstraintTitle}>Evidence Constraint</div>
              <div style={styles.evidenceConstraintText}>{model.evidenceConstraintNote}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={styles.decisionInsightGrid}>
        <DecisionInsightCard
          title="Primary Blocker"
          value={primaryBlocker.label || "Primary blocker not explicitly available in live response."}
          detail={primaryBlocker.explanation}
          badge={primaryBlocker.badge || "Derived proxy"}
          accent="#ff6b6b"
          cta="Inspect blocker"
          onClick={() => onSelectSection?.("thesis_falsification")}
          styles={styles}
        />
        <DecisionInsightCard
          title="Weakest Link"
          value={weakestLink.label || "Weakest link not explicitly available in live response."}
          detail={weakestLink.explanation}
          badge={weakestLink.badge || "Weakest-link proxy"}
          accent="#ffb020"
          cta="Trace evidence"
          onClick={() => onSelectSection?.("evidence_map")}
          styles={styles}
        />
        <div style={{ ...styles.decisionInsightCard, ...styles.decisionChangeCard }}>
          <div style={styles.decisionInsightHeader}>
            <div style={styles.decisionInsightTitle}>What Would Change The Decision</div>
            <StatusBadge label={model?.whatWouldChangeDecision?.badge || "Live requirements"} styles={styles} color="#7dd3fc" />
          </div>
          <div style={styles.decisionRequirementList}>
            {whatWouldChange.slice(0, 4).map((item, index) => (
              <div key={`${item}-${index}`} style={styles.decisionRequirementItem}>
                <span style={styles.decisionRequirementIndex}>{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <InteractiveActionButton onClick={() => onSelectSection?.("source_queue")} styles={styles}>
            View requirements -&gt;
          </InteractiveActionButton>
        </div>
      </div>
      <div style={styles.decisionScoreStrip}>
        <ScoreTile label="Structural Quality" value={formatScoreValue(model?.overallScore)} detail="Live score bundle" styles={styles} />
        <ScoreTile label="Evidence Support" value={formatScoreValue(model?.confidenceScore)} detail="Confidence proxy, not completeness" styles={styles} />
        <ScoreTile label="Confidence" value={model?.confidenceLabel || "Unavailable"} detail={model?.evidenceStrength ? `Evidence strength: ${sanitizeSemanticLabel(model.evidenceStrength, "Unavailable")}` : null} styles={styles} />
        <ScoreTile label="Overall Score" value={formatScoreValue(model?.overallScore)} detail="Secondary signal" styles={styles} />
        <ScoreTile
          label="Tokenomics Integrity"
          value={model?.tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === null || model?.tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === undefined ? "Unavailable" : `${model.tokenomicsSupplyIntegrity.tokenomicsIntegrityScore}/100`}
          detail={model?.tokenomicsSupplyIntegrity ? "Separate dilution/supply signal; not current overall score" : null}
          styles={styles}
        />
        <ScoreTile label="Manual Review" value={manualReviewStatus.label || "No explicit review flag"} detail={manualReviewStatus.detail} styles={styles} />
      </div>

      <div style={styles.decisionLayerLegend}>
        <div style={styles.decisionLayerLegendHeader}>
          <div>
            <div style={styles.decisionLayerLegendEyebrow}>Evidence Layer Legend</div>
            <div style={styles.decisionLayerLegendCopy}>
              Layer labels explain boundaries only. Report-only and candidate layers are not integrated into live scoring here.
            </div>
          </div>
        </div>
        <div style={styles.decisionLayerLegendGrid}>
          <LayerLegendItem
            title="Live Scoring Layer"
            detail="Current engine fields used by the final decision."
            badge="Affects final decision"
            tone="#2fd67b"
            styles={styles}
          />
          <LayerLegendItem
            title="Report-Only Evidence Layer"
            detail="Institutional artifacts and overlays remain context-only until separately integrated."
            badge="Not scoring input"
            tone="#ffb020"
            styles={styles}
          />
          <LayerLegendItem
            title="Source Candidate Layer"
            detail="Candidate sources require human review before evidence promotion."
            badge="Requires review"
            tone="#7dd3fc"
            styles={styles}
          />
        </div>
      </div>
    </>
  );
}

export default function DecisionHeroCard({
  asset,
  model,
  displayIdentity = null,
  styles,
  onSelectSection = null,
  lastAnalyzed = null,
  showSupportSections = true,
}) {
  const outcomeColorValue = outcomeColor(model?.allocationOutcome?.key);
  const assetBadges = displayIdentity
    ? [displayIdentity.primaryChip, displayIdentity.secondaryChip].filter(Boolean)
    : model?.assetBadges || [];
  const symbol = asset?.symbol || model?.assetName || "Asset";
  const assetInitial = String(symbol).trim().slice(0, 4).toUpperCase() || "TC";
  const verdictSemantics = model?.verdictSemantics || {};
  const finalDecisionSubcopy = verdictSemantics.summary || model?.summaryMemo || "Live decision layer returned no structured summary.";
  const primaryPositiveCase = verdictSemantics.positiveCase?.[0] || model?.primaryStrength || null;
  const primaryBlockedCase = verdictSemantics.blockedCase?.[0] || model?.primaryWeakness || null;
  const assetClassLabel = displayIdentity?.displayAssetClass || model?.assetClassLabel || sanitizeSemanticLabel(model?.assetClass, "Asset class unavailable");
  const framingLabel = displayIdentity?.displayFraming || model?.assetFramingLabel || "Digital Asset Allocation Thesis";
  const freshness = model?.analysisFreshness || {};
  const freshnessLabel = freshness.freshnessLabel
    ? `${freshness.freshnessLabel}${freshness.generatedAt ? ` - ${formatDateTime(freshness.generatedAt)}` : ""}`
    : lastAnalyzed
      ? `Last analyzed ${lastAnalyzed}`
      : "Freshness unavailable";

  return (
    <div style={styles.decisionHeroWrap}>
      <Card
        title="Decision Command Header"
        subtitle="Live scoring output with report-only evidence boundaries preserved."
        styles={styles}
      >
        <div style={styles.decisionCommandGrid}>
          <div style={styles.decisionAssetPanel}>
            <div style={styles.decisionAssetIdentityRow}>
              <div style={styles.decisionAssetIcon}>{assetInitial}</div>
              <div>
                <div style={styles.decisionAssetSymbol}>{asset?.symbol || "Asset"}</div>
                <div style={styles.decisionAssetName}>{asset?.name || model?.assetName || "Resolved asset"}</div>
              </div>
            </div>
            <div style={styles.decisionAssetFraming}>{framingLabel}</div>
            <div style={styles.decisionAssetMeta}>{assetClassLabel}</div>
            {assetBadges.length ? (
              <div style={styles.decisionHeroBadgeRow}>
                {assetBadges.map((badge) => (
                  <span key={badge} style={styles.institutionalBadge}>{badge}</span>
                ))}
              </div>
            ) : null}
            <div style={styles.decisionAssetFooter}>
              <StatusBadge label="Research support only" styles={styles} color="#7dd3fc" />
              <span style={styles.decisionAssetFreshness}>{freshnessLabel}</span>
            </div>
          </div>

          <div style={styles.decisionFinalPanel}>
            <div style={styles.decisionHeroEyebrow}>Final Decision</div>
            <div style={{ ...styles.decisionHeroOutcome, color: outcomeColorValue }}>
              {model?.allocationOutcome?.label || "Decision unavailable"}
            </div>
            <div style={styles.decisionFinalSubcopy}>{finalDecisionSubcopy}</div>
            {verdictSemantics.hasVerdictClass ? (
              <div style={styles.decisionSemanticMiniGrid}>
                <div style={styles.decisionSemanticMiniCard}>
                  <div style={styles.metaLabel}>Why allocation could make sense</div>
                  <div style={styles.contextMuted}>{primaryPositiveCase || "No positive allocation case was surfaced by the live response."}</div>
                </div>
                <div style={styles.decisionSemanticMiniCard}>
                  <div style={styles.metaLabel}>Why allocation is blocked</div>
                  <div style={styles.contextMuted}>{primaryBlockedCase || "No material blocker is currently evidenced by the live response."}</div>
                </div>
              </div>
            ) : null}
            <div style={styles.decisionFinalActions}>
              <StatusBadge
                label={verdictSemantics.hasVerdictClass ? "Verdict taxonomy v1" : sanitizeSemanticLabel(model?.investabilityStatus, "Scoring-active")}
                styles={styles}
                color={outcomeColorValue}
              />
              <InteractiveActionButton
                onClick={() => onSelectSection?.("scoring_transparency")}
                styles={styles}
                variant="primary"
              >
                View final verdict logic -&gt;
              </InteractiveActionButton>
              <InteractiveActionButton onClick={() => onSelectSection?.("thesis_falsification")} styles={styles}>
                Inspect blocker -&gt;
              </InteractiveActionButton>
              <InteractiveActionButton onClick={() => onSelectSection?.("evidence_map")} styles={styles}>
                Trace evidence -&gt;
              </InteractiveActionButton>
              <InteractiveActionButton onClick={() => onSelectSection?.("source_queue")} styles={styles}>
                View requirements -&gt;
              </InteractiveActionButton>
            </div>
          </div>
        </div>

        <IdentityAndLensGuardrail asset={asset} model={model} styles={styles} onSelectSection={onSelectSection} />

        {showSupportSections ? <DecisionHeroSupportSections model={model} styles={styles} onSelectSection={onSelectSection} /> : null}
      </Card>
    </div>
  );
}
