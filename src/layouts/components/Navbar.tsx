import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, Bell, Sun, Moon, Settings, LogOut, ChevronDown, User, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useAuthContext } from '@/features/auth/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useMarkAsRead } from '@/features/notifications/hooks/useMarkAsRead'
import { useMarkAllAsRead } from '@/features/notifications/hooks/useMarkAllAsRead'
import { ICON_MAP, CATEGORY_COLORS } from '@/features/notifications/components/NotificationItem'
import LanguageSwitcher from './LanguageSwitcher'

function Navbar() {
  const { t } = useTranslation('navbar')
  const navigate = useNavigate()
  const { logout } = useAuthContext()
  const user = useAuthStore((s) => s.user)
  const tenant = useAuthStore((s) => s.tenant)
  const { toggleSidebar, darkMode, toggleDarkMode } = useUiStore()
  const { getPrimaryRole, getRoleColor } = usePermissions()
  const { notifications, unreadCount } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const markAllRead = () => markAllAsRead.mutate()

  const handleLogout = async () => {
    setUserMenuOpen(false)
    await logout()
    navigate('/login')
  }

  const primaryRole = getPrimaryRole()
  const roleColor = getRoleColor()
  const plan = tenant?.plan ?? 'free'

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 h-full flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {(tenant?.name ?? 'A').charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
                {tenant?.name ?? t('orgName')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Role badge */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: `${roleColor}20`, color: roleColor }}
          >
            <Shield className="w-4 h-4" />
            {primaryRole}
          </div>

          {/* Plan badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full" />
            {t('plan.label')} {t(`plan.${plan}`, { defaultValue: plan })}
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen)
                setUserMenuOpen(false)
              }}
              aria-label="Notifications"
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t('notifications.title')}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {t('notifications.markAllRead')}
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      {t('notifications.empty')}
                    </p>
                  ) : (
                    notifications.slice(0, 5).map((n) => {
                      const Icon = ICON_MAP[n.icon] ?? Bell
                      const colorClass = CATEGORY_COLORS[n.category]
                      return (
                        <button
                          key={n.id}
                          onClick={() => markAsRead.mutate(n.id)}
                          className={`w-full px-4 py-3 flex gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!n.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {n.message}
                            </p>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2 text-center">
                  <button
                    onClick={() => {
                      navigate('/notifications')
                      setNotifOpen(false)
                    }}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Ver todas →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen)
                setNotifOpen(false)
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600 dark:text-primary-300" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.roles?.join(', ')}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{user?.email}</p>
                  <div className="flex flex-wrap gap-1">
                    {user?.roles?.map((role) => (
                      <span
                        key={role}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${roleColor}20`, color: roleColor }}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate('/settings')
                    setUserMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {t('userMenu.settings')}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('userMenu.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
