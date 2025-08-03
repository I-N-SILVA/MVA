import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { inputVariants, labelFloatVariants, errorShakeVariants } from '@/lib/animations'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  floatingLabel?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    label,
    floatingLabel = false,
    icon,
    iconPosition = 'left',
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    disabled,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!value)
    const [localValue, setLocalValue] = React.useState(value || '')

    React.useEffect(() => {
      setHasValue(!!value)
      setLocalValue(value || '')
    }, [value])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      setHasValue(!!newValue)
      onChange?.(e)
    }

    const shouldFloatLabel = floatingLabel && (isFocused || hasValue)
    const showPlaceholder = !floatingLabel || !label || shouldFloatLabel

    return (
      <div className="space-y-2">
        <div className="relative">
          {/* Floating Label */}
          {label && floatingLabel && (
            <motion.label
              htmlFor={props.id}
              className={cn(
                'absolute left-3 font-medium transition-all duration-200 pointer-events-none z-10 bg-white px-1',
                shouldFloatLabel
                  ? 'top-0 text-xs transform -translate-y-1/2'
                  : 'top-1/2 text-base text-gray-500 transform -translate-y-1/2',
                error ? 'text-black' : isFocused ? 'text-black' : 'text-gray-500',
                disabled && 'opacity-50'
              )}
              variants={labelFloatVariants}
              initial="initial"
              animate={shouldFloatLabel ? "float" : "initial"}
            >
              {label}
            </motion.label>
          )}

          {/* Regular Label */}
          {label && !floatingLabel && (
            <label 
              htmlFor={props.id}
              className={cn(
                'block text-sm font-medium mb-2 text-black',
                disabled && 'opacity-50'
              )}
            >
              {label}
            </label>
          )}

          {/* Icon */}
          {icon && (
            <div className={cn(
              'absolute top-1/2 transform -translate-y-1/2 text-gray-500 z-10',
              iconPosition === 'left' ? 'left-3' : 'right-3'
            )}>
              {icon}
            </div>
          )}
          
          {/* Input Field */}
          <motion.input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-lg border-2 bg-white px-4 py-2 text-base font-medium transition-all duration-200 min-h-[44px]', // Ensure 44px minimum touch target
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'focus-visible:outline-none focus-visible:ring-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Default state
              'border-gray-300 text-black placeholder:text-gray-400',
              // Focus state
              'focus:border-black focus:shadow-plyaz-sm',
              // Error state
              error && 'border-black bg-red-50',
              // Icon padding
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              // Floating label padding
              floatingLabel && label && 'pt-2',
              className
            )}
            ref={ref}
            value={localValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={showPlaceholder ? placeholder : ''}
            disabled={disabled}
            variants={inputVariants}
            whileFocus="focus"
            animate={isFocused ? "focus" : "blur"}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
        </div>
        
        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${props.id}-error`}
              className="text-sm font-medium text-black flex items-center space-x-1"
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: -10, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              variants={errorShakeVariants}
              animate="shake"
              role="alert"
              aria-live="polite"
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
Input.displayName = 'Input'

export { Input }