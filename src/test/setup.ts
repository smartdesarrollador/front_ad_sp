import '@testing-library/jest-dom'
import axios from 'axios'
import { server } from './server'
import { toHaveNoViolations } from 'jest-axe'
import type { RunOptions } from 'axe-core'

// Force Axios to use the Node.js http adapter (not jsdom's XHR) so MSW can intercept requests.
// MSW/node intercepts node's http module — not jsdom's XMLHttpRequest.
axios.defaults.adapter = 'http'

// Recharts requires ResizeObserver — provide a no-op class for jsdom
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jest-axe: extend Vitest expect with toHaveNoViolations matcher
expect.extend(toHaveNoViolations)

// Axe run options: disable color-contrast (CSS not available in jsdom)
export const axeConfig: RunOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

// MSW lifecycle — bypass unhandled requests so vi.mock-based tests are unaffected
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
