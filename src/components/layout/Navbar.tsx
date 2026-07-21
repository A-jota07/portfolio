import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/portfolio', label: 'Portfólio' },
  { to: '/contato', label: 'Contato' },
]

export function Navbar() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) return null

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 border-b border-surface-200/80 bg-surface-50/90 backdrop-blur-md"
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-surface-900 transition-colors hover:text-surface-700"
        >
          Portfólio<span className="text-surface-900">.</span>
        </Link>

        <ul className="flex items-center gap-1.5">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-surface-900 text-white shadow-sm'
                      : 'text-surface-600 hover:bg-surface-200/60 hover:text-surface-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <NavLink
                to="/admin"
                className="ml-2 rounded-xl bg-surface-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-surface-800"
              >
                Admin
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </motion.header>
  )
}
