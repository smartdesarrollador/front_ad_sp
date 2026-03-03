export interface RolePermission {
  id: string
  codename: string
  name: string
}

export interface RoleDetail {
  id: string
  name: string
  description: string
  is_system_role: boolean
  user_count: number
  permissions: RolePermission[]
}

export interface Permission {
  id: string
  codename: string
  name: string
  resource: string
  description: string
}

export interface RoleCreateRequest {
  name: string
  description?: string
  permission_ids?: string[]
}

export interface RoleUpdateRequest {
  id: string
  name: string
  description?: string
  permission_ids?: string[]
}
