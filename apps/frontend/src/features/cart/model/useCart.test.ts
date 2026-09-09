import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useCartDispatch, useCartState } from './useCart'

describe('useCart hooks used outside CartProvider', () => {
  it('useCartState throws a clear error', () => {
    expect(() => renderHook(() => useCartState())).toThrow('useCartState must be used within a CartProvider')
  })

  it('useCartDispatch throws a clear error', () => {
    expect(() => renderHook(() => useCartDispatch())).toThrow(
      'useCartDispatch must be used within a CartProvider',
    )
  })
})
