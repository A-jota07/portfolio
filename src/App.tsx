import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProjectsProvider } from '@/context/ProjectsContext'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { HomePage } from '@/pages/HomePage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { ContactPage } from '@/pages/ContactPage'
import { LoginPage } from '@/pages/admin/LoginPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { CreateProjectPage } from '@/pages/admin/CreateProjectPage'
import { EditProjectPage } from '@/pages/admin/EditProjectPage'

export function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </ProjectsProvider>
    </AuthProvider>
  )
}
