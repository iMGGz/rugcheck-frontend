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

export function normalizeCanonicalInstitutionalIdentityBackbone(payload) {
  const root = isRecord(payload) ? payload : {}
  const analysis = isRecord(root.analysis) ? root.analysis : {}
  const candidate = isRecord(root.canonicalInstitutionalIdentityBackbone)
    ? root.canonicalInstitutionalIdentityBackbone
    : isRecord(analysis.canonicalInstitutionalIdentityBackbone)
      ? analysis.canonicalInstitutionalIdentityBackbone
      : root.contractId === 'canonicalInstitutionalIdentityBackbone'
        ? root
        : null

  if (!candidate) return null
  const activation = isRecord(candidate.activationState) ? candidate.activationState : {}
  if (
    candidate.contractId !== 'canonicalInstitutionalIdentityBackbone'
    || candidate.schemaVersion !== '1.0.0'
    || !Array.isArray(candidate.entityTypes)
    || !Array.isArray(candidate.canonicalEntities)
    || !Array.isArray(candidate.relationshipTypes)
    || !Array.isArray(candidate.relationships)
    || activation.identityContractActive !== true
    || activation.productRelationshipContractActive !== true
    || activation.providerCallsActive !== false
    || activation.evidencePromotionActive !== false
    || activation.scoringActive !== false
    || activation.rankingActive !== false
    || activation.runtimeAiActive !== false
  ) {
    return null
  }

  const coverage = isRecord(candidate.coverageAssessment)
    ? candidate.coverageAssessment
    : {}
  const guardrails = isRecord(candidate.guardrails) ? candidate.guardrails : {}

  return deepFreeze({
    contractId: candidate.contractId,
    schemaVersion: candidate.schemaVersion,
    generatedAt: candidate.generatedAt,
    identityAuthorityVersion: candidate.identityAuthorityVersion,
    activationState: { ...activation },
    coverageAssessment: { ...coverage },
    guardrails: { ...guardrails },
    knownLimitations: Array.isArray(candidate.knownLimitations)
      ? [...candidate.knownLimitations]
      : [],
    protectedReportChanges: Array.isArray(candidate.protectedReportChanges)
      ? [...candidate.protectedReportChanges]
      : [],
    nextResumePointer: candidate.nextResumePointer,
    diagnosticSummary: {
      entityTypeCount: candidate.entityTypes.length,
      canonicalEntityFixtureCount: candidate.canonicalEntities.length,
      externalIdentifierTypeCount: Array.isArray(candidate.externalIdentifierTypes)
        ? candidate.externalIdentifierTypes.length
        : 0,
      externalIdentifierCount: Array.isArray(candidate.externalIdentifiers)
        ? candidate.externalIdentifiers.length
        : 0,
      aliasTypeCount: Array.isArray(candidate.aliasTypes)
        ? candidate.aliasTypes.length
        : 0,
      aliasCount: Array.isArray(candidate.aliases) ? candidate.aliases.length : 0,
      relationshipTypeCount: candidate.relationshipTypes.length,
      relationshipCount: candidate.relationships.length,
      lifecycleStateCount: Array.isArray(candidate.lifecyclePolicy)
        ? candidate.lifecyclePolicy.length
        : 0,
      migrationTypeCount: Array.isArray(candidate.migrationPolicy)
        ? candidate.migrationPolicy.length
        : 0,
      blockedIdentityTypeCount: Array.isArray(candidate.blockedIdentities)
        ? candidate.blockedIdentities.length
        : 0,
      fixtureCoverageCount: Array.isArray(candidate.fixtureCoverage)
        ? candidate.fixtureCoverage.length
        : 0,
      confirmedIdentityCount: Number(coverage.confirmedIdentityCount || 0),
      provisionalIdentityCount: Number(coverage.provisionalIdentityCount || 0),
      conflictingIdentityCount: Number(coverage.conflictingIdentityCount || 0),
      blockedIdentityCount: Number(coverage.blockedIdentityCount || 0),
      productTokenConflationFindingCount: Number(coverage.productTokenConflationFindingCount || 0),
      wrapperUnderlyingConflationFindingCount: Number(coverage.wrapperUnderlyingConflationFindingCount || 0),
      fundShareClassConflationFindingCount: Number(coverage.fundShareClassConflationFindingCount || 0),
      protocolStrategyConflationFindingCount: Number(coverage.protocolStrategyConflationFindingCount || 0),
      issuerCustodianConflationFindingCount: Number(coverage.issuerCustodianConflationFindingCount || 0),
      prohibitedObservationInheritanceFindingCount: Number(coverage.prohibitedObservationInheritanceFindingCount || 0),
      migrationConflictCount: Number(coverage.migrationConflictCount || 0),
      lifecycleConflictCount: Number(coverage.lifecycleConflictCount || 0),
      identityAuthorityState: coverage.status || 'unavailable',
      diagnosticOnly: activation.diagnosticOnly === true,
      providerCallsActive: activation.providerCallsActive === true,
      evidencePromotionActive: activation.evidencePromotionActive === true,
      scoringActive: activation.scoringActive === true,
      rankingActive: activation.rankingActive === true,
      runtimeAiActive: activation.runtimeAiActive === true,
      anthropicIntegrated: guardrails.anthropicIntegrated === true,
      scoreChanged: guardrails.overallScoreChanged === true,
      rankingChanged: guardrails.currentRankingOrderChanged === true,
      providerBehaviorChanged: guardrails.providerBehaviorChanged === true,
    },
  })
}
