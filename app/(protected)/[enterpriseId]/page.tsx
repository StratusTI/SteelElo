import { redirect } from 'next/navigation';

interface EnterprisePageProps {
  params: Promise<{ enterpriseId: string }>;
}

export default async function EnterprisePage({ params }: EnterprisePageProps) {
  const { enterpriseId } = await params;
  redirect(`/${enterpriseId}/projects`);
}
