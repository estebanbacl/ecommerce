import { useState } from 'react'

import type { CartItem } from '../../../types'
import { sendTelemetryEvent } from '../../../services/telemetry/metricsService'
import { useCheckout } from '../model/useCheckout'
import { useQuote } from '../model/useQuote'
import { CouponForm } from './CouponForm'
import { DiscountBreakdownView } from './DiscountBreakdownView'
import { DiscountLimitAlert } from './DiscountLimitAlert'
import { OrderConfirmation } from './OrderConfirmation'

export function CheckoutPanel({
  items,
  canCheckout,
  onOrderConfirmed,
}: {
  items: readonly CartItem[]
  canCheckout: boolean
  onOrderConfirmed: () => void
}) {
  const [couponCode, setCouponCode] = useState('')
  const quote = useQuote()
  const checkout = useCheckout()

  if (checkout.state.status === 'success') {
    return (
      <OrderConfirmation
        order={checkout.state.data}
        onStartNewPurchase={() => {
          checkout.startNewPurchase()
          quote.reset()
          setCouponCode('')
          onOrderConfirmed()
        }}
      />
    )
  }

  const stale = quote.isStale(items, couponCode)

  return (
    <section
      aria-label="Confirmación de compra"
      className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-neutral-900">Cupón y desglose</h2>

      <CouponForm
        value={couponCode}
        onChange={setCouponCode}
        disabled={!canCheckout || checkout.state.status === 'submitting'}
        loading={quote.state.status === 'loading'}
        onApply={() => {
          sendTelemetryEvent('coupon_apply_clicked')
          void quote.applyCoupon(items, couponCode)
        }}
      />

      {quote.state.status === 'error' && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          No se pudo cotizar: {quote.state.error.message}
        </p>
      )}

      {quote.state.status === 'success' && (
        <>
          {stale && (
            <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              El carrito cambió: vuelve a aplicar el cupón para ver el desglose vigente.
            </p>
          )}
          <DiscountBreakdownView breakdown={quote.state.data.breakdown} coupon={quote.state.data.coupon} />
          <DiscountLimitAlert visible={quote.state.data.breakdown.limitApplied} />
        </>
      )}

      {checkout.state.status === 'error' && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          No se pudo confirmar la compra: {checkout.state.error.message}
          {checkout.state.retryable ? ' Puedes reintentar.' : ''}
        </p>
      )}

      <button
        type="button"
        disabled={!canCheckout || checkout.state.status === 'submitting'}
        onClick={() => void checkout.checkout(items, couponCode)}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
      >
        {checkout.state.status === 'submitting' ? 'Procesando…' : 'Confirmar compra'}
      </button>
    </section>
  )
}
