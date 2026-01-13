import { getAuthUser } from '@/src/http/middlewares/verify-jwt';
import {
  getUserFullName,
  isUserAdmin,
  isUserSuperAdmin,
} from '@/src/utils/user';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('https://painel.stratustelecom.com.br/main/login.php');
  }

  const fullName = getUserFullName(user);
  const isAdmin = isUserAdmin(user);
  const isSuperAdmin = isUserSuperAdmin(user);

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {fullName}</p>
      <p>Admin: {isAdmin ? 'Yes' : 'No'}</p>
      <p>Super Admin: {isSuperAdmin ? 'Yes' : 'No'}</p>
    </div>
  );
}
