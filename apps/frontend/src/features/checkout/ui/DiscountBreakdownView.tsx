import type { CouponResult, DiscountBreakdown } from '../../../types'
import { formatCents, formatPercentage } from '../../../shared/lib/formatMoney'

const couponMessage: Record<CouponResult['status'], string> = {
  APPLIED: 'Cupón aplicado correctamente.',
  NOT_FOUND: 'El cupón ingresado no existe.',
  EXPIRED: 'El cupón ingresado expiró.',
  OMITTED: 'No se aplicó ningún cupón.',
}

export function DiscountBreakdownView({
  breakdown,
  coupon,
}: {
  breakdown: DiscountBreakdown
  coupon: CouponResult
}) {
  return (
    <section aria-label="Desglose de descuentos">
      <h2>Desglose</h2>
      <p>{couponMessage[coupon.status]}</p>
      <dl>
        <dt>Subtotal original</dt>
        <dd>{formatCents(breakdown.originalSubtotal)}</dd>

        <dt>Descuento de categoría</dt>
        <dd>{formatCents(breakdown.categoryDiscount)}</dd>

        <dt>Descuento por volumen</dt>
        <dd>{formatCents(breakdown.volumeDiscount)}</dd>

        <dt>Descuento por cupón</dt>
        <dd>{formatCents(breakdown.couponDiscount)}</dd>

        <dt>Ahorro total</dt>
        <dd>{formatCents(breakdown.finalSavings)}</dd>

        <dt>Porcentaje efectivo</dt>
        <dd>{formatPercentage(breakdown.effectiveDiscountPercentage)}</dd>

        <dt>Total final</dt>
        <dd>
          <strong>{formatCents(breakdown.finalTotal)}</strong>
        </dd>
      </dl>
    </section>
  )
}
