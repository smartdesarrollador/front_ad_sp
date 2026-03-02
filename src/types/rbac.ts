export interface Permission {
  id: string
  codename: string
  name: string
  resource: string
  action: string
  category: string
}

export interface Role {
  id: string
  name: string
  description: string
  isSystemRole: boolean
  usersCount: number
  permissionsCount: number
  color: string
  parentRole: string | null
  createdAt: string
  permissions?: Permission[]
}

export interface UserRole {
  userId: string
  roleId: string
  roleName: string
  assignedAt: string
}
