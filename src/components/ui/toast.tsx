import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { slideInFromRight } from '@/lib/animations'

export interface ToastProps {
  id: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export const Toast: React.FC<ToastProps> = ({ 
  id,
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  action
}) => {
  const [isVisible, setIsVisible] = React.useState(true)
  const [progress, setProgress] = React.useState(100)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100))
        if (newProgress <= 0) {
          clearInterval(interval)
          handleClose()
          return 0
        }
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for exit animation
  }

  const iconMap = {
    success: '✓',
    error: '✗',
    info: 'ⓘ',
    warning: '⚠'
  }

  const colorMap = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={slideInFromRight}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            'relative bg-white border-2 border-black rounded-lg p-4 shadow-plyaz max-w-sm min-w-80 overflow-hidden',
            colorMap[type]
          )}
          role="alert"
        >
          {/* Progress bar */}
          <motion.div
            className="absolute top-0 left-0 h-1 bg-black"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />

          <div className="flex items-start space-x-3">
            {/* Icon */}
            <motion.div
              className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold"
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 30 }}
            >
              {iconMap[type]}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <motion.p
                className="text-sm font-medium text-black leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {message}
              </motion.p>

              {/* Action */}
              {action && (
                <motion.button
                  className="mt-2 text-xs font-bold uppercase tracking-wide text-black hover:underline focus:outline-none focus:underline"
                  onClick={action.onClick}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {action.label}
                </motion.button>
              )}
            </div>

            {/* Close button */}
            <motion.button
              onClick={handleClose}
              className="flex-shrink-0 w-5 h-5 text-gray-500 hover:text-black font-bold text-lg leading-none transition-colors duration-200"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast Container
export interface ToastContainerProps {
  toasts: ToastProps[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  onRemoveToast: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  onRemoveToast
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className={cn('fixed z-50 pointer-events-none', positionClasses[position])}>
      <div className="flex flex-col space-y-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => onRemoveToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { ...toast, id }])
    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = React.useCallback((message: string, options?: Partial<ToastProps>) => {
    return addToast({ message, type: 'success', ...options })
  }, [addToast])

  const error = React.useCallback((message: string, options?: Partial<ToastProps>) => {
    return addToast({ message, type: 'error', ...options })
  }, [addToast])

  const warning = React.useCallback((message: string, options?: Partial<ToastProps>) => {
    return addToast({ message, type: 'warning', ...options })
  }, [addToast])

  const info = React.useCallback((message: string, options?: Partial<ToastProps>) => {
    return addToast({ message, type: 'info', ...options })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}

// Toast Provider Context
interface ToastContextType {
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  success: (message: string, options?: Partial<ToastProps>) => string
  error: (message: string, options?: Partial<ToastProps>) => string
  warning: (message: string, options?: Partial<ToastProps>) => string
  info: (message: string, options?: Partial<ToastProps>) => string
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ 
  children: React.ReactNode
  position?: ToastContainerProps['position']
}> = ({ children, position = 'top-right' }) => {
  const { 
    toasts, 
    addToast, 
    removeToast, 
    clearToasts, 
    success, 
    error, 
    warning, 
    info 
  } = useToast()

  const contextValue = React.useMemo(() => ({
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }), [addToast, removeToast, clearToasts, success, error, warning, info])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        position={position}
        onRemoveToast={removeToast}
      />
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}