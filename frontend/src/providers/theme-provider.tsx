// src/providers/theme-provider.tsx
import { useEffect } from "react"
import { useThemeStore } from "@/stores/theme.store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, isDarkMode } = useThemeStore()

  // 初始化主题
  useEffect(() => {
    const root = window.document.documentElement
    // 设置主题
    root.classList.remove('theme-fresh', 'theme-natural', 'theme-ocean', 'theme-sunset')
    root.classList.add(`theme-${theme}`)
    // 设置暗色模式
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  return children
}