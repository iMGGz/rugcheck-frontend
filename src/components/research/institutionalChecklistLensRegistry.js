const LENS_PRIORITY = [
  "WRAPPED_ASSET",
  "LIQUID_STAKING_TOKEN",
  "RESTAKING_OR_LRT",
  "STABLECOIN_SETTLEMENT_ASSET",
  "RWA_OR_HYBRID_METHODOLOGY",
  "L2_SCALING_TOKEN",
  "BASE_LAYER_SETTLEMENT_L1",
  "MONETARY_BENCHMARK_NATIVE",
  "DEFI_PROTOCOL_TOKEN",
  "DERIVATIVES_OR_PERPS_PROTOCOL",
  "ORACLE_OR_INFRASTRUCTURE",
  "COMPUTE_STORAGE_DEPIN",
  "EXCHANGE_OR_PLATFORM_TOKEN",
  "PAYMENTS_OR_SETTLEMENT_NETWORK",
  "PRIVACY_ASSET",
  "MEME_OR_NARRATIVE",
  "GAMING_METAVERSE_CONSUMER",
  "BRIDGE_OR_INTEROPERABILITY",
  "GENERAL_LOW_COVERAGE",
];

export const EXPECTED_LENS_DEMO_MATRIX = [
  ["BTC", "MONETARY_BENCHMARK_NATIVE"],
  ["ETH", "BASE_LAYER_SETTLEMENT_L1"],
  ["SOL", "BASE_LAYER_SETTLEMENT_L1"],
  ["USDC", "STABLECOIN_SETTLEMENT_ASSET"],
  ["USDT", "STABLECOIN_SETTLEMENT_ASSET"],
  ["DAI", "STABLECOIN_SETTLEMENT_ASSET"],
  ["WBTC", "WRAPPED_ASSET"],
  ["stETH", "LIQUID_STAKING_TOKEN"],
  ["UNI", "DEFI_PROTOCOL_TOKEN"],
  ["AAVE", "DEFI_PROTOCOL_TOKEN"],
  ["MKR", "DEFI_PROTOCOL_TOKEN"],
  ["SKY", "DEFI_PROTOCOL_TOKEN"],
  ["LINK", "ORACLE_OR_INFRASTRUCTURE"],
  ["ARB", "L2_SCALING_TOKEN"],
  ["OP", "L2_SCALING_TOKEN"],
  ["XRP", "PAYMENTS_OR_SETTLEMENT_NETWORK"],
  ["DOGE", "MEME_OR_NARRATIVE"],
  ["PEPE", "MEME_OR_NARRATIVE"],
  ["WIF", "MEME_OR_NARRATIVE"],
  ["ONDO", "RWA_OR_HYBRID_METHODOLOGY"],
  ["BNB", "EXCHANGE_OR_PLATFORM_TOKEN"],
  ["TRX", "PAYMENTS_OR_SETTLEMENT_NETWORK"],
];

export const GLOBAL_WRONG_LENS_SAFEGUARDS = [
  "Stablecoin market cap must not prove reserves.",
  "TVL, AUM, volume, or usage must not imply tokenholder value capture.",
  "Partnership announcements must not prove adoption.",
  "High yield must not prove quality.",
  "Missing evidence is a verification gap, not automatic proof of failure.",
];

function question(id, text, why, evidence) {
  return { id, question: text, why, evidence };
}

function lens({
  lensId,
  displayName,
  description,
  appliesTo,
  symbols = [],
  keywords = [],
  avoidSymbols = [],
  avoidKeywords = [],
  questions,
  evidenceRequired,
  hardRules,
  boundaryCopy,
  exampleAssets,
  wrongLensExamples,
}) {
  return {
    lensId,
    displayName,
    description,
    appliesTo,
    routingSignals: { symbols, keywords },
    avoidIf: { symbols: avoidSymbols, keywords: avoidKeywords },
    questions,
    evidenceRequired,
    hardRules,
    boundaryCopy,
    fallbackStatus: "methodology-only until attached evidence mapping exists",
    exampleAssets,
    wrongLensExamples,
  };
}

