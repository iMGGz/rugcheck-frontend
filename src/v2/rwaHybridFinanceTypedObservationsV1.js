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

export function normalizeRwaHybridFinanceTypedObservations(payload) {
  const root = isRecord(payload) ? payload : {}
  const analysis = isRecord(root.analysis) ? root.analysis : {}
  const candidate = isRecord(root.rwaHybridFinanceTypedObservationBackbone)
    ? root.rwaHybridFinanceTypedObservationBackbone
    : isRecord(analysis.rwaHybridFinanceTypedObservationBackbone)
      ? analysis.rwaHybridFinanceTypedObservationBackbone
      : root.contractId === 'rwaHybridFinanceTypedObservationBackbone'
        ? root
        : null

  if (!candidate) return null
  const activation = record(candidate.activationState)
  const guardrails = record(candidate.guardrails)
  const summary = record(candidate.diagnosticSummary)
  const coverage = record(candidate.observationCoverage)
  const contamination = record(summary.contaminationFindingCounts)
  if (
    candidate.contractId !== 'rwaHybridFinanceTypedObservationBackbone'
    || candidate.schemaVersion !== '1.0.0'
    || activation.typedObservationContractActive !== true
    || activation.diagnosticOnly !== true
    || activation.runtimeScoringActive !== false
    || activation.runtimeRankingActive !== false
    || activation.evidencePromotionActive !== false
    || activation.newProviderCallsActive !== false
    || activation.runtimeAiActive !== false
    || guardrails.anthropicIntegrated !== false
  ) {
    return null
  }

  return deepFreeze({
    contractId: candidate.contractId,
    schemaVersion: candidate.schemaVersion,
    generatedAt: candidate.generatedAt,
    constitutionVersion: candidate.constitutionVersion,
    sourceMapVersion: candidate.sourceMapVersion,
    identityBackboneVersion: candidate.identityBackboneVersion,
    activationState: { ...activation },
    guardrails: { ...guardrails },
    knownLimitations: strings(candidate.knownLimitations),
    nextResumePointer: candidate.nextResumePointer,
    diagnosticSummary: {
      version: summary.version || candidate.schemaVersion,
      prerequisiteVersions: { ...record(summary.prerequisiteVersions) },
      applicableObservationTypeCount: number(
        summary.applicableObservationTypeCount ?? coverage.applicableObservationTypeCount,
      ),
      registeredObservationTypeCount: number(coverage.registeredObservationTypeCount),
      rawInputCount: number(summary.rawInputCount),
      acceptedObservationCount: number(summary.acceptedObservationCount),
      acceptedWithLimitsCount: number(summary.acceptedWithLimitsCount),
      contextualOnlyCount: number(summary.contextualOnlyCount),
      rejectedCount: number(summary.rejectedCount),
      staleCount: number(summary.staleCount),
      conflictingCount: number(summary.conflictingCount),
      unavailableCount: number(summary.unavailableCount),
      blockedIdentityCount: number(summary.blockedIdentityCount),
      blockedAuthorityCount: number(summary.blockedAuthorityCount),
      branchCoverage: strings(summary.branchCoverage),
      cohortCoverage: strings(summary.cohortCoverage),
      formulaReadiness: { ...record(summary.formulaReadiness) },
      eligibilityReadiness: { ...record(summary.eligibilityReadiness) },
      contaminationFindingCounts: {
        productToken: number(contamination.productToken),
        wrapperUnderlying: number(contamination.wrapperUnderlying),
        fundShareClass: number(contamination.fundShareClass),
        protocolStrategy: number(contamination.protocolStrategy),
        issuerCustodian: number(contamination.issuerCustodian),
        prohibitedInheritance: number(contamination.prohibitedInheritance),
        generatedText: number(contamination.generatedText),
        sourceCandidate: number(contamination.sourceCandidate),
        crossFamily: number(contamination.crossFamily),
      },
      tokenSpecificBranchCount: number(guardrails.tokenSpecificRuntimeBranchCount),
      diagnosticOnly: activation.diagnosticOnly === true,
      providerCallsActive: activation.newProviderCallsActive === true,
      scoringActive: activation.runtimeScoringActive === true,
      rankingActive: activation.runtimeRankingActive === true,
      evidencePromotionActive: activation.evidencePromotionActive === true,
      runtimeAiActive: activation.runtimeAiActive === true,
      anthropicIntegrated: guardrails.anthropicIntegrated === true,
      scoreChanged: guardrails.scoreChanged === true,
      rankChanged: guardrails.currentRankingOrderChanged === true,
      providerBehaviorChanged: guardrails.providerBehaviorChanged === true,
    },
  })
}
