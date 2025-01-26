// components/common/menu-item.tsx
import React from 'react'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub
} from "@/components/ui/sidebar"
import { DynamicIcon } from '@/components/common/dynamic-icon'
import type { MenuItem as MenuItemType } from '@/types/menu'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  const getTranslationKey = (key: string) => {
    // 将 menu_key 转换为翻译 key
    // 例如: "bank-accounts" -> "menu.accounts.bank"
    //      "investment-accounts" -> "menu.accounts.investment"
    //      "dashboard" -> "menu.dashboard"
    const parts = key.split('-')
    if (parts[1] === 'accounts') {
      return `menu.accounts.${parts[0]}`
    }
    if (parts[0] === 'accounts') {
      return 'menu.accounts.title'
    }
    return `menu.${parts[0]}`
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={t(getTranslationKey(item.menu_key))}
        isActive={isActive}
        onClick={() => onClick?.(item)}
      >
        <DynamicIcon name={item.icon} className="h-4 w-4" />
        <span>{t(getTranslationKey(item.menu_key))}</span>
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
