// src/components/layouts/app-content.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './app-header'
import { AppSidebar } from './app-sidebar'
import { menuGroups } from '@/mock/menuData'
import { mockUser } from '@/mock/userData'
import { SidebarInset } from "@/components/ui/sidebar"
import { useUserStore } from '@/stores/user.store'

export default function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const isConfigured = useUserStore((state) => state.isConfigured)

  // 路由守卫逻辑
  useEffect(() => {
    if (!isConfigured) {
      navigate('/onboarding', { replace: true })
    }
  }, [isConfigured, navigate])

  return (
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
  )
}