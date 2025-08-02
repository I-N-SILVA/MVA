import { z } from 'zod'

export const athleteSubmissionSchema = z.object({
  // Basic Information
  athleteName: z
    .string()
    .min(2, 'Athlete name must be at least 2 characters')
    .max(50, 'Athlete name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Athlete name can only contain letters, spaces, hyphens, and apostrophes'),
  
  sport: z
    .string()
    .min(1, 'Sport is required')
    .max(30, 'Sport name must be less than 30 characters'),
  
  position: z
    .string()
    .max(30, 'Position must be less than 30 characters')
    .optional(),
  
  age: z
    .number()
    .int('Age must be a whole number')
    .min(16, 'Athlete must be at least 16 years old')
    .max(40, 'Athlete must be younger than 40 years old'),
  
  location: z
    .string()
    .min(2, 'Location is required')
    .max(100, 'Location must be less than 100 characters'),

  // Performance Data
  achievements: z
    .array(z.string().max(200, 'Achievement must be less than 200 characters'))
    .max(10, 'Maximum 10 achievements allowed')
    .default([]),
  
  statistics: z
    .record(z.string(), z.number())
    .optional(),
  
  competitionLevel: z.enum(['amateur', 'semi_pro', 'professional'], {
    errorMap: () => ({ message: 'Competition level must be amateur, semi-pro, or professional' })
  }),

  // Story
  backgroundStory: z
    .string()
    .min(50, 'Background story must be at least 50 characters')
    .max(1000, 'Background story must be less than 1000 characters'),
  
  whyInvest: z
    .string()
    .min(50, 'Investment reason must be at least 50 characters')
    .max(1000, 'Investment reason must be less than 1000 characters'),
  
  futureGoals: z
    .string()
    .min(50, 'Future goals must be at least 50 characters')
    .max(1000, 'Future goals must be less than 1000 characters'),

  // Contact
  contactEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional(),
  
  socialMedia: z.object({
    instagram: z
      .string()
      .url('Please enter a valid Instagram URL')
      .regex(/instagram\.com/, 'Must be an Instagram URL')
      .optional()
      .or(z.literal('')),
    twitter: z
      .string()
      .url('Please enter a valid Twitter URL')
      .regex(/(twitter\.com|x\.com)/, 'Must be a Twitter/X URL')
      .optional()
      .or(z.literal('')),
    tiktok: z
      .string()
      .url('Please enter a valid TikTok URL')
      .regex(/tiktok\.com/, 'Must be a TikTok URL')
      .optional()
      .or(z.literal(''))
  }).optional()
})

export type AthleteSubmissionData = z.infer<typeof athleteSubmissionSchema>

export const voteSchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID'),
  voteType: z.enum(['for', 'against'], {
    errorMap: () => ({ message: 'Vote must be for or against' })
  }),
  confidenceLevel: z
    .number()
    .int('Confidence level must be a whole number')
    .min(1, 'Confidence level must be at least 1')
    .max(5, 'Confidence level must be at most 5')
    .default(3),
  reasoning: z
    .string()
    .min(10, 'Please provide reasoning for your vote (at least 10 characters)')
    .max(500, 'Reasoning must be less than 500 characters')
    .optional(),
  expertiseAreas: z
    .array(z.string().max(50, 'Expertise area must be less than 50 characters'))
    .max(5, 'Maximum 5 expertise areas allowed')
    .optional()
})

export type VoteData = z.infer<typeof voteSchema>

export const investmentSchema = z.object({
  athleteId: z.string().uuid('Invalid athlete ID'),
  transactionType: z.enum(['buy', 'sell'], {
    errorMap: () => ({ message: 'Transaction must be buy or sell' })
  }),
  shares: z
    .number()
    .int('Shares must be a whole number')
    .min(1, 'Must invest in at least 1 share')
    .max(10000, 'Maximum 10,000 shares per transaction'),
  reasoning: z
    .string()
    .min(10, 'Please provide reasoning for your investment (at least 10 characters)')
    .max(300, 'Reasoning must be less than 300 characters')
    .optional()
})

export type InvestmentData = z.infer<typeof investmentSchema>