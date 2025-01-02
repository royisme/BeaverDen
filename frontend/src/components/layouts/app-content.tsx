import { Outlet } from 'react-router-dom'
import { AppSidebar } from './app-sidebar'
import { Header } from './app-header'
import { menuGroups } from '@/mock/menuData'
import { mockUser } from '@/mock/userData'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AppContent() {
  return (
    <SidebarProvider>
      <AppSidebar 
        menuGroups={menuGroups}
        user={mockUser}
      />
      <SidebarInset>
        <Header title="Good morning, Alex" subtitle="Welcome back" />
        <div className="flex flex-1 flex-col gap-4 p-4">

            <Outlet />
          </div>
        </SidebarInset>
    </SidebarProvider>
  )
}