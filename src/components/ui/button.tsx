import * as React from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { buttonVariants as animationButtonVariants } from '@/lib/animations'

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
        sm: 'h-9 px-4 text-sm rounded-md',
        default: 'h-11 px-6 text-base rounded-lg',
        lg: 'h-13 px-8 text-lg rounded-lg',
        xl: 'h-16 px-10 text-xl rounded-xl',
        icon: 'h-11 w-11 rounded-lg',
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
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'>,
    VariantProps<typeof buttonVariants>,
    Omit<MotionProps, 'children'> {
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
    magnetic = false,
    disabled,
    asChild = false,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    const motionProps = magnetic 
      ? {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
          transition: { type: 'spring', stiffness: 400, damping: 30 }
        }
      : {
          variants: animationButtonVariants,
          initial: 'idle',
          whileHover: !isDisabled ? 'hover' : undefined,
          whileTap: !isDisabled ? 'tap' : undefined
        }

    // For now, ignore asChild and always render as button to fix the errors
    // TODO: Implement proper Slot pattern later
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        disabled={isDisabled}
        {...motionProps}
        {...props}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>{loadingText}</span>
          </div>
        ) : (
          <>
            {children}
            {/* Ripple effect container */}
            <motion.div
              className="absolute inset-0 bg-white rounded-full opacity-0"
              initial={{ scale: 0, opacity: 0 }}
              whileTap={{ 
                scale: 4, 
                opacity: [0, 0.3, 0],
                transition: { duration: 0.4 }
              }}
              style={{ 
                mixBlendMode: variant === 'primary' ? 'multiply' : 'normal'
              }}
            />
          </>
        )}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }