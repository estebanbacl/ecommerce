import { config } from '../../app/config'

/**
 * Event names must match the backend's allowlist exactly
 * (apps/backend/internal/adapters/handlers/telemetry_handler.go). Any
 * other value is rejected with 400 to keep Prometheus label cardinality
 * bounded.
 */
export type TelemetryEvent = 'coupon_apply_clicked' | 'discount_limit_alert_shown'

/**
 * Fire-and-forget telemetry beacon. It must never throw and never block
 * or fail the checkout flow: a lost metric is acceptable, a broken
 * purchase is not.
 */
export function sendTelemetryEvent(event: TelemetryEvent): void {
  fetch(`${config.apiBaseUrl}/api/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => {
    // Telemetry is best-effort; a network failure here must not surface to the user.
  })
}
