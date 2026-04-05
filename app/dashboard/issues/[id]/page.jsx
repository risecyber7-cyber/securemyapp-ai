import { IssueDetailsShell } from "@/components/dashboard/issue-details-shell";

export default function IssueDetailsPage({ params }) {
  return <IssueDetailsShell issueId={params.id} />;
}
