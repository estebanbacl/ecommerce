const LIMIT_MESSAGE = '¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido (35%)'

export function DiscountLimitAlert({ visible }: { visible: boolean }) {
  if (!visible) {
    return null
  }

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800"
    >
      <span aria-hidden="true">🎉</span>
      <span>{LIMIT_MESSAGE}</span>
    </div>
  )
}
