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

const magicLinkSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type MagicLinkData = z.infer<typeof magicLinkSchema>

export function MagicLinkForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkData>({
    resolver: zodResolver(magicLinkSchema),
  })

  const onSubmit = async (data: MagicLinkData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: getFullUrl('/dashboard'),
        },
      })

      if (error) throw error

      setSuccess(
        `✨ Magic link sent to ${data.email}! Check your email and click the link to sign in instantly.`
      )
    } catch (error: any) {
      let errorMessage = 'Failed to send magic link. Please try again.'
      
      if (error.message) {
        if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many magic link requests. Please wait a few minutes before trying again.'
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address first before using magic link login.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resendMagicLink = async () => {
    const emailField = document.getElementById('email') as HTMLInputElement
    if (emailField?.value) {
      await onSubmit({ email: emailField.value })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-black border-2 border-black mb-4">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-black">Magic Link Login</h1>
        <p className="mt-2 text-gray-600 font-medium">
          Enter your email to receive a secure login link
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
              <h3 className="text-sm font-bold text-black">Magic Link Sent!</h3>
              <div className="mt-2 text-sm text-black font-medium">{success}</div>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resendMagicLink}
                  disabled={isLoading}
                >
                  Resend magic link
                </Button>
              </div>
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
          {isLoading ? 'Sending magic link...' : '✨ Send magic link'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-600 font-medium">Or sign in with</span>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/auth/login" className="block">
          <Button
            type="button"
            variant="outline"
            className="w-full"
          >
            Email & Password
          </Button>
        </Link>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: getFullUrl('/dashboard'),
              },
            })
            if (error) setError(error.message)
          }}
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
          Sign in with Google
        </Button>
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-bold text-black hover:text-gray-700 underline"
          >
            Sign up
          </Link>
        </p>

        <p className="text-sm text-gray-600">
          Need help?{' '}
          <Link
            href="/auth/forgot-password"
            className="font-bold text-black hover:text-gray-700 underline"
          >
            Reset password
          </Link>
        </p>
      </div>

      {success && (
        <div className="text-xs text-gray-500 text-center space-y-2">
          <p>The magic link will expire in 1 hour for security.</p>
          <p>Check your spam folder if you don't see the email.</p>
        </div>
      )}
    </div>
  )
}