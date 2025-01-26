// src/stores/session.store.ts
import { create } from 'zustand';
import { SessionToken } from '@/types/user';
import { getApiClient } from '@/lib/api-client';
import { localDb } from '@/lib/local-db';

interface SessionState {
  sessionToken: SessionToken | null;
  isLoading: boolean;
  error: string | null;

  setSession: (token: SessionToken) => Promise<SessionToken>;
  clearSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  getSession: () => Promise<SessionToken | null>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionToken: null,
  isLoading: false,
  error: null,

  setSession: async (token: SessionToken) => {
    try {
      // 保存到本地存储
      await localDb.saveSession(token);
      // 更新状态
      set({ sessionToken: token });
      // 设置 API client 的 token
      console.log('[SessionStore] Setting API client token:', token.accessToken);
      const apiClient = await getApiClient();
      apiClient.setAccessToken(token.accessToken);
      return token;
    } catch (error) {
      console.error('[SessionStore] Failed to set session:', error);
      set({ error: 'Failed to set session' });
      throw error;
    }
  },

  clearSession: async () => {
    try {
      // 清除本地存储
      await localDb.clearSession();
      // 更新状态
      set({ sessionToken: null });
      // 清除 API client 的 token
      console.log('[SessionStore] Clearing API client token');
      const apiClient = await getApiClient();
      apiClient.setAccessToken(null);
    } catch (error) {
      console.error('[SessionStore] Failed to clear session:', error);
      set({ error: 'Failed to clear session' });
      throw error;
    }
  },

  refreshSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentToken = get().sessionToken;
      if (!currentToken?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const apiClient = await getApiClient();
      const newToken = await apiClient.refreshToken(currentToken.refreshToken);
      // 确保在设置 session 时也设置 api-client 的 token
      await get().setSession(newToken);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Session refresh failed',
        isLoading: false 
      });
      // 刷新失败时清除会话
      await get().clearSession();
      throw error;
    }
  },

  validateSession: async () => {
    try {
      // 先从本地存储加载token
      if (!get().sessionToken) {
        const storedToken = await localDb.getSession();
        if (!storedToken) return false;
        console.log('validateSession storedToken===>', storedToken);
        await get().setSession(storedToken);
      }

      const token = get().sessionToken;
      if (!token) return false;

      // 检查token是否过期
      const currentTime = new Date();
      if (new Date(token.expiresAt) <= currentTime) {
        try {
          await get().refreshSession();
          return true;
        } catch {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  },

  getSession: async () => {
    const token = get().sessionToken;
    if (token) {
      // 验证现有 token
      const isValid = await get().validateSession();
      if (isValid) return token;
      return null;
    }

    // 如果内存中没有，从本地存储加载
    const storedToken = await localDb.getSession();
    if (storedToken) {
      set({ sessionToken: storedToken });
      // 验证加载的 token
      const isValid = await get().validateSession();
      if (isValid) return storedToken;
      return null;
    }

    return null;
  }
}));