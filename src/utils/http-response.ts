import { NextResponse } from "next/server";
import type { ErrorResponse, SuccessResponse } from "../@types/http-response";

export interface CacheOptions {
  maxAge?: number;
  staleWhileRevalidate?: number;
  private?: boolean;
}

/**
 * Cria uma resposta HTTP de sucesso padronizada
 *
 * @example
 * return successResponse({ user: { id: 1, name: 'John' } }, 200)
 * // { success: true, statusCode: 200, data: { user: { id: 1, name: 'John' } } }
 *
 * @example com cache
 * return successResponse(data, 200, undefined, { maxAge: 60, staleWhileRevalidate: 120 })
*/
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string,
  cacheOptions?: CacheOptions
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    statusCode,
    data,
  }

  if (message) {
    response.message = message;
  }

  const headers: HeadersInit = {};

  if (cacheOptions) {
    const { maxAge = 0, staleWhileRevalidate = 0, private: isPrivate = false } = cacheOptions;
    const scope = isPrivate ? 'private' : 'public';
    headers['Cache-Control'] = `${scope}, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
  }

  return NextResponse.json(
    response,
    { status: statusCode, headers }
  )
}

export type ErrorDetails = Record<string, unknown> | unknown[]

/**
 * Cria uma resposta HTTP de erro padronizada
 *
 * @example
 * return errorResponse('RESOURCE_NOT_FOUND', 404, 'User not found')
 * // { success: false, statusCode: 404, message: 'User not found', error: { code: 'RESOURCE_NOT_FOUND' } }
 */
export function errorResponse(
  code: string,
  statusCode: number = 500,
  message?: string,
  details?: ErrorDetails
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    statusCode,
    error: {
      code,
      ...(details && { details })
    }
  }

  if (message) {
    response.message = message;
  }

  return NextResponse.json(
    response,
    { status: statusCode }
  )
}

export const ERROR_CODES = {
  // Authentication & Authorization (401, 403)
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  INVALID_TOKEN: { code: 'INVALID_TOKEN', status: 401 },
  TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', status: 401 },
  INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  INSUFFICIENT_PERMISSIONS: { code: 'INSUFFICIENT_PERMISSIONS', status: 403 },

  // Client Erros (400, 404, 409, 422)
  BAD_REQUEST: { code: 'BAD_REQUEST', status: 400 },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 422 },
  RESOURCE_NOT_FOUND: { code: 'RESOURCE_NOT_FOUND', status: 404 },
  CONFLICT: { code: 'CONFLICT', status: 409 },

  // Server Errors (500)
  INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', status: 500 },
  DATABASE_ERROR: { code: 'DATABASE_ERROR', status: 500 },
} as const

/**
 * Helper para criar erro a partir de constantes predefinidas
 *
 * @example
 * return standardError('RESOURCE_NOT_FOUND', 'User not found')
 */
export function standardError(
  errorType: keyof typeof ERROR_CODES,
  message?: string,
  details?: ErrorDetails
): NextResponse<ErrorResponse> {
  const { code, status } = ERROR_CODES[errorType];

  return errorResponse(code, status, message, details);
}
