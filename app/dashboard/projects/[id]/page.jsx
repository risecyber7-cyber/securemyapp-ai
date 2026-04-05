import { ProjectDetailsShell } from "@/components/dashboard/project-details-shell";

export default function ProjectDetailsPage({ params }) {
  return <ProjectDetailsShell projectId={params.id} />;
}
