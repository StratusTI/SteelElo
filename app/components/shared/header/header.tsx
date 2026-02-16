import { requireAuth } from '@/src/lib/helpers/auth-helper';
import { EnterpriseActions } from './header-actions/enterprise-actions';
import { UserActions } from './header-actions/user-actions';

interface HeaderProps {
  enterpriseId?: string;
}

export async function Header({ enterpriseId }: HeaderProps) {
  const { user } = await requireAuth();

  const authEnterprises = Array.isArray(user.idempresa)
    ? user.idempresa.map((id, index) => ({
        id: id,
        name: Array.isArray(user.empresa) ? user.empresa[index] : user.empresa,
      }))
    : [
        {
          id: user.idempresa,
          name: user.empresa,
        },
      ];

  // Determinar o enterpriseId atual (da URL ou o primeiro da lista)
  const currentEnterpriseId = enterpriseId
    ? Number.parseInt(enterpriseId, 10)
    : authEnterprises[0]?.id;

  return (
    <div className='flex items-center justify-between px-3.5 min-h-10 mt-0.5'>
      <EnterpriseActions
        user={user}
        enterprises={authEnterprises}
        currentEnterpriseId={currentEnterpriseId}
      />
      <UserActions user={user} />
    </div>
  );
}
