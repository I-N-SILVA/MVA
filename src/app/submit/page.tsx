'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AthleteSubmissionForm from '@/components/forms/AthleteSubmissionForm'
import { Button } from '@/components/ui/button'

interface SubmissionState {
  status: 'idle' | 'success' | 'error'
  submissionId?: string
  error?: string
}

export default function SubmitPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: 'idle'
  })

  const handleSubmitSuccess = (submissionId: string) => {
    setSubmissionState({
      status: 'success',
      submissionId
    })
  }

  const handleSubmitError = (error: string) => {
    setSubmissionState({
      status: 'error',
      error
    })
  }

  const handleStartOver = () => {
    setSubmissionState({ status: 'idle' })
  }

  const handleViewSubmission = () => {
    if (submissionState.submissionId) {
      router.push(`/submissions/${submissionState.submissionId}`)
    }
  }

  const handleSignIn = () => {
    router.push('/auth/signin?redirect=/submit')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to submit athlete profiles. Please sign in or create an account to continue.
          </p>
          <div className="space-y-3">
            <Button onClick={handleSignIn} className="w-full">
              Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth/signup?redirect=/submit')}
              className="w-full"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (submissionState.status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Submission Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your athlete submission has been received and is now under review by our community of scouts. 
            You'll receive updates on the voting progress.
          </p>
          <div className="space-y-3">
            <Button onClick={handleViewSubmission} className="w-full">
              View Submission
            </Button>
            <Button variant="outline" onClick={handleStartOver} className="w-full">
              Submit Another Athlete
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (submissionState.status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Submission Failed
          </h1>
          <p className="text-gray-600 mb-2">
            There was an error submitting your athlete profile:
          </p>
          <p className="text-red-600 text-sm mb-6 bg-red-50 p-3 rounded">
            {submissionState.error}
          </p>
          <div className="space-y-3">
            <Button onClick={handleStartOver} className="w-full">
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/contact')}
              className="w-full"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Role-based access control
  if (user?.role && !['scout', 'fan'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 mb-6">
            Only scouts and fans can submit athlete profiles for community voting. 
            If you're an athlete looking to get discovered, please reach out to our scouts directly.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/athletes')}
              className="w-full"
            >
              Browse Athletes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/contact')}
              className="w-full"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Submit New Athlete
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the next sports superstar! Submit an athlete profile for community review and voting. 
            If approved, they'll be added to our investment platform.
          </p>
        </div>

        {/* User Info */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Submitting as:</strong> {user?.email}
                  {user?.role && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <AthleteSubmissionForm
          onSubmitSuccess={handleSubmitSuccess}
          onSubmitError={handleSubmitError}
        />

        {/* Guidelines */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Submission Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Quality Standards</h4>
                <ul className="space-y-1">
                  <li>• Provide accurate, verifiable information</li>
                  <li>• Include compelling achievements and statistics</li>
                  <li>• Write clear, engaging stories</li>
                  <li>• Upload high-quality media files</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Review Process</h4>
                <ul className="space-y-1">
                  <li>• Community voting period: 7 days</li>
                  <li>• Scouts review and vote on submissions</li>
                  <li>• 70% approval rate needed for acceptance</li>
                  <li>• Approved athletes join the platform</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}