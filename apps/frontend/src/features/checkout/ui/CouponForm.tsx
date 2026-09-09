import type { FormEvent } from 'react'

import { Check, TicketPercent } from '../../../shared/ui/icons'

interface CouponFormProps {
  value: string
  onChange: (value: string) => void
  disabled: boolean
  loading: boolean
  applied?: boolean
  onApply: () => void
}

export function CouponForm({ value, onChange, disabled, loading, applied = false, onApply }: CouponFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply()
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Formulario de cupón" className="space-y-2">
      <label htmlFor="coupon-code" className="flex items-center gap-2 text-sm font-bold text-stone-800">
        <TicketPercent aria-hidden="true" size={16} className="text-violet-600" />
        Código de cupón
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            id="coupon-code"
            name="couponCode"
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder="WELCOME2026"
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 pr-9 text-sm font-semibold uppercase tracking-wide text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-stone-100"
          />
          {applied && (
            <Check
              aria-label="Cupón aplicado"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600"
              size={17}
            />
          )}
        </div>
        <button
          type="submit"
          disabled={disabled || loading}
          className="h-11 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400"
        >
          {loading ? 'Aplicando…' : 'Aplicar'}
        </button>
      </div>
    </form>
  )
}
