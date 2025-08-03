'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EmailConfirmationStatus() {
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'error' | 'pending'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkConfirmationStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('error')
          setError('Unable to check confirmation status. Please try again.')
          return
        }

        if (session?.user) {
          if (session.user.email_confirmed_at) {
            setStatus('confirmed')
            setSuccess('Your email has been confirmed successfully!')
            // Redirect after 3 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 3000)
          } else {
            setStatus('pending')
            setEmail(session.user.email || '')
          }
        } else {
          setStatus('pending')
        }
      } catch (err) {
        console.error('Error checking confirmation status:', err)
        setStatus('error')
        setError('An unexpected error occurred. Please try again.')
      }
    }

    checkConfirmationStatus()

    // Listen for auth state changes (when user clicks confirmation link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          setStatus('confirmed')
          setSuccess('Your email has been confirmed successfully!')
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const resendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsResending(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setSuccess('A new confirmation email has been sent. Please check your inbox.')
    } catch (error: any) {
      let errorMessage = 'Failed to resend confirmation email. Please try again.'
      
      if (error.message) {
        if (error.message.includes('Email not found')) {
          errorMessage = 'No account found with this email address.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please wait a few minutes before trying again.'
        } else if (error.message.includes('Email already confirmed')) {
          errorMessage = 'Your email is already confirmed. You can now sign in.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black">Checking confirmation status...</h1>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  if (status === 'confirmed') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-light border-2 border-black mb-4">
            <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black">Email Confirmed!</h1>
          <p className="mt-2 text-gray-600 font-medium">
            Welcome to Plyaz! Your account is now active.
          </p>
        </div>

        {success && (
          <div className="bg-success-light border-2 border-black rounded-lg p-4" role="alert">
            <div className="text-center">
              <h3 className="text-sm font-bold text-black">Success</h3>
              <div className="mt-2 text-sm text-black font-medium">{success}</div>
              <div className="mt-1 text-xs text-black">Redirecting you to your dashboard...</div>
            </div>
          </div>
        )}

        <div className="text-center">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-light border-2 border-black mb-4">
            <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black">Confirmation Error</h1>
          <p className="mt-2 text-gray-600 font-medium">
            There was an issue confirming your email
          </p>
        </div>

        {error && (
          <div className="bg-error-light border-2 border-black rounded-lg p-4" role="alert">
            <div className="text-center">
              <h3 className="text-sm font-bold text-black">Error</h3>
              <div className="mt-2 text-sm text-black font-medium">{error}</div>
            </div>
          </div>
        )}

        <div className="text-center space-y-4">
          <Button
            onClick={() => setStatus('pending')}
            className="w-full"
          >
            Try Again
          </Button>
          
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link
              href="/auth/signup"
              className="font-bold text-black hover:text-gray-700 underline"
            >
              Create a new account
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // status === 'pending'
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 border-2 border-black mb-4">
          <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-black">Check Your Email</h1>
        <p className="mt-2 text-gray-600 font-medium">
          We've sent a confirmation link to your email address
        </p>
      </div>

      {error && (
        <div className="bg-error-light border-2 border-black rounded-lg p-4" role="alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-bold text-black">Error</h3>
              <div className="mt-2 text-sm text-black font-medium">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-success-light border-2 border-black rounded-lg p-4" role="alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-bold text-black">Email Sent</h3>
              <div className="mt-2 text-sm text-black font-medium">{success}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="text-center text-sm text-gray-600">
          <p>Didn't receive the email? Enter your email address to resend it.</p>
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />
        </div>

        <Button
          onClick={resendConfirmation}
          disabled={isResending || !email}
          className="w-full"
        >
          {isResending ? 'Sending...' : 'Resend confirmation email'}
        </Button>
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Already confirmed?{' '}
          <Link
            href="/auth/login"
            className="font-bold text-black hover:text-gray-700 underline"
          >
            Sign in
          </Link>
        </p>
        
        <p className="text-sm text-gray-600">
          Wrong email address?{' '}
          <Link
            href="/auth/signup"
            className="font-bold text-black hover:text-gray-700 underline"
          >
            Create a new account
          </Link>
        </p>

        <div className="text-xs text-gray-500">
          <p>Check your spam or promotions folder if you don't see the email in your inbox.</p>
        </div>
      </div>
    </div>
  )
}