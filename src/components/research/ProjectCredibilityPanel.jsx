import React from "react";
import { Box, Card, ListBlock, SectionRow } from "./researchPrimitives";
import { buildSectionQualityHint, moduleAvailabilityTone, titleCase } from "./researchUtils";
import PanelStatusRow from "./PanelStatusRow";

export default function ProjectCredibilityPanel({ projectCredibility, fundamentals, aiReport, scores, sourceStatus, providerDiagnostics, providerHealth, freshnessEntry, styles }) {
  const hint = buildSectionQualityHint("credibility", {
    providerDiagnostics,
    providerHealth,
    sourceStatus,
    projectCredibility,
  });

  return (
    <div style={styles.advancedGrid}>
      <Card
        title="Project credibility"
        score={projectCredibility?.score}
        subtitle={projectCredibility ? `${moduleAvailabilityTone(projectCredibility.availability).label} | Team transparency: ${titleCase(projectCredibility.teamTransparency)}` : "Credibility analysis"}
        styles={styles}
      >
        <PanelStatusRow hint={hint} freshnessEntry={freshnessEntry} styles={styles} />
        <SectionRow label="Summary" value={projectCredibility?.summary || "No backed team or backer evidence was returned for this analysis."} styles={styles} />
        <div style={styles.inlineGrid}>
          <Box label="Availability" value={moduleAvailabilityTone(projectCredibility?.availability).label} styles={styles} />
          <Box label="Team transparency" value={titleCase(projectCredibility?.teamTransparency || "missing")} styles={styles} />
          <Box label="Backer quality" value={titleCase(projectCredibility?.backerQuality || "unknown")} styles={styles} />
          <Box label="Company credibility" value={titleCase(projectCredibility?.companyCredibility || "unknown")} styles={styles} />
          <Box
            label="Founders"
            value={projectCredibility?.founders?.length ? projectCredibility.founders.map((item) => item.name).join(", ") : "Unavailable"}
            tone={projectCredibility?.founders?.length ? "Backed founder evidence found." : "No explicit founder evidence returned."}
            styles={styles}
          />
          <Box
            label="Backers"
            value={projectCredibility?.backers?.length ? projectCredibility.backers.map((item) => item.name).join(", ") : "Unavailable"}
            tone={projectCredibility?.backers?.length ? "Named investor/backer evidence found." : "No explicit backer evidence returned."}
            styles={styles}
          />
        </div>
        <ListBlock title="Advisors" items={projectCredibility?.advisors?.map((item) => item.name) || []} emptyText="No named advisors were confirmed." color="#9bd7ff" styles={styles} />
        <ListBlock title="Strengths / notes" items={[...(fundamentals?.projectCredibility?.strengths || []), ...(projectCredibility?.notes || [])]} emptyText="No credibility strengths were surfaced." color="#a6f3c2" styles={styles} />
        <ListBlock title="Concerns" items={[...(fundamentals?.projectCredibility?.concerns || []), ...(projectCredibility?.concerns || [])]} emptyText="No credibility concerns were surfaced." color="#ffb6b6" styles={styles} />
      </Card>

      <Card title="Execution and governance read" score={scores?.governanceScore} subtitle={aiReport?.teamGovernance?.dataAvailability || "Governance and identity context"} styles={styles}>
        <SectionRow label="AI summary" value={aiReport?.teamGovernance?.summary || "Unavailable"} styles={styles} />
        <SectionRow label="Execution risk" value={titleCase(fundamentals?.risks?.executionRisk)} styles={styles} />
        <SectionRow label="Governance risk" value={titleCase(fundamentals?.risks?.governanceRisk)} styles={styles} />
        <SectionRow label="Quick verdict note" value={fundamentals?.quickVerdictNote || "No project credibility quick verdict note was raised."} styles={styles} />
        <ListBlock title="Risk notes" items={fundamentals?.risks?.notes || []} emptyText="No governance or execution risk notes were returned." color="#9bd7ff" styles={styles} />
      </Card>
    </div>
  );
}
