// src/stores/app.store.ts
import { create } from 'zustand';
import { useUserStore } from '@/stores/user.store';
import { useSessionStore } from '@/stores/session.store';


interface AppState {
  isInitializing: boolean;
  error: string | null;
  redirectPath: string | null;  // 添加重定向路径
  isInitialized: boolean;
  initializeApp: () => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitializing: true,
  error: null,
  redirectPath: null,
  isInitialized: false,
  initializeApp: async () => {
    set({ isInitializing: true, error: null });
    try {
      // 1. 首先加载本地用户
      const userStore = useUserStore.getState();
      const localUser = await userStore.loadLocalUser();

      if (localUser) {
        // 2. 如果存在本地用户，验证会话
        const sessionStore = useSessionStore.getState();
        const isValidSession = await sessionStore.validateSession();

        if (isValidSession) {
          // 会话有效，重定向到dashboard
          console.log("redirectPath is /app/dashboard");
          set({ 
            redirectPath: '/app/dashboard',
            isInitializing: false,
            isInitialized: true
          });
        } else {
          // 会话无效，重定向到登录页
          set({ 
            redirectPath: '/login',
            isInitializing: false,
            isInitialized: true
          });
        }
      } else {
        // 3. 不存在本地用户，重定向到landing
        set({ 
          redirectPath: '/landing',
          isInitializing: false,
          isInitialized: true
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'App initialization failed',
        isInitializing: false,
        redirectPath: '/landing' // 错误时默认到landing
      });
    }
  },

  clearError: () => set({ error: null })
}));
