import React from "react";
import { Box, Card, ListBlock, SectionRow } from "./researchPrimitives";
import PanelStatusRow from "./PanelStatusRow";
import {
  buildSectionQualityHint,
  formatUsd,
  moduleAvailabilityTone,
  titleCase,
} from "./researchUtils";

export default function ProtocolIntelligencePanel({
  protocolUsage,
  protocolEconomics,
  protocolUsageFundamentals,
  protocolEconomicsFundamentals,
  sourceStatus,
  providerDiagnostics,
  providerHealth,
  protocolUsageFreshnessEntry,
  protocolEconomicsFreshnessEntry,
  styles,
}) {
  const usageHint = buildSectionQualityHint("protocol", {
    providerDiagnostics,
    providerHealth,
    sourceStatus,
    availability: protocolUsage?.availability || protocolUsageFundamentals?.availability,
    protocolUsage,
    protocolEconomics,
  });

  const economicsHint = buildSectionQualityHint("protocol", {
    providerDiagnostics,
    providerHealth,
    sourceStatus,
    availability: protocolEconomics?.availability || protocolEconomicsFundamentals?.availability,
    protocolUsage,
    protocolEconomics,
  });

  const usageAvailability = moduleAvailabilityTone(protocolUsage?.availability || protocolUsageFundamentals?.availability);
  const economicsAvailability = moduleAvailabilityTone(protocolEconomics?.availability || protocolEconomicsFundamentals?.availability);

  return (
    <div style={styles.advancedGrid}>
      <Card
        title="Protocol usage"
        score={protocolUsage?.score ?? protocolUsageFundamentals?.score}
        subtitle={`${usageAvailability.label} | Usage strength: ${titleCase(protocolUsage?.usageStrength || protocolUsageFundamentals?.usageStrength || "none")}`}
        styles={styles}
      >
        <PanelStatusRow hint={usageHint} freshnessEntry={protocolUsageFreshnessEntry} styles={styles} />
        <SectionRow label="Summary" value={protocolUsage?.summary || protocolUsageFundamentals?.summary || "Unavailable"} styles={styles} />
        <div style={styles.inlineGrid}>
          <Box label="Availability" value={usageAvailability.label} styles={styles} />
          <Box label="TVL" value={formatUsd(protocolUsage?.tvlUsd || protocolUsageFundamentals?.tvlUsd)} styles={styles} />
          <Box label="TVL trend" value={titleCase(protocolUsage?.tvlTrend || protocolUsageFundamentals?.tvlTrend || "unknown")} styles={styles} />
          <Box label="Usage strength" value={titleCase(protocolUsage?.usageStrength || protocolUsageFundamentals?.usageStrength || "none")} styles={styles} />
          <Box label="Category" value={protocolUsage?.category || protocolUsageFundamentals?.category || "Unknown"} styles={styles} />
        </div>
        <ListBlock
          title="Protocol usage concerns"
          items={[...(protocolUsage?.concerns || []), ...(protocolUsageFundamentals?.concerns || [])]}
          emptyText="No protocol usage concerns were surfaced."
          color="#ffb6b6"
          styles={styles}
        />
        <ListBlock
          title="Protocol usage notes"
          items={[...(protocolUsage?.notes || []), ...(protocolUsageFundamentals?.notes || [])]}
          emptyText="No protocol usage notes were returned."
          color="#9bd7ff"
          styles={styles}
        />
      </Card>

      <Card
        title="Protocol economics"
        score={protocolEconomics?.score ?? protocolEconomicsFundamentals?.score}
        subtitle={`${economicsAvailability.label} | Value capture: ${titleCase(protocolEconomics?.valueCaptureStrength || protocolEconomicsFundamentals?.valueCaptureStrength || "unknown")}`}
        styles={styles}
      >
        <PanelStatusRow hint={economicsHint} freshnessEntry={protocolEconomicsFreshnessEntry} styles={styles} />
        <SectionRow label="Summary" value={protocolEconomics?.summary || protocolEconomicsFundamentals?.summary || "Unavailable"} styles={styles} />
        <div style={styles.inlineGrid}>
          <Box label="Availability" value={economicsAvailability.label} styles={styles} />
          <Box label="Fees (24h)" value={formatUsd(protocolEconomics?.feesUsd24h || protocolEconomicsFundamentals?.feesUsd24h)} styles={styles} />
          <Box label="Revenue (24h)" value={formatUsd(protocolEconomics?.revenueUsd24h || protocolEconomicsFundamentals?.revenueUsd24h)} styles={styles} />
          <Box label="Volume (24h)" value={formatUsd(protocolEconomics?.volumeUsd24h || protocolEconomicsFundamentals?.volumeUsd24h)} styles={styles} />
          <Box label="TVL" value={formatUsd(protocolEconomics?.tvlUsd || protocolEconomicsFundamentals?.tvlUsd)} styles={styles} />
          <Box label="Value capture strength" value={titleCase(protocolEconomics?.valueCaptureStrength || protocolEconomicsFundamentals?.valueCaptureStrength || "unknown")} styles={styles} />
          <Box label="Usage economics strength" value={titleCase(protocolEconomics?.usageEconomicsStrength || protocolEconomicsFundamentals?.usageEconomicsStrength || "unknown")} styles={styles} />
        </div>
        <ListBlock
          title="Economics concerns"
          items={[...(protocolEconomics?.concerns || []), ...(protocolEconomicsFundamentals?.concerns || [])]}
          emptyText="No protocol economics concerns were surfaced."
          color="#ffb6b6"
          styles={styles}
        />
        <ListBlock
          title="Economics notes"
          items={[...(protocolEconomics?.notes || []), ...(protocolEconomicsFundamentals?.notes || [])]}
          emptyText="No protocol economics notes were returned."
          color="#9bd7ff"
          styles={styles}
        />
      </Card>
    </div>
  );
}
