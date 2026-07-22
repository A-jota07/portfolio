import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'

const contactLinks = [
  {
    label: 'E-mail',
    value: 'alexandrecassiodesouzajunior@gmail.com',
    href: 'mailto:alexandrecassiodesouzajunior@gmail.com',
    description: 'Resposta em até 24h',
  },
  {
    label: 'LinkedIn',
    value: 'Alexandre Junior',
    href: 'https://linkedin.com/in/alexandre-c-souza-jr',
    description: 'Conecte-se profissionalmente',
  },
  {
    label: 'GitHub',
    value: '@A-jota07',
    href: 'https://github.com/A-jota07',
    description: 'Veja meus repositórios',
  },
]

const leftContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const leftItemVariants: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
      setSubmitted(true)
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
      alert('Houve um erro ao enviar a mensagem. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-6 py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Título e Cabeçalho: Entrada vindo de CIMA (y: -30, opacity: 0 -> y: 0, opacity: 1) */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <SectionHeading
            eyebrow="Contato"
            title="Vamos conversar?"
            subtitle="Envie uma mensagem ou entre em contato pelos links abaixo."
            align="center"
          />
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Lado Esquerdo: Cards entrarem vindo da ESQUERDA (x: -60, opacity: 0 -> x: 0, opacity: 1) com Stagger */}
          <motion.div
            variants={leftContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-4"
          >
            {contactLinks.map((link) => (
              <motion.a
                key={link.label}
                variants={leftItemVariants}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center justify-between rounded-2xl border border-surface-200 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-surface-300 hover:shadow-elevated cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">{link.label}</p>
                  <p className="mt-1 text-lg font-bold text-surface-900 transition-colors duration-300 group-hover:text-surface-700">
                    {link.value}
                  </p>
                  <p className="mt-1 text-sm text-surface-500">{link.description}</p>
                </div>
                <span className="text-surface-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-surface-900 font-bold">
                  →
                </span>
              </motion.a>
            ))}
          </motion.div>

          {/* Lado Direito: Caixa/Formulário inteiro vindo da DIREITA (x: 60, opacity: 0 -> x: 0, opacity: 1) */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {submitted ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-surface-200 bg-white p-12 text-center shadow-soft">
                <div>
                  <p className="text-2xl font-bold text-surface-900">Mensagem enviada!</p>
                  <p className="mt-2 text-surface-500">Obrigado pelo contato. Responderei em breve.</p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-surface-200 bg-white p-8 shadow-soft"
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Nome</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:border-surface-400 focus:ring-2 focus:ring-surface-900/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">E-mail</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:border-surface-400 focus:ring-2 focus:ring-surface-900/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Mensagem</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:border-surface-400 focus:ring-2 focus:ring-surface-900/10"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}