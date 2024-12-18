// src/stores/app.store.ts
import { User } from '@/types/user'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'


interface AppState {
  // 系统状态
  isDatabaseReady: boolean
  updateAvailable: boolean
  isInitializing: boolean
  initializationError: string | null

  // 用户状态
  isLoggedIn: boolean
  currentUser: User | null
  isConfigured: boolean

  // 动作
  initializeAppState: () => Promise<void>
  checkDatabaseStatus: () => Promise<boolean>
  checkForUpdates: () => Promise<boolean>
  checkSession: () => Promise<boolean>
  checkUserConfiguration: () => Promise<boolean>

  // 状态更新器
  setDatabaseReady: (ready: boolean) => void
  setUpdateAvailable: (available: boolean) => void
  setInitializing: (initializing: boolean) => void
  setInitializationError: (error: string | null) => void
  setLoggedIn: (loggedIn: boolean) => void
  setCurrentUser: (user: User | null) => void
  setConfigured: (configured: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isDatabaseReady: false,
      updateAvailable: false,
      isInitializing: true,
      initializationError: null,
      isLoggedIn: false,
      currentUser: null,
      isConfigured: false,

      // 状态更新器
      setDatabaseReady: (ready) => set({ isDatabaseReady: ready }),
      setUpdateAvailable: (available) => set({ updateAvailable: available }),
      setInitializing: (initializing) => set({ isInitializing: initializing }),
      setInitializationError: (error) => set({ initializationError: error }),
      setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setConfigured: (configured) => set({ isConfigured: configured }),

      // 初始化流程
      initializeAppState: async () => {
        const { 
          checkDatabaseStatus, 
          checkForUpdates, 
          checkSession, 
          checkUserConfiguration,
          setInitializing,
          setInitializationError 
        } = get()

        try {
          setInitializing(true)
          setInitializationError(null)

          // 1. 检查数据库状态
          const dbReady = await checkDatabaseStatus()
          if (!dbReady) {
            throw new Error('Database is not ready')
          }

          // 2. 检查更新
          await checkForUpdates()

          // 3. 检查会话状态
          const hasSession = await checkSession()
          if (hasSession) {
            // 4. 检查用户配置状态
            await checkUserConfiguration()
          }

          setInitializing(false)
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error'
          setInitializationError(msg)
          setInitializing(false)
          throw error
        }
      },

      // 从后端获取数据库状态
      checkDatabaseStatus: async () => {
        const data = await window
        //backend.api('/v1/system/init-status', 'GET')
        // 假设后端返回 { initialized: boolean, database_connected: boolean }
        const ready = data.initialized && data.database_connected
        get().setDatabaseReady(ready)
        return ready
      },

      // 模拟检查更新
      checkForUpdates: async () => {
        // 在实际场景中应调用后端API判断是否有更新
        const hasUpdate = false
        get().setUpdateAvailable(hasUpdate)
        return hasUpdate
      },

      // 检查会话状态
      checkSession: async () => {
        // 假设 /api/v1/session 返回 { user: { id, username, configured } } 或 { user: null }
        try {
          const { user } = await window.backend.api('/v1/session', 'GET')
          const loggedIn = !!user
          get().setLoggedIn(loggedIn)
          get().setCurrentUser(user || null)
          return loggedIn
        } catch (error) {
          get().setLoggedIn(false)
          get().setCurrentUser(null)
          return false
        }
      },

      // 检查用户配置
      checkUserConfiguration: async () => {
        const { currentUser } = get()
        if (!currentUser) {
          get().setConfigured(false)
          return false
        }
        // 假设后端已在 session 中返回用户配置状态
        // 或可再次请求 /v1/user/config/${currentUser.id}
        const configured = currentUser.configured
        get().setConfigured(configured)
        return configured
      }
    }),
    {
      name: 'beaveden-app-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isConfigured: state.isConfigured
      })
    }
  )
)
