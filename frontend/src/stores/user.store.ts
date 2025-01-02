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

  registerUser: (
    username: string,
    password: string,
    email: string,
    preferences: UserPreferences
  ) => Promise<void>;
  
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  loadLocalUser: () => Promise<LocalUser | null>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;

  registrationState: {
    status: 'idle' | 'registering' | 'success' | 'error';
    error?: string;
  };

}

export const useUserStore = create<UserState>((set  , get) => ({
  currentUser: null,
  isLoading: false,
  error: null,

  loadLocalUser: async () => {
    try {
      const currentUserData = await localDb.getCurrentUser();
      if (!currentUserData?.userId) {
        return null;
      }

      const user = await localDb.getUser(currentUserData.userId);
      if (user) {
        set({ currentUser: user });
      }
      return user || null;
    } catch (error) {
      console.error('Failed to load local user:', error);
      return null;
    }
  },

  // registerUser: async (username, password, email, preferences) => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     // 1. 创建本地用户
  //     const localUser = await localDb.createLocalUser({
  //       username,
  //       email,
  //       password,
  //       preferences
  //     });

  //     // 2. 注册到服务器
  //     const apiClient = await getApiClient();
  //     const result = await apiClient.register(
  //       username, 
  //       password,
  //       email,
  //       preferences
  //     );

  //     // 3. 更新本地用户，使用服务器ID
  //     const updatedUser = await localDb.updateUserAfterSync(
  //       localUser,
  //       result.user
  //     );

  //     // 4. 保存会话
  //     const sessionStore = useSessionStore.getState();
  //     await sessionStore.setSession(result.token);

  //     set({ 
  //       currentUser: updatedUser,
  //       isLoading: false 
  //     });
  //   } catch (error) {
  //     set({
  //       error: error instanceof Error ? error.message : 'Registration failed',
  //       isLoading: false
  //     });
  //     throw error;
  //   }
  // },

  loginUser: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const apiClient = await getApiClient();
      const result = await apiClient.login(username, password);

      // 创建或更新本地用户记录
      const localUser: LocalUser = {
        ...result.user,
        local_id: result.user.id, // 使用服务器ID作为local_id
        is_synced: true,
        pending_sync: false
      };

      // 保存到本地数据库
      await localDb.updateUserAfterSync(localUser, result.user);
      await localDb.setCurrentUser(result.user.id);

      // 保存会话
      const sessionStore = useSessionStore.getState();
      await sessionStore.setSession(result.token);

      set({ 
        currentUser: localUser,
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
    try {
      const sessionStore = useSessionStore.getState();
      await sessionStore.clearSession();
      set({ currentUser: null });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  updatePreferences: async (preferences) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No active user');

    try {
      const apiClient = await getApiClient();
      const updatedUser = await apiClient.updatePreferences(
        currentUser.id,
        preferences
      );

      const localUser: LocalUser = {
        ...updatedUser,
        local_id: updatedUser.id,
        is_synced: true,
        pending_sync: false
      };

      await localDb.updateUserAfterSync(localUser, updatedUser);
      set({ currentUser: localUser });
    } catch (error) {
      throw error;
    }
  },
  registrationState: {
    status: 'idle',
    error: undefined
  },

  registerUser: async (username, password, email, preferences) => {
    set({ 
      isLoading: true, 
      error: null,
      registrationState: { status: 'registering' }
    });

    try {

      // 最后一次验证
      const [usernameExists, emailExists] = await Promise.all([
        localDb.isUsernameExists(username),
        localDb.isEmailExists(email)
      ]);

      if (usernameExists) {
        throw new Error('Username already taken');
      }
      if (emailExists) {
        throw new Error('Email already registered');
      }
      // 1. 创建本地用户
      const localUser = await localDb.createLocalUser({
        username,
        email,
        password,
        preferences
      });

      // 2. 注册到服务器
      const apiClient = await getApiClient();
      const result = await apiClient.register(
        username, 
        password,
        email,
        preferences
      );
      console.log('get register result===>', result);
      console.log('get register localUser===>', localUser);
      // 3. 更新本地用户，使用服务器ID
      const updatedUser = await localDb.updateUserAfterSync(
        localUser,
        result.user
      );
      console.log('get register updatedUser===>', updatedUser);
      // 4.  设置为当前用户并保存会话
      await localDb.setCurrentUser(updatedUser.id);
      console.log('set current user===>', updatedUser.id);
      const sessionStore = useSessionStore.getState();
      await sessionStore.setSession(result.token);
      console.log('set session===>', result.token);

      set({ 
        currentUser: updatedUser,
        isLoading: false,
        registrationState: { status: 'success' }
      });
    } catch (error) {
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