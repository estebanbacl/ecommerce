import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { CouponResult, DiscountBreakdown } from '../../../types'
import { DiscountBreakdownView } from './DiscountBreakdownView'

const breakdown: DiscountBreakdown = {
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
}

function coupon(status: CouponResult['status']): CouponResult {
  return { code: status === 'OMITTED' ? null : 'WELCOME2026', status }
}

describe('DiscountBreakdownView', () => {
  it('shows every concept from the authoritative backend breakdown, including the final total', () => {
    render(<DiscountBreakdownView breakdown={breakdown} coupon={coupon('APPLIED')} />)

    expect(screen.getByText('Cupón aplicado correctamente.')).toBeInTheDocument()
    const finalTotalLabel = screen.getByText('Total final')
    expect(finalTotalLabel.parentElement?.textContent).toMatch(/87[,.]21/)
  })

  it('renders a distinct message per coupon status without recalculating anything', () => {
    const { rerender } = render(<DiscountBreakdownView breakdown={breakdown} coupon={coupon('NOT_FOUND')} />)
    expect(screen.getByText('El cupón ingresado no existe.')).toBeInTheDocument()

    rerender(<DiscountBreakdownView breakdown={breakdown} coupon={coupon('EXPIRED')} />)
    expect(screen.getByText('El cupón ingresado expiró.')).toBeInTheDocument()

    rerender(<DiscountBreakdownView breakdown={breakdown} coupon={coupon('OMITTED')} />)
    expect(screen.getByText('No se aplicó ningún cupón.')).toBeInTheDocument()
  })
})
