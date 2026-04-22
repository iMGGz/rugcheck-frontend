import React from "react";
import { Card, ListBlock } from "./researchPrimitives";

export default function MethodologyPanel({ principles, styles }) {
  return (
    <Card title="ThesisCore Principles" subtitle="Methodology" styles={styles}>
      <ListBlock
        title=""
        items={principles}
        emptyText="Methodology principles unavailable."
        color="#d5dcec"
        styles={styles}
      />
      <div style={styles.methodologyText}>
        Deterministic investability analysis. Explainable reasoning chain. No black-box AI framing in the decision flow.
      </div>
    </Card>
  );
}
