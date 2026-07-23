import { useState } from 'react'
import { Check, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
import { cx, inputClass } from '../components/ui'
import { initials } from '../lib/format'

const inputCls = inputClass

export function Settings() {
  const { user, changePassword } = useAuth()
  const { t } = useI18n()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setDone(false)
    if (next !== confirm) {
      setError('settings.passwordsNoMatch')
      return
    }
    setBusy(true)
    try {
      await changePassword(current, next)
      setDone(true)
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'settings.couldNotChange')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('settings.subtitle')}</p>
      </header>

      <section className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-fg">
            {initials(user?.name ?? 'U')}
          </div>
          <div>
            <div className="font-display text-lg font-bold text-ink">{user?.name}</div>
            <div className="text-sm text-muted">{user?.email}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
            <KeyRound size={18} />
          </div>
          <div>
            <h2 className="font-display font-bold text-ink">{t('settings.changePassword')}</h2>
            <p className="text-xs text-muted">{t('settings.changePasswordHint')}</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">{t('settings.currentPassword')}</span>
            <input
              className={inputCls}
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">{t('settings.newPassword')}</span>
              <input
                className={inputCls}
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">{t('settings.confirmNewPassword')}</span>
              <input
                className={inputCls}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm font-medium text-bad">
              {t(error)}
            </div>
          )}
          {done && (
            <div className="flex items-center gap-2 rounded-lg border border-good/30 bg-good/10 px-3 py-2 text-sm font-medium text-good">
              <ShieldCheck size={16} /> {t('settings.passwordUpdated')}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={busy || !current || !next}
              className={cx(
                'flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg shadow-sm transition-transform hover:brightness-105 active:scale-[.99]',
                (busy || !current || !next) && 'opacity-60',
              )}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {t('settings.updatePassword')}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
