import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import { titleCase } from "./researchUtils";

export default function EvidenceConfidenceCard({ model, styles }) {
  return (
    <Card
      title="Evidence Support"
      subtitle={model?.evidenceStrength ? `Evidence strength: ${titleCase(model.evidenceStrength)}` : "Evidence support is earned, not assumed."}
      styles={styles}
    >
      <SectionRow label="Confidence in Thesis Support" value={model?.confidenceLabel || "Unavailable"} styles={styles} />
      {model?.evidenceConflicts ? (
        <SectionRow label="Evidence Conflict" value="Conflicting evidence remains unresolved." styles={styles} />
      ) : null}
      <ListBlock
        title="Missing critical evidence"
        items={model?.missingCritical || []}
        emptyText="No critical missing evidence was surfaced."
        color="#ffb6b6"
        styles={styles}
      />
      <ListBlock
        title="Required conditions"
        items={model?.requiredConditions || []}
        emptyText="No additional conditions were recorded."
        color="#9bd7ff"
        styles={styles}
      />
    </Card>
  );
}
