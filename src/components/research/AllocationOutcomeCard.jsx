import React from "react";
import { Card, SectionRow } from "./researchPrimitives";
import { sanitizeSemanticLabel } from "./researchUtils";

export default function AllocationOutcomeCard({ model, styles }) {
  const noDominantWeakness = model?.primaryWeakness === "No dominant structural weakness identified.";
  const whyNotNow = model?.whyNotNow
    || (noDominantWeakness ? model?.evidenceConstraintNote : model?.primaryWeakness)
    || "No explicit constraint was surfaced.";

  return (
    <Card
      title="Allocation Decision"
      subtitle={model?.posture ? `Posture: ${sanitizeSemanticLabel(model.posture, "Unavailable")}` : "Deterministic allocation classification"}
      styles={styles}
    >
      <SectionRow label="Outcome" value={model?.allocationOutcome?.label || "Unavailable"} styles={styles} />
      <SectionRow label="Investability" value={sanitizeSemanticLabel(model?.investabilityStatus, "Unavailable")} styles={styles} />
      <SectionRow label="Current State" value={sanitizeSemanticLabel(model?.currentState, "Unavailable")} styles={styles} />
      <SectionRow label="Why Now" value={model?.whyNow || model?.primaryStrength || "No immediate support case is strong enough to stand alone."} styles={styles} />
      <SectionRow label="Why Not Now" value={whyNotNow} styles={styles} />
    </Card>
  );
}
