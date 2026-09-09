function readApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('VITE_API_BASE_URL must be set (see .env.example)')
  }
  return value.replace(/\/$/, '')
}

export const config = {
  apiBaseUrl: readApiBaseUrl(),
}
