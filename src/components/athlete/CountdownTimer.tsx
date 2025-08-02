'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface CountdownTimerProps {
  deadline: string
  totalDuration?: number // in milliseconds, for progress calculation
  className?: string
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isExpired: boolean
}

export function CountdownTimer({ 
  deadline, 
  totalDuration,
  className = '',
  showProgress = false,
  size = 'md'
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const deadlineDate = new Date(deadline)
      const now = new Date()
      const diff = deadlineDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true
        })
        return
      }

      const totalSeconds = Math.floor(diff / 1000)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        isExpired: false
      })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  const getUrgencyLevel = () => {
    if (timeRemaining.isExpired) return 'expired'
    if (timeRemaining.totalSeconds < 24 * 60 * 60) return 'critical' // Less than 24 hours
    if (timeRemaining.totalSeconds < 72 * 60 * 60) return 'warning' // Less than 72 hours
    return 'normal'
  }

  const getUrgencyColors = () => {
    const urgency = getUrgencyLevel()
    switch (urgency) {
      case 'expired':
        return {
          text: 'text-red-600',
          bg: 'bg-red-100',
          border: 'border-red-200',
          icon: 'text-red-500'
        }
      case 'critical':
        return {
          text: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500'
        }
      case 'warning':
        return {
          text: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-500'
        }
      default:
        return {
          text: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-500'
        }
    }
  }

  const formatTimeDisplay = () => {
    if (timeRemaining.isExpired) {
      return 'Voting Closed'
    }

    const { days, hours, minutes, seconds } = timeRemaining
    
    if (size === 'sm') {
      if (days > 0) return `${days}d ${hours}h`
      if (hours > 0) return `${hours}h ${minutes}m`
      return `${minutes}m ${seconds}s`
    }
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    
    return `${minutes}m ${seconds}s`
  }

  const getProgressPercentage = () => {
    if (!totalDuration || timeRemaining.isExpired) return 100
    
    const elapsed = totalDuration - (timeRemaining.totalSeconds * 1000)
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
  }

  const colors = getUrgencyColors()
  const urgency = getUrgencyLevel()

  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {timeRemaining.isExpired ? (
          <CheckCircle2 className={`h-3 w-3 ${colors.icon}`} />
        ) : urgency === 'critical' ? (
          <AlertTriangle className={`h-3 w-3 ${colors.icon} animate-pulse`} />
        ) : (
          <Clock className={`h-3 w-3 ${colors.icon}`} />
        )}
        <span className={`text-xs font-medium ${colors.text}`}>
          {formatTimeDisplay()}
        </span>
      </div>
    )
  }

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        {timeRemaining.isExpired ? (
          <CheckCircle2 className={`h-5 w-5 ${colors.icon}`} />
        ) : urgency === 'critical' ? (
          <AlertTriangle className={`h-5 w-5 ${colors.icon} animate-pulse`} />
        ) : (
          <Clock className={`h-5 w-5 ${colors.icon}`} />
        )}
        
        <div>
          <h4 className={`font-semibold ${colors.text}`}>
            {timeRemaining.isExpired ? 'Voting Period Ended' : 'Time Remaining'}
          </h4>
          <p className="text-xs text-gray-500">
            Deadline: {new Date(deadline).toLocaleString()}
          </p>
        </div>
      </div>

      {size === 'lg' && !timeRemaining.isExpired && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center">
            <div className={`text-2xl font-bold ${colors.text}`}>
              {timeRemaining.days}
            </div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${colors.text}`}>
              {timeRemaining.hours}
            </div>
            <div className="text-xs text-gray-500">Hours</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${colors.text}`}>
              {timeRemaining.minutes}
            </div>
            <div className="text-xs text-gray-500">Minutes</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${colors.text}`}>
              {timeRemaining.seconds}
            </div>
            <div className="text-xs text-gray-500">Seconds</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className={`font-bold ${size === 'lg' ? 'text-lg' : 'text-base'} ${colors.text}`}>
          {formatTimeDisplay()}
        </span>
        
        {urgency === 'critical' && !timeRemaining.isExpired && (
          <Badge variant="outline" className="text-red-600 border-red-200 animate-pulse">
            Urgent
          </Badge>
        )}
        
        {urgency === 'warning' && !timeRemaining.isExpired && (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Soon
          </Badge>
        )}
      </div>

      {showProgress && totalDuration && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Voting Progress</span>
            <span>{getProgressPercentage().toFixed(1)}% complete</span>
          </div>
          <Progress 
            value={getProgressPercentage()} 
            className="h-2"
          />
        </div>
      )}
    </div>
  )
}