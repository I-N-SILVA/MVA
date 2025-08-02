/**
 * Utility functions for handling URLs across different environments
 */

/**
 * Get the production app URL from environment variables or fallback
 */
export const getProductionUrl = (): string => {
  // Try environment variable first
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl
  }
  
  // Fallback to default production URL
  return 'https://plyaz-mvp.vercel.app'
}

/**
 * Get the appropriate base URL for the current environment
 */
export const getBaseUrl = (): string => {
  // Server-side
  if (typeof window === 'undefined') {
    const isProduction = process.env.NODE_ENV === 'production'
    return isProduction ? getProductionUrl() : 'http://localhost:3000'
  }
  
  // Client-side
  const currentOrigin = window.location.origin
  const isProduction = process.env.NODE_ENV === 'production'
  
  // If we're in production but somehow on localhost, use production URL
  if (isProduction && currentOrigin.includes('localhost')) {
    return getProductionUrl()
  }
  
  return currentOrigin
}

/**
 * Generate auth callback URL for the current environment
 */
export const getAuthCallbackUrl = (): string => {
  return `${getBaseUrl()}/auth/callback`
}

/**
 * Generate a full URL for a given path
 */
export const getFullUrl = (path: string): string => {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Check if we're currently in a production environment
 */
export const isProductionEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if current URL is localhost (client-side only)
 */
export const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}