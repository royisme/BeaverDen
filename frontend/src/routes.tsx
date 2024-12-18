import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import type { MenuItem } from '@/types/menu'

// 懒加载页面组件
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const OnboardingPage = lazy(() => import('@/pages/onboarding'))

// 定义应用布局组件
const AppContent = lazy(() => import('@/components/layouts/app-content'))

// 定义路由元信息类型
type RouteConfig = RouteObject & {
  key?: string
  menuItem?: MenuItem
  children?: RouteConfig[]
}

// 路由配置
export const routes: RouteConfig[] = [
  {
    path: '/onboarding',
    element: <OnboardingPage />,
    key: 'onboarding',
  },
  {
    path: '/',
    key: 'root',
    element: <AppContent />,
    children: [
      {
        index: true,

        element: <DashboardPage />
      }
    ]
  }
]

// 路由守卫函数
export function guardRoute(isConfigured: boolean, pathname: string): string | null {
  // 如果用户未完成配置且不在引导流程页面，重定向到引导页
  if (!isConfigured && pathname !== '/onboarding') {
    return '/onboarding'
  }
  
  // 如果用户已完成配置且在引导流程页面，重定向到仪表盘
  if (isConfigured && pathname === '/onboarding') {
    return '/dashboard'
  }

  return null
}