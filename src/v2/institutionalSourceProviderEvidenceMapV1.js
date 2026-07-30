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

function countBy(values, predicate) {
  return Array.isArray(values) ? values.filter(predicate).length : 0
}

export function normalizeInstitutionalSourceProviderEvidenceMap(payload) {
  const root = isRecord(payload) ? payload : {}
  const analysis = isRecord(root.analysis) ? root.analysis : {}
  const candidate = isRecord(root.institutionalSourceProviderEvidenceMap)
    ? root.institutionalSourceProviderEvidenceMap
    : isRecord(analysis.institutionalSourceProviderEvidenceMap)
      ? analysis.institutionalSourceProviderEvidenceMap
      : root.contractId === 'institutionalSourceProviderEvidenceMap'
        ? root
        : null

  if (!candidate) return null
  const activation = isRecord(candidate.activationState) ? candidate.activationState : {}
  if (
    candidate.contractId !== 'institutionalSourceProviderEvidenceMap'
    || candidate.schemaVersion !== '1.0.0'
    || !Array.isArray(candidate.observationMappings)
    || !Array.isArray(candidate.formulaInputCoverage)
    || !Array.isArray(candidate.eligibilityGateMappings)
    || activation.providerCallsActive !== false
    || activation.scoringActive !== false
    || activation.rankingActive !== false
    || activation.evidencePromotionActive !== false
    || activation.runtimeAiActive !== false
  ) {
    return null
  }

  const readiness = isRecord(candidate.implementationReadinessSummary)
    ? candidate.implementationReadinessSummary
    : {}
  const blocked = Array.isArray(candidate.blockedObservations)
    ? candidate.blockedObservations
    : []
  const formulas = candidate.formulaInputCoverage

  return deepFreeze({
    ...candidate,
    diagnosticSummary: {
      mapVersion: candidate.schemaVersion,
      constitutionVersion: candidate.constitutionVersion || 'unavailable',
      mappedObservationCount: Number(readiness.mappedObservationTypeCount || candidate.observationMappings.length),
      observationCount: Number(readiness.observationTypeCount || candidate.observationMappings.length),
      mappedFormulaCount: Number(readiness.mappedFormulaCount || formulas.length),
      formulaCount: Number(readiness.formulaCount || formulas.length),
      mappedEligibilityGateCount: Number(
        readiness.mappedEligibilityGateCount || candidate.eligibilityGateMappings.length,
      ),
      eligibilityGateCount: Number(
        readiness.eligibilityGateCount || candidate.eligibilityGateMappings.length,
      ),
      sourceClassCount: Array.isArray(candidate.sourceClasses) ? candidate.sourceClasses.length : 0,
      providerCount: Array.isArray(candidate.providers) ? candidate.providers.length : 0,
      currentIntegratedProviderCount: Number(readiness.currentIntegratedProviderCount || 0),
      futureProviderCandidateCount: Number(readiness.futureProviderCandidateCount || 0),
      officialDocumentRequirementCount: countBy(
        candidate.observationMappings,
        (entry) => entry?.currentAvailability === 'manual_document_only',
      ),
      licensingBlockerCount: countBy(
        blocked,
        (entry) => /licens|commercial_access/i.test(`${entry?.blockerType || ''} ${entry?.blockerDescription || ''}`),
      ),
      identityBlockerCount: countBy(
        blocked,
        (entry) => /identity|share_class|wrapper_relationship/i.test(`${entry?.blockerType || ''} ${entry?.blockerDescription || ''}`),
      ),
      legalBlockerCount: countBy(
        blocked,
        (entry) => /legal|redemption_terms|custody|reserve/i.test(`${entry?.blockerType || ''} ${entry?.blockerDescription || ''}`),
      ),
      yieldBlockerCount: countBy(
        blocked,
        (entry) => /yield|fee_structure|benchmark/i.test(`${entry?.blockerType || ''} ${entry?.blockerDescription || ''}`),
      ),
      currentlyComputableFormulaCount: countBy(
        formulas,
        (entry) => ['fully_computable_currently', 'computable_with_current_limits'].includes(entry?.computableCurrentState),
      ),
      blockedFormulaCount: countBy(
        formulas,
        (entry) => !['fully_computable_currently', 'computable_with_current_limits'].includes(entry?.computableCurrentState),
      ),
      priorityIntegrations: Array.isArray(candidate.integrationPriorities)
        ? candidate.integrationPriorities
          .filter((entry) => ['priority_0_foundational', 'priority_1_high_value'].includes(entry?.priority))
          .slice(0, 6)
          .map((entry) => entry?.sourceCapability || entry?.providerId)
          .filter(Boolean)
        : [],
      activationState: 'diagnostic_only_report_only',
      providerBehaviorChanged: Boolean(candidate.guardrails?.providerBehaviorChanged),
      evidencePromotionActive: Boolean(activation.evidencePromotionActive),
      scoringActive: Boolean(activation.scoringActive),
      rankingActive: Boolean(activation.rankingActive),
      runtimeAiActive: Boolean(activation.runtimeAiActive),
      anthropicIntegrated: Boolean(candidate.guardrails?.anthropicIntegrated),
      snapshotsEnabled: Boolean(candidate.guardrails?.snapshotsEnabled),
      incrementalReuseEnabled: Boolean(candidate.guardrails?.['partial' + 'RefreshEnabled']),
    },
  })
}
