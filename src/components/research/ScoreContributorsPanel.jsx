import React from "react";
import { Card } from "./researchPrimitives";
import { titleCase } from "./researchUtils";

function ContributorGroup({ title, color, items, styles, showStrength = false, emptyText }) {
  return (
    <div style={styles.scoreContributorGroup}>
      <div style={{ ...styles.scoreContributorGroupTitle, color }}>{title}</div>
      {items?.length ? (
        <div style={styles.scoreContributorList}>
          {items.map((item, index) => (
            <div
              key={`${title}-${item.area || "unknown"}-${item.summary || "summary"}-${index}`}
              style={styles.scoreContributorItem}
            >
              <div style={styles.scoreContributorItemHeader}>
                <div style={styles.scoreContributorArea}>{titleCase(item.area || "unknown")}</div>
                {showStrength && item.strength ? (
                  <span
                    style={{
                      ...styles.scoreContributorStrength,
                      borderColor: color,
                      color,
                    }}
                  >
                    {titleCase(item.strength)}
                  </span>
                ) : null}
              </div>
              <div style={styles.scoreContributorSummary}>{item.summary || "No contributor summary recorded."}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.scoreContributorEmpty}>{emptyText}</div>
      )}
    </div>
  );
}

export default function ScoreContributorsPanel({ scoreContributors, styles }) {
  const positives = scoreContributors?.positives || [];
  const negatives = scoreContributors?.negatives || [];
  const neutralOrMissing = scoreContributors?.neutralOrMissing || [];
  const topDrivers = scoreContributors?.topDrivers || [];
  const hasContent = positives.length || negatives.length || neutralOrMissing.length || topDrivers.length;

  return (
    <Card
      title="Score drivers"
      subtitle="What pushed the score up, what dragged it down, and what stayed neutral or under-confirmed."
      styles={styles}
    >
      <div style={styles.scoreContributorTopDriversWrap}>
        <div style={styles.scoreContributorTopDriversTitle}>Top drivers</div>
        {topDrivers.length ? (
          <div style={styles.scoreContributorChipRow}>
            {topDrivers.map((driver) => (
              <span key={driver} style={styles.scoreContributorChip}>{driver}</span>
            ))}
          </div>
        ) : (
          <div style={styles.scoreContributorEmpty}>No material score drivers were recorded for this analysis.</div>
        )}
      </div>

      {hasContent ? (
        <div style={styles.scoreContributorGrid}>
          <ContributorGroup
            title="Positives"
            color="#2fd67b"
            items={positives}
            styles={styles}
            showStrength
            emptyText="No strong positive contributors were recorded."
          />
          <ContributorGroup
            title="Negatives"
            color="#ff8a4c"
            items={negatives}
            styles={styles}
            showStrength
            emptyText="No strong negative contributors were recorded."
          />
          <ContributorGroup
            title="Neutral / missing"
            color="#8a94a6"
            items={neutralOrMissing}
            styles={styles}
            emptyText="No neutral or missing contributors were recorded."
          />
        </div>
      ) : null}
    </Card>
  );
}
