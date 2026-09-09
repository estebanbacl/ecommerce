import { useEffect, useRef } from 'react'

import type { CheckoutResponse } from '../../../types'
import { formatCents } from '../../../shared/lib/formatMoney'
import { DiscountLimitAlert } from './DiscountLimitAlert'

export function OrderConfirmation({
  order,
  onStartNewPurchase,
}: {
  order: CheckoutResponse
  onStartNewPurchase: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section
      aria-label="Confirmación de la orden"
      className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm"
    >
      <h2 ref={headingRef} tabIndex={-1} className="text-lg font-semibold text-neutral-900 outline-none">
        ¡Compra confirmada!
      </h2>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Orden</dt>
          <dd className="font-medium text-neutral-900">{order.orderId}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Estado</dt>
          <dd className="font-medium text-neutral-900">{order.status}</dd>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-1.5">
          <dt className="text-neutral-500">Total pagado</dt>
          <dd className="text-base font-semibold text-neutral-900">{formatCents(order.breakdown.finalTotal)}</dd>
        </div>
      </dl>
      <DiscountLimitAlert visible={order.breakdown.limitApplied} />
      <button
        type="button"
        onClick={onStartNewPurchase}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
      >
        Iniciar una nueva compra
      </button>
    </section>
  )
}
