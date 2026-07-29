const FIXED_TIME = '2026-07-17T08:00:00.000Z'

function confidence(label = 'medium') {
  return { label, source: 'canonical fixture owner', explanation: 'Existing backend confidence mirrored for deterministic rendering.' }
}

function freshness(status = 'fresh') {
  return { status, observedAt: FIXED_TIME, checkedAt: FIXED_TIME, source: 'live provider fixture' }
}

function section(data, status = 'available', overrides = {}) {
  return {
    status,
    availabilityReason: status === 'available' ? 'Canonical data is available.' : 'Coverage is limited for this section.',
    confidence: confidence(status === 'available' ? 'medium' : 'low'),
    freshness: freshness(status === 'not_applicable' ? 'not_applicable' : 'fresh'),
    data,
    provenance: [],
    limitations: [],
    whatIsSupported: [],
    whatIsNotProven: [],
    ...overrides,
  }
}

function metric(value, unit, provider = 'CoinGecko', currency = null) {
  return {
    value,
    unit,
    currency,
    provider,
    observedAt: FIXED_TIME,
    freshness: 'fresh',
    validationState: 'selected_canonical_fact',
    sourcePath: 'fixture.canonical.field',
    sourceBoundary: 'Provider-reported current observation.',
  }
}

function formula(formulaId, label, displayedValue, result, formulaText) {
  return {
    formulaId,
    label,
    formula: formulaText,
    status: 'computed',
    result,
    displayedValue,
    resultUnit: 'ratio',
    inputs: [{ name: 'Canonical input', value: result, unit: 'fixture', sourcePath: 'fixture', provider: 'CoinGecko', observedAt: FIXED_TIME, sourceBoundary: [] }],
    missingInputs: [],
    invalidInputs: [],
    method: 'deterministic backend formula',
    confidence: 'medium',
    sourceRequirement: '',
    sourceBoundary: ['Backend-derived from provider inputs.'],
    limitations: ['Current arithmetic does not prove future outcomes.'],
  }
}

function qualitySection(data, status = 'partial', limitations = []) {
  return {
    status,
    confidence: { label: status === 'available' ? 'medium' : status === 'not_applicable' ? 'not_assessed' : 'low', explanation: 'Fixture evidence confidence.' },
    data,
    provenance: [],
    freshness: freshness(status === 'not_applicable' ? 'not_applicable' : 'fresh'),
    whatIsSupported: [],
    whatIsNotProven: [],
    limitations,
  }
}

function tokenomicsQualityData(legacy, { assetSymbol, canonicalAssetId, familyId, representationType, network, contract }) {
  const genericUnlockNotPrimary = ['native_asset', 'fiat_backed_stablecoin', 'wrapped_asset', 'liquid_staking_derivative', 'tokenized_commodity'].includes(representationType)
  const lowCoverage = assetSymbol === 'RSS3'
  const maxStatus = legacy.maxSupplySemantics?.formulaApplicability === 'not_applicable' ? 'not_applicable' : 'available'
  const unlockEventAssets = ['UNI', 'AAVE', 'ONDO', 'RENDER', 'RIO']
  const hasUnlockEvent = unlockEventAssets.includes(assetSymbol)
  const unlockEvents = hasUnlockEvent ? [{
    eventId: `${canonicalAssetId}-unlock-1`, source: 'Tokenomist', label: 'Provider-reported scheduled release', eventDate: '2026-09-01T00:00:00.000Z', eventType: 'linear', scheduleType: 'linear', valueUsd: 12_000_000, percent: 1.2, beginDate: '2026-08-01T00:00:00.000Z', endDate: '2026-10-01T00:00:00.000Z', dailyValueUsd: null, dailyPercent: null, cliffValueUsd: null, cliffPercent: null, linearValueUsd: 12_000_000, linearPercent: 1.2, allocationCategory: 'Ecosystem incentives', sourceUrl: null, boundary: 'Unlock does not prove issuance, claim, transfer, or sale.',
  }] : []
  const observations = [
    { observationId: `${canonicalAssetId}-cg-circulating`, supplyType: 'circulating_supply', value: legacy.circulatingSupply, unit: 'token', definition: 'CoinGecko provider-defined circulating supply.', provider: 'CoinGecko', providerAssetId: canonicalAssetId, canonicalAssetId, representationType, network, contractAddress: contract, observedAt: FIXED_TIME, freshness: 'fresh', validationState: 'valid', legitimacyClass: 'primary', whatItMeasures: 'Provider-defined circulating supply.', whatItDoesNotMeasure: 'Free float, unlocked supply, or beneficial ownership.', limitations: [] },
    { observationId: `${canonicalAssetId}-cmc-circulating`, supplyType: 'circulating_supply', value: legacy.circulatingSupply, unit: 'token', definition: 'CoinMarketCap provider-defined circulating supply.', provider: 'CoinMarketCap', providerAssetId: 1, canonicalAssetId, representationType, network, contractAddress: contract, observedAt: FIXED_TIME, freshness: 'fresh', validationState: 'valid', legitimacyClass: 'comparison_only', whatItMeasures: 'Provider-defined circulating supply.', whatItDoesNotMeasure: 'Independent review or beneficial ownership.', limitations: [] },
  ]
  const allocations = hasUnlockEvent ? [{ category: 'Ecosystem incentives', percent: 1.2, valueTokens: null, source: 'Tokenomist', sourceBoundary: 'Provider label; not independently reconciled.' }] : []
  return {
    ...legacy,
    schemaVersion: 'tokenomics-quality-engine-v1',
    generatedAt: FIXED_TIME,
    canonicalAssetId,
    representationScope: { assetFamily: familyId, representationType, canonicalNetwork: network, analyzedNetwork: network, analyzedContract: contract, routeSafety: lowCoverage ? 'degraded' : 'safe' },
    status: lowCoverage ? 'degraded' : 'partial',
    confidence: { label: lowCoverage ? 'low' : 'medium', explanation: 'Tokenomics evidence confidence only.' },
    freshness: freshness(),
    supplyTruth: qualitySection({ status: 'available', methodologyVersion: 'supply-truth-formula-engine-consolidation-v1', observations, providerCandidates: [{ provider: 'CoinGecko', providerAssetId: canonicalAssetId, status: 'available', reason: 'Canonical provider identity matched.', sourcePath: 'fixture.cg', observedAt: FIXED_TIME }, { provider: 'CoinMarketCap', providerAssetId: 1, status: 'available', reason: 'Canonical provider identity matched.', sourcePath: 'fixture.cmc', observedAt: FIXED_TIME }], canonicalFacts: {}, maxSupplySemantics: legacy.maxSupplySemantics, providerDisagreements: [], noSilentAveraging: true }, 'available'),
    supplyStructure: qualitySection({ circulatingSupply: legacy.circulatingSupply, totalSupply: legacy.totalSupply, maximumSupply: legacy.maxSupply, currentIssuedSupply: null, freeFloat: null, lockedSupply: null, unlockedSupply: null, definitions: ['Circulating, total, maximum, issued, unlocked, claimed, and free-float supply are distinct.'] }),
    supplyHistory: qualitySection({ observations: [], syntheticHistoryCreated: false }, 'unavailable'),
    issuance: qualitySection({ ...legacy.issuance, scheduleType: representationType === 'native_asset' ? 'continuous_protocol_issuance' : 'unknown' }),
    circulatingSupplyChange: qualitySection({ observedChange: null, observedChangePercent: null, observationWindow: null, annualizedObservedChange: null }, 'unavailable'),
    burns: qualitySection({ mechanismStatus: legacy.burn.mechanismStatus, materiality: legacy.burn.materiality, burnedTokens: null, burnedValueUsd: null, projectionApplied: false }, legacy.burn.mechanismStatus === 'unknown' ? 'unavailable' : 'partial'),
    buybacks: qualitySection({ mechanismStatus: 'unknown', executedValueUsd: null, retiredFromSupply: null, announcementTreatedAsExecution: false }, 'unavailable'),
    netSupplyChange: qualitySection({ netIssuanceAfterBurn: legacy.burn.netIssuanceAfterBurn, netInflationRate: null, formulaIds: [] }, 'unavailable'),
    unlocks: qualitySection({ coverageStatus: hasUnlockEvent ? 'provider_only' : 'unknown', schedulePrecision: hasUnlockEvent ? 'structured' : 'unknown', scheduleAgreement: hasUnlockEvent ? 'single_source' : 'unknown', futureCoverageDays: hasUnlockEvent ? 90 : null, nextUnlock: hasUnlockEvent ? { date: unlockEvents[0].eventDate, percent: unlockEvents[0].percent, usdValue: unlockEvents[0].valueUsd, eventType: 'linear' } : { date: null, percent: null, usdValue: null, eventType: 'unknown' }, events: unlockEvents, eventCount30d: 0, eventCount90d: unlockEvents.length, percent30d: null, percent90d: hasUnlockEvent ? 1.2 : null, unlockIsNotSale: true }, genericUnlockNotPrimary ? 'not_applicable' : hasUnlockEvent ? 'available' : 'unavailable'),
    vesting: qualitySection({ scheduleSummary: hasUnlockEvent ? 'Provider-reported linear schedule.' : null, scheduleType: genericUnlockNotPrimary ? 'not_applicable' : hasUnlockEvent ? 'linear' : 'unknown', events: unlockEvents, claimsSeparatedFromUnlocks: true }, genericUnlockNotPrimary ? 'not_applicable' : hasUnlockEvent ? 'available' : 'unavailable'),
    allocations: qualitySection({ categories: allocations, reportedCategoryCount: allocations.length, allocationTotalPercent: null, allocationTotalReconciled: null }, allocations.length ? 'partial' : genericUnlockNotPrimary ? 'not_applicable' : 'unavailable'),
    insiderExposure: qualitySection({ reportedInsiderAllocationPercent: null, risk: 'unknown', explicitCategoryEvidence: false }, genericUnlockNotPrimary ? 'not_applicable' : 'unavailable'),
    treasury: qualitySection({ supplyConcentrationPercent: null, risk: 'unknown', treasuryIsNotAutomaticallyFreeFloat: true }, 'unavailable'),
    holderConcentration: qualitySection({ topWalletConcentrationPercent: 18.5, top10HolderRatePercent: 42, holderConcentrationPercent: null, ownerPercent: null, creatorPercent: null, concentrationRisk: 'medium', walletDistribution: 'unknown', beneficialOwnerAdjusted: false }, 'partial'),
    utilityMechanisms: qualitySection({ mechanisms: [{ mechanism: familyId, status: 'partial', source: 'tokenUtility', description: 'Family-specific utility classification requires mechanism review.', tokenDemandProven: false, tokenholderAccrualProven: false, limitations: ['Utility does not prove demand or accrual.'] }], clarity: 'partial', summary: 'A bounded utility classification is available.' }),
    demandMechanisms: qualitySection({ mechanisms: [], mandatoryUseProven: false, protocolActivityDoesNotProveTokenDemand: true }, 'partial'),
    protocolSuccess: qualitySection({ availability: assetSymbol === 'UNI' || assetSymbol === 'AAVE' ? 'partial' : 'missing', usageStrength: 'partial', economicsStrength: 'unknown', feesUsd24h: assetSymbol === 'UNI' ? 2_000_000 : null, revenueUsd24h: null, volumeUsd24h: null, tvlUsd: assetSymbol === 'UNI' ? 5_000_000_000 : null, summary: assetSymbol === 'UNI' ? 'Mapped protocol activity is visible.' : null }, assetSymbol === 'UNI' || assetSymbol === 'AAVE' ? 'partial' : 'unavailable'),
    tokenSuccess: qualitySection({ tokenNecessityStatus: 'partial', valueCaptureStatus: 'unknown', stakingRewardSource: 'unknown', protocolSuccessDoesNotProveTokenSuccess: true }, 'partial'),
    valueCapture: qualitySection({ status: 'unknown', tokenholderAccrualRatio: null, feeRevenueCaptureRatio: null, protocolRevenueToTokenValue: null, mechanismConfirmed: false }, 'unavailable'),
    dilution: qualitySection({ circulatingPercentOfMax: legacy.circulatingPercentOfMax, remainingDilutionPercent: legacy.remainingDilution, fdvToMarketCap: legacy.fdvToMarketCap, supplyGapTotalMinusCirculating: legacy.totalSupply - legacy.circulatingSupply, supplyGapMaxMinusCirculating: legacy.maxSupply === null ? null : legacy.maxSupply - legacy.circulatingSupply, futureDilutionRisk: 'unknown' }, maxStatus),
    strengths: [legacy.primaryTokenomicsStrength],
    risks: [legacy.primaryTokenomicsRisk],
    contradictions: [],
    missingCriticalData: [...legacy.whatWouldImproveConfidence],
    nextDiligence: [...legacy.whatWouldImproveConfidence],
    provenance: [],
    limitations: ['Provider definitions remain separate; no synthetic supply history is created.'],
  }
}

const ASSET_CONTROLS = [
  ['BTC', 'Bitcoin', 'bitcoin', 'Bitcoin monetary network', 'native_asset', 'Proof-of-work monetary security and fixed-supply credibility are the primary thesis.', 'Fee-market durability and mining concentration remain the key open risks.'],
  ['ETH', 'Ethereum', 'ethereum', 'Ethereum settlement and gas asset', 'native_asset', 'Gas demand, fee burn, staking, and settlement activity support the current thesis.', 'Validator diversity and L2 fee contribution require current evidence.'],
  ['XRP', 'XRP', 'ripple', 'Payments and settlement network', 'native_asset', 'Settlement usage and liquid market access frame the XRP thesis.', 'Economic role and regulatory context remain the weakest areas.'],
  ['USDC', 'USDC', 'usd-coin', 'Fiat-backed stablecoin', 'fiat_backed_stablecoin', 'Reserve quality, redemption access, and issuer controls define the stablecoin thesis.', 'Banking, custody, freeze controls, and peg resilience require ongoing verification.'],
  ['WBTC', 'Wrapped Bitcoin', 'wrapped-bitcoin', 'Wrapped and custodial asset', 'wrapped_asset', 'Tokenized BTC exposure on smart-contract rails depends on backing and redemption.', 'Custodian, reserves, redemption, and contract controls remain critical.'],
  ['stETH', 'Lido Staked ETH', 'staked-ether', 'Liquid staking derivative', 'liquid_staking_derivative', 'Liquid staking exposure is supported through the staking and withdrawal mechanism.', 'Operator concentration, slashing, withdrawal, and depeg risk remain primary.'],
  ['UNI', 'Uniswap', 'uniswap', 'DeFi governance token', 'evm_contract_asset', 'Protocol usage is visible, while tokenholder accrual remains a separate question.', 'Fee routing and durable UNI value capture remain unproven.'],
  ['LINK', 'Chainlink', 'chainlink', 'Oracle and interoperability network', 'evm_contract_asset', 'Oracle adoption and security services support the network relevance thesis.', 'Network adoption does not automatically establish LINK token accrual.'],
  ['ONDO', 'Ondo', 'ondo-finance', 'RWA hybrid finance token', 'evm_contract_asset', 'RWA product adoption provides context for the protocol-token thesis.', 'Product assets and tokenholder legal or economic rights remain distinct.'],
  ['PAXG', 'PAX Gold', 'pax-gold', 'Tokenized commodity', 'tokenized_commodity', 'Physical backing, custody, and redemption define the tokenized-gold thesis.', 'Legal claim, bar custody, redemption, and liquidity require verification.'],
  ['RENDER', 'Render', 'render-token', 'DePIN resource network', 'multichain_representation', 'Resource-network demand and provider incentives support the DePIN thesis.', 'Migration scope and payer-to-token demand require current evidence.'],
  ['RSS3', 'RSS3', 'rss3', 'Limited-coverage digital asset', 'metadata_only_candidate', 'Current identity and market observations permit only a preliminary risk screen.', 'Fundamental evidence is too limited for a complete institutional conclusion.'],
  ['ADA', 'Cardano', 'cardano', 'Non-Ethereum smart-contract platform', 'native_asset', 'Native-chain usage, staking security, and fee generation frame the Cardano thesis.', 'Current usage, security, and liveness evidence remain incomplete.'],
  ['AVAX', 'Avalanche', 'avalanche-2', 'Non-Ethereum smart-contract platform', 'native_asset', 'Native network usage, validator security, and fee demand frame the Avalanche thesis.', 'Demand durability and validator economics require current evidence.'],
  ['SOL', 'Solana', 'solana', 'Non-Ethereum smart-contract platform', 'native_asset', 'Native network usage, fee demand, issuance, and validator economics frame the Solana thesis.', 'Issuance, validator concentration, and liveness evidence require current review.'],
  ['AAVE', 'Aave', 'aave', 'DeFi governance token', 'evm_contract_asset', 'Protocol usage and safety-module mechanics frame the Aave token thesis.', 'Direct tokenholder accrual and safety-module economics remain separate questions.'],
  ['PEPE', 'Pepe', 'pepe', 'Meme market structure', 'evm_contract_asset', 'Supply certainty, concentration, liquidity, and contract controls define the market-structure thesis.', 'Narrative demand does not create fundamental tokenholder value capture.'],
  ['RIO', 'Realio Network Token', 'realio-network', 'RWA infrastructure utility', 'multichain_representation', 'RWA infrastructure usage provides context for the utility-token thesis.', 'Canonical representation, legal rights, and token demand remain open checks.'],
]

