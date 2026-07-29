import React from 'react'
import {
  humanizeV2Value,
  safeProductText,
} from '../assetResearchResultV2'
import { normalizeTokenomicsQualityV2 } from '../tokenomicsQualityV2'
import {
  V2Disclosure,
  V2InsightList,
  V2SectionHeading,
  V2StatusPill,
} from './V2Primitives'

const RIGHT_ROWS = [
  ['Governance', 'governanceRights'],
  ['Protocol fees', 'feeRights'],
  ['Revenue', 'revenueRights'],
  ['Cash flow', 'cashFlowRights'],
  ['Redemption', 'redemptionRights'],
  ['Collateral', 'collateralRights'],
  ['Voting', 'votingRights'],
  ['Upgrades', 'upgradeRights'],
  ['Treasury ownership', 'treasuryRights'],
  ['Legal or contractual claim', 'legalClaimRights'],
  ['Protocol ownership', 'ownershipRights'],
  ['Staking participation', 'stakingRights'],
]

const CONTROL_ROWS = [
  ['Governance model', 'governanceModel'],
  ['Holder scope', 'governanceScope'],
  ['Voting', 'votingRights'],
  ['Delegation', 'delegation'],
  ['Execution', 'execution'],
  ['Timelock', 'timelock'],
  ['Emergency powers', 'emergencyPowers'],
  ['Upgrade authority', 'upgradeAuthority'],
  ['Administrative authority', 'adminAuthority'],
  ['Mint authority', 'mintAuthority'],
  ['Freeze authority', 'freezeAuthority'],
  ['Pause authority', 'pauseAuthority'],
  ['Treasury control', 'treasuryControl'],
  ['Participation', 'participation'],
]

function StateBadge({ label, status = 'partial' }) {
  return <V2StatusPill label={label || 'Evidence unavailable'} status={status} />
}

function BoundaryNote({ children }) {
  return <p className="v2-tq-boundary">{children}</p>
}

function RelationshipMatrix({ rights }) {
  return (
    <div className="v2-tq-rights" role="list" aria-label="Holder rights and evidence states">
      {RIGHT_ROWS.map(([label, key]) => {
        const right = rights[key]
        return (
          <article key={key} className="v2-tq-rights__row" role="listitem">
            <div>
              <strong>{label}</strong>
              <span>{safeProductText(right?.description, 'Claim-specific evidence is unavailable.')}</span>
            </div>
            <StateBadge label={right?.stateLabel} status={right?.state} />
          </article>
        )
      })}
    </div>
  )
}

function MechanismCard({ mechanism }) {
  return (
    <article className="v2-tq-mechanism">
      <header>
        <div>
          <span>{humanizeV2Value(mechanism.mechanismType, 'Economic mechanism')}</span>
          <h4>{safeProductText(mechanism.label, 'Demand mechanism')}</h4>
        </div>
        <StateBadge label={mechanism.stateLabel} status={mechanism.state} />
      </header>
      <p>{safeProductText(mechanism.description, 'Current evidence does not establish this mechanism.')}</p>
      <dl>
        <div><dt>Link</dt><dd>{humanizeV2Value(mechanism.directness, 'Unavailable')}</dd></div>
        <div><dt>Use</dt><dd>{humanizeV2Value(mechanism.requiredOrOptional, 'Unavailable')}</dd></div>
        <div><dt>Substitutes</dt><dd>{humanizeV2Value(mechanism.replaceability, 'Unavailable')}</dd></div>
      </dl>
      <div className="v2-tq-mechanism__boundary">
        <span>Economic boundary</span>
        <p>{safeProductText(mechanism.holderBenefitBoundary, 'Token use does not automatically create holder value.')}</p>
      </div>
    </article>
  )
}

function ControlGrid({ control }) {
  return (
    <dl className="v2-tq-control-grid">
      {CONTROL_ROWS.map(([label, key]) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd>{safeProductText(control[key], 'Needs verification')}</dd>
        </div>
      ))}
    </dl>
  )
}

function TokenomicsUnavailable({ message }) {
  return (
    <div className="v2-tab-panel__inner v2-tq-experience">
      <V2SectionHeading
        eyebrow="Tokenomics quality"
        title="Token-economic analysis is unavailable"
        description={message || 'The canonical Tokenomics presentation did not pass its identity and data-boundary checks.'}
        action={<V2StatusPill label="Needs verification" status="unavailable" />}
      />
      <section className="v2-tq-empty">
        <h3>What to do next</h3>
        <p>Run a fresh canonical analysis and verify the selected asset, representation, and family before interpreting token economics.</p>
      </section>
    </div>
  )
}

