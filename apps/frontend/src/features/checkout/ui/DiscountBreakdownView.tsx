import type { CouponResult, DiscountBreakdown } from '../../../types'
import { formatCents, formatPercentage } from '../../../shared/lib/formatMoney'

const couponMessage: Record<CouponResult['status'], string> = {
  APPLIED: 'Cupón aplicado correctamente.',
  NOT_FOUND: 'El cupón ingresado no existe.',
  EXPIRED: 'El cupón ingresado expiró.',
  OMITTED: 'No se aplicó ningún cupón.',
}

const couponTone: Record<CouponResult['status'], string> = {
  APPLIED: 'text-emerald-700 bg-emerald-50',
  NOT_FOUND: 'text-neutral-600 bg-neutral-100',
  EXPIRED: 'text-neutral-600 bg-neutral-100',
  OMITTED: 'text-neutral-500 bg-neutral-100',
}

export function DiscountBreakdownView({
  breakdown,
  coupon,
}: {
  breakdown: DiscountBreakdown
  coupon: CouponResult
}) {
  return (
    <section aria-label="Desglose de descuentos" className="space-y-3 rounded-lg border border-neutral-200 p-3">
      <p className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${couponTone[coupon.status]}`}>
        {couponMessage[coupon.status]}
      </p>
      <dl className="space-y-1.5 text-sm">
        <Row label="Subtotal original" value={formatCents(breakdown.originalSubtotal)} />
        <Row label="Descuento de categoría" value={`− ${formatCents(breakdown.categoryDiscount)}`} />
        <Row label="Descuento por volumen" value={`− ${formatCents(breakdown.volumeDiscount)}`} />
        <Row label="Descuento por cupón" value={`− ${formatCents(breakdown.couponDiscount)}`} />
        <Row label="Ahorro total" value={formatCents(breakdown.finalSavings)} />
        <Row label="Porcentaje efectivo" value={formatPercentage(breakdown.effectiveDiscountPercentage)} />
        <div className="flex items-baseline justify-between border-t border-neutral-200 pt-2">
          <dt className="font-medium text-neutral-900">Total final</dt>
          <dd>
            <strong className="text-base font-semibold text-neutral-900">
              {formatCents(breakdown.finalTotal)}
            </strong>
          </dd>
        </div>
      </dl>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  )
}
