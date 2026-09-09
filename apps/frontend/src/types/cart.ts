export interface CartItem {
  productId: string
  quantity: number
}

export interface CartState {
  readonly itemsByProductId: Readonly<Record<string, CartItem>>
  readonly revision: number
}

export type CartAction =
  | { type: 'itemAdded'; productId: string; knownStock: number }
  | { type: 'itemDecremented'; productId: string }
  | { type: 'itemRemoved'; productId: string }
  | { type: 'cartCleared' }
