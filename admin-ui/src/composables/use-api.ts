import { useB24Auth } from './use-b24-auth'

const API_BASE = '/api/admin'

export function useApi() {
  const auth = useB24Auth()

  async function fetchApi<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Member-Id': auth.memberId,
      'X-Auth-Id': auth.authId,
      'X-Domain': auth.domain,
      ...(options.headers as Record<string, string> || {})
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `HTTP ${res.status}`)
    }

    return res.json()
  }

  return { fetchApi }
}
