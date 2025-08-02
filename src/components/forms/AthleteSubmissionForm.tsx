import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Plus, X, Save, Send } from 'lucide-react'
import { athleteSubmissionSchema, AthleteSubmissionData } from '@/lib/validations/athlete'
import { useSubmissionStore } from '@/stores/submissionStore'
import { supabase } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import FileUpload, { UploadedFile } from '@/components/ui/FileUpload'
import { cn } from '@/lib/utils'

interface AthleteSubmissionFormProps {
  onSubmitSuccess?: (submissionId: string) => void
  onSubmitError?: (error: string) => void
}

const SPORTS_OPTIONS = [
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'golf', label: 'Golf' },
  { value: 'cricket', label: 'Cricket' },
  { value: 'rugby', label: 'Rugby' },
  { value: 'athletics', label: 'Athletics' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'boxing', label: 'Boxing' },
  { value: 'other', label: 'Other' }
]

const COMPETITION_LEVELS = [
  { value: 'amateur', label: 'Amateur' },
  { value: 'semi_pro', label: 'Semi-Professional' },
  { value: 'professional', label: 'Professional' }
]

const FORM_STEPS = [
  { title: 'Basic Information', description: 'Tell us about the athlete' },
  { title: 'Performance & Achievements', description: 'Showcase their accomplishments' },
  { title: 'Story & Goals', description: 'Share their journey and aspirations' },
  { title: 'Media & Documents', description: 'Upload supporting files' },
  { title: 'Contact & Social', description: 'How to reach them' },
  { title: 'Review & Submit', description: 'Final review before submission' }
]

