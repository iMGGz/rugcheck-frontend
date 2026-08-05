import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'vite'
import {
  InstitutionalProductScoringV1ContractError,
  normalizeInstitutionalProductScoringV1,
} from '../src/v2/institutionalProductScoringV1.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const constitution = { contractId: 'institutionalScoringConstitutionV1', schemaVersion: '1.0.0', artifactVersion: 'test' }
const score = {
  contractId: 'institutionalProductScoringResultV1', schemaVersion: '1.0.0', activationState: 'shadow_withheld',
  eligibility: { state: 'eligible', displayState: 'withheld', scoreWithheld: true },
  institutionalQuality: { score: 72, displayState: 'withheld' }, moduleResults: [], capsAndPenalties: [],
  riskSeverity: { score: 30 }, riskGrade: 'B', technicalOpportunity: { score: 60 }, dataConfidence: { score: 80 }, coverage: { score: 75 },
  comparability: { state: 'insufficient_cohort' }, cohortRanking: {}, institutionalAnswers: [], metadata: { methodologyVersion: 'v1', observationCutoff: '2026-08-05' },
}
const ranking = { contractId: 'institutionalCohortRankingResultV1', schemaVersion: '1.0.0', activationState: 'shadow_withheld', entries: [], state: 'insufficient_cohort' }
const activation = {
  contractId: 'institutionalScoringActivationDecisionV1', schemaVersion: '1.0.0', decision: 'withhold_runtime_activation', runtimeActivationAllowed: false,
  activeScoreSource: 'legacy_or_none', activeRankingSource: 'legacy_or_none', failedGates: ['product'], blockingFindings: ['Live shadow period unproven.'],
}
const payload = {
  institutionalScoringConstitutionV1: constitution,
  institutionalProductScoringResultV1: score,
  institutionalCohortRankingResultV1: ranking,
  institutionalScoringActivationDecisionV1: activation,
}
payload.analysis = { ...payload }

const normalized = normalizeInstitutionalProductScoringV1(payload, { requireComplete: true })
assert.equal(normalized.contractStatus, 'complete')
assert.equal(normalized.activationAllowed, false)
assert.equal(normalized.customerPresentation, null)
assert.equal(normalized.shadowDiagnostics.institutionalQuality.score, 72)
assert.ok(Object.values(normalized.parityStatus).every((state) => state === 'root_analysis_matched'))

const activeScore = {
  ...score,
  activationState: 'active',
  eligibility: { ...score.eligibility, displayState: 'customer_visible', scoreWithheld: false },
  institutionalQuality: { ...score.institutionalQuality, displayState: 'customer_visible' },
}
const activeRanking = { ...ranking, activationState: 'active', state: 'comparable' }
const activeActivation = {
  ...activation,
  decision: 'activate_v2_runtime',
  runtimeActivationAllowed: true,
  activeScoreSource: 'institutionalProductScoringResultV1',
  activeRankingSource: 'institutionalCohortRankingResultV1',
  failedGates: [],
  blockingFindings: [],
}
const activePayload = {
  institutionalScoringConstitutionV1: constitution,
  institutionalProductScoringResultV1: activeScore,
  institutionalCohortRankingResultV1: activeRanking,
  institutionalScoringActivationDecisionV1: activeActivation,
}
activePayload.analysis = { ...activePayload }
const activeNormalized = normalizeInstitutionalProductScoringV1(activePayload, { requireComplete: true })
assert.equal(activeNormalized.activationAllowed, true)
assert.equal(activeNormalized.customerPresentation.institutionalQuality.score, 72)
assert.equal(activeNormalized.customerPresentation.cohortRanking.state, 'comparable')

const partial = normalizeInstitutionalProductScoringV1({ analysis: { institutionalScoringActivationDecisionV1: activation } })
assert.equal(partial.contractStatus, 'partial')
assert.equal(partial.activationAllowed, false)
assert.equal(partial.customerPresentation, null)

assert.throws(
  () => normalizeInstitutionalProductScoringV1({ ...payload, analysis: { ...payload.analysis, institutionalProductScoringResultV1: { ...score, riskGrade: 'E' } } }),
  (error) => error instanceof InstitutionalProductScoringV1ContractError && /root_analysis_divergence/.test(error.code),
)

