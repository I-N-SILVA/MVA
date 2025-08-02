import * as React from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface FloatingActionButtonProps {
  icon: React.ReactNode
  onClick?: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  showOnScroll?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
  tooltip?: string
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  position = 'bottom-right',
  showOnScroll = 100,
  className,
  size = 'md',
  variant = 'primary',
  tooltip
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, showOnScroll], [0, 1])
  const scale = useTransform(scrollY, [0, showOnScroll], [0.8, 1])

  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8'
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  }

  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-900 shadow-plyaz hover:shadow-plyaz-lg',
    secondary: 'bg-white text-black border-2 border-black hover:bg-gray-50 shadow-plyaz hover:shadow-plyaz-lg'
  }

  return (
    <>
      <motion.button
        className={cn(
          'fixed z-50 rounded-full flex items-center justify-center font-bold transition-all duration-300 group',
          positionClasses[position],
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        style={{ opacity, scale }}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ 
          scale: 1.1,
          rotate: 15,
          transition: { type: 'spring', stiffness: 400, damping: 30 }
        }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          delay: 0.5,
          type: 'spring', 
          stiffness: 300, 
          damping: 30 
        }}
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            transition: { 
              duration: 2, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }
          }}
        >
          {icon}
        </motion.div>

        {/* Ripple effect */}
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
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && showTooltip && (
          <motion.div
            className={cn(
              'fixed z-50 bg-black text-white px-3 py-2 rounded-lg text-sm font-medium pointer-events-none',
              position.includes('right') ? 'right-24' : 'left-24',
              position.includes('bottom') ? 'bottom-12' : 'top-12'
            )}
            initial={{ opacity: 0, scale: 0.8, x: position.includes('right') ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: position.includes('right') ? 10 : -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {tooltip}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 bg-black transform rotate-45',
                position.includes('right') ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2',
                'top-1/2 -translate-y-1/2'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Multiple FABs with expandable menu
export interface FloatingActionMenuProps {
  mainIcon: React.ReactNode
  items: Array<{
    icon: React.ReactNode
    onClick: () => void
    label?: string
  }>
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  direction?: 'up' | 'down' | 'left' | 'right'
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  mainIcon,
  items,
  position = 'bottom-right',
  direction = 'up'
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const getItemPosition = (index: number) => {
    const distance = 70 * (index + 1)
    
    switch (direction) {
      case 'up':
        return { y: -distance, x: 0 }
      case 'down':
        return { y: distance, x: 0 }
      case 'left':
        return { x: -distance, y: 0 }
      case 'right':
        return { x: distance, y: 0 }
      default:
        return { y: -distance, x: 0 }
    }
  }

  return (
    <div className="relative">
      <FloatingActionButton
        icon={
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {mainIcon}
          </motion.div>
        }
        onClick={() => setIsOpen(!isOpen)}
        position={position}
      />

      <AnimatePresence>
        {isOpen && items.map((item, index) => (
          <motion.button
            key={index}
            className="fixed z-40 w-12 h-12 bg-white text-black border-2 border-black rounded-full flex items-center justify-center shadow-plyaz-sm hover:shadow-plyaz transition-all duration-200"
            style={{
              ...getItemPosition(index),
              [position.includes('bottom') ? 'bottom' : 'top']: position.includes('bottom') ? '2rem' : '2rem',
              [position.includes('right') ? 'right' : 'left']: position.includes('right') ? '2rem' : '2rem',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { delay: index * 0.1 }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0,
              transition: { delay: (items.length - index - 1) * 0.05 }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              item.onClick()
              setIsOpen(false)
            }}
          >
            {item.icon}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}