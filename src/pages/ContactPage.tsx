import { useState } from 'react'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser' // <--- 1. Importação adicionada
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

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false) // State para loading do botão

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Configurações do EmailJS
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    // Mapeamento dos campos do seu formulário para o template
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
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Contato"
          title="Vamos conversar?"
          subtitle="Envie uma mensagem ou entre em contato pelos links abaixo."
          align="center"
        />

        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-surface-200/80 bg-white/70 p-6 shadow-soft transition-all hover:border-accent-400/50 hover:shadow-elevated"
              >
                <div>
                  <p className="text-sm font-medium text-surface-400">{link.label}</p>
                  <p className="mt-1 text-lg font-medium text-surface-800 group-hover:text-accent-600">
                    {link.value}
                  </p>
                  <p className="mt-1 text-sm text-surface-500">{link.description}</p>
                </div>
                <span className="text-surface-300 transition-transform group-hover:translate-x-1 group-hover:text-accent-500">
                  →
                </span>
              </a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {submitted ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-surface-200 bg-white/70 p-12 text-center shadow-soft">
                <div>
                  <p className="text-2xl font-semibold text-surface-800">Mensagem enviada!</p>
                  <p className="mt-2 text-surface-500">Obrigado pelo contato. Responderei em breve.</p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-surface-200/80 bg-white/70 p-8 shadow-soft"
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Nome</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent-400/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">E-mail</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent-400/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Mensagem</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent-400/40"
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