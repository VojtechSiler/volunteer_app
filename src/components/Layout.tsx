import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Compass,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  UserSearch,
  X,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { useI18n } from '../lib/i18n'
import { cx } from './ui'
import { LanguageSwitcher } from './LanguageSwitcher'
import { initials } from '../lib/format'

const NAV = [
  { to: '/opportunities', labelKey: 'nav.opportunities', icon: LayoutGrid },
  { to: '/match', labelKey: 'nav.match', icon: UserSearch },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
]

function Brand() {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-fg shadow-sm">
        <Compass size={20} strokeWidth={2.2} />
      </div>
      <div className="leading-tight">
        <div className="font-display text-[15px] font-bold text-ink">{t('opps.title')}</div>
        <div className="text-[11px] font-medium text-faint">{t('brand.subtitle')}</div>
      </div>
    </div>
  )
}

export function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cx(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-primary-soft text-primary'
                : 'text-muted hover:bg-surface-2 hover:text-ink',
            )
          }
        >
          <Icon size={18} strokeWidth={2.1} />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <div className="mt-8 flex-1">{nav}</div>
        <UserCard />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-20 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 animate-scale-in border-r border-border bg-surface px-4 py-5">
            <div className="mb-8 px-2">
              <Brand />
            </div>
            {nav}
            <div className="mt-6">
              <UserCard />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="lg:pl-64">
        <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )

  function UserCard() {
    return (
      <div className="rounded-xl border border-border bg-surface-2/60 p-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-fg">
            {initials(user?.name ?? 'U')}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold text-ink">{user?.name}</div>
            <div className="truncate text-xs text-faint">{user?.email}</div>
          </div>
        </div>
        <div className="mt-2.5 flex justify-center">
          <LanguageSwitcher className="w-full justify-center" />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={toggle}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface py-1.5 text-xs font-semibold text-muted hover:text-ink"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? t('common.light') : t('common.dark')}
          </button>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface py-1.5 text-xs font-semibold text-muted hover:text-bad"
          >
            <LogOut size={14} /> {t('common.signOut')}
          </button>
        </div>
      </div>
    )
  }
}
