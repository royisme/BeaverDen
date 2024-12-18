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
    permission_key: "payment_manage",
    description: "Manage payment operations"
  },
  {
    id: 3,
    permission_key: "analytics_view",
    description: "View analytics data"
  }
]

const features: Feature[] = [
  {
    id: 1,
    feature_key: "basic_dashboard",
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
    feature_key: "payment_processing",
    subscription_tier: SubscriptionTier.STANDARD,
    is_active: true,
    module_key: "payment",
    required_permissions: [permissions[1]],
    custom_config: {
      maxTransactions: 1000
    }
  },
  {
    id: 3,
    feature_key: "advanced_analytics",
    subscription_tier: SubscriptionTier.PREMIUM,
    is_active: true,
    module_key: "analytics",
    required_permissions: [permissions[2]],
    custom_config: {
      exportFormats: ["pdf", "excel"]
    }
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
    name: "Dashboard",
    icon: "LayoutDashboard",
    required_features: [features[0]],
    breadcrumb: {
      title: "Dashboard"
    }
  },
  {
    id: 2,
    menu_key: "payments",
    is_visible: true,
    custom_order: 2,
    type: MenuType.FEATURE,
    group: MenuGroup.MAIN,
    name: "Payments",
    icon: "Wallet",
    required_features: [features[1]],
    children: [
      {
        id: 21,
        menu_key: "transactions",
        is_visible: true,
        type: MenuType.FEATURE,
        group: MenuGroup.MAIN,
        name: "Transactions",
        icon: "Receipt",
        required_features: [features[1]],
        breadcrumb: {
          title: "Transactions",
          parent: "/payments"
        }
      },
      {
        id: 22,
        menu_key: "transfers",
        is_visible: true,
        type: MenuType.FEATURE,
        group: MenuGroup.MAIN,
        name: "Transfers",
        icon: "ArrowLeftRight",
        required_features: [features[1]],
        breadcrumb: {
          title: "Transfers",
          parent: "/payments"
        }
      }
    ],
    breadcrumb: {
      title: "Payments"
    }
  },
  {
    id: 3,
    menu_key: "analytics",
    is_visible: true,
    custom_order: 3,
    type: MenuType.FEATURE,
    group: MenuGroup.MAIN,
    name: "Analytics",
    icon: "BarChart3",
    required_features: [features[2]],
    breadcrumb: {
      title: "Analytics"
    }
  }
]

export const menuGroups = [
  {
    id: "main",
    title: "Main Menu",
    type: MenuGroup.MAIN,
    items: menuItems.filter(item => item.group === MenuGroup.MAIN)
  }
  // 如果有system组，可以在此添加
]
