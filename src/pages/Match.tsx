import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  FileText,
  Globe2,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserSearch,
  Wand2,
  X,
} from 'lucide-react'
import type { CandidateProfile, LanguageReq, Programme } from '../types'
import { ALL_LANGUAGES, FACETS, OPPORTUNITIES } from '../lib/data'
import {
  rankOpportunities,
  MATCH_WEIGHTS,
  DEFAULT_WEIGHTS,
  type MatchResult,
  type Weights,
  type ReasonKey,
} from '../lib/matching'
import { PROGRAMME_META } from '../lib/format'
import { useI18n } from '../lib/i18n'
import { Flag } from '../components/Flag'
import { useCandidates } from '../lib/candidates'
import { extractProfile, aiExtractionEnabled } from '../lib/extractProfile'
import { SdgBadge } from '../components/SdgBadge'
import { Badge, ScoreRing, Select, cx, inputClass } from '../components/ui'

const DEGREES = ['High school', "Bachelor's", "Master's", 'PhD', 'Other']
const LEVELS: LanguageReq['level'][] = ['Basic', 'Intermediate', 'Fluent', 'Native']
const PROGRAMMES: (Programme | 'any')[] = ['any', 'global-volunteer', 'global-talent', 'global-teacher']

const SAMPLE: CandidateProfile = {
  fullName: 'María González',
  nationality: 'Spain',
  age: 22,
  languages: [
    { name: 'Spanish', level: 'Native' },
    { name: 'English', level: 'Fluent' },
  ],
  fieldOfStudy: 'Marketing',
  degreeLevel: "Bachelor's",
  availableFrom: '2026-09-01',
  durationPreferenceWeeks: 24,
  programmePreference: 'any',
  preferredRegions: ['Europe', 'Asia'],
  interests: ['Quality Education', 'Decent Work and Economic Growth'],
  wantsStipend: true,
}

const EMPTY: CandidateProfile = {
  fullName: '',
  nationality: '',
  age: '',
  languages: [{ name: 'English', level: 'Fluent' }],
  fieldOfStudy: '',
  degreeLevel: "Bachelor's",
  availableFrom: '',
  durationPreferenceWeeks: '',
  programmePreference: 'any',
  preferredRegions: [],
  interests: [],
  wantsStipend: false,
}

const inputCls = inputClass
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-faint'

