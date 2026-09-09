import type { CartItem } from '../../types'

/**
 * A deterministic fingerprint of the consolidated cart and normalized
 * coupon. Used to decide whether a previous quote is still current
 * without an Effect that copies state.
 */
export function fingerprint(items: readonly CartItem[], couponCode: string): string {
  const sorted = [...items].sort((a, b) => a.productId.localeCompare(b.productId))
  const normalizedCoupon = couponCode.trim().toUpperCase()
  return JSON.stringify({ items: sorted, coupon: normalizedCoupon })
}
