import { useEffect, useRef } from 'react'

import type { CheckoutResponse } from '../../../types'
import { formatCents } from '../../../shared/lib/formatMoney'
import { ArrowRight, CheckCircle2 } from '../../../shared/ui/icons'
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
      className="space-y-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-4 shadow-sm"
    >
      <div className="flex items-start gap-3 text-violet-950" role="status">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0" size={22} />
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="text-lg font-black tracking-tight outline-none">
            ¡Compra confirmada!
          </h2>
          <p className="mt-1 text-xs leading-5 text-violet-700">Recibirás el detalle en unos instantes.</p>
        </div>
      </div>

      <dl className="space-y-1.5 rounded-xl bg-white/70 p-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-500">Orden</dt>
          <dd className="font-bold text-stone-900">{order.orderId}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-500">Estado</dt>
          <dd className="font-bold text-stone-900">{order.status}</dd>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-1.5">
          <dt className="text-stone-500">Total pagado</dt>
          <dd className="text-base font-black text-stone-950 tabular-nums">
            {formatCents(order.breakdown.finalTotal)}
          </dd>
        </div>
      </dl>

      <DiscountLimitAlert visible={order.breakdown.limitApplied} />

      <button
        type="button"
        onClick={onStartNewPurchase}
        className="group flex min-h-11 w-full items-center justify-between rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_35px_-18px_rgba(109,40,217,0.8)] transition hover:bg-violet-700"
      >
        Iniciar una nueva compra
        <ArrowRight aria-hidden="true" size={16} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </section>
  )
}
