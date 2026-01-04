import { NextResponse } from "next/server";

export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json({ ...data, success: true }, { status })
}