export default function V2TokenomicsQualityExperience({ result }) {
  let model
  try {
    model = normalizeTokenomicsQualityV2(result)
  } catch (error) {
    return <TokenomicsUnavailable message={error instanceof Error ? error.message : null} />
  }

  const quality = model.tokenomicsQuality
  const role = model.economicRole
  const value = model.valueCapture
  const productBoundary = model.productTokenBoundary
  const distribution = model.distribution
  const unlocks = model.unlocksAndDilution
  const issuance = model.issuanceAndBurn
  const treasury = model.treasuryAndIncentives
  const staking = model.stakingAndYieldBoundary

  return (
    <div className="v2-tab-panel__inner v2-tq-experience">
      <section className="v2-tq-hero" aria-labelledby="v2-tq-title">
        <div className="v2-tq-hero__lead">
          <p className="v2-eyebrow">Tokenomics quality</p>
          <h2 id="v2-tq-title">{safeProductText(role.economicRoleLabel, 'Token-economic role needs verification')}</h2>
          <p className="v2-tq-hero__reason">{safeProductText(quality.conciseQualityReason, 'Current evidence does not support a stronger conclusion.')}</p>
          <BoundaryNote>This score evaluates token-economic structure, not future price performance.</BoundaryNote>
        </div>
        <div className="v2-tq-score" aria-label={`Tokenomics quality: ${quality.tokenomicsScoreLabel}`}>
          <span>{model.labels.scoreState}</span>
          <strong>{quality.tokenomicsScoreLabel}</strong>
          <small>{safeProductText(quality.scoreWithheldReason, quality.qualityBand)}</small>
        </div>
        <dl className="v2-tq-hero__signals">
          <div className="is-positive"><dt>Strongest supported dimension</dt><dd>{safeProductText(quality.strongestDimension, 'No supported strength is attached.')}</dd></div>
          <div className="is-caution"><dt>Weakest dimension</dt><dd>{safeProductText(quality.weakestDimension, 'No supported risk is attached.')}</dd></div>
          <div><dt>Critical blocker</dt><dd>{safeProductText(quality.criticalBlocker, 'No critical blocker is attached.')}</dd></div>
          <div><dt>Evidence coverage</dt><dd>{humanizeV2Value(quality.evidenceCoverageState, 'Not assessed')}</dd></div>
        </dl>
      </section>

      <section className="v2-tq-role" aria-labelledby="v2-tq-role-title">
        <div className="v2-tq-section-heading">
          <div><p className="v2-eyebrow">Economic mechanism</p><h3 id="v2-tq-role-title">What creates demand for this asset?</h3></div>
          <StateBadge label={model.labels.roleAvailability} status={role.roleAvailabilityState} />
        </div>
        <div className="v2-tq-role__overview">
          <article>
            <span>Economic role</span>
            <h4>{role.economicRoleLabel}</h4>
            <p>{role.economicRoleDescription}</p>
          </article>
          <dl>
            <div><dt>Fee or resource role</dt><dd>{role.gasOrResourceRole}</dd></div>
            <div><dt>Settlement role</dt><dd>{role.settlementRole}</dd></div>
            <div><dt>Security role</dt><dd>{role.stakingOrSecurityRole}</dd></div>
            <div><dt>Claim or redemption</dt><dd>{role.redemptionOrClaimRole}</dd></div>
          </dl>
        </div>
        <div className="v2-tq-mechanisms">
          {model.demandMechanisms.map((mechanism) => <MechanismCard key={mechanism.itemId} mechanism={mechanism} />)}
        </div>
        <div className="v2-tq-necessity">
          <div><span>Token required</span><strong>{model.utilityAndNecessity.tokenRequired === null ? 'Needs verification' : model.utilityAndNecessity.tokenRequired ? 'Required' : 'Not required'}</strong></div>
          <div><span>Token optional</span><strong>{model.utilityAndNecessity.tokenOptional === null ? 'Needs verification' : model.utilityAndNecessity.tokenOptional ? 'Optional path exists' : 'No optional path established'}</strong></div>
          <div><span>Substitute available</span><strong>{model.utilityAndNecessity.substituteAvailable === null ? 'Needs verification' : model.utilityAndNecessity.substituteAvailable ? 'Yes' : 'No canonical substitute'}</strong></div>
          <div><span>Product can succeed without token value</span><strong>{model.utilityAndNecessity.productCanSucceedWithoutToken === null ? 'Needs verification' : model.utilityAndNecessity.productCanSucceedWithoutToken ? 'Yes' : 'No'}</strong></div>
        </div>
      </section>

      <div className="v2-tq-dual">
        <section className="v2-tq-panel" aria-labelledby="v2-tq-rights-title">
          <div className="v2-tq-panel__header">
            <div><p className="v2-eyebrow">Holder rights</p><h3 id="v2-tq-rights-title">What does ownership actually provide?</h3></div>
            <StateBadge label={model.holderRights.rightsEvidenceState} status="partial" />
          </div>
          <RelationshipMatrix rights={model.holderRights} />
          <BoundaryNote>{model.holderRights.rightsEnforceabilityState}</BoundaryNote>
        </section>

        <section className="v2-tq-panel v2-tq-panel--capture" aria-labelledby="v2-tq-capture-title">
          <div className="v2-tq-panel__header">
            <div><p className="v2-eyebrow">Value capture</p><h3 id="v2-tq-capture-title">Does activity accrue to holders?</h3></div>
            <StateBadge label={humanizeV2Value(value.evidenceState, 'Evidence limited')} status="partial" />
          </div>
          <div className="v2-tq-capture-flow">
            <div><span>Protocol success</span><strong>{value.protocolSuccessTokenSuccessLink}</strong></div>
            <span aria-hidden="true">→</span>
            <div><span>Holder accrual</span><strong>{productBoundary.tokenholderAccrual}</strong></div>
          </div>
          <div className="v2-tq-capture-states">
            <div><span>Fees</span><strong>{humanizeV2Value(value.feeAccrual)}</strong></div>
            <div><span>Revenue</span><strong>{humanizeV2Value(value.revenueAccrual)}</strong></div>
            <div><span>Burn</span><strong>{humanizeV2Value(value.burnAccrual)}</strong></div>
            <div><span>Staking</span><strong>{humanizeV2Value(value.stakingAccrual)}</strong></div>
            <div><span>Redemption</span><strong>{humanizeV2Value(value.redemptionAccrual)}</strong></div>
            <div><span>Network demand</span><strong>{humanizeV2Value(value.networkDemandAccrual)}</strong></div>
          </div>
          <V2Disclosure label="Mechanisms and limitations" summary="Inspect directness, offsets, and evidence" quiet>
            <V2InsightList items={value.valueCaptureMechanisms.map((mechanism) => `${mechanism.label}: ${mechanism.description}`)} emptyText="No verified value-capture mechanism is attached." />
            <BoundaryNote>{value.productAumRelationship}</BoundaryNote>
            <BoundaryNote>{value.leakageOrOffset}</BoundaryNote>
          </V2Disclosure>
        </section>
      </div>

      <section className="v2-tq-governance" aria-labelledby="v2-tq-governance-title">
        <div className="v2-tq-section-heading">
          <div><p className="v2-eyebrow">Governance and control</p><h3 id="v2-tq-governance-title">Who can change the system?</h3></div>
          <StateBadge label={humanizeV2Value(model.governanceAndControl.evidenceState, 'Evidence limited')} status="partial" />
        </div>
        <ControlGrid control={model.governanceAndControl} />
        <BoundaryNote>Voting, decentralization, administrative control, and economic rights are separate dimensions.</BoundaryNote>
      </section>

      <div className="v2-tq-dual v2-tq-dual--economics">
        <section className="v2-tq-panel" aria-labelledby="v2-tq-distribution-title">
          <div className="v2-tq-panel__header">
            <div><p className="v2-eyebrow">Distribution and dilution</p><h3 id="v2-tq-distribution-title">Who received supply, and what can still change?</h3></div>
            <StateBadge label={humanizeV2Value(distribution.coverageState, 'Coverage limited')} status="partial" />
          </div>
          {distribution.categories.length ? (
            <div className="v2-tq-allocation" role="list" aria-label="Reported initial allocation categories">
              {distribution.categories.map((category) => (
                <article key={category.itemId} role="listitem">
                  <div><strong>{category.label}</strong><span>{category.description}</span></div>
                  <StateBadge label={category.stateLabel} status={category.state} />
                </article>
              ))}
            </div>
          ) : <p className="v2-tq-empty-copy">Initial allocation coverage is unavailable.</p>}
          <div className="v2-tq-interpretation">
            <span>Dilution interpretation</span>
            <p>{unlocks.dilutionInterpretation}</p>
            <span>Unlock interpretation</span>
            <p>{unlocks.unlockInterpretation}</p>
          </div>
          <a className="v2-tq-deep-link" href={unlocks.marketSupplyDetailAnchor}>Open detailed schedules in Market &amp; Supply <span aria-hidden="true">↗</span></a>
          <BoundaryNote>Initial allocations are not current holdings. Missing unlock coverage is not proof of no dilution risk.</BoundaryNote>
        </section>

        <section className="v2-tq-panel" aria-labelledby="v2-tq-treasury-title">
          <div className="v2-tq-panel__header">
            <div><p className="v2-eyebrow">Treasury and incentives</p><h3 id="v2-tq-treasury-title">Is demand organic or subsidy-dependent?</h3></div>
            <StateBadge label={humanizeV2Value(treasury.evidenceState, 'Evidence limited')} status="partial" />
          </div>
          <dl className="v2-tq-definition-grid">
            <div><dt>Treasury share</dt><dd>{treasury.treasuryTokenShare}</dd></div>
            <div><dt>Treasury control</dt><dd>{treasury.treasuryControl}</dd></div>
            <div><dt>Treasury use</dt><dd>{treasury.treasuryUse}</dd></div>
            <div><dt>Emissions funding</dt><dd>{treasury.emissionsFunding}</dd></div>
            <div><dt>Incentive dependency</dt><dd>{treasury.incentiveDependency}</dd></div>
            <div><dt>Sustainability</dt><dd>{treasury.sustainabilityState}</dd></div>
          </dl>
          <BoundaryNote>Treasury assets are not holder assets. Incentivized activity is not automatically organic demand.</BoundaryNote>
        </section>
      </div>

      <section className="v2-tq-policy" aria-labelledby="v2-tq-policy-title">
        <div className="v2-tq-section-heading">
          <div><p className="v2-eyebrow">Issuance, burn, and staking</p><h3 id="v2-tq-policy-title">What funds the system, and who bears dilution?</h3></div>
          <StateBadge label={humanizeV2Value(issuance.evidenceState, 'Evidence limited')} status="partial" />
        </div>
        <div className="v2-tq-policy__grid">
          <article><span>Issuance model</span><strong>{issuance.monetaryPolicyType}</strong><p>{issuance.issuancePurpose}</p></article>
          <article><span>Burn and net supply</span><strong>{issuance.burnPurpose}</strong><p>{issuance.netIssuanceContext}</p></article>
          <article><span>Staking role</span><strong>{staking.stakingRole}</strong><p>{staking.sourceOfYield}</p></article>
          <article><span>Real return boundary</span><strong>{staking.realYield}</strong><p>{staking.yieldSustainability}</p></article>
        </div>
        <a className="v2-tq-deep-link" href={issuance.marketSupplyDetailAnchor}>Inspect measured issuance and burn in Market &amp; Supply <span aria-hidden="true">↗</span></a>
      </section>

      <section className="v2-tq-synthesis" aria-labelledby="v2-tq-synthesis-title">
        <div className="v2-tq-section-heading">
          <div><p className="v2-eyebrow">Institutional synthesis</p><h3 id="v2-tq-synthesis-title">Strength, risk, and critical unknown</h3></div>
        </div>
        <div className="v2-tq-synthesis__grid">
          <article className="is-positive"><span>Supported strength</span><V2InsightList items={model.strengths} emptyText="No supported strength is attached." /></article>
          <article className="is-risk"><span>Supported risk</span><V2InsightList items={model.risks} emptyText="No confirmed tokenomics risk is attached." tone="caution" /></article>
          <article className="is-unknown"><span>Critical unknown</span><V2InsightList items={model.criticalUnknowns} emptyText="No critical unknown is attached." tone="caution" /></article>
        </div>
        <div className="v2-tq-change-grid">
          <div><h4>What would improve the view</h4><V2InsightList items={model.whatWouldChangeTheView.improve} emptyText="No improvement condition is attached." /></div>
          <div><h4>What would weaken the view</h4><V2InsightList items={model.whatWouldChangeTheView.weaken} emptyText="No weakening condition is attached." tone="caution" /></div>
        </div>
      </section>

      <section className="v2-tq-evidence" aria-labelledby="v2-tq-evidence-title">
        <div className="v2-tq-section-heading">
          <div><p className="v2-eyebrow">Evidence quality</p><h3 id="v2-tq-evidence-title">What remains unresolved?</h3></div>
          <StateBadge label={humanizeV2Value(model.dataQuality.status, 'Evidence limited')} status="partial" />
        </div>
        {model.missingEvidence.length ? (
          <div className="v2-tq-gaps">
            {model.missingEvidence.map((gap) => (
              <article key={gap.claimId}>
                <h4>{gap.label}</h4>
                <p>{gap.whyItMatters}</p>
                <div><span>Analytical impact</span><strong>{gap.analyticalImpact}</strong></div>
                <div><span>Check next</span><strong>{gap.nextRequiredSource}</strong></div>
              </article>
            ))}
          </div>
        ) : <p className="v2-tq-empty-copy">No additional critical evidence gap is attached.</p>}
        <V2Disclosure label="Provenance and methodology" summary="Inspect owners, boundaries, and limitations">
          <div className="v2-tq-provenance">
            {model.provenance.map((entry) => (
              <article key={`${entry.owner}-${entry.sourcePath}`}>
                <strong>{entry.owner}</strong>
                <p>{entry.role}</p>
                <span>{entry.boundary}</span>
              </article>
            ))}
          </div>
          <BoundaryNote>{model.limitations.join(' ')}</BoundaryNote>
        </V2Disclosure>
      </section>
    </div>
  )
}
