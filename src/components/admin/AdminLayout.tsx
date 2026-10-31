import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, Moon, Sun, Terminal } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/Button'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const { mode, toggleMode } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-calm bg-ide-grid text-surface-800">
      <header className="sticky top-0 z-40 border-b border-surface-200/80 bg-surface-50/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 font-mono text-sm font-bold text-surface-900"
            >
              <Terminal className="h-4 w-4 text-accent-400" />
              <span>admin_cms</span>
            </Link>

            <nav className="flex items-center gap-1 font-mono text-xs">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 transition-colors ${
                    isActive
                      ? 'bg-surface-200 text-surface-900 font-semibold'
                      : 'text-surface-500 hover:text-surface-900'
                  }`
                }
              >
                _projetos
              </NavLink>
              <NavLink
                to="/admin/novo"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 transition-colors ${
                    isActive
                      ? 'bg-surface-200 text-surface-900 font-semibold'
                      : 'text-surface-500 hover:text-surface-900'
                  }`
                }
              >
                _novo.md
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-lg border border-surface-200 bg-surface-100 px-3 py-1.5 font-mono text-xs text-surface-600 transition-colors hover:border-accent-400/50 hover:text-surface-900 sm:inline-flex"
            >
              <span>Ver site</span>
              <ExternalLink className="h-3.5 w-3.5 text-accent-400" />
            </Link>

            <button
              type="button"
              onClick={toggleMode}
              aria-label="Alternar modo claro/escuro"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 bg-surface-100 text-surface-600 hover:text-surface-900 cursor-pointer"
            >
              {mode === 'dark' ? (
                <Sun className="h-4 w-4 text-accent-400" />
              ) : (
                <Moon className="h-4 w-4 text-accent-500" />
              )}
            </button>

            <span className="hidden font-mono text-xs text-surface-500 md:inline">
              {user?.name}
            </span>

            <Button variant="ghost" onClick={handleLogout} magnetic={false}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
