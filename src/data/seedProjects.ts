import type { Project } from '@/types/project'

export const SEED_PROJECTS: Project[] = [
  {
    id: '1',
    slug: 'dashboard-analytics',
    title: 'Dashboard Analytics',
    summary: 'Painel interativo com gráficos em tempo real e filtros avançados.',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    tags: ['React', 'TypeScript', 'D3.js'],
    featured: true,
    createdAt: '2025-11-01T10:00:00.000Z',
    updatedAt: '2025-11-01T10:00:00.000Z',
    content: `## Visão Geral

Dashboard de analytics construído com foco em **performance** e **acessibilidade**.

### Destaques

- Gráficos responsivos com D3.js
- Filtros por período e categoria
- Dark mode nativo

### Trecho de Código

\`\`\`tsx
const Chart = ({ data }: { data: DataPoint[] }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    renderLineChart(svgRef.current, data)
  }, [data])

  return <svg ref={svgRef} className="w-full h-64" />
}
\`\`\`

![Preview do dashboard](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80)
`,
  },
  {
    id: '2',
    slug: 'ecommerce-minimal',
    title: 'E-commerce Minimal',
    summary: 'Loja virtual com checkout simplificado e experiência mobile-first.',
    coverImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    tags: ['Next.js', 'Stripe', 'Tailwind'],
    featured: true,
    createdAt: '2025-10-15T10:00:00.000Z',
    updatedAt: '2025-10-15T10:00:00.000Z',
    content: `## Sobre o Projeto

E-commerce com design minimalista e fluxo de compra em 3 passos.

### Funcionalidades

1. Catálogo com busca instantânea
2. Carrinho persistente
3. Pagamento via Stripe

\`\`\`typescript
async function createCheckoutSession(items: CartItem[]) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
  return response.json()
}
\`\`\`
`,
  },
  {
    id: '3',
    slug: 'design-system',
    title: 'Design System',
    summary: 'Biblioteca de componentes reutilizáveis com documentação Storybook.',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    tags: ['React', 'Storybook', 'Figma'],
    featured: false,
    createdAt: '2025-09-20T10:00:00.000Z',
    updatedAt: '2025-09-20T10:00:00.000Z',
    content: `## Design System

Sistema de design com tokens semânticos e componentes acessíveis.

> "Consistência visual reduz a carga cognitiva do usuário."

### Tokens

| Token | Valor |
|-------|-------|
| \`--color-primary\` | #3f3b36 |
| \`--radius-lg\` | 12px |
`,
  },
]
