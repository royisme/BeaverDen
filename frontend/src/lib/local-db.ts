// src/lib/local-db.ts
import { openDB, DBSchema } from 'idb';
import { User, UserPreferences, LocalUser, SessionToken, LocalUserCreation } from '@/types/user';
import { FinanceAccountStatus } from '@/types/finance';
import { AccountStatus } from '@/types/enums';

const DB_NAME = 'beaveden';
const DB_VERSION = 1;

export class DatabaseError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

interface BeavedenDB extends DBSchema {
  users: {
    key: string;
    value: LocalUser;
    indexes: {
      'by-username': string;
      'by-email': string;
    };
  };
  preferences: {
    key: string;
    value: UserPreferences & { userId: string };
    indexes: {
      'by-user': string;
    };
  };
  currentUser: {
    key: string;
    value: {
      userId: string;
      lastAccess: Date;
    };
  };
  sessions: {
    key: string;
    value: {
      token: SessionToken;
      timestamp: Date;
    };
  };
}

export class LocalDatabase {
  private dbPromise = openDB<BeavedenDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      console.log('[LocalDB] Database upgrade started');
      
      // Create users store if it doesn't exist
      if (!db.objectStoreNames.contains('users')) {
        console.log('[LocalDB] Creating users store');
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-username', 'username', { unique: true });
        userStore.createIndex('by-email', 'email', { unique: true });
      }

      // Create preferences store if it doesn't exist
      if (!db.objectStoreNames.contains('preferences')) {
        console.log('[LocalDB] Creating preferences store');
        db.createObjectStore('preferences', { keyPath: ['userId', 'lastModified'] });
      }

      // Create currentUser store if it doesn't exist
      if (!db.objectStoreNames.contains('currentUser')) {
        console.log('[LocalDB] Creating currentUser store');
        db.createObjectStore('currentUser');  
      }

      // Create sessions store if it doesn't exist
      if (!db.objectStoreNames.contains('sessions')) {
        console.log('[LocalDB] Creating sessions store');
        db.createObjectStore('sessions');  
      }

      console.log('[LocalDB] Database upgrade completed');
    }
  });

  // 添加检查方法
  async isUsernameExists(username: string): Promise<boolean> {
    const db = await this.dbPromise;
    try {
      const user = await db.getFromIndex('users', 'by-username', username);
      return !!user;
    } catch (error) {
      console.error('[LocalDB] Error checking username:', error);
      return false;
    }
  }

  async isEmailExists(email: string): Promise<boolean> {
    const db = await this.dbPromise;
    try {
      const user = await db.getFromIndex('users', 'by-email', email);
      return !!user;
    } catch (error) {
      console.error('[LocalDB] Error checking email:', error);
      return false;
    }
  }

  // 创建本地用户记录
  async createLocalUser(userData: LocalUserCreation): Promise<LocalUser> {
    const db = await this.dbPromise;
    const tempId = crypto.randomUUID();

    try {
      // 检查用户名和邮箱
      const usernameExists = await this.isUsernameExists(userData.username);
      if (usernameExists) {
        throw new DatabaseError('Username already exists', 'USERNAME_EXISTS');
      }

      if (userData.email) {
        const emailExists = await this.isEmailExists(userData.email);
        if (emailExists) {
          throw new DatabaseError('Email already exists', 'EMAIL_EXISTS');
        }
      }

      const localUser: LocalUser = {
        ...userData,
        id: tempId,
        local_id: tempId,
        is_synced: false,
        pending_sync: true,
        accountStatus: AccountStatus.ACTIVE,
        preferences: {
          language: userData.preferences.language,
          currency: userData.preferences.currency,
          theme: userData.preferences.theme,
        }
      };

      await db.put('users', localUser);
      return localUser;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('[LocalDB] Error creating local user:', error);
      throw new DatabaseError('Failed to create local user', 'CREATE_USER_FAILED');
    }
  }

  // 使用服务器返回的数据更新本地用户
  async updateUserAfterSync(localUser: LocalUser, serverUser: User): Promise<LocalUser> {
    console.log('[LocalDB] Starting updateUserAfterSync', { localUser, serverUser });
    const db = await this.dbPromise;
    const tx = db.transaction(['users'], 'readwrite');
    const userStore = tx.objectStore('users');

    try {
      const updatedUser: LocalUser = {
        ...serverUser,
        local_id: serverUser.id,
        is_synced: true,
        pending_sync: false,
        preferences: serverUser.preferences || localUser.preferences
      };

      await userStore.put(updatedUser);
      await tx.done;
      
      console.log('[LocalDB] User updated successfully:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('[LocalDB] Error updating user:', error);
      await tx.abort();
      throw error;
    }
  }

  // 获取用户
  async getUser(userId: string): Promise<LocalUser | undefined> {
    console.log('[LocalDB] Getting user with ID:', userId);
    const db = await this.dbPromise;
    const user = await db.get('users', userId);
    console.log('[LocalDB] Retrieved user:', user);
    return user;
  }

  // 保存会话
  async saveSession(token: SessionToken): Promise<void> {
    console.log('[LocalDB] Saving session');
    const db = await this.dbPromise;
    await db.put('sessions', {
      token,
      timestamp: new Date()
    }, 'current');  
    console.log('[LocalDB] Session saved');
  }

  // 获取会话
  async getSession(): Promise<SessionToken | null> {
    console.log('[LocalDB] Getting session');
    const db = await this.dbPromise;
    const session = await db.get('sessions', 'current');
    console.log('[LocalDB] Retrieved session:', session);
    return session ? session.token : null;
  }

  // 设置当前用户
  async setCurrentUser(userId: string): Promise<void> {
    console.log('[LocalDB] Setting current user:', userId);
    const db = await this.dbPromise;
    const tx = db.transaction('currentUser', 'readwrite');
    const store = tx.objectStore('currentUser');
    
    try {
      // 只使用一个固定的 key: 'current'
      await store.put({
        userId,
        lastAccess: new Date()
      }, 'current');
      
      await tx.done;
      console.log('[LocalDB] Current user set successfully');
    } catch (error) {
      console.error('[LocalDB] Error setting current user:', error);
      await tx.abort();
      throw error;
    }
  }

  // 获取当前用户
  async getCurrentUser(): Promise<{ userId: string; lastAccess: Date; } | undefined> {
    console.log('[LocalDB] Getting current user');
    const db = await this.dbPromise;
    try {
      const currentUser = await db.get('currentUser', 'current');
      console.log('[LocalDB] Retrieved current user:', currentUser);
      return currentUser;
    } catch (error) {
      console.error('[LocalDB] Error getting current user:', error);
      return undefined;
    }
  }

  async clearSession(): Promise<void> {
    console.log('[LocalDB] Clearing session');
    const db = await this.dbPromise;
    await db.delete('sessions', 'current');
    console.log('[LocalDB] Session cleared');
  }
}

export const localDb = new LocalDatabase();