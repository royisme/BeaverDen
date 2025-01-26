// mock/menuData.ts
import { MenuType, MenuGroup, SubscriptionTier } from '@/types/enums'
import type { MenuItem, Feature, Permission } from '@/types/menu'

const permissions: Permission[] = [
  {
    id: 1,
    permission_key: "dashboard_access",
    description: "Access to dashboard features"
  },
  {
    id: 2,
    permission_key: "transaction_manage",
    description: "Manage transaction operations"
  },
  {
    id: 3,
    permission_key: "budget_manage",
    description: "Manage budget operations"
  },
  {
    id: 4,
    permission_key: "report_view",
    description: "View reports and analytics"
  },
  {
    id: 5,
    permission_key: "account_manage",
    description: "Manage accounts"
  },
  {
    id: 6,
    permission_key: "settings_manage",
    description: "Manage settings"
  }
]

const features: Feature[] = [
  {
    id: 1,
    feature_key: "dashboard",
    subscription_tier: SubscriptionTier.FREE,
    is_active: true,
    module_key: "dashboard",
    required_permissions: [permissions[0]],
    custom_config: {
      maxWidgets: 5
    }
  },
  {
    id: 2,
    feature_key: "transactions",
    subscription_tier: SubscriptionTier.STANDARD,
    is_active: true,
    module_key: "transactions",
    required_permissions: [permissions[1]],
    custom_config: {
      maxTransactions: 1000
    }
  },
  {
    id: 3,
    feature_key: "budget",
    subscription_tier: SubscriptionTier.STANDARD,
    is_active: true,
    module_key: "budget",
    required_permissions: [permissions[2]],
  },
  {
    id: 4,
    feature_key: "reports",
    subscription_tier: SubscriptionTier.PREMIUM,
    is_active: true,
    module_key: "reports",
    required_permissions: [permissions[3]],
    custom_config: {
      exportFormats: ["pdf", "excel"]
    }
  },
  {
    id: 5,
    feature_key: "accounts",
    subscription_tier: SubscriptionTier.STANDARD,
    is_active: true,
    module_key: "accounts",
    required_permissions: [permissions[4]],
  },
  {
    id: 6,
    feature_key: "settings",
    subscription_tier: SubscriptionTier.FREE,
    is_active: true,
    module_key: "settings",
    required_permissions: [permissions[5]],
  }
]

export const menuItems: MenuItem[] = [
  {
    id: 1,
    menu_key: "dashboard",
    is_visible: true,
    custom_order: 1,
    type: MenuType.FEATURE,
    group: MenuGroup.MAIN,
    name: "概览",
    icon: "LayoutDashboard",
    required_features: [features[0]],
    breadcrumb: {
      title: "概览"
    }
  },
  {
    id: 2,
    menu_key: "transactions",
    is_visible: true,
    custom_order: 2,
    type: MenuType.FEATURE,
    group: MenuGroup.MAIN,
    name: "交易",
    icon: "Receipt",
    required_features: [features[1]],
    breadcrumb: {
      title: "交易"
    }
  },
  {
    id: 3,
    menu_key: "budget",
    is_visible: true,
    custom_order: 3,
    type: MenuType.FEATURE,
    group: MenuGroup.MAIN,
    name: "预算",
    icon: "PiggyBank",
    required_features: [features[2]],
    breadcrumb: {
      title: "预算"
    }
  },
  {
    id: 4,
    menu_key: "reports",
    is_visible: true,
    custom_order: 4,
    type: MenuType.FEATURE,
    group: MenuGroup.MAIN,
    name: "报表",
    icon: "BarChart3",
    required_features: [features[3]],
    breadcrumb: {
      title: "报表"
    }
  },
  {
    id: 5,
    menu_key: "accounts",
    is_visible: true,
    custom_order: 5,
    type: MenuType.FEATURE,
    group: MenuGroup.MAIN,
    name: "账户",
    icon: "Wallet",
    required_features: [features[4]],
    children: [
      {
        id: 51,
        menu_key: "bank-accounts",
        is_visible: true,
        type: MenuType.FEATURE,
        group: MenuGroup.MAIN,
        name: "银行账户",
        icon: "Building2",
        required_features: [features[4]],
        breadcrumb: {
          title: "银行账户",
          parent: "/accounts"
        }
      },
      {
        id: 52,
        menu_key: "investment-accounts",
        is_visible: true,
        type: MenuType.FEATURE,
        group: MenuGroup.MAIN,
        name: "投资账户",
        icon: "TrendingUp",
        required_features: [features[4]],
        breadcrumb: {
          title: "投资账户",
          parent: "/accounts"
        }
      },
      {
        id: 53,
        menu_key: "loan-accounts",
        is_visible: true,
        type: MenuType.FEATURE,
        group: MenuGroup.MAIN,
        name: "贷款账户",
        icon: "HandCoins",
        required_features: [features[4]],
        breadcrumb: {
          title: "贷款账户",
          parent: "/accounts"
        }
      },
      {
        id: 54,
        menu_key: "other-accounts",
        is_visible: true,
        type: MenuType.FEATURE,
        group: MenuGroup.MAIN,
        name: "其他账户",
        icon: "CircleDollarSign",
        required_features: [features[4]],
        breadcrumb: {
          title: "其他账户",
          parent: "/accounts"
        }
      }
    ],
    breadcrumb: {
      title: "账户"
    }
  },
  {
    id: 6,
    menu_key: "settings",
    is_visible: true,
    custom_order: 6,
    type: MenuType.SETTING,
    group: MenuGroup.SYSTEM,
    name: "设置",
    icon: "Settings",
    required_features: [features[5]],
    breadcrumb: {
      title: "设置"
    }
  }
]

export const menuGroups = [
  {
    id: "main",
    title: "Main Menu",
    type: MenuGroup.MAIN,
    items: menuItems.filter(item => item.group === MenuGroup.MAIN)
  },
  {
    id: "system",
    title: "System Menu",
    type: MenuGroup.SYSTEM,
    items: menuItems.filter(item => item.group === MenuGroup.SYSTEM)
  }
  // 如果有system组，可以在此添加
]
