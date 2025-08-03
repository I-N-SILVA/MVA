/**
 * Comprehensive error handling utilities for user-friendly error messages
 */

export type ErrorType = 
  | 'network'
  | 'auth'
  | 'validation'
  | 'server'
  | 'notFound'
  | 'timeout'
  | 'permission'
  | 'unknown'

export interface UserFriendlyError {
  type: ErrorType
  title: string
  message: string
  actionable: boolean
  retryable: boolean
}

/**
 * Convert raw error messages into user-friendly error objects
 */
export function parseError(error: unknown): UserFriendlyError {
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  // Network-related errors
  if (
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('network') ||
    errorMessage.includes('offline')
  ) {
    return {
      type: 'network',
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection and try again.',
      actionable: true,
      retryable: true
    }
  }
  
  // Authentication errors
  if (
    errorMessage.includes('Invalid login credentials') ||
    errorMessage.includes('User not found') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('unauthorized')
  ) {
    return {
      type: 'auth',
      title: 'Authentication Error',
      message: 'Please check your credentials and try signing in again.',
      actionable: true,
      retryable: true
    }
  }
  
  // Email confirmation errors
  if (errorMessage.includes('Email not confirmed')) {
    return {
      type: 'auth',
      title: 'Email Not Confirmed',
      message: 'Please check your email and click the confirmation link before signing in.',
      actionable: true,
      retryable: false
    }
  }
  
  // Rate limiting errors
  if (
    errorMessage.includes('Too many requests') ||
    errorMessage.includes('Rate limit')
  ) {
    return {
      type: 'server',
      title: 'Too Many Attempts',
      message: 'Please wait a few minutes before trying again.',
      actionable: true,
      retryable: true
    }
  }
  
  // User registration errors
  if (errorMessage.includes('User already registered')) {
    return {
      type: 'validation',
      title: 'Account Already Exists',
      message: 'An account with this email already exists. Please sign in instead.',
      actionable: true,
      retryable: false
    }
  }
  
  // Validation errors
  if (
    errorMessage.includes('invalid') ||
    errorMessage.includes('validation') ||
    errorMessage.includes('required')
  ) {
    return {
      type: 'validation',
      title: 'Invalid Information',
      message: errorMessage,
      actionable: true,
      retryable: false
    }
  }
  
  // Permission errors
  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('access denied') ||
    errorMessage.includes('forbidden')
  ) {
    return {
      type: 'permission',
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action. Please sign in and try again.',
      actionable: true,
      retryable: false
    }
  }
  
  // Not found errors
  if (
    errorMessage.includes('not found') ||
    errorMessage.includes('No rows returned') ||
    errorMessage.includes('404')
  ) {
    return {
      type: 'notFound',
      title: 'Not Found',
      message: 'The requested information could not be found. It may have been removed or is no longer available.',
      actionable: false,
      retryable: false
    }
  }
  
  // Timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('took too long')
  ) {
    return {
      type: 'timeout',
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      actionable: true,
      retryable: true
    }
  }
  
  // Server errors
  if (
    errorMessage.includes('server') ||
    errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503')
  ) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again in a few moments.',
      actionable: true,
      retryable: true
    }
  }
  
  // Default unknown error
  return {
    type: 'unknown',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    actionable: true,
    retryable: true
  }
}

/**
 * Get appropriate user actions based on error type
 */
export function getErrorActions(error: UserFriendlyError): Array<{
  label: string
  action: 'retry' | 'refresh' | 'signin' | 'contact' | 'navigate'
  href?: string
}> {
  const actions: Array<{
    label: string
    action: 'retry' | 'refresh' | 'signin' | 'contact' | 'navigate'
    href?: string
  }> = []
  
  if (error.retryable) {
    actions.push({ label: 'Try Again', action: 'retry' })
  }
  
  if (error.type === 'auth') {
    actions.push({ label: 'Sign In', action: 'signin', href: '/auth/login' })
  }
  
  if (error.type === 'network') {
    actions.push({ label: 'Refresh Page', action: 'refresh' })
  }
  
  if (error.type === 'notFound') {
    actions.push({ label: 'Go Home', action: 'navigate', href: '/' })
  }
  
  if (error.type === 'unknown' || error.type === 'server') {
    actions.push({ label: 'Contact Support', action: 'contact', href: '/contact' })
  }
  
  return actions
}

/**
 * Format error for logging while preserving user privacy
 */
export function formatErrorForLogging(error: unknown, context?: string): {
  message: string
  context?: string
  timestamp: string
  userAgent?: string
} {
  return {
    message: error instanceof Error ? error.message : String(error),
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
  }
}

/**
 * Check if an error is recoverable through user action
 */
export function isRecoverableError(error: UserFriendlyError): boolean {
  return error.actionable && (error.retryable || error.type === 'validation')
}