import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import { formatCompact, formatPct, formatUsd, safeArray, safeObject, titleCase } from "./researchUtils";

function isPresent(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function displayNumber(value, options = {}) {
  if (!isPresent(value)) return "Unavailable";
  const num = Number(value);
  return num.toLocaleString(undefined, {
    maximumFractionDigits: options.digits ?? (Math.abs(num) >= 100 ? 0 : 6),
  });
}

function displayUsd(value) {
  if (!isPresent(value)) return "Unavailable";
  return formatUsd(value);
}

function displayRatio(value) {
  if (!isPresent(value)) return "Unavailable";
  return `${Number(value).toFixed(2)}x`;
}

function displayPercent(value, digits = 2) {
  if (!isPresent(value)) return "Unavailable";
  return formatPct(value, digits);
}

function displayDecimalPercent(value, digits = 2) {
  if (!isPresent(value)) return "Unavailable";
  return formatPct(Number(value) * 100, digits);
}

function status(value) {
  return titleCase(value || "Unavailable");
}

function controlStatusLabel(value, kind, lensId) {
  const stablecoin = lensId === "STABLECOIN_SETTLEMENT";
  if (stablecoin && kind === "mint") {
    if (value === "requires_manual_review") return "present / issuer-controlled / requires policy review";
    if (value === "verified") return "not detected on selected contract; issuer mint/redeem still requires review";
    if (value === "not_applicable") return "not applicable to selected scan";
    return "unknown / requires issuer policy review";
  }
  if (stablecoin && kind === "admin") {
    if (value === "requires_manual_review") return "present / requires policy review";
    if (value === "verified") return "not detected on selected contract; freeze/admin policy still requires review";
    if (value === "not_applicable") return "not applicable to selected scan";
    return "unknown / requires policy review";
  }
  if (kind === "mint" && value === "verified") return "selected contract reported non-mintable";
  if (kind === "admin" && value === "verified") return "owner/admin risk not detected on selected contract";
  if (value === "requires_manual_review") return "detected / requires review";
  if (value === "not_applicable") return "not applicable";
  return status(value);
}

function compactList(items, mapper = (item) => item) {
  return safeArray(items).map(mapper).filter(Boolean);
}

function FieldGrid({ children }) {
  return (
    <div style={{
      display: "grid",
      gap: "0.75rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      marginTop: "0.8rem",
    }}>
      {children}
    </div>
  );
}

function MiniMetric({ label, value, tone = "#d5dcec" }) {
  return (
    <div style={{
      border: "1px solid rgba(148, 163, 184, 0.16)",
      borderRadius: 16,
      padding: "0.85rem",
      background: "rgba(6, 12, 24, 0.36)",
    }}>
      <div style={{ color: "#8a94a6", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ color: tone, fontSize: "1rem", fontWeight: 800, marginTop: 4 }}>{value || "Unavailable"}</div>
    </div>
  );
}

function ProviderComparison({ tokenomics, styles }) {
  const snapshots = [
    tokenomics.coingeckoSupply,
    tokenomics.coinmarketcapSupply,
  ].filter(Boolean);
  const localRows = [
    ...safeArray(tokenomics.providerMarketCaps),
    ...safeArray(tokenomics.providerFdvs),
    ...safeArray(tokenomics.providerVolumes),
    ...safeArray(tokenomics.providerSupplyValues),
  ].filter((entry) => entry?.scope === "pair_liquidity_local");

  if (!snapshots.length) {
    return (
      <Card title="Provider Comparison" subtitle="Provider-specific numeric rows were not attached to this response." styles={styles}>
        <ListBlock
          title="Provider numeric provenance"
          items={[
            ...compactList(tokenomics.providerMarketCaps, (entry) => `${entry.provider} market cap: ${displayUsd(entry.value)} (${entry.sourcePath}; ${entry.boundary})`),
            ...compactList(tokenomics.providerFdvs, (entry) => `${entry.provider} FDV: ${displayUsd(entry.value)} (${entry.sourcePath}; ${entry.boundary})`),
            ...compactList(tokenomics.providerVolumes, (entry) => `${entry.provider} volume: ${displayUsd(entry.value)} (${entry.sourcePath}; ${entry.boundary})`),
            ...compactList(tokenomics.providerSupplyValues, (entry) => `${entry.provider} ${entry.field}: ${displayNumber(entry.value)} (${entry.sourcePath}; ${entry.boundary})`),
          ]}
          emptyText="No provider-specific numeric rows were attached."
          color="#d5dcec"
          styles={styles}
        />
      </Card>
    );
  }

  return (
    <Card title="Provider Comparison" subtitle="CoinGecko/CMC rows are provider-reported context, not reviewed evidence." styles={styles}>
      <div style={{ display: "grid", gap: "0.85rem" }}>
        {snapshots.map((snapshot) => (
          <div key={snapshot.provider} style={{
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: 18,
            padding: "0.9rem",
            background: "rgba(6, 12, 24, 0.34)",
          }}>
            <SectionRow label="Provider" value={titleCase(snapshot.provider)} styles={styles} />
            <SectionRow label="Price / market cap / FDV" value={`${displayUsd(snapshot.currentPrice)} / ${displayUsd(snapshot.marketCap)} / ${displayUsd(snapshot.fdv)}`} styles={styles} />
            <SectionRow label="Volume / circulating / total / max" value={`${displayUsd(snapshot.volume24h)} / ${displayNumber(snapshot.circulatingSupply)} / ${displayNumber(snapshot.totalSupply)} / ${displayNumber(snapshot.maxSupply)}`} styles={styles} />
            <SectionRow label="Self-reported CMC supply / market cap" value={`${displayNumber(snapshot.selfReportedCirculatingSupply)} / ${displayUsd(snapshot.selfReportedMarketCap)}`} styles={styles} />
            <SectionRow label="Timestamp / source" value={`${snapshot.timestamp || "Unavailable"} / ${snapshot.sourcePath || "Unavailable"}`} styles={styles} />
            <ListBlock title="Boundary" items={snapshot.sourceBoundary} emptyText="No source boundary attached." color="#9bd7ff" styles={styles} />
          </div>
        ))}
      </div>
      <ListBlock title="Provider disagreements" items={tokenomics.providerDisagreements} emptyText="No material provider disagreement was attached." color="#f9d976" styles={styles} />
      <ListBlock title="Provider scope notes" items={tokenomics.providerScopeNotes} emptyText="No cross-scope provider note was attached." color="#d5dcec" styles={styles} />
      <ListBlock
        title="Liquidity / Pair Context"
        items={compactList(localRows, (entry) => `${entry.provider} ${entry.field}: ${entry.field?.toLowerCase().includes("supply") ? displayNumber(entry.value) : displayUsd(entry.value)} (${entry.sourcePath}; ${entry.scope})`)}
        emptyText="No pair-level liquidity context attached."
        color="#9bd7ff"
        styles={styles}
      />
    </Card>
  );
}

function FormulaPanel({ tokenomics, styles }) {
  const formulas = safeArray(tokenomics.formulaOutputs);
  const primaryIds = new Set([
    "fdv_market_cap_ratio",
    "remaining_dilution",
    "circulating_percent_of_max",
    "supply_gap_total_minus_circulating",
    "max_supply_gap",
    "unlock_volume_ratio",
    "unlock_market_cap_ratio",
    "net_issuance",
  ]);
  const primary = formulas.filter((formula) => primaryIds.has(formula.formulaId));
  const unavailable = formulas.filter((formula) => formula.status !== "computed" && !primaryIds.has(formula.formulaId));
  const advanced = formulas.filter((formula) => formula.status === "computed" && !primaryIds.has(formula.formulaId));
  const FormulaRows = ({ rows }) => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {rows.map((formula) => (
        <div key={formula.formulaId || formula.label} style={{
          border: "1px solid rgba(148, 163, 184, 0.16)",
          borderRadius: 16,
          padding: "0.85rem",
          background: "rgba(6, 12, 24, 0.32)",
        }}>
          <SectionRow label={formula.label || "Formula"} value={formula.display || "Unavailable"} styles={styles} />
          <SectionRow label="Formula" value={formula.formula || "Unavailable"} styles={styles} />
          <SectionRow label="Status / method" value={`${status(formula.status)} / ${status(formula.method)}`} styles={styles} />
          <ListBlock
            title="Inputs"
            items={compactList(formula.inputs, (entry) => `${entry.name}: ${displayNumber(entry.value)} (${entry.sourcePath || "source unavailable"})`)}
            emptyText="No formula inputs attached."
            color="#d5dcec"
            styles={styles}
          />
          <ListBlock title="Missing inputs" items={formula.missingInputs} emptyText="No missing inputs for this formula." color="#f9d976" styles={styles} />
          <SectionRow label="Source requirement" value={formula.sourceRequirement || "Unavailable"} styles={styles} />
        </div>
      ))}
    </div>
  );
  return (
    <Card title="Formula Outputs" subtitle="Primary formulas first. Advanced and unavailable formulas remain available without taking over the page." styles={styles}>
      {formulas.length ? (
        <>
          <FormulaRows rows={primary.length ? primary : formulas.slice(0, 6)} />
          {advanced.length ? (
            <details style={{ marginTop: 14 }}>
              <summary style={{ color: "#9bd7ff", cursor: "pointer", fontWeight: 800 }}>Advanced computed formulas ({advanced.length})</summary>
              <div style={{ marginTop: 12 }}><FormulaRows rows={advanced} /></div>
            </details>
          ) : null}
          {unavailable.length ? (
            <details style={{ marginTop: 14 }}>
              <summary style={{ color: "#f9d976", cursor: "pointer", fontWeight: 800 }}>Unavailable formulas / source required ({unavailable.length})</summary>
              <div style={{ marginTop: 12 }}><FormulaRows rows={unavailable} /></div>
            </details>
          ) : null}
        </>
      ) : (
        <p style={{ color: "#8a94a6" }}>No backend formula outputs were attached.</p>
      )}
    </Card>
  );
}

