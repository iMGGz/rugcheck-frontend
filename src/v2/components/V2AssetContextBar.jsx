import React from 'react'
import {
  finiteMetricValue,
  formatV2Date,
  formatV2Percent,
  formatV2Usd,
  humanizeV2Value,
  safeProductText,
} from '../assetResearchResultV2'
import { V2StatusPill } from './V2Primitives'

export const V2_ASSET_SECTIONS = Object.freeze([
  { id: 'overview', label: 'Overview', kind: 'anchor' },
  { id: 'market-supply', label: 'Market & Supply', kind: 'anchor' },
  { id: 'tokenomics', label: 'Tokenomics', kind: 'tab' },
  { id: 'fundamentals', label: 'Fundamentals', kind: 'tab' },
  { id: 'reality', label: 'Current Reality', kind: 'tab' },
  { id: 'technical', label: 'Technical & Scenarios', kind: 'tab' },
])

function networkLabel(identity, representation) {
  return safeProductText(
    identity.analyzedNetwork
      || representation.canonicalNetwork
      || representation.network
      || identity.canonicalNetwork,
    representation.representationType === 'native_asset' ? 'Native network' : 'Network pending',
  )
}

export default function V2AssetContextBar({ result, activeSection, onSelectSection }) {
  const identity = result.identity.data
  const representation = result.representation.data
  const classification = result.classification.data
  const market = result.market.data
  const decision = result.decision.data
  const price = finiteMetricValue(market.currentPrice)
  const change24h = finiteMetricValue(market.priceChange?.twentyFourHourPercent)

  return (
    <section className="v2-asset-context" aria-label="Current asset context">
      <div className="v2-asset-context__command">
        <div className="v2-asset-context__identity">
          <div className="v2-asset-context__mark">
            {identity.logo ? <img src={identity.logo} alt="" /> : <span>{(identity.symbol || identity.name || '?').slice(0, 1)}</span>}
          </div>
          <div>
            <p>{classification.canonicalFamilyLabel || 'Asset family pending'}</p>
            <h1>{identity.name || 'Canonical asset'} <span>{identity.symbol || ''}</span></h1>
            <small>{humanizeV2Value(representation.representationType, 'Canonical representation')} / {networkLabel(identity, representation)}</small>
          </div>
        </div>
        <div className="v2-asset-context__market">
          <span>Market reference</span>
          <strong>{formatV2Usd(price)}</strong>
          <small className={change24h > 0 ? 'is-positive' : change24h < 0 ? 'is-negative' : ''}>
            {change24h === null ? '24h change unavailable' : `${change24h > 0 ? '+' : ''}${formatV2Percent(change24h)} / 24h`}
          </small>
        </div>
        <div className="v2-asset-context__decision">
          <span>Current decision</span>
          <strong>{decision.verdictLabel || 'Decision pending'}</strong>
          <div>
            <V2StatusPill label={decision.confidenceLabel ? `${humanizeV2Value(decision.confidenceLabel)} confidence` : 'Confidence unavailable'} status={decision.confidenceLabel} />
            <small>{result.generatedAt ? `Updated ${formatV2Date(result.generatedAt)}` : 'Update time unavailable'}</small>
          </div>
        </div>
      </div>
      <nav className="v2-asset-context__nav" aria-label="Asset research sections">
        {V2_ASSET_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            aria-current={activeSection === section.id ? 'page' : undefined}
            onClick={() => onSelectSection(section)}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </section>
  )
}
