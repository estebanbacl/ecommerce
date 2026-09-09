import type { CartAction, CartState } from '../../../types'

export const initialCartState: CartState = {
  itemsByProductId: {},
  revision: 0,
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'itemAdded': {
      const existing = state.itemsByProductId[action.productId]
      const nextQuantity = (existing?.quantity ?? 0) + 1

      if (nextQuantity > action.knownStock) {
        return state
      }

      return {
        itemsByProductId: {
          ...state.itemsByProductId,
          [action.productId]: { productId: action.productId, quantity: nextQuantity },
        },
        revision: state.revision + 1,
      }
    }

    case 'itemDecremented': {
      const existing = state.itemsByProductId[action.productId]
      if (!existing) {
        return state
      }

      if (existing.quantity <= 1) {
        return removeItem(state, action.productId)
      }

      return {
        itemsByProductId: {
          ...state.itemsByProductId,
          [action.productId]: { productId: action.productId, quantity: existing.quantity - 1 },
        },
        revision: state.revision + 1,
      }
    }

    case 'itemRemoved': {
      if (!state.itemsByProductId[action.productId]) {
        return state
      }
      return removeItem(state, action.productId)
    }

    case 'cartCleared': {
      if (Object.keys(state.itemsByProductId).length === 0) {
        return state
      }
      return { itemsByProductId: {}, revision: state.revision + 1 }
    }

    default: {
      return assertNever(action)
    }
  }
}

function removeItem(state: CartState, productId: string): CartState {
  const { [productId]: _removed, ...rest } = state.itemsByProductId
  return { itemsByProductId: rest, revision: state.revision + 1 }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled cart action: ${JSON.stringify(value)}`)
}
