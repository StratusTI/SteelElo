import { auth } from "@/src/lib/auth"
import { headers } from "next/headers"
import { unauthorized } from "@/src/errors"
import { type Result, ok, err } from "@/src/lib/result"

export async function getAuthSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err(unauthorized("Nao autenticado"))
  return ok(session)
}
