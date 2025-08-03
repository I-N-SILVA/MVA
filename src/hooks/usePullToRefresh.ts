'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  refreshThreshold?: number
  maxPullDistance?: number
  isEnabled?: boolean
  disabled?: boolean
}

interface PullToRefreshReturn {
  isRefreshing: boolean
  pullDistance: any // MotionValue
  isPulling: boolean
  pullProgress: any // MotionValue
  springPullDistance: any // MotionValue
  bindPullContainer: {
    onTouchStart: (e: TouchEvent) => void
    onTouchMove: (e: TouchEvent) => void
    onTouchEnd: (e: TouchEvent) => void
  }
}

export function usePullToRefresh({
  onRefresh,
  refreshThreshold = 80,
  maxPullDistance = 120,
  isEnabled = true,
  disabled = false
}: PullToRefreshOptions): PullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [startY, setStartY] = useState(0)
  const touchStartRef = useRef(0)
  const isScrollingRef = useRef(false)
  
  // Motion values for smooth animations
  const pullDistance = useMotionValue(0)
  const springPullDistance = useSpring(pullDistance, {
    damping: 20,
    stiffness: 300,
    restDelta: 0.01
  })
  
  // Calculate pull progress (0 to 1)
  const pullProgress = useTransform(
    pullDistance,
    [0, refreshThreshold],
    [0, 1]
  )

  const resetPull = useCallback(() => {
    pullDistance.set(0)
    setIsPulling(false)
    setStartY(0)
    isScrollingRef.current = false
  }, [pullDistance])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || !isEnabled || isRefreshing) return
    
    const touch = e.touches[0]
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    // Only allow pull-to-refresh at the top of the page
    if (scrollTop <= 0) {
      touchStartRef.current = touch.clientY
      setStartY(touch.clientY)
      isScrollingRef.current = false
    }
  }, [disabled, isEnabled, isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !isEnabled || isRefreshing || !startY) return
    
    const touch = e.touches[0]
    const currentY = touch.clientY
    const deltaY = currentY - touchStartRef.current
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    // Check if user is scrolling horizontally (should not trigger pull-to-refresh)
    const deltaX = Math.abs(touch.clientX - (e.touches[0]?.clientX || 0))
    if (deltaX > Math.abs(deltaY)) {
      isScrollingRef.current = true
      return
    }
    
    // Only activate when at top of page and pulling down
    if (scrollTop <= 0 && deltaY > 0 && !isScrollingRef.current) {
      e.preventDefault() // Prevent scroll bounce
      
      if (!isPulling) {
        setIsPulling(true)
      }
      
      // Apply resistance curve (harder to pull the further you go)
      const resistance = Math.min(deltaY / maxPullDistance, 1)
      const easedDistance = deltaY * (1 - resistance * 0.5)
      const clampedDistance = Math.min(easedDistance, maxPullDistance)
      
      pullDistance.set(clampedDistance)
    }
  }, [disabled, isEnabled, isRefreshing, startY, isPulling, maxPullDistance, pullDistance])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !isEnabled || isRefreshing || !isPulling) {
      resetPull()
      return
    }
    
    const currentDistance = pullDistance.get()
    
    if (currentDistance >= refreshThreshold) {
      setIsRefreshing(true)
      pullDistance.set(refreshThreshold) // Hold at threshold during refresh
      
      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull-to-refresh error:', error)
      } finally {
        setIsRefreshing(false)
        resetPull()
      }
    } else {
      resetPull()
    }
  }, [disabled, isEnabled, isRefreshing, isPulling, pullDistance, refreshThreshold, onRefresh, resetPull])

  // Bind touch events to container
  const bindPullContainer = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetPull()
    }
  }, [resetPull])

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    pullProgress,
    springPullDistance,
    bindPullContainer
  }
}

// Utility hook for common pull-to-refresh scenarios
export function usePullToRefreshList(refreshCallback: () => Promise<void> | void, enabled = true) {
  return usePullToRefresh({
    onRefresh: refreshCallback,
    refreshThreshold: 80,
    maxPullDistance: 120,
    isEnabled: enabled && typeof window !== 'undefined' && 'ontouchstart' in window
  })
}