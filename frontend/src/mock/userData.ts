// mock/userData.ts
import { 
    AccountStatus, 
    Language, 
    Currency, 
    Theme 
  } from '@/types/enums'
  import type { User, UserSettings } from '@/types/user'
  
  const mockUserSettings: UserSettings = {
    user_id: "1",
    language: Language.EN,
    currency: Currency.CAD,
    theme: Theme.FRESH,
    login_expire_days: 7,
    require_password_on_launch: false,
    notification_enabled: true
  }
  
  export const mockUser: User = {
    id: "1",
    username: "alexjohnson",
    nickname: "Alex",
    email: "alex@example.com",
    avatar_path: "/api/placeholder/32/32",
    account_status: AccountStatus.ACTIVE,
    is_first_login: false,
    last_login_at: new Date().toISOString(),
    settings: mockUserSettings
  }
  