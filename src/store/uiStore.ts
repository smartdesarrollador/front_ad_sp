import { create } from 'zustand'

interface Notification {
  id: string
  message: string
  read: boolean
}

interface UiState {
  sidebarOpen: boolean
  darkMode: boolean
  activeModal: string | null
  notifications: Notification[]
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
  setActiveModal: (modal: string | null) => void
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

const getInitialDarkMode = (): boolean => {
  try {
    return localStorage.getItem('darkMode') === 'true'
  } catch {
    return false
  }
}

const syncDarkMode = (enabled: boolean) => {
  if (enabled) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  try {
    localStorage.setItem('darkMode', String(enabled))
  } catch {
    // ignore
  }
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  darkMode: getInitialDarkMode(),
  activeModal: null,
  notifications: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode
      syncDarkMode(next)
      return { darkMode: next }
    }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  addNotification: (n) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        { ...n, id: crypto.randomUUID(), read: false },
      ],
    })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}))
