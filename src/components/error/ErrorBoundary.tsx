'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle, Home } from 'lucide-react'
import { parseError, getErrorActions } from '@/lib/utils/error-handling'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const parsedError = parseError(this.state.error)
      const actions = getErrorActions(parsedError)

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border-2 border-black p-8 max-w-md w-full shadow-plyaz">
            <div className="text-center">
              <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 border-2 border-red-200">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-black mb-2">
                {parsedError.title}
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {parsedError.message}
              </p>
              
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => {
                      switch (action.action) {
                        case 'retry':
                          this.setState({ hasError: false, error: null })
                          break
                        case 'refresh':
                          window.location.reload()
                          break
                        case 'signin':
                        case 'navigate':
                          if (action.href) {
                            window.location.href = action.href
                          }
                          break
                        case 'contact':
                          if (action.href) {
                            window.location.href = action.href
                          }
                          break
                      }
                    }}
                  >
                    {action.action === 'retry' && <RefreshCw className="h-4 w-4 mr-2" />}
                    {action.action === 'navigate' && <Home className="h-4 w-4 mr-2" />}
                    {action.label}
                  </Button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  If this problem persists, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Simple error display component for non-boundary errors
interface ErrorDisplayProps {
  error: unknown
  onRetry?: () => void
  onClear?: () => void
  className?: string
}

export function ErrorDisplay({ error, onRetry, onClear, className = '' }: ErrorDisplayProps) {
  const parsedError = parseError(error)
  
  return (
    <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-6 shadow-plyaz-sm ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-100 rounded-lg border border-red-200">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-red-800 text-lg mb-2">
            {parsedError.title}
          </h3>
          <p className="text-sm text-red-700 mb-4 leading-relaxed">
            {parsedError.message}
          </p>
          <div className="flex items-center gap-3">
            {parsedError.retryable && onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {onClear && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClear}
                className="text-red-600 hover:bg-red-50"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}