export const INSTITUTIONAL_CHECKLIST_LENSES = [
  lens({
    lensId: "MONETARY_BENCHMARK_NATIVE",
    displayName: "Monetary Benchmark Native Asset",
    description: "Native monetary/network survivability lens for assets such as Bitcoin.",
    appliesTo: "Native monetary benchmark assets, not wrappers or derivatives.",
    symbols: ["BTC"],
    keywords: ["bitcoin", "monetary benchmark", "benchmark / monetary", "store of value"],
    avoidSymbols: ["WBTC", "CBBTC", "TBTC", "STETH", "RETH", "CBETH", "WSTETH"],
    questions: [
      question("monetary-01", "Does the asset have durable monetary/network survivability?", "The thesis depends on durable settlement, security, and monetary credibility.", ["network security", "monetary policy", "liquidity history"]),
      question("monetary-02", "Is liquidity deep enough for institutional exit?", "A benchmark asset still needs executable market depth.", ["venue liquidity", "depth/slippage", "stress liquidity"]),
      question("monetary-03", "Is custody/access mature enough for allocation?", "Institutional allocation needs custody and operational access evidence.", ["custody rails", "qualified custody", "market infrastructure"]),
      question("monetary-04", "Is supply discipline credible?", "The monetary thesis can fail if supply assurances or consensus durability weaken.", ["issuance rules", "consensus history", "protocol docs"]),
      question("monetary-05", "What would falsify the monetary thesis?", "Benchmark assets still need explicit failure conditions.", ["security degradation", "liquidity failure", "custody/access failure"]),
    ],
    evidenceRequired: ["network security", "supply rules", "liquidity depth", "custody maturity", "falsification triggers"],
    hardRules: ["BTC must not show wrapped-asset custody lens.", "Wrapped BTC products do not inherit this lens automatically."],
    boundaryCopy: "Native benchmark assets should not be evaluated with wrapper custody or stablecoin redemption tests.",
    exampleAssets: ["BTC"],
    wrongLensExamples: ["WBTC should use WRAPPED_ASSET, not MONETARY_BENCHMARK_NATIVE."],
  }),
  lens({
    lensId: "BASE_LAYER_SETTLEMENT_L1",
    displayName: "Base-Layer Settlement L1",
    description: "Native L1 settlement and validator economics lens.",
    appliesTo: "Native gas/staking assets for base-layer settlement networks.",
    symbols: ["ETH", "SOL", "AVAX", "SUI", "APT", "SEI"],
    keywords: ["base-layer settlement", "l1", "layer 1", "native gas", "staking", "validator", "settlement asset"],
    avoidSymbols: ["USDC", "USDT", "DAI", "WBTC", "STETH", "ARB", "OP", "STRK", "MATIC", "POL"],
    questions: [
      question("l1-01", "Does settlement demand accrue to the native asset?", "Network activity matters only if it reinforces native-asset demand.", ["fee mechanics", "gas demand", "settlement usage"]),
      question("l1-02", "Are fee burn, issuance, staking, or validator economics structurally supportive?", "Supply/demand mechanics determine whether usage supports holders.", ["issuance", "burn mechanics", "staking economics"]),
      question("l1-03", "Does L2 or app growth reinforce or leak value capture?", "Activity can migrate away from direct L1 economics.", ["L2 fee flow", "sequencer economics", "app settlement docs"]),
      question("l1-04", "Is validator/security role economically necessary?", "The native token thesis depends on security and settlement necessity.", ["validator requirements", "staking role", "security model"]),
      question("l1-05", "Is settlement activity organic and durable?", "Short-lived activity should not be treated as durable demand.", ["transaction activity", "fee durability", "organic usage evidence"]),
      question("l1-06", "Are governance, client, or protocol-upgrade risks material?", "Protocol changes can alter economics or risk.", ["governance history", "client diversity", "upgrade docs"]),
    ],
    evidenceRequired: ["gas/fee mechanics", "staking economics", "settlement activity", "client/governance risk", "L2 value-flow evidence"],
    hardRules: ["ETH must not show stablecoin reserve/redemption lens.", "L2 tokens must not be treated as direct ETH L1 economics."],
    boundaryCopy: "Base-layer settlement assets should not be evaluated with stablecoin reserve/redemption tests.",
    exampleAssets: ["ETH", "SOL", "AVAX", "SUI", "APT", "SEI"],
    wrongLensExamples: ["ETH receiving stablecoin redemption questions is a wrong-lens outcome."],
  }),
  lens({
    lensId: "L2_SCALING_TOKEN",
    displayName: "L2 Scaling Token",
    description: "Layer-2 governance/sequencer/economics lens, separate from the underlying L1.",
    appliesTo: "Rollup or L2 ecosystem tokens.",
    symbols: ["ARB", "OP", "STRK", "MATIC", "POL"],
    keywords: ["layer 2", "l2", "rollup", "sequencer", "scaling"],
    avoidSymbols: ["ETH", "SOL", "USDC", "WBTC", "STETH"],
    questions: [
      question("l2-01", "Does L2 activity accrue to the L2 token?", "Scaling usage can benefit users or sequencers without benefiting tokenholders.", ["sequencer revenue", "fee routing", "tokenholder rights"]),
      question("l2-02", "Is the token governance-only or economically necessary?", "Governance claims need evidence of enforceable economic value.", ["governance docs", "token utility", "protocol economics"]),
      question("l2-03", "Are bridge and withdrawal dependencies material?", "L2 exits and bridge assumptions are thesis-critical.", ["bridge design", "withdrawal rules", "security docs"]),
      question("l2-04", "Does the L2 inherit, leak, or compete with L1 value capture?", "The token should not be evaluated as native L1 exposure.", ["L1 settlement costs", "rollup economics", "sequencer design"]),
      question("l2-05", "What decentralization or admin controls remain?", "Upgrade and sequencer controls can dominate risk.", ["admin controls", "sequencer decentralization", "upgrade process"]),
    ],
    evidenceRequired: ["sequencer economics", "fee routing", "bridge/withdrawal rules", "governance rights", "admin controls"],
    hardRules: ["ARB/OP/STRK/MATIC/POL must not be treated as ETH L1 economics."],
    boundaryCopy: "L2 tokens do not automatically inherit the economics of the underlying L1.",
    exampleAssets: ["ARB", "OP", "STRK", "MATIC", "POL"],
    wrongLensExamples: ["ARB receiving ETH-native settlement economics as direct support is a wrong-lens outcome."],
  }),
  lens({
    lensId: "STABLECOIN_SETTLEMENT_ASSET",
    displayName: "Stablecoin Settlement Asset",
    description: "Reserve, redemption, issuer, custody, and legal-claim lens.",
    appliesTo: "Stablecoin settlement assets and synthetic fiat units.",
    symbols: ["USDC", "USDT", "DAI", "FRAX", "PYUSD"],
    keywords: ["stablecoin", "stable coin", "fiat", "reserve", "redemption", "peg"],
    avoidSymbols: ["ETH", "BTC", "SOL", "AVAX", "SUI", "APT", "SEI", "UNI", "AAVE", "LINK"],
    questions: [
      question("stable-01", "Are reserves independently attested?", "Reserve claims require direct, current, source-backed evidence.", ["reserve attestations", "reserve composition", "publisher/freshness"]),
      question("stable-02", "Is redemption available and to whom?", "Peg history is not the same as enforceable redemption access.", ["redemption terms", "issuer disclosures", "eligibility terms"]),
      question("stable-03", "What legal claim does the holder have?", "Legal clarity affects confidence and verdict boundaries.", ["legal disclosures", "issuer/custodian structure", "bankruptcy remoteness"]),
      question("stable-04", "What issuer or custodian dependencies exist?", "Issuer and custodian dependencies can be primary thesis risks.", ["custody agreements", "counterparty disclosures", "risk reports"]),
      question("stable-05", "What happens under stress or redemption pressure?", "Normal-market liquidity does not prove stress redemption quality.", ["stress history", "redemption limits", "reserve liquidity"]),
    ],
    evidenceRequired: ["reserve attestation", "redemption terms", "legal claim", "custody/issuer structure", "stress behavior"],
    hardRules: ["Stablecoin category does not prove reserves, redemption, or legal clarity.", "Stablecoin market cap must not prove reserves."],
    boundaryCopy: "Stablecoin reserve/redemption questions apply only to stablecoin-like assets, not L1 settlement tokens.",
    exampleAssets: ["USDC", "USDT", "DAI", "FRAX", "PYUSD"],
    wrongLensExamples: ["ETH must not receive stablecoin reserve/redemption questions."],
  }),
  lens({
    lensId: "WRAPPED_ASSET",
    displayName: "Wrapped Asset",
    description: "Wrapper, custodian, bridge, backing, and redeemability lens.",
    appliesTo: "Wrapped or bridged representations of another asset.",
    symbols: ["WBTC", "CBBTC", "TBTC"],
    keywords: ["wrapped", "bridged", "wrapper", "custody", "backed btc"],
    avoidSymbols: ["BTC", "ETH", "SOL", "USDC", "UNI"],
    questions: [
      question("wrapped-01", "Is backing/custody independently verifiable?", "The wrapper has its own dependency stack.", ["proof-of-reserves", "custodian process", "wrapper docs"]),
      question("wrapped-02", "Can holders redeem?", "Redeemability is separate from market liquidity.", ["redemption path", "merchant/custodian process", "terms"]),
      question("wrapped-03", "What bridge, custodian, or wrapper dependency exists?", "A wrapper can fail while the underlying remains strong.", ["custodian controls", "bridge design", "admin controls"]),
      question("wrapped-04", "Are proof-of-reserves and admin controls current?", "Outdated proof or opaque admin controls weaken confidence.", ["proof freshness", "contract controls", "audit reports"]),
      question("wrapped-05", "Can the wrapper fail while the underlying asset remains strong?", "Underlying quality is not automatic wrapper quality.", ["dependency evidence", "redemption stress", "custody risk"]),
    ],
    evidenceRequired: ["proof-of-reserves", "redemption path", "custodian controls", "admin controls", "wrapper docs"],
    hardRules: ["WBTC/cbBTC/tBTC must not inherit BTC monetary benchmark lens.", "Wrapped assets do not inherit underlying asset quality automatically."],
    boundaryCopy: "A wrapped asset does not inherit underlying asset quality automatically; custody, backing, and redeemability must be proven.",
    exampleAssets: ["WBTC", "cbBTC", "tBTC"],
    wrongLensExamples: ["WBTC routed as BTC monetary benchmark is a wrong-lens outcome."],
  }),
  lens({
    lensId: "LIQUID_STAKING_TOKEN",
    displayName: "Liquid Staking Token",
    description: "Derivative staking exposure, redemption, depeg, and validator-risk lens.",
    appliesTo: "Liquid staking tokens and staked-asset receipts.",
    symbols: ["STETH", "RETH", "CBETH", "WSTETH"],
    keywords: ["liquid staking", "lst", "staked", "staking derivative"],
    avoidSymbols: ["ETH", "BTC", "USDC"],
    questions: [
      question("lst-01", "Is staking exposure direct, derivative, or protocol-mediated?", "The asset is not the same as native L1 exposure.", ["staking docs", "receipt mechanics", "protocol terms"]),
      question("lst-02", "Can holders redeem for the underlying asset?", "Secondary liquidity is not redemption quality.", ["redemption queue", "withdrawal terms", "protocol docs"]),
      question("lst-03", "What slashing, validator, liquidity, or depeg risks exist?", "Derivative exposure adds risk beyond the underlying.", ["validator set", "slashing policy", "depeg history"]),
      question("lst-04", "Does liquidity depend on secondary markets?", "Market exits can fail while underlying withdrawals remain delayed.", ["pool liquidity", "venue data", "withdrawal timing"]),
      question("lst-05", "Can the derivative fail while the underlying remains strong?", "Derivative design can break independently of the L1.", ["contract/admin controls", "operator risk", "stress behavior"]),
    ],
    evidenceRequired: ["redemption terms", "slashing policy", "validator/operator risk", "liquidity depth", "depeg/stress history"],
    hardRules: ["stETH/rETH/cbETH/wstETH must not be treated as direct ETH L1 exposure."],
    boundaryCopy: "Liquid staking tokens are derivative exposures; they do not automatically inherit native L1 risk/return quality.",
    exampleAssets: ["stETH", "rETH", "cbETH", "wstETH"],
    wrongLensExamples: ["stETH routed as ETH L1 is a wrong-lens outcome."],
  }),
  lens({
    lensId: "RESTAKING_OR_LRT",
    displayName: "Restaking / LRT",
    description: "Restaking, rehypothecation, slashing, and layered-dependency lens.",
    appliesTo: "Restaked assets and liquid restaking tokens.",
    symbols: ["EIGEN", "EZETH", "WEETH", "RSETH"],
    keywords: ["restaking", "lrt", "liquid restaking", "avs"],
    questions: [
      question("lrt-01", "What additional slashing or AVS dependency exists?", "Restaking adds new risk layers beyond staking.", ["AVS docs", "slashing policy", "operator terms"]),
      question("lrt-02", "Is yield real, subsidized, or incentive-driven?", "Opaque or subsidy-heavy yield worsens risk.", ["yield source", "incentive schedule", "fee flow"]),
      question("lrt-03", "Can holders redeem through stress?", "Derivative liquidity can fail under pressure.", ["redemption terms", "withdrawal queue", "liquidity depth"]),
      question("lrt-04", "Are collateral and rehypothecation controls clear?", "Layered collateral needs explicit controls.", ["collateral controls", "risk docs", "audits"]),
      question("lrt-05", "Can the restaking layer fail while ETH remains strong?", "Underlying asset strength does not prove LRT quality.", ["dependency map", "operator risk", "stress evidence"]),
    ],
    evidenceRequired: ["slashing rules", "AVS dependency", "yield source", "redemption terms", "collateral controls"],
    hardRules: ["High yield must not prove quality.", "Restaking derivatives must not be treated as direct ETH exposure."],
    boundaryCopy: "Restaking/LRT assets require layered dependency evidence before supporting a thesis.",
    exampleAssets: ["EIGEN", "ezETH", "weETH"],
    wrongLensExamples: ["An LRT routed as native ETH exposure is a wrong-lens outcome."],
  }),
  lens({
    lensId: "DEFI_PROTOCOL_TOKEN",
    displayName: "DeFi Protocol Token",
    description: "Protocol usage, fee routing, governance, and tokenholder-accrual lens.",
    appliesTo: "DeFi governance/protocol tokens outside derivative/perps-specific rails.",
    symbols: ["UNI", "AAVE", "MKR", "SKY", "CRV", "COMP"],
    keywords: ["defi", "amm", "lending", "governance", "tvl", "protocol / tokenholder"],
    avoidSymbols: ["USDC", "USDT", "DAI", "BTC", "ETH", "LINK", "GRT"],
    questions: [
      question("defi-01", "Does protocol usage create tokenholder value?", "A useful protocol can leave the token economically weak.", ["tokenomics", "fee routing", "governance docs"]),
      question("defi-02", "Does TVL or volume translate into fees, burns, staking demand, or governance value?", "TVL and usage do not prove accrual.", ["protocol financials", "fee switch status", "revenue distribution"]),
      question("defi-03", "Is the fee switch active or theoretical?", "Optional economics should not be treated as current cash flow.", ["governance docs", "fee switch status", "revenue routing"]),
      question("defi-04", "Can the protocol succeed while the token underperforms?", "Product-market fit can bypass tokenholders.", ["tokenholder rights", "fee allocation", "governance capture"]),
      question("defi-05", "Are governance/admin risks material?", "Governance can alter economics, collateral, or risk.", ["governance docs", "admin controls", "audit reports"]),
    ],
    evidenceRequired: ["tokenomics", "fee routing", "fee switch status", "protocol financials", "governance/admin risk"],
    hardRules: ["UNI/AAVE/MKR/CRV/COMP must not imply protocol success equals tokenholder accrual.", "TVL/AUM/volume must not imply tokenholder value capture."],
    boundaryCopy: "Protocol usage, TVL, or AUM must not be treated as tokenholder value capture without direct evidence.",
    exampleAssets: ["UNI", "AAVE", "MKR", "SKY", "CRV", "COMP"],
    wrongLensExamples: ["USDC should not be treated as a DeFi protocol value-capture token."],
  }),
  lens({
    lensId: "DERIVATIVES_OR_PERPS_PROTOCOL",
    displayName: "Derivatives / Perps Protocol",
    description: "Trading protocol, fee routing, risk engine, liquidity, and token-accrual lens.",
    appliesTo: "Perpetuals, derivatives, synthetics, and trading venue protocol tokens.",
    symbols: ["GMX", "DYDX", "SNX"],
    keywords: ["perps", "perpetual", "derivatives", "synthetics", "trading protocol"],
    questions: [
      question("perps-01", "Do trading fees accrue to tokenholders?", "Venue usage matters only if value capture is direct.", ["fee routing", "staking rewards", "tokenholder claims"]),
      question("perps-02", "Is liquidity provider risk separated from tokenholder value?", "Protocol revenue can accrue to LPs rather than tokenholders.", ["LP docs", "fee splits", "risk engine"]),
      question("perps-03", "Can risk-engine failure impair the thesis?", "Perps protocols have oracle, liquidation, and counterparty risks.", ["risk engine docs", "oracle design", "incident history"]),
      question("perps-04", "Is volume organic and durable?", "Headline volume can overstate sustainable economic value.", ["volume quality", "incentives", "venue concentration"]),
      question("perps-05", "Are governance/admin controls material?", "Controls can alter markets, collateral, or fee routing.", ["governance docs", "admin keys", "audits"]),
    ],
    evidenceRequired: ["fee routing", "risk engine", "oracle design", "volume quality", "governance/admin controls"],
    hardRules: ["Volume alone does not prove institutional exit depth or tokenholder accrual."],
    boundaryCopy: "Derivatives protocol volume must be mapped to tokenholder economics before supporting a thesis.",
    exampleAssets: ["GMX", "DYDX", "SNX"],
    wrongLensExamples: ["Trading volume shown as direct token support without fee-routing evidence is unsafe."],
  }),
  lens({
    lensId: "ORACLE_OR_INFRASTRUCTURE",
    displayName: "Oracle / Infrastructure",
    description: "Network necessity, payer mapping, staking/security, and token-demand lens.",
    appliesTo: "Oracle, indexing, middleware, and infrastructure utility tokens.",
    symbols: ["LINK", "GRT"],
    keywords: ["oracle", "infrastructure", "indexing", "middleware", "data network"],
    avoidSymbols: ["UNI", "AAVE", "USDC", "BTC", "ETH"],
    questions: [
      question("infra-01", "Is the token structurally necessary for the network?", "Important infrastructure does not automatically create token value.", ["network docs", "token role", "service requirements"]),
      question("infra-02", "Does network usage accrue to tokenholders?", "Customer adoption can bypass token demand.", ["payer mapping", "fee flow", "staking economics"]),
      question("infra-03", "Is payer mapping clear?", "Demand should be observable and connected to the token thesis.", ["customer usage", "payment docs", "provider/source evidence"]),
      question("infra-04", "Are staking/security economics economically necessary?", "Utility claims need evidence of economic necessity.", ["staking docs", "security role", "slashing/service guarantees"]),
      question("infra-05", "Can customers use the product while bypassing token demand?", "Off-chain or abstraction models can weaken token capture.", ["payment rails", "enterprise contracts", "token abstraction docs"]),
    ],
    evidenceRequired: ["token necessity", "payer mapping", "staking/security role", "customer usage", "fee flow"],
    hardRules: ["LINK/GRT/infrastructure assets must not imply network importance equals tokenholder value capture."],
    boundaryCopy: "Network importance does not automatically mean tokenholder value capture.",
    exampleAssets: ["LINK", "GRT"],
    wrongLensExamples: ["LINK routed as generic DeFi TVL value capture is a wrong-lens outcome."],
  }),
  lens({
    lensId: "COMPUTE_STORAGE_DEPIN",
    displayName: "Compute / Storage / DePIN",
    description: "Real resource demand, payer mapping, supply-side economics, and token-necessity lens.",
    appliesTo: "Compute, storage, rendering, wireless, and physical infrastructure networks.",
    symbols: ["FIL", "AR", "RNDR", "RENDER", "AKT", "HNT"],
    keywords: ["compute", "storage", "depin", "render", "wireless", "physical infrastructure"],
    questions: [
      question("depin-01", "Is resource demand real and measurable?", "Narrative demand should not be promoted into usage proof.", ["usage metrics", "customer demand", "network utilization"]),
      question("depin-02", "Does usage create durable token demand?", "Resource networks can use tokens without accruing value to holders.", ["payment flow", "burn/mint mechanics", "staking requirements"]),
      question("depin-03", "Are supply-side incentives sustainable?", "Subsidy-driven participation can fade.", ["incentive schedules", "provider economics", "emissions"]),
      question("depin-04", "Is service quality competitive?", "Demand requires usable service, not only network supply.", ["service benchmarks", "customer evidence", "uptime/reliability"]),
      question("depin-05", "Can off-chain customers bypass token exposure?", "Enterprise demand may not map to tokenholder value.", ["payment abstraction", "enterprise contracts", "token settlement docs"]),
    ],
    evidenceRequired: ["usage metrics", "payer mapping", "incentive economics", "service quality", "token necessity"],
    hardRules: ["Partnerships must not prove adoption.", "Network usage must be mapped to tokenholder economics."],
    boundaryCopy: "Compute/storage/DePIN narratives need measurable demand and token-necessity evidence.",
    exampleAssets: ["FIL", "AR", "RNDR", "RENDER", "AKT", "HNT"],
    wrongLensExamples: ["Announced infrastructure demand without usage/payment evidence is not support."],
  }),
  lens({
    lensId: "EXCHANGE_OR_PLATFORM_TOKEN",
    displayName: "Exchange / Platform Token",
    description: "Platform dependency, fee discounts, burns, issuer control, and jurisdiction-risk lens.",
    appliesTo: "Centralized exchange or platform ecosystem tokens.",
    symbols: ["BNB", "OKB", "CRO", "LEO", "KCS"],
    keywords: ["exchange", "platform token", "fee discount", "burn"],
    questions: [
      question("platform-01", "Does platform usage accrue to tokenholders?", "Exchange success may not confer enforceable holder rights.", ["burn mechanics", "fee discount terms", "tokenholder rights"]),
      question("platform-02", "What issuer/platform dependency exists?", "Platform operating risk can dominate token risk.", ["issuer disclosures", "platform docs", "regulatory status"]),
      question("platform-03", "Are burns or benefits discretionary?", "Discretionary economics should not be treated as guaranteed accrual.", ["burn policy", "governance terms", "historical execution"]),
      question("platform-04", "What jurisdiction or licensing risk applies?", "Exchange/platform tokens can be heavily jurisdiction-dependent.", ["licensing disclosures", "regulatory actions", "access restrictions"]),
      question("platform-05", "Can users access the platform without token exposure?", "Utility can exist without durable token demand.", ["user benefit terms", "fee schedule", "product docs"]),
    ],
    evidenceRequired: ["burn/benefit policy", "issuer dependency", "regulatory status", "tokenholder rights", "platform usage"],
    hardRules: ["Platform success must not be treated as enforceable tokenholder value without evidence."],
    boundaryCopy: "Platform-token benefits require issuer, rights, and policy evidence before supporting a thesis.",
    exampleAssets: ["BNB", "OKB", "CRO", "LEO", "KCS"],
    wrongLensExamples: ["Exchange volume alone is not tokenholder value capture."],
  }),
  lens({
    lensId: "PAYMENTS_OR_SETTLEMENT_NETWORK",
    displayName: "Payments / Settlement Network",
    description: "Payment utility, institutional usage, fee capture, and issuer/network-dependency lens.",
    appliesTo: "Payment or settlement network tokens that are not stablecoins.",
    symbols: ["XRP", "XLM", "TRX"],
    keywords: ["payments", "settlement network", "remittance", "payment network"],
    avoidSymbols: ["USDC", "USDT", "DAI", "ETH", "SOL"],
    questions: [
      question("payments-01", "Is payment usage measurable and organic?", "Narrative payment adoption needs evidence.", ["transaction activity", "partner usage evidence", "settlement metrics"]),
      question("payments-02", "Does usage require or accrue to the token?", "Network usage can occur without tokenholder value capture.", ["fee mechanics", "token role", "enterprise payment docs"]),
      question("payments-03", "Is institutional adoption real usage or announcement-only?", "Partnerships are not proof of adoption.", ["production usage", "customer disclosures", "settlement volumes"]),
      question("payments-04", "Are issuer/network dependencies material?", "Central dependencies can alter access or economics.", ["issuer docs", "validator/control model", "governance"]),
      question("payments-05", "What regulatory or jurisdictional risk applies?", "Payment rails can be sensitive to legal access and compliance.", ["regulatory disclosures", "jurisdictional access", "compliance docs"]),
    ],
    evidenceRequired: ["production usage", "fee mechanics", "token role", "partner/customer evidence", "regulatory status"],
    hardRules: ["Partnership announcements must not prove usage or adoption."],
    boundaryCopy: "Payment-network narratives require measurable usage and token-role evidence.",
    exampleAssets: ["XRP", "XLM", "TRX"],
    wrongLensExamples: ["Payment volume without token-demand mapping is not institutional support."],
  }),
  lens({
    lensId: "PRIVACY_ASSET",
    displayName: "Privacy Asset",
    description: "Privacy utility, liquidity/access, regulatory, and survivability lens.",
    appliesTo: "Privacy-preserving monetary or transaction assets.",
    symbols: ["XMR", "ZEC"],
    keywords: ["privacy", "private transactions", "shielded"],
    questions: [
      question("privacy-01", "Is privacy utility durable and differentiated?", "The thesis depends on real privacy demand and resilience.", ["protocol docs", "usage evidence", "privacy model"]),
      question("privacy-02", "Is liquidity/access sufficient for institutional exits?", "Access restrictions can impair allocation feasibility.", ["venue availability", "liquidity depth", "jurisdictional access"]),
      question("privacy-03", "What regulatory or delisting risk applies?", "Privacy assets can face direct market-access constraints.", ["exchange listings", "regulatory history", "compliance constraints"]),
      question("privacy-04", "Is supply/security discipline credible?", "Privacy does not remove monetary/security diligence.", ["issuance rules", "network security", "development history"]),
      question("privacy-05", "What would falsify the privacy thesis?", "Technical or regulatory breaks can invalidate the thesis.", ["privacy breaks", "delisting stress", "security incidents"]),
    ],
    evidenceRequired: ["privacy model", "liquidity/access", "regulatory risk", "security/supply", "falsification triggers"],
    hardRules: ["Privacy utility does not automatically imply institutional investability."],
    boundaryCopy: "Privacy assets require access and regulatory-risk evidence in addition to technical utility.",
    exampleAssets: ["XMR", "ZEC"],
    wrongLensExamples: ["Privacy assets should not be evaluated as generic DeFi token capture."],
  }),
  lens({
    lensId: "MEME_OR_NARRATIVE",
    displayName: "Meme / Narrative Asset",
    description: "Narrative reflexivity, liquidity durability, concentration, and falsification lens.",
    appliesTo: "Meme, attention, and reflexive narrative tokens.",
    symbols: ["DOGE", "SHIB", "PEPE", "WIF", "BONK"],
    keywords: ["meme", "narrative", "community", "attention"],
    avoidKeywords: ["protocol / tokenholder", "stablecoin", "wrapped"],
    questions: [
      question("meme-01", "Is liquidity durable?", "Narrative liquidity can disappear quickly.", ["venue liquidity", "depth/slippage", "stress behavior"]),
      question("meme-02", "Is holder concentration high?", "Insider or whale concentration can dominate risk.", ["holder data", "distribution", "unlock/insider risk"]),
      question("meme-03", "Is narrative reflexivity the primary driver?", "Attention should not be mistaken for fundamentals.", ["attention data", "community activity", "liquidity trends"]),
      question("meme-04", "What would invalidate the narrative?", "Narrative assets need explicit falsification triggers.", ["liquidity deterioration", "attention decay", "distribution risk"]),
      question("meme-05", "Is there any enforceable utility or value capture?", "If not, the lens should stay narrative/liquidity focused.", ["token utility", "official docs", "economic rights"]),
    ],
    evidenceRequired: ["liquidity durability", "holder concentration", "attention durability", "distribution risk", "falsification triggers"],
    hardRules: ["DOGE/SHIB/PEPE/WIF/BONK must not receive fundamentals-style protocol value capture.", "Meme attention is not fundamentals."],
    boundaryCopy: "Meme attention is not fundamentals; this lens focuses on liquidity, concentration, and narrative failure triggers.",
    exampleAssets: ["DOGE", "SHIB", "PEPE", "WIF", "BONK"],
    wrongLensExamples: ["PEPE routed as DeFi value capture is a wrong-lens outcome."],
  }),
  lens({
    lensId: "GAMING_METAVERSE_CONSUMER",
    displayName: "Gaming / Metaverse / Consumer",
    description: "Consumer adoption, in-game utility, treasury/emissions, and token-necessity lens.",
    appliesTo: "Gaming, metaverse, and consumer application tokens.",
    symbols: ["IMX", "SAND", "MANA", "AXS", "GALA"],
    keywords: ["gaming", "metaverse", "consumer", "game", "nft"],
    questions: [
      question("gaming-01", "Is user activity durable beyond incentives?", "Subsidized users should not be treated as organic adoption.", ["active users", "retention", "incentive schedule"]),
      question("gaming-02", "Is the token necessary for the product?", "Consumer product success can bypass token demand.", ["token utility", "in-game economy", "payment flow"]),
      question("gaming-03", "Do revenues or fees accrue to tokenholders?", "Product revenue is not automatically tokenholder value.", ["revenue routing", "tokenholder rights", "treasury policy"]),
      question("gaming-04", "Are emissions or unlocks material?", "Token supply can overwhelm adoption narratives.", ["unlock schedule", "emissions", "treasury disclosures"]),
      question("gaming-05", "What would falsify consumer adoption?", "Consumer theses need measurable retention and usage triggers.", ["retention decline", "user churn", "economy failure"]),
    ],
    evidenceRequired: ["active users", "retention", "token necessity", "revenue routing", "emissions/unlocks"],
    hardRules: ["Product popularity does not automatically create tokenholder value."],
    boundaryCopy: "Consumer adoption must be mapped to token necessity and holder economics before supporting a thesis.",
    exampleAssets: ["IMX", "SAND", "MANA", "AXS", "GALA"],
    wrongLensExamples: ["Game usage without token-demand mapping is not value capture."],
  }),
  lens({
    lensId: "RWA_OR_HYBRID_METHODOLOGY",
    displayName: "RWA / Hybrid Finance Methodology",
    description: "Tokenized asset, legal claim, redemption, custody, collateral, and yield-quality lens.",
    appliesTo: "RWA, tokenized treasury/credit/fund, or Hybrid Finance methodology contexts.",
    symbols: ["ONDO", "CFG", "MPL"],
    keywords: ["rwa", "tokenized", "real world", "treasury", "private credit", "hybrid finance"],
    questions: [
      question("rwa-01", "Is the underlying asset identifiable?", "Tokenized claims need a real, traceable underlying asset.", ["issuer docs", "asset description", "custody/collateral records"]),
      question("rwa-02", "Does the tokenholder have enforceable rights?", "No enforceable rights means the narrative cannot support a Capital-Worthy verdict.", ["legal claim", "fund/security terms", "jurisdictional access"]),
      question("rwa-03", "Is redemption clear?", "Secondary liquidity is not proof of redemption quality.", ["redemption path", "NAV mechanics", "issuer/custodian terms"]),
      question("rwa-04", "Is custody/collateral verifiable?", "Collateral control and custody are thesis-critical.", ["custody agreement", "attestations", "collateral controls"]),
      question("rwa-05", "Does AUM/tokenization activity accrue to tokenholders?", "Protocol AUM does not imply token accrual.", ["fee routing", "tokenholder rights", "cash-flow evidence"]),
      question("rwa-06", "Is yield real or subsidized?", "Opaque yield worsens risk rather than improving quality.", ["yield source", "risk disclosures", "subsidy/incentive data"]),
      question("rwa-07", "Is institutional usage measurable?", "Narrative adoption must become source-backed usage.", ["institutional usage evidence", "publisher/date/freshness", "contradiction checks"]),
    ],
    evidenceRequired: ["underlying asset", "legal claim", "redemption path", "custody/collateral", "yield source", "institutional usage"],
    hardRules: ["ONDO/RWA/Hybrid assets must not imply enforceable rights, redemption, custody, or legal claim without source-backed evidence.", "Hybrid Finance is methodology/future-compatible unless source-backed evidence is attached."],
    boundaryCopy: "Hybrid/RWA content is methodology/future-compatible unless source-backed evidence is attached; it is not live Hybrid Finance scoring.",
    exampleAssets: ["ONDO", "CFG", "MPL"],
    wrongLensExamples: ["AUM or tokenization activity without tokenholder-rights evidence is not value capture."],
  }),
  lens({
    lensId: "BRIDGE_OR_INTEROPERABILITY",
    displayName: "Bridge / Interoperability",
    description: "Bridge security, liquidity, message-passing, validator, and dependency-risk lens.",
    appliesTo: "Bridge and interoperability protocol tokens.",
    symbols: ["AXL", "REN"],
    keywords: ["bridge", "interoperability", "cross-chain", "message passing"],
    questions: [
      question("bridge-01", "What bridge or message-passing trust assumption exists?", "Cross-chain systems can fail through dependency breaks.", ["bridge docs", "validator set", "trust model"]),
      question("bridge-02", "Does usage accrue to the token?", "Bridge volume does not automatically create tokenholder value.", ["fee routing", "token utility", "staking/security role"]),
      question("bridge-03", "Are wrapped/liquidity dependencies material?", "Bridge assets can depend on liquidity and wrapper mechanisms.", ["liquidity model", "wrapper docs", "custody controls"]),
      question("bridge-04", "What exploit or admin-control risk exists?", "Bridge exploits can be existential.", ["audit reports", "incident history", "admin controls"]),
      question("bridge-05", "Is interoperability demand durable?", "Cross-chain demand can migrate or collapse.", ["usage metrics", "customer adoption", "route concentration"]),
    ],
    evidenceRequired: ["trust model", "fee routing", "validator/security role", "audit/incident history", "usage durability"],
    hardRules: ["Bridge volume must not imply tokenholder value capture without fee/token-role evidence."],
    boundaryCopy: "Bridge/interoperability tokens require dependency and security evidence before supporting a thesis.",
    exampleAssets: ["AXL", "REN"],
    wrongLensExamples: ["Bridge usage without token economics is not tokenholder support."],
  }),
  lens({
    lensId: "GENERAL_LOW_COVERAGE",
    displayName: "General Low-Coverage Asset",
    description: "Fallback lens when the frontend cannot classify the asset safely.",
    appliesTo: "Unknown or ambiguous assets where current metadata is not enough for a specialized lens.",
    keywords: ["unknown", "general", "low coverage", "unclassified"],
    questions: [
      question("general-01", "Is asset identity verified?", "Classification should precede specialized diligence.", ["asset metadata", "official docs", "provider context"]),
      question("general-02", "Are official docs available?", "Low coverage should lead to review leads, not fake answers.", ["official links", "whitepaper/docs", "source review"]),
      question("general-03", "Is liquidity real?", "Basic market structure still matters before deeper thesis work.", ["volume/liquidity context", "venue quality", "depth/slippage"]),
      question("general-04", "Are contract/admin risks known?", "Unknown control surfaces can dominate risk.", ["contract risk flags", "audit reports", "admin controls"]),
      question("general-05", "What evidence is missing before classification?", "Ambiguity should fall back to conservative review.", ["provider diagnostics", "source candidates", "manual review"]),
    ],
    evidenceRequired: ["asset identity", "official docs", "liquidity context", "contract/admin risk", "classification evidence"],
    hardRules: ["If ambiguous, fallback to GENERAL_LOW_COVERAGE.", "Do not promote adjacent provider context into specialized lens support."],
    boundaryCopy: "The UI falls back to a general methodology lens when asset metadata is ambiguous.",
    exampleAssets: ["Unknown"],
    wrongLensExamples: ["Unknown assets should not receive specialized stablecoin, DeFi, or RWA claims by default."],
  }),
];

