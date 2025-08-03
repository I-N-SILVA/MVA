import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from './slot'

const buttonVariants = cva(
  // Base styles with Plyaz design system
  'inline-flex items-center justify-center font-bold tracking-wide uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-black text-white hover:bg-gray-900 active:bg-gray-800 border-2 border-black shadow-plyaz-sm hover:shadow-plyaz',
        secondary: 'bg-white text-black hover:bg-gray-50 active:bg-gray-100 border-2 border-black shadow-plyaz-sm hover:shadow-plyaz',
        ghost: 'bg-transparent text-black hover:bg-gray-100 active:bg-gray-200 border-2 border-transparent hover:border-gray-200',
        outline: 'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white shadow-plyaz-sm hover:shadow-plyaz',
        destructive: 'bg-black text-white hover:bg-gray-900 active:bg-gray-800 border-2 border-black shadow-plyaz-sm hover:shadow-plyaz',
        link: 'bg-transparent text-black underline-offset-4 hover:underline font-medium tracking-normal normal-case',
      },
      size: {
        sm: 'h-11 px-4 text-sm rounded-md min-w-[44px]', // Changed from h-9 to h-11 for minimum touch target
        default: 'h-11 px-6 text-base rounded-lg min-w-[44px]',
        lg: 'h-13 px-8 text-lg rounded-lg min-w-[44px]',
        xl: 'h-16 px-10 text-xl rounded-xl min-w-[44px]',
        icon: 'h-11 w-11 rounded-lg', // Already meets 44px minimum
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        full: 'rounded-full',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      rounded: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  magnetic?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    loading = false,
    loadingText = 'Loading...',
    disabled,
    asChild = false,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    const buttonContent = loading ? (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span>{loadingText}</span>
      </div>
    ) : (
      children
    )

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, rounded, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }