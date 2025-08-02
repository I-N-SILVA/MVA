import * as React from 'react'
import { motion, useMotionValue, useSpring, useTransform, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'

export interface MagneticButtonProps extends Omit<ButtonProps, 'magnetic'> {
  strength?: number
  range?: number
  children: React.ReactNode
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ 
    children, 
    className,
    strength = 0.3,
    range = 100,
    disabled,
    ...props 
  }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    
    const springX = useSpring(x, { stiffness: 300, damping: 30 })
    const springY = useSpring(y, { stiffness: 300, damping: 30 })
    
    const rotateX = useTransform(springY, [-range, range], [10, -10])
    const rotateY = useTransform(springX, [-range, range], [-10, 10])

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!buttonRef.current || disabled) return
      
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = (e.clientX - centerX) * strength
      const deltaY = (e.clientY - centerY) * strength
      
      x.set(deltaX)
      y.set(deltaY)
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    return (
      <motion.div
        ref={buttonRef}
        style={{ 
          x: springX, 
          y: springY, 
          rotateX, 
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="inline-block"
      >
        <Button
          ref={ref}
          className={cn('transform-gpu', className)}
          disabled={disabled}
          {...props}
        >
          <motion.span 
            style={{ transform: 'translateZ(50px)' }}
            className="relative z-10"
          >
            {children}
          </motion.span>
        </Button>
      </motion.div>
    )
  }
)

MagneticButton.displayName = 'MagneticButton'