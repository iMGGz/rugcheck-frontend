import React from "react";
import { Card, SectionRow } from "./researchPrimitives";
import { titleCase } from "./researchUtils";

export default function AllocationOutcomeCard({ model, styles }) {
  return (
    <Card
      title="Allocation Decision"
      subtitle={model?.posture ? `Posture: ${titleCase(model.posture)}` : "Deterministic allocation classification"}
      styles={styles}
    >
      <SectionRow label="Outcome" value={model?.allocationOutcome?.label || "Unavailable"} styles={styles} />
      <SectionRow label="Investability" value={model?.investabilityStatus ? titleCase(model.investabilityStatus) : "Unavailable"} styles={styles} />
      <SectionRow label="Current State" value={model?.currentState ? titleCase(model.currentState) : "Unavailable"} styles={styles} />
      <SectionRow label="Why Now" value={model?.whyNow || model?.primaryStrength || "No immediate support case is strong enough to stand alone."} styles={styles} />
      <SectionRow label="Why Not Now" value={model?.whyNotNow || model?.primaryWeakness || "No explicit constraint was surfaced."} styles={styles} />
    </Card>
  );
}
