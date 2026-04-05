# RugCheck AI Frontend
Crypto research terminal UI for fast, explainable token screening.

This frontend is the user-facing interface for analyzing crypto assets with structured scoring, confidence, and historical comparison.
It is designed to support fast first-pass research while keeping data quality, missing coverage, and provider limitations visible.
The UI renders both live analysis results and stored historical snapshots with consistent explainability patterns.

## Core Experience
- search tokens by symbol, name, or contract address
- explicit ambiguity resolution with token picker
- live analysis view with structured score and confidence
- explainability layer showing why a score exists
- historical snapshot timeline and compare
- watchlist for tracking tokens over time

## Key Features

### 1. Search and Asset Resolution
- handles ambiguous symbols such as `PEPE` or `WIF`
- forces explicit selection when multiple plausible assets exist
- prevents incorrect auto-resolution
- supports direct contract-based lookup when identity is clear

### 2. Live Analysis View
- overall score with component breakdown
- confidence and data-quality explanation
- provider-aware quality notes
- section-level coverage and freshness indicators

### 3. Score Explainability
- `scoreContributors` panel shows:
  - positives: what helps the score
  - negatives: what hurts the score
  - neutral or missing: what remains under-confirmed
  - top drivers: the strongest score explanations at a glance

### 4. Protocol Intelligence
- protocol usage:
  - TVL
  - TVL trend
  - usage strength
- protocol economics:
  - fees
  - revenue
  - volume
  - value capture
- clear distinction between strong signal, weak signal, and missing data

### 5. Section-Level Transparency
Each panel can surface:
- freshness: fresh, stale, partial, or missing
- coverage quality
- provider limitations when relevant

### 6. Historical Snapshots
- timeline of stored analysis results
- compact impact summaries
- provider diagnostics context
- snapshot detail view using stored data only

### 7. Snapshot Compare
- compare any two stored snapshots
- score, confidence, and risk deltas
- contributor changes showing:
  - more supportive drivers
  - more negative drivers
  - newly confirmed or newly missing contributors

### 8. Watchlist Workflow
- save resolved tokens rather than raw queries
- per-item freshness status
- per-item last checked timestamp
- per-item refresh result:
  - updated
  - no change
  - failed
- batch refresh with summary:
  - refreshed
  - failed
  - stale
  - limited coverage
- filter and sort:
  - stale
  - updated recently
  - refresh failed
  - limited coverage

## Design Principles
- honesty over completeness:
  missing data is not treated as negative
- explainability first:
  every score has visible drivers
- provider-aware:
  degraded upstream services are visible
- consistency:
  live view and historical snapshots use the same rendering logic
- compact but information-dense UI

## Data and Limitations
- relies on third-party providers such as CoinGecko and DefiLlama
- results may degrade when providers are rate-limited or unavailable
- not all tokens have:
  - on-chain coverage
  - protocol data
  - verified docs or team information

The UI reflects these limitations explicitly instead of hiding them.

## Best Use Case
- fast first-pass token screening
- identifying weak projects early
- understanding why a score exists before deeper manual research

This tool is not a replacement for full due diligence.

## Important Note
This interface is for research support only.
It is not financial, legal, or investment advice.
Always verify contract addresses and official project sources manually.
