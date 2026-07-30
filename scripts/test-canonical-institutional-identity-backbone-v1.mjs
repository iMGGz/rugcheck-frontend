import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const root = process.cwd()
const server = await createServer({
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
})

function contract() {
  return {
    schemaVersion: '1.0.0',
    contractId: 'canonicalInstitutionalIdentityBackbone',
    generatedAt: 'deterministic',
    identityAuthorityVersion: 'canonical-institutional-identity-authority-v1',
    activationState: {
      diagnosticOnly: true,
      identityContractActive: true,
      productRelationshipContractActive: true,
      providerCallsActive: false,
      evidencePromotionActive: false,
      scoringActive: false,
      rankingActive: false,
      runtimeAiActive: false,
    },
    entityTypes: [{ entityTypeId: 'product' }, { entityTypeId: 'governance_token' }],
    canonicalEntities: [
      { canonicalEntityId: 'product:registry:product-fixture', immutableHash: 'internal-only' },
      { canonicalEntityId: 'governance_token:registry:token-fixture', immutableHash: 'internal-only' },
    ],
    externalIdentifierTypes: [{ identifierType: 'internal_fixture_id' }],
    externalIdentifiers: [{ identifierType: 'internal_fixture_id' }],
    aliasTypes: [{ aliasType: 'ticker' }],
    aliases: [{ alias: 'TEST' }],
    relationshipTypes: [{ relationshipTypeId: 'governance_token_of' }],
    relationships: [{ relationshipId: 'relationship:registry:fixture' }],
    lifecyclePolicy: [{ lifecycleState: 'active' }],
    migrationPolicy: [{ migrationType: 'contract_migration' }],
    blockedIdentities: [{ blockerType: 'symbol_ambiguous' }],
    fixtureCoverage: [{ fixtureId: 'fixture:test' }],
    coverageAssessment: {
      status: 'PASS_WITH_DOCUMENTED_IDENTITY_GAPS',
      confirmedIdentityCount: 1,
      provisionalIdentityCount: 1,
      conflictingIdentityCount: 0,
      blockedIdentityCount: 1,
      productTokenConflationFindingCount: 0,
      wrapperUnderlyingConflationFindingCount: 0,
      fundShareClassConflationFindingCount: 0,
      protocolStrategyConflationFindingCount: 0,
      issuerCustodianConflationFindingCount: 0,
      prohibitedObservationInheritanceFindingCount: 0,
      migrationConflictCount: 0,
      lifecycleConflictCount: 0,
    },
    guardrails: {
      overallScoreChanged: false,
      currentRankingOrderChanged: false,
      providerBehaviorChanged: false,
      anthropicIntegrated: false,
      tokenSpecificBackendRuntimeBranchCount: 0,
      tokenSpecificFrontendRuntimeBranchCount: 0,
    },
    protectedReportChanges: [],
    knownLimitations: ['Diagnostic identity fixtures only.'],
    nextResumePointer: 'RWA & Hybrid Finance Typed Observation Backbone v1',
  }
}

