import React from "react";
import { Card, SectionRow } from "./researchPrimitives";
import { buildVerdictDisplayData, titleCase } from "./researchUtils";

export default function VerdictPanel({ aiReport, analysis, asset, scores, riskVerdict, styles }) {
  const verdict = buildVerdictDisplayData({ aiReport, analysis, asset });

  return (
    <div style={styles.advancedGridSingle}>
      <Card title="Final verdict" score={verdict.score || scores?.overallScore} subtitle={titleCase(verdict.rating || riskVerdict)} styles={styles}>
        <SectionRow label="Recommendation" value={verdict.recommendation || "Verdict unavailable from current analysis data."} styles={styles} />
        <SectionRow label="Summary" value={verdict.summary} styles={styles} />
        <SectionRow label="Bull case" value={verdict.bullCase || "No confirmed structural upside is currently recorded."} styles={styles} />
        <SectionRow label="Bear case" value={verdict.bearCase || "No structured failure mode is currently recorded."} styles={styles} />
      </Card>
    </div>
  );
}
