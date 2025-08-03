'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  variant?: 'button' | 'icon' | 'dropdown'
  size?: 'sm' | 'default' | 'lg'
}

export function ThemeToggle({ 
  className, 
  variant = 'button',
  size = 'default' 
}: ThemeToggleProps) {
  const { theme, toggleTheme, setTheme } = useTheme()
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light')

  // Track system theme preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showDropdown])

  const iconVariants = {
    initial: { rotate: 0, scale: 0 },
    animate: { rotate: 0, scale: 1 },
    exit: { rotate: 180, scale: 0 }
  }

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size={size === 'sm' ? 'sm' : 'icon'}
        onClick={toggleTheme}
        className={cn('relative overflow-hidden', className)}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <AnimatePresence mode="wait">
          {theme === 'light' ? (
            <motion.div
              key="sun"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size={size}
          onClick={(e) => {
            e.stopPropagation()
            setShowDropdown(!showDropdown)
          }}
          className={cn('min-w-[44px] min-h-[44px]', className)}
          aria-label="Theme options"
          aria-expanded={showDropdown}
        >
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.div
                key="sun"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Light</span>
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Dark</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-lg shadow-plyaz-sm dark:shadow-white/20 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    setTheme('light')
                    setShowDropdown(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors min-h-[44px]',
                    theme === 'light' 
                      ? 'bg-black text-white dark:bg-white dark:text-black' 
                      : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </button>
                
                <button
                  onClick={() => {
                    setTheme('dark')
                    setShowDropdown(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors min-h-[44px]',
                    theme === 'dark' 
                      ? 'bg-black text-white dark:bg-white dark:text-black' 
                      : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </button>
                
                <button
                  onClick={() => {
                    // Remove saved preference to follow system
                    localStorage.removeItem('plyaz-theme')
                    setTheme(systemTheme)
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px]"
                >
                  <Monitor className="h-4 w-4" />
                  <span>System</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Default button variant
  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleTheme}
      className={cn('min-w-[44px] min-h-[44px]', className)}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="sun"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">Light</span>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Dark</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}