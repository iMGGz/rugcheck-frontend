import React from "react";
import { Card, SectionRow } from "./researchPrimitives";
import { titleCase } from "./researchUtils";

export default function AllocationOutcomeCard({ model, styles }) {
  return (
    <Card
      title="Allocation Assessment"
      subtitle={model?.posture ? `Decision posture: ${titleCase(model.posture)}` : "Deterministic allocation classification"}
      styles={styles}
    >
      <SectionRow label="Outcome" value={model?.allocationOutcome?.label || "Unavailable"} styles={styles} />
      <SectionRow label="Current State" value={model?.currentState ? titleCase(model.currentState) : "Unavailable"} styles={styles} />
      <SectionRow label="Why Now" value={model?.whyNow || "No immediate support case is strong enough to stand alone."} styles={styles} />
      <SectionRow label="Why Not Now" value={model?.whyNotNow || model?.primaryWeakness || "No explicit constraint was surfaced."} styles={styles} />
    </Card>
  );
}
