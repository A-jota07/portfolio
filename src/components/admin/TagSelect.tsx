import { useState, useRef, useEffect } from 'react'
import { X, Search, Code } from 'lucide-react'
import { PREDEFINED_TECHS } from '@/constants/technologies'
import { getTechIcon } from '@/utils/techIcons'

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
        className="flex w-full flex-wrap gap-2 rounded-xl border border-surface-200 bg-surface-50 p-2 text-sm outline-none transition-all focus-within:border-accent-400 cursor-text min-h-[46px] items-center"
      >
        {/* Selected tags */}
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-1 font-mono text-xs font-semibold text-surface-800 border border-surface-200"
          >
            {getTechIcon(tag)}
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(tag)
              }}
              className="text-surface-400 hover:text-surface-800 transition-colors cursor-pointer"
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
            className="w-full bg-transparent border-none outline-none py-1 text-surface-900 placeholder-surface-400 focus:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Floating Dropdown suggestions */}
      {isOpen && (filteredOptions.length > 0 || showCreateOption) && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-surface-200 bg-surface-100 py-1 shadow-elevated focus:outline-none">
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-200/70 hover:text-surface-900 transition-colors cursor-pointer"
            >
              {getTechIcon(option)}
              <span className="flex-1">{option}</span>
            </button>
          ))}

          {showCreateOption && (
            <button
              type="button"
              onClick={() => handleSelect(query)}
              className="flex w-full items-center gap-2 border-t border-surface-200 px-4 py-2.5 text-left text-sm text-accent-400 hover:bg-surface-200/70 transition-colors font-medium cursor-pointer"
            >
              <Code className="h-3.5 w-3.5 text-accent-400" />
              <span>Adicionar "{query}" como nova tag</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