const LENS_BY_ID = Object.fromEntries(INSTITUTIONAL_CHECKLIST_LENSES.map((entry) => [entry.lensId, entry]));

function normalizeSymbol(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(normalizeText).filter(Boolean).join(" ");
  if (typeof value === "object") return Object.values(value).map(normalizeText).filter(Boolean).join(" ");
  return String(value).toLowerCase();
}

function signalBucket(source, value) {
  return {
    source,
    text: normalizeText(value),
  };
}

function buildResolverContext(asset = {}, analysis = {}, decisionModel = {}) {
  const symbol = normalizeSymbol(asset?.symbol || decisionModel?.symbol || decisionModel?.assetSymbol);
  const name = String(asset?.name || decisionModel?.assetName || "").trim();
  const signalBuckets = [
    signalBucket("symbol pattern", symbol),
    signalBucket("asset name", name),
    signalBucket("asset category/tag", [asset?.category, asset?.assetClass, asset?.assetType, asset?.chain, asset?.tags]),
    signalBucket("analysis asset classification", analysis?.assetClassification),
    signalBucket("analysis sector classification", analysis?.sectorClassification),
    signalBucket("asset class label", [decisionModel?.assetClass, decisionModel?.assetSubtype, decisionModel?.assetClassLabel]),
    signalBucket("asset framing label", decisionModel?.assetFramingLabel),
    signalBucket("sector/model metadata", [decisionModel?.primarySector, decisionModel?.secondarySectors, decisionModel?.assetBadges]),
  ].filter((bucket) => bucket.text);

  return {
    symbol,
    name,
    signalBuckets,
    text: normalizeText(signalBuckets.map((bucket) => bucket.text)),
  };
}

