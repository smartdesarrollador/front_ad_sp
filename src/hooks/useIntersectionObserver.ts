import { useState, useEffect, useRef } from 'react'

export function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options?: IntersectionObserverInit,
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const savedOptions = useRef(options)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(([e]) => setEntry(e), savedOptions.current)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])

  return entry
}