const CURRENT_REALITY_SCENARIOS = {
  BTC: 'verified', ETH: 'announcement', XRP: 'conflict', USDC: 'provider_limited',
  WBTC: 'source_candidate', stETH: 'stale', UNI: 'verified', LINK: 'no_events',
  ONDO: 'announcement', PAXG: 'verified', RENDER: 'verified', RSS3: 'limited',
  ADA: 'verified', AVAX: 'provider_measurement', SOL: 'verified', AAVE: 'source_candidate',
  PEPE: 'no_events', RIO: 'provider_measurement',
}

function buildCurrentRealityEvent({
  canonicalAssetId,
  name,
  familyId,
  representationType,
  network,
  contract,
  scenario,
  thesisCopy,
  riskCopy,
}) {
  const isConflict = scenario === 'conflict'
  const isSourceCandidate = scenario === 'source_candidate'
  const isStale = scenario === 'stale'
  const isAnnouncement = scenario === 'announcement'
  const isProviderMeasurement = scenario === 'provider_measurement'
  const verificationState = isConflict ? 'conflicting_sources'
    : isSourceCandidate ? 'source_candidate_only'
      : isProviderMeasurement ? 'verified_provider_measurement'
        : 'verified_primary_source'
  const primaryImpact = isConflict || isSourceCandidate ? 'requires_verification'
    : isProviderMeasurement ? 'changes_risk'
      : isAnnouncement ? 'informational'
        : 'strengthens_thesis'
  const primaryCategory = isProviderMeasurement ? 'usage_metric_change'
    : isAnnouncement ? 'roadmap_change'
      : isConflict ? 'regulatory_development'
        : isSourceCandidate ? 'rumor_or_unverified_claim'
          : familyId.includes('stablecoin') || familyId.includes('commodity') ? 'reserve_update'
            : familyId.includes('defi') ? 'governance_execution'
              : familyId.includes('depin') ? 'protocol_migration'
                : 'roadmap_delivery'
  const lifecycleStatus = isAnnouncement ? 'announced' : isSourceCandidate || isConflict ? 'disputed' : 'completed'
  const sourceType = isSourceCandidate ? 'source_candidate' : isProviderMeasurement ? 'provider_api' : 'official_protocol'
  const sourceName = isSourceCandidate ? 'Unreviewed source candidate' : isProviderMeasurement ? 'Existing provider measurement' : `${name} official source`
  const freshness = isStale ? 'stale' : 'current'
  const publishedAt = isStale ? '2025-01-10T08:00:00.000Z' : '2026-07-15T08:00:00.000Z'
  const eventId = `${canonicalAssetId}-current-reality-${scenario}`
  const supports = primaryImpact === 'strengthens_thesis' ? [thesisCopy]
    : primaryImpact === 'changes_risk' ? ['A current measured change is relevant to an existing risk condition.']
      : ['The attached source establishes the existence of this development within its stated lifecycle.']
  const limitations = isAnnouncement
    ? ['The announcement does not establish implementation, adoption, or economic impact.']
    : isSourceCandidate
      ? ['A source candidate is not evidence and cannot change the thesis.']
      : isConflict
        ? ['Conflicting claims require primary-source resolution before any thesis impact.']
        : ['The event does not by itself establish durable asset or token value capture.']
  return {
    eventId,
    eventFingerprint: `${canonicalAssetId}:${representationType}:${network}:${primaryCategory}:${scenario}`,
    title: isAnnouncement ? `${name} roadmap announcement requires delivery verification`
      : isSourceCandidate ? `${name} claim remains unverified`
        : isConflict ? `Conflicting reports affect the ${name} risk review`
          : isProviderMeasurement ? `${name} provider measurement changes an existing risk input`
            : `${name} delivered a source-backed material development`,
    conciseSummary: isAnnouncement
      ? 'An official announcement is visible, but implementation and measurable results are not yet established.'
      : isSourceCandidate
        ? 'The available lead lacks the source quality and corroboration required for a material-event conclusion.'
        : isConflict
          ? 'Available sources disagree on a material development, so the engine preserves the conflict without changing the thesis.'
          : isProviderMeasurement
            ? 'An existing provider measurement is relevant within its measured field and changes the monitoring requirement.'
            : 'A primary source confirms a material development aligned with an existing thesis condition.',
    primaryCategory,
    dimensions: isProviderMeasurement ? ['adoption', 'liquidity'] : isConflict ? ['legal', 'regulatory'] : isAnnouncement ? ['execution'] : ['execution', 'adoption'],
    subject: {
      canonicalAssetId,
      subjectType: representationType === 'native_asset' ? 'native_network' : representationType === 'wrapped_asset' ? 'wrapped_representation' : representationType === 'liquid_staking_derivative' ? 'liquid_staking_product' : 'protocol',
      subjectId: `${canonicalAssetId}:${representationType}`,
      subjectName: name,
      providerAssetId: canonicalAssetId,
      representation: representationType,
      network,
      contractAddress: contract,
      relatedProtocol: name,
      relatedCompany: null,
      relatedIssuer: familyId.includes('stablecoin') || familyId.includes('commodity') ? name : null,
      relationshipToAsset: 'direct',
      identityConfidence: 'high',
      identityLimitations: [],
    },
    verificationState,
    sourceSummary: {
      primarySource: {
        sourceId: `${eventId}:source`, sourceType, sourceName,
        title: `${name} current development source`, canonicalUrl: null,
        publishedAt, observedAt: FIXED_TIME, reviewedAt: null,
        freshness, verificationState, evidenceEligibility: isSourceCandidate ? 'source_candidate_only' : 'eligible_within_source_boundary',
        sourceCandidateStatus: isSourceCandidate ? 'candidate_only' : 'not_source_candidate', limitations,
      },
      corroboratingSourceCount: isConflict ? 1 : 0,
      sourceTypes: [sourceType],
    },
    occurredAt: isAnnouncement ? null : publishedAt,
    effectiveAt: isAnnouncement || isSourceCandidate || isConflict ? null : publishedAt,
    announcedAt: isAnnouncement ? publishedAt : null,
    publishedAt,
    observedAt: FIXED_TIME,
    lastVerifiedAt: isSourceCandidate || isConflict ? null : FIXED_TIME,
    eventTimeConfidence: isAnnouncement ? 'publication_time_only' : isSourceCandidate || isConflict ? 'unknown' : 'exact',
    freshness,
    ageInHoursOrDays: isStale ? 554 : 2,
    lifecycleStatus,
    ongoingOrCompleted: isAnnouncement ? 'ongoing' : isSourceCandidate || isConflict ? 'unknown' : 'completed',
    effectiveWindow: isAnnouncement ? 'Delivery remains unverified.' : 'Current source window.',
    materiality: {
      state: isSourceCandidate ? 'unknown' : isConflict ? 'high' : isAnnouncement ? 'medium' : 'high',
      rationale: 'Materiality is based on affected scope, lifecycle, verification, and the existing thesis or risk condition.',
      dimensions: { asset_scope: 'direct', economic_scope: 'bounded', tokenholder_scope: 'unproven', confidence: isSourceCandidate || isConflict ? 'low' : 'medium' },
    },
    primaryImpact,
    secondaryImpacts: [],
    impactConfidence: isSourceCandidate || isConflict ? 'low' : 'medium',
    riskDirection: isProviderMeasurement ? 'risk_increased' : isConflict || isSourceCandidate ? 'unclear' : 'no_material_risk_change',
    affectedThesisConditions: primaryImpact === 'strengthens_thesis' ? [thesisCopy] : [],
    affectedRisks: primaryImpact === 'changes_risk' || isConflict ? [riskCopy] : [],
    affectedInvalidationConditions: isConflict ? [riskCopy] : [],
    affectedFundamentalsDimensions: isProviderMeasurement ? ['adoption', 'liquidity'] : ['execution'],
    affectedTokenomicsDimensions: [],
    affectedRights: [],
    affectedValueCaptureMechanisms: [],
    affectedProtocolSuccess: representationType !== 'native_asset',
    affectedTokenSuccess: false,
    impactSummary: primaryImpact === 'strengthens_thesis'
      ? 'The verified development supports an existing thesis condition without changing the score, confidence, or verdict.'
      : primaryImpact === 'changes_risk'
        ? 'The measured change updates an existing risk monitor but does not independently alter the thesis.'
        : primaryImpact === 'informational'
          ? 'The announcement is relevant context; delivery and economic impact remain unproven.'
          : 'No thesis conclusion is allowed until the source and affected scope are resolved.',
    whatItSupports: supports,
    whatItDoesNotProve: limitations,
    contradictions: isConflict ? ['Primary and secondary reports disagree on event status and scope.'] : [],
    missingEvidence: isAnnouncement ? ['Execution confirmation and measurable post-launch results.'] : isSourceCandidate || isConflict ? ['Canonical primary source and independent corroboration.'] : ['Current evidence of durable economic impact.'],
    nextDiligence: isAnnouncement ? ['Verify implementation and measured results.'] : isSourceCandidate || isConflict ? ['Resolve the claim against a canonical primary source.'] : ['Monitor whether the development changes durable usage, economics, or risk.'],
    reassessmentStatus: isConflict ? 'targeted_reassessment_needed' : 'monitor',
    duplicateState: isConflict ? 'conflicting_report' : 'canonical',
    provenance: [],
    limitations,
  }
}

function buildCurrentRealityData({ assetSymbol, canonicalAssetId, name, familyId, representationType, network, contract, thesisCopy, riskCopy }) {
  const scenario = CURRENT_REALITY_SCENARIOS[assetSymbol] || 'no_events'
  const hasEvent = !['no_events', 'provider_limited', 'limited'].includes(scenario)
  const event = hasEvent ? buildCurrentRealityEvent({ canonicalAssetId, name, familyId, representationType, network, contract, scenario, thesisCopy, riskCopy }) : null
  const verified = event && ['verified_primary_source', 'verified_multiple_sources', 'verified_provider_measurement', 'partially_verified'].includes(event.verificationState)
  const stale = event?.freshness === 'stale'
  const conflict = event?.verificationState === 'conflicting_sources'
  const unverified = event && !verified
  const active = verified && !stale && ['critical', 'high', 'medium'].includes(event.materiality.state)
  const events = event ? [event] : []
  const availableInputCount = scenario === 'provider_limited' ? 1 : scenario === 'limited' ? 0 : events.length
  const verifiedCount = verified ? 1 : 0
  const missingCriticalData = scenario === 'provider_limited'
    ? ['The existing provider failed or returned incomplete event coverage; this is a source-health limitation, not negative asset evidence.']
    : scenario === 'limited'
      ? ['Coverage is insufficient to establish a material-event timeline.']
      : event?.missingEvidence || ['No verified material event is attached in the current source window.']
  const status = scenario === 'limited' ? 'degraded' : scenario === 'no_events' || scenario === 'provider_limited' || unverified || stale ? 'partial' : 'available'
  return {
    schemaVersion: 'current-reality-engine-v1.0.0',
    generatedAt: FIXED_TIME,
    canonicalAssetId,
    representationScope: { representationType, network, contractAddress: contract, identityConfidence: scenario === 'limited' ? 'medium' : 'high' },
    canonicalFamily: familyId,
    status,
    confidence: {
      level: scenario === 'limited' || scenario === 'provider_limited' || unverified ? 'low' : verifiedCount ? 'medium' : 'unknown',
      rationale: verifiedCount ? 'At least one source-bounded event is available.' : 'No verified material event is available in the current window.',
      verifiedCoveragePercent: events.length ? verifiedCount * 100 : 0,
    },
    freshness: { status: stale ? 'stale' : verifiedCount ? 'current' : 'unknown', lastVerifiedAt: verified && !stale ? FIXED_TIME : null, oldestCurrentEventAt: verified && !stale ? event.publishedAt : null },
    coverage: {
      availableInputCount, canonicalEventCount: events.length, verifiedEventCount: verifiedCount,
      unverifiedEventCount: unverified ? 1 : 0, conflictingEventCount: conflict ? 1 : 0,
      staleEventCount: stale ? 1 : 0, excludedUnrelatedCount: 0, duplicateCount: 0,
      sourceTypes: event ? event.sourceSummary.sourceTypes : [],
      summary: verifiedCount ? `${verifiedCount} verified or source-bounded material event is available.` : scenario === 'provider_limited' ? 'Current event coverage is limited by an existing provider failure.' : scenario === 'limited' ? 'Coverage permits monitoring only; no event narrative is inferred.' : 'No verified material event is available in the current source window.',
    },
    eventWindow: { from: event?.publishedAt || null, to: event?.publishedAt || null, label: event ? (stale ? 'Historical source outside the current window' : 'Current 30-day source window') : 'No dated event window' },
    events,
    activeMaterialEvents: active ? [event] : [],
    resolvedEvents: verified ? [event] : [],
    unverifiedEvents: unverified ? [event] : [],
    conflictingEvents: conflict ? [event] : [],
    staleEvents: stale ? [event] : [],
    thesisStrengtheningEvents: verified && event.primaryImpact === 'strengthens_thesis' ? [event] : [],
    thesisWeakeningEvents: verified && event.primaryImpact === 'weakens_thesis' ? [event] : [],
    riskChangingEvents: verified && event.primaryImpact === 'changes_risk' ? [event] : [],
    informationalEvents: verified && event.primaryImpact === 'informational' ? [event] : [],
    verificationRequiredEvents: unverified ? [event] : [],
    mostMaterialEvent: active ? event : null,
    strongestPositiveDevelopment: verified && event.primaryImpact === 'strengthens_thesis' ? event : null,
    mostImportantNegativeDevelopment: verified && event.primaryImpact === 'weakens_thesis' ? event : null,
    mostImportantRiskChange: verified && event.primaryImpact === 'changes_risk' ? event : null,
    affectedThesisConditions: active ? event.affectedThesisConditions : [],
    affectedInvalidationConditions: active ? event.affectedInvalidationConditions : [],
    affectedTokenomicsDimensions: active ? event.affectedTokenomicsDimensions : [],
    affectedFundamentalsDimensions: active ? event.affectedFundamentalsDimensions : [],
    reassessmentStatus: conflict ? 'targeted_reassessment_needed' : 'monitor',
    contradictions: conflict ? event.contradictions : [],
    missingCriticalData,
    nextDiligence: event?.nextDiligence || ['Add a canonical source with clear subject, lifecycle, event time, and measurable scope.'],
    provenance: [],
    limitations: [scenario === 'provider_limited' ? 'Provider failure is source health, not negative asset evidence.' : 'Current Reality uses only already-available sources and does not infer events from price movement.'],
    audit: { rejectedEvents: [], ambiguousMappings: [], deduplicationDecisions: event ? [{ eventFingerprint: event.eventFingerprint, state: event.duplicateState, sourceCount: 1 }] : [], eventLineage: event ? [{ observationId: `${event.eventId}:observation`, eventId: event.eventId, relationship: 'canonical', originalClaim: event.conciseSummary, correctionClaim: null }] : [], sourceCandidatesExcludedFromImpact: unverified ? [event.eventId] : [], rawObservationCount: availableInputCount, scoreMutationAttempted: false, confidenceMutationAttempted: false, verdictMutationAttempted: false },
  }
}

export const REPRESENTATIVE_V2_ASSETS = ASSET_CONTROLS.map(([symbol]) => symbol)

const FUNDAMENTAL_DIMENSIONS = [
  ['productReality', 'Product reality'], ['useCase', 'Use case'], ['architecture', 'Architecture'],
  ['adoption', 'Adoption'], ['usageQuality', 'Usage quality'], ['protocolEconomics', 'Protocol economics'],
  ['revenueQuality', 'Revenue quality'], ['competitivePosition', 'Competitive position'], ['moatAndDefensibility', 'Moat and defensibility'],
  ['dependencies', 'Dependencies'], ['governance', 'Governance'], ['decentralization', 'Decentralization'],
  ['security', 'Security'], ['operationalRisk', 'Operational risk'], ['execution', 'Execution'],
  ['developmentActivity', 'Development activity'], ['roadmap', 'Roadmap'], ['legalAndEconomicRights', 'Legal and economic rights'],
  ['protocolSuccess', 'Protocol success'], ['tokenSuccess', 'Token success'], ['protocolToTokenTransfer', 'Protocol-to-token transfer'],
  ['thesis', 'Thesis'], ['antiThesis', 'Anti-thesis'], ['falsification', 'Falsification'], ['evidenceCoverage', 'Evidence coverage'],
]

