import { EmailConfirmationStatus } from '@/components/auth/EmailConfirmationStatus'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Email Confirmation | Plyaz',
  description: 'Confirm your email address to complete your Plyaz account setup.',
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-black text-white border-r-2 border-black">
          <div className="flex flex-col justify-center px-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Almost There!</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                You're one step away from joining the Plyaz community. Let's get your email confirmed.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1 border-2 border-white/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Check Your Inbox</h3>
                  <p className="text-gray-300">Look for an email from Plyaz with your confirmation link</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1 border-2 border-white/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Check Spam Folder</h3>
                  <p className="text-gray-300">Sometimes emails end up in spam or promotions folders</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 rounded-full p-2 mt-1 border-2 border-white/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Start Scouting</h3>
                  <p className="text-gray-300">Once confirmed, dive into the world of athlete discovery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Status */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <Suspense fallback={
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-black">Loading...</h1>
                </div>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              </div>
            }>
              <EmailConfirmationStatus />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}