function scoreLens(entry, context) {
  const matchedSignals = [];
  const independentSources = new Set();
  let score = 0;
  const symbols = entry.routingSignals?.symbols || [];
  const keywords = entry.routingSignals?.keywords || [];
  const avoidSymbols = entry.avoidIf?.symbols || [];
  const avoidKeywords = entry.avoidIf?.keywords || [];

  if (context.symbol && avoidSymbols.map(normalizeSymbol).includes(context.symbol)) {
    return { score: -1, matchedSignals, avoidWarnings: [`${context.symbol} is excluded from ${entry.displayName}.`] };
  }

  const blockedKeyword = avoidKeywords.find((keyword) => keyword && context.text.includes(String(keyword).toLowerCase()));
  if (blockedKeyword) {
    return { score: -1, matchedSignals, avoidWarnings: [`Matched avoid keyword "${blockedKeyword}" for ${entry.displayName}.`] };
  }

  if (context.symbol && symbols.map(normalizeSymbol).includes(context.symbol)) {
    score += 100;
    matchedSignals.push(`symbol: ${context.symbol}`);
    independentSources.add("exact symbol");
  }

  keywords.forEach((keyword) => {
    const normalized = String(keyword || "").toLowerCase();
    if (!normalized) return;
    context.signalBuckets.forEach((bucket) => {
      if (!bucket.text.includes(normalized)) return;
      score += 8;
      independentSources.add(bucket.source);
      matchedSignals.push(`${bucket.source}: ${keyword}`);
    });
  });

  return {
    score,
    matchedSignals: [...new Set(matchedSignals)],
    avoidWarnings: [],
    exactSymbolMatch: independentSources.has("exact symbol"),
    independentSignalCount: independentSources.has("exact symbol")
      ? independentSources.size - 1
      : independentSources.size,
  };
}

