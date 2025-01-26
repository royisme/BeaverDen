import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/providers/app-providers'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import App from './App'
import '@/styles/globals.css'

// 创建根元素
const container = document.getElementById('root')
if (!container) {
  throw new Error('Failed to find root element')
}

const root = createRoot(container)

// 渲染应用
root.render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>
)