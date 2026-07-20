import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-calm px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-surface-200/80 bg-white/80 p-8 shadow-elevated backdrop-blur-sm"
      >
        <h1 className="mb-2 text-2xl font-semibold text-surface-900">Área Administrativa</h1>
        <p className="mb-8 text-sm text-surface-500">
          Faça login para gerenciar os projetos do portfólio.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail..."
              className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent-400/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent-400/40"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrar
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
