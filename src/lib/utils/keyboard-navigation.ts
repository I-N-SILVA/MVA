/**
 * Keyboard navigation utilities for better accessibility
 */

export type KeyboardEventHandler = (event: KeyboardEvent) => void

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors))
}

/**
 * Move focus to the next/previous focusable element
 */
export function moveFocus(direction: 'next' | 'previous', container?: HTMLElement): void {
  const focusableElements = getFocusableElements(container || document.body)
  const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
  
  if (currentIndex === -1) return

  let nextIndex: number
  if (direction === 'next') {
    nextIndex = (currentIndex + 1) % focusableElements.length
  } else {
    nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
  }

  focusableElements[nextIndex]?.focus()
}

/**
 * Trap focus within a container (useful for modals, dropdowns)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  // Focus the first element initially
  firstElement?.focus()

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Handle arrow key navigation for lists/grids
 */
export function handleArrowKeyNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    orientation?: 'vertical' | 'horizontal' | 'grid'
    columnsPerRow?: number
    circular?: boolean
  } = {}
): number {
  const { orientation = 'vertical', columnsPerRow = 1, circular = true } = options

  let newIndex = currentIndex

  switch (event.key) {
    case 'ArrowDown':
      if (orientation === 'vertical' || orientation === 'grid') {
        newIndex = orientation === 'grid' 
          ? currentIndex + columnsPerRow
          : currentIndex + 1
      }
      break

    case 'ArrowUp':
      if (orientation === 'vertical' || orientation === 'grid') {
        newIndex = orientation === 'grid'
          ? currentIndex - columnsPerRow
          : currentIndex - 1
      }
      break

    case 'ArrowRight':
      if (orientation === 'horizontal' || orientation === 'grid') {
        newIndex = currentIndex + 1
      }
      break

    case 'ArrowLeft':
      if (orientation === 'horizontal' || orientation === 'grid') {
        newIndex = currentIndex - 1
      }
      break

    case 'Home':
      newIndex = 0
      break

    case 'End':
      newIndex = items.length - 1
      break

    default:
      return currentIndex
  }

  // Handle boundaries
  if (circular) {
    if (newIndex < 0) {
      newIndex = items.length - 1
    } else if (newIndex >= items.length) {
      newIndex = 0
    }
  } else {
    newIndex = Math.max(0, Math.min(newIndex, items.length - 1))
  }

  // Focus the new element
  if (newIndex !== currentIndex && items[newIndex]) {
    event.preventDefault()
    items[newIndex].focus()
  }

  return newIndex
}

/**
 * Handle common keyboard shortcuts
 */
export function handleCommonShortcuts(event: KeyboardEvent): boolean {
  // Escape key handling
  if (event.key === 'Escape') {
    // Close any open dropdowns, modals, etc.
    const openElements = document.querySelectorAll('[aria-expanded="true"]')
    openElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.click() // Trigger close
      }
    })
    return true
  }

  // Enter/Space on buttons
  if ((event.key === 'Enter' || event.key === ' ') && 
      document.activeElement instanceof HTMLElement &&
      (document.activeElement.tagName === 'BUTTON' || 
       document.activeElement.getAttribute('role') === 'button')) {
    event.preventDefault()
    document.activeElement.click()
    return true
  }

  return false
}

/**
 * Make an element keyboard navigable
 */
export function makeKeyboardNavigable(element: HTMLElement, options: {
  role?: string
  tabIndex?: number
  onClick?: () => void
} = {}): void {
  const { role = 'button', tabIndex = 0, onClick } = options

  element.setAttribute('role', role)
  element.setAttribute('tabindex', tabIndex.toString())

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
      element.click()
    }
  }

  element.addEventListener('keydown', handleKeyDown)
}

/**
 * Skip links for screen readers
 */
export function addSkipLink(targetId: string, text: string = 'Skip to main content'): void {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = text
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded'
  
  document.body.insertBefore(skipLink, document.body.firstChild)
}

/**
 * Announce content to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}