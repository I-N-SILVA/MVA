'use client'

import * as React from 'react'
import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { modalVariants, overlayVariants, springConfig } from '@/lib/animations'
import { Button } from '@/components/ui/button'

const modalVariantsStyles = cva(
  'relative bg-white border-2 border-black rounded-lg p-0 max-h-[85vh] overflow-hidden',
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
      },
      shadow: {
        none: '',
        sm: 'shadow-plyaz-sm',
        md: 'shadow-plyaz',
        lg: 'shadow-plyaz-lg',
        xl: 'shadow-plyaz-xl',
      },
    },
    defaultVariants: {
      size: 'md',
      shadow: 'lg',
    },
  }
)

interface ModalProps extends VariantProps<typeof modalVariantsStyles> {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  preventScroll?: boolean
  className?: string
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    children,
    isOpen,
    onClose,
    title,
    description,
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    preventScroll = true,
    size,
    shadow,
    className,
    ...props
  }, ref) => {
    // Handle body scroll lock
    React.useEffect(() => {
      if (!preventScroll) return

      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen, preventScroll])

    // Handle escape key
    React.useEffect(() => {
      if (!closeOnEscape) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }, [isOpen, onClose, closeOnEscape])

    // Handle overlay click
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose()
      }
    }

    return (
      <AnimatePresence mode="wait">
        {isOpen && (
          <div className="fixed inset-0 z-modal">
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleOverlayClick}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <motion.div
                ref={ref}
                className={cn(modalVariantsStyles({ size, shadow, className }))}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                {...props}
              >
                {/* Header */}
                {(title || description || showCloseButton) && (
                  <div className="flex items-start justify-between p-6 border-b-2 border-gray-200">
                    <div className="flex-1">
                      {title && (
                        <h2 className="text-2xl font-bold text-black leading-tight">
                          {title}
                        </h2>
                      )}
                      {description && (
                        <p className="text-sm text-gray-600 font-medium mt-2">
                          {description}
                        </p>
                      )}
                    </div>
                    
                    {showCloseButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="ml-4 -mt-2 -mr-2 h-auto p-2 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close modal</span>
                      </Button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    )
  }
)
Modal.displayName = 'Modal'

// Modal Header Component
const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 p-6 border-b-2 border-gray-200', className)}
    {...props}
  />
))
ModalHeader.displayName = 'ModalHeader'

// Modal Title Component
const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-2xl font-bold text-black leading-tight', className)}
    {...props}
  />
))
ModalTitle.displayName = 'ModalTitle'

// Modal Description Component
const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600 font-medium', className)}
    {...props}
  />
))
ModalDescription.displayName = 'ModalDescription'

// Modal Content Component
const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6', className)}
    {...props}
  />
))
ModalContent.displayName = 'ModalContent'

// Modal Footer Component
const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end space-x-3 p-6 border-t-2 border-gray-200 bg-gray-50',
      className
    )}
    {...props}
  />
))
ModalFooter.displayName = 'ModalFooter'

// Modal Trigger Component (for accessibility)
interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const ModalTrigger = React.forwardRef<HTMLButtonElement, ModalTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        ...props,
      })
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold',
          'bg-white border-2 border-black text-black',
          'hover:bg-black hover:text-white transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
ModalTrigger.displayName = 'ModalTrigger'

// Confirmation Modal Preset
interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      shadow="lg"
    >
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
ConfirmationModal.displayName = 'ConfirmationModal'

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  ModalTrigger,
  ConfirmationModal,
}