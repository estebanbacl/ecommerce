import { request } from '../../../shared/api/httpClient'
import { quoteResponseSchema } from '../../../shared/api/schemas'
import type { CartItem, QuoteResponse } from '../../../types'
import { buildCheckoutRequest } from './buildCheckoutRequest'

export async function quoteCart(
  items: readonly CartItem[],
  couponCode: string,
  signal?: AbortSignal,
): Promise<QuoteResponse> {
  return request('/api/checkout/quote', {
    method: 'POST',
    body: buildCheckoutRequest(items, couponCode),
    schema: quoteResponseSchema,
    signal,
  })
}
