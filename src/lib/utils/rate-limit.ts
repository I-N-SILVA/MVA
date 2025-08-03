/**
 * Simple rate limiting utility for client-side authentication attempts
 * This provides basic protection against brute force attacks
 */

interface RateLimitEntry {
  attempts: number
  lastAttempt: number
  blockedUntil?: number
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number
  private readonly blockDurationMs: number

  constructor(
    maxAttempts: number = 5, // Max attempts before blocking
    windowMs: number = 15 * 60 * 1000, // 15 minutes window
    blockDurationMs: number = 30 * 60 * 1000 // 30 minutes block duration
  ) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.blockDurationMs = blockDurationMs
  }

  /**
   * Check if an IP/identifier is rate limited
   */
  isBlocked(identifier: string): boolean {
    const entry = this.attempts.get(identifier)
    if (!entry) return false

    const now = Date.now()

    // Check if still blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return true
    }

    // Reset if block period expired
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      this.attempts.delete(identifier)
      return false
    }

    // Reset if window expired
    if (now - entry.lastAttempt > this.windowMs) {
      this.attempts.delete(identifier)
      return false
    }

    return false
  }

  /**
   * Record a failed attempt
   */
  recordFailedAttempt(identifier: string): {
    blocked: boolean
    remainingAttempts: number
    blockDurationMinutes?: number
  } {
    const now = Date.now()
    let entry = this.attempts.get(identifier)

    if (!entry) {
      entry = { attempts: 0, lastAttempt: now }
    }

    // Reset if window expired
    if (now - entry.lastAttempt > this.windowMs) {
      entry = { attempts: 0, lastAttempt: now }
    }

    entry.attempts += 1
    entry.lastAttempt = now

    // Block if max attempts reached
    if (entry.attempts >= this.maxAttempts) {
      entry.blockedUntil = now + this.blockDurationMs
      this.attempts.set(identifier, entry)
      
      return {
        blocked: true,
        remainingAttempts: 0,
        blockDurationMinutes: Math.ceil(this.blockDurationMs / (60 * 1000))
      }
    }

    this.attempts.set(identifier, entry)
    
    return {
      blocked: false,
      remainingAttempts: this.maxAttempts - entry.attempts
    }
  }

  /**
   * Record a successful attempt (clears the record)
   */
  recordSuccessfulAttempt(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * Get current status for an identifier
   */
  getStatus(identifier: string): {
    attempts: number
    blocked: boolean
    remainingAttempts: number
    minutesUntilUnblock?: number
  } {
    const entry = this.attempts.get(identifier)
    if (!entry) {
      return {
        attempts: 0,
        blocked: false,
        remainingAttempts: this.maxAttempts
      }
    }

    const now = Date.now()
    const blocked = this.isBlocked(identifier)
    
    return {
      attempts: entry.attempts,
      blocked,
      remainingAttempts: Math.max(0, this.maxAttempts - entry.attempts),
      minutesUntilUnblock: entry.blockedUntil 
        ? Math.ceil((entry.blockedUntil - now) / (60 * 1000))
        : undefined
    }
  }

  /**
   * Clear all rate limit records (for testing/admin purposes)
   */
  clear(): void {
    this.attempts.clear()
  }
}

// Create singleton instance
export const authRateLimiter = new RateLimiter()

/**
 * Get client identifier for rate limiting
 * Uses a combination of factors to create a unique identifier
 */
export function getClientIdentifier(): string {
  if (typeof window === 'undefined') return 'server'
  
  // Create identifier from available browser info
  const factors = [
    window.location.hostname,
    navigator.userAgent.slice(0, 50), // First 50 chars to avoid too much detail
    navigator.language,
    screen.width + 'x' + screen.height,
  ]
  
  // Simple hash function to create shorter identifier
  const hashCode = factors.join('|').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a // Convert to 32-bit integer
  }, 0)
  
  return `client_${Math.abs(hashCode)}`
}

/**
 * Hook for using rate limiting in components
 */
export function useRateLimit() {
  const identifier = getClientIdentifier()
  
  return {
    identifier,
    isBlocked: () => authRateLimiter.isBlocked(identifier),
    recordFailedAttempt: () => authRateLimiter.recordFailedAttempt(identifier),
    recordSuccessfulAttempt: () => authRateLimiter.recordSuccessfulAttempt(identifier),
    getStatus: () => authRateLimiter.getStatus(identifier),
  }
}