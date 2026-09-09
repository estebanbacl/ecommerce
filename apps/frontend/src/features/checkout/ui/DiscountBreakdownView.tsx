import type { CouponResult, DiscountBreakdown } from '../../../types'
import { formatCents, formatPercentage } from '../../../shared/lib/formatMoney'
import { ArrowDown, BadgePercent } from '../../../shared/ui/icons'

const couponMessage: Record<CouponResult['status'], string> = {
  APPLIED: 'Cupón aplicado correctamente.',
  NOT_FOUND: 'El cupón ingresado no existe.',
  EXPIRED: 'El cupón ingresado expiró.',
  OMITTED: 'No se aplicó ningún cupón.',
}

const couponTone: Record<CouponResult['status'], string> = {
  APPLIED: 'text-emerald-700 bg-emerald-50',
  NOT_FOUND: 'text-stone-600 bg-stone-100',
  EXPIRED: 'text-stone-600 bg-stone-100',
  OMITTED: 'text-stone-500 bg-stone-100',
}

export function DiscountBreakdownView({
  breakdown,
  coupon,
}: {
  breakdown: DiscountBreakdown
  coupon: CouponResult
}) {
  return (
    <section aria-label="Desglose de descuentos" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Tu beneficio</p>
          <h3 className="mt-1 text-base font-black tracking-tight text-stone-950">Desglose</h3>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <BadgePercent aria-hidden="true" size={18} />
        </span>
      </div>

      <p className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${couponTone[coupon.status]}`}>
        {couponMessage[coupon.status]}
      </p>

      <dl className="space-y-2.5 rounded-2xl bg-stone-50 p-4 text-sm">
        <Row label="Subtotal original" value={formatCents(breakdown.originalSubtotal)} muted />
        <div className="h-px bg-stone-200" />
        <Row label="Descuento de categoría" value={`− ${formatCents(breakdown.categoryDiscount)}`} discount />
        <Row label="Descuento por volumen" value={`− ${formatCents(breakdown.volumeDiscount)}`} discount />
        <Row label="Descuento por cupón" value={`− ${formatCents(breakdown.couponDiscount)}`} discount />
      </dl>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3.5">
          <p className="text-xs font-medium text-violet-700">Descuento efectivo</p>
          <p className="mt-1 text-xl font-black tracking-tight text-violet-950">
            {formatPercentage(breakdown.effectiveDiscountPercentage)}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5">
          <p className="text-xs font-medium text-emerald-700">Ahorro total</p>
          <p className="mt-1 text-xl font-black tracking-tight text-emerald-950">
            {formatCents(breakdown.finalSavings)}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-dashed border-stone-300 pt-4">
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold text-stone-500">
            <ArrowDown aria-hidden="true" size={13} />
            Total final
          </p>
        </div>
        <strong className="text-2xl font-black tracking-tight text-stone-950 tabular-nums">
          {formatCents(breakdown.finalTotal)}
        </strong>
      </div>
    </section>
  )
}

function Row({ label, value, muted, discount }: { label: string; value: string; muted?: boolean; discount?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${muted ? 'text-stone-500' : 'text-stone-700'}`}>
      <span>{label}</span>
      <span className={`font-semibold tabular-nums ${discount ? 'text-emerald-700' : 'text-stone-900'}`}>{value}</span>
    </div>
  )
}
