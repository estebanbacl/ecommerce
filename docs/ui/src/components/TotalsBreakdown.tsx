import { ArrowDown, BadgePercent } from 'lucide-react'
import { formatUsd } from '../lib/money'
import type { DiscountBreakdown } from '../types'

export interface TotalsBreakdownProps {
  readonly breakdown: DiscountBreakdown
}

interface SummaryRowProps {
  readonly label: string
  readonly value: string
  readonly muted?: boolean
  readonly discount?: boolean
}

function SummaryRow({
  label,
  value,
  muted = false,
  discount = false,
}: SummaryRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 text-sm ${
        muted ? 'text-stone-500' : 'text-stone-700'
      }`}
    >
      <span>{label}</span>
      <span
        className={`font-semibold tabular-nums ${
          discount ? 'text-emerald-700' : 'text-stone-900'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export function TotalsBreakdown({ breakdown }: TotalsBreakdownProps) {
  return (
    <section aria-labelledby="totals-title" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Tu beneficio
          </p>
          <h3 id="totals-title" className="mt-1 text-base font-bold text-stone-950">
            Resumen de compra
          </h3>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <BadgePercent aria-hidden="true" size={18} />
        </span>
      </div>

      <div className="space-y-3 rounded-2xl bg-stone-50 p-4">
        <SummaryRow
          label="Subtotal original"
          value={formatUsd(breakdown.originalSubtotal)}
          muted
        />
        <div className="h-px bg-stone-200" />
        <SummaryRow
          label="Descuento de categoría"
          value={`− ${formatUsd(breakdown.categoryDiscount)}`}
          discount
        />
        <SummaryRow
          label="Descuento por volumen"
          value={`− ${formatUsd(breakdown.volumeDiscount)}`}
          discount
        />
        <SummaryRow
          label="Descuento por cupón"
          value={`− ${formatUsd(breakdown.couponDiscount)}`}
          discount
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3.5">
          <p className="text-xs font-medium text-violet-700">Descuento efectivo</p>
          <p className="mt-1 text-xl font-black tracking-tight text-violet-950">
            {breakdown.effectiveDiscountPercentage.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5">
          <p className="text-xs font-medium text-emerald-700">Ahorras hoy</p>
          <p className="mt-1 text-xl font-black tracking-tight text-emerald-950">
            {formatUsd(breakdown.totalSavings)}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-dashed border-stone-300 pt-4">
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold text-stone-500">
            <ArrowDown aria-hidden="true" size={13} />
            Total a pagar
          </p>
          <p className="mt-1 text-xs text-stone-400">Impuestos incluidos</p>
        </div>
        <p className="text-3xl font-black tracking-[-0.04em] text-stone-950 tabular-nums">
          {formatUsd(breakdown.finalTotal)}
        </p>
      </div>
    </section>
  )
}
