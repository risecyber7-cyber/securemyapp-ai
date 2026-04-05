import { KeshavKumarPage } from "@/components/marketing/keshav-kumar-page";

const PAGE_URL = "https://devhkehv.monster/keshav-kumar";

export const metadata = {
  title: "Keshav Kumar | Cybersecurity Researcher | devhkehv.monster",
  description:
    "Keshav Kumar is a cybersecurity researcher and ethical hacker associated with devhkehv.monster, focused on Kali Linux, penetration testing, bug bounty, and practical web security.",
  openGraph: {
    title: "Keshav Kumar | Cybersecurity Researcher | devhkehv.monster",
    description:
      "Keshav Kumar is a cybersecurity researcher and ethical hacker associated with devhkehv.monster, focused on Kali Linux, penetration testing, bug bounty, and practical web security.",
    url: PAGE_URL,
    siteName: "devhkehv.monster",
    type: "profile",
  },
  alternates: {
    canonical: PAGE_URL,
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Keshav Kumar",
  url: PAGE_URL,
  mainEntityOfPage: PAGE_URL,
  jobTitle: "Cybersecurity Researcher",
  worksFor: {
    "@type": "Organization",
    name: "devhkehv.monster",
    url: "https://devhkehv.monster",
  },
  sameAs: [
    "https://github.com/devhkehv",
    "https://linkedin.com/in/devhkehv",
    "https://x.com/devhkehv",
  ],
};

export default function KeshavKumarPageRoute() {
  return (
    <>
      <KeshavKumarPage />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
    </>
  );
}
