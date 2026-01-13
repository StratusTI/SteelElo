// src/interface-adapters/guards/require-auth.ts

import { UserProps } from "@/src/domain/entities/user";
import { JWTService } from "@/src/infrastructure/auth/jwt-service";
import { PrismaUserRepository } from "@/src/infrastructure/database/prisma/repositories/prisma-user-repository";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const jwtService = new JWTService()
const userRepository = new PrismaUserRepository()

export async function getAuthUser(): Promise<UserProps | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  const tokenData = await jwtService.decodeToken(token)
  if (!tokenData) return null

  const user = await userRepository.findById(tokenData.id)
  if (!user) return null

  return user.toJSON()
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
