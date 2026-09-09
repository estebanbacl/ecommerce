import { useEffect } from 'react'

import { sendTelemetryEvent } from '../../../services/telemetry/metricsService'
import { PartyPopper, Sparkles } from '../../../shared/ui/icons'

const LIMIT_MESSAGE = '¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido (35%)'

export function DiscountLimitAlert({ visible }: { visible: boolean }) {
  useEffect(() => {
    if (visible) {
      // Business-critical signal: how often customers actually hit the cap.
      sendTelemetryEvent('discount_limit_alert_shown')
    }
  }, [visible])

  if (!visible) {
    return null
  }

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-emerald-300/80 bg-emerald-50 px-4 py-4 text-emerald-950 shadow-[0_14px_35px_-24px_rgba(5,150,105,0.8)]"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
        <PartyPopper aria-hidden="true" size={20} strokeWidth={2} />
      </span>
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
          <Sparkles aria-hidden="true" size={13} />
          Ahorro máximo
        </div>
        <p className="text-sm font-semibold leading-5">{LIMIT_MESSAGE}</p>
      </div>
    </div>
  )
}