try {
  const normalizer = await server.ssrLoadModule(
    '/src/v2/canonicalInstitutionalIdentityBackboneV1.js',
  )
  const researchUtils = await server.ssrLoadModule(
    '/src/components/research/researchUtils.js',
  )

  const rootNormalized = normalizer.normalizeCanonicalInstitutionalIdentityBackbone({
    canonicalInstitutionalIdentityBackbone: contract(),
  })
  const analysisNormalized = normalizer.normalizeCanonicalInstitutionalIdentityBackbone({
    analysis: { canonicalInstitutionalIdentityBackbone: contract() },
  })
  const directNormalized = normalizer.normalizeCanonicalInstitutionalIdentityBackbone(contract())

  for (const normalized of [rootNormalized, analysisNormalized, directNormalized]) {
    assert.ok(normalized)
    assert.equal(Object.isFrozen(normalized), true)
    assert.equal(Object.isFrozen(normalized.diagnosticSummary), true)
    assert.equal(normalized.diagnosticSummary.entityTypeCount, 2)
    assert.equal(normalized.diagnosticSummary.canonicalEntityFixtureCount, 2)
    assert.equal(normalized.diagnosticSummary.relationshipTypeCount, 1)
    assert.equal(normalized.diagnosticSummary.relationshipCount, 1)
    assert.equal(normalized.diagnosticSummary.blockedIdentityCount, 1)
    assert.equal(normalized.diagnosticSummary.productTokenConflationFindingCount, 0)
    assert.equal(normalized.diagnosticSummary.providerCallsActive, false)
    assert.equal(normalized.diagnosticSummary.evidencePromotionActive, false)
    assert.equal(normalized.diagnosticSummary.scoringActive, false)
    assert.equal(normalized.diagnosticSummary.rankingActive, false)
    assert.equal(normalized.diagnosticSummary.runtimeAiActive, false)
    assert.equal('canonicalEntities' in normalized, false)
    assert.equal('relationships' in normalized, false)
    assert.equal('blockedIdentities' in normalized, false)
  }

  assert.equal(normalizer.normalizeCanonicalInstitutionalIdentityBackbone(null), null)
  assert.equal(normalizer.normalizeCanonicalInstitutionalIdentityBackbone({
    ...contract(),
    activationState: {
      ...contract().activationState,
      scoringActive: true,
    },
  }), null)

  const bundle = researchUtils.buildReviewBundleText({
    asset: { symbol: 'TEST', name: 'Test Asset', coingeckoId: 'test-asset' },
    analysis: {
      canonicalInstitutionalIdentityBackbone: rootNormalized,
      scores: { overallScore: 50 },
      confidence: { level: 'low', score: 20 },
    },
    data: {
      asset: { symbol: 'TEST', name: 'Test Asset', coingeckoId: 'test-asset' },
      analysis: { canonicalInstitutionalIdentityBackbone: rootNormalized },
      scores: { overallScore: 50 },
      confidence: { level: 'low', score: 20 },
      meta: {},
      sourceStatus: {},
      warnings: [],
    },
    model: { canonicalInstitutionalIdentityBackbone: rootNormalized },
    scores: { overallScore: 50 },
    confidence: { level: 'low', score: 20 },
  })
  const sectionTitle =
    'Canonical Product, Claim, Wrapper, and Strategy Identity Backbone v1'
  assert.equal((bundle.match(new RegExp(sectionTitle, 'g')) || []).length, 1)
  assert.match(bundle, /Backbone attached: yes/)
  assert.match(bundle, /Entity type count: 2/)
  assert.match(bundle, /Product-token conflation findings: 0/)
  assert.match(bundle, /Provider calls inactive: yes/)
  assert.match(bundle, /Scoring inactive: yes/)
  assert.match(bundle, /Ranking inactive: yes/)
  const identitySection = bundle.slice(
    bundle.indexOf(`=== ${sectionTitle} ===`),
    bundle.indexOf('=== Premium V2 Product Shell / Navigation QA ==='),
  )
  assert.doesNotMatch(identitySection, /product:registry:product-fixture/)
  assert.doesNotMatch(identitySection, /relationship:registry:fixture/)
  assert.doesNotMatch(identitySection, /internal-only/)

  const researchUtilsSource = readFileSync(
    path.join(root, 'src/components/research/researchUtils.js'),
    'utf8',
  )
  const protectedReportBody = researchUtilsSource.slice(
    researchUtilsSource.indexOf('export function buildProtectedInvestorReportText'),
    researchUtilsSource.indexOf('export function buildAssetLookupQuery'),
  )
  assert.doesNotMatch(protectedReportBody, /canonicalInstitutionalIdentityBackbone/)
  assert.doesNotMatch(protectedReportBody, /Institutional Identity Backbone/)

  const appSource = readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  const scoringSource = readFileSync(
    path.join(root, 'src/components/research/ScoringTransparencyTab.jsx'),
    'utf8',
  )
  assert.match(appSource, /normalizeCanonicalInstitutionalIdentityBackbone\(data\)/)
  assert.match(scoringSource, /Institutional Identity Backbone/)
  assert.doesNotMatch(
    scoringSource,
    /canonicalEntities|externalIdentifiers|immutableHash|blockedIdentities|relationshipId/,
  )

  console.log('Canonical institutional identity backbone frontend tests passed.')
} finally {
  await server.close()
}
