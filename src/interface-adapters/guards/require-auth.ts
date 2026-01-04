import { UserProps } from "@/src/domain/entities/user";
import { JWTService } from "@/src/infrastructure/auth/jwt-service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const jwtService = new JWTService()

export async function getAuthUser(): Promise<UserProps | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  return await jwtService.verifyToken(token)
}

export async function requireAuth(): Promise<{ user: UserProps | null; error?: NextResponse}> {
  const user = await getAuthUser()

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return { user }
}
