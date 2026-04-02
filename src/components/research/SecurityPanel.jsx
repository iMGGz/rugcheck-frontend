import React from "react";
import { Card, ListBlock, SectionRow } from "./researchPrimitives";

export default function SecurityPanel({ security, scores, styles }) {
  return (
    <Card title="Security checks" score={scores?.securityScore} subtitle={security?.isSupported ? "GoPlus-supported asset" : "Unsupported or unavailable"} styles={styles}>
      <SectionRow label="Security supported" value={security?.isSupported ? "Yes" : "No"} styles={styles} />
      <SectionRow label="Honeypot" value={security?.isHoneypot === null ? "Unknown" : security?.isHoneypot ? "Yes" : "No"} styles={styles} />
      <SectionRow label="Mintable" value={security?.isMintable === null ? "Unknown" : security?.isMintable ? "Yes" : "No"} styles={styles} />
      <SectionRow label="Owner privileges" value={security?.hasOwnerPrivileges === null ? "Unknown" : security?.hasOwnerPrivileges ? "Yes" : "No"} styles={styles} />
      <SectionRow label="Take back ownership" value={security?.canTakeBackOwnership === null ? "Unknown" : security?.canTakeBackOwnership ? "Yes" : "No"} styles={styles} />
      <ListBlock title="Security notes" items={security?.notes || []} emptyText="No security notes available." color="#9bd7ff" styles={styles} />
    </Card>
  );
}
