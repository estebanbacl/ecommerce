import type { CartItem, CartState, Product } from '../../../types'

export function selectItems(state: CartState): readonly CartItem[] {
  return Object.values(state.itemsByProductId)
}

export function selectTotalUnits(state: CartState): number {
  return selectItems(state).reduce((total, item) => total + item.quantity, 0)
}

export function selectOriginalSubtotal(state: CartState, products: readonly Product[]): number {
  const productById = new Map(products.map((product) => [product.id, product]))

  return selectItems(state).reduce((subtotal, item) => {
    const product = productById.get(item.productId)
    if (!product) {
      return subtotal
    }
    return subtotal + product.unitPrice * item.quantity
  }, 0)
}

export function selectCanCheckout(state: CartState): boolean {
  return selectItems(state).length > 0
}
