import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'API error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

export const api = {
  getSituations: () => apiFetch('/api/situations'),

  createSession: (situation_id: string) =>
    apiFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ situation_id })
    }),

  getSession: (id: string) => apiFetch(`/api/sessions/${id}`),

  sendMessage: (session_id: string, content: string) =>
    apiFetch(`/api/sessions/${session_id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  endSession: (session_id: string) =>
    apiFetch(`/api/sessions/${session_id}/end`, { method: 'POST' }),

  getFeedback: (session_id: string) =>
    apiFetch(`/api/sessions/${session_id}/feedback`)
}
