import { useState, useRef, useEffect } from 'react'
import { X, Search, Code } from 'lucide-react'

// Map of normalized keys to custom visual representations (inline SVG or styled boxes)
const techIcons: Record<string, React.ReactNode> = {
  react: (
    <svg viewBox="-11.5 -10.23 23 20.46" className="h-3.5 w-3.5" fill="none" stroke="#61DAFB" strokeWidth="1.5">
      <circle r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  typescript: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#3178C6] text-[8px] font-black text-white leading-none font-sans select-none">TS</div>
  ),
  javascript: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#F7DF1E] text-[8px] font-black text-black leading-none font-sans select-none">JS</div>
  ),
  nextjs: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white leading-none font-sans select-none">N</div>
  ),
  vite: (
    <svg viewBox="0 0 100 100" className="h-3.5 w-3.5" fill="none">
      <path d="M83.3 16.7L50 83.3L16.7 16.7H83.3Z" fill="url(#viteTagGradient)" />
      <path d="M50 16.7L75 58.3L50 83.3L25 58.3L50 16.7Z" fill="#BD34FE" />
      <defs>
        <linearGradient id="viteTagGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#41D1FF" />
          <stop offset="100%" stopColor="#BD34FE" />
        </linearGradient>
      </defs>
    </svg>
  ),
  nodejs: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#339933' }}>
      <path d="M12 2L4 6.5v9L12 20l8-4.5v-9L12 2zm6 12.3l-6 3.4-6-3.4V7.7l6-3.4 6 3.4v6.6z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  tailwind: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#38BDF8' }}>
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 9.027 19 12.001 19c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
    </svg>
  ),
  d3: (
    <svg viewBox="0 0 100 100" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#F9A03F' }}>
      <path d="M20 20h20v20H20zm0 40h20v20H20zm40-40h20v20H60zm0 40h20v20H60z" />
      <path d="M40 30h20v10H40zm0 30h20v10H40zm-10 10v20h10V70z" />
    </svg>
  ),
  python: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#3776AB' }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ),
  postgresql: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#336791' }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  mongodb: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#47A248' }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 13.93V14h2v1.93c.8-.18 1.5-.6 2.07-1.18V12h-6v2.75c.57.58 1.27 1 2.07 1.18z" />
    </svg>
  ),
  docker: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#2496ED' }}>
      <path d="M2 10h3v3H2zm4 0h3v3H6zm4 0h3v3h-3zm4 0h3v3h-3zM6 6h3v3H6zm4 0h3v3h-3zm4 0h3v3h-3zm4 0h3v3h-3z" />
      <path d="M1 18v2h22v-2H1zm1 0h3v-2H2v2z" />
    </svg>
  ),
  git: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#F05032' }}>
      <path d="M20.6 10.4L13.6 3.4c-.8-.8-2-.8-2.8 0L9.4 4.8l2.9 2.9c.7-.2 1.6 0 2.2.6.6.6.8 1.5.6 2.2l2.9 2.9c.7-.2 1.6 0 2.2.6.8.8.8 2 0 2.8s-2 .8-2.8 0c-.6-.6-.8-1.5-.6-2.2L11.8 11c-.2.2-.4.3-.7.3-.3 0-.6-.1-.8-.3l-2.9 2.9c.2.7 0 1.6-.6 2.2-.8.8-2 .8-2.8 0s-.8-2 0-2.8c.6-.6 1.5-.8 2.2-.6l2.9-2.9c-.2-.7 0-1.6.6-2.2.4-.4.9-.6 1.4-.6.3 0 .6.1.8.3l2.9-2.9 7 7c.8.8.8 2 0 2.8s-2 .8-2.8 0z" />
    </svg>
  ),
  figma: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#F24E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
    </svg>
  ),
  html: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#E34F26] text-[8px] font-black text-white leading-none font-sans select-none">HTML</div>
  ),
  css: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#1572B6] text-[8px] font-black text-white leading-none font-sans select-none">CSS</div>
  ),
  sass: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#CC6699] text-[8px] font-black text-white leading-none font-sans select-none">SASS</div>
  ),
  firebase: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#FFCA28' }}>
      <path d="M12 2L2 22h20L12 2zm0 4l6 12H6L12 6z" />
    </svg>
  ),
  graphql: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#E10098" strokeWidth="2">
      <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" />
    </svg>
  ),
  redux: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#764ABC" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  ),
  java: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#E76F00] text-[8px] font-black text-white leading-none font-sans select-none">JAVA</div>
  ),
  go: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#00ADD8] text-[8px] font-black text-white leading-none font-sans select-none">GO</div>
  ),
  rust: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#000000] text-[8px] font-black text-[#E16E0A] leading-none font-sans select-none">RUST</div>
  ),
  cpp: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#00599C] text-[8px] font-black text-white leading-none font-sans select-none">C++</div>
  ),
  csharp: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#178600] text-[8px] font-black text-white leading-none font-sans select-none">C#</div>
  ),
  ruby: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#CC342D] text-[8px] font-black text-white leading-none font-sans select-none">RB</div>
  ),
  php: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#777BB4] text-[8px] font-black text-white leading-none font-sans select-none">PHP</div>
  ),
  laravel: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#FF2D20] text-[8px] font-black text-white leading-none font-sans select-none">LVR</div>
  ),
  vue: (
    <svg viewBox="0 0 256 221" className="h-3.5 w-3.5" fill="none">
      <path d="M204.8 0H256L128 220.8L0 0h51.2L128 132.48L204.8 0z" fill="#41B883" />
      <path d="M51.2 0H92.2L128 61.4L163.8 0h41L128 132.5L51.2 0z" fill="#35495E" />
    </svg>
  ),
  angular: (
    <svg viewBox="0 0 250 250" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#DD0031' }}>
      <polygon points="125,30 125,30 125,30 31.9,63.2 46.1,186.3 125,230 125,230 125,230 203.9,186.3 218.1,63.2" />
      <path d="M125,52.1L66.8,182.6h21.7l11.7-29.2h50.7l11.7,29.2h21.7L125,52.1z M113.8,125.1l11.2-27.9l11.2,27.9H113.8z" fill="#FFF" />
    </svg>
  ),
  svelte: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#FF3E00" strokeWidth="2.5">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
    </svg>
  ),
  nestjs: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#E0234E] text-[8px] font-black text-white leading-none font-sans select-none">NST</div>
  ),
  mysql: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#4479A1] text-[8px] font-black text-white leading-none font-sans select-none">SQL</div>
  ),
  redis: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#DC382D] text-[8px] font-black text-white leading-none font-sans select-none">RDS</div>
  ),
  sqlite: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#003B57] text-[8px] font-black text-white leading-none font-sans select-none">SQL</div>
  ),
  prisma: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#2D3748] text-[8px] font-black text-white leading-none font-sans select-none">PRM</div>
  ),
  aws: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#FF9900] text-[8px] font-black text-black leading-none font-sans select-none">AWS</div>
  ),
  gcp: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#4285F4] text-[8px] font-black text-white leading-none font-sans select-none">GCP</div>
  ),
  vercel: (
    <svg viewBox="0 0 100 100" className="h-3.5 w-3.5" fill="currentColor" style={{ color: '#000000' }}>
      <polygon points="50,15 95,85 5,85" />
    </svg>
  ),
  netlify: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#00AD9F] text-[8px] font-black text-white leading-none font-sans select-none">NTF</div>
  ),
  kubernetes: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#326CE5] text-[8px] font-black text-white leading-none font-sans select-none">K8S</div>
  ),
  jest: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#C21325] text-[8px] font-black text-white leading-none font-sans select-none">JEST</div>
  ),
  cypress: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#17202C] text-[8px] font-black text-[#49C39E] leading-none font-sans select-none">CY</div>
  ),
  storybook: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#FF4785] text-[8px] font-black text-white leading-none font-sans select-none">SB</div>
  ),
  stripe: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#008CFF] text-[8px] font-black text-white leading-none font-sans select-none">STP</div>
  ),
  springboot: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#6DB33F] text-[8px] font-black text-white leading-none font-sans select-none">SPG</div>
  ),
  django: (
    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#092E20] text-[8px] font-black text-white leading-none font-sans select-none">DJG</div>
  ),
}

