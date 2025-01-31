export type UserRole = 'owner' | 'admin' | 'user'

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Profile extends User {
  organizations: Organization[]
  currentOrganization?: Organization
  role?: UserRole
} 