import { cookies } from 'next/headers';
import { successResponse } from '@/src/utils/http-response';

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete('auth_token');

  return successResponse(
    { message: 'Logout successful' },
    200,
    'User logged out successfully',
  );
}
