const LIMIT_MESSAGE = '¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido (35%)'

export function DiscountLimitAlert({ visible }: { visible: boolean }) {
  if (!visible) {
    return null
  }

  return <div role="status">{LIMIT_MESSAGE}</div>
}
