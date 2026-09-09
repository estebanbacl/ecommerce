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
    <form onSubmit={handleSubmit} aria-label="Formulario de cupón">
      <label htmlFor="coupon-code">Código de cupón</label>
      <input
        id="coupon-code"
        name="couponCode"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || loading}>
        {loading ? 'Aplicando…' : 'Aplicar'}
      </button>
    </form>
  )
}
