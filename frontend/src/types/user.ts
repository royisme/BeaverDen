// types/user.ts
import { AccountStatus, Language, Currency, Theme } from './enums'


export interface UserPreferences {
  language: Language
  currency: Currency
  theme: Theme
  // 后续可以根据需要添加其他设置
}

// 本地用户配置
export interface LocalUser {
  deviceId: string
  preferences: UserPreferences
  lastUpdated: Date
}


export interface UserSettings {
  user_id: string
  language: Language
  currency: Currency
  theme: Theme
  login_expire_days: number
  require_password_on_launch: boolean
  notification_enabled: boolean
}

export interface User {
  id: string
  username: string
  nickname?: string
  email?: string
  avatar_path?: string
  account_status: AccountStatus
  is_first_login: boolean
  last_login_at?: string
  settings: UserSettings
}
