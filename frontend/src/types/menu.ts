// types/menu.ts
import { MenuType, MenuGroup, SubscriptionTier } from './enums'

export interface Permission {
  id: number
  permission_key: string
  description: string
}

export interface Feature {
  id: number
  feature_key: string
  subscription_tier: SubscriptionTier
  is_active: boolean
  custom_config?: Record<string, any>
  required_permissions: Permission[]
  module_key: string
  config_schema?: Record<string, any>
}

export interface MenuItem {
  id: number
  menu_key: string
  is_visible: boolean
  custom_order?: number
  type: MenuType
  group: MenuGroup
  name: string
  icon: string
  parent_id?: number
  required_features: Feature[]
  children?: MenuItem[]
  breadcrumb?: {
    title: string
    parent?: string
  }
}

export interface BreadcrumbItem {
  title: string
  path?: string
  isActive?: boolean
}