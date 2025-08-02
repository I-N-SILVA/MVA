import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AthleteSubmissionData } from '@/lib/validations/athlete'
import { UploadedFile } from '@/components/ui/FileUpload'

export interface SubmissionState {
  // Form data
  formData: Partial<AthleteSubmissionData>
  
  // Files
  profileImage?: UploadedFile
  videos: UploadedFile[]
  documents: UploadedFile[]
  
  // Form state
  currentStep: number
  isSubmitting: boolean
  isDraft: boolean
  lastSaved?: Date
  
  // Error states
  errors: Record<string, string>
  submitError?: string
  
  // Actions
  updateFormData: (data: Partial<AthleteSubmissionData>) => void
  setProfileImage: (file?: UploadedFile) => void
  setVideos: (files: UploadedFile[]) => void
  setDocuments: (files: UploadedFile[]) => void
  setCurrentStep: (step: number) => void
  setError: (field: string, error: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void
  setSubmitError: (error?: string) => void
  saveDraft: () => void
  loadDraft: () => void
  clearDraft: () => void
  setSubmitting: (submitting: boolean) => void
  reset: () => void
}

const initialState = {
  formData: {
    socialMedia: {
      instagram: '',
      twitter: '',
      tiktok: ''
    },
    achievements: []
  },
  videos: [],
  documents: [],
  currentStep: 0,
  isSubmitting: false,
  isDraft: false,
  errors: {}
}

export const useSubmissionStore = create<SubmissionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDraft: true,
          lastSaved: new Date()
        }))
      },

      setProfileImage: (file) => {
        set({ profileImage: file, isDraft: true, lastSaved: new Date() })
      },

      setVideos: (files) => {
        set({ videos: files, isDraft: true, lastSaved: new Date() })
      },

      setDocuments: (files) => {
        set({ documents: files, isDraft: true, lastSaved: new Date() })
      },

      setCurrentStep: (step) => {
        set({ currentStep: step })
      },

      setError: (field, error) => {
        set((state) => ({
          errors: { ...state.errors, [field]: error }
        }))
      },

      clearError: (field) => {
        set((state) => {
          const { [field]: _, ...restErrors } = state.errors
          return { errors: restErrors }
        })
      },

      clearAllErrors: () => {
        set({ errors: {}, submitError: undefined })
      },

      setSubmitError: (error) => {
        set({ submitError: error })
      },

      saveDraft: () => {
        set({ isDraft: true, lastSaved: new Date() })
      },

      loadDraft: () => {
        // This will automatically load from localStorage due to persist middleware
        const state = get()
        return state.isDraft
      },

      clearDraft: () => {
        set({ isDraft: false, lastSaved: undefined })
      },

      setSubmitting: (submitting) => {
        set({ isSubmitting: submitting })
      },

      reset: () => {
        set({
          ...initialState,
          currentStep: 0,
          isDraft: false,
          lastSaved: undefined
        })
      }
    }),
    {
      name: 'athlete-submission-draft',
      partialize: (state) => ({
        formData: state.formData,
        profileImage: state.profileImage,
        videos: state.videos,
        documents: state.documents,
        currentStep: state.currentStep,
        isDraft: state.isDraft,
        lastSaved: state.lastSaved
        // Explicitly exclude: isSubmitting, errors, submitError
      })
    }
  )
)