function confidenceForScore(score) {
  if (score >= 100) return "high";
  if (score >= 16) return "medium";
  return "low";
}

function fallbackResolution(context, reason = "No specialized lens matched strongly enough from current frontend metadata.") {
  const entry = LENS_BY_ID.GENERAL_LOW_COVERAGE;
  return {
    lensId: entry.lensId,
    displayName: entry.displayName,
    confidence: "low",
    reason,
    matchedSignals: context.symbol ? [`symbol: ${context.symbol}`] : ["frontend metadata ambiguous"],
    avoidWarnings: GLOBAL_WRONG_LENS_SAFEGUARDS,
    entry,
  };
}

function hasStrongMetadataSupport(candidate) {
  if (candidate.exactSymbolMatch) return true;
  if (candidate.entry.lensId === "GENERAL_LOW_COVERAGE") return true;
  return candidate.independentSignalCount >= 2;
}

export function resolveInstitutionalChecklistLens(asset = {}, analysis = {}, decisionModel = {}) {
  const context = buildResolverContext(asset, analysis, decisionModel);
  const scored = LENS_PRIORITY
    .map((lensId) => LENS_BY_ID[lensId])
    .filter(Boolean)
    .map((entry) => ({ entry, ...scoreLens(entry, context) }))
    .filter((candidate) => candidate.score > 0);

  if (!scored.length) return fallbackResolution(context);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return LENS_PRIORITY.indexOf(a.entry.lensId) - LENS_PRIORITY.indexOf(b.entry.lensId);
  });

  const top = scored[0];
  const second = scored[1];
  if (second && second.score === top.score && top.score < 100) {
    return fallbackResolution(context, `Ambiguous metadata matched both ${top.entry.displayName} and ${second.entry.displayName}; using conservative fallback.`);
  }

  if (!hasStrongMetadataSupport(top)) {
    return fallbackResolution(context, "Insufficient independent routing signals; using general low-coverage methodology lens.");
  }

  const globalWarnings = GLOBAL_WRONG_LENS_SAFEGUARDS.filter((warning) => {
    const lower = warning.toLowerCase();
    return top.entry.hardRules.some((rule) => lower.includes(rule.toLowerCase().slice(0, 18))) ||
      top.entry.boundaryCopy.toLowerCase().includes(lower.slice(0, 18));
  });

  return {
    lensId: top.entry.lensId,
    displayName: top.entry.displayName,
    confidence: confidenceForScore(top.score),
    reason: top.score >= 100
      ? `Matched exact demo-safe symbol routing for ${context.symbol}.`
      : `Matched ${top.independentSignalCount} independent frontend metadata signals; no question-level evidence mapping is implied.`,
    matchedSignals: top.matchedSignals.slice(0, 5),
    avoidWarnings: [
      ...new Set([
        ...top.avoidWarnings,
        ...top.entry.hardRules,
        ...globalWarnings,
      ]),
    ].slice(0, 6),
    entry: top.entry,
  };
}

