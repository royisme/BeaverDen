// components/common/menu-items.tsx
import React from 'react'
import { SidebarMenu } from "@/components/ui/sidebar"
import type { MenuItem } from '@/types/menu'
import { MenuItem as MenuItemComp } from '@/components/common/menu-item'

interface MenuItemsProps {
  items: MenuItem[]
  onItemClick?: (item: MenuItem) => void
  activePath?: string
}

export const MenuItems: React.FC<MenuItemsProps> = ({ items, onItemClick, activePath }) => {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <MenuItemComp
          key={item.id}
          item={item}
          onClick={onItemClick}
          isActive={activePath === `/${item.menu_key}`}
        />
      ))}
    </SidebarMenu>
  )
}
