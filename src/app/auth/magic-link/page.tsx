import { MagicLinkForm } from '@/components/auth/MagicLinkForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Magic Link Login | Plyaz',
  description: 'Sign in to Plyaz with a secure magic link sent to your email.',
}

export default function MagicLinkPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-black text-white border-r-2 border-black">
          <div className="flex flex-col justify-center px-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Passwordless Login</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                The future of secure authentication. No passwords to remember, just click and you're in.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1 border-2 border-white/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Ultra Secure</h3>
                  <p className="text-gray-300">No passwords to steal or crack - just secure email verification</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1 border-2 border-white/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Super Simple</h3>
                  <p className="text-gray-300">Just enter your email - we'll send you a secure login link</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1 border-2 border-white/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Lightning Fast</h3>
                  <p className="text-gray-300">Get logged in instantly - no typing passwords on mobile</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/10 rounded-lg border-2 border-white/20">
              <p className="text-sm text-gray-300">
                ✨ <strong>Pro Tip:</strong> Bookmark this page on mobile for instant one-tap login to your Plyaz account.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <MagicLinkForm />
          </div>
        </div>
      </div>
    </div>
  )
}