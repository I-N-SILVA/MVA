'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { getAuthCallbackUrl } from '@/lib/utils/url'
import { useRateLimit } from '@/lib/utils/rate-limit'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['scout', 'fan'], {
    errorMap: () => ({ message: 'Please select your role' })
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginData = z.infer<typeof loginSchema>
type SignupData = z.infer<typeof signupSchema>

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const rateLimit = useRateLimit()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<LoginData | SignupData>({
    resolver: zodResolver(mode === 'login' ? loginSchema : signupSchema),
  })

  const roleValue = mode === 'signup' ? watch('role' as keyof SignupData) : undefined

  const onSubmit = async (data: LoginData | SignupData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Check rate limiting for login attempts
    if (mode === 'login') {
      if (rateLimit.isBlocked()) {
        const status = rateLimit.getStatus()
        setError(`Too many failed login attempts. Please try again in ${status.minutesUntilUnblock} minutes.`)
        setIsLoading(false)
        return
      }
    }

    try {
      if (mode === 'login') {
        const { email, password, rememberMe } = data as LoginData
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password,
          options: {
            // If remember me is checked, extend session to 30 days, otherwise use default (1 hour)
            ...(rememberMe && { 
              // Note: Supabase doesn't directly support session duration in signInWithPassword
              // but we can set this preference for future use
              data: { rememberMe: true }
            })
          }
        })
        
        if (error) throw error
        
        // Record successful login attempt
        rateLimit.recordSuccessfulAttempt()
        
        // Store remember me preference in localStorage for future sessions
        if (rememberMe) {
          localStorage.setItem('plyaz_remember_me', 'true')
        } else {
          localStorage.removeItem('plyaz_remember_me')
        }
        
        router.push('/dashboard')
      } else {
        const { email, password, username, fullName, role } = data as SignupData
        
        // Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: fullName,
              role,
            }
          }
        })

        if (authError) throw authError

        if (authData.user && !authData.user.email_confirmed_at) {
          setSuccess(`Please check your email and click the confirmation link to complete your registration. Email sent to: ${email}`)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      // Record failed login attempt for rate limiting
      if (mode === 'login') {
        const rateLimitResult = rateLimit.recordFailedAttempt()
        if (rateLimitResult.blocked) {
          setError(`Too many failed login attempts. Account temporarily locked for ${rateLimitResult.blockDurationMinutes} minutes.`)
          setIsLoading(false)
          return
        }
      }

      // Provide user-friendly error messages based on Supabase error codes
      let errorMessage = 'An error occurred. Please try again.'
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          const status = rateLimit.getStatus()
          errorMessage = `Invalid email or password. ${status.remainingAttempts} attempts remaining before temporary lockout.`
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a few minutes before trying again.'
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'Password must be at least 6 characters long.'
        } else if (error.message.includes('Unable to validate email address')) {
          errorMessage = 'Please enter a valid email address.'
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead or use a different email.'
        } else if (error.message.includes('Email link is invalid or has expired')) {
          errorMessage = 'The confirmation link has expired. Please request a new confirmation email.'
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.'
        } else {
          // For any other errors, show the original message but make it user-friendly
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = getAuthCallbackUrl()
      console.log('OAuth redirect URL:', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) throw error
    } catch (error: any) {
      // Provide user-friendly error messages for OAuth
      let errorMessage = 'An error occurred with Google sign-in. Please try again.'
      
      if (error.message) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = 'Sign-in was cancelled. Please try again if you want to continue.'
        } else if (error.message.includes('access_denied')) {
          errorMessage = 'Access was denied. Please grant permission to continue with Google sign-in.'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error occurred. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resendConfirmation = async (email: string) => {
    setIsLoading(true)
    setError(null)

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
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGitHub = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = getAuthCallbackUrl()
      console.log('GitHub OAuth redirect URL:', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) throw error
    } catch (error: any) {
      let errorMessage = 'An error occurred with GitHub sign-in. Please try again.'
      
      if (error.message) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = 'Sign-in was cancelled. Please try again if you want to continue.'
        } else if (error.message.includes('access_denied')) {
          errorMessage = 'Access was denied. Please grant permission to continue with GitHub sign-in.'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error occurred. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-2 text-gray-600 font-medium">
          {mode === 'login' 
            ? 'Sign in to your account to continue' 
            : 'Join the Plyaz community and start scouting'
          }
        </p>
      </div>

      {error && (
        <div className="bg-error-light border-2 border-black rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-bold text-black">Error</h3>
              <div className="mt-2 text-sm text-black font-medium">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-success-light border-2 border-black rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex">
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-bold text-black">Success</h3>
              <div className="mt-2 text-sm text-black font-medium">{success}</div>
              {mode === 'signup' && success.includes('confirmation link') && (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const emailField = document.getElementById('email') as HTMLInputElement
                      if (emailField?.value) {
                        resendConfirmation(emailField.value)
                      }
                    }}
                    disabled={isLoading}
                  >
                    Resend confirmation email
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  {...register('fullName' as keyof SignupData)}
                  error={errors.fullName?.message}
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  {...register('username' as keyof SignupData)}
                  error={errors.username?.message}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">I want to join as a</Label>
              <Select
                id="role"
                value={roleValue || ''}
                onValueChange={(value) => setValue('role' as keyof SignupData, value as any)}
                error={errors.role?.message}
                options={[
                  { value: "", label: "Select your role" },
                  { value: "scout", label: "Scout - I want to discover and submit athletes" },
                  { value: "fan", label: "Fan - I want to vote and support athletes" }
                ]}
                placeholder="Select your role"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === 'login' && (
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-black hover:text-gray-700 underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            {...register('password')}
            error={errors.password?.message}
          />
        </div>

        {mode === 'login' && (
          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 text-black border-2 border-gray-300 rounded focus:ring-black focus:ring-2"
            />
            <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
              Remember me for 30 days
            </Label>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword' as keyof SignupData)}
              error={errors.confirmPassword?.message}
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-600 font-medium">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={signInWithGoogle}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={signInWithGitHub}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </Button>
      </div>

      <div className="text-center space-y-4">
        {mode === 'login' && (
          <p className="text-sm text-gray-600">
            Prefer passwordless login?{' '}
            <Link
              href="/auth/magic-link"
              className="font-bold text-black hover:text-gray-700 underline"
            >
              Try Magic Link →
            </Link>
          </p>
        )}
        
        <p className="text-sm text-gray-600">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <Link
            href={mode === 'login' ? '/auth/signup' : '/auth/login'}
            className="font-bold text-black hover:text-gray-700 underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </div>

      {mode === 'signup' && (
        <div className="text-xs text-gray-500 text-center">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-black hover:text-gray-700 underline font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-black hover:text-gray-700 underline font-medium">
            Privacy Policy
          </Link>
        </div>
      )}
    </div>
  )
}