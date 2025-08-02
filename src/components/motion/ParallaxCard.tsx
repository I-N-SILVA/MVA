import * as React from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { Card, CardProps } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ParallaxCardProps extends CardProps {
  offset?: number
  speed?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  children: React.ReactNode
}

export const ParallaxCard: React.FC<ParallaxCardProps> = ({
  offset = 50,
  speed = 0.5,
  direction = 'up',
  children,
  className,
  ...props
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const getTransform = (): MotionValue<number> => {
    const range = [-offset * speed, offset * speed]
    
    switch (direction) {
      case 'up':
        return useTransform(scrollY, [0, 1000], range)
      case 'down':
        return useTransform(scrollY, [0, 1000], range.reverse())
      case 'left':
        return useTransform(scrollY, [0, 1000], range)
      case 'right':
        return useTransform(scrollY, [0, 1000], range.reverse())
      default:
        return useTransform(scrollY, [0, 1000], range)
    }
  }

  const transform = getTransform()

  const getMotionStyle = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { y: transform }
      case 'left':
      case 'right':
        return { x: transform }
      default:
        return { y: transform }
    }
  }

  return (
    <motion.div 
      ref={ref}
      style={getMotionStyle()}
      className="relative"
    >
      <Card
        className={cn('transform-gpu', className)}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
}

// Advanced parallax with multiple layers
export interface ParallaxLayersProps {
  children: React.ReactNode
  className?: string
}

export const ParallaxLayers: React.FC<ParallaxLayersProps> = ({
  children,
  className
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  return (
    <div ref={ref} className={cn('relative', className)}>
      {React.Children.map(children, (child, index) => {
        const speed = (index + 1) * 0.2
        const y = useTransform(scrollY, [0, 1000], [0, -100 * speed])
        
        return (
          <motion.div
            style={{ y }}
            className="relative z-10"
            key={index}
          >
            {child}
          </motion.div>
        )
      })}
    </div>
  )
}