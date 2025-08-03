import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { errorShakeVariants } from '@/lib/animations'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  error?: string
  label?: string
  className?: string
  disabled?: boolean
  name?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onValueChange, placeholder, error, label, className, disabled, name, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label className={cn(
            'block text-sm font-medium text-black',
            disabled && 'opacity-50'
          )}>
            {label}
          </label>
        )}

        <div className="relative">
          <motion.select
            ref={ref}
            name={name}
            value={value || ''}
            onChange={(e) => onValueChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={cn(
              'flex h-12 w-full appearance-none rounded-lg border-2 bg-white px-4 py-2 text-base font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Default state
              'border-gray-300 text-black',
              // Focus state
              'focus:border-black focus:shadow-plyaz-sm',
              // Error state
              error && 'border-black bg-red-50',
              className
            )}
            whileFocus={{ scale: 1.01 }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-gray-400">
                {placeholder}
              </option>
            )}
            {options?.map((option) => (
              <option key={option.value} value={option.value} className="text-black">
                {option.label}
              </option>
            ))}
          </motion.select>
          
          <motion.div
            className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
            animate={{ rotate: isFocused ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </motion.div>
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              className="text-sm font-medium text-black flex items-center space-x-1"
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: -10, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              variants={errorShakeVariants}
              animate="shake"
            >
              <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                !
              </span>
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }