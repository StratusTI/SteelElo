import { Suspense } from 'react';
import { getAuthUser } from '@/src/lib/helpers/auth-helper';

interface HomePageProps {
  params: Promise<{ enterpriseId: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { enterpriseId } = await params;

  const user = await getAuthUser();

  if (!user) {
    return <div>User not found</div>;
  }

  return <Suspense fallback={<div>Loading...</div>}>Teste</Suspense>;
}
