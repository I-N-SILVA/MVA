'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getFullUrl } from '@/lib/utils/url'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: getFullUrl('/auth/reset-password'),
      })

      if (error) throw error

      setSuccess(
        `We've sent a password reset link to ${data.email}. Please check your email and click the link to reset your password.`
      )
    } catch (error: any) {
      let errorMessage = 'An error occurred. Please try again.'
      
      if (error.message) {
        if (error.message.includes('Email not found')) {
          errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many password reset requests. Please wait a few minutes before trying again.'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.'
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black">Forgot your password?</h1>
        <p className="mt-2 text-gray-600 font-medium">
          Enter your email address and we'll send you a link to reset your password
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
              <h3 className="text-sm font-bold text-black">Email Sent!</h3>
              <div className="mt-2 text-sm text-black font-medium">{success}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter your email address"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Sending reset link...' : 'Send reset link'}
        </Button>
      </form>

      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link
            href="/auth/login"
            className="font-bold text-black hover:text-gray-700 underline"
          >
            Sign in
          </Link>
        </p>
        
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-bold text-black hover:text-gray-700 underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      {success && (
        <div className="text-xs text-gray-500 text-center">
          <p>Didn't receive the email? Check your spam folder or contact support if the problem persists.</p>
        </div>
      )}
    </div>
  )
}