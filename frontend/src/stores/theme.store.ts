import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type ThemeState } from '@/types/theme'
import { Theme } from '@/types/enums'


export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: Theme.FRESH,
      isDarkMode: false,
      setTheme: (theme: Theme) => {
        set({ theme })
        // 更新根元素类名
        const root = window.document.documentElement
        root.classList.remove('theme-fresh', 'theme-natural', 'theme-ocean', 'theme-sunset')
        root.classList.add(`theme-${theme}`)
      },
      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.isDarkMode
          // 更新 dark 类
          const root = window.document.documentElement
          if (newDarkMode) {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
          return { isDarkMode: newDarkMode }
        })
      },
    }),
    {
      name: 'beaveden-theme-storage',
      // 选择要持久化的状态
      partialize: (state) => ({ 
        theme: state.theme,
        isDarkMode: state.isDarkMode 
      }),
    }
  )
)