import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  CreditCard,
  Receipt,
  Building2,
  BarChart3,
  FileText,
  HelpCircle,
  Settings,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { usePermissions } from '@/hooks/usePermissions'

interface MenuItem {
  label: string
  to: string
  icon: LucideIcon
  permission: string | null
}

interface MenuGroup {
  group: string
  items: MenuItem[]
}

function Sidebar() {
  const { t } = useTranslation('sidebar')
  const navigate = useNavigate()
  const { sidebarOpen } = useUiStore()
  const { hasPermission, canUpgradePlan } = usePermissions()

  const MENU_GROUPS: MenuGroup[] = [
    {
      group: t('sections.main'),
      items: [
        { label: t('menu.dashboard'), to: '/', icon: LayoutDashboard, permission: null },
      ],
    },
    {
      group: t('sections.management'),
      items: [
        { label: t('menu.users'), to: '/users', icon: Users, permission: 'auth_app.view_customuser' },
        { label: t('menu.roles'), to: '/roles', icon: Shield, permission: 'rbac.view_role' },
        { label: t('menu.permissions'), to: '/permissions', icon: Key, permission: 'rbac.view_permission' },
        { label: t('menu.clients'), to: '/clients', icon: Building2, permission: null },
        { label: t('menu.promotions'), to: '/promotions', icon: Tag, permission: null },
        { label: t('menu.analytics'), to: '/reports', icon: BarChart3, permission: 'analytics.view_reports' },
        { label: t('menu.audit'), to: '/audit', icon: FileText, permission: 'audit.view_auditlog' },
      ],
    },
    {
      group: 'Administración',
      items: [
        { label: t('menu.subscription'), to: '/subscription', icon: CreditCard, permission: null },
        { label: t('menu.billing'), to: '/billing', icon: Receipt, permission: null },
      ],
    },
    {
      group: t('sections.system'),
      items: [
        { label: 'Soporte', to: '/support', icon: HelpCircle, permission: null },
        { label: t('menu.settings'), to: '/settings', icon: Settings, permission: null },
      ],
    },
  ]

  const visibleGroups = MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => item.permission === null || hasPermission(item.permission),
    ),
  })).filter((group) => group.items.length > 0)

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-6">
          {visibleGroups.map((group) => (
            <div key={group.group}>
              <p className="px-4 mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span>{item.label}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
                          )}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade CTA */}
        {canUpgradePlan && (
          <div className="p-4 mt-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 rounded-xl p-4 text-white">
              <h3 className="font-semibold text-sm mb-2">{t('upgrade.title')}</h3>
              <p className="text-xs text-primary-100 dark:text-primary-200 mb-3">
                {t('upgrade.description')}
              </p>
              <button
                onClick={() => navigate('/subscription')}
                className="w-full bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 text-xs font-medium py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-600 transition-colors"
              >
                {t('upgrade.button')}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
