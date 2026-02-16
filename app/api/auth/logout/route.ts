import { clearAuthCookies } from '@/src/auth';
import { successResponse } from '@/src/utils/http-response';

export async function POST() {
  await clearAuthCookies();

  return successResponse(
    { message: 'Logout successful' },
    200,
    'User logged out successfully',
  );
}