const IDENTITY_DISPLAY_BY_LENS = {
  MONETARY_BENCHMARK_NATIVE: {
    displayAssetClass: "Monetary Benchmark / Native Asset",
    displayFraming: "Native Monetary Asset",
    primaryChip: "Monetary Benchmark",
    secondaryChip: "Native Asset",
  },
  BASE_LAYER_SETTLEMENT_L1: {
    displayAssetClass: "Base-Layer Settlement Asset",
    displayFraming: "Native Gas / Settlement Asset",
    primaryChip: "L1",
    secondaryChip: "Settlement Asset",
  },
  L2_SCALING_TOKEN: {
    displayAssetClass: "L2 / Scaling Token",
    displayFraming: "Scaling Network Token",
    primaryChip: "L2 Economics Lens",
    secondaryChip: "Scaling Token",
  },
  STABLECOIN_SETTLEMENT_ASSET: {
    displayAssetClass: "Stablecoin / Settlement Asset",
    displayFraming: "Trust / Settlement Asset",
    primaryChip: "Stablecoin",
    secondaryChip: "Reserve / Redemption Lens",
  },
  WRAPPED_ASSET: {
    displayAssetClass: "Wrapped Asset / Custody Dependency",
    displayFraming: "Wrapped BTC Exposure",
    primaryChip: "Wrapped Asset",
    secondaryChip: "Custody / Redeemability Lens",
  },
  LIQUID_STAKING_TOKEN: {
    displayAssetClass: "Liquid Staking Token",
    displayFraming: "Staked ETH Derivative",
    primaryChip: "LST",
    secondaryChip: "Staking / Redemption Lens",
  },
  RESTAKING_OR_LRT: {
    displayAssetClass: "Restaking / LRT Asset",
    displayFraming: "Layered Staking Dependency",
    primaryChip: "Restaking Lens",
    secondaryChip: "Slashing / Dependency Risk",
  },
  DEFI_PROTOCOL_TOKEN: {
    displayAssetClass: "DeFi Protocol Token",
    displayFraming: "Tokenholder Value-Capture Thesis",
    primaryChip: "DeFi Protocol",
    secondaryChip: "Protocol Economics Lens",
  },
  DERIVATIVES_OR_PERPS_PROTOCOL: {
    displayAssetClass: "Derivatives / Perps Protocol",
    displayFraming: "Trading Venue Economics Lens",
    primaryChip: "Perps Protocol",
    secondaryChip: "Fee / Risk Engine Lens",
  },
  ORACLE_OR_INFRASTRUCTURE: {
    displayAssetClass: "Oracle / Infrastructure Asset",
    displayFraming: "Network Infrastructure Token",
    primaryChip: "Oracle / Infrastructure",
    secondaryChip: "Token Necessity Lens",
  },
  COMPUTE_STORAGE_DEPIN: {
    displayAssetClass: "Compute / Storage / DePIN Asset",
    displayFraming: "Resource Network Token",
    primaryChip: "DePIN / Compute",
    secondaryChip: "Usage / Payer Mapping Lens",
  },
  EXCHANGE_OR_PLATFORM_TOKEN: {
    displayAssetClass: "Exchange / Platform Token",
    displayFraming: "Platform Utility / Issuer Dependency Lens",
    primaryChip: "Platform Token",
    secondaryChip: "Issuer Dependency Lens",
  },
  PAYMENTS_OR_SETTLEMENT_NETWORK: {
    displayAssetClass: "Payments / Settlement Network",
    displayFraming: "Payments Network Token",
    primaryChip: "Payments Network",
    secondaryChip: "Settlement Network Lens",
  },
  PRIVACY_ASSET: {
    displayAssetClass: "Privacy Asset",
    displayFraming: "Privacy / Access Risk Lens",
    primaryChip: "Privacy Asset",
    secondaryChip: "Access / Regulatory Lens",
  },
  MEME_OR_NARRATIVE: {
    displayAssetClass: "Meme / Narrative Asset",
    displayFraming: "Narrative / Liquidity Thesis",
    primaryChip: "Meme / Narrative",
    secondaryChip: "Reflexivity Lens",
  },
  GAMING_METAVERSE_CONSUMER: {
    displayAssetClass: "Gaming / Metaverse / Consumer Token",
    displayFraming: "Consumer Adoption / Token Necessity Lens",
    primaryChip: "Gaming / Consumer",
    secondaryChip: "Retention / Utility Lens",
  },
  RWA_OR_HYBRID_METHODOLOGY: {
    displayAssetClass: "RWA / Hybrid Methodology Asset",
    displayFraming: "Tokenized Asset Methodology Lens",
    primaryChip: "RWA / Hybrid",
    secondaryChip: "Rights / Redemption Review",
  },
  BRIDGE_OR_INTEROPERABILITY: {
    displayAssetClass: "Bridge / Interoperability Token",
    displayFraming: "Cross-Chain Dependency Lens",
    primaryChip: "Bridge / Interop",
    secondaryChip: "Trust / Security Lens",
  },
  GENERAL_LOW_COVERAGE: {
    displayAssetClass: "General Low-Coverage Asset",
    displayFraming: "Manual Classification Needed",
    primaryChip: "General Methodology Lens",
    secondaryChip: "Low-Coverage Review",
  },
};

