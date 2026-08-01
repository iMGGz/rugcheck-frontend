function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    Object.values(value).forEach(deepFreeze)
  }
  return value
}

function record(value) {
  return isRecord(value) ? value : {}
}

function strings(value) {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === 'string') : []
}

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function normalizeStablecoinsYieldTypedObservations(payload) {
  const root = isRecord(payload) ? payload : {}
  const analysis = isRecord(root.analysis) ? root.analysis : {}
  const candidate = isRecord(root.stablecoinsYieldTypedObservationBackbone)
    ? root.stablecoinsYieldTypedObservationBackbone
    : isRecord(analysis.stablecoinsYieldTypedObservationBackbone)
      ? analysis.stablecoinsYieldTypedObservationBackbone
      : root.contractId === 'stablecoinsYieldTypedObservationBackbone'
        ? root
        : null

  if (!candidate) return null
  const activation = record(candidate.activationState)
  const guardrails = record(candidate.guardrails)
  const summary = record(candidate.diagnosticSummary)
  const coverage = record(candidate.observationCoverage)
  const contamination = record(summary.contaminationFindingCounts)
  if (
    candidate.contractId !== 'stablecoinsYieldTypedObservationBackbone'
    || candidate.schemaVersion !== '1.0.0'
    || activation.typedObservationContractActive !== true
    || activation.diagnosticOnly !== true
    || activation.newProviderCallsActive !== false
    || activation.evidencePromotionActive !== false
    || activation.stablecoinScoringActive !== false
    || activation.yieldScoringActive !== false
    || activation.riskAdjustedYieldScoringActive !== false
    || activation.runtimeRankingActive !== false
    || activation.runtimeAiActive !== false
    || guardrails.anthropicIntegrated !== false
  ) return null

  return deepFreeze({
    contractId: candidate.contractId,
    schemaVersion: candidate.schemaVersion,
    generatedAt: candidate.generatedAt,
    constitutionVersion: candidate.constitutionVersion,
    sourceMapVersion: candidate.sourceMapVersion,
    identityBackboneVersion: candidate.identityBackboneVersion,
    sharedObservationPrimitiveVersion: candidate.sharedObservationPrimitiveVersion,
    activationState: { ...activation },
    guardrails: { ...guardrails },
    knownLimitations: strings(candidate.knownLimitations),
    nextResumePointer: candidate.nextResumePointer,
    diagnosticSummary: {
      version: summary.version || candidate.schemaVersion,
      prerequisiteVersions: { ...record(summary.prerequisiteVersions) },
      applicableObservationTypeCount: number(summary.applicableObservationTypeCount ?? coverage.applicableObservationTypeCount),
      registeredObservationTypeCount: number(coverage.registeredObservationTypeCount),
      rawInputCount: number(summary.rawInputCount),
      acceptedObservationCount: number(summary.acceptedObservationCount),
      acceptedWithLimitsCount: number(summary.acceptedWithLimitsCount),
      contextualOnlyCount: number(summary.contextualOnlyCount),
      rejectedCount: number(summary.rejectedCount),
      staleCount: number(summary.staleCount),
      expiredCount: number(coverage.expiredObservationCount),
      conflictingCount: number(summary.conflictingCount),
      unavailableCount: number(summary.unavailableCount),
      blockedIdentityCount: number(summary.blockedIdentityCount),
      blockedRelationshipCount: number(summary.blockedRelationshipCount),
      blockedAuthorityCount: number(summary.blockedAuthorityCount),
      blockedYieldSemanticsCount: number(coverage.blockedYieldSemanticsCount),
      blockedBenchmarkCount: number(coverage.blockedBenchmarkCount),
      branchCoverage: strings(summary.branchCoverage),
      cohortCoverage: strings(summary.cohortCoverage),
      formulaReadiness: { ...record(summary.formulaReadiness) },
      eligibilityReadiness: { ...record(summary.eligibilityReadiness) },
      contaminationFindingCounts: {
        baseWrapper: number(contamination.baseWrapperContaminationFindings ?? contamination.baseWrapper),
        stablecoinPosition: number(contamination.stablecoinPositionContaminationFindings ?? contamination.stablecoinPosition),
        protocolStrategy: number(contamination.protocolStrategyContaminationFindings ?? contamination.protocolStrategy),
        vaultShare: number(contamination.vaultShareContaminationFindings ?? contamination.vaultShare),
        poolLp: number(contamination.poolLpContaminationFindings ?? contamination.poolLp),
        principalYieldToken: number(contamination.principalYieldTokenContaminationFindings ?? contamination.principalYieldToken),
        reserveScope: number(contamination.reserveScopeContaminationFindings ?? contamination.reserveScope),
        yieldSemantics: number(contamination.yieldSemanticsContaminationFindings ?? contamination.yieldSemantics),
        generatedText: number(contamination.generatedTextObservationFindings ?? contamination.generatedText),
        sourceCandidate: number(contamination.sourceCandidateObservationFindings ?? contamination.sourceCandidate),
        crossUniverseDuplicate: number(contamination.crossUniverseDuplicateFindings ?? contamination.crossUniverseDuplicate),
      },
      tokenSpecificBranchCount: number(guardrails.tokenSpecificRuntimeBranchCount),
      diagnosticOnly: true,
      providerCallsActive: false,
      stablecoinScoringActive: false,
      yieldScoringActive: false,
      riskAdjustedYieldScoringActive: false,
      rankingActive: false,
      evidencePromotionActive: false,
      runtimeAiActive: false,
      anthropicIntegrated: false,
      scoreChanged: guardrails.scoreChanged === true,
      rankChanged: guardrails.currentRankingOrderChanged === true,
      providerBehaviorChanged: guardrails.providerBehaviorChanged === true,
    },
  })
}
