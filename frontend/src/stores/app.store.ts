// src/stores/app.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from '@/stores/user.store';

interface AppState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  initializeApp: () => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      isInitializing: false,
      error: null,

      initializeApp: async () => {
        // 如果正在初始化，直接返回
        if (get().isInitializing) {
          console.log('[AppStore] Initialization in progress, skipping');
          return;
        }

        console.log('[AppStore] Starting initialization');
        set({ isInitializing: true, error: null });

        try {
          // 总是加载用户数据，即使应用已初始化
          const userStore = useUserStore.getState();
          const user = await userStore.loadLocalUser();
          console.log('[AppStore] User loaded:', user);

          set({ 
            isInitializing: false,
            isInitialized: true,
            error: null
          });
          console.log('[AppStore] Initialization completed');
        } catch (error) {
          console.error('[AppStore] Initialization failed:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize app',
            isInitializing: false,
            isInitialized: false
          });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'app-state',
      partialize: (state) => ({ 
        isInitialized: state.isInitialized 
      })
    }
  )
);
