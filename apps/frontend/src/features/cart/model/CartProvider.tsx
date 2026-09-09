import { createContext, useReducer, type Dispatch, type ReactNode } from 'react'

import type { CartAction, CartState } from '../../../types'
import { cartReducer, initialCartState } from './cartReducer'

export const CartStateContext = createContext<CartState | undefined>(undefined)
export const CartDispatchContext = createContext<Dispatch<CartAction> | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState)

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  )
}