function buildFundamentalsData({ assetSymbol, canonicalAssetId, familyId, familyLabel, representationType, thesisCopy, riskCopy, lowCoverage }) {
  const notApplicable = new Set(
    assetSymbol === 'BTC' ? ['protocolEconomics', 'revenueQuality', 'governance', 'roadmap', 'legalAndEconomicRights', 'protocolToTokenTransfer']
      : ['USDC', 'WBTC', 'PAXG'].includes(assetSymbol) ? ['protocolEconomics', 'revenueQuality', 'protocolSuccess', 'tokenSuccess', 'protocolToTokenTransfer']
        : assetSymbol === 'PEPE' ? ['protocolEconomics', 'revenueQuality', 'governance', 'execution', 'roadmap', 'protocolSuccess', 'tokenSuccess', 'protocolToTokenTransfer']
          : new Set(),
  )
  const dimension = (id, label) => {
    const isNotApplicable = notApplicable.has(id)
    const answer = id === 'thesis' ? thesisCopy
      : id === 'antiThesis' ? riskCopy
        : id === 'falsification' ? `The thesis weakens if ${riskCopy.charAt(0).toLowerCase()}${riskCopy.slice(1)}`
          : id === 'productReality' ? thesisCopy
            : id === 'protocolToTokenTransfer' || id === 'tokenSuccess' ? 'Protocol success does not automatically become token success; direct tokenholder accrual remains a separate evidence question.'
              : id === 'adoption' || id === 'usageQuality' ? 'Current evidence supports only a bounded view of measurable usage and its durability.'
                : id === 'protocolEconomics' || id === 'revenueQuality' ? 'Fees, protocol revenue, profitability, and tokenholder accrual remain separate.'
                  : id === 'legalAndEconomicRights' ? 'Legal and economic rights require eligible source documentation; governance or product adoption is not enough.'
                    : `${label} remains bounded by current family-specific evidence.`
    return {
      dimension: id,
      label,
      status: isNotApplicable ? 'not_applicable' : lowCoverage ? 'manual_review_required' : 'partially_supported',
      applicability: isNotApplicable ? 'not_applicable' : 'applicable',
      confidence: { label: lowCoverage ? 'low' : 'medium', source: 'fixture', explanation: 'Fixture mirrors backend confidence.' },
      freshness: freshness(),
      conciseAnswer: answer,
      supportingFacts: [], supportingJudgments: id === 'thesis' ? [thesisCopy] : [], dataUsed: [],
      whatIsSupported: id === 'productReality' || id === 'thesis' ? [thesisCopy] : [],
      whatIsNotProven: isNotApplicable ? [] : [riskCopy], contradictions: [],
      missingCriticalEvidence: isNotApplicable ? [] : [riskCopy], nextDiligence: isNotApplicable ? [] : ['Attach current family-specific evidence.'],
      provenance: [], limitations: isNotApplicable ? ['Not relevant for this canonical family.'] : ['Current observations support a bounded answer.'], answers: [],
    }
  }
  const dimensions = Object.fromEntries(FUNDAMENTAL_DIMENSIONS.map(([id, label]) => [id, dimension(id, label)]))
  const canonicalAnswer = {
    questionId: `${canonicalAssetId}-core`, question: `What supports the ${familyLabel} thesis today?`, questionGroup: `${familyId}_questions`, dimension: 'thesis', applicability: 'applicable',
    directAnswer: thesisCopy, conciseAnswer: thesisCopy, analystExplanation: thesisCopy, canonicalJudgment: thesisCopy,
    answerState: lowCoverage ? 'evidence_limited' : 'preliminary_answer', evidenceBehindIt: ['Current canonical identity and market observations.'], evidenceUsed: ['Current canonical identity and market observations.'],
    providerFactsUsed: [], derivedMetricsUsed: [], reviewedEvidenceUsed: [], sourceCandidatesExcluded: [], confidence: { label: lowCoverage ? 'low' : 'medium', source: 'fixture', explanation: 'Fixture confidence.' }, freshness: freshness(),
    whatTheDataSupports: [thesisCopy], whatItSupports: [thesisCopy], whatTheDataDoesNotProve: [riskCopy], whatItDoesNotProve: [riskCopy], contradictions: [],
    missingData: [riskCopy], missingEvidence: [riskCopy], whatWouldChangeTheView: 'Attach current family-specific evidence for the open risk.', nextDiligence: ['Attach current family-specific evidence for the open risk.'],
    sourceBoundary: 'Current provider observations support a bounded answer.', limitations: ['Current provider observations support a bounded answer.'],
  }
  const productType = familyLabel
  const primaryUseCase = assetSymbol === 'USDC' ? 'Payments, settlement, liquidity, and fiat-denominated on-chain balances.'
    : assetSymbol === 'WBTC' ? 'Using tokenized BTC exposure on smart-contract rails.'
      : assetSymbol === 'stETH' ? 'Maintaining liquidity while participating in staking economics.'
        : assetSymbol === 'PAXG' ? 'Transferable commodity exposure with custody and redemption diligence.'
          : thesisCopy
  const protocolTokenSummary = ['UNI', 'LINK', 'ONDO', 'AAVE', 'RIO'].includes(assetSymbol)
    ? 'Protocol or product relevance is visible, but direct tokenholder accrual remains unproven.'
    : 'Protocol success and token success remain distinct; no positive transfer is inferred.'
  return {
    schemaVersion: 'thesis-fundamentals-engine-v1', generatedAt: FIXED_TIME, assetSymbol, canonicalAssetId, assetFamily: familyId, representationType,
    canonicalQuestionGroup: `${familyId}_questions`, status: lowCoverage ? 'manual_review_required' : 'partially_supported',
    confidence: { label: lowCoverage ? 'low' : 'medium', source: 'fixture', explanation: 'Fixture mirrors existing confidence.' }, freshness: freshness(),
    ...dimensions,
    productRealityDetails: { productType, primaryProduct: thesisCopy, primaryUseCase, secondaryUseCases: [], targetUsers: ['Institutional and network participants'], economicActors: ['Users', 'operators', 'tokenholders'], deliveredProducts: [], activeProducts: [], proposedProducts: [], deprecatedProducts: [], measurableUsageAvailable: assetSymbol === 'UNI', productDependency: [riskCopy], productRealityStatus: lowCoverage ? 'manual_review_required' : 'partially_supported', evidenceConfidence: lowCoverage ? 'low' : 'medium', conciseSummary: thesisCopy },
    adoptionDetails: { classification: assetSymbol === 'UNI' ? 'provider_context_only' : 'unavailable', metrics: assetSymbol === 'UNI' ? [{ fieldId: 'protocol-volume-24h', label: 'Protocol activity volume', value: 2000000, displayValue: '$2.00M', unit: 'usd_24h', period: '24h', provider: 'Token Terminal', observedAt: FIXED_TIME, freshness: 'fresh', scope: 'mapped_protocol', sourcePath: 'fixture.protocol.volume', legitimacyClass: 'direct_provider_measurement', limitations: ['Volume is not revenue or unique users.'] }] : [], recurringUsageSupported: false, incentiveDependenceKnown: false, concentrationKnown: false, trendSupported: false, conciseSummary: dimensions.adoption.conciseAnswer },
    protocolEconomicsDetails: { mappingStatus: assetSymbol === 'UNI' ? 'protocol_mapped' : 'unmapped', fees: [], revenue: [], protocolVolume: [], tvl: [], borrowing: [], activeLoans: [], incentives: [], costs: [], buybacks: [], burns: [], treasuryFlows: [], tokenholderDistributions: [], periodConsistency: 'unavailable', economicSustainability: notApplicable.has('protocolEconomics') ? 'not_applicable' : 'unavailable', conciseSummary: dimensions.protocolEconomics.conciseAnswer },
    revenueQualityDetails: { state: notApplicable.has('revenueQuality') ? 'not_applicable' : 'unavailable', recurringRevenueSupported: false, costCoverageAvailable: false, incentiveDependenceKnown: false, tokenholderAccrualSupported: false, conciseSummary: dimensions.revenueQuality.conciseAnswer },
    competitivePositionDetails: { marketCategory: null, directCompetitors: [], indirectCompetitors: [], substituteProducts: [], differentiation: [], networkEffects: [], switchingCosts: [], liquidityMoat: [], distributionMoat: [], developerMoat: [], dataMoat: [], regulatoryMoat: [], brandMoat: [], integrationMoat: [], composabilityMoat: [], concentrationRisks: [], criticalDependencies: [riskCopy], upstreamDependencies: [], downstreamDependencies: [], competitorEvidenceStatus: 'unavailable', conciseSummary: dimensions.competitivePosition.conciseAnswer },
    governanceSecurityDetails: { governanceType: 'unavailable', tokenVotingRole: 'not established by current eligible evidence', adminAndUpgradeControls: [], emergencyControls: [], issuerControls: [], validatorOrOperatorConcentration: [], participationEvidence: [], treasuryControl: [], captureRisk: [], securityModel: dimensions.security.conciseAnswer, securityScopes: ['Family-specific security evidence'], materialRisks: [riskCopy], incidentEvidence: [], auditEvidence: [], conciseSummary: dimensions.security.conciseAnswer },
    executionDetails: { deliveredMilestones: [], activeMilestones: [], proposedMilestones: [], delayedMilestones: [], unverifiableMilestones: [], developmentMetrics: [], executionStatus: dimensions.execution.status, conciseSummary: dimensions.execution.conciseAnswer },
    legalEconomicRightsDetails: { rightsStatus: notApplicable.has('legalAndEconomicRights') ? 'not_applicable' : 'manual_review_required', rightsDirectness: notApplicable.has('legalAndEconomicRights') ? 'not_applicable' : 'unknown', legalBasis: [], enforceability: [], responsibleEntity: [], jurisdiction: [], reviewedSourceSupport: [], whatIsSupported: [], whatIsNotProven: [riskCopy], missingEvidence: notApplicable.has('legalAndEconomicRights') ? [] : [riskCopy], conciseSummary: dimensions.legalAndEconomicRights.conciseAnswer },
    protocolTokenTransferDetails: { protocolSuccessStatus: 'partial', tokenSuccessStatus: 'unknown', transferStatus: 'unknown', directMechanisms: [], indirectMechanisms: [], hypotheticalMechanisms: [], dilutionOffsets: [], economicRightsLimits: [riskCopy], unresolvedQuestions: [riskCopy], conciseSummary: protocolTokenSummary },
    thesisDetails: { thesisSummary: thesisCopy, thesisConditions: [thesisCopy], strongestSupportingEvidence: [thesisCopy], supportingDimensions: ['productReality', 'thesis'], keyAssumptions: [thesisCopy], antiThesisSummary: riskCopy, antiThesisEvidence: [riskCopy], strongestCounterargument: riskCopy, invalidationConditions: [riskCopy], falsificationSignals: [riskCopy], missingEvidence: [riskCopy], whatWouldStrengthen: ['Attach current family-specific evidence.'], whatWouldWeaken: [riskCopy], nextDiligence: ['Attach current family-specific evidence.'], confidence: { label: lowCoverage ? 'low' : 'medium', source: 'fixture', explanation: 'Fixture confidence.' }, boundary: 'Price movement alone is not thesis falsification.', limitations: [riskCopy] },
    directAnswers: [canonicalAnswer], strengths: [thesisCopy], risks: [riskCopy], contradictions: [], missingCriticalEvidence: [riskCopy], nextDiligence: ['Attach current family-specific evidence.'],
    evidenceSummary: { eligibleEvidenceCount: lowCoverage ? 1 : 5, reviewedEvidenceCount: 0, providerFactCount: 1, derivedMetricCount: 0, sourceCandidateCountExcluded: 0, missingCriticalEvidenceCount: 1, contradictoryClaimCount: 0, sourceCoverage: ['Current canonical observations.'], boundarySummary: 'Provider facts, reviewed evidence, derived metrics, missing evidence, and source candidates remain distinct.' },
    provenance: [], limitations: [riskCopy], guardrails: { scoringChanged: false, tokenomicsDiagnosticScoreChanged: false, verdictChanged: false, confidenceFormulaChanged: false, providerFetchChanged: false, routingAuthorityChanged: false, questionApplicabilityChanged: false, evidenceEligibilityChanged: false, reviewedEvidenceScoringActive: false, sourceCandidatesPromoted: false, runtimeAiAuthorityAdded: false, runtimeSeedAuthorityAdded: false, frontendAnalysisAuthorityAdded: false, snapshotsEnabled: false, partialRefreshEnabled: false, tokenSpecificRuntimeBranchesAdded: false },
    analystSummary: thesisCopy, strongestSupportedArea: thesisCopy, weakestArea: riskCopy, canonicalQuestions: [canonicalAnswer], evidenceBoundaries: ['Current observations support only bounded conclusions.'], missingCriticalData: [riskCopy], whatWouldChange: ['Attach current family-specific evidence.'], protocolSuccessSummary: dimensions.protocolSuccess.conciseAnswer, tokenSuccessSummary: protocolTokenSummary,
  }
}

