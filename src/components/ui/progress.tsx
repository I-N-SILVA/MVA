import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'default' | 'lg'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, size = 'default', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: 'h-2',
      default: 'h-3',
      lg: 'h-4'
    }

    return (
      <div className="w-full">
        <div
          ref={ref}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-secondary',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-sm text-muted-foreground">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }