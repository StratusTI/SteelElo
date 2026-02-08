import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Header } from '@/app/components/shared/header/header';
import { GlobalSideBar } from '@/app/components/shared/navigation/globalSideBar';
import { SideBar } from '@/app/components/shared/navigation/sideBar';
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
  // Busca os dados do usuário uma única vez (cacheado por requisição)
  const { user, fullName, initials, isAdmin, isSuperAdmin } =
    await requireAuth();
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
    <EnterpriseProvider
      enterpriseId={enterpriseIdNum}
      user={user}
      fullName={fullName}
      initials={initials}
      isAdmin={isAdmin}
      isSuperAdmin={isSuperAdmin}
    >
      <div className='flex flex-col h-screen overflow-hidden p-0 gap-2'>
        <Header enterpriseId={enterpriseId} />
        <div className='flex flex-1 overflow-hidden'>
          <GlobalSideBar />
          <div className='flex-1 mr-1 mb-1 overflow-hidden bg-card rounded-lg border-2 border-border flex'>
            <SideBar />
            <Suspense fallback={<div>Carregando...</div>}>{children}</Suspense>
          </div>
        </div>
      </div>
    </EnterpriseProvider>
  );
}
