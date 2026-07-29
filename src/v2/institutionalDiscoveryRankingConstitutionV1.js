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

export function normalizeInstitutionalDiscoveryRankingConstitution(payload) {
  const root = isRecord(payload) ? payload : {}
  const analysis = isRecord(root.analysis) ? root.analysis : {}
  const candidate = isRecord(root.institutionalDiscoveryDeterministicRankingConstitution)
    ? root.institutionalDiscoveryDeterministicRankingConstitution
    : isRecord(analysis.institutionalDiscoveryDeterministicRankingConstitution)
      ? analysis.institutionalDiscoveryDeterministicRankingConstitution
      : root.contractId === 'institutionalDiscoveryDeterministicRankingConstitution'
        ? root
        : null

  if (!candidate) return null
  if (
    candidate.contractId !== 'institutionalDiscoveryDeterministicRankingConstitution'
    || candidate.constitutionVersion !== '1.0.0'
    || !Array.isArray(candidate.universes)
    || candidate.universes.length !== 2
    || !Array.isArray(candidate.formulaRegistry)
    || !isRecord(candidate.activationState)
    || candidate.activationState.runtimeScoringActive !== false
    || candidate.activationState.runtimeRankingActive !== false
  ) {
    return null
  }

  return deepFreeze({
    ...candidate,
    diagnosticSummary: {
      constitutionVersion: candidate.constitutionVersion,
      universeIds: candidate.universes.map((universe) => universe?.universeId).filter(Boolean),
      cohortCount: candidate.universes.reduce(
        (total, universe) => total + (Array.isArray(universe?.branches)
          ? universe.branches.reduce(
            (branchTotal, branch) => branchTotal + (Array.isArray(branch?.cohorts) ? branch.cohorts.length : 0),
            0,
          )
          : 0),
        0,
      ),
      formulaCount: candidate.formulaRegistry.length,
      eligibilityPolicyCount: Array.isArray(candidate.eligibilityPolicy?.states)
        ? candidate.eligibilityPolicy.states.length
        : 0,
      comparabilityPolicyCount: Array.isArray(candidate.comparabilityMatrix)
        ? candidate.comparabilityMatrix.length
        : 0,
      activationState: 'diagnostic_only_not_runtime_active',
      runtimeScoreChanged: Boolean(candidate.guardrails?.overallScoreChanged),
      runtimeRankChanged: Boolean(candidate.guardrails?.currentRankingOrderChanged),
      runtimeAiAuthority: candidate.doctrine?.runtimeAiAuthority || 'unknown',
      anthropicIntegrated: Boolean(candidate.guardrails?.anthropicIntegrated),
      providerBehaviorChanged: Boolean(candidate.guardrails?.providerBehaviorChanged),
      snapshotsEnabled: Boolean(candidate.guardrails?.snapshotsEnabled),
      incrementalReuseEnabled: Boolean(candidate.guardrails?.['partial' + 'RefreshEnabled']),
    },
  })
}
