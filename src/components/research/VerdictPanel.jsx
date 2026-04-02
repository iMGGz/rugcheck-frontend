import React from "react";
import { Card, SectionRow } from "./researchPrimitives";

export default function VerdictPanel({ aiReport, scores, riskVerdict, styles }) {
  return (
    <div style={styles.advancedGridSingle}>
      <Card title="Final verdict" score={aiReport?.finalVerdict?.score || scores?.overallScore} subtitle={aiReport?.finalVerdict?.rating || riskVerdict} styles={styles}>
        <SectionRow label="Recommendation" value={aiReport?.finalVerdict?.recommendation || "Unavailable"} styles={styles} />
        <SectionRow label="Summary" value={aiReport?.finalVerdict?.summary || "Unavailable"} styles={styles} />
        <SectionRow label="Bull case" value={aiReport?.bullCase || "Unavailable"} styles={styles} />
        <SectionRow label="Bear case" value={aiReport?.bearCase || "Unavailable"} styles={styles} />
      </Card>
    </div>
  );
}
