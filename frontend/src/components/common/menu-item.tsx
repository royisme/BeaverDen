// components/common/menu-item.tsx
import React from 'react'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub
} from "@/components/ui/sidebar"
import { DynamicIcon } from '@/components/common/dynamic-icon'
import type { MenuItem as MenuItemType } from '@/types/menu'

interface MenuItemProps {
  item: MenuItemType
  isActive?: boolean
  onClick?: (item: MenuItemType) => void
}

export const MenuItem: React.FC<MenuItemProps> = ({ 
  item, 
  isActive,
  onClick 
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.name}
        isActive={isActive}
        onClick={() => onClick?.(item)}
      >
        <DynamicIcon name={item.icon} className="h-4 w-4" />
        <span>{item.name}</span>
      </SidebarMenuButton>
      {item.children && item.children.length > 0 && (
        <SidebarMenuSub>
          {item.children.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              isActive={isActive}
              onClick={onClick}
            />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}
