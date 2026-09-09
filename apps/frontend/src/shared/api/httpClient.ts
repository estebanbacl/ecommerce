import type { z } from 'zod'

import { config } from '../../app/config'
import { ApiRequestError } from './apiError'
import { errorEnvelopeSchema } from './schemas'

const DEFAULT_TIMEOUT_MS = 8000

interface RequestOptions<T> {
  method: 'GET' | 'POST'
  body?: unknown
  schema: z.ZodType<T>
  signal?: AbortSignal
  idempotencyKey?: string
  timeoutMs?: number
}

/**
 * The single boundary between the app and the network. It never imports
 * React and never shows notifications: callers translate ApiRequestError
 * into UI.
 */
export async function request<T>(path: string, options: RequestOptions<T>): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort())
  }

  let response: Response
  try {
    response = await fetch(`${config.apiBaseUrl}${path}`, {
      method: options.method,
      headers: buildHeaders(options),
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })
  } catch (cause) {
    if (controller.signal.aborted) {
      throw new ApiRequestError('NETWORK_ERROR', 'The request was aborted or timed out.')
    }
    throw new ApiRequestError('NETWORK_ERROR', 'Could not reach the server. Check your connection.')
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw await toApiRequestError(response)
  }

  const json: unknown = await response.json().catch(() => undefined)
  const parsed = options.schema.safeParse(json)
  if (!parsed.success) {
    throw new ApiRequestError('INVALID_RESPONSE', 'The server response did not match the expected contract.')
  }

  return parsed.data
}

function buildHeaders(options: RequestOptions<unknown>): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' }
  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey
  }
  return headers
}

async function toApiRequestError(response: Response): Promise<ApiRequestError> {
  const json: unknown = await response.json().catch(() => undefined)
  const parsed = errorEnvelopeSchema.safeParse(json)

  if (parsed.success) {
    const { code, message, requestId, details } = parsed.data.error
    return new ApiRequestError(asKnownCode(code), message, requestId, details)
  }

  if (response.status >= 500) {
    return new ApiRequestError('SERVICE_UNAVAILABLE', 'The server is temporarily unavailable.')
  }

  return new ApiRequestError('UNKNOWN_ERROR', `Unexpected response (${response.status}).`)
}

const KNOWN_CODES = new Set([
  'INVALID_REQUEST',
  'EMPTY_CART',
  'INVALID_QUANTITY',
  'PRODUCT_NOT_FOUND',
  'INSUFFICIENT_STOCK',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_ERROR',
])

function asKnownCode(code: string): import('../../types').ApiErrorCode {
  return KNOWN_CODES.has(code) ? (code as import('../../types').ApiErrorCode) : 'UNKNOWN_ERROR'
}
