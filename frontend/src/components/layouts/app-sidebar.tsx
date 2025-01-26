//src/components/layout/app-sidebar.tsx
import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Wallet } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  useSidebar
} from "@/components/ui/sidebar"
import type { User } from "@/types/user"
import type { MenuItem } from "@/types/menu"
import { UserProfile } from "@/components/layouts/user-profile"
import { MenuItems } from "@/components/common/menu-items"
import { cn } from "@/lib/utils"
import { useNavigationStore } from '@/stores/navigationStore'

interface MenuGroupData {
  id: string
  title: string
  items: MenuItem[]
}

interface AppSidebarProps {
  menuGroups: MenuGroupData[]
  user: User
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ menuGroups, user }) => {
  const { toggleSidebar, state } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const setCurrentPath = useNavigationStore(state => state.setCurrentPath)

  // 更新导航状态
  useEffect(() => {
    const path = location.pathname
    setCurrentPath(path, menuGroups.flatMap(group => group.items))
  }, [location.pathname, menuGroups, setCurrentPath])

  const handleMenuItemClick = (item: MenuItem) => {
    let path = `/${item.menu_key}`;

    if (item.breadcrumb?.parent) {
      path = `${item.breadcrumb.parent}/${item.menu_key}`;
    }
    const url = `/app${path}` 
    console.log("click menu item", url)
    navigate(url);
  }

  return (
    <Sidebar className="bg-primary">
      <SidebarHeader>
       <div className="flex items-center space-x-2 py-6 px-4">
          <img src="/logo.png"  width={32} height={32} />
          <span className="font-semibold text-lg">Beaveden</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-6 bg-primary/90 rounded-full shadow-md hover:bg-accent"
          onClick={toggleSidebar}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform duration-200",
            state === 'collapsed' && 'rotate-180'
          )} />
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <UserProfile user={user} />
        {menuGroups.map((group) => (
          <SidebarGroup key={group.id}>
            <span className="px-4 text-sm font-medium text-muted-foreground">
              {group.title}
            </span>
            <MenuItems items={group.items} onItemClick={handleMenuItemClick} />
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