// Synonyms and normalizations map
const normalizedKeys: Record<string, string> = {
  react: 'react',
  reactjs: 'react',
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  nextjs: 'nextjs',
  next: 'nextjs',
  vite: 'vite',
  vitejs: 'vite',
  nodejs: 'nodejs',
  node: 'nodejs',
  tailwind: 'tailwind',
  tailwindcss: 'tailwind',
  d3: 'd3',
  d3js: 'd3',
  python: 'python',
  py: 'python',
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  docker: 'docker',
  git: 'git',
  figma: 'figma',
  html: 'html',
  html5: 'html',
  css: 'css',
  css3: 'css',
  sass: 'sass',
  scss: 'sass',
  firebase: 'firebase',
  graphql: 'graphql',
  gql: 'graphql',
  redux: 'redux',
  java: 'java',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  cpp: 'cpp',
  cplusplus: 'cpp',
  csharp: 'csharp',
  ruby: 'ruby',
  rails: 'ruby',
  php: 'php',
  laravel: 'laravel',
  vue: 'vue',
  vuejs: 'vue',
  angular: 'angular',
  svelte: 'svelte',
  nestjs: 'nestjs',
  mysql: 'mysql',
  redis: 'redis',
  sqlite: 'sqlite',
  prisma: 'prisma',
  aws: 'aws',
  gcp: 'gcp',
  googlecloud: 'gcp',
  vercel: 'vercel',
  netlify: 'netlify',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  jest: 'jest',
  cypress: 'cypress',
  storybook: 'storybook',
  stripe: 'stripe',
  springboot: 'springboot',
  spring: 'springboot',
  django: 'django',
}

