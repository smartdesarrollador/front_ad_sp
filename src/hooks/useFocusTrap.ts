import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean = true,
): void {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    previousFocusRef.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    )

    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const elements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      if (elements.length === 0) return

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [containerRef, enabled])
}
