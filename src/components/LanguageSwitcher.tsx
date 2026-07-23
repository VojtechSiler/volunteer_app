import { LANGUAGES, useI18n } from '../lib/i18n'
import { cx } from './ui'

/** Compact segmented EN / CS / SK control. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n()
  return (
    <div
      className={cx('flex items-center rounded-lg border border-border bg-surface p-0.5', className)}
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={cx(
            'rounded-md px-2 py-1 text-xs font-bold transition-colors',
            lang === l.code ? 'bg-primary text-primary-fg' : 'text-muted hover:text-ink',
          )}
          title={l.label}
          aria-pressed={lang === l.code}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}
