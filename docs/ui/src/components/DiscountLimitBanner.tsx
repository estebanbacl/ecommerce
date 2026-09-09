import { PartyPopper, Sparkles } from 'lucide-react'

export interface DiscountLimitBannerProps {
  readonly visible: boolean
}

export function DiscountLimitBanner({
  visible,
}: DiscountLimitBannerProps) {
  if (!visible) {
    return null
  }

  return (
    <aside
      className="relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-emerald-50 px-4 py-4 text-emerald-950 shadow-[0_14px_35px_-24px_rgba(5,150,105,0.8)]"
      role="status"
      aria-live="polite"
    >
      <div className="absolute -right-5 -top-6 size-20 rounded-full bg-emerald-200/60 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <PartyPopper aria-hidden="true" size={20} strokeWidth={2} />
        </span>
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            <Sparkles aria-hidden="true" size={13} />
            Ahorro máximo
          </div>
          <p className="text-sm font-semibold leading-5">
            ¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido
            (35%)
          </p>
        </div>
      </div>
    </aside>
  )
}
