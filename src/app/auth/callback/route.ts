import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getProductionUrl } from '@/lib/utils/url'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback - Origin:', origin)
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
      } else if (forwardedHost) {
        // Production with load balancer (Vercel)
        const protocol = forwardedProto || 'https'
        redirectUrl = `${protocol}://${forwardedHost}${next}`
        console.log('Production redirect (forwarded):', redirectUrl)
      } else if (host && !host.includes('localhost')) {
        // Production fallback using host header
        redirectUrl = `https://${host}${next}`
        console.log('Production redirect (host):', redirectUrl)
      } else {
        // Ultimate fallback - use environment variable if available
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        if (appUrl && !appUrl.includes('localhost')) {
          redirectUrl = `${appUrl}${next}`
          console.log('Production redirect (env):', redirectUrl)
        } else {
          // Last resort - use origin but ensure it's not localhost in production
          redirectUrl = origin.includes('localhost') && !isLocalEnv 
            ? `${getProductionUrl()}${next}` 
            : `${origin}${next}`
          console.log('Fallback redirect:', redirectUrl)
        }
      }

      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Auth error:', error)
    }
  } else {
    console.error('No code parameter provided')
  }

  // Enhanced error redirect
  const errorRedirectUrl = isLocalEnv 
    ? `${origin}/auth/auth-code-error`
    : forwardedHost 
      ? `https://${forwardedHost}/auth/auth-code-error`
      : `${origin}/auth/auth-code-error`
  
  console.log('Error redirect:', errorRedirectUrl)
  return NextResponse.redirect(errorRedirectUrl)
}