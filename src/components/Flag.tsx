import { cx } from './ui'

/**
 * Real SVG country flag (via flag-icons). Emoji flags don't render on Windows,
 * so we use SVG sprites instead. `code` is an ISO 3166-1 alpha-2 code.
 */
export function Flag({ code, className }: { code: string; className?: string }) {
  const c = code?.toLowerCase()
  if (!c || c.length !== 2) {
    return <span className={cx('inline-block', className)}>🌍</span>
  }
  return (
    <span
      className={cx(
        'fi inline-block shrink-0 rounded-[2px] align-[-0.12em] shadow-[0_0_0_1px_rgba(12,27,42,0.08)]',
        `fi-${c}`,
        className,
      )}
      role="img"
      aria-label={code.toUpperCase()}
    />
  )
}
