// src/App.tsx
import { Suspense } from 'react'
import { HashRouter, useRoutes } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/sidebar"
import { routes } from '@/routes'
import { Loader2 } from 'lucide-react'

// 路由渲染组件
function AppRoutes() {
  const element = useRoutes(routes)
  
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      {element}
    </Suspense>
  )
}

export default function App() {
  return (
    <SidebarProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </SidebarProvider>
  )
}