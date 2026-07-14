# Portfólio Web

Portfólio pessoal moderno com React, TypeScript, Tailwind CSS, Framer Motion e CMS interno.

## Stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** — paleta neutra com gradientes sutis
- **Framer Motion** — animações suaves e hover zoom
- **react-markdown** + **rehype-highlight** — renderização Markdown com syntax highlight
- **React Router** — rotas públicas e área admin protegida

## Início Rápido

```bash
cd portfolio-web
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Credenciais Admin (demo)

- **E-mail:** `admin@portfolio.dev`
- **Senha:** `admin123`

## Estrutura de Pastas

```
src/
├── components/
│   ├── admin/          # CMS: formulário, listagem, layout admin
│   ├── auth/           # ProtectedRoute
│   ├── layout/         # Layout, Navbar, Footer
│   ├── portfolio/      # ProjectCard, MarkdownRenderer
│   └── ui/             # Button, Card, HoverZoomImage, SectionHeading
├── context/            # AuthContext, ProjectsContext
├── data/               # seedProjects (dados iniciais)
├── pages/              # Home, Portfolio, Contato, Admin
├── services/           # authService (JWT simulado), projectService (localStorage)
├── styles/             # Tailwind + tema + estilos Markdown
└── types/              # Tipagens TypeScript
```

## Personalização

1. Edite `HomePage.tsx` — nome, bio e foto de perfil
2. Edite `ContactPage.tsx` e `Footer.tsx` — links sociais e e-mail
3. Use `/admin` para criar/editar projetos via editor Markdown

## Produção

Em produção, substitua o JWT simulado e o localStorage por uma API real (ex: Node.js + PostgreSQL).

```bash
npm run build
npm run preview
```
