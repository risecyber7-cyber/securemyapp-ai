import { ProjectDetailsShell } from "@/components/dashboard/project-details-shell";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailsShell projectId={id} />;
}
