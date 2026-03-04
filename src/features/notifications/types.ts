export type NotificationCategory = 'security' | 'users' | 'billing' | 'system' | 'roles'
export type NotificationFilter = 'all' | 'unread' | NotificationCategory

export interface AppNotification {
  id: string
  category: NotificationCategory
  title: string
  message: string
  icon: string
  read: boolean
  created_at: string
}
