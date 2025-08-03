import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication Error | Plyaz',
  description: 'There was an error with your authentication request.',
}

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-black text-white border-r-2 border-black">
          <div className="flex flex-col justify-center px-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Authentication Error</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Don't worry, these things happen. Let's get you back on track.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1 border-2 border-white/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Temporary Issue</h3>
                  <p className="text-gray-300">This is usually a temporary problem that resolves quickly</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1 border-2 border-white/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Try Again</h3>
                  <p className="text-gray-300">A fresh attempt usually works perfectly</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1 border-2 border-white/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Need Help?</h3>
                  <p className="text-gray-300">Our support team is here if you continue to have issues</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Error Message */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-light border-2 border-black mb-4">
                <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-black">Authentication Error</h1>
              <p className="mt-2 text-gray-600 font-medium">
                There was a problem with your authentication request
              </p>
            </div>

            <div className="bg-error-light border-2 border-black rounded-lg p-4" role="alert">
              <div className="text-center">
                <h3 className="text-sm font-bold text-black">What happened?</h3>
                <div className="mt-2 text-sm text-black font-medium">
                  The authentication link may have expired, been used already, or there was a network issue.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/auth/login" className="block">
                <Button className="w-full">
                  Try Signing In Again
                </Button>
              </Link>

              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full">
                  Create New Account
                </Button>
              </Link>

              <Link href="/auth/forgot-password" className="block">
                <Button variant="outline" className="w-full">
                  Reset Password
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Still having trouble?{' '}
                <Link
                  href="/"
                  className="font-bold text-black hover:text-gray-700 underline"
                >
                  Go to Homepage
                </Link>
              </p>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>
                If this problem persists, try clearing your browser cache or using a different browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}