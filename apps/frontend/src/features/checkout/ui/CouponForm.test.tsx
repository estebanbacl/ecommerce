import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CouponForm } from './CouponForm'

describe('CouponForm', () => {
  it('calls onApply when the form is submitted', async () => {
    const onApply = vi.fn()
    render(<CouponForm value="WELCOME2026" onChange={() => {}} disabled={false} loading={false} onApply={onApply} />)

    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    expect(onApply).toHaveBeenCalledTimes(1)
  })

  it('disables the submit button while loading', () => {
    render(<CouponForm value="" onChange={() => {}} disabled={false} loading onApply={() => {}} />)
    expect(screen.getByRole('button', { name: 'Aplicando…' })).toBeDisabled()
  })
})
