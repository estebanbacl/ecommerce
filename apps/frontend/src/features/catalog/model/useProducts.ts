import { useEffect, useState } from 'react'

import type { ApiError, Product } from '../../../types'
import { getProducts } from '../api/getProducts'
import { ApiRequestError } from '../../../shared/api/apiError'

export type ProductsState =
  | { status: 'loading' }
  | { status: 'success'; data: readonly Product[] }
  | { status: 'error'; error: ApiError }

export function useProducts(): { state: ProductsState; reload: () => void } {
  const [state, setState] = useState<ProductsState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })

    getProducts(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ status: 'success', data })
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        const error =
          cause instanceof ApiRequestError
            ? cause
            : new ApiRequestError('UNKNOWN_ERROR', 'Could not load the catalog.')
        setState({ status: 'error', error })
      })

    return () => controller.abort()
  }, [attempt])

  return { state, reload: () => setAttempt((n) => n + 1) }
}
