import { successResponse } from '@/src/utils/http-response';
import { clearAuthCookies } from '@/src/auth';

export async function POST() {
  await clearAuthCookies();

  return successResponse(
    { message: 'Logout successful' },
    200,
    'User logged out successfully',
  );
}
