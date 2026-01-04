import { requireAuth } from "@/lib/api-helpers";
import { UserProps } from "@/src/domain/entities/user";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<{ user: UserProps | null; error?: NextResponse }> {
  const { user, error } = await requireAuth();

  if (error) return { user: null, error };

  if (!user || user.admin !== 1) {
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