const BACKEND_IDENTITY_DISPLAY_BY_LENS = {
  NATIVE_MONETARY_BENCHMARK: {
    displayAssetClass: "Base-Layer / Monetary Benchmark Asset",
    displayFraming: "Monetary Benchmark Thesis",
    primaryChip: "Monetary Benchmark",
    secondaryChip: "Native Asset",
  },
  BASE_LAYER_SETTLEMENT: {
    displayAssetClass: "Base-Layer / Settlement Asset",
    displayFraming: "Base-Layer Settlement Thesis",
    primaryChip: "Base Layer",
    secondaryChip: "Settlement / Security Lens",
  },
  PAYMENTS_SETTLEMENT: {
    displayAssetClass: "Payments / Settlement Network Token",
    displayFraming: "Payments Settlement Network Thesis",
    primaryChip: "Payments Network",
    secondaryChip: "Fees / Finality Lens",
  },
  GAMING_METAVERSE_CONSUMER: {
    displayAssetClass: "Gaming / GameFi Utility Token",
    displayFraming: "Gaming Demand / Token Sink Thesis",
    primaryChip: "Gaming / GameFi",
    secondaryChip: "Users / Emissions Lens",
  },
  RWA_HYBRID_INFRASTRUCTURE: {
    displayAssetClass: "RWA Infrastructure / Hybrid Utility Token",
    displayFraming: "RWA Infrastructure Utility Thesis",
    primaryChip: "RWA Infrastructure",
    secondaryChip: "Utility vs Rights Lens",
  },
  RWA_HYBRID_ASSET: {
    displayAssetClass: "Tokenized Asset / RWA Thesis",
    displayFraming: "RWA Rights / Redemption Thesis",
    primaryChip: "RWA / Hybrid",
    secondaryChip: "Legal / Custody Lens",
  },
  DEFI_PROTOCOL_TOKEN: {
    displayAssetClass: "DeFi Protocol Token / Value-Capture Thesis",
    displayFraming: "Protocol Tokenholder Accrual Thesis",
    primaryChip: "DeFi Protocol",
    secondaryChip: "Fee / Governance Lens",
  },
  L2_GOVERNANCE_TOKEN: {
    displayAssetClass: "L2 Governance Token / Value-Capture Thesis",
    displayFraming: "L2 Governance Economics Thesis",
    primaryChip: "L2 Governance",
    secondaryChip: "Sequencer / Fee Lens",
  },
  STABLECOIN_SETTLEMENT: {
    displayAssetClass: "Stablecoin / Settlement Trust Asset",
    displayFraming: "Stablecoin Trust / Redemption Thesis",
    primaryChip: "Stablecoin",
    secondaryChip: "Reserve / Issuer Lens",
  },
  WRAPPED_ASSET: {
    displayAssetClass: "Wrapped Asset / Backing & Redemption Thesis",
    displayFraming: "Wrapped Representation Dependency Thesis",
    primaryChip: "Wrapped Asset",
    secondaryChip: "Backing / Redemption Lens",
  },
  LST_STAKING_DERIVATIVE: {
    displayAssetClass: "Liquid Staking Token / Redemption & Slashing Thesis",
    displayFraming: "Liquid Staking Derivative Thesis",
    primaryChip: "LST",
    secondaryChip: "Withdrawal / Slashing Lens",
  },
  ORACLE_INFRASTRUCTURE: {
    displayAssetClass: "Oracle / Infrastructure Token",
    displayFraming: "Oracle Token Necessity Thesis",
    primaryChip: "Oracle / Infrastructure",
    secondaryChip: "Service Payment Lens",
  },
  DEPENDENCY_INFRASTRUCTURE: {
    displayAssetClass: "Dependency Infrastructure Token",
    displayFraming: "Infrastructure Token Necessity Thesis",
    primaryChip: "Infrastructure",
    secondaryChip: "Payer Mapping Lens",
  },
  DEPIN_COMPUTE_STORAGE: {
    displayAssetClass: "DePIN Infrastructure Token",
    displayFraming: "Resource Network Demand Thesis",
    primaryChip: "DePIN / Resource",
    secondaryChip: "Payer / Provider Lens",
  },
  MEME_NARRATIVE: {
    displayAssetClass: "Meme / Narrative Asset",
    displayFraming: "Narrative / Liquidity Thesis",
    primaryChip: "Meme / Narrative",
    secondaryChip: "Tradability Boundary",
  },
};

