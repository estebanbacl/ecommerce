import { useRef, useState } from 'react'

import type { ApiError, CartItem, CheckoutResponse } from '../../../types'
import { ApiRequestError } from '../../../shared/api/apiError'
import { submitCheckout } from '../api/submitCheckout'

export type CheckoutState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; data: CheckoutResponse }
  | { status: 'error'; error: ApiError; retryable: boolean }

const RETRYABLE_CODES = new Set(['SERVICE_UNAVAILABLE', 'NETWORK_ERROR', 'INTERNAL_ERROR'])

export function useCheckout() {
  const [state, setState] = useState<CheckoutState>({ status: 'idle' })
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID())

  async function checkout(items: readonly CartItem[], couponCode: string) {
    if (state.status === 'submitting') return

    setState({ status: 'submitting' })
    try {
      const data = await submitCheckout(items, couponCode, idempotencyKeyRef.current)
      setState({ status: 'success', data })
    } catch (cause) {
      const error =
        cause instanceof ApiRequestError ? cause : new ApiRequestError('UNKNOWN_ERROR', 'Checkout failed.')
      setState({ status: 'error', error, retryable: RETRYABLE_CODES.has(error.code) })
    }
  }

  function startNewPurchase() {
    idempotencyKeyRef.current = crypto.randomUUID()
    setState({ status: 'idle' })
  }

  return { state, checkout, startNewPurchase }
}
