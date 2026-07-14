# API — Autenticação JWT

Back-end Express com autenticação JWT para proteger a área administrativa.

## Setup

```bash
# Na raiz do projeto
cp .env.example .env

# Instalar dependências do servidor
cd server
npm install

# Gerar hash bcrypt da senha do admin (ex: admin123)
npm run hash-password -- admin123
# Cole o hash em ADMIN_PASSWORD_HASH no arquivo .env (raiz do projeto)
```

## Executar

```bash
# Terminal 1 — API (porta 3001)
cd server && npm run dev

# Terminal 2 — Front-end (porta 5173)
cd .. && npm run dev

# Ou ambos de uma vez (na raiz):
npm run dev:all
```

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/login` | Não | Login — retorna JWT com `role: admin` |
| GET | `/api/auth/me` | Bearer | Valida token e retorna usuário |
| GET | `/api/admin/*` | Bearer + admin | Rotas protegidas da área admin |

## Credenciais demo

- **E-mail:** valor de `ADMIN_EMAIL` no `.env`
- **Senha:** a senha usada ao gerar `ADMIN_PASSWORD_HASH`

## Boas práticas implementadas

- Segredo JWT apenas no servidor (`.env`, nunca no front-end)
- Senha armazenada como hash bcrypt (cost 12)
- Payload JWT com `role`, `iss`, `aud` e expiração configurável
- Middleware em camadas: `authenticate` → `requireAdmin`
- Rate limiting no login (5 tentativas / 15 min)
- Helmet + CORS restrito + body limit
- Mensagens de erro genéricas no login (anti-enumeration)
- Comparação bcrypt mesmo quando e-mail não existe (anti-timing)
