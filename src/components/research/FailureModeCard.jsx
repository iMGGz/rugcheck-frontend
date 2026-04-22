import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";

export default function FailureModeCard({ model, styles }) {
  return (
    <Card title="Failure Modes" subtitle="How a serious allocator loses money here." styles={styles}>
      <SectionRow label="Primary Failure" value={model?.failureMode?.primary || "Unavailable"} styles={styles} />
      <SectionRow label="Trigger" value={model?.failureMode?.trigger || "Unavailable"} styles={styles} />
      <ListBlock
        title="Early Signals"
        items={model?.failureMode?.earlySignals || []}
        emptyText="No early warning signals were recorded."
        color="#ffb6b6"
        styles={styles}
      />
      <ListBlock
        title="What could break"
        items={model?.whatCouldBreak || []}
        emptyText="No additional break conditions were recorded."
        color="#f9d976"
        styles={styles}
      />
    </Card>
  );
}
