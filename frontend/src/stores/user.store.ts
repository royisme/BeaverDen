import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences, LocalUser } from '@/types/user'
import { Currency } from '@/types/enums'
import { Theme } from '@/types/enums'
import { Language } from '@/types/enums'

// 扩展LocalUser类型以支持与后端的集成
interface LocalUserWithSync extends LocalUser {
  // 后端用户标识,用于同步
  backendId?: string
  // 会话令牌,用于认证
  sessionToken?: string
  // 上次同步时间
  lastSyncTime?: Date
}

interface UserState {
  // 本地用户数据
  currentUser: LocalUserWithSync | null
  // 存储用户是否完成初始配置
  isConfigured: boolean
  // 是否正在进行操作
  isLoading: boolean
  // 上次发生的错误
  error: string | null

  // 初始化本地用户并与后端同步
  initializeUser: () => Promise<void>
  // 更新用户偏好并同步到后端
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  // 完成初始配置并准备同步
  completeInitialSetup: () => Promise<void>
}

const initialPreferences: UserPreferences = {
  language: Language.EN,
  currency: Currency.CAD,
  theme: Theme.FRESH
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isConfigured: false,
      isLoading: false,
      error: null,

      initializeUser: async () => {
        set({ isLoading: true, error: null })
        try {
          // 首先创建本地用户数据
          const deviceId = crypto.randomUUID()
          const localUser: LocalUserWithSync = {
            deviceId,
            preferences: initialPreferences,
            lastUpdated: new Date()
          }

          // 与后端同步,创建后端用户记录
          const response = await fetch('/api/v1/init/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device_id: deviceId,
              ...initialPreferences
            })
          })

          if (!response.ok) {
            throw new Error('Failed to initialize user on backend')
          }

          const { id: backendId, session_token } = await response.json()

          // 更新本地用户数据,包含后端同步信息
          set({
            currentUser: {
              ...localUser,
              backendId,
              sessionToken: session_token,
              lastSyncTime: new Date()
            },
            isLoading: false
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false 
          })
        }
      },

      updatePreferences: async (newPreferences) => {
        const { currentUser } = get()
        if (!currentUser?.backendId) {
          throw new Error('User not properly initialized')
        }

        set({ isLoading: true, error: null })
        try {
          // 先更新本地数据
          const updatedUser = {
            ...currentUser,
            preferences: { ...currentUser.preferences, ...newPreferences },
            lastUpdated: new Date()
          }

          // 然后同步到后端
          const response = await fetch(`/api/v1/init/settings/${currentUser.backendId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentUser.sessionToken}`
            },
            body: JSON.stringify({
              device_id: currentUser.deviceId,
              ...updatedUser.preferences
            })
          })

          if (!response.ok) {
            throw new Error('Failed to sync preferences with backend')
          }

          // 更新本地状态
          set({
            currentUser: {
              ...updatedUser,
              lastSyncTime: new Date()
            },
            isLoading: false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          })
        }
      },

      completeInitialSetup: async () => {
        const { currentUser } = get()
        if (!currentUser?.backendId) {
          throw new Error('Cannot complete setup: user not initialized')
        }

        try {
          // 最后一次同步
          await get().updatePreferences(currentUser.preferences)
          
          // 标记配置完成
          set({ 
            isConfigured: true,
            currentUser: {
              ...currentUser,
              lastUpdated: new Date(),
              lastSyncTime: new Date()
            }
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          throw error
        }
      }
    }),
    {
      name: 'beaveden-user-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isConfigured: state.isConfigured
      })
    }
  )
)