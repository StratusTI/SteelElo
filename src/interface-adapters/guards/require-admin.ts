// src/interface-adapters/guards/require-admin.ts

import { UserProps } from "@/src/domain/entities/user";
import { NextResponse } from "next/server";
import { requireAuth } from "./require-auth";

export async function requireAdmin(): Promise<{ user: UserProps | null; error?: NextResponse }> {
  const { user, error } = await requireAuth();

  if (error) return { user: null, error };

  if (!user || user.admin !== true) {
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
