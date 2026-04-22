import React, { useMemo } from "react";
import OverviewPanel from "./OverviewPanel";
import MarketPanel from "./MarketPanel";
import SourcesPanel from "./SourcesPanel";
import ProjectCredibilityPanel from "./ProjectCredibilityPanel";
import OnChainPanel from "./OnChainPanel";
import ProtocolIntelligencePanel from "./ProtocolIntelligencePanel";
import ScoreContributorsPanel from "./ScoreContributorsPanel";
import FundamentalsPanel from "./FundamentalsPanel";
import RisksPanel from "./RisksPanel";
import NewsPanel from "./NewsPanel";
import VerdictPanel from "./VerdictPanel";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import { titleCase } from "./researchUtils";

function mergeOfficialLinks(snapshot) {
  const raw = snapshot?.rawData?.officialLinks || {};
  const derived = snapshot?.derivedAnalysis?.officialLinks || {};
  return {
    ...raw,
    ...derived,
  };
}

export default function SnapshotDetailPanel({
  snapshotRecord,
  loading,
  error,
  onClose,
  styles,
}) {
  const analysis = snapshotRecord?.analysis || snapshotRecord?.derivedAnalysis || {};
  const asset = snapshotRecord?.rawData?.asset;
  const marketData = snapshotRecord?.rawData?.marketData;
  const security = snapshotRecord?.rawData?.security;
  const onChainMetrics = snapshotRecord?.derivedAnalysis?.onChainMetrics;
  const projectCredibility = snapshotRecord?.derivedAnalysis?.projectCredibility;
  const protocolUsage = snapshotRecord?.derivedAnalysis?.protocolUsage;
  const protocolEconomics = snapshotRecord?.derivedAnalysis?.protocolEconomics;
  const scores = analysis?.scores || snapshotRecord?.derivedAnalysis?.scores;
  const confidence = analysis?.confidence || snapshotRecord?.derivedAnalysis?.confidence;
  const fundamentals = analysis?.fundamentals || snapshotRecord?.derivedAnalysis?.fundamentals;
  const aiReport = snapshotRecord?.derivedAnalysis?.aiReport;
  const scoreContributors = analysis?.contributors || snapshotRecord?.derivedAnalysis?.scoreContributors;
  const sourceStatus = snapshotRecord?.derivedAnalysis?.sourceStatus;
  const meta = snapshotRecord?.derivedAnalysis?.meta;
  const warnings = snapshotRecord?.derivedAnalysis?.warnings || [];
  const whitepaperDocs = snapshotRecord?.derivedAnalysis?.whitepaperDocs;
  const newsIntelligence = useMemo(() => ({
    ...(snapshotRecord?.derivedAnalysis?.newsIntelligence || {}),
    latestEvents: snapshotRecord?.rawData?.newsEvents || [],
  }), [snapshotRecord]);
  const officialLinks = useMemo(() => mergeOfficialLinks(snapshotRecord), [snapshotRecord]);
  const snapshotMeta = useMemo(() => ({
    snapshotId: snapshotRecord?.snapshotId,
    generatedAt: snapshotRecord?.generatedAt,
    previousSnapshotId: snapshotRecord?.previousSnapshotId,
    previousSnapshotAt: snapshotRecord?.previousSnapshotAt,
    changeSummary: snapshotRecord?.changeSummary || [],
  }), [snapshotRecord]);
  const notableDiagnostics = (meta?.providerDiagnostics || []).filter((entry) =>
    entry.status !== "success" ||
    ["partial", "weak", "missing", "unavailable"].includes(entry.coverage || ""),
  );
  const sectionFreshness = meta?.sectionFreshness || snapshotRecord?.sectionFreshness || {};
  const onChainFundamentals = fundamentals?.onChain;
  const protocolUsageFundamentals = fundamentals?.protocolUsage;
  const protocolEconomicsFundamentals = fundamentals?.protocolEconomics;
  const riskVerdict = useMemo(() => {
    if (!scores) return "UNKNOWN";
    if (scores.fragilityScore >= 70 || scores.securityScore <= 20) return "HIGH RISK";
    if (scores.overallScore < 55) return "CAUTION";
    return "LOWER RISK";
  }, [scores]);

  return (
    <div style={styles.snapshotDetailWrap}>
      <div style={styles.snapshotDetailHeader}>
        <div>
          <div style={styles.snapshotDetailEyebrow}>Stored historical snapshot</div>
          <h2 style={styles.snapshotDetailTitle}>
            {asset?.name || "Historical snapshot"} {asset?.symbol ? `| ${asset.symbol}` : ""}
          </h2>
          <div style={styles.snapshotDetailText}>
            This view is loaded from Postgres history and does not trigger a live re-analysis.
          </div>
        </div>
        <button onClick={onClose} style={styles.secondaryButton}>Close snapshot view</button>
      </div>

      {loading ? (
        <div style={styles.loadingCard}>
          <div style={styles.loadingPulse} />
          <div>
            <div style={styles.loadingTitle}>Loading stored snapshot</div>
            <div style={styles.loadingText}>Fetching the saved historical record from the backend.</div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div style={styles.inlineErrorBox}>
          <div style={styles.inlineErrorTitle}>Snapshot detail unavailable</div>
          <div style={styles.inlineErrorText}>{error}</div>
        </div>
      ) : null}

      {snapshotRecord ? (
        <>
          <Card title="Historical snapshot context" subtitle={`Snapshot ID: ${snapshotRecord.snapshotId}`} styles={styles}>
            <SectionRow label="Stored at" value={snapshotRecord.generatedAt ? new Date(snapshotRecord.generatedAt).toLocaleString() : "Unavailable"} styles={styles} />
            <SectionRow label="Previous snapshot" value={snapshotRecord.previousSnapshotAt ? new Date(snapshotRecord.previousSnapshotAt).toLocaleString() : "No previous snapshot"} styles={styles} />
            <SectionRow label="Delivery source" value={snapshotRecord.delivery?.source ? titleCase(snapshotRecord.delivery.source) : "Postgres history"} styles={styles} />
            <ListBlock title="Stored change summary" items={snapshotRecord.changeSummary || []} emptyText="No stored change summary was recorded for this snapshot." color="#9bd7ff" styles={styles} />
          </Card>

          <OverviewPanel
            asset={asset}
            meta={meta}
            analysis={analysis}
            fundamentals={fundamentals}
            aiReport={aiReport}
            warnings={warnings}
            confidence={confidence}
            sourceStatus={sourceStatus}
            notableDiagnostics={notableDiagnostics}
            officialLinks={officialLinks}
            snapshot={snapshotMeta}
            scores={scores}
            styles={styles}
          />
          <ScoreContributorsPanel scoreContributors={scoreContributors} styles={styles} />
          <MarketPanel aiReport={aiReport} marketData={marketData} sourceStatus={sourceStatus} providerDiagnostics={meta?.providerDiagnostics || []} providerHealth={null} freshnessEntry={sectionFreshness.marketData} styles={styles} />
          <SourcesPanel officialLinks={officialLinks} whitepaperDocs={whitepaperDocs} sourceStatus={sourceStatus} providerDiagnostics={meta?.providerDiagnostics || []} providerHealth={null} freshnessEntry={sectionFreshness.officialLinksDocs} styles={styles} />
          <ProjectCredibilityPanel projectCredibility={projectCredibility} fundamentals={fundamentals} aiReport={aiReport} scores={scores} sourceStatus={sourceStatus} providerDiagnostics={meta?.providerDiagnostics || []} providerHealth={null} freshnessEntry={sectionFreshness.projectCredibility} styles={styles} />
          <OnChainPanel onChainMetrics={onChainMetrics} onChainFundamentals={onChainFundamentals} aiReport={aiReport} marketData={marketData} sourceStatus={sourceStatus} providerDiagnostics={meta?.providerDiagnostics || []} providerHealth={null} freshnessEntry={sectionFreshness.onChainMetrics} styles={styles} />
          <ProtocolIntelligencePanel
            protocolUsage={protocolUsage}
            protocolEconomics={protocolEconomics}
            protocolUsageFundamentals={protocolUsageFundamentals}
            protocolEconomicsFundamentals={protocolEconomicsFundamentals}
            sourceStatus={sourceStatus}
            providerDiagnostics={meta?.providerDiagnostics || []}
            providerHealth={null}
            protocolUsageFreshnessEntry={sectionFreshness.protocolUsage}
            protocolEconomicsFreshnessEntry={sectionFreshness.protocolEconomics}
            styles={styles}
          />
          <FundamentalsPanel fundamentals={fundamentals} aiReport={aiReport} marketData={marketData} styles={styles} />
          <RisksPanel aiReport={aiReport} fundamentals={fundamentals} security={security} scores={scores} styles={styles} />
          <NewsPanel newsIntelligence={newsIntelligence} snapshot={snapshotMeta} styles={styles} />
          <VerdictPanel aiReport={aiReport} analysis={analysis} asset={asset} scores={scores} riskVerdict={riskVerdict} styles={styles} />
        </>
      ) : null}
    </div>
  );
}
