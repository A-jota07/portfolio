import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { useProjects } from '@/context/ProjectsContext'

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/A-jota07',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/alexandre-c-souza-jr',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.065 2.065 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'E-mail',
    href: 'mailto:alexandrecassiodesouzajunior@gmail.com',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export function HomePage() {
  const { projects } = useProjects()
  const featured = projects.filter((p) => p.featured).slice(0, 3)

  return (
    <>
      <section className="bg-gradient-hero px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-600">
              Olá, eu sou
            </p>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-surface-900 md:text-5xl lg:text-6xl">
              Seu Nome
              <span className="block text-gradient">Desenvolvedor Front-end</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-surface-500">
              Construo experiências digitais minimalistas, performáticas e acessíveis.
              Especializado em React, TypeScript e design systems.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/portfolio">
                <Button>Ver Portfólio</Button>
              </Link>
              <Link to="/contato">
                <Button variant="secondary">Entrar em Contato</Button>
              </Link>
            </div>
            <div className="mt-10 flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200 bg-white/60 text-surface-500 transition-all hover:border-accent-400 hover:text-surface-800 hover:shadow-soft"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent-400/20 to-surface-200/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-surface-200/80 shadow-elevated">
              <motion.img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80"
                alt="Foto de perfil"
                className="aspect-square w-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Destaques"
              title="Projetos em evidência"
              subtitle="Uma seleção dos trabalhos mais recentes."
            />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link to="/portfolio">
                <Button variant="secondary">Ver todos os projetos</Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
