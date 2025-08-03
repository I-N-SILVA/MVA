'use client'

import * as React from 'react'
import { motion, useTransform } from 'framer-motion'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
  className?: string
  refreshThreshold?: number
  maxPullDistance?: number
  disabled?: boolean
  pullIndicatorClassName?: string
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  refreshThreshold = 80,
  maxPullDistance = 120,
  disabled = false,
  pullIndicatorClassName
}: PullToRefreshProps) {
  const {
    isRefreshing,
    pullDistance,
    isPulling,
    pullProgress,
    springPullDistance,
    bindPullContainer
  } = usePullToRefresh({
    onRefresh,
    refreshThreshold,
    maxPullDistance,
    disabled,
    isEnabled: typeof window !== 'undefined' && 'ontouchstart' in window
  })

  // Transform pull progress to rotation for the icon
  const iconRotation = useTransform(pullProgress, [0, 1], [0, 180])
  const iconScale = useTransform(pullProgress, [0, 0.5, 1], [0.8, 1.1, 1])

  // Calculate pull indicator opacity and visibility
  const indicatorOpacity = useTransform(pullDistance, [0, 20, refreshThreshold], [0, 0.7, 1])
  const indicatorScale = useTransform(pullDistance, [0, refreshThreshold], [0.5, 1])

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      {...bindPullContainer}
    >
      {/* Pull Indicator */}
      <motion.div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center z-10 bg-white dark:bg-black border-b-2 border-gray-200 dark:border-gray-700 transition-colors duration-200',
          pullIndicatorClassName
        )}
        style={{
          height: springPullDistance,
          opacity: indicatorOpacity,
          scale: indicatorScale
        }}
      >
        <div className="flex flex-col items-center py-2">
          {isRefreshing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 text-black dark:text-white" />
            </motion.div>
          ) : (
            <motion.div
              style={{ rotate: iconRotation, scale: iconScale }}
              className="flex items-center justify-center"
            >
              <ChevronDown className="h-5 w-5 text-black dark:text-white" />
            </motion.div>
          )}
          
          <motion.p 
            className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1"
            style={{ opacity: indicatorOpacity }}
          >
            {isRefreshing 
              ? 'Refreshing...' 
              : pullProgress.get() >= 1 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </motion.p>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ 
          y: springPullDistance,
          transition: 'transform 0.2s ease-out'
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Simplified wrapper for common use cases
interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function PullToRefreshWrapper({
  onRefresh,
  children,
  className,
  disabled = false
}: PullToRefreshWrapperProps) {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      className={className}
      disabled={disabled}
      refreshThreshold={60}
      maxPullDistance={100}
    >
      {children}
    </PullToRefresh>
  )
}

// Hook for manual refresh indication
export function useRefreshIndicator() {
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const startRefresh = React.useCallback(async (refreshFn: () => Promise<void> | void) => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await refreshFn()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing])

  return {
    isRefreshing,
    startRefresh,
    setIsRefreshing
  }
}