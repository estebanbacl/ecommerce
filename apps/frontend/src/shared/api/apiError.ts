import type { ApiError, ApiErrorCode, ErrorDetail } from '../../types'

export class ApiRequestError extends Error implements ApiError {
  readonly code: ApiErrorCode
  readonly requestId?: string
  readonly details?: readonly ErrorDetail[]

  constructor(code: ApiErrorCode, message: string, requestId?: string, details?: readonly ErrorDetail[]) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.requestId = requestId
    this.details = details
  }
}
