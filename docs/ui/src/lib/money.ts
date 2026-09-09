const usdFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export function formatUsd(cents: number): string {
  if (!Number.isSafeInteger(cents)) {
    throw new Error('El importe debe expresarse en centavos enteros')
  }

  return usdFormatter.format(cents / 100)
}
