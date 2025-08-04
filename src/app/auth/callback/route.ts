import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getProductionUrl } from '@/lib/utils/url'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback - Origin:', origin)
  console.log('Auth callback - Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL_URL: process.env.VERCEL_URL
  })
  console.log('Auth callback - Headers:', {
    host: request.headers.get('host'),
    forwardedHost: request.headers.get('x-forwarded-host'),
    forwardedProto: request.headers.get('x-forwarded-proto'),
    userAgent: request.headers.get('user-agent')
  })

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Enhanced production domain detection
      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto')
      const host = request.headers.get('host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      let redirectUrl: string

      if (isLocalEnv) {
        // Development environment
        redirectUrl = `${origin}${next}`
        console.log('Development redirect:', redirectUrl)
      } else {
        // FORCE production URL - prevent any localhost redirects
        const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mva-chi.vercel.app'
        redirectUrl = `${productionUrl}${next}`
        console.log('FORCED Production redirect:', redirectUrl)
      }

      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Auth error:', error)
    }
  } else {
    console.error('No code parameter provided')
  }

  // Enhanced error redirect
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const forwardedHost = request.headers.get('x-forwarded-host')
  const errorRedirectUrl = isLocalEnv 
    ? `${origin}/auth/auth-code-error`
    : forwardedHost 
      ? `https://${forwardedHost}/auth/auth-code-error`
      : `${origin}/auth/auth-code-error`
  
  console.log('Error redirect:', errorRedirectUrl)
  return NextResponse.redirect(errorRedirectUrl)
}