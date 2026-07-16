const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/A-jota07' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/alexandre-c-souza-jr' },
  { label: 'E-mail', href: 'mailto:alexandrecassiodesouzajunior@gmail.com' },
]

export function Footer() {
  return (
    <footer className="border-t border-surface-200/60 bg-surface-100/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-surface-500">
          © {new Date().getFullYear()} Alexandre Junior. Todos os direitos reservados.
        </p>
        <div className="flex gap-6">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-surface-500 transition-colors hover:text-surface-800"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
