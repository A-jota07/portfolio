# Portfólio — Alexandre Junior

Portfólio pessoal e CMS desenvolvido para apresentar projetos, experiência técnica e canais de contato em produção.

---

## Sobre o Projeto

Aplicação full-stack composta por uma interface reativa em **React 19** e uma API em **Node.js + Express** para autenticação administrativa e upload de arquivos:

- **Vitrine de Projetos:** Listagem de projetos em destaque e catálogo completo com páginas individuais renderizadas em Markdown (GFM + syntax highlighting).
- **Animações e UI:** Transições de página, scroll reveal e microinterações construídas com Framer Motion e Tailwind CSS v4.
- **Formulário de Contato:** Integração direta com EmailJS para envio de mensagens.
- **Painel Administrativo (`/admin`):** Área restrita protegida por autenticação JWT com editor visual Markdown (`@mdxeditor/editor`) e upload de imagens.

---

## Tecnologias

### Front-end
- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS v4** — estilização utilitária e design responsivo
- **Framer Motion** — animações de entrada e microinterações
- **React Router v7** — roteamento SPA com rotas públicas e protegidas
- **MDXEditor** & **react-markdown** (`remark-gfm`, `rehype-highlight`) — edição e exibição de conteúdo técnico
- **EmailJS (`@emailjs/browser`)** — disparo de e-mails na página de contato
- **Lucide React** — iconografia

### Back-end (`server/`)
- **Node.js** + **Express 5** + **TypeScript**
- **JSON Web Token (`jsonwebtoken`)** & **bcryptjs** — autenticação stateless e hash de credenciais
- **Multer** — upload e armazenamento de imagens
- **Helmet**, **CORS** & **express-rate-limit** — segurança de headers HTTP e proteção contra força bruta no login
- **Zod** — validação de esquemas e variáveis de ambiente

---

## Estrutura do Repositório

```text
portfolio/
├── public/                 # Ativos estáticos públicos
├── src/                    # Aplicação Front-end (React + Vite)
│   ├── components/         # Componentes de UI, Layout, Portfólio e Admin
│   ├── context/            # Contextos de Autenticação e Projetos
│   ├── data/               # Dados iniciais dos projetos
│   ├── pages/              # Páginas públicas (Home, Portfólio, Contato) e Admin
│   ├── services/           # Integração com API (auth, projetos e upload)
│   └── types/              # Definições de tipos TypeScript
├── server/                 # API Back-end (Express + TypeScript)
│   ├── scripts/            # Utilitários (ex: geração de hash bcrypt)
│   └── src/                # Rotas, controllers, middlewares e configuração
└── vercel.json             # Configuração de rewrites e roteamento SPA na Vercel
```

---

## Executando Localmente

### Pré-requisitos
- **Node.js** 20+ e **npm**

### 1. Instalar dependências

```bash
# Instalar dependências do front-end (raiz)
npm install

# Instalar dependências do servidor
cd server && npm install && cd ..
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo na raiz do projeto:

```bash
cp .env.example .env
```

Preencha as variáveis necessárias no `.env`:

- **Back-end (`server`):** `PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` (você pode gerar um hash executando `npm --prefix server run hash-password -- <sua_senha>`).
- **Front-end (Vite):**
  - `VITE_API_URL` (opcional localmente; padrão `http://localhost:3001`)
  - `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` e `VITE_EMAILJS_PUBLIC_KEY` (para o formulário de contato)

### 3. Iniciar em modo de desenvolvimento

```bash
# Inicia front-end (porta 5173) e back-end (porta 3001) simultaneamente
npm run dev:all
```

Ou execute separadamente:
- `npm run dev` — apenas o front-end em `http://localhost:5173`
- `npm run dev:server` — apenas a API em `http://localhost:3001`

---

## Build e Deploy (Produção)

O projeto está configurado para deploy distribuído:
- **Front-end:** Hospedado na **Vercel** (configurado via [`vercel.json`](./vercel.json) para roteamento SPA e proxy de `/api/*`).
- **Back-end:** Hospedado na **Render**.

```bash
# Gerar build de produção do front-end (pasta dist/)
npm run build

# Gerar build de produção do servidor (pasta server/dist/)
npm run build:server
```

---

## Contato

**Alexandre Junior** — Desenvolvedor Full-Stack

- **LinkedIn:** [linkedin.com/in/alexandre-c-souza-jr](https://linkedin.com/in/alexandre-c-souza-jr)
- **GitHub:** [@A-jota07](https://github.com/A-jota07)
- **E-mail:** [alexandrecassiodesouzajunior@gmail.com](mailto:alexandrecassiodesouzajunior@gmail.com)
