import { useMemo, useState } from 'react'
import {
  LayoutGrid,
  List,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { OPPORTUNITIES } from '../lib/data'
import { applyFilters, countActive, EMPTY_FILTERS, type Filters } from '../lib/filters'
import { FilterSidebar } from '../components/FilterSidebar'
import { OpportunityCard, OpportunityRow } from '../components/OpportunityCard'
import { MapView } from '../components/MapView'
import { EmptyState, Select, cx } from '../components/ui'
import { useI18n } from '../lib/i18n'

type ViewMode = 'grid' | 'list' | 'map'

const SORTS: { value: Filters['sort']; key: string }[] = [
  { value: 'relevance', key: 'sort.relevance' },
  { value: 'deadline', key: 'sort.deadline' },
  { value: 'applicants-asc', key: 'sort.applicantsAsc' },
  { value: 'applicants-desc', key: 'sort.applicantsDesc' },
  { value: 'duration', key: 'sort.duration' },
]

const VIEW_KEY: Record<ViewMode, string> = { grid: 'view.grid', list: 'view.list', map: 'view.map' }

export function Opportunities() {
  const { t } = useI18n()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [view, setView] = useState<ViewMode>('grid')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const results = useMemo(() => applyFilters(OPPORTUNITIES, filters), [filters])
  const active = countActive(filters)

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow text-primary">{t('opps.eyebrow')}</span>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-[28px]">
              {t('opps.title')}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t('opps.countLine', { n: results.length, total: OPPORTUNITIES.length })}
            </p>
          </div>
        </div>
      </header>

      {/* Search + controls */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder={t('opps.searchPlaceholder')}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-9 text-sm text-ink transition-[border-color,box-shadow] placeholder:text-faint hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
          {filters.q && (
            <button
              onClick={() => setFilters({ ...filters, q: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
              aria-label={t('opps.clearSearch')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <Select
          containerClassName="w-full sm:w-52"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value as Filters['sort'] })}
          className="font-medium"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {t(s.key)}
            </option>
          ))}
        </Select>

        {/* view toggle */}
        <div className="flex items-center rounded-xl border border-border bg-surface p-1">
          {([
            ['grid', LayoutGrid],
            ['list', List],
            ['map', MapIcon],
          ] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={cx(
                'grid h-8 w-9 place-items-center rounded-lg transition-colors',
                view === mode ? 'bg-primary text-primary-fg' : 'text-muted hover:text-ink',
              )}
              aria-label={t(VIEW_KEY[mode])}
              title={t(VIEW_KEY[mode])}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* mobile filter trigger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-ink lg:hidden"
        >
          <SlidersHorizontal size={16} />
          {t('opps.filters')}
          {active > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-fg">
              {active}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl border border-border bg-surface px-4 py-2 shadow-card">
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Results */}
        <section className="min-w-0 flex-1">
          {results.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={22} />}
              title={t('opps.noMatchTitle')}
              hint={t('opps.noMatchHint')}
            />
          ) : view === 'map' ? (
            <MapView opps={results} />
          ) : view === 'list' ? (
            <div className="flex flex-col gap-2">
              {results.map((o) => (
                <OpportunityRow key={o.id} opp={o} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((o) => (
                <OpportunityCard key={o.id} opp={o} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-display font-bold text-ink">{t('opps.filters')}</span>
              <button onClick={() => setDrawerOpen(false)} aria-label={t('common.close')}>
                <X size={20} className="text-muted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>
            <div className="border-t border-border p-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-fg"
              >
                {t('opps.showResults', { n: results.length })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
