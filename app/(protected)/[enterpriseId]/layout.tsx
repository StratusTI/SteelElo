import { redirect } from 'next/navigation';
import { EnterpriseProvider } from '@/app/providers/enterprise-provider';
import { requireAuth } from '@/src/lib/helpers/auth-helper';

interface EnterpriseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ enterpriseId: string }>;
}

export default async function EnterpriseLayout({
  children,
  params,
}: EnterpriseLayoutProps) {
  const { user } = await requireAuth();
  const { enterpriseId } = await params;

  const enterpriseIdNum = Number.parseInt(enterpriseId, 10);

  if (Number.isNaN(enterpriseIdNum)) {
    redirect('/');
  }

  // Verificar se o usuário tem acesso a esta empresa
  const userEnterprises = Array.isArray(user.idempresa)
    ? user.idempresa
    : [user.idempresa];

  const hasAccess = userEnterprises.includes(enterpriseIdNum);

  if (!hasAccess) {
    // Redirecionar para a primeira empresa do usuário
    const defaultEnterprise = userEnterprises[0];
    redirect(`/${defaultEnterprise}`);
  }

  return (
    <EnterpriseProvider enterpriseId={enterpriseIdNum}>
      {children}
    </EnterpriseProvider>
  );
}