function backendLensIsUsable(lens) {
  return Boolean(
    lens?.lensId &&
    lens.confidence === "high" &&
    !["GENERAL_LOW_COVERAGE", "AMBIGUOUS_MANUAL_CLASSIFICATION"].includes(lens.lensId),
  );
}

export function buildInstitutionalAssetIdentity(asset = {}, analysis = {}, decisionModel = {}) {
  const backendLens = decisionModel?.resolvedInstitutionalLens || analysis?.resolvedInstitutionalLens;
  if (backendLensIsUsable(backendLens) && BACKEND_IDENTITY_DISPLAY_BY_LENS[backendLens.lensId]) {
    const display = BACKEND_IDENTITY_DISPLAY_BY_LENS[backendLens.lensId];
    return {
      ...display,
      lensId: backendLens.lensId,
      lensDisplayName: backendLens.label || display.displayAssetClass,
      confidence: backendLens.confidence,
      reason: "Using high-confidence backend resolvedInstitutionalLens for primary product framing.",
      matchedSignals: backendLens.matchedSignals || [],
      boundaryCopy: "Resolved lens controls display framing only; provider metadata is classification context, not reviewed evidence or scoring input.",
      originalAssetClassLabel: decisionModel?.assetClassLabel || null,
      originalAssetFramingLabel: decisionModel?.assetFramingLabel || null,
      originalAssetBadges: decisionModel?.assetBadges || [],
    };
  }

  const resolution = resolveInstitutionalChecklistLens(asset, analysis, decisionModel);
  const display = IDENTITY_DISPLAY_BY_LENS[resolution.lensId] || IDENTITY_DISPLAY_BY_LENS.GENERAL_LOW_COVERAGE;

  return {
    ...display,
    lensId: resolution.lensId,
    lensDisplayName: resolution.displayName,
    confidence: resolution.confidence,
    reason: resolution.reason,
    matchedSignals: resolution.matchedSignals,
    boundaryCopy: resolution.entry?.boundaryCopy || "Display identity is methodology-only and does not affect scoring.",
    originalAssetClassLabel: decisionModel?.assetClassLabel || null,
    originalAssetFramingLabel: decisionModel?.assetFramingLabel || null,
    originalAssetBadges: decisionModel?.assetBadges || [],
  };
}