function buildThesisFundamentalsPresentationFixture({
  result,
  assetSymbol,
  canonicalAssetId,
  name,
  familyId,
  familyLabel,
  representationType,
  network,
  contract,
}) {
  const fundamentals = result.fundamentals.data
  const product = fundamentals.productRealityDetails
  const adoption = fundamentals.adoptionDetails
  const economics = fundamentals.protocolEconomicsDetails
  const competition = fundamentals.competitivePositionDetails
  const governance = fundamentals.governanceSecurityDetails
  const execution = fundamentals.executionDetails
  const rights = fundamentals.legalEconomicRightsDetails
  const thesis = fundamentals.thesisDetails
  const state = fundamentals.status === 'manual_review_required' ? 'manual_review_required' : 'partially_supported'
  const block = (blockId, title, dimension, sourcePaths, overrides = {}) => ({
    blockId,
    title,
    state: dimension.status === 'not_applicable' ? 'not_applicable' : dimension.status === 'manual_review_required' ? 'manual_review_required' : 'partially_supported',
    summary: dimension.conciseAnswer,
    evidenceState: dimension.status,
    supportingEvidence: dimension.whatIsSupported,
    openChecks: [...dimension.missingCriticalEvidence, ...dimension.nextDiligence],
    sourcePaths,
    limitations: [...dimension.whatIsNotProven, ...dimension.limitations],
    ...overrides,
  })
  const institutionalThesis = {
    ...block('institutional-thesis', 'Institutional thesis', fundamentals.thesis, ['fundamentals.data.thesisDetails']),
    thesisState: state,
    thesisSummary: thesis.thesisSummary,
    thesisMechanism: product.primaryUseCase,
    thesisEvidenceSummary: thesis.strongestSupportingEvidence[0],
    thesisStrength: fundamentals.confidence.label,
    strongestSupportingFact: thesis.strongestSupportingEvidence[0],
    strongestSupportingInterpretation: fundamentals.strongestSupportedArea,
    primaryLimitation: thesis.limitations[0],
    confidenceBoundary: fundamentals.confidence.explanation,
    thesisApplicability: fundamentals.thesis.applicability,
    thesisEvidenceState: fundamentals.thesis.status,
    thesisLimitations: thesis.limitations,
  }
  return {
    schemaVersion: 'premium-v2-thesis-fundamentals-experience-v1',
    generatedAt: FIXED_TIME,
    canonicalAssetId,
    identity: { symbol: assetSymbol, name },
    representation: { representationType, selectedNetwork: network, selectedContract: contract },
    family: { familyId, familyLabel },
    status: state,
    confidence: fundamentals.confidence,
    freshness: fundamentals.freshness,
    assetRole: {
      ...block('asset-role', 'Asset role', fundamentals.useCase, ['fundamentals.data.productRealityDetails']),
      roleLabel: product.productType,
      roleDescription: product.conciseSummary,
      primaryUseCase: product.primaryUseCase,
      primaryUsers: product.targetUsers,
    },
    institutionalThesis,
    assetOrBusinessModel: {
      ...block('asset-model', 'Asset, business, network, issuer, or claim model', fundamentals.productReality, ['fundamentals.data.productRealityDetails']),
      modelType: product.productType,
      modelLabel: product.primaryProduct,
      modelDescription: product.conciseSummary,
      primaryUsers: product.targetUsers,
      customerOrParticipantTypes: product.economicActors,
      valueDelivered: product.primaryUseCase,
      operatingModel: product.primaryProduct,
      revenueOrFeeModel: economics.conciseSummary,
      settlementModel: fundamentals.architecture.conciseAnswer,
      securityModel: governance.securityModel,
      issuerModel: rights.responsibleEntity[0] || 'Issuer or responsible-entity evidence is unavailable.',
      custodyModel: 'Custody structure requires verification when applicable.',
      redemptionModel: 'Redemption or withdrawal terms require verification when applicable.',
    },
    adoptionAndUsage: {
      ...block('adoption-usage', 'Adoption and usage', fundamentals.adoption, ['fundamentals.data.adoptionDetails']),
      adoptionClassification: adoption.classification,
      usageQuality: fundamentals.usageQuality.conciseAnswer,
      recurringUsageSupported: adoption.recurringUsageSupported,
      incentiveDependenceKnown: adoption.incentiveDependenceKnown,
      concentrationKnown: adoption.concentrationKnown,
      trendSupported: adoption.trendSupported,
      measurableUsageAvailable: product.measurableUsageAvailable,
      metrics: adoption.metrics,
      organicUsageConclusion: 'Current evidence does not establish durable organic usage independently of incentives.',
    },
    economicActivity: {
      ...block('economic-activity', 'Economic activity', fundamentals.protocolEconomics, ['fundamentals.data.protocolEconomicsDetails']),
      mappingStatus: economics.mappingStatus,
      revenueQualityState: fundamentals.revenueQualityDetails.state,
      economicSustainability: economics.economicSustainability,
      periodConsistency: economics.periodConsistency,
      fees: economics.fees,
      revenue: economics.revenue,
      protocolVolume: economics.protocolVolume,
      tvl: economics.tvl,
      borrowing: economics.borrowing,
      activeLoans: economics.activeLoans,
      incentives: economics.incentives,
      costs: economics.costs,
      treasuryFlows: economics.treasuryFlows,
      tokenholderDistributions: economics.tokenholderDistributions,
      protocolSuccessTokenSuccessBoundary: fundamentals.protocolTokenTransferDetails.conciseSummary,
    },
    ecosystemAndNetworkEffects: {
      ...block('ecosystem-network-effects', 'Ecosystem and network effects', fundamentals.architecture, ['fundamentals.data.competitivePositionDetails']),
      networkEffects: competition.networkEffects,
      ecosystemEvidenceState: competition.networkEffects.length ? 'partially_supported' : 'unavailable',
    },
    competitionAndPositioning: {
      ...block('competition-positioning', 'Competition and positioning', fundamentals.competitivePosition, ['fundamentals.data.competitivePositionDetails']),
      marketCategory: competition.marketCategory,
      directCompetitors: competition.directCompetitors,
      indirectCompetitors: competition.indirectCompetitors,
      substituteProducts: competition.substituteProducts,
      differentiation: competition.differentiation,
      competitorEvidenceStatus: competition.competitorEvidenceStatus,
    },
    moatAndDurability: {
      ...block('moat-durability', 'Moat and durability', fundamentals.moatAndDefensibility, ['fundamentals.data.competitivePositionDetails']),
      networkEffects: competition.networkEffects,
      switchingCosts: competition.switchingCosts,
      liquidityMoat: competition.liquidityMoat,
      distributionMoat: competition.distributionMoat,
      developerMoat: competition.developerMoat,
      dataMoat: competition.dataMoat,
      regulatoryMoat: competition.regulatoryMoat,
      brandMoat: competition.brandMoat,
      integrationMoat: competition.integrationMoat,
      composabilityMoat: competition.composabilityMoat,
      moatEvidenceStatus: competition.competitorEvidenceStatus,
    },
    executionAndOrganization: {
      ...block('execution-organization', 'Execution and organization', fundamentals.execution, ['fundamentals.data.executionDetails']),
      ...execution,
    },
    governanceAndOperationalControl: {
      ...block('governance-control', 'Governance and operational control', fundamentals.governance, ['fundamentals.data.governanceSecurityDetails']),
      ...governance,
    },
    regulatoryLegalAndJurisdictionalStructure: {
      ...block('legal-structure', 'Legal, regulatory, and jurisdictional structure', fundamentals.legalAndEconomicRights, ['fundamentals.data.legalEconomicRightsDetails']),
      rightsStatus: rights.rightsStatus,
      rightsDirectness: rights.rightsDirectness,
      legalBasis: rights.legalBasis,
      enforceability: rights.enforceability,
      responsibleEntity: rights.responsibleEntity,
      jurisdiction: rights.jurisdiction,
      reviewedSourceSupport: rights.reviewedSourceSupport,
      rightsSupported: rights.whatIsSupported,
      rightsNotProven: rights.whatIsNotProven,
    },
    treasuryAndFinancialResilience: {
      ...block('treasury-resilience', 'Treasury and financial resilience', fundamentals.dependencies, ['fundamentals.data.governanceSecurityDetails.treasuryControl']),
      treasuryControl: governance.treasuryControl,
      treasuryFlows: economics.treasuryFlows,
      runwayEvidenceAvailable: false,
      spendEvidenceAvailable: economics.costs.length > 0,
      circularityDisclosureRequired: true,
    },
    dependenciesAndConcentration: {
      ...block('dependencies-concentration', 'Dependencies and concentration', fundamentals.dependencies, ['fundamentals.data.competitivePositionDetails']),
      criticalDependencies: competition.criticalDependencies,
      upstreamDependencies: competition.upstreamDependencies,
      downstreamDependencies: competition.downstreamDependencies,
      concentrationRisks: competition.concentrationRisks,
      operatorOrValidatorConcentration: governance.validatorOrOperatorConcentration,
    },
    catalysts: {
      ...block('catalysts', 'Evidence-backed catalysts', fundamentals.roadmap, ['fundamentals.data.executionDetails'], { summary: 'No catalyst is treated as realized without execution evidence.' }),
      verifiedCatalysts: [],
      announcedOrConditionalCatalysts: [...execution.proposedMilestones, ...thesis.whatWouldStrengthen],
      catalystEvidenceState: 'needs_verification',
    },
    counterThesis: {
      ...block('counter-thesis', 'Counter-thesis', fundamentals.antiThesis, ['fundamentals.data.thesisDetails']),
      counterThesisSummary: thesis.antiThesisSummary,
      counterThesisEvidence: thesis.antiThesisEvidence,
      strongestCounterargument: thesis.strongestCounterargument,
    },
    falsificationConditions: {
      ...block('falsification', 'Falsification conditions', fundamentals.falsification, ['fundamentals.data.thesisDetails.falsificationSignals']),
      thesisConditions: thesis.thesisConditions,
      invalidationConditions: thesis.invalidationConditions,
      falsificationSignals: thesis.falsificationSignals,
      observableConditionRequired: true,
      priceMovementAloneIsNotFalsification: true,
    },
    strengths: fundamentals.strengths,
    risks: fundamentals.risks,
    criticalUnknowns: fundamentals.missingCriticalEvidence,
    whatWouldChangeTheView: { improve: thesis.whatWouldStrengthen, weaken: thesis.whatWouldWeaken },
    dataQuality: { state, confidenceLabel: fundamentals.confidence.label, freshnessLabel: fundamentals.freshness.status, contradictions: fundamentals.contradictions, limitations: fundamentals.limitations },
    evidenceCoverage: { state: 'needs_verification', ...fundamentals.evidenceSummary, reviewedEvidenceScoringActive: false, sourceCandidatesPromoted: false },
    missingEvidence: fundamentals.missingCriticalEvidence,
    nextDiligence: fundamentals.nextDiligence,
    provenance: [{ owner: 'Thesis & Fundamentals Engine', sourcePath: 'assetResearchResultV2.fundamentals.data', sourceType: 'existing_analysis', provider: null, observedAt: FIXED_TIME, freshness: 'fresh', boundary: 'Existing canonical analysis only.', presentationUse: 'Canonical bounded judgment' }],
    limitations: [...fundamentals.limitations, 'Missing evidence is not treated as negative evidence.'],
    sectionBoundaries: {
      marketAndSupply: 'Exact measurements remain in Market & Supply.',
      tokenomics: 'Token demand, rights, and value capture remain in Tokenomics Quality.',
      currentReality: 'Current events and live conditions remain in Current Reality.',
      technicalAndScenarios: 'Price structure and scenarios remain in Technical & Scenarios.',
    },
    guardrails: {
      analyticalAuthorityAdded: false,
      frontendAnalysisAllowed: false,
      protocolSuccessEqualsTokenSuccess: false,
      partnershipsEqualUsage: false,
      integrationsEqualAdoption: false,
      marketCapEqualsMoat: false,
      pricePerformanceEqualsAdoption: false,
      productAumEqualsTokenValue: false,
      missingEvidenceIsRiskFinding: false,
      nativeFundamentalsInheritedByWrappedAsset: false,
      nativeFundamentalsInheritedByLst: false,
      stablecoinSpeculativeThesisAllowed: false,
      memeUtilityInvented: false,
      scoringChanged: false,
      tokenomicsScoreChanged: false,
      confidenceChanged: false,
      verdictChanged: false,
      rankingChanged: false,
      universeMembershipChanged: false,
      providerBehaviorChanged: false,
      routingAuthorityChanged: false,
      evidenceEligibilityChanged: false,
      sourceCandidatesPromoted: false,
      reviewedEvidenceScoringActive: false,
      runtimeAiAuthorityAdded: false,
      snapshotsEnabled: false,
      partialRefreshEnabled: false,
      tokenSpecificRuntimeBranchesAdded: false,
    },
  }
}

function presentationField(value, unit, {
  provider = 'CoinGecko',
  currency = null,
  sourcePath = 'premiumApiDataProductLayer.fixture',
  freshnessStatus = 'fresh',
  limitations = [],
} = {}) {
  const available = typeof value === 'number' && Number.isFinite(value)
  return {
    value: available ? value : null,
    normalizedValue: available ? value : null,
    displayValue: available ? String(value) : 'Unavailable',
    unit,
    currency,
    provider: available ? provider : null,
    providerField: available ? sourcePath.split('.').at(-1) : null,
    canonicalSourceOwner: 'premiumApiDataProductLayer',
    providerAssetId: available ? 'fixture-provider-id' : null,
    sourcePath,
    network: null,
    contractAddress: null,
    observedAt: available ? FIXED_TIME : null,
    receivedAt: available ? FIXED_TIME : null,
    freshnessStatus: available ? freshnessStatus : 'unknown',
    validationStatus: available ? 'canonical' : 'unknown',
    availabilityStatus: available ? 'available' : 'unavailable',
    legitimacyClass: available ? 'direct_provider_measurement' : 'unavailable',
    boundary: available ? ['Provider-reported current observation.'] : [],
    limitations: available ? limitations : ['Canonical measurement unavailable.'],
  }
}

function presentationScalar(value, unit, sourcePath, {
  notApplicable = false,
  provider = null,
  limitations = [],
} = {}) {
  const available = typeof value === 'number' && Number.isFinite(value)
  return {
    value: available ? value : null,
    unit,
    availability: notApplicable ? 'not_applicable' : available ? 'available' : 'unavailable',
    sourcePath,
    provider: available ? provider : null,
    observedAt: available ? FIXED_TIME : null,
    freshness: notApplicable ? 'not_applicable' : available ? 'fresh' : 'unavailable',
    boundary: available ? ['Canonical fixture measurement.'] : [],
    limitations: available ? limitations : limitations.length ? limitations : ['Canonical measurement unavailable.'],
  }
}

function presentationFormula(formulaId, value, unit, formulaExpression, inputPaths, applicability = 'applicable') {
  const computed = applicability === 'applicable' && typeof value === 'number' && Number.isFinite(value)
  return {
    ...presentationField(computed ? value : null, unit, {
      provider: 'ThesisCore Formula Engine',
      sourcePath: `premiumApiDataProductLayer.supply.derivedMetrics.${formulaId}`,
      limitations: computed ? ['Derived value does not predict future market outcomes.'] : ['Compatible canonical inputs are unavailable.'],
    }),
    formulaId,
    formulaExpression,
    formulaStatus: applicability === 'not_applicable' ? 'not_applicable' : computed ? 'computed' : 'unavailable_missing_inputs',
    inputs: inputPaths.map((fieldPath) => ({
      name: fieldPath.split('.').at(-1),
      fieldPath,
      value: computed ? 1 : null,
      unit: 'fixture_input',
      provider: computed ? 'CoinGecko' : null,
      observedAt: computed ? FIXED_TIME : null,
      validationState: computed ? 'valid' : 'missing',
    })),
    missingInputs: computed ? [] : inputPaths,
    invalidInputs: [],
    roundingRule: 'Display only; backend result preserved.',
  }
}

function presentationHistorySeries(seriesId, label, unit, values) {
  const dates = [
    '2026-06-20T00:00:00.000Z',
    '2026-06-28T00:00:00.000Z',
    '2026-07-05T00:00:00.000Z',
    '2026-07-11T00:00:00.000Z',
    FIXED_TIME,
  ]
  const points = values.map((value, index) => ({
    timestamp: dates[index],
    value,
    unit,
    quoteCurrency: 'USD',
    sourceProvider: 'CoinGecko',
    sourceMethod: 'direct_provider_series',
    observedAt: FIXED_TIME,
    limitations: [],
  }))
  const range = (rangeId, rangeLabel) => ({
    rangeId,
    label: rangeLabel,
    availability: 'available',
    points,
    startAt: points[0].timestamp,
    endAt: points.at(-1).timestamp,
    reasonUnavailable: null,
  })
  return {
    seriesId,
    label,
    unit,
    quoteCurrency: 'USD',
    sourceProvider: 'CoinGecko',
    sourceMethod: 'direct_provider_series',
    observedAt: FIXED_TIME,
    freshness: 'fresh',
    coverage: 'partial',
    directOrDerived: 'direct_provider_series',
    ranges: [range('30d', '30D'), range('90d', '90D'), range('1y', '1Y'), range('max', 'Max')],
    limitations: ['Fixture series contains direct observations only.'],
  }
}

