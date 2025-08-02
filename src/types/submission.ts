import { AthleteSubmissionData } from '@/lib/validations/athlete'
import { Database } from './supabase'

export interface ExtendedAthleteSubmissionData extends AthleteSubmissionData {
  profileImageUrl?: string
  videoUrls?: string[]
  documentUrls?: string[]
}

export type SubmissionRow = Database['public']['Tables']['submissions']['Row']
export type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
export type SubmissionUpdate = Database['public']['Tables']['submissions']['Update']

export interface SubmissionWithFiles extends SubmissionRow {
  profile_image_url?: string
  video_urls: string[]
  document_urls: string[]
}

export type SubmissionStatus = 'pending' | 'under_review' | 'approved' | 'rejected'
export type CompetitionLevel = 'amateur' | 'semi_pro' | 'professional'

export interface SubmissionVotingInfo {
  total_votes: number
  votes_for: number
  votes_against: number
  approval_percentage: number
  time_remaining_hours: number
  status: string
}