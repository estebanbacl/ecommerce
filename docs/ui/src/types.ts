export type ProductCategory = 'Tecnología' | 'Accesorios' | 'Hogar'

export type ProductTone = 'violet' | 'sky' | 'amber' | 'emerald'

export interface Product {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: ProductCategory
  readonly unitPrice: number
  readonly stock: number
  readonly tone: ProductTone
}

export interface CartItem {
  readonly product: Product
  readonly quantity: number
}

export interface DiscountBreakdown {
  readonly originalSubtotal: number
  readonly categoryDiscount: number
  readonly volumeDiscount: number
  readonly couponDiscount: number
  readonly effectiveDiscountPercentage: number
  readonly totalSavings: number
  readonly finalTotal: number
  readonly limitApplied: boolean
}
