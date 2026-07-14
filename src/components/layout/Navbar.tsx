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
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-surface-200/60 bg-surface-50/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-surface-800 transition-colors hover:text-surface-900"
        >
          Portfólio<span className="text-accent-600">.</span>
        </Link>

        <ul className="flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-200/60 text-surface-900'
                      : 'text-surface-500 hover:bg-surface-100 hover:text-surface-800'
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
                className="ml-2 rounded-lg bg-surface-800 px-4 py-2 text-sm font-medium text-surface-50 transition-colors hover:bg-surface-700"
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