const normalizerSource = readFileSync(join(root, 'src', 'v2', 'institutionalProductScoringV1.js'), 'utf8')
assert.doesNotMatch(normalizerSource, /Math\.(?:min|max|round|floor|ceil|exp|log|pow)/)
assert.doesNotMatch(normalizerSource, /reduce\([^\n]*(?:score|rank|weight|cap)/i)
assert.doesNotMatch(normalizerSource, /symbol\s*===|case\s+['\"][A-Z0-9]{2,10}['\"]/) 

const scoringTab = readFileSync(join(root, 'src', 'components', 'research', 'ScoringTransparencyTab.jsx'), 'utf8')
assert.match(scoringTab, /Shadow methodology diagnostics/)
assert.match(scoringTab, /runtimeActivationAllowed/)

const utils = readFileSync(join(root, 'src', 'components', 'research', 'researchUtils.js'), 'utf8')
const sectionTitle = 'Institutional Scoring Research, Calibration, Stress Testing & Runtime Activation Constitution v1'
assert.equal(utils.split(`bundleSection(\"${sectionTitle}\"`).length - 1, 1)
assert.match(utils, /institutionalScoringActivationDecisionV1/)
assert.match(utils, /activationAllowed\s*\?/) 

const v2Files = [
  'src/v2/PremiumAssetPageV2.jsx',
  'src/v2/components/V2AssetDecisionCommandCenter.jsx',
  'src/v2/components/V2ResearchTabs.jsx',
  'src/v2/components/V2ResearchRail.jsx',
].map((path) => readFileSync(join(root, path), 'utf8')).join('\n')
assert.doesNotMatch(v2Files, /institutionalProductScoringResultV1|institutionalCohortRankingResultV1/)

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
try {
  const researchUtils = await server.ssrLoadModule('/src/components/research/researchUtils.js')
  const renderData = {
    asset: { symbol: 'TEST', name: 'Scoring Regression Product', coingeckoId: 'scoring-regression' },
    ...payload,
    scores: { overallScore: 41 },
    confidence: { level: 'low', score: 25 },
    meta: {},
  }
  const renderModel = {
    institutionalScoringConstitutionV1: normalized.institutionalScoringConstitutionV1,
    institutionalProductScoringResultV1: normalized.institutionalProductScoringResultV1,
    institutionalCohortRankingResultV1: normalized.institutionalCohortRankingResultV1,
    institutionalScoringActivationDecisionV1: normalized.institutionalScoringActivationDecisionV1,
    institutionalProductScoringV1ActivationAllowed: normalized.activationAllowed,
    institutionalProductScoringV1CustomerPresentation: normalized.customerPresentation,
    institutionalProductScoringV1ShadowDiagnostics: normalized.shadowDiagnostics,
  }
  const bundle = researchUtils.buildReviewBundleText({
    asset: renderData.asset,
    data: renderData,
    analysis: renderData.analysis,
    model: renderModel,
    scores: renderData.scores,
    confidence: renderData.confidence,
  })
  assert.equal((bundle.match(new RegExp(sectionTitle, 'g')) || []).length, 1)
  assert.match(bundle, /Runtime activation decision: withhold_runtime_activation/)
  assert.match(bundle, /Active score source: legacy_or_none/)
  assert.match(bundle, /Product quality output: 72 \(withheld; shadow\)/)

  const protectedReport = researchUtils.buildProtectedInvestorReportText({
    asset: renderData.asset,
    data: renderData,
    analysis: renderData.analysis,
    model: renderModel,
    scores: renderData.scores,
    confidence: renderData.confidence,
  })
  assert.doesNotMatch(protectedReport, /institutionalProductScoringResultV1|institutionalCohortRankingResultV1/)
  assert.doesNotMatch(protectedReport, /Institutional Quality[^\n]*72|72[^\n]*shadow/i)
  assert.doesNotMatch(protectedReport, /immutableHash|calibrationFixture|rawResult/)

  const activeReportData = { ...renderData, ...activePayload, analysis: activePayload.analysis }
  const activeReportModel = {
    ...renderModel,
    institutionalScoringConstitutionV1: activeNormalized.institutionalScoringConstitutionV1,
    institutionalProductScoringResultV1: activeNormalized.institutionalProductScoringResultV1,
    institutionalCohortRankingResultV1: activeNormalized.institutionalCohortRankingResultV1,
    institutionalScoringActivationDecisionV1: activeNormalized.institutionalScoringActivationDecisionV1,
    institutionalProductScoringV1ActivationAllowed: activeNormalized.activationAllowed,
    institutionalProductScoringV1CustomerPresentation: activeNormalized.customerPresentation,
    institutionalProductScoringV1ShadowDiagnostics: activeNormalized.shadowDiagnostics,
  }
  const activeProtectedReport = researchUtils.buildProtectedInvestorReportText({
    asset: activeReportData.asset,
    data: activeReportData,
    analysis: activeReportData.analysis,
    model: activeReportModel,
    scores: activeReportData.scores,
    confidence: activeReportData.confidence,
  })
  assert.match(activeProtectedReport, /5A\. Activated Institutional Product Scoring/)
  assert.match(activeProtectedReport, /Institutional Quality: 72/)
  assert.doesNotMatch(activeProtectedReport, /immutableHash|calibrationFixture|rawResult/)
} finally {
  await server.close()
}

console.log('PASS institutional product scoring v1 frontend normalization and shadow leakage controls')
