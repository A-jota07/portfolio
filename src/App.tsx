import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProjectsProvider } from '@/context/ProjectsContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'

const PortfolioPage = lazy(() =>
  import('@/pages/PortfolioPage').then((m) => ({ default: m.PortfolioPage })),
)
const ProjectDetailPage = lazy(() =>
  import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const ContactPage = lazy(() =>
  import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)
const AdminLayout = lazy(() =>
  import('@/components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const LoginPage = lazy(() =>
  import('@/pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const CreateProjectPage = lazy(() =>
  import('@/pages/admin/CreateProjectPage').then((m) => ({ default: m.CreateProjectPage })),
)
const EditProjectPage = lazy(() =>
  import('@/pages/admin/EditProjectPage').then((m) => ({ default: m.EditProjectPage })),
)

function RouteLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="inline-flex items-center gap-2.5 rounded-xl border border-surface-200 bg-surface-100/80 px-4 py-2.5 font-mono text-xs text-surface-600">
        <span className="h-2 w-2 animate-ping rounded-full bg-accent-400" />
        <span>carregando_modulo()...</span>
      </div>
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectsProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="portfolio" element={<PortfolioPage />} />
                  <Route path="portfolio/:slug" element={<ProjectDetailPage />} />
                  <Route path="contato" element={<ContactPage />} />
                </Route>

                <Route path="admin/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="novo" element={<CreateProjectPage />} />
                    <Route path="editar/:id" element={<EditProjectPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProjectsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
