import * as React from 'react'
import { motion, useInView, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { scrollRevealVariants } from '@/lib/animations'

export interface ScrollRevealProps 
  extends Omit<MotionProps, 'children'> {
  children: React.ReactNode
  threshold?: number
  once?: boolean
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale'
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  threshold = 0.1, 
  once = true,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  className,
  ...props 
}) => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { threshold, once })

  const directionVariants = {
    up: { y: distance, opacity: 0 },
    down: { y: -distance, opacity: 0 },
    left: { x: distance, opacity: 0 },
    right: { x: -distance, opacity: 0 },
    scale: { scale: 0.8, opacity: 0 },
  }

  const variants = {
    hidden: directionVariants[direction],
    visible: { 
      x: 0, 
      y: 0, 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay,
        duration
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Specialized scroll reveal for staggered children
export interface ScrollRevealStaggerProps extends ScrollRevealProps {
  staggerChildren?: number
  delayChildren?: number
}

export const ScrollRevealStagger: React.FC<ScrollRevealStaggerProps> = ({
  children,
  staggerChildren = 0.1,
  delayChildren = 0,
  ...props
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  }

  return (
    <ScrollReveal {...props}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {React.Children.map(children, (child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </ScrollReveal>
  )
}