const AthleteSubmissionForm: React.FC<AthleteSubmissionFormProps> = ({
  onSubmitSuccess,
  onSubmitError
}) => {
  const {
    formData,
    profileImage,
    videos,
    documents,
    currentStep,
    isSubmitting,
    isDraft,
    lastSaved,
    errors: storeErrors,
    submitError,
    updateFormData,
    setProfileImage,
    setVideos,
    setDocuments,
    setCurrentStep,
    setError,
    clearError,
    clearAllErrors,
    setSubmitError,
    saveDraft,
    setSubmitting,
    reset
  } = useSubmissionStore()

  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout>()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<AthleteSubmissionData>({
    resolver: zodResolver(athleteSubmissionSchema),
    defaultValues: formData,
    mode: 'onBlur'
  })

  const { fields: achievementFields, append: addAchievement, remove: removeAchievement } = useFieldArray({
    control,
    name: 'achievements'
  })

  const watchedData = watch()

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    const timer = setTimeout(() => {
      updateFormData(watchedData)
      saveDraft()
    }, 2000) // Auto-save after 2 seconds of inactivity

    setAutoSaveTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [watchedData, updateFormData, saveDraft])

  // Load form data from store
  useEffect(() => {
    Object.entries(formData).forEach(([key, value]) => {
      setValue(key as keyof AthleteSubmissionData, value)
    })
  }, [formData, setValue])

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep()
    if (isStepValid && currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof AthleteSubmissionData)[] = []

    switch (currentStep) {
      case 0: // Basic Information
        fieldsToValidate = ['athleteName', 'sport', 'age', 'location']
        break
      case 1: // Performance & Achievements
        fieldsToValidate = ['competitionLevel']
        break
      case 2: // Story & Goals
        fieldsToValidate = ['backgroundStory', 'whyInvest', 'futureGoals']
        break
      case 3: // Media & Documents
        // File validation handled separately
        return true
      case 4: // Contact & Social
        fieldsToValidate = ['contactEmail']
        break
      case 5: // Review & Submit
        // Full form validation
        return await trigger()
    }

    return await trigger(fieldsToValidate)
  }

  const handleSubmit = async (data: AthleteSubmissionData) => {
    try {
      setSubmitting(true)
      clearAllErrors()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('You must be logged in to submit')
      }

      // Prepare submission data
      const submissionData = {
        submitter_id: user.id,
        athlete_name: data.athleteName,
        sport: data.sport,
        position: data.position || null,
        age: data.age,
        location: data.location,
        achievements: data.achievements || [],
        stats: data.statistics || {},
        competition_level: data.competitionLevel,
        background_story: data.backgroundStory,
        why_invest: data.whyInvest,
        future_goals: data.futureGoals,
        contact_email: data.contactEmail || null,
        social_links: data.socialMedia || {},
        profile_image_url: profileImage?.url || null,
        video_urls: videos.filter(v => v.url).map(v => v.url!),
        document_urls: documents.filter(d => d.url).map(d => d.url!),
        status: 'pending' as const,
        votes_for: 0,
        votes_against: 0,
        total_votes: 0,
        voting_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        submission_data: data
      }

      // Insert submission
      const { data: submission, error: insertError } = await supabase
        .from('submissions')
        .insert(submissionData)
        .select('id')
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Clear draft and reset form
      reset()
      onSubmitSuccess?.(submission.id)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit'
      setSubmitError(errorMessage)
      onSubmitError?.(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="athleteName" required>Athlete Name</Label>
              <Input
                id="athleteName"
                {...register('athleteName')}
                error={errors.athleteName?.message}
                placeholder="Enter the athlete's full name"
              />
            </div>

            <div>
              <Label htmlFor="sport" required>Sport</Label>
              <Select
                options={SPORTS_OPTIONS}
                value={watchedData.sport}
                onValueChange={(value) => setValue('sport', value)}
                placeholder="Select a sport"
                error={errors.sport?.message}
              />
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                {...register('position')}
                error={errors.position?.message}
                placeholder="e.g., Midfielder, Point Guard, etc."
              />
            </div>

            <div>
              <Label htmlFor="age" required>Age</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                error={errors.age?.message}
                placeholder="Enter age"
                min="16"
                max="40"
              />
            </div>

            <div>
              <Label htmlFor="location" required>Location</Label>
              <Input
                id="location"
                {...register('location')}
                error={errors.location?.message}
                placeholder="City, Country"
              />
            </div>
          </div>
        )

      case 1: // Performance & Achievements
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="competitionLevel" required>Competition Level</Label>
              <Select
                options={COMPETITION_LEVELS}
                value={watchedData.competitionLevel}
                onValueChange={(value) => setValue('competitionLevel', value as any)}
                placeholder="Select competition level"
                error={errors.competitionLevel?.message}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Achievements</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addAchievement('')}
                  disabled={achievementFields.length >= 10}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Achievement
                </Button>
              </div>
              
              <div className="space-y-3">
                {achievementFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`achievements.${index}`)}
                      placeholder={`Achievement ${index + 1}`}
                      error={errors.achievements?.[index]?.message}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAchievement(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {achievementFields.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No achievements added yet. Click "Add Achievement" to get started.
                </p>
              )}
            </div>
          </div>
        )

      case 2: // Story & Goals
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="backgroundStory" required>Background Story</Label>
              <Textarea
                id="backgroundStory"
                {...register('backgroundStory')}
                error={errors.backgroundStory?.message}
                placeholder="Tell us about the athlete's journey, background, and what makes them special..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 50 characters, maximum 1000 characters
              </p>
            </div>

            <div>
              <Label htmlFor="whyInvest" required>Why Should People Invest?</Label>
              <Textarea
                id="whyInvest"
                {...register('whyInvest')}
                error={errors.whyInvest?.message}
                placeholder="Explain why this athlete is a good investment opportunity..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 50 characters, maximum 1000 characters
              </p>
            </div>

            <div>
              <Label htmlFor="futureGoals" required>Future Goals</Label>
              <Textarea
                id="futureGoals"
                {...register('futureGoals')}
                error={errors.futureGoals?.message}
                placeholder="What are the athlete's future goals and aspirations?"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 50 characters, maximum 1000 characters
              </p>
            </div>
          </div>
        )

      case 3: // Media & Documents
        return (
          <div className="space-y-6">
            <div>
              <Label>Profile Image</Label>
              <FileUpload
                accept={['image/*']}
                maxFiles={1}
                maxSize={5 * 1024 * 1024} // 5MB
                value={profileImage ? [profileImage] : []}
                onFilesChange={(files) => setProfileImage(files[0])}
                bucketName="submissions"
                folderPath="profile-images"
              />
            </div>

            <div>
              <Label>Videos</Label>
              <FileUpload
                accept={['video/*']}
                maxFiles={3}
                maxSize={100 * 1024 * 1024} // 100MB per video
                value={videos}
                onFilesChange={setVideos}
                bucketName="submissions"
                folderPath="videos"
              />
            </div>

            <div>
              <Label>Documents</Label>
              <FileUpload
                accept={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                maxFiles={5}
                maxSize={10 * 1024 * 1024} // 10MB per document
                value={documents}
                onFilesChange={setDocuments}
                bucketName="submissions"
                folderPath="documents"
              />
            </div>
          </div>
        )

      case 4: // Contact & Social
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                error={errors.contactEmail?.message}
                placeholder="athlete@example.com"
              />
            </div>

            <div>
              <Label>Social Media Links</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...register('socialMedia.instagram')}
                    error={errors.socialMedia?.instagram?.message}
                    placeholder="https://instagram.com/athlete"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    {...register('socialMedia.twitter')}
                    error={errors.socialMedia?.twitter?.message}
                    placeholder="https://twitter.com/athlete"
                  />
                </div>

                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    {...register('socialMedia.tiktok')}
                    error={errors.socialMedia?.tiktok?.message}
                    placeholder="https://tiktok.com/@athlete"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 5: // Review & Submit
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Review Your Submission</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Athlete Name:</strong> {watchedData.athleteName}
                </div>
                <div>
                  <strong>Sport:</strong> {watchedData.sport}
                </div>
                <div>
                  <strong>Position:</strong> {watchedData.position || 'Not specified'}
                </div>
                <div>
                  <strong>Age:</strong> {watchedData.age}
                </div>
                <div>
                  <strong>Location:</strong> {watchedData.location}
                </div>
                <div>
                  <strong>Competition Level:</strong> {watchedData.competitionLevel}
                </div>
              </div>

              {watchedData.achievements && watchedData.achievements.length > 0 && (
                <div className="mt-4">
                  <strong>Achievements:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {watchedData.achievements.map((achievement, index) => (
                      <li key={index} className="text-sm">{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div>
                  <strong>Files:</strong>
                </div>
                <div className="text-sm text-gray-600">
                  Profile Image: {profileImage ? '✓ Uploaded' : 'Not uploaded'}
                </div>
                <div className="text-sm text-gray-600">
                  Videos: {videos.length} uploaded
                </div>
                <div className="text-sm text-gray-600">
                  Documents: {documents.length} uploaded
                </div>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {submitError}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Submit New Athlete</h2>
          {isDraft && lastSaved && (
            <div className="flex items-center text-sm text-gray-500">
              <Save className="w-4 h-4 mr-1" />
              Draft saved {new Date(lastSaved).toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <Progress 
          value={(currentStep + 1) / FORM_STEPS.length * 100} 
          className="mb-4"
        />
        
        <div className="flex justify-between">
          {FORM_STEPS.map((step, index) => (
            <div
              key={index}
              className={cn(
                'flex flex-col items-center text-center flex-1',
                index <= currentStep ? 'text-primary' : 'text-gray-400'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2',
                  index <= currentStep 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {index + 1}
              </div>
              <div className="text-xs font-medium">{step.title}</div>
              <div className="text-xs text-gray-500 hidden sm:block">
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(handleSubmit)}>
        <div className="bg-white p-6 rounded-lg shadow-sm border min-h-[500px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {FORM_STEPS.length}
          </div>

          {currentStep < FORM_STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={isSubmitting || !isValid}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default AthleteSubmissionForm