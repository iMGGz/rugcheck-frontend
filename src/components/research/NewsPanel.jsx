import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";
import { safeArray, sourceColor } from "./researchUtils";

export default function NewsPanel({ newsIntelligence, snapshot, styles }) {
  const latestEvents = safeArray(newsIntelligence?.latestEvents);

  return (
    <div style={styles.advancedGrid}>
      <Card title="News intelligence" score={newsIntelligence?.score} subtitle={newsIntelligence ? `Sentiment: ${newsIntelligence.sentiment} | Source confidence: ${newsIntelligence.sourceConfidence}` : "Catalyst monitor"} styles={styles}>
        <SectionRow label="Summary" value={newsIntelligence?.summary || "Unavailable"} styles={styles} />
        <ListBlock title="News notes" items={newsIntelligence?.notes || []} emptyText="No news notes available." color="#9bd7ff" styles={styles} />
        {latestEvents.length ? latestEvents.map((event, index) => (
          <div key={`${event?.title || "event"}-${event?.publishedAt || index}`} style={styles.sectionRow}>
            <div style={styles.sectionRowLabel}>
              {event?.source || "Unknown source"} {event?.publishedAt ? `| ${new Date(event.publishedAt).toLocaleString()}` : ""}
            </div>
            <div style={styles.sectionRowValue}>{event?.title || "Untitled event"}</div>
            <div style={styles.eventMeta}>
              <span style={{ ...styles.riskChip, borderColor: sourceColor("partial"), color: "#7dd3fc" }}>{event?.classification || "Unclassified"}</span>
              <span style={{ ...styles.riskChip, borderColor: event?.impact === "high" ? "#ff6b6b" : event?.impact === "medium" ? "#ffb020" : "#7dd3fc", color: event?.impact === "high" ? "#ff6b6b" : event?.impact === "medium" ? "#ffb020" : "#7dd3fc" }}>
                Impact: {event?.impact || "unknown"}
              </span>
            </div>
          </div>
        )) : <p style={{ color: "#8a94a6" }}>No recent events available.</p>}
      </Card>

      <Card title="Snapshot changes" subtitle={snapshot?.generatedAt ? `Latest snapshot: ${new Date(snapshot.generatedAt).toLocaleString()}` : "Change tracking"} styles={styles}>
        <SectionRow label="Previous snapshot" value={snapshot?.previousSnapshotAt ? new Date(snapshot.previousSnapshotAt).toLocaleString() : "No previous snapshot"} styles={styles} />
        <ListBlock title="Change summary" items={snapshot?.changeSummary || []} emptyText="No change summary available." color="#9bd7ff" styles={styles} />
      </Card>
    </div>
  );
}