export function Match() {
  const { t } = useI18n()
  const { candidates, save, remove } = useCandidates()
  const [profile, setProfile] = useState<CandidateProfile>(EMPTY)
  const [submitted, setSubmitted] = useState<CandidateProfile | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS)
  const [showWeights, setShowWeights] = useState(false)
  const [cvOpen, setCvOpen] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  const results = useMemo<MatchResult[]>(
    () => (submitted ? rankOpportunities(submitted, OPPORTUNITIES, weights) : []),
    [submitted, weights],
  )
  const viable = results.filter((r) => !r.dealbreaker)
  const top = viable.slice(0, 12)

  function set<K extends keyof CandidateProfile>(key: K, value: CandidateProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }) as CandidateProfile)
  }

  function loadCandidate(id: string) {
    const c = candidates.find((x) => x.id === id)
    if (!c) return
    setProfile(c.profile)
    setEditingId(c.id)
    setSubmitted(c.profile)
  }

  async function saveCandidate() {
    try {
      const id = await save(profile, editingId ?? undefined)
      setEditingId(id)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1800)
    } catch (err) {
      console.error('Could not save candidate:', err)
    }
  }

  function resetCandidate() {
    setProfile(EMPTY)
    setEditingId(null)
    setSubmitted(null)
  }

  function applyExtract(extracted: Partial<CandidateProfile>) {
    setProfile((p) => ({ ...p, ...extracted }) as CandidateProfile)
  }

  function toggleArr(key: 'preferredRegions' | 'interests', value: string) {
    setProfile((p) => {
      const arr = p[key]
      return {
        ...p,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      } as CandidateProfile
    })
  }

  function addLanguage() {
    const used = new Set(profile.languages.map((l) => l.name))
    const next = ALL_LANGUAGES.find((l) => !used.has(l)) ?? 'English'
    set('languages', [...profile.languages, { name: next, level: 'Intermediate' }])
  }

  return (
    <div>
      <header className="mb-6">
        <span className="eyebrow text-fit">{t('match.eyebrow')}</span>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-[28px]">{t('match.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {t('match.subtitlePre')}
          <span className="font-semibold text-ink">{t('match.subtitleWhy')}</span>
          {t('match.subtitlePost')}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Profile form */}
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted({ ...profile })
            }}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-fit-soft text-fit">
                  <UserSearch size={18} />
                </div>
                <span className="font-display font-bold text-ink">{t('match.candidateProfile')}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfile(SAMPLE)
                  setEditingId(null)
                  setSubmitted(SAMPLE)
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-muted hover:text-primary"
                title={t('match.sampleTitle')}
              >
                <Wand2 size={12} /> {t('match.sample')}
              </button>
            </div>

            {/* Saved candidates + save controls */}
            <div className="flex flex-wrap items-center gap-2">
              {candidates.length > 0 && (
                <Select
                  containerClassName="min-w-0 flex-1"
                  value={editingId ?? ''}
                  onChange={(e) => (e.target.value ? loadCandidate(e.target.value) : resetCandidate())}
                >
                  <option value="">{t('match.loadSaved')}</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
              <button
                type="button"
                onClick={saveCandidate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-2 text-xs font-bold text-primary transition-colors hover:brightness-95"
              >
                {savedFlash ? <Check size={14} /> : <Save size={14} />}
                {savedFlash ? t('match.savedToast') : editingId ? t('match.update') : t('match.save')}
              </button>
              {editingId && (
                <>
                  <button
                    type="button"
                    onClick={resetCandidate}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-2 text-xs font-semibold text-muted hover:text-ink"
                  >
                    <Plus size={13} /> {t('match.newCandidate')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      remove(editingId)
                      resetCandidate()
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted hover:text-bad"
                    title={t('match.deleteCandidate')}
                    aria-label={t('match.deleteCandidate')}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>

            {/* CV paste */}
            <button
              type="button"
              onClick={() => setCvOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-soft/40 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
            >
              <FileText size={16} /> {t('cv.button')}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>{t('form.fullName')}</label>
                <input className={inputCls} value={profile.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Alex Morgan" />
              </div>
              <div>
                <label className={labelCls}>{t('form.nationality')}</label>
                <input className={inputCls} value={profile.nationality} onChange={(e) => set('nationality', e.target.value)} placeholder="Spain" />
              </div>
              <div>
                <label className={labelCls}>{t('form.age')}</label>
                <input
                  className={inputCls}
                  type="number"
                  min={16}
                  max={40}
                  value={profile.age}
                  onChange={(e) => set('age', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="22"
                />
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className={labelCls + ' mb-0'}>{t('form.languages')}</label>
                <button type="button" onClick={addLanguage} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <Plus size={12} /> {t('form.add')}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {profile.languages.map((lang, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Select
                      containerClassName="min-w-0 flex-1"
                      value={lang.name}
                      onChange={(e) => {
                        const langs = [...profile.languages]
                        langs[i] = { ...langs[i], name: e.target.value }
                        set('languages', langs)
                      }}
                    >
                      {ALL_LANGUAGES.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </Select>
                    <Select
                      containerClassName="w-28 shrink-0 sm:w-32"
                      value={lang.level}
                      onChange={(e) => {
                        const langs = [...profile.languages]
                        langs[i] = { ...langs[i], level: e.target.value as LanguageReq['level'] }
                        set('languages', langs)
                      }}
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {t('level.' + l)}
                        </option>
                      ))}
                    </Select>
                    {profile.languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => set('languages', profile.languages.filter((_, j) => j !== i))}
                        className="text-faint hover:text-bad"
                        aria-label={t('form.removeLanguage')}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t('form.fieldOfStudy')}</label>
                <input
                  className={inputCls}
                  list="fields-list"
                  value={profile.fieldOfStudy}
                  onChange={(e) => set('fieldOfStudy', e.target.value)}
                  placeholder="Marketing"
                />
                <datalist id="fields-list">
                  {FACETS.fields.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={labelCls}>{t('form.degreeLevel')}</label>
                <Select value={profile.degreeLevel} onChange={(e) => set('degreeLevel', e.target.value)}>
                  {DEGREES.map((d) => (
                    <option key={d} value={d}>
                      {t('degree.' + d)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className={labelCls}>{t('form.availableFrom')}</label>
                <input className={inputCls} type="date" value={profile.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>{t('form.preferredLength')}</label>
                <Select
                  value={profile.durationPreferenceWeeks}
                  onChange={(e) => set('durationPreferenceWeeks', e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">{t('form.any')}</option>
                  <option value={6}>{t('length.6')}</option>
                  <option value={12}>{t('length.12')}</option>
                  <option value={24}>{t('length.24')}</option>
                  <option value={48}>{t('length.48')}</option>
                </Select>
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('form.programmePreference')}</label>
              <div className="flex flex-wrap gap-1.5">
                {PROGRAMMES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('programmePreference', p)}
                    className={cx(
                      'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors',
                      profile.programmePreference === p
                        ? 'border-transparent bg-primary text-primary-fg'
                        : 'border-border text-muted hover:text-ink',
                    )}
                  >
                    {p === 'any' ? t('form.any') : PROGRAMME_META[p].short}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('form.preferredRegions')}</label>
              <div className="flex flex-wrap gap-1.5">
                {FACETS.regions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleArr('preferredRegions', r)}
                    className={cx(
                      'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors',
                      profile.preferredRegions.includes(r)
                        ? 'border-transparent bg-primary text-primary-fg'
                        : 'border-border text-muted hover:text-ink',
                    )}
                  >
                    {t('region.' + r)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('form.interests')}</label>
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                {FACETS.sdgs.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleArr('interests', s)}
                    className={cx(
                      'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                      profile.interests.includes(s)
                        ? 'border-transparent bg-fit text-white'
                        : 'border-border text-muted hover:text-ink',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={profile.wantsStipend}
                onChange={(e) => set('wantsStipend', e.target.checked)}
                className="peer sr-only"
              />
              <span className={cx('grid h-[18px] w-[18px] place-items-center rounded-[5px] border', profile.wantsStipend ? 'border-primary bg-primary text-primary-fg' : 'border-border')}>
                {profile.wantsStipend && <Check size={12} />}
              </span>
              {t('form.prefersPaid')}
            </label>

            <button
              type="submit"
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-fit py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[.99]"
            >
              <Sparkles size={16} /> {t('form.findMatches')}
            </button>
          </form>
        </aside>

        {/* Results */}
        <section className="min-w-0">
          {!submitted ? (
            <IntroPanel />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    {submitted.fullName
                      ? t('match.topMatchesFor', { name: submitted.fullName })
                      : t('match.topMatches')}
                  </h2>
                  <p className="text-sm text-muted">
                    {t('match.viableLine', { viable: viable.length, ruled: results.length - viable.length })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {submitted.nationality && (
                    <Badge color="var(--muted)">
                      <Globe2 size={12} /> {submitted.nationality}
                      {submitted.age !== '' ? ` · ${submitted.age}` : ''}
                    </Badge>
                  )}
                  <button
                    onClick={() => setShowWeights((v) => !v)}
                    className={cx(
                      'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                      showWeights ? 'border-primary bg-primary-soft text-primary' : 'border-border text-muted hover:text-ink',
                    )}
                  >
                    <SlidersHorizontal size={13} /> {t('weights.title')}
                  </button>
                </div>
              </div>

              {showWeights && (
                <WeightsPanel weights={weights} onChange={setWeights} onReset={() => setWeights(DEFAULT_WEIGHTS)} />
              )}

              <div className="flex flex-col gap-3">
                {top.map((r, i) => (
                  <MatchRow key={r.opportunity.id} result={r} rank={i + 1} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {cvOpen && <CvModal onClose={() => setCvOpen(false)} onApply={applyExtract} />}
    </div>
  )
}

function WeightsPanel({
  weights,
  onChange,
  onReset,
}: {
  weights: Weights
  onChange: (w: Weights) => void
  onReset: () => void
}) {
  const { t } = useI18n()
  const keys = Object.keys(weights) as ReasonKey[]
  return (
    <div className="mb-4 animate-scale-in rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted">{t('weights.hint')}</p>
        <button
          onClick={onReset}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted hover:text-primary"
        >
          <RotateCcw size={12} /> {t('weights.reset')}
        </button>
      </div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {keys.map((key) => (
          <label key={key} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm text-ink">{t('weight.' + key)}</span>
            <input
              type="range"
              min={0}
              max={30}
              value={weights[key]}
              onChange={(e) => onChange({ ...weights, [key]: Number(e.target.value) } as Weights)}
              className="h-1.5 flex-1 cursor-pointer accent-primary"
            />
            <span className="w-6 shrink-0 text-right text-xs font-semibold text-faint tnum">
              {weights[key]}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function CvModal({
  onClose,
  onApply,
}: {
  onClose: () => void
  onApply: (p: Partial<CandidateProfile>) => void
}) {
  const { t } = useI18n()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ count: number; source: 'ai' | 'heuristic' } | null>(null)

  async function run() {
    if (!text.trim()) return
    setBusy(true)
    setResult(null)
    try {
      const { profile, found, source } = await extractProfile(text)
      onApply(profile)
      setResult({ count: found.length, source })
      if (found.length) setTimeout(onClose, 900)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-scale-in rounded-2xl border border-border bg-surface p-5 shadow-pop">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink">{t('cv.title')}</h3>
          <button onClick={onClose} className="text-faint hover:text-ink" aria-label={t('cv.cancel')}>
            <X size={18} />
          </button>
        </div>
        <p className="mb-3 text-sm text-muted">
          {t('cv.hint')}{' '}
          <span className="text-faint">
            ({aiExtractionEnabled ? t('cv.viaAi') : t('cv.viaOffline')})
          </span>
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('cv.placeholder')}
          rows={8}
          autoFocus
          className={cx(inputClass, 'resize-y')}
        />
        {result && (
          <p
            className={cx(
              'mt-2 text-sm font-medium',
              result.count ? 'text-fit' : 'text-warn',
            )}
          >
            {result.count ? t('cv.filled', { n: result.count }) : t('cv.nothing')}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
          >
            {t('cv.cancel')}
          </button>
          <button
            onClick={run}
            disabled={busy || !text.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-fg transition-transform hover:brightness-105 active:scale-[.99] disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {busy ? t('cv.extracting') : t('cv.extract')}
          </button>
        </div>
      </div>
    </div>
  )
}

function MatchRow({ result, rank }: { result: MatchResult; rank: number }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(rank <= 2)
  const { opportunity: o, score, reasons } = result
  const pm = PROGRAMME_META[o.programme]
  const strong = reasons.filter((r) => r.ok).sort((a, b) => b.weight - a.weight)

  return (
    <div className="animate-fade-up rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center gap-4 p-4">
        <div className="relative">
          <ScoreRing value={score} size={58} />
          <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-bg">
            {rank}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Badge color={pm.color} bg={pm.soft}>{pm.short}</Badge>
            {strong.slice(0, 3).map((r) => (
              <span key={r.key} className="rounded-md bg-fit-soft px-2 py-0.5 text-[11px] font-semibold text-fit">
                {t('reason.' + r.key)}
              </span>
            ))}
          </div>
          <h3 className="truncate font-display font-bold text-ink">{o.title}</h3>
          <p className="truncate text-xs text-muted">
            {o.organization} · <Flag code={o.location.countryCode} className="mx-0.5" />{' '}
            {o.location.city}, {o.location.country}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="hidden shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink sm:flex"
        >
          {t('match.why')} <ChevronDown size={14} className={cx('transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.key} className="flex items-center gap-2.5">
                <span
                  className={cx(
                    'grid h-5 w-5 shrink-0 place-items-center rounded-full',
                    r.ok ? 'bg-fit-soft text-fit' : 'bg-surface-2 text-faint',
                  )}
                >
                  {r.ok ? <Check size={12} /> : <X size={12} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">{t('reason.' + r.key)}</span>
                    <span className="text-[11px] font-semibold text-faint tnum">{r.weight}%</span>
                  </div>
                  <div className="truncate text-xs text-muted">{t(r.detailKey, r.params)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {o.sdgs.map((s) => (
                <SdgBadge key={s.number} sdg={s} showLabel={false} />
              ))}
            </div>
            <Link
              to={`/opportunities/${o.id}`}
              className="text-xs font-bold text-primary hover:underline"
            >
              {t('match.openOpportunity')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function IntroPanel() {
  const { t } = useI18n()
  const entries = Object.entries(MATCH_WEIGHTS).sort((a, b) => b[1] - a[1])
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-fit-soft text-fit">
          <UserSearch size={26} />
        </div>
        <h2 className="font-display text-xl font-bold text-ink">{t('match.introTitle')}</h2>
        <p className="mt-1 text-sm text-muted">
          {t('match.introSubtitle', { n: OPPORTUNITIES.length })}
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-md">
        <div className="mb-2 eyebrow text-faint">{t('match.howWeighted')}</div>
        <div className="flex flex-col gap-2">
          {entries.map(([key, weight]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm text-ink">{t('weight.' + key)}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-fit" style={{ width: `${(weight / 28) * 100}%` }} />
              </div>
              <span className="w-9 shrink-0 text-right text-xs font-semibold text-faint tnum">{weight}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
