import type { FormEvent } from 'react'

interface CouponFormProps {
  value: string
  onChange: (value: string) => void
  disabled: boolean
  loading: boolean
  onApply: () => void
}

export function CouponForm({ value, onChange, disabled, loading, onApply }: CouponFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply()
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Formulario de cupón" className="flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor="coupon-code" className="mb-1 block text-sm font-medium text-neutral-700">
          Código de cupón
        </label>
        <input
          id="coupon-code"
          name="couponCode"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder="WELCOME2026"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none disabled:bg-neutral-100"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || loading}
        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400"
      >
        {loading ? 'Aplicando…' : 'Aplicar'}
      </button>
    </form>
  )
}
