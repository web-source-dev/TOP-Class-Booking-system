interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator?: (identifier: string) => string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  private generateKey(identifier: string): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(identifier)
    }
    return `rate_limit:${identifier}`
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  async checkLimit(identifier: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    // Clean up expired entries
    this.cleanup()

    const key = this.generateKey(identifier)
    const now = Date.now()
    const windowEnd = now + this.config.windowMs

    const entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: windowEnd,
      })

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: windowEnd,
      }
    }

    if (entry.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      }
    }

    // Increment count
    entry.count++
    this.store.set(key, entry)

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  async recordRequest(identifier: string): Promise<void> {
    await this.checkLimit(identifier)
  }

  getRemaining(identifier: string): number {
    const key = this.generateKey(identifier)
    const entry = this.store.get(key)
    
    if (!entry || Date.now() > entry.resetTime) {
      return this.config.maxRequests
    }
    
    return Math.max(0, this.config.maxRequests - entry.count)
  }

  reset(identifier: string): void {
    const key = this.generateKey(identifier)
    this.store.delete(key)
  }
}

// Create rate limiter instances for different use cases
export const bookingRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 booking attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (identifier) => `booking:${identifier}`,
})

export const formSubmissionRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 form submissions
  windowMs: 5 * 60 * 1000, // 5 minutes
  keyGenerator: (identifier) => `form:${identifier}`,
})

export const photoUploadRateLimiter = new RateLimiter({
  maxRequests: 20, // 20 photo uploads
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (identifier) => `photos:${identifier}`,
})

// Utility function to get client identifier
export function getClientIdentifier(): string {
  // In a real app, you might use IP address, user ID, or session ID
  // For now, we'll use a combination of user agent and timestamp
  if (typeof window !== 'undefined') {
    return `${navigator.userAgent}:${Math.floor(Date.now() / (5 * 60 * 1000))}` // 5-minute window
  }
  return 'server-side'
}

// Utility function to validate and sanitize input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

// Utility function to validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Utility function to validate phone number
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// Utility function to validate ZIP code
export function validateZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

// Utility function to check for suspicious patterns
export function detectSuspiciousActivity(data: {
  email?: string
  phone?: string
  address?: string
  specialInstructions?: string
}): string[] {
  const warnings: string[] = []

  // Check for suspicious email patterns
  if (data.email) {
    const email = data.email.toLowerCase()
    if (email.includes('test') || email.includes('example') || email.includes('fake')) {
      warnings.push('Suspicious email pattern detected')
    }
  }

  // Check for suspicious phone patterns
  if (data.phone) {
    const phone = data.phone.replace(/\D/g, '')
    if (phone.length < 10 || phone.match(/^(\d)\1{9,}$/)) {
      warnings.push('Suspicious phone number pattern detected')
    }
  }

  // Check for suspicious text patterns
  if (data.specialInstructions) {
    const instructions = data.specialInstructions.toLowerCase()
    const suspiciousWords = ['spam', 'test', 'fake', 'bot', 'script']
    if (suspiciousWords.some(word => instructions.includes(word))) {
      warnings.push('Suspicious text content detected')
    }
  }

  return warnings
}

// Export the main RateLimiter class for custom instances
export { RateLimiter } 