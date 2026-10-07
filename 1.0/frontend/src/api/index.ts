import { http } from './http'

// ---------------- 类型 ----------------
export interface User {
  id: number
  username: string
  name?: string | null
  email?: string | null
  phone?: string | null
  avatar?: string | null
  bio?: string | null
  role: 'user' | 'teacher' | 'student' | 'admin'
  status: string
  lastSignInAt?: string
  createdAt?: string
}

export interface TermDatabase {
  id: number
  name: string
  category: string
  description?: string | null
  ownerId: number
  ownerName?: string | null
  visibility: 'public' | 'private' | 'team'
  termCount: number
  status: string
  memberCount?: number
  createdAt: string
  updatedAt: string
}

export interface Term {
  id: number
  dbId: number
  cnTerm: string
  ruTerm: string
  enTerm?: string | null
  definition?: string | null
  context?: string | null
  cultureNote?: string | null
  pos?: string | null
  tags?: string | null
  status?: string
  version?: number
  createdAt?: string
  updatedAt?: string
}

export interface Resource {
  id: number
  dbId: number
  moduleType: string
  title: string
  content?: string | null
  difficulty: string
  duration?: number | null
  createdAt: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: string
  mode?: string
}

// ---------------- 各模块 ----------------
export const authApi = {
  register: (data: { username: string; password: string; name?: string; email?: string }) =>
    http.post<{ token: string; userId: number }>('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    http.post<{ token: string; userId: number }>('/auth/login', data),
  me: () => http.get<User | null>('/auth/me'),
  logout: () => http.post<null>('/auth/logout'),
}

export const userApi = {
  me: () => http.get<User>('/users/me'),
  update: (data: Partial<User>) => http.put<User>('/users/me', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    http.put<null>('/users/me/password', data),
  myDatabases: () => http.get<TermDatabase[]>('/users/me/databases'),
}

export const databaseApi = {
  list: (params?: { search?: string; category?: string; mine?: boolean }) =>
    http.get<TermDatabase[]>('/databases', params),
  categories: () => http.get<string[]>('/databases/categories'),
  byId: (id: number) => http.get<TermDatabase>(`/databases/${id}`),
  create: (data: { name: string; category: string; description?: string; visibility?: string }) =>
    http.post<TermDatabase>('/databases', data),
  update: (id: number, data: Record<string, unknown>) => http.put<TermDatabase>(`/databases/${id}`, data),
  remove: (id: number) => http.del<null>(`/databases/${id}`),
  archive: (id: number) => http.post<null>(`/databases/${id}/archive`),
  restore: (id: number) => http.post<null>(`/databases/${id}/restore`),
  terms: (id: number, params?: { search?: string; pos?: string; sort?: string; page?: number; pageSize?: number }) =>
    http.get<PageResult<Term>>(`/databases/${id}/terms`, params),
  createTerm: (id: number, data: Partial<Term>) => http.post<Term>(`/databases/${id}/terms`, data),
  resources: (id: number, moduleType?: string) =>
    http.get<Resource[]>(`/databases/${id}/resources`, moduleType ? { moduleType } : undefined),
  members: (id: number) => http.get<Record<string, unknown>[]>(`/databases/${id}/members`),
  addMember: (id: number, data: { username: string; role: string }) =>
    http.post<null>(`/databases/${id}/members`, data),
  removeMember: (id: number, userId: number) => http.del<null>(`/databases/${id}/members/${userId}`),
}

export const termApi = {
  search: (q: string, dbId?: number) =>
    http.get<{ list: Term[]; groups: { dbId: number; dbName: string; items: Term[] }[]; total: number }>(
      '/terms/search',
      { q, dbId },
    ),
  posList: () => http.get<string[]>('/terms/pos-list'),
  stats: () =>
    http.get<{ totalTerms: number; totalDatabases: number; totalResources: number; totalUsers: number }>(
      '/terms/stats',
    ),
  export: (dbId?: number) => http.get<Term[]>('/terms/export', dbId ? { dbId } : undefined),
  import: (dbId: number, items: Partial<Term>[]) =>
    http.post<{ inserted: number; failed: number }>('/terms/import', { dbId, items }),
  byId: (id: number) => http.get<Term & { media: unknown[]; relations: unknown[] }>(`/terms/${id}`),
  update: (id: number, data: Partial<Term> & { changeNote?: string }) => http.put<Term>(`/terms/${id}`, data),
  remove: (id: number) => http.del<null>(`/terms/${id}`),
  restore: (id: number) => http.post<null>(`/terms/${id}/restore`),
  versions: (id: number) => http.get<Record<string, unknown>[]>(`/terms/${id}/versions`),
}

export const resourceApi = {
  moduleTypes: () => http.get<{ value: string; label: string }[]>('/resources/module-types'),
  list: (params: { dbId?: number; moduleType?: string }) => http.get<Resource[]>('/resources', params),
  byId: (id: number) => http.get<Resource>(`/resources/${id}`),
}

export const learnApi = {
  flashcards: (dbId?: number, limit = 20) => http.get<Term[]>('/learn/flashcards', { dbId, limit }),
  quiz: (dbId: number | undefined, mode: string, limit = 10) =>
    http.get<QuizQuestion[]>('/learn/quiz', { dbId, mode, limit }),
  record: (data: Record<string, unknown>) => http.post<{ success: boolean }>('/learn/records', data),
  records: (limit = 50) => http.get<Record<string, unknown>[]>('/learn/records', { limit }),
  stats: () =>
    http.get<{ totalSessions: number; totalDuration: number; avgScore: number; masteredCount: number }>(
      '/learn/stats',
    ),
  compare: (dbId: number) => http.get<Term[]>('/learn/compare', { dbId }),
  scenario: (dbId?: number) => http.get<Resource[]>('/learn/scenario', { dbId }),
  paths: () => http.get<Record<string, unknown>[]>('/learn/paths'),
}

export const favoriteApi = {
  list: () => http.get<Record<string, unknown>[]>('/favorites'),
  add: (data: { targetType?: string; targetId: number; notes?: string }) => http.post<null>('/favorites', data),
  remove: (id: number) => http.del<null>(`/favorites/${id}`),
  check: (targetType: string, targetId: number) =>
    http.get<{ favorited: boolean; id: number | null }>('/favorites/check', { targetType, targetId }),
}

export const noteApi = {
  list: (search?: string) => http.get<Record<string, unknown>[]>('/notes', search ? { search } : undefined),
  create: (data: { content: string; title?: string; targetType?: string; targetId?: number }) =>
    http.post<Record<string, unknown>>('/notes', data),
  update: (id: number, data: { title?: string; content?: string }) =>
    http.put<Record<string, unknown>>(`/notes/${id}`, data),
  remove: (id: number) => http.del<null>(`/notes/${id}`),
}

export const translateApi = {
  text: (data: { text: string; sourceLang: string; targetLang: string }) =>
    http.post<{
      result: string
      matchedTerms: { cn: string; ru: string; source: string }[]
      isMachineTranslated: boolean
    }>('/translate/text', data),
  file: (file: File, sourceLang = 'zh') => {
    const form = new FormData()
    form.append('file', file)
    form.append('sourceLang', sourceLang)
    return http.upload<Record<string, unknown>>('/translate/file', form)
  },
  history: (limit = 20) => http.get<Record<string, unknown>[]>('/translate/history', { limit }),
  removeHistory: (id: number) => http.del<null>(`/translate/history/${id}`),
  quick: (q: string) => http.get<Record<string, unknown>>('/translate/quick', { q }),
}

export const adminApi = {
  stats: () =>
    http.get<Record<string, number>>('/admin/stats'),
  users: (params?: { search?: string; role?: string }) => http.get<User[]>('/admin/users', params),
  updateRole: (id: number, role: string) => http.put<null>(`/admin/users/${id}/role`, { role }),
  updateStatus: (id: number, status: string) => http.put<null>(`/admin/users/${id}/status`, { status }),
  activities: () =>
    http.get<{ recentTerms: Term[]; recentRecords: Record<string, unknown>[] }>('/admin/activities'),
  termGrowth: () => http.get<{ month: string; count: number }[]>('/admin/term-growth'),
  auditLogs: (limit = 50) => http.get<Record<string, unknown>[]>('/admin/audit-logs', { limit }),
}

export const announcementApi = {
  list: (type?: string) => http.get<Record<string, unknown>[]>('/announcements', type ? { type } : undefined),
}
