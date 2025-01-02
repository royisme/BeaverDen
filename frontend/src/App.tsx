// src/App.tsx
import { Suspense } from 'react'
import { HashRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes'
import { Loader2 } from 'lucide-react'
import { AppInitializer } from '@/components/shared/app-initializer'

export default function App() {
  
  return (
    <HashRouter>
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <AppInitializer />
          <AppRoutes />
        </Suspense>
    </HashRouter>
  )
}