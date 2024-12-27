import { create } from 'zustand';
import { localDb } from '@/lib/local-db';
import { getApiClient } from '@/lib/api-client';
import { useSessionStore } from '@/stores/session.store';
import { User, UserPreferences } from '@/types/user';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;

  registerUser: (
    username: string,
    password: string,
    email: string,
    preferences: UserPreferences
  ) => Promise<void>;
  
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  syncUserData: () => Promise<void>;
  loadUserData: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isLoading: false,
  error: null,

  registerUser: async (username, password, email, preferences) => {
    set({ isLoading: true, error: null });
    try {
      const apiClient = await getApiClient();
      const result = await apiClient.register(username, password, email, preferences);
      console.log('User registration result:', result);
      // 保存用户数据到本地
      console.log('start call saveUser', result.user)
      await localDb.saveUser(result.user);
      console.log('saveUser done')
      await localDb.setCurrentUser(result.user.id);
      console.log('setCurrentUser done')
      // 保存会话
      console.log('start call setSession', result.token)
      const sessionStore = useSessionStore.getState();
      await sessionStore.setSession(result.token);
      console.log('setSession done')
      
      set({ 
        currentUser: result.user,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false 
      });
      throw error;
    }
  },

  loginUser: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const apiClient = await getApiClient();
      const result = await apiClient.login(username, password);
      
      // 保存或更新本地用户数据
      await localDb.saveUser(result.user);
      await localDb.setCurrentUser(result.user.id);
      
      // 保存会话
      const sessionStore = useSessionStore.getState();
      await sessionStore.setSession(result.token);
      
      set({ 
        currentUser: result.user,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false 
      });
      throw error;
    }
  },

  logoutUser: async () => {
    set({ isLoading: true, error: null });
    try {
      // 清理会话
      const sessionStore = useSessionStore.getState();
      await sessionStore.clearSession();
      
      set({ 
        currentUser: null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false 
      });
      throw error;
    }
  },

  updatePreferences: async (preferences) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No active user');

    set({ isLoading: true, error: null });
    try {
      const apiClient = await getApiClient();
      const updatedPreferences = {
        ...currentUser.preferences,
        ...preferences,
        lastModified: new Date()
      };
      
      // 先更新本地数据
      await localDb.savePreferences(currentUser.id, updatedPreferences);
      
      // 同步到服务器
      const updatedUser = await apiClient.updatePreferences(
        currentUser.id, 
        updatedPreferences
      );
      
      // 更新本地用户数据
      await localDb.saveUser(updatedUser);
      
      set({ 
        currentUser: updatedUser,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update preferences',
        isLoading: false 
      });
      throw error;
    }
  },
  
  syncUserData: async () => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No active user');

    set({ isLoading: true, error: null });
    try {
      const syncState = await localDb.getSyncState(currentUser.id);
      if (!syncState?.pendingChanges) {
        set({ isLoading: false });
        return;
      }

      const apiClient = await getApiClient();
      const updatedUser = await apiClient.syncUserData(
        currentUser.id,
        syncState.lastSyncTime
      );
      
      // 更新本地数据
      await localDb.saveUser(updatedUser);
      
      set({ 
        currentUser: updatedUser,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Sync failed',
        isLoading: false 
      });
      throw error;
    }
  },

  loadUserData: async () => {
    set({ isLoading: true, error: null });
    try {
      // 获取当前用户ID
      const currentUserData = await localDb.getCurrentUser();
      if (!currentUserData?.userId) {
        throw new Error('No user data found');
      }

      // 从本地数据库加载用户信息
      const user = await localDb.getUser(currentUserData.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 加载用户偏好设置
      const preferences = await localDb.getLatestPreferences(user.id);
      if (preferences) {
        user.preferences = preferences;
      }

      // 设置当前用户状态
      set({ 
        currentUser: user,
        isLoading: false 
      });

    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load user data',
        isLoading: false 
      });
      throw error;
    }
  }
}));