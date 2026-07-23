import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Compass, Eye, EyeOff, Globe2, Loader2, Sparkles, UserSearch } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
import { OPPORTUNITIES } from '../lib/data'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { cx, inputClass } from '../components/ui'

const COUNTRY_COUNT = new Set(OPPORTUNITIES.map((o) => o.location.country)).size

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  )
}

const inputCls = inputClass

export function AuthScreen({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isRegister = mode === 'register'
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/opportunities'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isRegister) await register(name, email, password)
      else await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'err.generic')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Left — brand / value panel */}
      <div className="relative hidden overflow-hidden bg-primary-deep lg:block">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-fit/30 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Compass size={24} />
            </div>
            <div className="font-display text-lg font-bold">Volunteer Opportunities</div>
          </div>

          <div>
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.08] text-balance">
              {t('auth.heroTitle')}
            </h1>
            <p className="mt-4 max-w-md text-white/80">{t('auth.heroSubtitle')}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Stat icon={<Globe2 size={16} />} value={`${COUNTRY_COUNT}+`} label={t('auth.statCountries')} />
              <Stat icon={<Sparkles size={16} />} value={`${OPPORTUNITIES.length}`} label={t('auth.statRoles')} />
              <Stat icon={<UserSearch size={16} />} value={t('auth.statMatchValue')} label={t('auth.statMatch')} />
            </div>
          </div>

          <p className="text-xs text-white/60">{t('auth.footer')}</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="relative flex items-center justify-center bg-bg px-6 py-12">
        <div className="absolute right-6 top-6">
          <LanguageSwitcher />
        </div>
        <form onSubmit={submit} className="w-full max-w-sm animate-fade-up">
          <div className="mb-1 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-fg">
              <Compass size={20} />
            </div>
            <span className="font-display font-bold text-ink">Volunteer Opportunities</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">
            {isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
          </h2>
          <p className="mb-6 mt-1 text-sm text-muted">
            {isRegister ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
          </p>

          <div className="flex flex-col gap-4">
            {isRegister && (
              <Field label={t('auth.fullName')}>
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label={t('auth.email')}>
              <input
                className={inputCls}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>
            <Field label={t('auth.password')}>
              <div className="relative">
                <input
                  className={cx(inputCls, 'pr-11')}
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? t('auth.passwordHintRegister') : '••••••••'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted"
                  aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            {error && (
              <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm font-medium text-bad">
                {t(error)}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-fg shadow-sm transition-transform hover:brightness-105 active:scale-[.99] disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {isRegister ? t('auth.createAccount') : t('auth.signIn')}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            {isRegister ? t('auth.haveAccount') : t('auth.newHere')}
            <Link to={isRegister ? '/login' : '/register'} className="font-semibold text-primary hover:underline">
              {isRegister ? t('auth.toSignIn') : t('auth.toCreate')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur">
      <span className="text-white/80">{icon}</span>
      <span>
        <span className="font-display text-lg font-bold tnum">{value}</span>{' '}
        <span className="text-xs text-white/70">{label}</span>
      </span>
    </div>
  )
}
