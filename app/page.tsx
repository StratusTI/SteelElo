import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/helpers/auth-helper';

export default async function RootPage() {
  const { user } = await requireAuth();

  // Redirecionar para a primeira empresa do usuário
  const defaultEnterpriseId = Array.isArray(user.idempresa)
    ? user.idempresa[0]
    : user.idempresa;

  redirect(`/${defaultEnterpriseId}`);
}
