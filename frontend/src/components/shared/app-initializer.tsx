// src/components/shared/app-initializer.tsx
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import { useUserStore } from '@/stores/user.store'
import { useSessionStore } from '@/stores/session.store'

export function AppInitializer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isInitializing, error, initializeApp, clearError } = useAppStore()
  const { currentUser } = useUserStore()
  const { validateSession } = useSessionStore()

  useEffect(() => {
    const initialize = async () => {
      try {
        // 执行初始化
        await initializeApp()
        
        // 验证会话
        const isValidSession = await validateSession()
        
        // 定义公共路由路径
        const publicPaths = ['/landing', '/onboarding', '/login']
        const currentPath = location.pathname
        
        // 如果用户已登录且在公共路径，重定向到应用主页
        if (isValidSession && currentUser && (currentPath === '/' || publicPaths.includes(currentPath))) {
          navigate('/app', { replace: true })
          return
        }
        
        // 如果用户未登录且不在公共路径，重定向到登录页
        if (!isValidSession && !currentUser && !publicPaths.includes(currentPath)) {
          navigate('/landing', { replace: true })
          return
        }
      } catch (err) {
        console.error('App initialization failed:', err)
      }
    }

    initialize()
  }, [initializeApp, validateSession, navigate, currentUser, location.pathname])

  // 显示加载状态
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-xl">
          <AlertTitle>Failed to Load</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => {
                clearError()
                initializeApp()
              }}
              className="mt-4 text-sm font-medium underline hover:text-primary"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 正常情况下不渲染任何内容
  return null
}