import { MarketingContentPage } from "@/apps/web/components/common/marketing-content-page";

export default function DocsPage() {
  return (
    <MarketingContentPage
      eyebrow="Docs"
      title="Product docs, API guides, and remediation playbooks"
      description="This route is reserved for onboarding docs, framework guides, API references, and scan methodology notes."
      sections={[
        {
          title: "Getting started",
          body: "Explain workspace setup, scan submission, issue review, and report generation flows.",
        },
        {
          title: "Framework remediation guides",
          body: "Document stack-specific hardening patterns for Next.js, FastAPI, Express, and frontend config safety.",
        },
      ]}
    />
  );
}
