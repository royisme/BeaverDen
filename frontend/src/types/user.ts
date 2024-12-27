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

export interface User {
    id: string;
    username: string;
    email?: string;
    nickname?: string;
    avatarPath?: string;
    accountStatus: AccountStatus;
    lastLoginAt?: Date;
    preferences: UserPreferences;
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