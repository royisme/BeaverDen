import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import type { MenuItem, BreadcrumbItem } from '@/types/menu'

/**
 * Generate breadcrumbs from menu items
 * @param path current path
 * @param menuItems menu items
 * @returns breadcrumbs
 */
export function generateBreadcrumbs(path: string, menuItems: MenuItem[]): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = []
  // Remove /app prefix if it exists
  const normalizedPath = path.replace(/^\/app/, '')

  function findPath(items: MenuItem[]): boolean {
    for (const item of items) {
      const itemPath = item.menu_key.startsWith('/') ? item.menu_key : `/${item.menu_key}`
      if (itemPath === normalizedPath) {
        // Found current item
        if (item.breadcrumb && item.breadcrumb.parent) {
          const parentItem = items.find(i => `/${i.menu_key}` === item.breadcrumb!.parent)
          if (parentItem) {
            breadcrumbs.push({ title: parentItem.breadcrumb?.title || parentItem.name, path: `/app${parentItem.menu_key}`})
          }
        }
        breadcrumbs.push({ title: item.breadcrumb?.title || item.name, path: `/app${itemPath}`, isActive: true })
        return true
      }
      if (item.children && findPath(item.children)) {
        // If found in children
        if (item.breadcrumb) {
          breadcrumbs.unshift({ title: item.breadcrumb.title || item.name, path: `/app/${item.menu_key}`})
        }
        return true
      }
    }
    return false
  }

  findPath(menuItems)
  return breadcrumbs
}

export function generateRandomAvatarPath(username: string) {
  return `https://api.dicebear.com/9.x/miniavs/svg?seed=${username}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatMoney(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}