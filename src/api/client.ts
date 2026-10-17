function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')
  }
  // In browser, using relative '/api' works seamlessly on localhost, LAN IP, and mobile devices
  if (typeof window !== 'undefined') {
    return '/api'
  }
  return 'http://localhost:3333/api'
}

export const API_BASE_URL = getApiBaseUrl()

/**
 * Error thrown for every failed API call.
 * `status` is 0 when the server could not be reached at all (network down, CORS, server stopped).
 */
export class ApiError extends Error {
  status: number
  details: string[]

  constructor(status: number, message: string, details: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

interface ErrorBody {
  message?: string
  errors?: { message?: string }[]
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  // Only send a Content-Type when there is a body, so plain GETs stay "simple" CORS requests.
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Unable to reach the server')
  }

  if (response.status === 204) return undefined as T

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = (body ?? {}) as ErrorBody
    const details = (error.errors ?? []).map((e) => e.message).filter((m): m is string => !!m)
    throw new ApiError(response.status, error.message ?? response.statusText, details)
  }

  return body as T
}
