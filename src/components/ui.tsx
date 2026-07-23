import type { ReactNode, SelectHTMLAttributes } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

/* Shared field styling so every input/select looks the same. */
const FIELD =
  'rounded-lg border border-border bg-surface text-sm text-ink transition-[border-color,box-shadow] placeholder:text-faint hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60'

export const inputClass = `w-full px-3 py-2.5 ${FIELD}`
export const selectClass = `w-full cursor-pointer appearance-none py-2.5 pl-3 pr-9 ${FIELD}`

/** Native <select> restyled with a custom chevron. Pass containerClassName to size it. */
export function Select({
  containerClassName,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { containerClassName?: string }) {
  return (
    <div className={cx('relative', containerClassName)}>
      <select className={cx(selectClass, className)} {...rest}>
        {children}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
      />
    </div>
  )
}

export function Badge({
  children,
  color = 'var(--muted)',
  bg = 'var(--surface-2)',
  className,
}: {
  children: ReactNode
  color?: string
  bg?: string
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        className,
      )}
      style={{ color, background: bg }}
    >
      {children}
    </span>
  )
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
        active
          ? 'border-transparent bg-primary text-primary-fg'
          : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

/** Circular progress ring used for match scores. */
export function ScoreRing({
  value,
  size = 52,
  stroke = 5,
}: {
  value: number
  size?: number
  stroke?: number
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  const color = value >= 75 ? 'var(--fit)' : value >= 50 ? 'var(--primary)' : 'var(--warn)'
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.7,.3,1)' }}
        />
      </svg>
      <span
        className="absolute font-display font-bold tnum"
        style={{ fontSize: size * 0.3, color }}
      >
        {value}
      </span>
    </div>
  )
}

export function FullscreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <Loader2 className="animate-spin text-primary" size={28} />
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: ReactNode
  title: string
  hint?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-muted">
        {icon}
      </div>
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>}
    </div>
  )
}