function buildMarketLiquiditySupplyPresentationFixture({
  assetSymbol,
  canonicalAssetId,
  name,
  familyId,
  representationType,
  network,
  contract,
  riskCopy,
  lowCoverage,
}) {
  const noFixedCap = assetSymbol === 'ETH' || assetSymbol === 'USDC'
  const unlockApplicable = !['native_asset', 'fiat_backed_stablecoin', 'wrapped_asset', 'liquid_staking_derivative', 'tokenized_commodity'].includes(representationType)
  const pairAvailable = Boolean(contract)
  const currentPrice = assetSymbol === 'USDC' ? 1 : 100
  const price = presentationField(currentPrice, 'usd_per_token', { currency: 'USD', sourcePath: 'premiumApiDataProductLayer.market.currentPrice' })
  const marketCap = presentationField(1_000_000_000, 'usd', { currency: 'USD', sourcePath: 'premiumApiDataProductLayer.market.marketCap' })
  const fdv = presentationField(noFixedCap ? null : 1_250_000_000, 'usd', { currency: 'USD', sourcePath: 'premiumApiDataProductLayer.market.fullyDilutedValuation' })
  const volume = presentationField(75_000_000, 'usd_24h', { currency: 'USD', sourcePath: 'premiumApiDataProductLayer.market.volume24h' })
  const circulating = presentationField(10_000_000, 'token', { sourcePath: 'premiumApiDataProductLayer.supply.circulatingSupply' })
  const total = presentationField(12_000_000, 'token', { sourcePath: 'premiumApiDataProductLayer.supply.totalSupply' })
  const maximum = presentationField(noFixedCap ? null : 15_000_000, 'token', { sourcePath: 'premiumApiDataProductLayer.supply.maxSupply' })
  const marketCapToFdv = presentationFormula('market_cap_to_fdv', noFixedCap ? null : 80, 'percent', '(Market Cap / FDV) * 100', ['market.marketCap', 'market.fullyDilutedValuation'], noFixedCap ? 'not_applicable' : 'applicable')
  const circulatingShare = presentationFormula('circulating_percent_of_max', noFixedCap ? null : 66.67, 'percent', '(Circulating Supply / Maximum Supply) * 100', ['supply.circulatingSupply', 'supply.maxSupply'], noFixedCap ? 'not_applicable' : 'applicable')
  const remainingDilution = presentationFormula('remaining_dilution', noFixedCap ? null : 33.33, 'percent', '((Maximum Supply - Circulating Supply) / Maximum Supply) * 100', ['supply.circulatingSupply', 'supply.maxSupply'], noFixedCap ? 'not_applicable' : 'applicable')
  const volumeToMarketCap = presentationFormula('volume_market_cap_ratio', 7.5, 'percent', '(24h Volume / Market Cap) * 100', ['market.volume24h', 'market.marketCap'])
  const providerField = (value, provider, field) => presentationField(value, field === 'currentPrice' ? 'usd_per_token' : field.includes('Supply') ? 'token' : 'usd', {
    provider,
    sourcePath: `premiumApiDataProductLayer.market.providerObservations.${provider}.${field}`,
  })
  const providerObservations = [
    ['CoinGecko', currentPrice, 1_000_000_000],
    ['CoinMarketCap', currentPrice * 1.01, 1_070_000_000],
  ].map(([provider, observedPrice, observedMarketCap]) => ({
    provider,
    scope: 'global_asset_market',
    providerAssetId: provider === 'CoinGecko' ? canonicalAssetId : 1,
    providerSymbol: assetSymbol,
    providerName: name,
    canonicalProviderId: provider === 'CoinGecko' ? canonicalAssetId : 1,
    identityMatchStatus: 'matched',
    contractScopeStatus: contract ? 'matched' : 'not_applicable',
    networkScopeStatus: 'matched',
    acceptedForPrimaryDisplay: true,
    quarantineReasons: [],
    sourcePath: `fixture.${provider}`,
    observedAt: FIXED_TIME,
    receivedAt: FIXED_TIME,
    fields: {
      currentPrice: providerField(observedPrice, provider, 'currentPrice'),
      marketCap: providerField(observedMarketCap, provider, 'marketCap'),
      fullyDilutedValuation: providerField(noFixedCap ? null : provider === 'CoinGecko' ? 1_250_000_000 : 1_300_000_000, provider, 'fullyDilutedValuation'),
      circulatingSupply: providerField(10_000_000, provider, 'circulatingSupply'),
    },
  }))
  const selectedPairLiquidity = pairAvailable ? presentationField(8_500_000, 'usd', { provider: 'DexScreener', currency: 'USD', sourcePath: 'premiumApiDataProductLayer.liquidity.primaryPairs.liquidityUsd' }) : null
  const selectedPairVolume = pairAvailable ? presentationField(1_900_000, 'usd_24h', { provider: 'DexScreener', currency: 'USD', sourcePath: 'premiumApiDataProductLayer.liquidity.primaryPairs.volume24h' }) : null
  const missingData = [
    {
      fieldId: 'global_liquidity',
      label: 'Global executable liquidity',
      reasonUnavailable: 'No canonical global depth or slippage aggregation is attached.',
      analyticalImpact: 'Reported volume and one pool cannot establish executable global depth.',
      nextRequiredSourceOrMeasurement: 'Attach compatible order-book depth, spread, slippage, and venue-concentration measurements.',
      conclusionBounded: true,
      scoreUnaffectedByMilestone: true,
    },
    {
      fieldId: 'historical_supply',
      label: 'Historical circulating supply',
      reasonUnavailable: 'No direct historical supply series is attached.',
      analyticalImpact: 'Price and supply effects cannot be decomposed across the historical window.',
      nextRequiredSourceOrMeasurement: 'Attach direct historical supply observations for the selected representation.',
      conclusionBounded: true,
      scoreUnaffectedByMilestone: true,
    },
  ]
  if (unlockApplicable) {
    missingData.push({
      fieldId: 'unlock_schedule',
      label: 'Unlock schedule',
      reasonUnavailable: 'Canonical future unlock coverage is incomplete.',
      analyticalImpact: 'Missing coverage cannot be interpreted as no unlock risk.',
      nextRequiredSourceOrMeasurement: 'Attach a current representation-matched unlock schedule.',
      conclusionBounded: true,
      scoreUnaffectedByMilestone: true,
    })
  }
  return {
    schemaVersion: 'premium-v2-market-liquidity-supply-experience-v1',
    generatedAt: FIXED_TIME,
    canonicalAssetId,
    identity: { symbol: assetSymbol, name },
    representation: { representationType, assetFamily: familyId, selectedNetwork: network, selectedContract: contract },
    status: lowCoverage ? 'degraded' : 'partial',
    marketOverview: {
      currentPrice: price,
      quoteCurrency: 'USD',
      marketCap,
      marketCapRank: presentationField(12, 'rank', { sourcePath: 'premiumApiDataProductLayer.market.marketRank' }),
      fullyDilutedValuation: fdv,
      volume24h: volume,
      priceChange24h: presentationField(1.25, 'percent', { sourcePath: 'premiumApiDataProductLayer.market.priceChange24h' }),
      circulatingSupply: circulating,
      totalSupply: total,
      maximumSupply: maximum,
      measurementTimestamp: FIXED_TIME,
      freshnessState: 'fresh',
      providerCount: 2,
      providerAgreementState: 'material_provider_disagreement',
      providerDisagreementSummary: ['Comparable global market-cap observations differ materially.'],
      availabilityState: 'available',
      derivedMetrics: [marketCapToFdv, circulatingShare, remainingDilution, volumeToMarketCap],
    },
    providerAgreement: {
      overallState: 'material_provider_disagreement',
      priceAgreementState: 'minor_provider_variance',
      priceDispersionPercent: 1,
      marketCapAgreementState: 'material_provider_disagreement',
      supplyAgreementState: 'providers_aligned',
      fdvAgreementState: noFixedCap ? 'not_comparable' : 'minor_provider_variance',
      providersCompared: ['CoinGecko', 'CoinMarketCap'],
      comparableProviderCount: 2,
      comparisons: [{
        comparisonId: 'fixture-market-cap-comparison',
        field: 'marketCap',
        leftProvider: 'CoinGecko',
        rightProvider: 'CoinMarketCap',
        leftValue: 1_000_000_000,
        rightValue: 1_070_000_000,
        unit: 'usd',
        absoluteDifference: 70_000_000,
        relativeDifferencePercent: 7,
        observationTimeDifferenceMs: 0,
        comparisonStatus: 'material_disagreement',
        thresholdPercent: 5,
        scoringActive: false,
        limitations: ['Provider values remain separate.'],
      }],
      observations: providerObservations,
      disagreementReasons: ['Comparable global market-cap observations differ materially.'],
      staleProviders: [],
      excludedProviderMeasurements: [],
      comparisonTimestamp: FIXED_TIME,
      limitations: ['Pair-level measurements are excluded from global agreement.'],
    },
    liquidity: {
      status: pairAvailable ? 'partial' : 'unavailable',
      globalVolume24h: volume,
      spotVolume24h: presentationScalar(null, 'usd_24h', 'marketLiquiditySupply.liquidity.spotVolume24h'),
      dexVolume24h: presentationScalar(null, 'usd_24h', 'marketLiquiditySupply.liquidity.dexVolume24h'),
      selectedPairVolume24h: selectedPairVolume,
      selectedPairLiquidityUsd: selectedPairLiquidity,
      selectedPairIdentity: pairAvailable ? { chain: network, venue: 'Uniswap', pairAddress: '0x2222222222222222222222222222222222222222', baseAsset: assetSymbol, quoteAsset: 'USDC', pairCreatedAt: '2024-01-01T00:00:00.000Z' } : null,
      selectedVenue: pairAvailable ? 'Uniswap' : null,
      globalLiquidityAvailability: 'unavailable',
      orderBookDepth: presentationScalar(null, 'usd', 'marketLiquiditySupply.liquidity.orderBookDepth'),
      spread: presentationScalar(null, 'percent', 'marketLiquiditySupply.liquidity.spread'),
      slippageMeasurements: presentationScalar(null, 'percent', 'marketLiquiditySupply.liquidity.slippageMeasurements'),
      venueConcentration: presentationField(null, 'percent', { sourcePath: 'premiumApiDataProductLayer.liquidity.venueConcentration' }),
      topVenueShare: presentationScalar(null, 'percent', 'marketLiquiditySupply.liquidity.topVenueShare'),
      liquidityQualityState: 'bounded_market_activity_context',
      liquidityMeasurementScope: pairAvailable ? 'Global trading volume plus one selected pair.' : 'Global trading volume only.',
      liquidityFreshness: 'fresh',
      liquidityLimitations: ['One pool is not global liquidity.'],
      pairIsRepresentativeOfGlobalLiquidity: pairAvailable ? false : null,
      pairRepresentationReason: pairAvailable ? 'This pool is one venue-level observation and may not represent total market liquidity.' : 'No selected pair is attached; global liquidity is not inferred.',
    },
    supplyStructure: {
      status: 'partial',
      circulatingSupply: circulating,
      totalSupply: total,
      maximumSupply: maximum,
      maxSupplyDefined: noFixedCap ? false : true,
      maxSupplyPolicy: assetSymbol === 'ETH' ? 'adaptive_issuance' : assetSymbol === 'USDC' ? 'elastic_issuer_supply' : 'finite_cap_reported',
      maxSupplyPolicyExplanation: noFixedCap ? 'A fixed maximum is not the primary supply policy for this family.' : 'A provider-reported finite cap is visible but remains source-bound.',
      burnedSupply: presentationScalar(null, 'token', 'tokenomicsQuality.supplyTruth.observations.burned_supply'),
      lockedSupply: presentationScalar(null, 'token', 'tokenomicsQuality.supplyStructure.data.lockedSupply'),
      stakedSupply: presentationScalar(null, 'token', 'marketLiquiditySupply.supplyStructure.stakedSupply'),
      treasurySupply: presentationScalar(null, 'token', 'tokenomicsQuality.treasury.data.amountTokens'),
      escrowedSupply: presentationScalar(null, 'token', 'tokenomicsQuality.supplyTruth.observations.escrowed_supply'),
      bridgedOrWrappedSupply: presentationScalar(null, 'token', 'tokenomicsQuality.supplyTruth.observations.bridged_supply'),
      freeFloatSupply: presentationScalar(null, 'token', 'tokenomicsQuality.supplyStructure.data.freeFloat'),
      freeFloatMethod: null,
      remainingMintableSupply: noFixedCap ? null : presentationFormula('max_supply_gap', 5_000_000, 'token', 'Maximum Supply - Circulating Supply', ['supply.maxSupply', 'supply.circulatingSupply']),
      circulatingShare,
      circulatingToTotalShare: presentationFormula('circulating_to_total_ratio', 83.33, 'percent', '(Circulating Supply / Total Supply) * 100', ['supply.circulatingSupply', 'supply.totalSupply']),
      remainingDilutionShare: remainingDilution,
      lockedShare: null,
      stakedShare: null,
      treasuryShare: null,
      escrowShare: null,
      supplyMeasurementTimestamp: FIXED_TIME,
      supplyAgreementState: 'providers_aligned',
      supplyLimitations: ['Supply values apply only to the selected representation.'],
      categoriesMayOverlap: true,
    },
    issuanceAndBurn: {
      status: 'unavailable',
      issuanceModel: representationType === 'fiat_backed_stablecoin' ? 'issuer_mint_redeem' : 'unavailable',
      grossIssuanceRate: presentationScalar(null, 'percent_per_year', 'tokenomicsQuality.issuance.data.annualInflationEstimate'),
      grossIssuanceAmount: presentationScalar(null, 'token_per_year', 'tokenomicsQuality.issuance.data.annualizedEmissions'),
      burnModel: ['native_asset', 'fiat_backed_stablecoin', 'liquid_staking_derivative'].includes(representationType) ? 'not_applicable_or_family_specific' : 'unavailable',
      burnedAmount: presentationScalar(null, 'token', 'tokenomicsQuality.burns.data.burnedTokens'),
      burnRate: presentationScalar(null, 'percent', 'marketLiquiditySupply.issuanceAndBurn.burnRate'),
      netIssuanceRate: presentationScalar(null, 'percent', 'tokenomicsQuality.netSupplyChange.data.netInflationRate'),
      netIssuanceAmount: presentationScalar(null, 'token', 'tokenomicsQuality.netSupplyChange.data.netIssuanceAfterBurn'),
      inflationState: 'unavailable',
      deflationState: 'unavailable',
      issuancePeriod: null,
      measurementBasis: 'Existing Tokenomics Quality observations only.',
      sourceTimestamp: null,
      economicInterpretation: 'Compatible current issuance and burn periods are not attached.',
      interpretationLimitations: ['Burn presence would not prove net deflation or value capture.'],
      formulaOutputs: [],
    },
    unlocksAndEmissions: {
      status: unlockApplicable ? 'unavailable' : 'not_applicable',
      nextUnlockDate: null,
      nextUnlockAmount: null,
      nextUnlockPercentOfCirculating: null,
      nextUnlockPercentOfTotal: null,
      nextUnlockUsdValue: null,
      unlockScheduleCoverage: unlockApplicable ? 'unknown' : 'not_applicable',
      emissionsScheduleCoverage: 'unavailable',
      scheduledUnlocks: [],
      scheduledEmissions: [],
      rolling30DayUnlockPercent: null,
      rolling90DayUnlockPercent: null,
      rolling365DayUnlockPercent: null,
      cliffUnlocks: [],
      linearUnlocks: [],
      unlockRecipients: [],
      sourceFreshness: 'unavailable',
      unlockRiskState: unlockApplicable ? 'coverage_unavailable' : 'not_applicable',
      unlockInterpretation: unlockApplicable ? 'Missing unlock coverage is not interpreted as no unlock risk.' : 'Generic token unlocks are not the primary future-supply path for this representation.',
      limitations: ['No scheduled unlock is not the same as no issuance.'],
    },
    allocationAndConcentration: {
      status: 'partial',
      allocationCategories: [],
      investorAllocation: null,
      teamAllocation: null,
      foundationAllocation: null,
      treasuryAllocation: null,
      ecosystemAllocation: null,
      communityAllocation: null,
      publicSaleAllocation: null,
      unknownAllocation: null,
      topHolderConcentration: 18.5,
      top10HolderShare: 42,
      exchangeHolderShare: null,
      treasuryHolderShare: null,
      contractHolderShare: null,
      concentrationCoverage: 'raw_or_partially_label_adjusted',
      concentrationConfidence: 'low',
      excludedAddressCategories: [],
      concentrationLimitations: ['Provider labels do not prove beneficial ownership.'],
      originalAllocationIsNotCurrentOwnership: true,
    },
    historicalContext: {
      status: 'partial',
      requestedRange: 'max',
      sourceProvider: 'CoinGecko',
      sourceMethod: 'direct_provider_series',
      measurementTimestamp: FIXED_TIME,
      freshness: 'fresh',
      series: [
        presentationHistorySeries('price', 'Price', 'usd_per_token', [92, 96, 94, 101, currentPrice]),
        presentationHistorySeries('market_cap', 'Market cap', 'usd', [920_000_000, 960_000_000, 940_000_000, 1_010_000_000, 1_000_000_000]),
        presentationHistorySeries('volume', 'Volume', 'usd_24h', [42_000_000, 64_000_000, 55_000_000, 81_000_000, 75_000_000]),
      ],
      limitations: ['Historical supply is unavailable.'],
      technicalIndicatorsIncluded: false,
      syntheticHistoryCreated: false,
      gapsPreserved: true,
    },
    boundedInterpretation: {
      marketStructureView: 'Current global market measurements are available, with a material market-cap disagreement preserved.',
      liquidityView: pairAvailable ? 'Global volume and selected-pool liquidity are visible as separate scopes.' : 'Global volume is visible, while executable liquidity remains unavailable.',
      supplyView: representationType === 'wrapped_asset' ? 'Displayed supply applies only to the wrapped representation.' : representationType === 'liquid_staking_derivative' ? 'Displayed supply applies only to the liquid staking representation.' : 'Displayed supply applies only to the selected canonical representation.',
      dilutionView: noFixedCap ? 'Remaining dilution to a fixed maximum is not the primary metric for this family.' : 'Backend formulas expose the remaining maximum-supply gap without predicting price impact.',
      strongestSupportedMarketConclusion: 'Current market size, provider-reported activity, and available supply measurements are inspectable with exact scope boundaries.',
      primaryMarketOrSupplyRisk: riskCopy,
      criticalMarketOrSupplyUnknown: missingData[0].analyticalImpact,
      whatWouldImproveMarketSupplyConfidence: missingData.map((item) => item.nextRequiredSourceOrMeasurement),
      whatTheDataDoesNotProve: ['Reported volume does not prove executable institutional depth.', 'Circulating supply does not automatically equal free float.'],
      interpretationState: lowCoverage ? 'bounded_by_material_data_gaps' : 'bounded_by_provider_disagreement',
      interpretationLimitations: ['This presentation does not alter score, confidence, or verdict.'],
    },
    dataQuality: {
      status: 'partial',
      providerAgreementState: 'material_provider_disagreement',
      freshnessState: 'fresh',
      unavailableCriticalFieldCount: missingData.length,
      staleProviders: [],
      providerFailures: [],
      limitations: ['Data quality and asset quality are distinct.'],
    },
    missingData,
    nextDiligence: missingData.map((item) => item.nextRequiredSourceOrMeasurement),
    provenance: [
      { owner: 'premiumApiDataProductLayer', sourcePath: 'premiumApiDataProductLayer.market/supply/liquidity', measurementScope: 'canonical current provider measurements', boundary: 'Provider values remain separate.' },
      { owner: 'tokenomicsQuality', sourcePath: 'tokenomicsQuality', measurementScope: 'selected representation token economics', boundary: 'Missing coverage remains unavailable.' },
      { owner: 'historicalMarketData', sourcePath: 'historicalMarketData', measurementScope: 'direct historical market series', boundary: 'No synthetic history or technical indicators.' },
    ],
    limitations: ['Order-book depth, global executable liquidity, historical supply, free float, and unlock coverage may remain unavailable.'],
    guardrails: {
      frontendCalculationsAllowed: false,
      selectedPairIsGlobalLiquidity: false,
      missingDataRenderedAsZero: false,
      missingUnlockMeansNoRisk: false,
      nativeWrappedSupplyMerged: false,
      nativeLstSupplyMerged: false,
      scoringChanged: false,
      tokenomicsScoreChanged: false,
      confidenceChanged: false,
      verdictChanged: false,
      providerBehaviorChanged: false,
      snapshotsEnabled: false,
      partialRefreshEnabled: false,
    },
  }
}

