import React from "react";
import { Card, ListBlock } from "./researchPrimitives";

export default function ConvictionDriversMatrix({ model, styles }) {
  return (
    <Card title="Conviction Drivers" subtitle="Reasoning chain compressed for fast audit." styles={styles}>
      <div style={styles.decisionMatrixGrid}>
        <div style={styles.decisionMatrixCell}>
          <div style={styles.decisionMatrixTitle}>Supportive</div>
          <ListBlock title="" items={model?.topPositiveDrivers || []} emptyText="No supportive drivers are strong enough to highlight." color="#a6f3c2" styles={styles} />
        </div>
        <div style={styles.decisionMatrixCell}>
          <div style={styles.decisionMatrixTitle}>Constraining</div>
          <ListBlock title="" items={model?.topNegativeDrivers || []} emptyText="No constraining drivers were recorded." color="#ffb6b6" styles={styles} />
        </div>
        <div style={styles.decisionMatrixCell}>
          <div style={styles.decisionMatrixTitle}>Blockers</div>
          <ListBlock title="" items={model?.blockers || []} emptyText="No explicit blockers were surfaced." color="#f9d976" styles={styles} />
        </div>
      </div>
    </Card>
  );
}
