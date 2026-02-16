import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/helpers/auth-helper';
import { makeGetProjectDetailsUseCase } from '@/src/use-cases/factories/make-get-project-details';
import { ProjectMembersClient } from './project-members-client';

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ id: string; enterpriseId: string }>;
}) {
  const { user } = await requireAuth();

  const { id: projectId, enterpriseId } = await params;

  if (!projectId) {
    redirect(`/${enterpriseId}/projects`);
  }

  try {
    const getProjectDetails = makeGetProjectDetailsUseCase();
    const { project } = await getProjectDetails.execute({ user, projectId });

    return (
      <ProjectMembersClient
        project={project}
        user={user}
        enterpriseId={enterpriseId}
      />
    );
  } catch (err) {
    console.error(err);
    redirect(`/${enterpriseId}/projects`);
  }
}
