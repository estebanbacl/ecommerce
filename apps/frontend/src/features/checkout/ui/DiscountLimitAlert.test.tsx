import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DiscountLimitAlert } from './DiscountLimitAlert'

describe('DiscountLimitAlert', () => {
  it('renders the exact required text when limitApplied is true', () => {
    render(<DiscountLimitAlert visible />)
    expect(screen.getByRole('status')).toHaveTextContent(
      '¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido (35%)',
    )
  })

  it('renders nothing when limitApplied is false', () => {
    render(<DiscountLimitAlert visible={false} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
