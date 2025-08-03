import { AuthForm } from '@/components/auth/AuthForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Plyaz',
  description: 'Join Plyaz and start your journey as a scout.',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left side - Auth Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <AuthForm mode="signup" />
          </div>
        </div>

        {/* Right side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-black text-white border-l-2 border-black">
          <div className="flex flex-col justify-center px-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Join the Plyaz Community</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Become part of the world's first decentralized scouting network. Every fan has the power to discover the next superstar.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/10 rounded-lg p-6 border-2 border-white/20">
                <h3 className="font-bold mb-2 text-lg">For Scouts</h3>
                <p className="text-gray-300">
                  Submit athletes, build your reputation, and earn rewards for successful discoveries.
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 border-2 border-white/20">
                <h3 className="font-bold mb-2 text-lg">For Fans</h3>
                <p className="text-gray-300">
                  Vote on submissions, support athletes, and be part of their journey to success.
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 border-2 border-white/20">
                <h3 className="font-bold mb-2 text-lg">For Everyone</h3>
                <p className="text-gray-300">
                  Invest in approved athletes and share in their future earnings and achievements.
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/10 rounded-lg border-2 border-white/20">
              <p className="text-sm text-gray-300">
                🚀 <strong>Early Access:</strong> Join now and get priority access to exclusive athlete investments and premium scouting features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}