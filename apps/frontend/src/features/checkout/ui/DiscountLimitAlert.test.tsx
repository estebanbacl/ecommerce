import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DiscountLimitAlert } from './DiscountLimitAlert'

describe('DiscountLimitAlert', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

  it('reports a discount_limit_alert_shown telemetry event when it becomes visible', () => {
    render(<DiscountLimitAlert visible />)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/metrics$/)
    expect(JSON.parse(init.body as string)).toEqual({ event: 'discount_limit_alert_shown' })
  })

  it('does not report telemetry when it is not visible', () => {
    render(<DiscountLimitAlert visible={false} />)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
