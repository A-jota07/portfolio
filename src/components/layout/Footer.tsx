import { Link } from 'react-router-dom'
import { Terminal, ArrowUpRight, MapPin } from 'lucide-react'
import { PROFILE_DATA } from '@/data/profile'

const socialLinks = [
  { label: 'GitHub', href: PROFILE_DATA.githubUrl },
  { label: 'LinkedIn', href: PROFILE_DATA.linkedinUrl },
  { label: 'E-mail', href: `mailto:${PROFILE_DATA.email}` },
]

export function Footer() {
  return (
    <footer className="border-t border-surface-200/80 bg-surface-100/40 pb-12 pt-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-mono text-sm font-bold text-surface-900"
            >
              <Terminal className="h-4 w-4 text-accent-400" />
              <span>
                {PROFILE_DATA.fullName} <span className="text-accent-400">//</span>{' '}
                {PROFILE_DATA.role}
              </span>
            </Link>
            <p className="flex items-center gap-1.5 font-mono text-xs text-surface-500">
              <MapPin className="h-3.5 w-3.5 text-accent-400" />
              <span>
                {PROFILE_DATA.location} · {PROFILE_DATA.availability}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-surface-200 bg-surface-50/70 px-3.5 py-1.5 font-mono text-xs font-medium text-surface-600 transition-colors hover:border-accent-400/50 hover:text-surface-900"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-accent-400" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-surface-200/60 pt-6 font-mono text-xs text-surface-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {PROFILE_DATA.shortName}. Todos os direitos reservados.
          </p>
          <p className="text-surface-400">
            /* construído com React 19, TypeScript &amp; Tailwind v4 */
          </p>
        </div>
      </div>
    </footer>
  )
}
