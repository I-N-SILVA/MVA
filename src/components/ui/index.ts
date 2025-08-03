export { Button, buttonVariants } from './button'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardSkeleton } from './card'
export { Input } from './input'
export { Textarea } from './textarea'
export { Select } from './select'
export { Progress } from './progress'
export { Badge, badgeVariants } from './badge'
export { Label } from './label'
export { default as FileUpload } from './FileUpload'
export { Toast, ToastContainer, ToastProvider, useToast, useToastContext } from './toast'
export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter, ModalTrigger, ConfirmationModal } from './modal'
export { Table, SimpleTable, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table'
export { Dropdown } from './dropdown'

export type { ButtonProps } from './button'
export type { CardProps } from './card'
export type { InputProps } from './input'
export type { TextareaProps } from './textarea'
export type { SelectProps, SelectOption } from './select'
export type { ProgressProps } from './progress'
export type { BadgeProps } from './badge'
export type { LabelProps } from './label'
export type { FileUploadProps, UploadedFile } from './FileUpload'
export type { ToastProps, ToastContainerProps } from './toast'

// Modal types
export interface ModalProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  preventScroll?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface ConfirmationModalProps {
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

// Table types
export type { Column, TableProps } from './table'

// Dropdown types
export type { DropdownOption, DropdownProps } from './dropdown'