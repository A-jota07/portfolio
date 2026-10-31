import { useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import emailjs from '@emailjs/browser'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  MapPin,
  Send,
  Terminal,
} from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { PROFILE_DATA } from '@/data/profile'

const contactLinks = [
  {
    code: '// canal_01.email',
    label: 'E-mail Direto',
    value: PROFILE_DATA.email,
    href: `mailto:${PROFILE_DATA.email}`,
    description: 'Resposta rápida em até 24h úteis',
  },
  {
    code: '// canal_02.linkedin',
    label: 'LinkedIn',
    value: PROFILE_DATA.shortName,
    href: PROFILE_DATA.linkedinUrl,
    description: 'Conexão profissional & recrutamento',
  },
  {
    code: '// canal_03.github',
    label: 'GitHub',
    value: `@${PROFILE_DATA.handle}`,
    href: PROFILE_DATA.githubUrl,
    description: 'Código-fonte, commits e arquiteturas',
  },
]

const leftContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

const leftItemVariants: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function ContactPage() {
  const prefersReducedMotion = Boolean(useReducedMotion())
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    websiteHoneypot: '',
  })
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const errors = {
    name:
      touched.name && form.name.trim().length < 2
        ? 'Informe seu nome (mínimo 2 caracteres).'
        : '',
    email:
      touched.email && !validateEmail(form.email)
        ? 'Informe um endereço de e-mail válido.'
        : '',
    message:
      touched.message && form.message.trim().length < 10
        ? 'Escreva uma mensagem com pelo menos 10 caracteres.'
        : '',
  }

  const isFormValid =
    form.name.trim().length >= 2 &&
    validateEmail(form.email) &&
    form.message.trim().length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })

    // Honeypot anti-spam silencioso
    if (form.websiteHoneypot.trim() !== '') {
      setStatus('success')
      return
    }

    if (!isFormValid) return

    setStatus('loading')
    setErrorMsg('')

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    const templateParams = {
      from_name: form.name,
      from_email: form.email,
      message: form.message,
      to_name: 'Alexandre',
    }

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey)
      setStatus('success')
      setForm({ name: '', email: '', message: '', websiteHoneypot: '' })
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
      setStatus('error')
      setErrorMsg(
        'Não foi possível enviar pelo formulário agora. Você pode enviar diretamente para ' +
          PROFILE_DATA.email,
      )
    }
  }

  return (
    <section className="overflow-hidden px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          codeComment="iniciar_conexao"
          title="Vamos construir algo juntos?"
          subtitle={`Disponível para oportunidades remotas como ${PROFILE_DATA.role} ou projetos sob demanda.`}
          align="center"
        />

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Coluna Esquerda: Canais de Contato + Info Localização */}
          <motion.div
            variants={leftContainerVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-4 lg:col-span-5"
          >
            <div className="bento-card rounded-2xl p-5">
              <div className="flex items-center justify-between font-mono text-xs text-surface-500">
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{PROFILE_DATA.availability}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-accent-400" />
                  <span>{PROFILE_DATA.location}</span>
                </span>
              </div>
            </div>

            {contactLinks.map((link) => (
              <motion.a
                key={link.label}
                variants={leftItemVariants}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bento-card group flex items-center justify-between rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-mono text-[11px] font-semibold text-accent-400">
                    {link.code}
                  </p>
                  <p className="font-display mt-1 truncate text-base font-bold text-surface-900 sm:text-lg">
                    {link.value}
                  </p>
                  <p className="mt-0.5 text-xs text-surface-500">{link.description}</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-surface-100 text-surface-500 transition-colors group-hover:border-accent-400/50 group-hover:text-accent-400">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </motion.a>
            ))}
          </motion.div>

          {/* Coluna Direita: Formulário de Contato estilo Editor IDE */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="bento-card overflow-hidden rounded-3xl">
              {/* Barra de título estilo terminal */}
              <div className="flex items-center justify-between border-b border-surface-200/80 bg-surface-100/80 px-5 py-3 font-mono text-xs text-surface-500">
                <span className="inline-flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-accent-400" />
                  <span>~/portfolio/enviar_mensagem.sh</span>
                </span>
                <span className="text-accent-400">EmailJS · TLS</span>
              </div>

              {status === 'success' ? (
                <div className="flex min-h-[380px] flex-col items-center justify-center p-8 text-center sm:p-12">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <p className="font-mono text-xs text-emerald-400">
                    // status: 200_OK
                  </p>
                  <h3 className="font-display mt-1 text-2xl font-bold text-surface-900">
                    Mensagem enviada com sucesso!
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-surface-500">
                    Obrigado pelo contato. Recebi sua mensagem e responderei o mais breve possível.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-6"
                    onClick={() => {
                      setStatus('idle')
                      setTouched({ name: false, email: false, message: false })
                    }}
                  >
                    Enviar outra mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6 sm:p-8">
                  {/* Honeypot oculto para bots */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website-hp">Não preencha este campo</label>
                    <input
                      id="website-hp"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.websiteHoneypot}
                      onChange={(e) =>
                        setForm({ ...form, websiteHoneypot: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block font-mono text-xs font-medium text-surface-700"
                    >
                      <span className="text-accent-400">01.</span> Nome completo *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={form.name}
                      onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex.: Maria Silva (Tech Recruiter)"
                      className="w-full rounded-xl border border-surface-200 bg-surface-50/90 px-4 py-3 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-accent-400"
                    />
                    {errors.name && (
                      <p className="mt-1.5 font-mono text-xs text-red-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1.5 block font-mono text-xs font-medium text-surface-700"
                    >
                      <span className="text-accent-400">02.</span> Seu e-mail *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="nome@empresa.com"
                      className="w-full rounded-xl border border-surface-200 bg-surface-50/90 px-4 py-3 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-accent-400"
                    />
                    {errors.email && (
                      <p className="mt-1.5 font-mono text-xs text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-1.5 block font-mono text-xs font-medium text-surface-700"
                    >
                      <span className="text-accent-400">03.</span> Mensagem / Proposta *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={form.message}
                      onBlur={() => setTouched((prev) => ({ ...prev, message: true }))}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Conte um pouco sobre a vaga, projeto ou desafio técnico..."
                      className="w-full rounded-xl border border-surface-200 bg-surface-50/90 px-4 py-3 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-accent-400"
                    />
                    {errors.message && (
                      <p className="mt-1.5 font-mono text-xs text-red-400">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {status === 'error' && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <a
                      href={`mailto:${PROFILE_DATA.email}`}
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-surface-500 hover:text-accent-400"
                    >
                      <Mail className="h-3.5 w-3.5 text-accent-400" />
                      <span>Prefere e-mail direto? Clique aqui</span>
                    </a>

                    <Button
                      type="submit"
                      isLoading={status === 'loading'}
                      disabled={status === 'loading'}
                      className="w-full sm:w-auto"
                    >
                      <Send className="h-4 w-4" />
                      <span>Executar Envio</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
