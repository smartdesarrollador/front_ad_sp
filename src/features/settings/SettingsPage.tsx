import { useState } from 'react'
import { User, Shield, Building2, Monitor, Bell } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import ProfileTab from './tabs/ProfileTab'
import SecurityTab from './tabs/SecurityTab'
import OrganizationTab from './tabs/OrganizationTab'
import InterfaceTab from './tabs/InterfaceTab'
import NotificationsTab from './tabs/NotificationsTab'

type TabId = 'profile' | 'security' | 'organization' | 'interface' | 'notifications'

interface TabItem {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

function SettingsPage() {
  const { isAdmin } = usePermissions()
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  const TABS: TabItem[] = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Seguridad', icon: Shield },
    ...(isAdmin ? [{ id: 'organization' as TabId, label: 'Organización', icon: Building2 }] : []),
    { id: 'interface', label: 'Interfaz', icon: Monitor },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configuración</h1>

      <div className="flex gap-6">
        {/* Vertical tab nav */}
        <nav className="min-w-[200px] space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-600 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'organization' && isAdmin && <OrganizationTab />}
          {activeTab === 'interface' && <InterfaceTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
