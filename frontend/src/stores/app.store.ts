// src/stores/app.store.ts
import { create } from 'zustand';
import { useUserStore } from '@/stores/user.store';
import { useSessionStore } from '@/stores/session.store';

interface AppState {
  isInitializing: boolean;
  error: string | null;

  initializeApp: () => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitializing: true,
  error: null,

  initializeApp: async () => {
    set({ isInitializing: true, error: null });
    try {
      // 1. 验证会话
      const sessionStore = useSessionStore.getState();
      const isValidSession = await sessionStore.validateSession();

      // 2. 如果会话有效，加载用户数据
      if (isValidSession) {
        const userStore = useUserStore.getState();
        await userStore.loadUserData();
      }

      set({ isInitializing: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'App initialization failed',
        isInitializing: false
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));