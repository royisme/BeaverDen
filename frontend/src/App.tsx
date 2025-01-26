// src/App.tsx
import { Suspense, useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes'
import { Loader2 } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/i18n/config' // 导入i18n配置

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  const { isInitializing, initializeApp } = useAppStore();

  // 在应用启动时初始化一次
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // 如果正在初始化，显示加载状态
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
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <AppRoutes />
        </Suspense>
      </HashRouter>
    </QueryClientProvider>
  )
}