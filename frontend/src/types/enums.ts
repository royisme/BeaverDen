// types/enums.ts

export const ApiVersion = 'v1';

export enum MenuType {
    FEATURE = "feature",
    SETTING = "setting"
  }
  
  export enum MenuGroup {
    MAIN = "main",
    SYSTEM = "system"
  }
  
  export enum SubscriptionTier {
    FREE = "free",
    STANDARD = "standard",
    PREMIUM = "premium"
  }
  
  export enum Language {
    EN = "en",
    ZH = "zh"
  }
  
  export enum Currency {
    CAD = "CAD",
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    JPY = "JPY",
    CNY = "CNY",
    HKD = "HKD",
    AUD = "AUD",
    NZD = "NZD"
  }
  

  export enum Theme {
    FRESH = "fresh",
    NATURAL = "natural",
    OCEAN = "ocean",
    SUNSET = "sunset"
  }

  export enum AccountStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    DELETED = "deleted"
  }
  

export type FlowStep = 'welcome' | 'setup' | 'verification' | 'complete';

