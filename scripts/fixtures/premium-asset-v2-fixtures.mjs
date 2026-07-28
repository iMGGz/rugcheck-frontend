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
  return { ...result, ...overrides }
}

export function buildV2Response(symbol, options = {}) {
  const result = buildV2Fixture(symbol, options.resultOverrides)
  return {
    assetResearchResultV2: options.omitRoot ? undefined : result,
    analysis: options.omitNested ? {} : { assetResearchResultV2: options.nestedResult || result },
  }
}
