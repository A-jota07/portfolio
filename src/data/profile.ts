export interface SkillItem {
  name: string
  category: 'Front-end' | 'Back-end' | 'Banco de Dados & DevOps' | 'Arquitetura & Qualidade'
  level: number
  tagKey: string
  description: string
}

export interface TimelineItem {
  period: string
  role: string
  organization: string
  location: string
  description: string
  highlights: string[]
}

export interface StudyingItem {
  topic: string
  focus: string
  status: string
}

export const PROFILE_DATA = {
  fullName: 'Alexandre Cássio de Souza Junior',
  shortName: 'Alexandre Junior',
  handle: 'A-jota07',
  role: 'Engenheiro Full Stack Júnior',
  rotatingRoles: [
    'Engenheiro Full Stack Júnior',
    'Especialista em React & TypeScript',
    'Desenvolvedor de APIs Node.js & Java',
    'Criador de Interfaces de Alta Performance',
  ],
  location: 'Rondonópolis - MT',
  availability: 'Disponível para trabalho remoto',
  yearsOfExperience: 2,
  repositoriesCount: 25,
  email: 'alexandrecassiodesouzajunior@gmail.com',
  githubUrl: 'https://github.com/A-jota07',
  linkedinUrl: 'https://linkedin.com/in/alexandre-c-souza-jr',
  bioShort:
    'Engenheiro Full Stack Júnior e estudante de Ciência da Computação focado em arquitetar aplicações web modernas, escaláveis e com experiência de usuário refinada.',
  bioExtended:
    'Atuo do desenho da interface reativa em React, TypeScript e Vue até a modelagem de APIs robustas em Node.js e Java. Acredito que código limpo, performance perceptível e atenção obsessiva aos microdetalhes visuais são o que diferenciam um produto memorável.',
  philosophy: [
    {
      code: '// 01. interface_como_engenharia',
      title: 'Capricho Visual & Performance',
      description:
        'Interfaces rápidas, acessíveis (WCAG AA), com animações fluidas a 60fps e zero layout shift.',
    },
    {
      code: '// 02. arquitetura_ponta_a_ponta',
      title: 'Domínio Full Stack Real',
      description:
        'APIs seguras com autenticação JWT, validação estrita em Zod, rate limiting e modelagem relacional sólida.',
    },
    {
      code: '// 03. codigo_sustentavel',
      title: 'TypeScript Estrito & DX',
      description:
        'Contratos tipados de ponta a ponta, componentes modulares e versionamento limpo.',
    },
  ],
  skills: [
    {
      name: 'React 19 & Hooks',
      category: 'Front-end',
      level: 92,
      tagKey: 'React',
      description: 'SPAs modernas, Context API, custom hooks, code-splitting e otimização de render.',
    },
    {
      name: 'TypeScript',
      category: 'Front-end',
      level: 90,
      tagKey: 'TypeScript',
      description: 'Tipagem estrita, generics, inferência avançada e contratos compartilhados.',
    },
    {
      name: 'Tailwind CSS v4 & Design Systems',
      category: 'Front-end',
      level: 94,
      tagKey: 'Tailwind',
      description: 'Tokens em OKLCH, layouts responsivos mobile-first, temas dinâmicos e acessibilidade.',
    },
    {
      name: 'Framer Motion & Microinterações',
      category: 'Front-end',
      level: 85,
      tagKey: 'React',
      description: 'Animações de layout compartilhado, scroll reveal, física de mola e suporte a reduced-motion.',
    },
    {
      name: 'Vue.js',
      category: 'Front-end',
      level: 78,
      tagKey: 'Vue',
      description: 'Composition API, componentização reativa e integração com APIs REST.',
    },
    {
      name: 'Node.js & Express',
      category: 'Back-end',
      level: 88,
      tagKey: 'Node.js',
      description: 'APIs RESTful, autenticação JWT, middlewares de segurança (Helmet, CORS, Rate Limit) e upload.',
    },
    {
      name: 'Java & Spring Boot',
      category: 'Back-end',
      level: 80,
      tagKey: 'Java',
      description: 'Programação orientada a objetos, APIs corporativas, JPA/Hibernate e padrões de projeto.',
    },
    {
      name: 'Validação & Segurança (Zod / JWT / Bcrypt)',
      category: 'Back-end',
      level: 86,
      tagKey: 'TypeScript',
      description: 'Sanitização de payloads, proteção de rotas administrativas e criptografia de credenciais.',
    },
    {
      name: 'PostgreSQL & Modelagem SQL',
      category: 'Banco de Dados & DevOps',
      level: 82,
      tagKey: 'PostgreSQL',
      description: 'Modelagem relacional, consultas otimizadas, índices e integridade transacional.',
    },
    {
      name: 'Git, GitHub & Deploy (Vercel / Render)',
      category: 'Banco de Dados & DevOps',
      level: 88,
      tagKey: 'Git',
      description: 'Fluxo de branches, Conventional Commits, CI/CD, rewrites SPA e variáveis de ambiente.',
    },
    {
      name: 'Docker & Ambientes Linux',
      category: 'Banco de Dados & DevOps',
      level: 76,
      tagKey: 'Docker',
      description: 'Containerização de serviços, automação via terminal e padronização de ambientes.',
    },
    {
      name: 'Clean Code, Acessibilidade & SEO Técnico',
      category: 'Arquitetura & Qualidade',
      level: 89,
      tagKey: 'HTML5',
      description: 'HTML semântico, navegação por teclado, Open Graph, Lighthouse 90+ e arquitetura modular.',
    },
  ] satisfies SkillItem[],
  timeline: [
    {
      period: '2024 — Presente',
      role: 'Desenvolvedor Full Stack (Projetos em Produção & Freelance)',
      organization: 'Atuação Independente · Remoto',
      location: 'Rondonópolis - MT',
      description:
        'Desenvolvimento completo de aplicações web modernas, desde a concepção de interfaces até o deploy de APIs autenticadas em nuvem.',
      highlights: [
        'Arquitetura de CMS próprio com editor Markdown rico, upload de imagens e autenticação JWT',
        'Implementação de interfaces responsivas com React 19, TypeScript, Tailwind CSS v4 e Framer Motion',
        'Deploy distribuído integrando Vercel (Front-end SPA) e Render (API Node.js/Express)',
      ],
    },
    {
      period: 'Em andamento',
      role: 'Bacharelado em Ciência da Computação',
      organization: 'Formação Acadêmica Superior',
      location: 'Rondonópolis - MT',
      description:
        'Base sólida em estruturas de dados, complexidade de algoritmos, engenharia de software, bancos de dados relacionais e arquitetura de sistemas.',
      highlights: [
        'Desenvolvimento de projetos práticos em Java, Node.js, TypeScript e bancos SQL',
        'Foco em boas práticas de engenharia de software, testes e padrões de projeto',
      ],
    },
  ] satisfies TimelineItem[],
  studyingNow: [
    {
      topic: 'Arquitetura Escalável & Testes Automatizados',
      focus: 'Vitest, Playwright e padrões Clean Architecture em Node.js/TypeScript',
      status: 'em_progresso',
    },
    {
      topic: 'Performance Web & Core Web Vitals',
      focus: 'Otimização de bundle, renderização concorrente no React 19 e animações GPU-bound',
      status: 'aprofundando',
    },
    {
      topic: 'Ecossistema Java & Microsserviços',
      focus: 'Spring Boot 3, segurança OAuth2/JWT, mensageria e containers Docker',
      status: 'praticando',
    },
  ] satisfies StudyingItem[],
}
