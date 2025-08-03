'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  'bg-gray-200 rounded animate-pulse',
  {
    variants: {
      variant: {
        default: 'bg-gray-200',
        plyaz: 'bg-gray-200 border-2 border-gray-300',
        circle: 'rounded-full bg-gray-200',
        text: 'bg-gray-200 rounded',
      },
      size: {
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-8',
        xl: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
  animated?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, width, height, animated = true, style, ...props }, ref) => {
    const shimmer = {
      animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }
      }
    }

    const Component = animated ? motion.div : 'div'

    return (
      <Component
        className={cn(skeletonVariants({ variant, size, className }))}
        style={{
          width,
          height,
          backgroundImage: animated 
            ? 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
            : undefined,
          backgroundSize: animated ? '200% 100%' : undefined,
          backgroundRepeat: 'no-repeat',
          ...style
        }}
        {...(animated && { variants: shimmer, animate: 'animate' })}
        ref={ref}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

// AthleteCard Skeleton
export const AthleteCardSkeleton: React.FC<{ viewMode?: 'grid' | 'list' }> = ({ 
  viewMode = 'grid' 
}) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border-2 border-black p-4 shadow-plyaz-sm">
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" width={64} height={64} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={20} width="60%" />
            <Skeleton variant="text" height={16} width="40%" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" height={24} width={80} />
            <Skeleton variant="text" height={16} width={60} />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" height={16} width={100} />
            <Skeleton variant="text" height={16} width={80} />
          </div>
          <div className="flex gap-2">
            <Skeleton height={32} width={80} />
            <Skeleton height={32} width={80} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-black overflow-hidden shadow-plyaz">
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3 mb-4">
          <Skeleton variant="circle" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={20} width="70%" />
            <Skeleton variant="text" height={16} width="50%" />
          </div>
          <Skeleton height={24} width={60} />
        </div>
      </div>
      
      <div className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" height={12} width="40%" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} variant="circle" width={12} height={12} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 border-t-2 border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div className="space-y-1">
            <Skeleton height={24} width={80} />
            <Skeleton height={12} width={60} />
          </div>
          <div className="space-y-1 text-right">
            <Skeleton height={16} width={60} />
            <Skeleton height={12} width={40} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="space-y-1">
            <Skeleton height={12} width="100%" />
            <Skeleton height={16} width="80%" />
          </div>
          <div className="space-y-1">
            <Skeleton height={12} width="100%" />
            <Skeleton height={16} width="80%" />
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 border-t-2 border-gray-200">
        <div className="space-y-2 mb-2">
          <div className="flex justify-between">
            <Skeleton height={12} width={100} />
            <Skeleton height={12} width={120} />
          </div>
          <Skeleton height={8} width="100%" />
        </div>
      </div>
      
      <div className="p-4 pt-2">
        <div className="flex gap-2">
          <Skeleton height={36} className="flex-1" />
          <Skeleton height={36} className="flex-1" />
        </div>
      </div>
    </div>
  )
}

// Navigation Skeleton
export const NavigationSkeleton: React.FC = () => (
  <nav className="bg-white shadow-plyaz-sm border-b-2 border-black">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <Skeleton variant="circle" width={32} height={32} className="mr-2" />
          <Skeleton height={24} width={80} />
          <div className="hidden md:ml-10 md:flex md:space-x-8">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} height={16} width={60} />
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton height={32} width={100} />
          <Skeleton height={32} width={80} />
        </div>
      </div>
    </div>
  </nav>
)

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number
  columns?: number 
}> = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg border-2 border-black shadow-plyaz-sm overflow-hidden">
    <div className="bg-black p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} height={16} width="80%" className="bg-gray-600" />
        ))}
      </div>
    </div>
    <div className="divide-y-2 divide-gray-200">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton key={colIndex} height={16} width="90%" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export { Skeleton }
export type { SkeletonProps }