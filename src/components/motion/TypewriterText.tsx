import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { typewriterVariants, letterVariants } from '@/lib/animations'

export interface TypewriterTextProps {
  text: string
  delay?: number
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  speed?: number
  cursor?: boolean
  onComplete?: () => void
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  delay = 0,
  className,
  as: Component = 'p',
  speed = 0.05,
  cursor = false,
  onComplete
}) => {
  const [isComplete, setIsComplete] = React.useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
        delayChildren: delay,
        onComplete: () => {
          setIsComplete(true)
          onComplete?.()
        }
      }
    }
  }

  const cursorVariants = {
    blink: {
      opacity: [1, 0, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('inline-block', className)}
    >
      <Component className="inline">
        {text.split('').map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block"
            style={{ minWidth: char === ' ' ? '0.25em' : 'auto' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
        {cursor && (
          <motion.span
            variants={cursorVariants}
            animate={isComplete ? 'blink' : 'visible'}
            className="inline-block ml-1 w-0.5 h-[1.2em] bg-black"
          />
        )}
      </Component>
    </motion.div>
  )
}

// Advanced typewriter with multiple lines
export interface TypewriterLinesProps {
  lines: string[]
  delay?: number
  lineDelay?: number
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div'
  speed?: number
  onLineComplete?: (lineIndex: number) => void
  onComplete?: () => void
}

export const TypewriterLines: React.FC<TypewriterLinesProps> = ({
  lines,
  delay = 0,
  lineDelay = 0.5,
  className,
  as: Component = 'div',
  speed = 0.05,
  onLineComplete,
  onComplete
}) => {
  const [currentLine, setCurrentLine] = React.useState(0)

  const handleLineComplete = () => {
    onLineComplete?.(currentLine)
    if (currentLine < lines.length - 1) {
      setTimeout(() => {
        setCurrentLine(prev => prev + 1)
      }, lineDelay * 1000)
    } else {
      onComplete?.()
    }
  }

  return (
    <Component className={className}>
      {lines.slice(0, currentLine + 1).map((line, index) => (
        <TypewriterText
          key={index}
          text={line}
          delay={index === 0 ? delay : 0}
          speed={speed}
          className={index < currentLine ? 'opacity-100' : ''}
          onComplete={index === currentLine ? handleLineComplete : undefined}
        />
      ))}
    </Component>
  )
}