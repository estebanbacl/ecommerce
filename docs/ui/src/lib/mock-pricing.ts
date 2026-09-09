import type { CartItem, DiscountBreakdown } from '../types'

function percentage(amount: number, rate: number): number {
  return Math.round(amount * rate)
}

export function calculateMockBreakdown(
  items: readonly CartItem[],
  couponCode: string,
): DiscountBreakdown {
  const originalSubtotal = items.reduce(
    (total, item) => total + item.product.unitPrice * item.quantity,
    0,
  )
  const technologySubtotal = items.reduce(
    (total, item) =>
      item.product.category === 'Tecnología'
        ? total + item.product.unitPrice * item.quantity
        : total,
    0,
  )
  const categoryDiscount = percentage(technologySubtotal, 0.1)
  const afterCategory = originalSubtotal - categoryDiscount
  const volumeDiscount = afterCategory > 10000 ? percentage(afterCategory, 0.05) : 0
  const afterVolume = afterCategory - volumeDiscount
  const couponIsValid = couponCode.trim().toUpperCase() === 'WELCOME2026'
  const couponDiscount = couponIsValid ? percentage(afterVolume, 0.15) : 0
  const rawFinal = afterVolume - couponDiscount
  const rawSavings = originalSubtotal - rawFinal
  const maximumSavings = percentage(originalSubtotal, 0.35)
  const totalSavings = Math.min(rawSavings, maximumSavings)
  const finalTotal = originalSubtotal - totalSavings

  return {
    originalSubtotal,
    categoryDiscount,
    volumeDiscount,
    couponDiscount,
    effectiveDiscountPercentage:
      originalSubtotal === 0 ? 0 : (totalSavings / originalSubtotal) * 100,
    totalSavings,
    finalTotal,
    limitApplied: rawSavings > maximumSavings,
  }
}
