'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItemFast } from '@/lib/animations'
import { Button } from '@/components/ui/button'

export interface DropdownOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
}

const dropdownVariants = cva(
  'relative w-full bg-white border-2 border-black rounded-lg shadow-plyaz-sm',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      variant: {
        default: '',
        outline: 'border-gray-300',
        minimal: 'border-gray-200 shadow-none',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

export interface DropdownProps extends VariantProps<typeof dropdownVariants> {
  options: DropdownOption[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  placeholder?: string
  label?: string
  error?: string
  searchable?: boolean
  multiple?: boolean
  disabled?: boolean
  clearable?: boolean
  loading?: boolean
  className?: string
  maxHeight?: number
  onCreate?: (value: string) => void
  createLabel?: string
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({
    options,
    value,
    onValueChange,
    placeholder = 'Select an option...',
    label,
    error,
    searchable = false,
    multiple = false,
    disabled = false,
    clearable = false,
    loading = false,
    size,
    variant,
    className,
    maxHeight = 200,
    onCreate,
    createLabel = 'Create',
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState('')
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const searchInputRef = React.useRef<HTMLInputElement>(null)

    // Handle clicks outside to close dropdown
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchTerm('')
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search input when dropdown opens
    React.useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, [isOpen, searchable])

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options
      return options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }, [options, searchTerm])

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setIsOpen(true)
        }
        return
      }

      switch (e.key) {
        case 'Escape':
          setIsOpen(false)
          setSearchTerm('')
          break
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[highlightedIndex])
          } else if (onCreate && searchTerm && filteredOptions.length === 0) {
            onCreate(searchTerm)
            setSearchTerm('')
            setIsOpen(false)
          }
          break
      }
    }

    // Handle option selection
    const handleOptionSelect = (option: DropdownOption) => {
      if (option.disabled) return

      if (multiple) {
        const currentValues = Array.isArray(value) ? value : []
        const newValues = currentValues.includes(option.value)
          ? currentValues.filter(v => v !== option.value)
          : [...currentValues, option.value]
        onValueChange?.(newValues)
      } else {
        onValueChange?.(option.value)
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    // Clear selection
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onValueChange?.(multiple ? [] : '')
    }

    // Get selected options for display
    const selectedOptions = React.useMemo(() => {
      if (!value) return []
      const values = Array.isArray(value) ? value : [value]
      return options.filter(option => values.includes(option.value))
    }, [value, options])

    // Check if option is selected
    const isOptionSelected = (optionValue: string) => {
      if (!value) return false
      return Array.isArray(value) ? value.includes(optionValue) : value === optionValue
    }

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

        <div ref={dropdownRef} className="relative" {...props}>
          {/* Trigger */}
          <div
            ref={ref}
            className={cn(
              dropdownVariants({ size, variant, className }),
              'flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200',
              'hover:shadow-plyaz-md focus:shadow-plyaz-md',
              isOpen && 'shadow-plyaz-md border-black',
              disabled && 'opacity-50 cursor-not-allowed hover:shadow-plyaz-sm',
              error && 'border-black bg-red-50'
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {selectedOptions.length > 0 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {multiple ? (
                    selectedOptions.map((option) => (
                      <span
                        key={option.value}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs font-medium rounded"
                      >
                        {option.icon && <span className="w-3 h-3">{option.icon}</span>}
                        {option.label}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOptionSelect(option)
                          }}
                          className="hover:bg-gray-700 rounded-full p-0.5"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <div className="flex items-center gap-2">
                      {selectedOptions[0].icon && (
                        <span className="w-4 h-4">{selectedOptions[0].icon}</span>
                      )}
                      <span className="font-medium text-black truncate">
                        {selectedOptions[0].label}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-500 font-medium">{placeholder}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {clearable && selectedOptions.length > 0 && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
              
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </motion.div>
            </div>
          </div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-lg shadow-plyaz-lg z-50 overflow-hidden"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* Search Input */}
                {searchable && (
                  <div className="p-3 border-b-2 border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search options..."
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-sm font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Options List */}
                <motion.div
                  className="max-h-60 overflow-y-auto"
                  style={{ maxHeight }}
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 font-medium">
                      Loading...
                    </div>
                  ) : filteredOptions.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-gray-500 font-medium mb-2">No options found</p>
                      {onCreate && searchTerm && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onCreate(searchTerm)
                            setSearchTerm('')
                            setIsOpen(false)
                          }}
                        >
                          {createLabel} "{searchTerm}"
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredOptions.map((option, index) => (
                      <motion.div
                        key={option.value}
                        variants={staggerItemFast}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                          'hover:bg-gray-100',
                          index === highlightedIndex && 'bg-gray-100',
                          option.disabled && 'opacity-50 cursor-not-allowed',
                          isOptionSelected(option.value) && 'bg-black text-white hover:bg-gray-800'
                        )}
                        onClick={() => handleOptionSelect(option)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        {option.icon && (
                          <span className="w-4 h-4 flex-shrink-0">{option.icon}</span>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{option.label}</div>
                          {option.description && (
                            <div className={cn(
                              'text-xs truncate',
                              isOptionSelected(option.value) ? 'text-gray-300' : 'text-gray-500'
                            )}>
                              {option.description}
                            </div>
                          )}
                        </div>

                        {isOptionSelected(option.value) && (
                          <Check className="w-4 h-4 flex-shrink-0" />
                        )}
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
Dropdown.displayName = 'Dropdown'

export { Dropdown }