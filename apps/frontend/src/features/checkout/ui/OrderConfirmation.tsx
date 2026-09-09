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
    <section aria-label="Confirmación de la orden">
      <h2 ref={headingRef} tabIndex={-1}>
        ¡Compra confirmada!
      </h2>
      <p>Orden: {order.orderId}</p>
      <p>Estado: {order.status}</p>
      <p>Total pagado: {formatCents(order.breakdown.finalTotal)}</p>
      <DiscountLimitAlert visible={order.breakdown.limitApplied} />
      <button type="button" onClick={onStartNewPurchase}>
        Iniciar una nueva compra
      </button>
    </section>
  )
}
