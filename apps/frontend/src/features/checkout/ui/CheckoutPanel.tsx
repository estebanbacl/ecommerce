import { useState } from 'react'

import type { CartItem } from '../../../types'
import { LockKeyhole, ShoppingBag } from '../../../shared/ui/icons'
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
  const couponApplied = quote.state.status === 'success' && !stale && quote.state.data.coupon.status === 'APPLIED'

  return (
    <section
      aria-label="Confirmación de compra"
      className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_28px_80px_-40px_rgba(28,25,23,0.45)] sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-stone-950 text-white">
          <ShoppingBag aria-hidden="true" size={16} />
        </span>
        <h2 className="text-lg font-black tracking-tight text-stone-950">Cupón y desglose</h2>
      </div>

      <CouponForm
        value={couponCode}
        onChange={setCouponCode}
        disabled={!canCheckout || checkout.state.status === 'submitting'}
        loading={quote.state.status === 'loading'}
        applied={couponApplied}
        onApply={() => void quote.applyCoupon(items, couponCode)}
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
          <div className="h-px bg-stone-100" />
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
        className="group flex min-h-12 w-full items-center justify-between rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_35px_-18px_rgba(109,40,217,0.8)] transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
      >
        <span className="flex items-center gap-2">
          <LockKeyhole aria-hidden="true" size={16} />
          {checkout.state.status === 'submitting' ? 'Procesando…' : 'Confirmar compra'}
        </span>
      </button>

      <p className="text-center text-[0.68rem] leading-4 text-stone-400">
        Pago simulado · Precios expresados en USD
      </p>
    </section>
  )
}
