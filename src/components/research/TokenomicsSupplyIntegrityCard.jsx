import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import { formatCompact, formatPct, formatUsd, safeArray, titleCase } from "./researchUtils";

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "Unavailable";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatRatio(value) {
  if (value === null || value === undefined || value === "") return "Unavailable";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toFixed(2)}x`;
}

function summarizeProviderValues(values, label) {
  return safeArray(values).slice(0, 6).map((entry) => {
    const provider = entry?.provider || "provider";
    const value = entry?.field?.toLowerCase().includes("supply") ? formatNumber(entry?.value) : formatUsd(entry?.value);
    const boundary = entry?.boundary ? ` | ${entry.boundary}` : "";
    return `${provider} ${label || entry?.field || "value"}: ${value}${boundary}`;
  });
}

function summarizeFieldAudit(entries) {
  return safeArray(entries).slice(0, 4).map((entry) => {
    const available = safeArray(entry?.fieldsAvailable).join(", ") || "none";
    const missing = safeArray(entry?.fieldsMissing).slice(0, 4).join(", ") || "none";
    return `${entry?.provider || "provider"} available: ${available}; missing: ${missing}`;
  });
}

export function TokenomicsSupplyIntegrityCard({
  tokenomics,
  styles,
  compact = false,
  title = "Tokenomics Dilution & Supply Integrity",
}) {
  if (!tokenomics) return null;

  const summary = tokenomics.supplySummary || {};
  const reviewItems = [
    ...safeArray(tokenomics.hardBlockers),
    ...safeArray(tokenomics.manualReviewTriggers),
    ...safeArray(tokenomics.scoreCaps),
    ...safeArray(tokenomics.confidenceCaps),
  ].slice(0, compact ? 4 : 8);

  return (
    <Card
      title={title}
      score={tokenomics.tokenomicsIntegrityScore ?? null}
      subtitle="Source-boundary-aware supply underwriting. This separate integrity score does not change the live overall score."
      styles={styles}
    >
      <SectionRow label="Integrity score" value={tokenomics.tokenomicsIntegrityScore === null || tokenomics.tokenomicsIntegrityScore === undefined ? "Unavailable" : `${tokenomics.tokenomicsIntegrityScore}/100`} styles={styles} />
      <SectionRow label="Evidence confidence" value={titleCase(tokenomics.evidenceConfidence)} styles={styles} />
      <SectionRow label="Max supply status" value={titleCase(tokenomics.maxSupplyStatus)} styles={styles} />
      <SectionRow label="Unlock coverage" value={titleCase(tokenomics.unlockScheduleStatus)} styles={styles} />
      <SectionRow label="Supply boundary" value="Provider supply fields are reported context until source-backed; missing unlock data is not proof of no unlock risk." styles={styles} />
      {!compact && (
        <>
          <SectionRow label="Circulating / total / max" value={`${formatCompact(tokenomics.circulatingSupply)} / ${formatCompact(tokenomics.totalSupply)} / ${formatCompact(tokenomics.maxSupplyValue)}`} styles={styles} />
          <SectionRow label="Price / 24h volume" value={`${formatUsd(tokenomics.currentPrice)} / ${formatUsd(tokenomics.volume24h)}`} styles={styles} />
          <SectionRow label="Market cap / FDV" value={`${formatUsd(tokenomics.marketCap)} / ${formatUsd(tokenomics.fdv)}`} styles={styles} />
          <SectionRow label="Market cap / FDV method" value={`${titleCase(tokenomics.marketCapMethod)} / ${titleCase(tokenomics.fdvMethod)}`} styles={styles} />
          <SectionRow label="FDV / market cap" value={formatRatio(tokenomics.fdvMarketCapRatio)} styles={styles} />
          <SectionRow label="Circulating percent of max" value={formatPct(tokenomics.circulatingPercentOfMax)} styles={styles} />
          <SectionRow label="Remaining dilution" value={formatPct(tokenomics.remainingDilutionPercent)} styles={styles} />
          <SectionRow label="Supply gaps" value={`total-circ: ${formatNumber(tokenomics.supplyGapTotalMinusCirculating)} | max-circ: ${formatNumber(tokenomics.supplyGapMaxMinusCirculating)}`} styles={styles} />
          <SectionRow label="Self-reported CMC supply/mcap" value={`${formatNumber(tokenomics.selfReportedCirculatingSupply)} / ${formatUsd(tokenomics.selfReportedMarketCap)}`} styles={styles} />
          <SectionRow label="Next unlock" value={`${tokenomics.nextUnlockDate || "Unknown date"} | ${formatPct(tokenomics.nextUnlockPercent)} | ${formatUsd(tokenomics.nextUnlockUsdValue)}`} styles={styles} />
          <SectionRow label="Canonical supply context" value={summary.summary || "Supply summary unavailable."} styles={styles} />
          <SectionRow label="Analyzed representation" value={summary.analyzedRepresentation || "Unavailable"} styles={styles} />
        </>
      )}
      <ListBlock
        title="Manual review / caps"
        items={reviewItems}
        emptyText="No supply-integrity manual review trigger was attached."
        color="#f9d976"
        styles={styles}
      />
      {!compact && (
        <>
          <ListBlock title="Source requirements" items={tokenomics.sourceRequirements} emptyText="No tokenomics source requirements were attached." color="#9bd7ff" styles={styles} />
          <ListBlock title="Supply contradictions" items={tokenomics.sourceContradictions} emptyText="No material provider supply contradiction was detected." color="#ffb6b6" styles={styles} />
          <ListBlock title="Provider numeric provenance" items={[
            ...summarizeProviderValues(tokenomics.providerMarketCaps, "market cap"),
            ...summarizeProviderValues(tokenomics.providerFdvs, "FDV"),
            ...summarizeProviderValues(tokenomics.providerVolumes, "volume"),
            ...summarizeProviderValues(tokenomics.providerSupplyValues, "supply"),
          ]} emptyText="No provider-specific numeric rows were attached." color="#d5dcec" styles={styles} />
          <ListBlock title="Provider field audit" items={summarizeFieldAudit(tokenomics.providerFieldAudit)} emptyText="No provider field audit was attached." color="#d5dcec" styles={styles} />
          <ListBlock title="What would change" items={tokenomics.whatWouldChange} emptyText="No tokenomics change requirements were attached." color="#a6f3c2" styles={styles} />
          <ListBlock title="Source boundary" items={tokenomics.sourceBoundary} emptyText="No source boundary was attached." color="#d5dcec" styles={styles} />
        </>
      )}
    </Card>
  );
}

export function TokenomicsSupplyQuestionCard({ tokenomics, styles }) {
  const questions = safeArray(tokenomics?.institutionalQuestions);
  if (!questions.length) return null;

  return (
    <Card
      title="Tokenomics Supply Integrity Questions"
      subtitle="Module-level institutional questions. These are diagnostic/source-boundary aware and do not replace the resolved lens question group."
      styles={styles}
    >
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {questions.map((question) => (
          <div key={question.questionId || question.questionText} style={{
            border: "1px solid rgba(148, 163, 184, 0.18)",
            borderRadius: 14,
            padding: "0.85rem",
            background: "rgba(6, 12, 24, 0.38)",
          }}>
            <SectionRow label="Question" value={question.questionText} styles={styles} />
            <SectionRow label="Status" value={titleCase(question.answerStatus)} styles={styles} />
            <SectionRow label="Short answer" value={question.shortAnswer || question.answerSummary || "Unavailable"} styles={styles} />
            <ListBlock title="Data fields used" items={question.dataFieldsUsed} emptyText="No data fields were listed." color="#d5dcec" styles={styles} />
            <ListBlock title="Formula outputs used" items={question.formulaOutputsUsed} emptyText="No formula outputs were listed." color="#9bd7ff" styles={styles} />
            <ListBlock title="Evidence used" items={question.evidenceUsed} emptyText="No reviewed evidence was attached." color="#a6f3c2" styles={styles} />
            <ListBlock title="Missing evidence" items={question.missingEvidence} emptyText="No missing evidence was attached." color="#f9d976" styles={styles} />
            <ListBlock title="What would change" items={question.whatWouldChange} emptyText="No change requirement was attached." color="#9bd7ff" styles={styles} />
          </div>
        ))}
      </div>
    </Card>
  );
}
