import { MarketingContentPage } from "@/apps/web/components/common/marketing-content-page";

export default function PricingPage() {
  return (
    <MarketingContentPage
      eyebrow="Pricing"
      title="Flexible rollout pricing for security teams"
      description="Starter, growth, and enterprise packaging can live here with usage limits, seat counts, and support tiers."
      sections={[
        {
          title: "Developer-first plans",
          body: "Offer quick scan quotas, remediation exports, and collaboration controls in a clear pricing ladder.",
        },
        {
          title: "Enterprise add-ons",
          body: "Private runners, advanced reporting, SSO, and custom retention policies can attach later.",
        },
      ]}
    />
  );
}
