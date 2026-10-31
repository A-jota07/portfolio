import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Terminal } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login({ email, password })
    setIsLoading(false)

    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.error ?? 'Erro ao fazer login.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-calm bg-ide-grid px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bento-card w-full max-w-md overflow-hidden rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-surface-200/80 bg-surface-100/80 px-5 py-3 font-mono text-xs text-surface-500">
          <span className="inline-flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-accent-400" />
            <span>~/portfolio/admin/auth.ts</span>
          </span>
          <Lock className="h-3.5 w-3.5 text-accent-400" />
        </div>

        <div className="p-6 sm:p-8">
          <p className="mb-1 font-mono text-xs text-accent-400">// autenticacao_jwt</p>
          <h1 className="font-display mb-2 text-2xl font-bold text-surface-900">
            Área Administrativa
          </h1>
          <p className="mb-6 text-sm text-surface-500">
            Faça login para gerenciar os projetos do portfólio.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs font-medium text-surface-700">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dominio.com"
                className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 outline-none focus:border-accent-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-xs font-medium text-surface-700">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 outline-none focus:border-accent-400"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Autenticar Sessão
            </Button>
          </form>

          <div className="mt-6 border-t border-surface-200/70 pt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-surface-500 hover:text-accent-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar para o portfólio público</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
