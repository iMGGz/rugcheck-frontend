import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";

export default function ThesisDriftTimeline({ model, compareData, styles }) {
  const summaryLines = compareData?.comparison?.changeSummary || [];
  const impact = compareData?.comparison?.impact?.overall || "none";

  return (
    <Card title="Thesis Drift" subtitle="How the stored thesis changed across snapshots." styles={styles}>
      <SectionRow label="Current Outcome" value={model?.allocationOutcome?.label || "Unavailable"} styles={styles} />
      <SectionRow label="Compare Impact" value={impact} styles={styles} />
      <ListBlock
        title="Drift summary"
        items={summaryLines}
        emptyText="No stored thesis drift summary is available yet."
        color="#9bd7ff"
        styles={styles}
      />
    </Card>
  );
}
