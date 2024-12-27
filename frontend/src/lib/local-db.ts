import { openDB, DBSchema } from 'idb';
import { User, UserPreferences, SyncState, SessionToken } from '@/types/user';

interface BeavedenDB extends DBSchema {
  users: {
    key: string;
    value: User;
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
  syncState: {
    key: string;
    value: SyncState;
    indexes: {
      'by-user': string;
    };
  };
  currentUser: {
    key: 'current';
    value: {
      userId: string;
      lastAccess: Date;
    };
  };
  sessions: {
    key: 'current';
    value: {
      token: SessionToken;
      timestamp: Date;
    };
  };
}

const DB_NAME = 'beaveden';
const DB_VERSION = 1;

export class LocalDatabase {
  private dbPromise = openDB<BeavedenDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 用户存储
      const userStore = db.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('by-username', 'username', { unique: true });
      userStore.createIndex('by-email', 'email', { unique: true });

      // 偏好设置存储
      const prefStore = db.createObjectStore('preferences', { 
        keyPath: ['userId', 'lastModified'] 
      });
      prefStore.createIndex('by-user', 'userId');

      // 同步状态存储
      const syncStore = db.createObjectStore('syncState', { keyPath: 'userId' });
      syncStore.createIndex('by-user', 'userId');

      // 当前用户存储
      db.createObjectStore('currentUser', { keyPath: 'key' });
      // 创建sessions存储
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions');
      }
    }
  });

  // 用户操作
  async saveUser(user: User): Promise<void> {
    const db = await this.dbPromise;
    console.log('saveUser', user)
    await db.put('users', user);
    console.log('saveUser done')
    await this.updateSyncState(user.id);
  }

  async getUser(userId: string): Promise<User | undefined> {
    const db = await this.dbPromise;
    return db.get('users', userId);
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.dbPromise;
    return db.getFromIndex('users', 'by-username', username);
  }

  // 偏好设置操作
  async savePreferences(userId: string, preferences: UserPreferences): Promise<void> {
    const db = await this.dbPromise;
    await db.put('preferences', {
      ...preferences,
      userId,
    });
    await this.updateSyncState(userId);
  }

  async getLatestPreferences(userId: string): Promise<UserPreferences | undefined> {
    const db = await this.dbPromise;
    const prefs = await db.getAllFromIndex('preferences', 'by-user', userId);
    return prefs[0];
  }

  // 同步状态操作
  private async updateSyncState(userId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.put('syncState', {
      userId,
      lastSyncTime: new Date(),
      pendingChanges: true
    });
  }

  async getSyncState(userId: string): Promise<SyncState | undefined> {
    const db = await this.dbPromise;
    return db.get('syncState', userId);
  }

  // 当前用户操作
  async setCurrentUser(userId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.put('currentUser', {
      userId,
      lastAccess: new Date()
    },'current');
  }

  async getCurrentUser(): Promise<{ userId: string; lastAccess: Date; } | undefined> {
    const db = await this.dbPromise;
    return db.get('currentUser', 'current');
  }

  // 会话管理方法
  async saveSession(token: SessionToken): Promise<void> {
    const db = await this.dbPromise;
    await db.put('sessions', {
      token,
      timestamp: new Date()
    }, 'current');
  }

  async getSession(): Promise<SessionToken | null> {
    const db = await this.dbPromise;
    const session = await db.get('sessions', 'current');
    return session ? session.token : null;
  }

  async clearSession(): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('sessions', 'current');
  }
}

export const localDb = new LocalDatabase();