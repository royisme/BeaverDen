// stores/navigationStore.ts
import { create } from 'zustand'
import type { MenuItem } from '@/types/menu'
import { generateBreadcrumbs } from '@/lib/utils'

interface BreadcrumbItem {
  title: string
  path?: string
  isActive?: boolean
}

interface NavigationState {
  currentPath: string
  breadcrumbs: BreadcrumbItem[]
  setCurrentPath: (path: string, menuItems: MenuItem[]) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPath: '',
  breadcrumbs: [],
  setCurrentPath: (path, menuItems) => {
    const breadcrumbs = generateBreadcrumbs(path, menuItems)
    set({ currentPath: path, breadcrumbs })
  }
}))
