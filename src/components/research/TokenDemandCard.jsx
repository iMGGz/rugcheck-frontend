import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";

export default function TokenDemandCard({ model, styles }) {
  const subtitle = model?.assetClass === "native_asset"
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
