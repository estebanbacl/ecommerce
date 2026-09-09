const usdFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

/** Cents are never converted to float until the moment of formatting. */
export function formatCents(cents: number): string {
  if (!Number.isSafeInteger(cents)) {
    throw new Error('Invalid cents value')
  }
  return usdFormatter.format(cents / 100)
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(2)}%`
}
