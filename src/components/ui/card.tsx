import * as React from 'react'
import { motion, useMotionValue, useSpring, useTransform, MotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { cardVariants, card3DVariants } from '@/lib/animations'

const cardVariantsStyles = cva(
  'rounded-lg transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white border-2 border-black',
        elevated: 'bg-white border-2 border-black shadow-plyaz',
        outlined: 'bg-transparent border-2 border-black',
        ghost: 'bg-gray-50 border-2 border-gray-200',
        minimal: 'bg-white border border-gray-200',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-plyaz-lg transition-shadow duration-300',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
    },
  }
)

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'>,
    VariantProps<typeof cardVariantsStyles>,
    Omit<MotionProps, 'children'> {
  children: React.ReactNode
  interactive?: boolean
  hover3D?: boolean
  magnetic?: boolean
  loading?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    padding,
    interactive = false,
    hover3D = false,
    magnetic = false,
    loading = false,
    children,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    
    const springConfig = { stiffness: 300, damping: 30 }
    const x = useSpring(mouseX, springConfig)
    const y = useSpring(mouseY, springConfig)
    
    const rotateX = useTransform(y, [-100, 100], [10, -10])
    const rotateY = useTransform(x, [-100, 100], [-10, 10])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hover3D && !magnetic) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const offsetMultiplier = magnetic ? 0.1 : 0.3
      mouseX.set((e.clientX - centerX) * offsetMultiplier)
      mouseY.set((e.clientY - centerY) * offsetMultiplier)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      mouseX.set(0)
      mouseY.set(0)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    const getMotionProps = () => {
      if (loading) {
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.3 }
        }
      }

      if (hover3D) {
        return {
          variants: card3DVariants,
          initial: 'initial',
          animate: 'animate',
          whileHover: 'hover',
          style: { 
            rotateX, 
            rotateY, 
            transformStyle: 'preserve-3d' as const,
            perspective: 1000
          }
        }
      }

      if (interactive || magnetic) {
        const baseVariants = interactive ? cardVariants : {}
        
        return {
          ...baseVariants,
          whileHover: interactive ? {
            y: -8,
            scale: 1.02,
            boxShadow: '12px 12px 0px 0px #000000',
            transition: { type: 'spring', stiffness: 300, damping: 30 }
          } : magnetic ? {
            scale: 1.02,
            transition: { type: 'spring', stiffness: 400, damping: 30 }
          } : undefined,
          style: magnetic ? { x, y } : undefined
        }
      }

      return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      }
    }

    return (
      <motion.div
        className={cn(cardVariantsStyles({ variant, padding, interactive, className }))}
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...getMotionProps()}
        {...props}
      >
        {hover3D ? (
          <motion.div
            style={{ transform: 'translateZ(50px)' }}
            animate={{ 
              filter: isHovered ? 'brightness(1.05)' : 'brightness(1)',
            }}
            transition={{ duration: 0.2 }}
          >
            {loading ? <CardSkeleton /> : children}
          </motion.div>
        ) : (
          <>
            {loading ? <CardSkeleton /> : children}
            
            {/* Hover glow effect for interactive cards */}
            {interactive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </>
        )}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'

// Card Header Component
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

// Card Title Component
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-bold leading-none tracking-tight text-black', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

// Card Description Component
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600 font-medium', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

// Card Content Component
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

// Card Footer Component
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Skeleton Component for Loading State
const CardSkeleton = () => {
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

  return (
    <div className="animate-pulse space-y-4">
      <motion.div
        className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg"
        style={{
          backgroundSize: '200% 100%',
          backgroundRepeat: 'no-repeat'
        }}
        variants={shimmer}
        animate="animate"
      />
      
      <div className="space-y-3">
        <motion.div
          className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"
          style={{ backgroundSize: '200% 100%' }}
          variants={shimmer}
          animate="animate"
        />
        <motion.div
          className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"
          style={{ backgroundSize: '200% 100%' }}
          variants={shimmer}
          animate="animate"
        />
      </div>
    </div>
  )
}

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardSkeleton
}