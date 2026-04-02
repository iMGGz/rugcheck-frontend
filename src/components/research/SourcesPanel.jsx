import React from "react";
import { Box, Card, ListBlock, SectionRow } from "./researchPrimitives";
import { buildSectionQualityHint } from "./researchUtils";
import PanelStatusRow from "./PanelStatusRow";

export default function SourcesPanel({ officialLinks, whitepaperDocs, sourceStatus, providerDiagnostics, providerHealth, freshnessEntry, styles }) {
  const hint = buildSectionQualityHint("sources", {
    providerDiagnostics,
    providerHealth,
    sourceStatus,
    officialLinks,
    whitepaperDocs,
  });

  return (
    <div style={styles.advancedGrid}>
      <Card title="Official links" score={officialLinks?.sourceReliabilityScore} subtitle={officialLinks?.status ? `Coverage: ${officialLinks.status}` : "Official project sources"} styles={styles}>
        <PanelStatusRow hint={hint} freshnessEntry={freshnessEntry} styles={styles} />
        <SectionRow label="Summary" value={officialLinks?.summary || "Unavailable"} styles={styles} />
        <div style={styles.inlineGrid}>
          <Box label="Website" value={officialLinks?.website || "Unavailable"} styles={styles} />
          <Box label="Docs" value={officialLinks?.docs || "Unavailable"} styles={styles} />
          <Box label="Whitepaper" value={officialLinks?.whitepaper || "Unavailable"} styles={styles} />
          <Box label="GitHub" value={officialLinks?.github || "Unavailable"} styles={styles} />
          <Box label="X / Twitter" value={officialLinks?.twitter || "Unavailable"} styles={styles} />
          <Box label="Explorer" value={officialLinks?.explorer || "Unavailable"} styles={styles} />
        </div>
        <ListBlock title="Source notes" items={officialLinks?.notes || []} emptyText="No source notes available." color="#9bd7ff" styles={styles} />
      </Card>

      <Card title="Whitepaper and docs" score={whitepaperDocs?.score} subtitle={whitepaperDocs ? `Documentation depth: ${whitepaperDocs.documentationDepth}` : "Docs analysis"} styles={styles}>
        <SectionRow label="Summary" value={whitepaperDocs?.summary || "Unavailable"} styles={styles} />
        <SectionRow label="Token utility coverage" value={whitepaperDocs?.tokenUtilityCoverage || "Unavailable"} styles={styles} />
        <SectionRow label="Consistency" value={whitepaperDocs?.consistency || "Unavailable"} styles={styles} />
        <ListBlock title="Documentation notes" items={whitepaperDocs?.notes || []} emptyText="No documentation notes available." color="#a6f3c2" styles={styles} />
        <ListBlock title="Red flags" items={whitepaperDocs?.redFlags || []} emptyText="No explicit documentation red flags." color="#ffb6b6" styles={styles} />
      </Card>
    </div>
  );
}
