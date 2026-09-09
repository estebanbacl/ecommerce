import { describe, expect, it } from 'vitest'

import type { CartState } from '../../../types'
import { cartReducer, initialCartState } from './cartReducer'

describe('cartReducer', () => {
  it('adds the first unit of a product', () => {
    const state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    expect(state.itemsByProductId.p1).toEqual({ productId: 'p1', quantity: 1 })
  })

  it('increments an existing line', () => {
    let state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    state = cartReducer(state, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    expect(state.itemsByProductId.p1?.quantity).toBe(2)
  })

  it('never exceeds the known stock', () => {
    let state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 1 })
    const before = state
    state = cartReducer(state, { type: 'itemAdded', productId: 'p1', knownStock: 1 })
    expect(state).toBe(before)
    expect(state.itemsByProductId.p1?.quantity).toBe(1)
  })

  it('decrements a line', () => {
    let state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    state = cartReducer(state, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    state = cartReducer(state, { type: 'itemDecremented', productId: 'p1' })
    expect(state.itemsByProductId.p1?.quantity).toBe(1)
  })

  it('removes the line when decrementing the last unit', () => {
    let state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    state = cartReducer(state, { type: 'itemDecremented', productId: 'p1' })
    expect(state.itemsByProductId.p1).toBeUndefined()
  })

  it('removes a line entirely', () => {
    let state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    state = cartReducer(state, { type: 'itemRemoved', productId: 'p1' })
    expect(state.itemsByProductId.p1).toBeUndefined()
  })

  it('clears the cart', () => {
    let state = cartReducer(initialCartState, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    state = cartReducer(state, { type: 'cartCleared' })
    expect(Object.keys(state.itemsByProductId)).toHaveLength(0)
  })

  it('returns the same reference for a no-op action', () => {
    const before = initialCartState
    const state = cartReducer(before, { type: 'itemDecremented', productId: 'missing' })
    expect(state).toBe(before)
  })

  it('never mutates the previous state object', () => {
    const before: CartState = { itemsByProductId: { p1: { productId: 'p1', quantity: 1 } }, revision: 3 }
    const beforeSnapshot = structuredClone(before)
    cartReducer(before, { type: 'itemAdded', productId: 'p1', knownStock: 5 })
    expect(before).toEqual(beforeSnapshot)
  })
})
