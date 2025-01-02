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
    key: string; // Keep this as string
    value: {
      key: 'current'; // Add this line
      userId: string;
      lastAccess: Date;
    };
  };
  sessions: {
    key: string; // Keep this as string
    value: {
      key: 'current'; // Add this line
      token: SessionToken;
      timestamp: Date;
    };
  };
}

export class LocalDatabase {
  private dbPromise = openDB<BeavedenDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const userStore = db.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('by-username', 'username', { unique: true });
      userStore.createIndex('by-email', 'email', { unique: true });

      db.createObjectStore('preferences', { keyPath: ['userId', 'lastModified'] });
      db.createObjectStore('currentUser', { keyPath: 'key' }); // Keep keyPath: 'key'
      db.createObjectStore('sessions', { keyPath: 'key' }); // Add keyPath: 'key'
    }
  });

  // 添加检查方法
  async isUsernameExists(username: string): Promise<boolean> {
    const db = await this.dbPromise;
    try {
      const user = await db.getFromIndex('users', 'by-username', username);
      return !!user;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  async isEmailExists(email: string): Promise<boolean> {
    const db = await this.dbPromise;
    try {
      const user = await db.getFromIndex('users', 'by-email', email);
      return !!user;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  // 创建本地用户记录
  async createLocalUser(userData: LocalUserCreation): Promise<LocalUser> {
    const db = await this.dbPromise;
    const tempId = crypto.randomUUID(); // 临时ID，后续会被服务器ID替换

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
      console.error('Error creating local user:', error);
      throw new DatabaseError('Failed to create local user', 'CREATE_USER_FAILED');
    }
  }

  // 使用服务器返回的数据更新本地用户
  async updateUserAfterSync(localUser: LocalUser, serverUser: User): Promise<LocalUser> {
    const db = await this.dbPromise;
    const tx = db.transaction(['users'], 'readwrite');
    const userStore = tx.objectStore('users');

    try {
      // 1. 构建更新后的记录
      const updatedUser: LocalUser = {
        ...localUser,           // 保持本地数据
        id: serverUser.id,      // 新ID
        local_id: serverUser.id,
        is_synced: true,
        pending_sync: false
      };

      // 2. 使用事务原子操作
      await userStore.delete(localUser.id);    // 删除旧ID的记录
      await userStore.add(updatedUser);        // 添加新ID的记录
      await tx.done;

      return updatedUser;
    } catch (error) {
      await tx.abort();
      throw error;
    }
  }

  // 获取用户
  async getUser(userId: string): Promise<LocalUser | undefined> {
    const db = await this.dbPromise;
    return db.get('users', userId);
  }

  // 保存会话
  async saveSession(token: SessionToken): Promise<void> {
    const db = await this.dbPromise;
    await db.put('sessions', {
      key: 'current', // Add key here
      token,
      timestamp: new Date()
    }, 'current');
  }

  // 获取会话
  async getSession(): Promise<SessionToken | null> {
    const db = await this.dbPromise;
    const session = await db.get('sessions', 'current');
    return session ? session.token : null;
  }

  // 设置当前用户
  async setCurrentUser(userId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.put('currentUser', {
      key: 'current', // Add key here
      userId,
      lastAccess: new Date()
    }, 'current');
  }

  // 获取当前用户
  async getCurrentUser(): Promise<{ userId: string; lastAccess: Date; } | undefined> {
    const db = await this.dbPromise;
    const currentUser = await db.get('currentUser', 'current');
    // 返回之前检查 currentUser 是否存在
    if (currentUser) {
        return {
            userId: currentUser.userId,
            lastAccess: currentUser.lastAccess
        };
    }
    return undefined;
  }
  async clearSession(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('sessions');
  }
}

export const localDb = new LocalDatabase();