export function getTechIcon(techName: string) {
  const normalized = techName.toLowerCase().trim().replace(/[.\s-]/g, '')
  const resolvedKey = normalizedKeys[normalized] || normalized
  const icon = techIcons[resolvedKey]
  if (icon) return icon
  
  // Custom fallback: general Code icon
  return <Code className="h-3 w-3 text-surface-400" />
}

export const PREDEFINED_TECHS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Next.js',
  'Vite',
  'Node.js',
  'Tailwind CSS',
  'D3.js',
  'Python',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Git',
  'Figma',
  'HTML5',
  'CSS3',
  'Sass',
  'Firebase',
  'GraphQL',
  'Redux',
  'Java',
  'Go',
  'Rust',
  'C++',
  'C#',
  'Ruby',
  'PHP',
  'Laravel',
  'Vue.js',
  'Angular',
  'Svelte',
  'NestJS',
  'MySQL',
  'Redis',
  'SQLite',
  'Prisma',
  'AWS',
  'Google Cloud',
  'Vercel',
  'Netlify',
  'Kubernetes',
  'Jest',
  'Cypress',
  'Storybook',
  'Stripe',
  'Spring Boot',
  'Django',
]

interface TagSelectProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagSelect({ selectedTags, onChange, placeholder = 'Buscar ou adicionar tecnologia...' }: TagSelectProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter tech options based on search query, excluding already selected ones
  const filteredOptions = PREDEFINED_TECHS.filter(
    (tech) =>
      tech.toLowerCase().includes(query.toLowerCase()) &&
      !selectedTags.some((selected) => selected.toLowerCase() === tech.toLowerCase())
  )

  const showCreateOption =
    query.trim() !== '' &&
    !PREDEFINED_TECHS.some((tech) => tech.toLowerCase() === query.toLowerCase().trim()) &&
    !selectedTags.some((selected) => selected.toLowerCase() === query.toLowerCase().trim())

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (techName: string) => {
    const trimmed = techName.trim()
    if (!trimmed) return
    
    // Avoid duplicates
    if (!selectedTags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...selectedTags, trimmed])
    }
    setQuery('')
    inputRef.current?.focus()
  }

  const handleRemove = (techName: string) => {
    onChange(selectedTags.filter((tag) => tag !== techName))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && query === '' && selectedTags.length > 0) {
      // Remove last tag if search is empty and backspace is pressed
      handleRemove(selectedTags[selectedTags.length - 1])
    } else if (e.key === 'Enter' && query.trim() !== '') {
      e.preventDefault()
      // If there's a matching option, select it; otherwise create new
      const exactMatch = PREDEFINED_TECHS.find(
        (tech) => tech.toLowerCase() === query.toLowerCase().trim()
      )
      if (exactMatch) {
        handleSelect(exactMatch)
      } else if (showCreateOption) {
        handleSelect(query.trim())
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex w-full flex-wrap gap-2 rounded-xl border border-surface-200 bg-white p-2 text-sm outline-none transition-all focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-400/30 cursor-text min-h-[46px] items-center"
      >
        {/* Selected tags */}
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full bg-surface-100 px-3 py-1 text-xs font-semibold text-surface-700 border border-surface-200 animate-fade-in"
          >
            {getTechIcon(tag)}
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(tag)
              }}
              className="text-surface-400 hover:text-surface-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Input search box */}
        <div className="flex-1 min-w-[120px] flex items-center gap-1">
          <Search className="h-3.5 w-3.5 text-surface-400 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? placeholder : ''}
            className="w-full bg-transparent border-none outline-none py-1 text-surface-800 placeholder-surface-400 focus:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Floating Dropdown suggestions */}
      {isOpen && (isOpen && (filteredOptions.length > 0 || showCreateOption)) && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-surface-200 bg-white py-1 shadow-elevated focus:outline-none animate-fade-in-up">
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 hover:text-surface-900 transition-colors"
            >
              {getTechIcon(option)}
              <span className="flex-1">{option}</span>
            </button>
          ))}

          {showCreateOption && (
            <button
              type="button"
              onClick={() => handleSelect(query)}
              className="flex w-full items-center gap-2 border-t border-surface-100 px-4 py-2.5 text-left text-sm text-accent-600 hover:bg-surface-50 transition-colors font-medium"
            >
              <Code className="h-3.5 w-3.5 text-accent-500" />
              <span>Adicionar "{query}" como nova tag</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
