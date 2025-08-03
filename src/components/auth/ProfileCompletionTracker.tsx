'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ProfileCompletionStep {
  id: string
  title: string
  description: string
  completed: boolean
  href?: string
  action?: () => void
}

export function ProfileCompletionTracker() {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(true)

  if (!user) return null

  const steps: ProfileCompletionStep[] = [
    {
      id: 'email',
      title: 'Verify Email',
      description: 'Confirm your email address',
      completed: !!user.email_confirmed_at,
      href: '/auth/confirm'
    },
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add your bio and profile picture',
      completed: !!(user.full_name && user.role),
      href: '/settings/profile'
    },
    {
      id: 'bio',
      title: 'Add Bio',
      description: 'Tell others about yourself',
      completed: false, // This would check if bio exists in profile
      href: '/settings/profile'
    },
    {
      id: 'avatar',
      title: 'Upload Avatar',
      description: 'Add a profile picture',
      completed: !!user.user_metadata?.avatar_url,
      href: '/settings/profile'
    },
    {
      id: 'preferences',
      title: 'Set Preferences',
      description: 'Customize your experience',
      completed: false, // This would check if preferences are set
      href: '/settings/preferences'
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const totalSteps = steps.length
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100)

  // Don't show if profile is 100% complete
  if (completionPercentage === 100) return null

  return (
    <Card className="p-4 mb-6 border-2 border-black">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-black">Complete Your Profile</h3>
            <p className="text-sm text-gray-600">
              {completedSteps} of {totalSteps} steps completed ({completionPercentage}%)
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-black h-2 rounded-full transition-all duration-300" 
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-black text-sm">{step.title}</p>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              </div>
              
              {!step.completed && step.href && (
                <Link href={step.href}>
                  <Button variant="outline" size="sm">
                    Complete
                  </Button>
                </Link>
              )}
              
              {step.completed && (
                <div className="text-xs text-gray-500 bg-success-light px-2 py-1 rounded">
                  ✓ Done
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Complete your profile to unlock all features and build trust in the community
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}