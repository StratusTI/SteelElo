import { NextResponse } from 'next/server'
import type { AppError } from '@/src/errors'

export function successResponse<T>(data: T, statusCode = 200, message?: string) {
  return NextResponse.json(
    {
      success: true,
      statusCode,
      data,
      ...(message && { message }),
    },
    { status: statusCode },
  )
}

export function errorResponse(error: AppError) {
  return NextResponse.json(
    {
      success: false,
      statusCode: error.statusCode,
      message: error.message,
      error: {
        code: error.code,
        ...(error.details != null ? { details: error.details } : {}),
      },
    },
    { status: error.statusCode },
  )
}
