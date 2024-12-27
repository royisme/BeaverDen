import { Outlet } from 'react-router-dom'
import { AppSidebar } from './app-sidebar'
import { Header } from './app-header'
import { menuGroups } from '@/mock/menuData'
import { mockUser } from '@/mock/userData'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AppContent() {
  return (
    <SidebarProvider>

    <div className="flex min-h-screen">
      <AppSidebar 
        menuGroups={menuGroups}
        user={mockUser}
      />
      <SidebarInset className="flex-1 flex flex-col">
        <Header title="Good morning, Alex" subtitle="Welcome back" />
        <div className="flex-1 p-6">
          <div className="bg-card rounded-lg p-6">
            <Outlet />
          </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}