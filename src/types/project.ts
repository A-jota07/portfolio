export interface Project {
  id: string
  slug: string
  title: string
  summary: string
  coverImage: string
  tags: string[]
  content: string
  featured: boolean
  repositoryUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  title: string
  summary: string
  coverImage: string
  tags: string[]
  content: string
  featured?: boolean
  repositoryUrl?: string
}
