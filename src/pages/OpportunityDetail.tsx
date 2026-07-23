import { Link, useParams } from 'react-router-dom'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ArrowLeft,
  BedDouble,
  Bus,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  Clock,
  Crown,
  ExternalLink,
  GraduationCap,
  Languages,
  MapPin,
  Plane,
  Sparkles,
  Users,
  Utensils,
  Wallet,
  Stamp,
} from 'lucide-react'
import { getOpportunity } from '../lib/data'
import { PROGRAMME_META, formatDate, formatSalary, daysUntil } from '../lib/format'
import { useI18n } from '../lib/i18n'
import { SdgBadge } from '../components/SdgBadge'
import { Flag } from '../components/Flag'
import { Badge, EmptyState, cx } from '../components/ui'
import type { ReactNode } from 'react'

export function OpportunityDetail() {
  const { id } = useParams()
  const { t, locale } = useI18n()
  const opp = getOpportunity(Number(id))

  if (!opp) {
    return (
      <div className="mx-auto max-w-lg py-10">
        <EmptyState icon={<Sparkles size={22} />} title={t('detail.notFound')} hint={t('detail.notFoundHint')} />
        <div className="mt-4 text-center">
          <Link to="/opportunities" className="text-sm font-semibold text-primary hover:underline">
            {t('detail.backLink')}
          </Link>
        </div>
      </div>
    )
  }

  const pm = PROGRAMME_META[opp.programme]
  const deadlineDays = daysUntil(opp.applicationDeadline)
  const benefitList = [
    { on: opp.benefits.accommodation, icon: BedDouble, labelKey: 'benefit.accommodation' },
    { on: opp.benefits.food, icon: Utensils, labelKey: 'benefit.meals' },
    { on: opp.benefits.transport, icon: Bus, labelKey: 'benefit.transport' },
    { on: opp.benefits.visaSupport, icon: Stamp, labelKey: 'benefit.visa' },
    { on: opp.logistics.airportPickup, icon: Plane, labelKey: 'benefit.pickup' },
  ]

  return (
    <div className="animate-fade-up">
      <Link
        to="/opportunities"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary"
      >
        <ArrowLeft size={16} /> {t('detail.back')}
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: pm.color }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={pm.color} bg={pm.soft}>{pm.label}</Badge>
          <Badge>{opp.category}</Badge>
          {opp.isGlobalProject && <Badge color="var(--fit)" bg="var(--fit-soft)">{t('detail.globalProject')}</Badge>}
          {opp.isPremium && (
            <Badge color="var(--coral)" bg="var(--coral-soft)"><Crown size={11} /> {t('detail.premium')}</Badge>
          )}
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight text-ink text-balance sm:text-[32px]">
          {opp.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
            {opp.organization}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={15} className="text-primary" />
            <Flag code={opp.location.countryCode} />
            {opp.location.city}, {opp.location.country}
          </span>
          <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {opp.duration}</span>
          <span className="inline-flex items-center gap-1.5"><Users size={15} /> {opp.applicants} {t('detail.applicants')} · {opp.openings} {t('detail.openings')}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="flex flex-col gap-6">
          <Card title={t('detail.about')}>
            <p className="leading-relaxed text-muted">{opp.description}</p>
          </Card>

          <Card title={t('detail.whatYoullDo')} icon={<CheckCircle2 size={18} />}>
            <ul className="flex flex-col gap-2.5">
              {opp.responsibilities.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-fit" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card title={t('detail.languages')} icon={<Languages size={18} />}>
              <div className="flex flex-col gap-2">
                {opp.requiredLanguages.map((l) => (
                  <div key={l.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{l.name}</span>
                    <Badge>{t('level.' + l.level)}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card title={t('detail.preferredBackground')} icon={<GraduationCap size={18} />}>
              <div className="flex flex-wrap gap-1.5">
                {opp.fieldsOfStudy.map((f) => (
                  <span key={f} className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
                    {f}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-faint">
                {t('detail.ages', { min: opp.minAge, max: opp.maxAge })}
                {opp.backgroundRequired ? t('detail.bgRequired') : t('detail.bgWelcome')}
              </p>
            </Card>
          </div>

          <Card title={t('detail.whatsIncluded')} icon={<Sparkles size={18} />}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {benefitList.map((b) => (
                <div
                  key={b.labelKey}
                  className={cx(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm',
                    b.on
                      ? 'border-fit/30 bg-fit-soft text-ink'
                      : 'border-border bg-surface-2/40 text-faint line-through',
                  )}
                >
                  <b.icon size={17} className={b.on ? 'text-fit' : 'text-faint'} />
                  {t(b.labelKey)}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <Row label={t('detail.compensation')} value={formatSalary(opp.salary, t)} icon={<Wallet size={15} />} />
              <Row label={t('detail.workSchedule')} value={opp.workSchedule} icon={<Clock size={15} />} />
              <Row label={t('detail.weeklyHours')} value={t('detail.weeklyHoursValue', { h: opp.logistics.weeklyHours })} icon={<CalendarRange size={15} />} />
            </div>
          </Card>

          {opp.programBenefits.length > 0 && (
            <Card title={t('detail.whatYoullGain')} icon={<Sparkles size={18} />}>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {opp.programBenefits.map((b, i) => (
                  <div key={i} className="flex gap-2.5 rounded-xl bg-surface-2/50 px-3 py-2.5 text-sm text-ink">
                    <Sparkles size={16} className="mt-0.5 shrink-0 text-primary" />
                    {b}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Location map */}
          <Card title={t('detail.location')} icon={<MapPin size={18} />}>
            <div className="h-56 overflow-hidden rounded-xl border border-border">
              <MapContainer
                center={[opp.location.lat, opp.location.lng]}
                zoom={9}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap, &copy; CARTO"
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker
                  position={[opp.location.lat, opp.location.lng]}
                  icon={L.divIcon({
                    className: '',
                    html: `<div class="pin" style="background:${pm.color}"></div>`,
                    iconSize: [26, 26],
                    iconAnchor: [13, 26],
                  })}
                />
              </MapContainer>
            </div>
            <p className="mt-2.5 inline-flex items-center gap-1.5 text-sm text-muted">
              <Flag code={opp.location.countryCode} />
              {opp.location.city}, {opp.location.country} · {t('region.' + opp.location.region)}
            </p>
          </Card>
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div>
              <div className="text-xs font-semibold text-faint">{t('detail.compensation')}</div>
              <div className="font-display text-xl font-bold text-ink">{formatSalary(opp.salary, t)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStat label={t('detail.duration')} value={opp.duration} />
              <MiniStat label={t('detail.openings')} value={String(opp.openings)} />
              <MiniStat label={t('detail.applicants')} value={String(opp.applicants)} />
              <MiniStat label={t('detail.weekly')} value={`${opp.logistics.weeklyHours}h`} />
            </div>

            <div
              className={cx(
                'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold',
                deadlineDays <= 14 ? 'bg-coral-soft text-coral' : 'bg-surface-2 text-muted',
              )}
            >
              <CalendarClock size={16} />
              {deadlineDays > 0 ? t('detail.closeIn', { n: deadlineDays }) : t('detail.closed')}
            </div>
            <div className="text-xs text-faint">
              {t('detail.deadlineStarts', {
                d: formatDate(opp.applicationDeadline, locale),
                s: formatDate(opp.applicationOpenFrom, locale),
              })}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {opp.sdgs.map((s) => (
                <SdgBadge key={s.number} sdg={s} />
              ))}
            </div>

            <a
              href={opp.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-fg shadow-sm transition-transform hover:brightness-105 active:scale-[.99]"
            >
              {t('detail.applyOn')} <ExternalLink size={15} />
            </a>
            <Link
              to={`/match`}
              className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold text-ink hover:border-primary/40"
            >
              {t('detail.matchCandidate')}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Row({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-muted">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2/60 px-3 py-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-0.5 font-display text-sm font-bold text-ink">{value}</div>
    </div>
  )
}
