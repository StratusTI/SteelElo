import { NextResponse } from "next/server";

export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message, success: false }, { status })
}
