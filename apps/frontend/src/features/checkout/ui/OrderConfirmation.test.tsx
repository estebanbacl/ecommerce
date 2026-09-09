import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { CheckoutResponse } from '../../../types'
import { OrderConfirmation } from './OrderConfirmation'

const order: CheckoutResponse = {
  orderId: 'ord-001',
  status: 'CONFIRMED',
  items: [],
  coupon: { code: 'WELCOME2026', status: 'APPLIED' },
  breakdown: {
    originalSubtotal: 12000,
    categoryDiscount: 1200,
    afterCategory: 10800,
    volumeDiscount: 540,
    afterVolume: 10260,
    couponDiscount: 1539,
    calculatedSavings: 3279,
    maximumSavings: 4200,
    finalSavings: 3279,
    effectiveDiscountPercentage: 27.325,
    limitApplied: false,
    finalTotal: 8721,
    currency: 'USD',
  },
}

describe('OrderConfirmation', () => {
  it('shows the order id, status, and moves focus to the confirmation heading', () => {
    render(<OrderConfirmation order={order} onStartNewPurchase={() => {}} />)

    expect(screen.getByText('ord-001')).toBeInTheDocument()
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '¡Compra confirmada!' })).toHaveFocus()
  })

  it('does not show the limit alert when limitApplied is false', () => {
    render(<OrderConfirmation order={order} onStartNewPurchase={() => {}} />)
    expect(screen.queryByText(/límite máximo de ahorro permitido/)).not.toBeInTheDocument()
  })

  it('shows the limit alert when limitApplied is true', () => {
    const limited: CheckoutResponse = { ...order, breakdown: { ...order.breakdown, limitApplied: true } }
    render(<OrderConfirmation order={limited} onStartNewPurchase={() => {}} />)
    expect(screen.getByText(/límite máximo de ahorro permitido/)).toBeInTheDocument()
  })

  it('calls onStartNewPurchase when the button is clicked', async () => {
    const onStartNewPurchase = vi.fn()
    render(<OrderConfirmation order={order} onStartNewPurchase={onStartNewPurchase} />)

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar una nueva compra' }))

    expect(onStartNewPurchase).toHaveBeenCalledTimes(1)
  })
})
