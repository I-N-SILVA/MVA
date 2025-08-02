import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency = 'GBP',
  locale = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(
  number: number,
  locale = 'en-GB'
): string {
  return new Intl.NumberFormat(locale).format(number)
}

export function formatPercentage(
  value: number,
  decimals = 1,
  locale = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getTimeRemaining(deadline: string): {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
} {
  const total = Date.parse(deadline) - Date.now()
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { total, days, hours, minutes, seconds }
}

export function getApprovalStatus(votesFor: number, votesAgainst: number): {
  percentage: number
  status: 'pending' | 'likely_approved' | 'likely_rejected'
  confidence: 'low' | 'medium' | 'high'
} {
  const total = votesFor + votesAgainst
  const percentage = total > 0 ? (votesFor / total) * 100 : 0
  
  let status: 'pending' | 'likely_approved' | 'likely_rejected' = 'pending'
  let confidence: 'low' | 'medium' | 'high' = 'low'
  
  if (total >= 10) {
    if (percentage >= 70) {
      status = 'likely_approved'
      confidence = total >= 25 ? 'high' : 'medium'
    } else if (percentage <= 30) {
      status = 'likely_rejected'
      confidence = total >= 25 ? 'high' : 'medium'
    }
  }
  
  return { percentage, status, confidence }
}

export function calculateReputationScore(metrics: {
  successfulSubmissions: number
  totalSubmissions: number
  investmentAccuracy: number
  communityEngagement: number
  discoveryBonus: number
}): number {
  const { successfulSubmissions, totalSubmissions, investmentAccuracy, communityEngagement, discoveryBonus } = metrics
  
  const approvalRate = totalSubmissions > 0 ? successfulSubmissions / totalSubmissions : 0
  const baseScore = (approvalRate * 40) + 
                   (investmentAccuracy * 30) + 
                   (communityEngagement * 20) + 
                   (discoveryBonus * 10)
  
  return Math.min(100, Math.max(0, baseScore))
}

export function getReputationBadge(score: number): {
  level: string
  color: string
  nextLevel?: { name: string, threshold: number }
} {
  if (score >= 90) {
    return { level: 'Legend', color: 'text-purple-600 bg-purple-100' }
  } else if (score >= 75) {
    return { 
      level: 'Pro Scout', 
      color: 'text-blue-600 bg-blue-100',
      nextLevel: { name: 'Legend', threshold: 90 }
    }
  } else if (score >= 50) {
    return { 
      level: 'Rising Star', 
      color: 'text-green-600 bg-green-100',
      nextLevel: { name: 'Pro Scout', threshold: 75 }
    }
  } else if (score >= 25) {
    return { 
      level: 'Scout', 
      color: 'text-yellow-600 bg-yellow-100',
      nextLevel: { name: 'Rising Star', threshold: 50 }
    }
  } else {
    return { 
      level: 'Rookie', 
      color: 'text-gray-600 bg-gray-100',
      nextLevel: { name: 'Scout', threshold: 25 }
    }
  }
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}