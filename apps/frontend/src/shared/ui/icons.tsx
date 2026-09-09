import type { ReactNode, SVGProps } from 'react'

/**
 * Small, dependency-free icon set (hand-rolled SVGs, same technique used by
 * the docs/ui design reference). Purely decorative: every usage carries
 * aria-hidden, so these never affect an element's accessible name.
 */
interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number
  strokeWidth?: number
}

interface BaseIconProps extends IconProps {
  children: ReactNode
}

function BaseIcon({ size = 20, strokeWidth = 2, children, ...props }: BaseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export function ShoppingBag(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </BaseIcon>
  )
}

export function Plus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14M5 12h14" />
    </BaseIcon>
  )
}

export function Minus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
    </BaseIcon>
  )
}

export function TicketPercent(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="m9 9 6 6M9.5 9h.01M14.5 15h.01" />
    </BaseIcon>
  )
}

export function Check(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </BaseIcon>
  )
}

export function CheckCircle2(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21.8 10A10 10 0 1 1 17 3.3" />
      <path d="m9 11 3 3L22 4" />
    </BaseIcon>
  )
}

export function LockKeyhole(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="16" r="1" />
      <rect x="3" y="10" width="18" height="12" rx="2" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </BaseIcon>
  )
}

export function ArrowRight(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </BaseIcon>
  )
}

export function ArrowDown(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </BaseIcon>
  )
}

export function BadgePercent(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 2 9.5 4.5 6 4l-.5 3.5L2 9l2.5 2.5L4 15l3.5.5L9 19l3-2 3 2 1.5-3.5L20 15l-.5-3.5L22 9l-3.5-1.5L18 4l-3.5.5Z" />
      <path d="m9.5 14.5 5-5M9.5 9.5h.01M14.5 14.5h.01" />
    </BaseIcon>
  )
}

export function PartyPopper(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5.8 11.3 2 22l10.7-3.8" />
      <path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2 12 12" />
      <path d="M17.6 3.5a3 3 0 0 1 3 5.2M12.6 6.5a3 3 0 0 1 3 5.2" />
    </BaseIcon>
  )
}

export function Sparkles(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </BaseIcon>
  )
}

export function Package(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </BaseIcon>
  )
}

export function Cpu(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </BaseIcon>
  )
}

export function BookOpen(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 7c-2.5-2-6-2-9-1v13c3-1 6.5-1 9 1 2.5-2 6.5-2 9-1V6c-3-1-6.5-1-9 1Z" />
      <path d="M12 7v13" />
    </BaseIcon>
  )
}
