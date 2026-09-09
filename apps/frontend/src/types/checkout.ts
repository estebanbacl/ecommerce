import type { Category, Currency } from './product'

export type CouponStatus = 'APPLIED' | 'NOT_FOUND' | 'EXPIRED' | 'OMITTED'

export interface CouponResult {
  code: string | null
  status: CouponStatus
}

export interface DiscountBreakdown {
  originalSubtotal: number
  categoryDiscount: number
  afterCategory: number
  volumeDiscount: number
  afterVolume: number
  couponDiscount: number
  calculatedSavings: number
  maximumSavings: number
  finalSavings: number
  effectiveDiscountPercentage: number
  limitApplied: boolean
  finalTotal: number
  currency: Currency
}

export interface ConfirmedItem {
  productId: string
  name: string
  category: Category
  unitPrice: number
  quantity: number
  lineAmount: number
}

export interface CheckoutRequest {
  items: ReadonlyArray<{ productId: string; quantity: number }>
  couponCode?: string
}

export interface QuoteResponse {
  items: readonly ConfirmedItem[]
  coupon: CouponResult
  breakdown: DiscountBreakdown
  binding: boolean
}

export interface CheckoutResponse {
  orderId: string
  status: 'CONFIRMED'
  items: readonly ConfirmedItem[]
  coupon: CouponResult
  breakdown: DiscountBreakdown
}
