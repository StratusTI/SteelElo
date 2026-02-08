import { requireAuth } from '@/src/lib/helpers/auth-helper';
import { getUserFullName } from '@/src/utils/user';

export async function getUser() {
  const { user } = await requireAuth();
  const fullname = getUserFullName(user)

  return { fullname };
}
