import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

describe('Frontend Security Audit & WebSocket Lifecycle Tests', () => {
  const rootDir = process.cwd()

  it('1. Debe eliminar el canal Realtime del scope global (App.tsx y ProjectsContext.tsx)', () => {
    const appContext = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf-8')
    const projectsContext = fs.readFileSync(
      path.join(rootDir, 'src/context/ProjectsContext.tsx'),
      'utf-8',
    )
    const supabaseClient = fs.readFileSync(
      path.join(rootDir, 'src/services/supabaseClient.ts'),
      'utf-8',
    )

    // Verifica que el canal realtime no esté en App.tsx
    assert.strictEqual(
      appContext.includes('portfolio-projects-sync'),
      false,
      'App.tsx não deve conter referência a portfolio-projects-sync',
    )

    // Verifica que ProjectsContext não inicializa o canal nem o subscribe
    assert.strictEqual(
      projectsContext.includes('portfolio-projects-sync'),
      false,
      'ProjectsContext.tsx não deve conter o canal portfolio-projects-sync',
    )
    assert.strictEqual(
      projectsContext.includes('subscribeToProjectsRealtime'),
      false,
      'ProjectsContext.tsx não deve chamar subscribeToProjectsRealtime',
    )

    // Verifica que supabaseClient não inicia mais o canal globalmente
    assert.strictEqual(
      supabaseClient.includes('portfolio-projects-sync'),
      false,
      'supabaseClient.ts não deve conter o canal portfolio-projects-sync no escopo de serviço',
    )
  })

  it('2. Deve isolar o canal Realtime exclusivamente no componente PortfolioPage', () => {
    const portfolioPage = fs.readFileSync(
      path.join(rootDir, 'src/pages/PortfolioPage.tsx'),
      'utf-8',
    )

    // Deve conter a criação do canal
    assert.ok(
      portfolioPage.includes(".channel('portfolio-projects-sync')"),
      'PortfolioPage deve conter o canal portfolio-projects-sync',
    )

    // Deve conter a escuta de postgres_changes na tabela projects
    assert.ok(
      portfolioPage.includes("table: 'projects'"),
      'PortfolioPage deve escutar a tabela projects',
    )

    // Deve conter o subscribe
    assert.ok(
      portfolioPage.includes('.subscribe()'),
      'PortfolioPage deve subscrever ao canal via .subscribe()',
    )
  })

  it('3. Deve implementar limpeza de conexão (cleanup) no unmount via removeChannel', () => {
    const portfolioPage = fs.readFileSync(
      path.join(rootDir, 'src/pages/PortfolioPage.tsx'),
      'utf-8',
    )

    // Deve possuir o cleanup do removeChannel
    assert.ok(
      portfolioPage.includes('removeChannel(channel)'),
      'PortfolioPage deve executar removeChannel(channel) no cleanup',
    )

    // Deve estar encapsulado em um useEffect com []
    const useEffectPattern = /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*?removeChannel[\s\S]*?\}\s*,\s*\[\]\s*\)/
    assert.ok(
      useEffectPattern.test(portfolioPage),
      'A lógica do WebSocket deve estar em um useEffect com array de dependências vazio []',
    )
  })

  it('4. Auditoria de Segredos: Não deve expor SERVICE_ROLE_KEY ou credenciais privilegiadas no bundle do cliente', () => {
    const distAssetsDir = path.join(rootDir, 'dist/assets')
    if (fs.existsSync(distAssetsDir)) {
      const files = fs.readdirSync(distAssetsDir)
      for (const file of files) {
        if (file.endsWith('.js')) {
          const content = fs.readFileSync(path.join(distAssetsDir, file), 'utf-8')
          assert.strictEqual(
            content.includes('service_role'),
            false,
            `Arquivo ${file} no bundle de produção contém menção suspeita a 'service_role'`,
          )
        }
      }
    }
  })

  it('5. Segurança de Links Externos: Todos os links com target="_blank" devem ter rel="noopener noreferrer"', () => {
    const srcDir = path.join(rootDir, 'src')
    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scanDir(fullPath)
        } else if (entry.name.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf-8')
          const lines = content.split('\n')
          lines.forEach((line, index) => {
            if (line.includes('target="_blank"') && !line.includes('rel="noopener noreferrer"')) {
              // Verifica se rel está nas linhas adjacentes
              const snippet = lines.slice(Math.max(0, index - 2), index + 3).join(' ')
              assert.ok(
                snippet.includes('rel="noopener noreferrer"'),
                `Link com target="_blank" sem rel="noopener noreferrer" em ${entry.name}:${index + 1}`,
              )
            }
          })
        }
      }
    }
    scanDir(srcDir)
  })

  it('6. Validação de URLs: Backend deve rejeitar protocolos inseguros (javascript:) em repositoryUrl e coverImage', () => {
    const controllerContent = fs.readFileSync(
      path.join(rootDir, 'server/src/controllers/projects.controller.ts'),
      'utf-8',
    )
    assert.ok(
      controllerContent.includes('!trimmed.startsWith(\'javascript:\')'),
      'Schema de coverImage deve rejeitar expressamente javascript: URIs',
    )
    assert.ok(
      controllerContent.includes('^https?:\\/\\/'),
      'Schema de repositoryUrl deve restringir estritamente a protocolos http/https',
    )
  })

  it('7. Proteção de Uploads: Middleware deve proibir extensões executáveis e mapear extensão por MIME real', () => {
    const uploadMiddlewareContent = fs.readFileSync(
      path.join(rootDir, 'server/src/middleware/upload.middleware.ts'),
      'utf-8',
    )
    assert.ok(
      !uploadMiddlewareContent.includes("'image/svg+xml'"),
      'Middleware de upload não deve aceitar SVG scriptável sem sanitização',
    )
    assert.ok(
      uploadMiddlewareContent.includes('MIME_TO_EXT[file.mimetype.toLowerCase()]'),
      'Extensão do arquivo salvo deve ser derivada do MIME type seguro, nunca de originalname',
    )
  })

  it('8. Hardening do Servidor: Deve configurar trust proxy, rate limiters e CSP em arquivos estáticos', () => {
    const indexContent = fs.readFileSync(
      path.join(rootDir, 'server/src/index.ts'),
      'utf-8',
    )
    assert.ok(
      indexContent.includes("app.set('trust proxy', 1)"),
      'Servidor Express deve habilitar trust proxy para ambientes com reverse proxy',
    )
    assert.ok(
      indexContent.includes("res.setHeader('Content-Security-Policy', \"default-src 'none'\")"),
      'Servir arquivos em /uploads deve conter CSP restritiva contra execução de scripts',
    )
    assert.ok(
      indexContent.includes("res.setHeader('X-Content-Type-Options', 'nosniff')"),
      'Servir arquivos em /uploads deve definir X-Content-Type-Options: nosniff',
    )
  })
})