function keyRiskItems(lensId) {
  switch (lensId) {
    case "STABLECOIN_SETTLEMENT":
      return ["Reserve quality", "Redemption path", "Issuer/custodian dependency", "Mint/redeem controls", "Freeze/admin policy", "Supported networks"];
    case "DEFI_PROTOCOL_TOKEN":
      return ["Unlocks", "Governance rights", "Fee switch/value capture", "Treasury", "Protocol economics mapping"];
    case "GAMING_METAVERSE_CONSUMER":
      return ["Emissions versus sinks", "Active/paying users", "Unlocks", "Mint/admin controls", "Reward sustainability"];
    case "RWA_HYBRID_INFRASTRUCTURE":
      return ["Utility token vs RWA rights", "Canonical network/contract", "Cap mutability", "Fee/staking/gas demand", "Compliance dependencies"];
    case "BASE_LAYER_SETTLEMENT":
    case "NATIVE_MONETARY_BENCHMARK":
      return ["Monetary policy", "Issuance/burn", "Validator/miner security economics", "Liveness/client risk", "Market depth"];
    case "MEME_NARRATIVE":
      return ["Supply certainty", "Mint/admin controls", "Holder concentration", "Liquidity", "No fake value-capture claims"];
    case "WRAPPED_ASSET":
      return ["Backing/proof-of-reserves", "Custodian/bridge controls", "Mint/burn", "Redemption path", "Underlying-inheritance boundary"];
    case "LST_STAKING_DERIVATIVE":
      return ["Withdrawal queue", "Slashing/operator risk", "Depeg/liquidity", "Mint/burn", "Protocol/admin controls"];
    default:
      return ["Supply data quality", "Future dilution", "Supply controls", "Source requirements", "Provider disagreement"];
  }
}