const TOKENOMICS_PRESENTATION_FAMILY = {
  bitcoin_monetary_network: {
    label: 'Native proof-of-work monetary asset',
    role: 'Monetary and settlement asset',
    description: 'Monetary scarcity, mining issuance, settlement, and network security funding define the token-economic role.',
    mechanism: 'Monetary demand',
    mechanismType: 'monetary_demand',
    holderBoundary: 'Holding the asset does not create protocol revenue or governance rights.',
    governance: 'not_applicable',
    staking: 'not_applicable',
  },
  ethereum_settlement_and_gas_asset: {
    label: 'Native proof-of-stake settlement and gas asset',
    role: 'Settlement, gas, and security asset',
    description: 'Execution, settlement, fee burn, staking, and protocol issuance define the token-economic role.',
    mechanism: 'Network fees and security staking',
    mechanismType: 'fee_gas_demand',
    holderBoundary: 'Application revenue does not automatically accrue to holders.',
    governance: 'technical_only',
    staking: 'technical_only',
  },
  non_ethereum_smart_contract_platform: {
    label: 'Native smart-contract platform asset',
    role: 'Gas, settlement, and network-security asset',
    description: 'Native fees, settlement, staking or validator incentives, and issuance define the token-economic role.',
    mechanism: 'Network fees and security',
    mechanismType: 'fee_gas_demand',
    holderBoundary: 'Application success does not automatically create holder accrual.',
    governance: 'technical_only',
    staking: 'conditional',
  },
  payments_and_settlement_network: {
    label: 'Payments and settlement network asset',
    role: 'Payments, settlement, and liquidity asset',
    description: 'Settlement use, liquidity, escrow, distribution, fee materiality, and control define the token-economic role.',
    mechanism: 'Settlement and liquidity demand',
    mechanismType: 'settlement_demand',
    holderBoundary: 'Transaction activity does not establish a cash-flow claim.',
    governance: 'evidence_unavailable',
    staking: 'not_applicable',
  },
  fiat_backed_stablecoin: {
    label: 'Fiat-backed stablecoin',
    role: 'Stable-value settlement and redemption instrument',
    description: 'Settlement, reserve trust, redemption access, supported networks, and issuer control define the token-economic role.',
    mechanism: 'Settlement and redemption',
    mechanismType: 'redemption_demand',
    holderBoundary: 'Stablecoin ownership does not create rights to issuer revenue or third-party yield products.',
    governance: 'not_applicable',
    staking: 'not_applicable',
  },
  wrapped_and_custodial_asset: {
    label: 'Wrapped or bridged representation',
    role: 'Representation, transfer, and redemption asset',
    description: 'Backing, custody, redemption, contract control, and selected-chain liquidity define the token-economic role.',
    mechanism: 'Representation and redemption',
    mechanismType: 'redemption_demand',
    holderBoundary: 'Native monetary economics do not prove this representation’s backing or redemption quality.',
    governance: 'not_applicable',
    staking: 'not_applicable',
  },
  liquid_staking_derivative: {
    label: 'Liquid staking derivative',
    role: 'Liquid claim on staked assets',
    description: 'Withdrawals, operators, slashing, exchange-rate or rebase mechanics, and liquidity define the derivative economics.',
    mechanism: 'Liquid staking participation',
    mechanismType: 'staking_security_demand',
    holderBoundary: 'The derivative does not inherit the native asset’s issuance or direct monetary role.',
    governance: 'conditional',
    staking: 'conditional',
  },
  defi_governance_token: {
    label: 'DeFi governance and value-capture token',
    role: 'Protocol governance and conditional economic-link token',
    description: 'Governance, token necessity, treasury, incentives, and any fee or revenue link must be evaluated separately.',
    mechanism: 'Governance and protocol economics',
    mechanismType: 'governance_demand',
    holderBoundary: 'Protocol TVL and fees do not establish tokenholder accrual.',
    governance: 'governance_only',
    staking: 'conditional',
  },
  oracle_and_interoperability_network: {
    label: 'Oracle network token',
    role: 'Data-service payment and network-security token',
    description: 'Service payment, staking, operator incentives, and token demand must be distinguished from integrations.',
    mechanism: 'Oracle services and security',
    mechanismType: 'resource_market_demand',
    holderBoundary: 'Integration count does not establish token demand or holder accrual.',
    governance: 'conditional',
    staking: 'conditional',
  },
  rwa_hybrid_finance_token: {
    label: 'RWA governance or infrastructure token',
    role: 'RWA protocol governance or infrastructure token',
    description: 'Protocol-token utility and governance remain separate from related product rights, AUM, yield, and legal claims.',
    mechanism: 'Governance or infrastructure demand',
    mechanismType: 'governance_demand',
    holderBoundary: 'Product AUM and yield do not transfer to tokenholders without explicit rights.',
    governance: 'governance_only',
    staking: 'conditional',
  },
  rwa_infrastructure_utility: {
    label: 'RWA infrastructure utility token',
    role: 'RWA infrastructure, access, or governance token',
    description: 'Infrastructure access, token necessity, governance, and product adoption require separate evidence.',
    mechanism: 'Infrastructure access',
    mechanismType: 'access_demand',
    holderBoundary: 'RWA relevance does not establish tokenholder rights or value capture.',
    governance: 'conditional',
    staking: 'conditional',
  },
  tokenized_commodity: {
    label: 'Tokenized commodity claim',
    role: 'Tokenized commodity claim and redemption instrument',
    description: 'Backing, custody, legal claim, redemption, spot tracking, and token liquidity define the token-economic role.',
    mechanism: 'Commodity claim and redemption',
    mechanismType: 'redemption_demand',
    holderBoundary: 'The commodity market does not prove token backing or legal enforceability.',
    governance: 'not_applicable',
    staking: 'not_applicable',
  },
  depin_resource_network: {
    label: 'DePIN resource-network token',
    role: 'Resource-market payment and provider-incentive token',
    description: 'Resource payment, provider incentives, emissions, and token demand define the token-economic role.',
    mechanism: 'Resource-market demand',
    mechanismType: 'resource_market_demand',
    holderBoundary: 'Resource activity does not automatically create durable tokenholder accrual.',
    governance: 'conditional',
    staking: 'conditional',
  },
  meme_market_structure: {
    label: 'Meme and market-structure asset',
    role: 'Social and speculative market asset',
    description: 'Supply certainty, controls, concentration, liquidity, and social demand define the measurable structure.',
    mechanism: 'Social and speculative demand',
    mechanismType: 'speculative_social_demand',
    holderBoundary: 'Narrative demand and fixed supply do not create cash-flow rights.',
    governance: 'not_applicable',
    staking: 'not_applicable',
  },
  limited_coverage_digital_asset: {
    label: 'Coverage-limited asset',
    role: 'Token-economic role not established',
    description: 'Current evidence supports identity and market-risk triage, not a full token-economic mechanism assessment.',
    mechanism: 'No verified mechanism',
    mechanismType: 'mechanism_unavailable',
    holderBoundary: 'No positive token-economic conclusion is inferred from sparse metadata.',
    governance: 'evidence_unavailable',
    staking: 'evidence_unavailable',
  },
}

function presentationItem(itemId, label, description, state = 'needs_verification') {
  return {
    itemId,
    label,
    description,
    state,
    evidenceState: state === 'not_applicable' ? 'Not relevant for this asset family.' : 'Claim-specific evidence remains incomplete.',
    sourcePath: 'fixture.tokenomicsQualityPresentation',
    limitations: ['Fixture data preserves the same evidence boundary as the canonical backend contract.'],
  }
}

