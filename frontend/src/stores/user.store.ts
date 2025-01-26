// src/stores/user.store.ts
import { create } from 'zustand';
import { localDb } from '@/lib/local-db';
import { getApiClient } from '@/lib/api-client';
import { useSessionStore } from '@/stores/session.store';
import { LocalUser, UserPreferences } from '@/types/user';

interface UserState {
  currentUser: LocalUser | null;
  isLoading: boolean;
  error: string | null;
  loadLocalUser: () => Promise<LocalUser | null>;
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  registrationState: {
    status: 'idle' | 'registering' | 'success' | 'error';
    error?: string;
  };
  registerUser: (
    username: string,
    password: string,
    email: string,
    preferences: UserPreferences
  ) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isLoading: true, // 默认为 loading 状态
  error: null,

  loadLocalUser: async () => {
    console.log('[UserStore] Loading local user');

    try {
      // 1. 获取当前用户ID
      const currentUserData = await localDb.getCurrentUser();
      console.log('[UserStore] Current user data:', currentUserData);

      if (!currentUserData?.userId) {
        console.log('[UserStore] No current user found, setting currentUser to null');
        set({ currentUser: null, isLoading: false });
        return null;
      }

      // 2. 获取用户数据
      const user = await localDb.getUser(currentUserData.userId);
      console.log('[UserStore] User data:', user);

      if (!user) {
        console.log('[UserStore] No user data found, setting currentUser to null');
        set({ currentUser: null, isLoading: false });
        return null;
      }

      // 3. 验证会话
      const sessionStore = useSessionStore.getState();
      const session = await sessionStore.getSession();
      console.log('[UserStore] Session:', session);

      if (!session) {
        console.log('[UserStore] No valid session found, setting currentUser to null');
        set({ currentUser: null, isLoading: false });
        return null;
      }

      // 4. 设置用户状态
      console.log('[UserStore] All checks passed, setting currentUser:', user);
      await useSessionStore.getState().setSession(session);
      set({ currentUser: user, isLoading: false });
      return user;
    } catch (error) {
      console.error('[UserStore] Failed to load local user:', error);
      console.log('[UserStore] Setting currentUser to null due to error');
      set({ currentUser: null, isLoading: false, error: 'Failed to load user' });
      return null;
    }
  },

  loginUser: async (username: string, password: string) => {
    console.log('[UserStore] Logging in user:', username);
    set({ isLoading: true, error: null });

    try {
      const apiClient = await getApiClient();
      const result = await apiClient.login(username, password);
      console.log('[UserStore] Login response:', result);

      if ( !result.user || !result.token) {
        throw new Error('Invalid login response');
      }

      // 1. 保存会话
      const sessionStore = useSessionStore.getState();
      await sessionStore.setSession(result.token);
      console.log('[UserStore] Session saved');

      // 2. 保存用户数据
      const localUser: LocalUser = {
        ...result.user,
        local_id: result.user.id,
        is_synced: true,
        pending_sync: false,
        preferences: result.user.preferences || {
          language: 'en',
          theme: 'light',
          currency: 'USD'
        }
      };

      const updatedUser = await localDb.updateUserAfterSync(localUser, result.user);
      await localDb.setCurrentUser(result.user.id);
      console.log('[UserStore] User data saved');

      // 3. 更新状态
      set({ currentUser: updatedUser, isLoading: false });
    } catch (error) {
      console.error('[UserStore] Login failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },

  logoutUser: async () => {
    console.log('[UserStore] Logging out user');
    try {
      const sessionStore = useSessionStore.getState();
      await sessionStore.clearSession();
      set({ currentUser: null, error: null });
      console.log('[UserStore] Logout successful');
    } catch (error) {
      console.error('[UserStore] Logout failed:', error);
      throw error;
    }
  },

  updatePreferences: async (preferences: Partial<UserPreferences>) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      set({ isLoading: true, error: null });

      const updatedUser: LocalUser = {
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          ...preferences
        },
        pending_sync: true
      };

      await localDb.updateUserAfterSync(updatedUser, updatedUser);
      set({ currentUser: updatedUser, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false,
        error: 'Failed to update preferences'
      });
      throw error;
    }
  },

  registrationState: {
    status: 'idle',
    error: undefined
  },

  registerUser: async (username, password, email, preferences) => {
    console.log('[UserStore] Starting registration');
    set({ 
      isLoading: true,
      error: null,
      registrationState: { status: 'registering' }
    });

    try {
      // 1. 验证用户名和邮箱
      const [usernameExists, emailExists] = await Promise.all([
        localDb.isUsernameExists(username),
        localDb.isEmailExists(email)
      ]);

      if (usernameExists) throw new Error('Username already taken');
      if (emailExists) throw new Error('Email already registered');

      // 2. 创建本地用户
      const localUser = await localDb.createLocalUser({
        username,
        email,
        password,
        preferences
      });

      // 3. 注册到服务器
      const apiClient = await getApiClient();
      const result = await apiClient.register(username, password, email, preferences);

      if ( !result.user || !result.token) {
        throw new Error('Registration failed');
      }

      // 4. 保存会话
      const sessionStore = useSessionStore.getState();
      await sessionStore.setSession(result.token);

      // 5. 更新本地用户
      const updatedUser = await localDb.updateUserAfterSync(localUser, result.user);
      await localDb.setCurrentUser(updatedUser.id);

      // 6. 更新状态
      set({
        currentUser: updatedUser,
        isLoading: false,
        registrationState: { status: 'success' }
      });
    } catch (error) {
      console.error('[UserStore] Registration failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
        registrationState: { 
          status: 'error',
          error: error instanceof Error ? error.message : 'Registration failed'
        }
      });
      throw error;
    }
  }
}));