function TokenomicsQuestionPanel({ tokenomics, styles }) {
  const questions = safeArray(tokenomics.institutionalQuestions);
  return (
    <Card title="Institutional Tokenomics Q&A" subtitle="Answers are deterministic and source-boundary aware; missing data remains source-required." styles={styles}>
      {questions.length ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {questions.map((question) => (
            <div key={question.questionId || question.questionText} style={{
              border: "1px solid rgba(148, 163, 184, 0.16)",
              borderRadius: 16,
              padding: "0.9rem",
              background: "rgba(6, 12, 24, 0.32)",
            }}>
              <SectionRow label="Question" value={question.questionText} styles={styles} />
              <SectionRow label="Status" value={status(question.answerStatus)} styles={styles} />
              <SectionRow label="Short answer" value={question.shortAnswer || question.answerSummary || "Unavailable"} styles={styles} />
              <SectionRow label="Impact" value={question.impactOnScoreOrConfidence || "Diagnostic/source requirement only."} styles={styles} />
              <ListBlock title="Data fields used" items={question.dataFieldsUsed} emptyText="No data fields listed." color="#d5dcec" styles={styles} />
              <ListBlock title="Formula outputs used" items={question.formulaOutputsUsed} emptyText="No formula outputs listed." color="#9bd7ff" styles={styles} />
              <ListBlock title="Evidence/provider fields used" items={question.evidenceUsed} emptyText="No reviewed evidence attached." color="#a6f3c2" styles={styles} />
              <ListBlock title="Missing evidence" items={question.missingEvidence} emptyText="No missing evidence listed." color="#f9d976" styles={styles} />
              <ListBlock title="What would change" items={question.whatWouldChange} emptyText="No change requirement listed." color="#a6f3c2" styles={styles} />
              <ListBlock title="Source boundary" items={question.sourceBoundary} emptyText="No source boundary attached." color="#d5dcec" styles={styles} />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#8a94a6" }}>No tokenomics Q&A was attached.</p>
      )}
    </Card>
  );
}

function contextualNote(lensId) {
  switch (lensId) {
    case "BASE_LAYER_SETTLEMENT":
    case "NATIVE_MONETARY_BENCHMARK":
      return "Native/base-layer tokenomics should focus on issuance, burn, staking/miner incentives, security budget, and liveness. A missing EVM contract scan is not itself negative evidence.";
    case "DEFI_PROTOCOL_TOKEN":
    case "L2_GOVERNANCE_TOKEN":
      return "Protocol success does not automatically accrue to tokenholders; fee switch, fee routing, treasury, unlocks, and governance durability require source-backed review.";
    case "GAMING_METAVERSE_CONSUMER":
      return "Gaming/GameFi supply underwriting focuses on rewards versus sinks, emissions, unlocks, mintability, and active/paying user demand.";
    case "RWA_HYBRID_INFRASTRUCTURE":
      return "RWA infrastructure relevance is not legal/economic rights. Utility-token supply, cap mutability, canonical chain, migration, and fee/gas/staking demand require review.";
    case "STABLECOIN_SETTLEMENT":
      return "Stablecoin tokenomics is primarily mint/redeem, reserves, redemption, legal claim, issuer/custodian, and admin/freeze-control diligence.";
    case "WRAPPED_ASSET":
      return "Wrapped-asset supply integrity depends on backing, custodian/bridge controls, mint/burn, redemption, and proof-of-reserves.";
    case "LST_STAKING_DERIVATIVE":
      return "LST tokenomics depends on mint/burn, withdrawal queue, slashing/operator risk, depeg/liquidity, and protocol/admin controls.";
    case "MEME_NARRATIVE":
      return "Meme-asset tokenomics focuses on supply certainty, mint/admin controls, holder concentration, liquidity, and avoiding fake value-capture claims.";
    default:
      return "Tokenomics diligence is supply-integrity and dilution underwriting, not a retail utility checklist or price forecast.";
  }
}

export default function TokenomicsSupplyIntegrityTab({ model, asset, styles }) {
  const tokenomics = safeObject(model?.tokenomicsSupplyIntegrity);
  const identity = safeObject(model?.assetIdentityResolution);
  const lens = safeObject(model?.resolvedInstitutionalLens);

  if (!tokenomics.supplySummary && tokenomics.tokenomicsIntegrityScore === undefined) {
    return (
      <Card title="Tokenomics / Supply Integrity" subtitle="No tokenomics supply-integrity object is attached to this response." styles={styles}>
        <SectionRow label="Status" value="Unavailable - source-required tokenomics object not attached." styles={styles} />
      </Card>
    );
  }

  const providerContracts = compactList(tokenomics.providerContracts, (entry) => `${entry.provider}: ${entry.network || "network unavailable"} ${entry.contractAddress || "no contract"} (${entry.sourcePath || "source unavailable"})`);
  const knownContracts = compactList(identity.allKnownContracts, (entry) => `${entry.provider || "provider"}: ${entry.network || "network unavailable"} ${entry.contractAddress || "no contract"}`);
  const contractRows = knownContracts.length ? knownContracts : providerContracts;
  const selectedContractLine = identity.analyzedContract
    ? `${identity.analyzedNetwork || "network unavailable"} ${identity.analyzedContract}`
    : "No selected/analyzed contract attached";
  const primaryLensId = lens.lensId || tokenomics.supplySummary?.lensId;
  const scopeWarnings = [
    ...safeArray(identity.identityWarnings),
    ...safeArray(identity.chainWarnings),
    ...safeArray(identity.contractWarnings),
  ];

  return (
    <>
      <Card
        title="Tokenomics / Supply Integrity"
        score={tokenomics.tokenomicsIntegrityScore ?? null}
        subtitle="Dedicated supply-integrity and dilution-underwriting surface. Diagnostic-only; existing overall score and verdict are unchanged."
        styles={styles}
      >
        <FieldGrid>
          <MiniMetric label="Integrity score" value={tokenomics.tokenomicsIntegrityScore === null || tokenomics.tokenomicsIntegrityScore === undefined ? "Unavailable" : `${tokenomics.tokenomicsIntegrityScore}/100`} tone="#7dd3fc" />
          <MiniMetric label="Evidence confidence" value={status(tokenomics.evidenceConfidence)} />
          <MiniMetric label="Max supply status" value={status(tokenomics.maxSupplyStatus)} />
          <MiniMetric label="Unlock schedule" value={status(tokenomics.unlockScheduleStatus)} />
          <MiniMetric label="Mint authority" value={controlStatusLabel(tokenomics.mintAuthorityStatus, "mint", primaryLensId)} />
          <MiniMetric label="Admin controls" value={controlStatusLabel(tokenomics.adminControlStatus, "admin", primaryLensId)} />
          <MiniMetric label="Governance supply risk" value={status(tokenomics.governanceSupplyChangeRisk)} />
          <MiniMetric label="FDV / market cap" value={displayRatio(tokenomics.fdvMarketCapRatio)} />
          <MiniMetric label="Remaining dilution" value={displayPercent(tokenomics.remainingDilutionPercent)} />
        </FieldGrid>
        <SectionRow label="Primary tokenomics blocker" value={safeArray(tokenomics.hardBlockers)[0] || safeArray(tokenomics.softBlockers)[0] || safeArray(tokenomics.confidenceCaps)[0] || "No primary tokenomics blocker attached."} styles={styles} />
        <SectionRow label="Top positive signal" value={safeArray(tokenomics.positiveSignals)[0] || "No positive tokenomics signal attached."} styles={styles} />
        <SectionRow label="Top negative signal" value={safeArray(tokenomics.negativeSignals)[0] || "No negative tokenomics signal attached."} styles={styles} />
        <SectionRow label="Diagnostic boundary" value="tokenomicsIntegrityScore is diagnostic-only and does not change the current overall score or verdict." styles={styles} />
        <SectionRow label="Asset-class context" value={contextualNote(primaryLensId)} styles={styles} />
      </Card>

      <Card title="Key Risk Summary" subtitle="What matters most for this asset class before relying on tokenomics conclusions." styles={styles}>
        <ListBlock title="What matters most" items={keyRiskItems(primaryLensId)} emptyText="No lens-specific risk summary attached." color="#9bd7ff" styles={styles} />
        <ListBlock title="Primary review signals" items={[
          ...safeArray(tokenomics.manualReviewTriggers).slice(0, 3),
          ...safeArray(tokenomics.confidenceCaps).slice(0, 3),
          ...safeArray(tokenomics.neutralContextualSignals).slice(0, 2),
        ]} emptyText="No primary tokenomics review signal attached." color="#f9d976" styles={styles} />
      </Card>

      <Card title="Canonical Asset / Contract Scope" subtitle="Supply calculations depend on the selected asset, analyzed network, and representation boundary." styles={styles}>
        <SectionRow label="Canonical asset" value={`${identity.canonicalAssetName || tokenomics.supplySummary?.canonicalAsset || asset?.name || "Unavailable"} (${identity.canonicalAssetSymbol || asset?.symbol || "Unavailable"})`} styles={styles} />
        <SectionRow label="Provider IDs" value={`CoinGecko: ${identity.canonicalProviderIds?.coingeckoId || asset?.coingeckoId || "Unavailable"} | CMC: ${identity.canonicalProviderIds?.coinmarketcapId || asset?.coinmarketcapId || "Unavailable"}`} styles={styles} />
        <SectionRow label="Canonical/native network candidate" value={identity.canonicalNetworkCandidate || identity.nativeNetworkCandidate || "Unavailable"} styles={styles} />
        <SectionRow label="Selected/analyzed network" value={`${identity.selectedNetwork || "Unavailable"} / ${identity.analyzedNetwork || "Unavailable"}`} styles={styles} />
        <SectionRow label="Selected/analyzed contract" value={`${identity.selectedContract || "Not applicable"} / ${identity.analyzedContract || "Not applicable"}`} styles={styles} />
        <SectionRow label="Representation type" value={identity.representationType === "issuer_native_multichain_stablecoin" ? "issuer-native multichain stablecoin" : identity.representationType || "Unknown"} styles={styles} />
        <SectionRow label="Native / EVM / multichain / migrated" value={`native=${identity.isNativeAsset === undefined ? "unknown" : identity.isNativeAsset ? "yes" : "no"}; evm=${identity.isEvmContractAsset === undefined ? "unknown" : identity.isEvmContractAsset ? "yes" : "no"}; multichain=${identity.isMultichain === undefined ? "unknown" : identity.isMultichain ? "yes" : "no"}; migration=${identity.migrationStatus || "unknown"}`} styles={styles} />
        <SectionRow label="Wrong-asset risk" value={identity.wrongAssetRisk || "Unknown"} styles={styles} />
        <SectionRow label="Contract scan applicability" value={identity.contractScanApplicability || "Unknown"} styles={styles} />
        <SectionRow label="Selected/analyzed contract" value={selectedContractLine} styles={styles} />
        <SectionRow label="Known provider contract count" value={contractRows.length ? `${contractRows.length} mappings attached` : "No provider contract mappings attached"} styles={styles} />
        <ListBlock title="Top provider contract mappings" items={contractRows.slice(0, 5)} emptyText="No provider contract mappings attached." color="#9bd7ff" styles={styles} />
        {contractRows.length > 5 ? (
          <details style={{ marginTop: 12 }}>
            <summary style={{ color: "#9bd7ff", cursor: "pointer", fontWeight: 800 }}>View all provider contract mappings ({contractRows.length})</summary>
            <ListBlock title="All provider contract mappings" items={contractRows} emptyText="No provider contract mappings attached." color="#d5dcec" styles={styles} />
          </details>
        ) : null}
        <SectionRow label="Contract mapping boundary" value="Provider contract mappings require official supported-network verification." styles={styles} />
        <ListBlock title="Identity warnings / source requirements" items={[...scopeWarnings, ...safeArray(identity.sourceRequirements)]} emptyText="No identity warning attached." color="#f9d976" styles={styles} />
      </Card>

      <Card title="Supply Snapshot" subtitle="Exact normalized values and derived supply ratios from provider-reported fields." styles={styles}>
        <FieldGrid>
          <MiniMetric label="Current price" value={displayUsd(tokenomics.currentPrice)} />
          <MiniMetric label="Market cap" value={displayUsd(tokenomics.marketCap)} />
          <MiniMetric label="FDV" value={displayUsd(tokenomics.fdv)} />
          <MiniMetric label="24h volume" value={displayUsd(tokenomics.volume24h)} />
          <MiniMetric label="Circulating supply" value={displayNumber(tokenomics.circulatingSupply)} />
          <MiniMetric label="Total supply" value={displayNumber(tokenomics.totalSupply)} />
          <MiniMetric label="Max supply" value={displayNumber(tokenomics.maxSupplyValue)} />
          <MiniMetric label="Self-reported CMC supply" value={displayNumber(tokenomics.selfReportedCirculatingSupply)} />
          <MiniMetric label="Self-reported CMC market cap" value={displayUsd(tokenomics.selfReportedMarketCap)} />
          <MiniMetric label="Circulating % max" value={displayPercent(tokenomics.circulatingPercentOfMax)} />
          <MiniMetric label="Supply gap total-circ" value={displayNumber(tokenomics.supplyGapTotalMinusCirculating)} />
          <MiniMetric label="Supply gap max-circ" value={displayNumber(tokenomics.supplyGapMaxMinusCirculating)} />
          <MiniMetric label="FDV minus market cap" value={displayUsd(tokenomics.fdvMinusMarketCap)} />
          <MiniMetric label="Derived market cap" value={displayUsd(tokenomics.derivedMarketCap)} />
          <MiniMetric label="Derived FDV" value={displayUsd(tokenomics.derivedFdv)} />
        </FieldGrid>
        <SectionRow label="Market cap / FDV method" value={`${status(tokenomics.marketCapMethod)} / ${status(tokenomics.fdvMethod)}`} styles={styles} />
        <SectionRow label="Max supply method" value={status(tokenomics.maxSupplyMethod)} styles={styles} />
      </Card>

      <ProviderComparison tokenomics={tokenomics} styles={styles} />
      <FormulaPanel tokenomics={tokenomics} styles={styles} />

      <Card title="Future Dilution & Unlocks" subtitle="Missing unlock data is a confidence cap, not proof of no unlock risk." styles={styles}>
        <SectionRow label="Unlock schedule status" value={status(tokenomics.unlockScheduleStatus)} styles={styles} />
        <SectionRow label="Next unlock" value={`${tokenomics.nextUnlockDate || "Unknown date"} | ${displayPercent(tokenomics.nextUnlockPercent)} | ${displayUsd(tokenomics.nextUnlockUsdValue)}`} styles={styles} />
        <SectionRow label="Unlock / volume / liquidity / market cap" value={`${displayRatio(tokenomics.unlockToVolumeRatio)} / ${displayRatio(tokenomics.unlockToLiquidityRatio)} / ${displayDecimalPercent(tokenomics.unlockToMarketCap)}`} styles={styles} />
        <SectionRow label="Future dilution risk" value={status(tokenomics.futureDilutionRisk)} styles={styles} />
        <ListBlock title="Unlock source requirements" items={safeArray(tokenomics.sourceRequirements).filter((item) => /unlock|vesting|release|recipient|liquidity|dilution/i.test(item))} emptyText="No unlock-specific source requirement attached." color="#f9d976" styles={styles} />
      </Card>

      <Card title="Supply Control / Mutability" subtitle="Admin, mint, governance, migration, and contract-control risks require source-backed review." styles={styles}>
        <SectionRow label="Mint/admin/cap mutability" value={`${controlStatusLabel(tokenomics.mintAuthorityStatus, "mint", primaryLensId)} / ${controlStatusLabel(tokenomics.adminControlStatus, "admin", primaryLensId)} / ${status(tokenomics.capMutabilityStatus)}`} styles={styles} />
        <SectionRow label="Governance supply-change risk" value={status(tokenomics.governanceSupplyChangeRisk)} styles={styles} />
        <SectionRow label="Migration / representation" value={`${identity.migrationStatus || "Unknown"} / ${identity.representationType || "Unknown"}`} styles={styles} />
        <ListBlock title="Manual review triggers" items={tokenomics.manualReviewTriggers} emptyText="No tokenomics manual-review trigger attached." color="#f9d976" styles={styles} />
        <ListBlock title="Control source requirements" items={safeArray(tokenomics.sourceRequirements).filter((item) => /mint|admin|governance|contract|migration|cap|emission|proxy|authority/i.test(item))} emptyText="No control-specific source requirement attached." color="#9bd7ff" styles={styles} />
      </Card>

      <Card title="Emissions / Burn / Rewards" subtitle="Burns and rewards require materiality and source review before improving supply confidence." styles={styles}>
        <SectionRow label="Emission policy / annual inflation" value={`${status(tokenomics.emissionPolicyStatus)} / ${displayPercent(tokenomics.annualInflationEstimate)}`} styles={styles} />
        <SectionRow label="Annualized emissions / net issuance" value={`${displayNumber(tokenomics.annualizedEmissions)} / ${displayNumber(tokenomics.netIssuanceAfterBurn)}`} styles={styles} />
        <SectionRow label="Burn / materiality / buyback-burn" value={`${status(tokenomics.burnMechanismStatus)} / ${status(tokenomics.burnMateriality)} / ${status(tokenomics.buybackBurnStatus)}`} styles={styles} />
        <SectionRow label="Buyback/burn coverage" value={displayDecimalPercent(tokenomics.buybackBurnCoverage)} styles={styles} />
        <SectionRow label="Staking reward source / real yield vs subsidy" value={`${status(tokenomics.stakingRewardSource)} / ${status(tokenomics.realYieldVsSubsidyStatus)}`} styles={styles} />
      </Card>

      <Card title="Concentration / Treasury / Holder Risk" subtitle="Concentration metrics are shown only when current providers attach usable fields." styles={styles}>
        <SectionRow label="Insider / treasury / holder concentration risk" value={`${status(tokenomics.insiderAllocationRisk)} / ${status(tokenomics.treasurySupplyRisk)} / ${status(tokenomics.holderConcentrationRisk)}`} styles={styles} />
        <SectionRow label="Top wallet concentration" value={displayPercent(tokenomics.topWalletConcentration)} styles={styles} />
        <SectionRow label="Treasury / vesting recipient concentration" value={`${displayDecimalPercent(tokenomics.treasurySupplyConcentration)} / ${displayDecimalPercent(tokenomics.vestingRecipientConcentration)}`} styles={styles} />
        <ListBlock title="Concentration source requirements" items={safeArray(tokenomics.sourceRequirements).filter((item) => /treasury|foundation|insider|wallet|recipient|holder/i.test(item))} emptyText="No concentration-specific source requirement attached." color="#f9d976" styles={styles} />
      </Card>

      <Card title="Absorption Capacity / Liquidity Context" subtitle="Dilution materiality depends on unlock timing, liquidity, volume, market cap, and demand absorption." styles={styles}>
        <SectionRow label="24h volume / volume-market-cap" value={`${displayUsd(tokenomics.volume24h)} / ${displayDecimalPercent(tokenomics.volumeMarketCapRatio)}`} styles={styles} />
        <SectionRow label="Unlock / volume / liquidity / market cap" value={`${displayRatio(tokenomics.unlockToVolumeRatio)} / ${displayRatio(tokenomics.unlockToLiquidityRatio)} / ${displayDecimalPercent(tokenomics.unlockToMarketCap)}`} styles={styles} />
        <ListBlock title="Demand absorption notes" items={safeArray(tokenomics.neutralContextualSignals).concat(safeArray(tokenomics.negativeSignals).filter((item) => /demand|liquidity|volume|absorption|FDV/i.test(item)))} emptyText="No absorption-capacity note attached." color="#d5dcec" styles={styles} />
      </Card>

      <Card title="Tokenholder Accrual / Rights" subtitle="The engine separates tokenholder economic rights from provider category, narrative, or protocol adoption." styles={styles}>
        <SectionRow label="Value capture / token necessity" value={`${status(tokenomics.tokenholderValueCaptureStatus)} / ${status(tokenomics.tokenNecessityStatus)}`} styles={styles} />
        <SectionRow label="Accrual / fee revenue / protocol revenue ratios" value={`${displayDecimalPercent(tokenomics.tokenholderAccrualRatio)} / ${displayDecimalPercent(tokenomics.feeRevenueCaptureRatio)} / ${displayRatio(tokenomics.protocolRevenueToTokenValue)}`} styles={styles} />
        <SectionRow label="Staking / real yield vs subsidy" value={`${status(tokenomics.stakingRewardSource)} / ${status(tokenomics.realYieldVsSubsidyStatus)}`} styles={styles} />
        <ListBlock title="Accrual source requirements" items={safeArray(tokenomics.sourceRequirements).filter((item) => /fee|revenue|accrual|buyback|burn|staking|rights|claim|yield/i.test(item))} emptyText="No tokenholder-accrual source requirement attached." color="#9bd7ff" styles={styles} />
      </Card>

      <TokenomicsQuestionPanel tokenomics={tokenomics} styles={styles} />

      <Card title="Score Logic / Caps / Gates" subtitle="These are tokenomics module signals; they do not replace the current overall scoring model." styles={styles}>
        <SectionRow label="Diagnostic integrity score" value={tokenomics.tokenomicsIntegrityScore === null || tokenomics.tokenomicsIntegrityScore === undefined ? "Unavailable" : `${tokenomics.tokenomicsIntegrityScore}/100`} styles={styles} />
        <SectionRow label="Evidence confidence" value={status(tokenomics.evidenceConfidence)} styles={styles} />
        <ListBlock title="Hard blockers" items={tokenomics.hardBlockers} emptyText="No tokenomics hard blocker attached." color="#ffb6b6" styles={styles} />
        <ListBlock title="Soft blockers" items={tokenomics.softBlockers} emptyText="No tokenomics soft blocker attached." color="#f9d976" styles={styles} />
        <ListBlock title="Score caps" items={tokenomics.scoreCaps} emptyText="No tokenomics score cap attached." color="#f9d976" styles={styles} />
        <ListBlock title="Confidence caps" items={tokenomics.confidenceCaps} emptyText="No tokenomics confidence cap attached." color="#f9d976" styles={styles} />
        <ListBlock title="Positive signals" items={tokenomics.positiveSignals} emptyText="No positive tokenomics signal attached." color="#a6f3c2" styles={styles} />
        <ListBlock title="Negative signals" items={tokenomics.negativeSignals} emptyText="No negative tokenomics signal attached." color="#ffb6b6" styles={styles} />
        <ListBlock title="Neutral/contextual signals" items={tokenomics.neutralContextualSignals} emptyText="No contextual tokenomics signal attached." color="#d5dcec" styles={styles} />
        <SectionRow label="Institutional target model" value="Doctrine only: supply integrity, control/mutability, dilution path, concentration/treasury, absorption capacity, and tokenholder accrual. Not claimed as active backend weights." styles={styles} />
      </Card>

      <Card title="What Would Change" subtitle="Source-backed evidence needed to improve tokenomics confidence." styles={styles}>
        <ListBlock title="What would change" items={tokenomics.whatWouldChange} emptyText="No tokenomics change requirements attached." color="#a6f3c2" styles={styles} />
        <ListBlock title="Top source requirements" items={safeArray(tokenomics.sourceRequirements).slice(0, 10)} emptyText="No tokenomics source requirements attached." color="#9bd7ff" styles={styles} />
      </Card>

      <Card title="Audit Boundary / Reproducibility" subtitle="Compact audit-critical provenance. Full raw object remains in Audit / Raw." styles={styles}>
        <ListBlock title="Provider field audit" items={compactList(tokenomics.providerFieldAudit, (entry) => `${entry.provider}: available=${safeArray(entry.fieldsAvailable).join(", ") || "none"}; missing=${safeArray(entry.fieldsMissing).join(", ") || "none"}; timestamp=${entry.timestamp || "unavailable"}`)} emptyText="No provider field audit attached." color="#d5dcec" styles={styles} />
        <ListBlock title="Provider timestamps" items={compactList(tokenomics.providerTimestamps, (entry) => `${entry.provider}: ${entry.timestamp || "Unavailable"} (${entry.sourcePath || "source unavailable"})`)} emptyText="No provider timestamps attached." color="#d5dcec" styles={styles} />
        <ListBlock title="Source contradictions" items={tokenomics.sourceContradictions} emptyText="No source contradiction attached." color="#ffb6b6" styles={styles} />
        <ListBlock title="Provider disagreements" items={tokenomics.providerDisagreements} emptyText="No provider disagreement attached." color="#f9d976" styles={styles} />
        <ListBlock title="Source boundary" items={tokenomics.sourceBoundary} emptyText="No tokenomics source boundary attached." color="#9bd7ff" styles={styles} />
        <SectionRow label="Raw audit availability" value={Object.keys(safeObject(tokenomics.auditRawFields)).length ? "Raw tokenomics audit fields available in Audit / Raw and Review Bundle." : "No raw tokenomics audit object attached."} styles={styles} />
      </Card>
    </>
  );
}
