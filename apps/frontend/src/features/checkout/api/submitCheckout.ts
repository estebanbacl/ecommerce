import { request } from '../../../shared/api/httpClient'
import { checkoutResponseSchema } from '../../../shared/api/schemas'
import type { CartItem, CheckoutResponse } from '../../../types'
import { buildCheckoutRequest } from './buildCheckoutRequest'

export async function submitCheckout(
  items: readonly CartItem[],
  couponCode: string,
  idempotencyKey: string,
): Promise<CheckoutResponse> {
  return request('/api/checkout', {
    method: 'POST',
    body: buildCheckoutRequest(items, couponCode),
    schema: checkoutResponseSchema,
    idempotencyKey,
  })
}
