import React from "react";

export default function AuditSection({ title, subtitle, defaultOpen = false, styles, children }) {
  return (
    <details open={defaultOpen} style={styles.auditSection}>
      <summary style={styles.auditSummary}>
        <span>{title}</span>
        {subtitle ? <span style={styles.auditSummaryMeta}>{subtitle}</span> : null}
      </summary>
      <div style={styles.auditBody}>
        {children}
      </div>
    </details>
  );
}