function buildTokenomicsQualityPresentationFixture({
  assetSymbol,
  canonicalAssetId,
  name,
  familyId,
  representationType,
  network,
  contract,
  riskCopy,
  tokenomics,
  market,
}) {
  const family = TOKENOMICS_PRESENTATION_FAMILY[familyId] || TOKENOMICS_PRESENTATION_FAMILY.limited_coverage_digital_asset
  const lowCoverage = familyId === 'limited_coverage_digital_asset'
  const stablecoin = familyId === 'fiat_backed_stablecoin'
  const wrapped = familyId === 'wrapped_and_custodial_asset'
  const lst = familyId === 'liquid_staking_derivative'
  const governanceApplicable = family.governance !== 'not_applicable'
  const stakingApplicable = family.staking !== 'not_applicable'
  const right = (id, label, state = 'evidence_unavailable') => presentationItem(`right-${id}`, label, state === 'not_applicable' ? `${label} are not part of the primary mechanism.` : `${label} require claim-specific evidence.`, state)
  const allocationCategories = market.allocationAndConcentration.allocationCategories.map((entry, index) => presentationItem(`allocation-${index + 1}`, entry.sourceLabel || entry.category, `${entry.percentage ?? entry.percent ?? 'Unknown'}% of the reported reference supply.`, 'partially_supported'))
  const missing = [
    'Token necessity and holder-benefit relationship',
    stablecoin ? 'Reserve, redemption, and issuer-control evidence' : wrapped ? 'Backing, custody, and redemption evidence' : lst ? 'Withdrawal, operator, slashing, and liquidity evidence' : riskCopy,
  ]
  return {
    schemaVersion: 'premium-v2-tokenomics-quality-experience-v1',
    generatedAt: FIXED_TIME,
    canonicalAssetId,
    identity: { symbol: assetSymbol, name },
    representation: { representationType, selectedNetwork: network, selectedContract: contract },
    family: { familyId, familyLabel: family.label },
    status: lowCoverage ? 'degraded' : 'partial',
    tokenomicsQuality: {
      tokenomicsScoreValue: lowCoverage ? null : tokenomics.tokenomicsIntegrityScore,
      tokenomicsScoreDisplayState: lowCoverage ? 'withheld' : 'displayed',
      tokenomicsScoreLabel: lowCoverage ? 'Score withheld' : `${tokenomics.tokenomicsIntegrityScore} / 100`,
      scoreWithheldReason: lowCoverage ? 'Current coverage does not support a displayable tokenomics score.' : null,
      qualityBand: lowCoverage ? 'Limited coverage' : 'Partial',
      conciseQualityReason: tokenomics.primaryTokenomicsStrength,
      strongestDimension: tokenomics.primaryTokenomicsStrength,
      weakestDimension: riskCopy,
      criticalBlocker: missing[0],
      scoreLimitations: ['This score evaluates token-economic structure, not future price performance.'],
      scoringMethodologyVersion: tokenomics.schemaVersion,
      scoringUnchangedByPresentationMilestone: true,
      evidenceCoverageState: lowCoverage ? 'low' : 'medium',
    },
    economicRole: {
      economicRoleLabel: family.role,
      economicRoleDescription: family.description,
      monetaryAssetRole: familyId === 'bitcoin_monetary_network' ? 'Primary native monetary asset' : 'No primary monetary role established',
      settlementRole: ['bitcoin_monetary_network', 'ethereum_settlement_and_gas_asset', 'payments_and_settlement_network', 'fiat_backed_stablecoin'].includes(familyId) ? 'Primary settlement role' : 'No primary settlement role established',
      gasOrResourceRole: ['ethereum_settlement_and_gas_asset', 'non_ethereum_smart_contract_platform', 'depin_resource_network', 'oracle_and_interoperability_network'].includes(familyId) ? 'Canonical gas or resource role' : 'No gas or resource role established',
      collateralRole: ['fiat_backed_stablecoin', 'wrapped_and_custodial_asset', 'liquid_staking_derivative', 'tokenized_commodity'].includes(familyId) ? 'Conditional collateral role' : 'No collateral role established',
      governanceRole: governanceApplicable ? 'Governance scope requires verification' : 'No primary governance role established',
      accessRole: familyId.includes('infrastructure') ? 'Infrastructure access role requires verification' : 'No access role established',
      stakingOrSecurityRole: stakingApplicable ? 'Security or staking role requires current evidence' : 'No staking or security role established',
      redemptionOrClaimRole: [stablecoin, wrapped, lst, familyId === 'tokenized_commodity'].some(Boolean) ? 'Conditional redemption or claim role' : 'No redemption or claim role established',
      incentiveRole: familyId === 'depin_resource_network' ? 'Provider incentive role' : 'Incentive role requires verification',
      feePaymentRole: ['bitcoin_monetary_network', 'ethereum_settlement_and_gas_asset', 'non_ethereum_smart_contract_platform', 'payments_and_settlement_network'].includes(familyId) ? 'Required native fee role' : 'No fee-payment role established',
      productRelationshipRole: family.role,
      roleAvailabilityState: lowCoverage ? 'degraded' : 'partially_supported',
      roleLimitations: [family.holderBoundary],
    },
    demandMechanisms: [{
      ...presentationItem('family-demand-1', family.mechanism, family.description),
      mechanismType: family.mechanismType,
      directness: ['bitcoin_monetary_network', 'ethereum_settlement_and_gas_asset', 'payments_and_settlement_network', 'fiat_backed_stablecoin'].includes(familyId) ? 'direct' : 'indirect',
      requiredOrOptional: ['bitcoin_monetary_network', 'ethereum_settlement_and_gas_asset', 'non_ethereum_smart_contract_platform', 'payments_and_settlement_network'].includes(familyId) ? 'required' : 'optional',
      replaceability: ['bitcoin_monetary_network', 'ethereum_settlement_and_gas_asset', 'non_ethereum_smart_contract_platform'].includes(familyId) ? 'not_replaceable' : 'replaceable',
      usageDependency: family.description,
      holderBenefitBoundary: family.holderBoundary,
    }],
    utilityAndNecessity: {
      utilityClaims: [presentationItem('utility-1', family.mechanism, family.description)],
      tokenRequired: ['bitcoin_monetary_network', 'ethereum_settlement_and_gas_asset', 'non_ethereum_smart_contract_platform', 'payments_and_settlement_network'].includes(familyId) ? true : lowCoverage ? null : false,
      tokenOptional: ['fiat_backed_stablecoin', 'wrapped_and_custodial_asset', 'liquid_staking_derivative', 'tokenized_commodity', 'meme_market_structure'].includes(familyId) ? true : lowCoverage ? null : false,
      substituteAvailable: ['fiat_backed_stablecoin', 'wrapped_and_custodial_asset', 'liquid_staking_derivative', 'tokenized_commodity', 'meme_market_structure'].includes(familyId) ? true : lowCoverage ? null : false,
      protocolCanOperateWithoutToken: familyId === 'defi_governance_token' ? null : false,
      productCanSucceedWithoutToken: ['defi_governance_token', 'rwa_hybrid_finance_token', 'rwa_infrastructure_utility'].includes(familyId) ? true : null,
      utilityEvidenceState: lowCoverage ? 'Evidence unavailable' : 'Partial',
      utilityLimitations: ['Technical utility is not economic value or enforceable holder rights.'],
    },
    holderRights: {
      governanceRights: right('governance', 'Governance rights', family.governance),
      feeRights: right('fees', 'Protocol fee rights'),
      revenueRights: right('revenue', 'Revenue rights'),
      cashFlowRights: right('cash-flow', 'Cash-flow rights'),
      redemptionRights: right('redemption', 'Redemption rights', [stablecoin, wrapped, lst, familyId === 'tokenized_commodity'].some(Boolean) ? 'conditional' : 'not_applicable'),
      collateralRights: right('collateral', 'Collateral rights', 'evidence_unavailable'),
      votingRights: right('voting', 'Voting rights', family.governance),
      upgradeRights: right('upgrade', 'Upgrade rights', family.governance),
      treasuryRights: right('treasury', 'Treasury ownership rights'),
      legalClaimRights: right('legal', 'Legal or contractual claim', [stablecoin, wrapped, familyId === 'tokenized_commodity'].some(Boolean) ? 'conditional' : 'evidence_unavailable'),
      ownershipRights: right('ownership', 'Protocol ownership rights'),
      stakingRights: right('staking', 'Staking participation rights', family.staking),
      rightsEnforceabilityState: 'Claim-specific enforceability requires primary legal or protocol evidence.',
      rightsEvidenceState: lowCoverage ? 'Evidence unavailable' : 'Partial claim-specific evidence attached',
      rightsLimitations: ['Governance participation does not establish revenue or cash-flow rights.'],
    },
    valueCapture: {
      valueCaptureMechanisms: [presentationItem('capture-1', 'No verified direct accrual', 'Current evidence does not establish a direct tokenholder-accrual mechanism.')],
      feeAccrual: 'evidence_unavailable',
      revenueAccrual: 'evidence_unavailable',
      burnAccrual: 'conditional',
      stakingAccrual: family.staking,
      treasuryAccrual: 'no_verified_link',
      collateralDemandAccrual: 'evidence_unavailable',
      redemptionAccrual: [stablecoin, wrapped, lst, familyId === 'tokenized_commodity'].some(Boolean) ? 'conditional' : 'not_applicable',
      networkDemandAccrual: 'evidence_unavailable',
      productAumRelationship: 'Product AUM does not establish token value or tokenholder rights.',
      protocolSuccessTokenSuccessLink: family.holderBoundary,
      directness: 'Evidence unavailable',
      sustainability: 'Needs verification',
      leakageOrOffset: 'Fees, rewards, treasury flows, and dilution can accrue to different actors.',
      dilutionOffset: 'No verified dilution offset is attached.',
      evidenceState: 'Evidence unavailable',
      valueCaptureLimitations: [family.holderBoundary],
    },
    governanceAndControl: {
      governanceModel: governanceApplicable ? 'Needs verification' : 'Not part of the primary mechanism',
      governanceScope: governanceApplicable ? 'Scope requires verification' : 'Not part of the primary mechanism',
      proposalRights: governanceApplicable ? 'Needs verification' : 'Not part of the primary mechanism',
      votingRights: governanceApplicable ? 'Needs verification' : 'Not part of the primary mechanism',
      delegation: governanceApplicable ? 'Needs verification' : 'Not part of the primary mechanism',
      quorum: governanceApplicable ? 'Needs verification' : 'Not part of the primary mechanism',
      execution: governanceApplicable ? 'Needs verification' : 'Not part of the primary mechanism',
      timelock: governanceApplicable ? 'Needs verification' : 'Not part of the primary mechanism',
      emergencyPowers: governanceApplicable ? 'Needs verification' : 'Protocol-specific control',
      upgradeAuthority: contract ? 'Needs verification' : 'Protocol-specific control',
      adminAuthority: contract ? 'Needs verification' : 'Protocol-specific control',
      mintAuthority: contract ? 'Needs verification' : 'Protocol-specific issuance',
      freezeAuthority: stablecoin ? 'Issuer policy requires review' : 'Needs verification',
      pauseAuthority: 'Needs verification',
      treasuryControl: 'Needs verification',
      concentration: 'Needs verification',
      participation: 'Current participation data is not attached.',
      effectiveness: 'Not assessed',
      evidenceState: lowCoverage ? 'Evidence unavailable' : 'Partial',
      limitations: ['Voting does not prove effective control or economic rights.'],
    },
    distribution: {
      categories: allocationCategories,
      initialAllocationState: allocationCategories.length ? 'Partial' : 'Evidence unavailable',
      insiderExposure: 'Not established',
      communityExposure: market.allocationAndConcentration.communityAllocation === null ? 'Not available' : `${market.allocationAndConcentration.communityAllocation}%`,
      treasuryOrFoundationExposure: 'Not available',
      unknownAllocation: 'Not available',
      coverageState: market.allocationAndConcentration.concentrationCoverage,
      measurementTimestamp: FIXED_TIME,
      currentHoldingsDistinctFromInitialAllocation: true,
      limitations: ['Initial allocation labels do not establish current beneficial ownership.'],
    },
    unlocksAndDilution: {
      remainingDilutionState: stablecoin ? 'Conventional max-supply dilution is not the primary stablecoin metric.' : wrapped ? 'Representation mint and redemption are not native monetary dilution.' : lst ? 'Derivative mint, withdrawal, and rebase mechanics are not native-asset dilution.' : market.boundedInterpretation.dilutionView,
      vestingStructure: humanizeFixture(tokenomics.vesting.data.scheduleType),
      unlockConcentrationState: humanizeFixture(market.unlocksAndEmissions.unlockRiskState),
      insiderUnlockExposure: 'Not established',
      emissionsPurpose: humanizeFixture(tokenomics.issuance.data.scheduleType),
      emissionsDependency: 'Needs verification',
      incentiveSustainability: 'Organic demand and subsidized activity remain separate.',
      dilutionOffsetMechanisms: [],
      dilutionInterpretation: market.boundedInterpretation.dilutionView,
      unlockInterpretation: market.unlocksAndEmissions.unlockInterpretation,
      evidenceState: humanizeFixture(market.unlocksAndEmissions.status),
      marketSupplyDetailAnchor: '#market-supply',
      limitations: ['Detailed schedules remain in Market & Supply.', 'Missing unlock coverage is not proof of no dilution risk.'],
    },
    issuanceAndBurn: {
      monetaryPolicyType: market.issuanceAndBurn.issuanceModel,
      issuancePurpose: stablecoin ? 'Issuer mint and redemption respond to demand and reserve operations.' : wrapped ? 'Representation mint and burn track backing and redemption.' : lst ? 'Derivative supply follows deposits, withdrawals, and exchange-rate or rebase mechanics.' : 'Protocol issuance requires family-specific interpretation.',
      grossIssuanceContext: 'Current compatible-period gross issuance is unavailable.',
      burnPurpose: market.issuanceAndBurn.burnModel,
      netIssuanceContext: market.issuanceAndBurn.economicInterpretation,
      burnOffsetsIssuance: null,
      burnSupportsScarcity: null,
      economicMeaning: market.issuanceAndBurn.economicInterpretation,
      evidenceState: humanizeFixture(market.issuanceAndBurn.status),
      marketSupplyDetailAnchor: '#market-supply',
      limitations: ['Burn does not prove deflation or value capture without compatible net-issuance evidence.'],
    },
    treasuryAndIncentives: {
      treasuryAssets: 'Not available',
      treasuryTokenShare: 'Not available',
      treasuryControl: 'Needs verification',
      treasuryUse: 'Needs verification',
      incentivePrograms: [],
      liquidityMining: 'Needs verification',
      stakingIncentives: stakingApplicable ? 'Needs source and dilution context' : 'Not relevant for this asset family',
      ecosystemGrants: 'Needs verification',
      validatorOrOperatorRewards: stakingApplicable ? 'Needs verification' : 'Not relevant for this asset family',
      emissionsFunding: 'Not available',
      incentiveDuration: 'Not available',
      incentiveDependency: 'Organic demand and subsidized activity remain separate.',
      treasuryRunway: 'Not available',
      sustainabilityState: 'Needs current treasury, emissions, incentive, and usage evidence.',
      evidenceState: 'Evidence unavailable',
      limitations: ['Treasury assets are not holder assets.'],
    },
    stakingAndYieldBoundary: {
      stakingRole: stakingApplicable ? 'Security or staking role requires current evidence' : 'Not relevant for this asset family',
      stakingRequirement: stakingApplicable ? 'Mechanism-dependent' : 'Not relevant for this asset family',
      stakingYield: stakingApplicable ? 'No canonical yield rate is presented here.' : 'Not relevant for this asset family',
      nominalYield: stakingApplicable ? 'Not available' : 'Not relevant for this asset family',
      realYield: stakingApplicable ? 'Not available' : 'Not relevant for this asset family',
      inflationAdjustment: stakingApplicable ? 'Required before interpreting nominal rewards' : 'Not relevant for this asset family',
      sourceOfYield: stakingApplicable ? 'Needs verification' : 'Not relevant for this asset family',
      slashingRisk: stakingApplicable ? 'Needs verification' : 'Not relevant for this asset family',
      validatorOrOperatorDependency: stakingApplicable ? 'Needs verification' : 'Not relevant for this asset family',
      lockupOrLiquidityConstraint: lst ? 'Withdrawal and secondary-liquidity constraints require current evidence.' : 'Needs verification',
      yieldSustainability: stakingApplicable ? 'Nominal rewards require issuance, cost, and dilution context.' : 'Not relevant for this asset family',
      evidenceState: stakingApplicable ? 'Evidence remains incomplete' : 'Not relevant for this asset family',
      limitations: ['Nominal yield is not real yield.', ...(stablecoin ? ['Stablecoin yield products belong to product analysis.'] : [])],
    },
    productTokenBoundary: {
      productExists: lowCoverage ? null : true,
      tokenRoleInProduct: family.role,
      productSuccessTokenSuccessRelationship: family.holderBoundary,
      directEconomicLink: 'No verified direct link',
      indirectEconomicLink: 'Needs verification',
      legalOrContractualLink: [stablecoin, wrapped, familyId === 'tokenized_commodity'].some(Boolean) ? 'Conditional' : 'Not established',
      productAum: 'Product AUM remains product context and is not token value.',
      productRevenue: 'Protocol or product revenue does not become tokenholder revenue without an explicit mechanism.',
      tokenholderAccrual: 'No verified direct tokenholder accrual',
      relationshipEvidenceState: lowCoverage ? 'Evidence unavailable' : 'Partial',
      limitations: [family.holderBoundary],
    },
    strengths: [tokenomics.primaryTokenomicsStrength],
    risks: [riskCopy],
    criticalUnknowns: missing,
    whatWouldChangeTheView: {
      improve: tokenomics.whatWouldImproveConfidence,
      weaken: [`Material confirmation or worsening of: ${riskCopy}`],
      evidenceDoesNotProve: [family.holderBoundary],
    },
    dataQuality: { status: lowCoverage ? 'Limited coverage' : 'Partial', evidenceCoverage: lowCoverage ? 'low' : 'medium', limitations: ['Fixture evidence remains bounded.'] },
    evidenceCoverage: { state: lowCoverage ? 'low' : 'medium', supportedClaimCount: 1, missingClaimCount: missing.length, reviewedEvidenceScoringActive: false },
    missingEvidence: missing.map((label, index) => ({ claimId: `gap-${index + 1}`, label, whyItMatters: 'This can change the interpretation of demand, rights, control, dilution, or sustainability.', analyticalImpact: 'The current conclusion remains bounded.', nextRequiredSource: 'Review a current primary source that directly answers this claim.', conclusionBounded: true, scoreState: lowCoverage ? 'withheld' : 'unchanged', evidenceState: 'needs_verification' })),
    nextDiligence: tokenomics.whatWouldImproveConfidence,
    provenance: [
      { owner: 'Tokenomics Quality', sourcePath: 'assetResearchResultV2.tokenomics.data', role: 'Existing tokenomics score and judgment', boundary: 'No score is recomputed.' },
      { owner: 'Market, Liquidity & Supply', sourcePath: 'assetResearchResultV2.marketLiquiditySupply', role: 'Detailed supply, issuance, burn, unlock, and allocation facts', boundary: 'Tokenomics does not duplicate the detailed dashboard.' },
    ],
    limitations: [family.holderBoundary, 'This presentation does not determine legal rights or predict price.'],
    guardrails: {
      analyticalAuthorityAdded: false,
      frontendCalculationsAllowed: false,
      protocolUsageEqualsTokenDemand: false,
      tokenDemandEqualsHolderValue: false,
      governanceEqualsCashFlowRights: false,
      productAumEqualsTokenValue: false,
      missingEvidenceIsRiskFinding: false,
      nativeTokenomicsInheritedByWrappedAsset: false,
      nativeTokenomicsInheritedByLst: false,
      stablecoinYieldInferred: false,
      scoringChanged: false,
      tokenomicsScoreChanged: false,
      confidenceChanged: false,
      verdictChanged: false,
      rankingChanged: false,
      universeMembershipChanged: false,
      providerBehaviorChanged: false,
      snapshotsEnabled: false,
      partialRefreshEnabled: false,
    },
  }
}

