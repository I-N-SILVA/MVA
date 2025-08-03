'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Check if user has a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          setIsValidSession(false)
          return
        }

        // Check if this is from a password reset flow
        // In Supabase, password reset sessions have specific properties
        setIsValidSession(true)
      } catch (error) {
        console.error('Error checking session:', error)
        setIsValidSession(false)
      }
    }

    checkSession()
  }, [])

  const onSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) throw error

      setSuccess('Your password has been updated successfully!')
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login?message=Password updated successfully')
      }, 2000)
    } catch (error: any) {
      let errorMessage = 'An error occurred while updating your password. Please try again.'
      
      if (error.message) {
        if (error.message.includes('New password should be different')) {
          errorMessage = 'Please choose a different password from your current one.'
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'Password must be at least 6 characters long.'
        } else if (error.message.includes('Invalid token') || error.message.includes('expired')) {
          errorMessage = 'This password reset link has expired. Please request a new one.'
        } else if (error.message.includes('Not authenticated')) {
          errorMessage = 'This password reset link is invalid. Please request a new one.'
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black">Reset Password</h1>
          <p className="mt-2 text-gray-600 font-medium">
            Verifying your reset link...
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  // Show error if invalid session
  if (isValidSession === false) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black">Invalid Reset Link</h1>
          <p className="mt-2 text-gray-600 font-medium">
            This password reset link is invalid or has expired
          </p>
        </div>

        <div className="bg-error-light border-2 border-black rounded-lg p-4" role="alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-bold text-black">Link Expired</h3>
              <div className="mt-2 text-sm text-black font-medium">
                Password reset links expire for security reasons. Please request a new one.
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Button
            onClick={() => router.push('/auth/forgot-password')}
            className="w-full"
          >
            Request New Reset Link
          </Button>
          
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              href="/auth/login"
              className="font-bold text-black hover:text-gray-700 underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black">Create new password</h1>
        <p className="mt-2 text-gray-600 font-medium">
          Enter your new password below
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
            <div className="ml-3">
              <h3 className="text-sm font-bold text-black">Success!</h3>
              <div className="mt-2 text-sm text-black font-medium">{success}</div>
              <div className="mt-1 text-xs text-black">Redirecting you to sign in...</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Enter your new password"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder="Confirm your new password"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || success !== null}
        >
          {isLoading ? 'Updating password...' : 'Update password'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link
            href="/auth/login"
            className="font-bold text-black hover:text-gray-700 underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>Make sure to choose a strong password with at least 6 characters.</p>
      </div>
    </div>
  )
}