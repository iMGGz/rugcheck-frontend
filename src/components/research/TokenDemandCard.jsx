import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";

export default function TokenDemandCard({ model, styles }) {
  const lensId = model?.resolvedInstitutionalLens?.lensId || model?.lensAwareExplanations?.lensId;
  const subtitle = lensId === "PAYMENTS_SETTLEMENT"
    ? "Payment-token demand must be read through settlement usage, fee/reserve/burn materiality, finality, and distribution evidence."
    : lensId === "GAMING_METAVERSE_CONSUMER"
      ? "Gaming demand must survive review of active users, retention, token sinks, reward emissions, mintability, and unlocks."
      : lensId === "RWA_HYBRID_INFRASTRUCTURE"
        ? "RWA infrastructure relevance is not tokenholder value capture without utility-token economics and rights-separation evidence."
        : lensId === "DEFI_PROTOCOL_TOKEN"
          ? "Protocol quality is not token quality unless fee routing, buyback/burn, treasury, staking, or governance economics are source-backed."
          : model?.assetClass === "native_asset"
    ? "Benchmark demand must be read through liquidity, durability, and monetary role."
    : model?.assetClass === "gas_asset"
      ? "Base-layer demand must be read through network usage and settlement role."
      : "Protocol quality is not token quality.";

  return (
    <Card
      title="Token Demand Truth"
      subtitle={subtitle}
      styles={styles}
    >
      <SectionRow label="Demand Read" value={model?.tokenDemandTruth || "Token-demand truth is unavailable on current evidence."} styles={styles} />
      <SectionRow label="Primary Strength" value={model?.primaryStrength || "No durable strength is confirmed strongly enough to support token demand."} styles={styles} />
      <SectionRow label="Primary Weakness" value={model?.primaryWeakness || "Unavailable"} styles={styles} />
      <ListBlock
        title="What must be true"
        items={model?.whatMustBeTrue || []}
        emptyText="No additional thesis conditions were surfaced."
        color="#9bd7ff"
        styles={styles}
      />
    </Card>
  );
}
