import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// 懒加载页面组件
const LandingPage = lazy(() => import('@/pages/landing'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const OnboardingPage = lazy(() => import('@/pages/onboarding'))
const LoginPage = lazy(() => import('@/pages/login'))

// 定义应用布局组件
const AppContent = lazy(() => import('@/components/layouts/app-content'))

export function AppRoutes() {
  return (
    <Routes>
      {/* 公共路由 - 不需要 SidebarProvider */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* 应用路由 - 包含在 AppContent 中，自带 SidebarProvider */}
      <Route path="/app" element={<AppContent />}>
        <Route index element={<DashboardPage />} />
        {/* 其他需要侧边栏的路由 */}
      </Route>

      {/* 根路径重定向 */}
      <Route path="/" element={<Navigate to="/landing" replace />} />
    </Routes>
  )
}