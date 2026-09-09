import { useState } from 'react'

import type { ApiError, CartItem, QuoteResponse } from '../../../types'
import { ApiRequestError } from '../../../shared/api/apiError'
import { fingerprint } from '../../../shared/lib/requestFingerprint'
import { quoteCart } from '../api/quoteCart'

export type QuoteState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; inputFingerprint: string; data: QuoteResponse }
  | { status: 'error'; error: ApiError }

export function useQuote() {
  const [state, setState] = useState<QuoteState>({ status: 'idle' })

  async function applyCoupon(items: readonly CartItem[], couponCode: string) {
    const currentFingerprint = fingerprint(items, couponCode)
    setState({ status: 'loading' })

    try {
      const data = await quoteCart(items, couponCode)
      setState({ status: 'success', inputFingerprint: currentFingerprint, data })
    } catch (cause) {
      const error = cause instanceof ApiRequestError ? cause : new ApiRequestError('UNKNOWN_ERROR', 'Quote failed.')
      setState({ status: 'error', error })
    }
  }

  function isStale(items: readonly CartItem[], couponCode: string): boolean {
    if (state.status !== 'success') return false
    return state.inputFingerprint !== fingerprint(items, couponCode)
  }

  function reset() {
    setState({ status: 'idle' })
  }

  return { state, applyCoupon, isStale, reset }
}
