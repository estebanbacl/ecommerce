import { useState } from 'react'

import type { CartItem } from '../../../types'
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
    <section aria-label="Confirmación de compra">
      <CouponForm
        value={couponCode}
        onChange={setCouponCode}
        disabled={!canCheckout || checkout.state.status === 'submitting'}
        loading={quote.state.status === 'loading'}
        onApply={() => void quote.applyCoupon(items, couponCode)}
      />

      {quote.state.status === 'error' && <p role="alert">No se pudo cotizar: {quote.state.error.message}</p>}

      {quote.state.status === 'success' && (
        <>
          {stale && <p role="status">El carrito cambió: vuelve a aplicar el cupón para ver el desglose vigente.</p>}
          <DiscountBreakdownView breakdown={quote.state.data.breakdown} coupon={quote.state.data.coupon} />
          <DiscountLimitAlert visible={quote.state.data.breakdown.limitApplied} />
        </>
      )}

      {checkout.state.status === 'error' && (
        <p role="alert">
          No se pudo confirmar la compra: {checkout.state.error.message}
          {checkout.state.retryable ? ' Puedes reintentar.' : ''}
        </p>
      )}

      <button
        type="button"
        disabled={!canCheckout || checkout.state.status === 'submitting'}
        onClick={() => void checkout.checkout(items, couponCode)}
      >
        {checkout.state.status === 'submitting' ? 'Procesando…' : 'Confirmar compra'}
      </button>
    </section>
  )
}
