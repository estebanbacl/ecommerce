export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'EMPTY_CART'
  | 'INVALID_QUANTITY'
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export interface ErrorDetail {
  field?: string
  productId?: string
  available?: number
  requested?: number
}

export interface ApiError {
  code: ApiErrorCode
  message: string
  requestId?: string
  details?: readonly ErrorDetail[]
}
