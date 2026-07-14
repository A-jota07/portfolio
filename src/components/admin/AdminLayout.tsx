import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-surface-100">
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-semibold text-surface-800">
              Admin CMS
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link
                to="/admin"
                className="text-surface-500 transition-colors hover:text-surface-800"
              >
                Projetos
              </Link>
              <Link
                to="/admin/novo"
                className="text-surface-500 transition-colors hover:text-surface-800"
              >
                Novo Projeto
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-surface-500">{user?.name}</span>
            <Button variant="ghost" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
