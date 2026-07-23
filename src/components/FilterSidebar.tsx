import { useState, type ReactNode } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import type { Programme } from '../types'
import { FACETS } from '../lib/data'
import { PROGRAMME_META } from '../lib/format'
import { countActive, EMPTY_FILTERS, type Filters } from '../lib/filters'
import { useI18n } from '../lib/i18n'
import { cx } from './ui'

const PROGRAMMES: Programme[] = ['global-volunteer', 'global-talent', 'global-teacher']
const DURATIONS = [
  { key: 'duration.6', weeks: 6 },
  { key: 'duration.12', weeks: 12 },
  { key: 'duration.24', weeks: 24 },
  { key: 'duration.any', weeks: 0 },
]

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border py-3.5 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="eyebrow text-faint">{title}</span>
        <ChevronDown
          size={15}
          className={cx('text-faint transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && <div className="mt-3 flex flex-col gap-2">{children}</div>}
    </div>
  )
}

function Check({
  checked,
  onChange,
  label,
  dot,
}: {
  checked: boolean
  onChange: () => void
  label: string
  dot?: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={cx(
          'grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors',
          checked ? 'border-primary bg-primary text-primary-fg' : 'border-border bg-surface',
        )}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.5l2.2 2.2L9.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      <span className="text-muted peer-checked:text-ink">{label}</span>
    </label>
  )
}

export function FilterSidebar({
  filters,
  onChange,
}: {
  filters: Filters
  onChange: (f: Filters) => void
}) {
  const { t } = useI18n()
  const active = countActive(filters)

  function toggle<K extends keyof Filters>(key: K, value: string) {
    const arr = filters[key] as unknown as string[]
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    onChange({ ...filters, [key]: next } as Filters)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-display text-sm font-bold text-ink">
          {t('filters.title')} {active > 0 && <span className="text-primary">· {active}</span>}
        </h2>
        {active > 0 && (
          <button
            onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary"
          >
            <RotateCcw size={12} /> {t('filters.reset')}
          </button>
        )}
      </div>

      <Section title={t('filters.programme')}>
        {PROGRAMMES.map((p) => (
          <Check
            key={p}
            checked={filters.programmes.includes(p)}
            onChange={() => toggle('programmes', p)}
            label={PROGRAMME_META[p].label}
            dot={PROGRAMME_META[p].color}
          />
        ))}
      </Section>

      <Section title={t('filters.duration')}>
        {DURATIONS.map((d) => (
          <label key={d.key} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="radio"
              name="duration"
              checked={(filters.maxDurationWeeks ?? 0) === d.weeks}
              onChange={() => onChange({ ...filters, maxDurationWeeks: d.weeks || null })}
              className="peer sr-only"
            />
            <span
              className={cx(
                'grid h-[18px] w-[18px] place-items-center rounded-full border transition-colors',
                (filters.maxDurationWeeks ?? 0) === d.weeks
                  ? 'border-primary'
                  : 'border-border',
              )}
            >
              {(filters.maxDurationWeeks ?? 0) === d.weeks && (
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </span>
            <span className="text-muted peer-checked:text-ink">{t(d.key)}</span>
          </label>
        ))}
      </Section>

      <Section title={t('filters.region')}>
        {FACETS.regions.map((r) => (
          <Check key={r} checked={filters.regions.includes(r)} onChange={() => toggle('regions', r)} label={t('region.' + r)} />
        ))}
      </Section>

      <Section title={t('filters.benefits')} defaultOpen={false}>
        <Check checked={filters.paidOnly} onChange={() => onChange({ ...filters, paidOnly: !filters.paidOnly })} label={t('benefit.paidStipend')} />
        <Check checked={filters.accommodationOnly} onChange={() => onChange({ ...filters, accommodationOnly: !filters.accommodationOnly })} label={t('benefit.accommodationIncluded')} />
        <Check checked={filters.premiumOnly} onChange={() => onChange({ ...filters, premiumOnly: !filters.premiumOnly })} label={t('benefit.premiumOnly')} />
      </Section>

      <Section title={t('filters.fieldOfStudy')} defaultOpen={false}>
        <div className="max-h-52 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            {FACETS.fields.map((x) => (
              <Check key={x} checked={filters.fields.includes(x)} onChange={() => toggle('fields', x)} label={x} />
            ))}
          </div>
        </div>
      </Section>

      <Section title={t('filters.languageRequired')} defaultOpen={false}>
        <div className="flex flex-col gap-2">
          {FACETS.languages.map((l) => (
            <Check key={l} checked={filters.languages.includes(l)} onChange={() => toggle('languages', l)} label={l} />
          ))}
        </div>
      </Section>

      <Section title={t('filters.focusSdg')} defaultOpen={false}>
        <div className="max-h-52 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            {FACETS.sdgs.map((s) => (
              <Check key={s} checked={filters.sdgs.includes(s)} onChange={() => toggle('sdgs', s)} label={s} />
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
