import '@testing-library/jest-dom'

// Recharts requires ResizeObserver — provide a no-op class for jsdom
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