function humanizeFixture(value) {
  return String(value || 'unavailable').replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

export function buildV2Fixture(symbol, overrides = {}) {
  const control = ASSET_CONTROLS.find((entry) => entry[0] === symbol)
  if (!control) throw new Error(`Unknown V2 fixture ${symbol}`)
  const [assetSymbol, name, canonicalAssetId, familyLabel, representationType, thesisCopy, riskCopy] = control
  const lowCoverage = assetSymbol === 'RSS3'
  const scoreVisible = !lowCoverage
  const familyId = familyLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  const network = representationType === 'native_asset' ? name : 'Ethereum'
  const contract = representationType === 'native_asset' ? null : '0x1111111111111111111111111111111111111111'
  const marketData = {
    currentPrice: metric(assetSymbol === 'USDC' ? 1 : 100, 'usd_per_token', 'CoinGecko', 'USD'),
    marketCap: metric(1_000_000_000, 'usd', 'CoinGecko', 'USD'),
    fullyDilutedValuation: metric(1_250_000_000, 'usd', 'CoinGecko', 'USD'),
    volume24h: metric(75_000_000, 'usd', 'CoinGecko', 'USD'),
    circulatingSupply: metric(10_000_000, 'token'),
    totalSupply: metric(12_000_000, 'token'),
    maxSupply: assetSymbol === 'ETH' || assetSymbol === 'USDC' ? null : metric(15_000_000, 'token'),
    marketRank: metric(12, 'rank'),
    priceChange: { oneHourPercent: null, sixHourPercent: null, twentyFourHourPercent: metric(1.25, 'percent'), sevenDayPercent: null, thirtyDayPercent: null, oneYearPercent: null },
    allTimeHigh: null,
    allTimeHighDate: null,
    distanceFromAllTimeHighPercent: null,
    allTimeLow: null,
    allTimeLowDate: null,
    distanceFromAllTimeLowPercent: null,
    providerObservations: [],
    providerComparison: [
      { provider: 'CoinGecko', scope: 'global_asset', currentPrice: 100, marketCap: 1_000_000_000, fullyDilutedValuation: 1_250_000_000, volume24h: 75_000_000, circulatingSupply: 10_000_000, totalSupply: 12_000_000, maxSupply: 15_000_000, observedAt: FIXED_TIME, sourcePath: 'fixture.cg', providerAssetId: canonicalAssetId },
      { provider: 'CoinMarketCap', scope: 'global_asset', currentPrice: 101, marketCap: 1_070_000_000, fullyDilutedValuation: 1_300_000_000, volume24h: 74_000_000, circulatingSupply: 10_000_000, totalSupply: 12_000_000, maxSupply: 15_000_000, observedAt: FIXED_TIME, sourcePath: 'fixture.cmc', providerAssetId: 1 },
    ],
    comparisonDiagnostics: [{ comparisonId: 'market-cap-check', field: 'marketCap', leftProvider: 'CoinGecko', rightProvider: 'CoinMarketCap', absoluteDifference: 70_000_000, relativeDifferencePercent: 7, observationTimeDifferenceMs: 0, comparisonStatus: 'material_disagreement', thresholdPercent: 5 }],
    providerDisagreements: ['Comparable global market-cap observations differ materially.'],
    providerAgreementState: 'review_required',
    providerCount: 2,
    providerLimitations: ['Comparable global market-cap observations differ materially.'],
    primaryCurrency: 'USD',
    lastUpdated: FIXED_TIME,
    derivedMetrics: [],
  }
  const primaryFormula = formula('fdv_market_cap_ratio', 'FDV / Market Cap', '1.25x', 1.25, 'FDV / Market Cap')
  const result = {
    schemaVersion: '2.0.0-projection-v1',
    resultId: `fixture:${canonicalAssetId}:${FIXED_TIME}`,
    generatedAt: FIXED_TIME,
    analysisMode: 'live_full_recompute',
    freshness: freshness(),
    productStatus: 'partial',
    identity: section({ canonicalAssetId, canonicalProviderIds: { coingeckoId: canonicalAssetId, coinmarketcapId: 1 }, name, symbol: assetSymbol, logo: null, canonicalNetwork: network, analyzedNetwork: network, analyzedContract: contract, identityConfidence: lowCoverage ? 'medium' : 'high', wrongAssetRisk: 'low' }, lowCoverage ? 'partial' : 'available'),
    representation: section({ representationType, nativeOrContractAsset: representationType === 'native_asset' ? 'native' : 'contract', networkScope: [network], contractScope: contract ? [{ network, contractAddress: contract, provider: 'CoinGecko', confidence: 'high' }] : [], contractApplicability: contract ? 'applicable' : 'not_applicable_native_asset', migrationStatus: 'none_detected', wrappedOrBridgedStatus: representationType === 'wrapped_asset' ? 'wrapped_detected' : 'none_detected', representationConfidence: 'high', representationBoundary: `${name} is evaluated within its selected canonical representation.` }, lowCoverage ? 'partial' : 'available'),
    classification: section({ canonicalFamilyId: familyId, canonicalFamilyLabel: familyLabel, assetFraming: thesisCopy, canonicalQuestionGroup: `${familyId}_questions`, routeConfidence: lowCoverage ? 'medium' : 'high' }),
    historicalMarketData: section({ schemaVersion: 'historical-market-data-v1', canonicalAssetId: `asset:coingecko:${canonicalAssetId}`, providerAssetId: canonicalAssetId, representationScope: { representationType, network, contractAddress: contract, identityConfidence: lowCoverage ? 'medium' : 'high' }, network, contractAddress: contract, quoteCurrency: 'USD', quoteAsset: 'USD', quoteProviderId: 'usd', quoteNetwork: null, quoteContract: null, quoteConfidence: 'unavailable', conversionApplied: false, conversionMethod: 'none', conversionLimitations: ['No quote conversion applied.'], sourceProvider: null, sourceMethod: null, sourceEndpointClass: null, requestedRange: 'max', actualRange: { startAt: null, endAt: null }, rawInterval: 'daily', normalizedInterval: 'daily', seriesType: 'multi_series_market_chart', generatedAt: FIXED_TIME, fetchedAt: null, providerUpdatedAt: null, freshness: 'unavailable', coverage: 'unavailable', validationStatus: 'unavailable', priceSeries: { points: [], directOrDerived: 'unavailable', coverage: 'unavailable', validationStatus: 'unavailable', limitations: ['Fixture has no historical series.'] }, marketCapSeries: { points: [], directOrDerived: 'unavailable', coverage: 'unavailable', validationStatus: 'unavailable', limitations: ['Fixture has no historical series.'] }, volumeSeries: { points: [], directOrDerived: 'unavailable', coverage: 'unavailable', validationStatus: 'unavailable', limitations: ['Fixture has no historical series.'] }, historicalSupplySeries: { points: [], directOrDerived: 'unavailable', coverage: 'unavailable', validationStatus: 'unavailable', limitations: ['No historical supply series.'] }, providerFailure: { failed: false, errorClass: null, reason: null }, noSilentProviderMerge: true, noCurrentSupplyMarketCapReconstruction: true, requestLocal: true, limitations: ['Historical data is unavailable in the baseline frontend fixture.'] }, 'unavailable'),
    universeContext: section({ membershipStatus: 'not_evaluated', canonicalUniverseIds: [], canonicalSubcategoryIds: [], proposedAssetRoles: [], researchPackLineage: [], discoveryStatus: 'future_pipeline_required', rankingEligibilityStatus: 'future_pipeline_required' }, 'unavailable'),
    market: section(marketData, lowCoverage ? 'partial' : 'available'),
    liquidity: section({ volume24h: marketData.volume24h, pairLiquidity: contract ? metric(8_500_000, 'usd', 'DexScreener', 'USD') : null, venueCount: contract ? 2 : null, primaryPairs: [], venueConcentration: null, liquidityCoverage: contract ? 'partial' : 'unavailable', mappedPairCount: contract ? 1 : 0, mappedVenueCount: contract ? 2 : 0, primaryPairSelectionState: contract ? 'selected_contract_match' : 'unavailable', pairCoverageStatus: contract ? 'partial' : 'unavailable' }, 'partial'),
    tokenomics: section(tokenomicsQualityData({ supplyTruthStatus: 'available', tokenomicsIntegrityScore: 58, tokenomicsEvidenceConfidence: 'medium', circulatingSupply: 10_000_000, totalSupply: 12_000_000, maxSupply: assetSymbol === 'ETH' || assetSymbol === 'USDC' ? null : 15_000_000, circulatingPercentOfMax: assetSymbol === 'ETH' || assetSymbol === 'USDC' ? null : 66.7, remainingDilution: assetSymbol === 'ETH' || assetSymbol === 'USDC' ? null : 33.3, fdvToMarketCap: 1.25, supplyContradictions: [], maxSupplySemantics: { rawValueStatus: assetSymbol === 'ETH' || assetSymbol === 'USDC' ? 'not_reported' : 'reported_valid', semanticClassification: assetSymbol === 'ETH' ? 'adaptive_issuance' : assetSymbol === 'USDC' ? 'elastic_issuer_supply' : 'finite_cap_reported', formulaApplicability: assetSymbol === 'ETH' || assetSymbol === 'USDC' ? 'not_applicable' : 'applicable', reasoning: [] }, unlockCoverage: 'partial', nextUnlock: { date: null, percent: null, usdValue: null }, issuance: { policyStatus: 'partial', annualInflationEstimate: null, annualizedEmissions: null }, burn: { mechanismStatus: 'partial', materiality: 'unquantified', netIssuanceAfterBurn: null }, mintAuthority: contract ? 'requires_review' : 'not_applicable', adminControls: contract ? 'requires_review' : 'not_applicable', governanceSupplyRisk: 'requires_review', formulaOutputs: [primaryFormula], productFormulaOutputs: [primaryFormula, formula('volume_market_cap_ratio', 'Volume / Market Cap', '7.5%', 0.075, '24h Volume / Market Cap')], tokenomicsQuestions: [{ questionId: 'supply-credibility', question: 'Is the supply structure credible and sufficiently verified?', answer: 'Current supply facts are available, while control and future issuance evidence remains incomplete.', status: 'partial', dataUsed: ['Provider-reported circulating, total, and maximum supply.'], formulaOutputsUsed: ['FDV / Market Cap'], missingEvidence: ['Reviewed issuance and control policy.'], impact: 'Evidence coverage caps confidence.', whatWouldChange: ['Attach current policy and control evidence.'], sourceBoundary: ['Provider facts and reviewed evidence remain distinct.'] }], primaryTokenomicsStrength: 'Current supply observations are internally coherent.', primaryTokenomicsRisk: riskCopy, whatWouldImproveConfidence: ['Attach current issuance, control, and unlock evidence.'] }, { assetSymbol, canonicalAssetId, familyId, representationType, network, contract }), lowCoverage ? 'partial' : 'available'),
    protocolEconomics: section({ tvl: assetSymbol === 'UNI' ? metric(5_000_000_000, 'usd', 'DefiLlama', 'USD') : null, fees24h: assetSymbol === 'UNI' ? metric(2_000_000, 'usd', 'Token Terminal', 'USD') : null, fees7d: null, fees30d: null, revenue24h: null, revenue7d: null, revenue30d: null, volume24h: null, volume7d: null, volume30d: null, borrowing: null, activeLoans: null, stablecoinSupply: null, yieldContext: null, mappingStatus: assetSymbol === 'UNI' ? 'mapped' : 'unavailable', protocolSlug: null, tokenTerminalProjectId: null, providerObservations: [], protocolUsage: { availability: assetSymbol === 'UNI' ? 'partial' : 'missing', strength: 'partial', activeUsers24h: null, chains: [], category: null, summary: assetSymbol === 'UNI' ? 'Mapped protocol activity is visible, but it does not prove UNI tokenholder accrual.' : null }, economicActivity: { availability: assetSymbol === 'UNI' ? 'partial' : 'missing', usageEconomicsStrength: 'partial', valueCaptureStrength: 'unknown', summary: null } }, assetSymbol === 'UNI' ? 'partial' : 'not_applicable'),
    fundamentals: section(buildFundamentalsData({ assetSymbol, canonicalAssetId, familyId, familyLabel, representationType, thesisCopy, riskCopy, lowCoverage }), lowCoverage ? 'manual_review_required' : 'partial'),
    currentReality: section(buildCurrentRealityData({ assetSymbol, canonicalAssetId, name, familyId, representationType, network, contract, thesisCopy, riskCopy }), CURRENT_REALITY_SCENARIOS[assetSymbol] === 'verified' ? 'available' : 'partial'),
    valueCapture: section({ protocolSuccess: assetSymbol === 'UNI' ? 'Protocol activity is visible.' : null, tokenholderEconomicRights: assetSymbol === 'UNI' || assetSymbol === 'ONDO' || assetSymbol === 'LINK' ? 'Direct tokenholder economic accrual remains unproven.' : null, feesToToken: null, buybacks: 'unknown', burns: 'unknown', stakingEconomics: 'unknown', tokenDemand: 'partial', valueCaptureStatus: assetSymbol === 'UNI' || assetSymbol === 'ONDO' || assetSymbol === 'LINK' ? 'evidence_limited' : 'not_assessed', whatIsRealized: [], whatIsHypothetical: ['Protocol or product success does not automatically transfer to tokenholders.'], missingEvidence: [riskCopy] }, assetSymbol === 'PEPE' ? 'not_applicable' : 'partial'),
    smartMoney: section({ status: 'unavailable', accumulationSignals: [], distributionSignals: [], exchangeFlows: [], treasuryFlows: [], teamFlows: [], marketMakerFlows: [], entityCoverage: 'unavailable', alternativeExplanations: [], confidence: 'not_assessed' }, 'unavailable'),
    technicalStructure: section({ availability: 'unavailable', canonicalPair: null, availableTimeframes: [], technicalState: null, priceStructure: null, marketCapStructure: null, volumeStructure: null, relativeStrength: null, swingAnchors: [], priceFibonacci: [], marketCapFibonacci: [], supportZones: [], resistanceZones: [], confluenceZones: [], invalidationLevels: [], historicalMarketData: null, bullPotential: null, scenarioValuation: [] }, 'unavailable'),
    valuation: section({ currentMarketCap: marketData.marketCap, currentFullyDilutedValuation: marketData.fullyDilutedValuation, fdvToMarketCap: 1.25, currentSupply: marketData.circulatingSupply, currentSupplyDerivedMetrics: [primaryFormula], projectedSupply: { status: 'unavailable', reason: '', data: null, requiredInputs: [] }, scenarios: { status: 'unavailable', reason: '', data: null, requiredInputs: [] }, targetMarketCaps: { status: 'unavailable', reason: '', data: null, requiredInputs: [] }, impliedPrices: { status: 'unavailable', reason: '', data: null, requiredInputs: [] }, dilutionImpact: { status: 'unavailable', reason: '', data: null, requiredInputs: [] }, peerComparisons: { status: 'unavailable', reason: '', data: null, requiredInputs: [] }, riskAdjustedRange: { status: 'unavailable', reason: '', data: null, requiredInputs: [] } }, 'partial'),
    risks: section({ topRisks: [riskCopy], primaryBlocker: riskCopy, missingCriticalEvidence: [riskCopy], providerRisks: [], dataQualityRisks: [], representationRisks: [], familySpecificRisks: [riskCopy] }, 'partial', { whatIsSupported: [thesisCopy] }),
    thesis: section({ thesisSummary: thesisCopy, supportingConditions: [thesisCopy], antiThesis: [riskCopy], invalidationConditions: [riskCopy], whatWouldChangeTheThesis: ['Attach current family-specific evidence.'], strongestSupportingEvidence: [thesisCopy], keyAssumptions: [thesisCopy], falsificationSignals: [riskCopy], strongestCounterargument: riskCopy, boundary: 'Price movement alone is not thesis falsification.', sourceSchemaVersion: 'thesis-fundamentals-engine-v1' }, 'partial'),
    evidenceSummary: section({ eligibleEvidenceCount: lowCoverage ? 1 : 5, reviewedEvidenceCount: 0, providerFactCount: 8, derivedMetricCount: 2, missingCriticalEvidenceCount: 1, evidenceConfidence: lowCoverage ? 'low' : 'medium', sourceCoverage: ['Current market and supply observations.'], evidenceBoundarySummary: 'Current observations support bounded analysis; important source review remains open.' }, 'partial'),
    decision: section({
      verdictClass: lowCoverage ? 'not_allocation_ready' : 'watchlist',
      verdictLabel: lowCoverage ? 'Not Allocation-Ready' : 'Watchlist / Conditional',
      scoreDisplayState: lowCoverage ? 'withhold_fundamental_score' : 'show_score_with_coverage_caveat',
      displayedScore: scoreVisible ? 62 : null,
      auditScore: 42,
      scoreWithheldReason: scoreVisible ? null : 'Critical family evidence is incomplete.',
      confidence: lowCoverage ? 28 : 61,
      confidenceLabel: lowCoverage ? 'low' : 'medium',
      allocationReadiness: lowCoverage ? 'Preliminary risk screen only' : 'Family analysis with open evidence checks',
      decisionSummary: thesisCopy,
      institutionalThesis: thesisCopy,
      strongestSupport: thesisCopy,
      primarySupportedRisk: riskCopy,
      criticalUnknown: riskCopy,
      whatWouldChangeTheView: 'Attach current family-specific evidence and resolve the primary open diligence question.',
      weakestArea: riskCopy,
      blockers: [riskCopy],
      nextDiligence: ['Attach current family-specific evidence.'],
      researchBoundary: 'Research support only. This is not financial advice.',
    }, lowCoverage ? 'partial' : 'available'),
    sourceHealth: section({ expectedProviders: ['CoinGecko', 'CoinMarketCap', 'DexScreener'], availableProviders: ['CoinGecko', 'CoinMarketCap'], unavailableProviders: ['DexScreener'], providerAvailability: [], providerFailures: [], degradedSections: lowCoverage ? ['fundamentals'] : [], staleProviders: [], mismatchedProviders: [], lastSuccessfulObservation: FIXED_TIME, oldestUsedObservation: FIXED_TIME, providerCoverageStatus: lowCoverage ? 'partial' : 'available', fieldDisagreementCount: 1, identityMismatchCount: 0, contractScopeMismatchCount: 0, freshnessWarnings: [], sourceLimitations: ['Pair-level liquidity is incomplete.'] }, lowCoverage ? 'partial' : 'available'),
    productAvailability: section({ assetDeepDive: lowCoverage ? 'partial' : 'available', marketData: 'available', supplyData: 'available', liquidity: 'partial', tokenomics: 'partial', protocolEconomics: 'not_applicable', providerComparison: 'available', sourceFreshness: 'available', fundamentals: lowCoverage ? 'manual_review_required' : 'partial', currentReality: 'partial', valueCapture: 'partial', smartMoney: 'future_milestone', technicalStructure: 'future_milestone', priceFibonacci: 'future_milestone', marketCapFibonacci: 'future_milestone', projectedSupply: 'future_milestone', valuationScenarios: 'future_milestone', universeDiscovery: 'future_milestone', universeMembership: 'future_milestone', opportunityRanking: 'future_milestone', portfolioRoles: 'future_milestone', protectedReport: 'available' }, 'partial'),
    limitations: ['Provider coverage remains uneven.'],
  }
  result.marketLiquiditySupply = buildMarketLiquiditySupplyPresentationFixture({
    assetSymbol,
    canonicalAssetId,
    name,
    familyId,
    representationType,
    network,
    contract,
    riskCopy,
    lowCoverage,
  })
  result.tokenomicsQualityPresentation = buildTokenomicsQualityPresentationFixture({
    assetSymbol,
    canonicalAssetId,
    name,
    familyId,
    representationType,
    network,
    contract,
    riskCopy,
    tokenomics: result.tokenomics.data,
    market: result.marketLiquiditySupply,
  })
  result.thesisFundamentalsPresentation = buildThesisFundamentalsPresentationFixture({
    result,
    assetSymbol,
    canonicalAssetId,
    name,
    familyId,
    familyLabel,
    representationType,
    network,
    contract,
  })
  return { ...result, ...overrides }
}

export function buildV2Response(symbol, options = {}) {
  const result = buildV2Fixture(symbol, options.resultOverrides)
  return {
    assetResearchResultV2: options.omitRoot ? undefined : result,
    analysis: options.omitNested ? {} : { assetResearchResultV2: options.nestedResult || result },
  }
}
