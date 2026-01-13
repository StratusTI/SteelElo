import { User } from "@/src/@types/user";
import { decodeToken, verifyToken } from "@/src/utils/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  const user = await decodeToken(token)
  return user
}

export async function verifyJWT(): Promise<{ user: User | null; error?: NextResponse }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  const user = await verifyToken(token)

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  return { user }
}
