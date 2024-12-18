import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import type { MenuItem, BreadcrumbItem } from '@/types/menu'



export function generateBreadcrumbs(path: string, menuItems: MenuItem[]): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = []

  function findPath(items: MenuItem[]): boolean {
    for (const item of items) {
      if (item.menu_key === path || `/${item.menu_key}` === path) {
        // 找到当前item
        if (item.breadcrumb && item.breadcrumb.parent) {
          const parentItem = items.find(i => `/${i.menu_key}` === item.breadcrumb!.parent)
          if (parentItem) {
            breadcrumbs.push({ title: parentItem.breadcrumb?.title || parentItem.name, path: `/${parentItem.menu_key}`})
          }
        }
        breadcrumbs.push({ title: item.breadcrumb?.title || item.name, path: `/${item.menu_key}`, isActive: true })
        return true
      }
      if (item.children && findPath(item.children)) {
        // 如果在children中找到
        if (item.breadcrumb) {
          breadcrumbs.unshift({ title: item.breadcrumb.title || item.name, path: `/${item.menu_key}`})
        }
        return true
      }
    }
    return false
  }

  findPath(menuItems)
  return breadcrumbs
}