import { Language, Currency, Theme, AccountStatus } from './enums';

export interface DeviceInfo {
    deviceId: string;
    deviceName: string;
    os: string;
    model?: string;
    manufacturer?: string;
    ip?: string;
    deviceType?: string|null;
}

export interface UserPreferences {
    language: Language;
    currency: Currency;
    theme: Theme;
    loginExpireDays?: number;
    requirePasswordOnLaunch?: boolean;
    notificationEnabled?: boolean;
}

export interface UserSettings {
    isTwoFactorEnabled: boolean;
    securityQuestionSet: boolean;
    emailNotificationsEnabled: boolean;
    accountLocked: boolean;
    lastPasswordResetAt: Date;
}

export interface User {
    id: string;
    username: string;
    email?: string;
    nickname?: string;
    avatarPath?: string;
    accountStatus: AccountStatus;
    lastLoginAt?: Date;
    preferences: UserPreferences;
    settings?: UserSettings;
}

export interface SessionToken {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

export interface AuthenticationResult {
    user: User;
    token: SessionToken;
}

export interface SyncState {
    userId: string;
    lastSyncTime: Date;
    pendingChanges: boolean;
}

export interface OnboardingData {
    username: string;
    email: string;
    password: string;
    preferences: UserPreferences;
}
// 本地用户模型扩展了 User，添加了 local_id
export interface LocalUser extends User {
    local_id: string;      // 本地标识符，最终会使用服务器返回的 id
    is_synced: boolean;    // 是否已与服务器同步
    pending_sync: boolean; // 是否有待同步的更改
}

// 创建本地用户时的初始数据
export interface LocalUserCreation {
    username: string;
    email: string;
    password: string;
    preferences: UserPreferences;
}

// 用户注册状态
export interface RegistrationState {
    status: 'idle' | 'registering' | 'success' | 'error';
    error?: string;
}