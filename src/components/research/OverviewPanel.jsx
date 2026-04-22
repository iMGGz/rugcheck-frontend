import React from "react";
import { Box, Card, ListBlock, ProgressBar, SectionRow } from "./researchPrimitives";
import { analysisColor, buildVerdictDisplayData, riskLevelLabel, titleCase } from "./researchUtils";

export default function OverviewPanel({
  asset,
  meta,
  analysis,
  fundamentals,
  aiReport,
  warnings,
  confidence,
  officialLinks,
  snapshot,
  scores,
  styles,
}) {
  const verdict = buildVerdictDisplayData({ aiReport, analysis, asset });

  return (
    <div style={styles.advancedGrid}>
      <Card title="Asset overview" subtitle={asset?.query ? `Query: ${asset.query}` : "Resolved asset identity"} styles={styles}>
        <div style={styles.inlineGrid}>
          <Box label="Name" value={asset?.name || "Unavailable"} styles={styles} />
          <Box label="Symbol" value={asset?.symbol || "Unavailable"} styles={styles} />
          <Box label="Chain" value={asset?.chain || "Unavailable"} styles={styles} />
          <Box label="Category" value={asset?.category || "Unavailable"} styles={styles} />
          <Box label="CoinGecko ID" value={asset?.coingeckoId || "Unavailable"} styles={styles} />
          <Box label="CoinMarketCap ID" value={asset?.coinmarketcapId || "Unavailable"} styles={styles} />
          <Box label="Narrative" value={asset?.narrative || "Unavailable"} styles={styles} />
          <Box
            label="Delivery"
            value={meta?.delivery?.source ? titleCase(meta.delivery.source) : "Unavailable"}
            tone={meta?.delivery?.isFresh ? "Fresh snapshot context" : "Potentially stale"}
            styles={styles}
          />
        </div>
        <SectionRow
          label="Decision memo note"
          value={fundamentals?.quickVerdictNote || "No quick memo note was raised by the backend."}
          styles={styles}
        />
      </Card>

      <Card title="Structured Thesis Summary" score={scores?.overallScore} subtitle={titleCase(verdict.rating || "structured_backend_summary")} styles={styles}>
        <SectionRow label="Allocation assessment" value={verdict.recommendation || "Decision memo unavailable from current analysis data."} styles={styles} />
        <SectionRow label="Summary" value={verdict.summary} styles={styles} />
        <ListBlock title="Warnings" items={warnings} emptyText="No warnings returned." color="#f9d976" styles={styles} />
      </Card>

      <Card
        title="Official sources"
        score={officialLinks?.sourceReliabilityScore}
        subtitle={officialLinks?.status ? `Source reliability: ${officialLinks.status}` : "Official project links"}
        styles={styles}
      >
        <SectionRow label="Summary" value={officialLinks?.summary || "Unavailable"} styles={styles} />
        <div style={styles.inlineGrid}>
          <Box label="Website" value={officialLinks?.website || "Unavailable"} styles={styles} />
          <Box label="Docs" value={officialLinks?.docs || "Unavailable"} styles={styles} />
          <Box label="Whitepaper" value={officialLinks?.whitepaper || "Unavailable"} styles={styles} />
          <Box label="X / Twitter" value={officialLinks?.twitter || "Unavailable"} styles={styles} />
          <Box label="GitHub" value={officialLinks?.github || "Unavailable"} styles={styles} />
          <Box label="Explorer" value={officialLinks?.explorer || "Unavailable"} styles={styles} />
        </div>
        <ListBlock title="Source notes" items={officialLinks?.notes || []} emptyText="No source notes available." color="#9bd7ff" styles={styles} />
      </Card>

      <Card
        title="Research timeline"
        subtitle={snapshot?.generatedAt ? `Snapshot stored at ${new Date(snapshot.generatedAt).toLocaleString()}` : "No persisted snapshot yet"}
        styles={styles}
      >
        <SectionRow label="Previous snapshot" value={snapshot?.previousSnapshotAt ? new Date(snapshot.previousSnapshotAt).toLocaleString() : "No previous snapshot"} styles={styles} />
        <ListBlock title="What changed" items={snapshot?.changeSummary || []} emptyText="No change summary available yet." color="#9bd7ff" styles={styles} />
      </Card>

      <Card title="Score breakdown" subtitle="Calculated by the backend engine" styles={styles}>
        {scores ? (
          [
            ["Overall", scores.overallScore],
            ["Liquidity", scores.liquidityScore],
            ["Tokenomics", scores.tokenomicsScore],
            ["Governance", scores.governanceScore],
            ["Security", scores.securityScore],
            ["Technical", scores.technicalScore],
            ["Fragility resistance", 100 - scores.fragilityScore],
            ["Project credibility", scores.projectCredibilityScore],
          ].map(([label, score]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={styles.scoreRow}>
                <div style={{ color: "#d5dcec" }}>{label}</div>
                {score === null || score === undefined ? (
                  <div style={{ color: "#8a94a6", fontWeight: 700 }}>Unavailable</div>
                ) : (
                  <div style={{ color: analysisColor(score), fontWeight: 800 }}>{score}/100</div>
                )}
              </div>
              {score === null || score === undefined ? null : <ProgressBar score={score} styles={styles} />}
            </div>
          ))
        ) : <p style={{ color: "#8a94a6" }}>Scores unavailable.</p>}
      </Card>

      <Card
        title="Fundamental posture"
        score={fundamentals?.tokenomics?.overallScore}
        subtitle={fundamentals?.tokenomics ? `Unlock impact: ${riskLevelLabel(fundamentals.tokenomics.upcomingUnlockImpact)}` : "Fundamental snapshot"}
        styles={styles}
      >
        <SectionRow label="Supply health" value={fundamentals?.tokenomics ? `${fundamentals.tokenomics.supplyHealth}/100` : "Unavailable"} styles={styles} />
        <SectionRow label="FDV pressure" value={fundamentals?.tokenomics?.breakdown?.fdvPressure ? riskLevelLabel(fundamentals.tokenomics.breakdown.fdvPressure) : "Unavailable"} styles={styles} />
        <SectionRow label="Inflation risk" value={fundamentals?.tokenomics?.breakdown?.inflationRisk ? riskLevelLabel(fundamentals.tokenomics.breakdown.inflationRisk) : "Unavailable"} styles={styles} />
        <SectionRow label="Concentration risk" value={fundamentals?.tokenomics?.breakdown?.concentrationRisk ? riskLevelLabel(fundamentals.tokenomics.breakdown.concentrationRisk) : "Unavailable"} styles={styles} />
        <ListBlock title="Key alerts" items={fundamentals?.risks?.keyAlerts || []} emptyText="No material alerts from the tokenomics and risk engine." color="#ffb6b6" styles={styles} />
      </Card>

      <Card title="Confidence reasons" score={confidence?.score} subtitle={confidence?.level ? titleCase(`${confidence.level} confidence`) : "Assessment unavailable"} styles={styles}>
        <SectionRow label="Summary" value={confidence?.summary || "Unavailable"} styles={styles} />
        <SectionRow label="Market data status" value={confidence?.marketDataStatus || "Unknown"} styles={styles} />
        <ListBlock title="Why this confidence level" items={confidence?.reasons || []} emptyText="No confidence notes available." color="#9bd7ff" styles={styles} />
      </Card>
    </div>
  );
}
