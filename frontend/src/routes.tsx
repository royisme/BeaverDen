import { lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppContent } from '@/components/layouts/app-content'
import { useUserStore } from '@/stores/user.store'

// 懒加载页面组件
const LandingPage = lazy(() => import('@/pages/landing'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const OnboardingPage = lazy(() => import('@/pages/onboarding'))
const LoginPage = lazy(() => import('@/pages/login'))

// 交易相关页面
const TransactionPage = lazy(() => import('@/pages/transaction'))
const TransactionImportPage = lazy(() => import('@/pages/transaction/import'))
const NewTransactionPage = lazy(() => import('@/pages/transaction/new'))
const EditTransactionPage = lazy(() => import('@/pages/transaction/edit'))

// 预算相关页面
const BudgetPage = lazy(() => import('@/pages/budget'))
const NewBudgetPage = lazy(() => import('@/pages/budget/new'))
const EditBudgetPage = lazy(() => import('@/pages/budget/edit'))

// 报表相关页面
const ReportsPage = lazy(() => import('@/pages/reports'))

// 账户相关页面
const BankAccountsPage = lazy(() => import('@/pages/accounts/bank'))
const InvestmentAccountsPage = lazy(() => import('@/pages/accounts/investment'))
const LoanAccountsPage = lazy(() => import('@/pages/accounts/loan'))
const OtherAccountsPage = lazy(() => import('@/pages/accounts/other'))

// 设置页面
const SettingsPage = lazy(() => import('@/pages/settings'))

// 路由守卫组件
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentUser = useUserStore((state) => state.currentUser);

  if (!currentUser) {
    // 如果用户未登录，重定向到登录页
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// 公共路由守卫组件
function PublicRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useUserStore((state) => state.currentUser);

  if (currentUser) {
    // 如果用户已登录，重定向到dashboard
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* 公共路由 - 不需要 SidebarProvider */}
      <Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/onboarding" element={<PublicRoute><OnboardingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* 应用路由 - 包含在 AppContent 中，自带 SidebarProvider */}
      <Route path="/app" element={<PrivateRoute><AppContent /></PrivateRoute>}>
        {/* 概览 */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* 交易 */}
        <Route path="transactions">
          <Route index element={<TransactionPage />} />
          <Route path="import" element={<TransactionImportPage />} />
          <Route path="new" element={<NewTransactionPage />} />
          <Route path=":id/edit" element={<EditTransactionPage />} />
        </Route>

        {/* 预算 */}
        <Route path="budget">
          <Route index element={<BudgetPage />} />
          <Route path="new" element={<NewBudgetPage />} />
          <Route path=":id/edit" element={<EditBudgetPage />} />
        </Route>

        {/* 报表 */}
        <Route path="reports" element={<ReportsPage />} />

        {/* 账户 */}
        <Route path="accounts">
          <Route path="bank-accounts" element={<BankAccountsPage />} />
          <Route path="investment-accounts" element={<InvestmentAccountsPage />} />
          <Route path="loan-accounts" element={<LoanAccountsPage />} />
          <Route path="other-accounts" element={<OtherAccountsPage />} />
        </Route>

        {/* 设置 */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 根路径重定向 */}
      <Route path="/" element={<Navigate to="/landing" replace />} />
    </Routes>
  )
}