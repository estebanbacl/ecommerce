import { useContext } from 'react'

import type { CartState } from '../../../types'
import { CartDispatchContext, CartStateContext } from './CartProvider'

export function useCartState(): CartState {
  const state = useContext(CartStateContext)
  if (state === undefined) {
    throw new Error('useCartState must be used within a CartProvider')
  }
  return state
}

export function useCartDispatch() {
  const dispatch = useContext(CartDispatchContext)
  if (dispatch === undefined) {
    throw new Error('useCartDispatch must be used within a CartProvider')
  }
  return dispatch
}
