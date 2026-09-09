import type { CartItem, CheckoutRequest } from '../../../types'

/** Orders lines deterministically and strips an empty coupon; never sends prices. */
export function buildCheckoutRequest(items: readonly CartItem[], couponCode: string): CheckoutRequest {
  const sortedItems = [...items]
    .filter((item) => item.quantity > 0)
    .sort((a, b) => a.productId.localeCompare(b.productId))
    .map((item) => ({ productId: item.productId, quantity: item.quantity }))

  const trimmedCoupon = couponCode.trim()

  return trimmedCoupon === '' ? { items: sortedItems } : { items: sortedItems, couponCode: trimmedCoupon }
}
