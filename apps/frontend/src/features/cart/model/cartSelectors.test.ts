import { describe, expect, it } from 'vitest'

import type { Product } from '../../../types'
import { cartReducer, initialCartState } from './cartReducer'
import { selectCanCheckout, selectOriginalSubtotal, selectTotalUnits } from './cartSelectors'

const products: Product[] = [
  { id: 'p1', name: 'A', unitPrice: 1000, currency: 'USD', category: 'HOME', stock: 5 },
  { id: 'p2', name: 'B', unitPrice: 500, currency: 'USD', category: 'BOOKS', stock: 5 },
]

describe('cartSelectors', () => {
  it('computes zero subtotal for an empty cart', () => {
    expect(selectOriginalSubtotal(initialCartState, products)).toBe(0)
  })

  it('sums unitPrice * quantity in cents for a single product', () => {
    const state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    expect(selectOriginalSubtotal(state, products)).toBe(1000)
  })

  it('sums across multiple products', () => {
    let state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    state = cartReducer(state, { type: 'itemAdded', productId: 'p2', knownStock: 5 })
    state = cartReducer(state, { type: 'itemAdded', productId: 'p2', knownStock: 5 })
    expect(selectOriginalSubtotal(state, products)).toBe(1000 + 500 * 2)
  })

  it('counts total units', () => {
    let state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    state = cartReducer(state, { type: 'itemAdded', productId: 'p2', knownStock: 5 })
    expect(selectTotalUnits(state)).toBe(2)
  })

  it('disables checkout for an empty cart', () => {
    expect(selectCanCheckout(initialCartState)).toBe(false)
  })

  it('enables checkout once a line exists', () => {
    const state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    expect(selectCanCheckout(state)).toBe(true)
  })
})
