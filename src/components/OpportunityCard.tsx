import { Link } from 'react-router-dom'
import { Building2, CalendarClock, Clock, Crown, MapPin, Users, Wallet } from 'lucide-react'
import type { Opportunity } from '../types'
import { PROGRAMME_META, formatSalary } from '../lib/format'
import { useI18n } from '../lib/i18n'
import { SdgBadge } from './SdgBadge'
import { Flag } from './Flag'
import { Badge, ScoreRing } from './ui'

export function OpportunityCard({
  opp,
  score,
}: {
  opp: Opportunity
  score?: number
}) {
  const { t, locale } = useI18n()
  const pm = PROGRAMME_META[opp.programme]
  return (
    <Link
      to={`/opportunities/${opp.id}`}
      className="group relative flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop"
    >
      {/* programme accent rail */}
      <span
        className="absolute left-0 top-5 h-8 w-1 rounded-r-full"
        style={{ background: pm.color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge color={pm.color} bg={pm.soft}>
              {pm.label}
            </Badge>
            {opp.isPremium && (
              <Badge color="var(--coral)" bg="var(--coral-soft)">
                <Crown size={11} /> Premium
              </Badge>
            )}
          </div>
          <h3 className="font-display text-[17px] font-bold leading-snug text-ink text-balance group-hover:text-primary">
            {opp.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Building2 size={14} className="shrink-0" />
            <span className="truncate">{opp.organization}</span>
          </p>
        </div>
        {score !== undefined && <ScoreRing value={score} />}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-ink">
        <MapPin size={14} className="shrink-0 text-primary" />
        <Flag code={opp.location.countryCode} />
        <span className="truncate">{opp.location.city}, {opp.location.country}</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} /> {opp.duration}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wallet size={13} /> {formatSalary(opp.salary, t)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={13} /> {opp.applicants} {t('card.applied')}
        </span>
      </div>

      {opp.sdgs.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {opp.sdgs.map((s) => (
            <SdgBadge key={s.number} sdg={s} showLabel={false} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-faint">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock size={13} />{' '}
          {t('card.applyBy', {
            date: new Date(opp.applicationDeadline).toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
          })}
        </span>
        <span className="font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          {t('card.viewDetails')}
        </span>
      </div>
    </Link>
  )
}

/** Compact row for list view. */
export function OpportunityRow({ opp, score }: { opp: Opportunity; score?: number }) {
  const pm = PROGRAMME_META[opp.programme]
  return (
    <Link
      to={`/opportunities/${opp.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3 shadow-card transition-colors hover:border-primary/40"
    >
      <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: pm.color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display font-bold text-ink group-hover:text-primary">
            {opp.title}
          </h3>
          {opp.isPremium && <Crown size={13} className="shrink-0 text-coral" />}
        </div>
        <p className="truncate text-xs text-muted">
          {opp.organization} · <Flag code={opp.location.countryCode} className="mx-0.5" />{' '}
          {opp.location.city}, {opp.location.country}
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-4 text-xs text-muted sm:flex">
        <span className="inline-flex items-center gap-1"><Clock size={12} /> {opp.duration}</span>
        <span className="inline-flex items-center gap-1"><Users size={12} /> {opp.applicants}</span>
      </div>
      <Badge color={pm.color} bg={pm.soft} className="hidden shrink-0 md:inline-flex">
        {pm.short}
      </Badge>
      {score !== undefined && <ScoreRing value={score} size={40} stroke={4} />}
    </Link>
  )
}
