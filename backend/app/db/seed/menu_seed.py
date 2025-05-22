import logging
from sqlalchemy.orm import Session
from app.models.menu import MenuConfig, Feature, Permission, FeaturePermission, MenuRequiredFeature, MenuType, MenuGroup
from app.models.enums import SubscriptionTier

logger = logging.getLogger(__name__)

def seed_menus(db: Session) -> None:
    """
    初始化菜单数据
    
    创建基本的菜单项、功能和权限
    """
    logger.info("Seeding menu data...")
    
    # 检查是否已有菜单数据
    if db.query(MenuConfig).count() > 0:
        logger.info("Menu data already exists, skipping...")
        return
    
    # 创建权限
    permissions = _create_permissions(db)
    
    # 创建功能
    features = _create_features(db, permissions)
    
    # 创建菜单
    _create_menus(db, features)
    
    logger.info("Menu data seeded successfully")

def _create_permissions(db: Session) -> dict:
    """创建基本权限"""
    logger.info("Creating permissions...")
    
    permissions = {
        "dashboard_access": Permission(
            permission_key="dashboard_access",
            description="访问仪表盘"
        ),
        "transaction_manage": Permission(
            permission_key="transaction_manage",
            description="管理交易"
        ),
        "budget_manage": Permission(
            permission_key="budget_manage",
            description="管理预算"
        ),
        "report_view": Permission(
            permission_key="report_view",
            description="查看报表"
        ),
        "account_manage": Permission(
            permission_key="account_manage",
            description="管理账户"
        ),
        "settings_manage": Permission(
            permission_key="settings_manage",
            description="管理设置"
        )
    }
    
    for permission in permissions.values():
        db.add(permission)
    
    db.flush()
    return permissions

def _create_features(db: Session, permissions: dict) -> dict:
    """创建基本功能"""
    logger.info("Creating features...")
    
    features = {
        "dashboard": Feature(
            feature_key="dashboard",
            subscription_tier=SubscriptionTier.FREE,
            is_active=True,
            module_key="dashboard",
            custom_config={"maxWidgets": 5}
        ),
        "transactions": Feature(
            feature_key="transactions",
            subscription_tier=SubscriptionTier.STANDARD,
            is_active=True,
            module_key="transactions",
            custom_config={"maxTransactions": 1000}
        ),
        "budget": Feature(
            feature_key="budget",
            subscription_tier=SubscriptionTier.STANDARD,
            is_active=True,
            module_key="budget"
        ),
        "reports": Feature(
            feature_key="reports",
            subscription_tier=SubscriptionTier.PREMIUM,
            is_active=True,
            module_key="reports",
            custom_config={"exportFormats": ["pdf", "excel"]}
        ),
        "accounts": Feature(
            feature_key="accounts",
            subscription_tier=SubscriptionTier.STANDARD,
            is_active=True,
            module_key="accounts"
        ),
        "settings": Feature(
            feature_key="settings",
            subscription_tier=SubscriptionTier.FREE,
            is_active=True,
            module_key="settings"
        )
    }
    
    # 添加功能
    for feature in features.values():
        db.add(feature)
    
    db.flush()
    
    # 关联权限
    feature_permission_map = {
        "dashboard": ["dashboard_access"],
        "transactions": ["transaction_manage"],
        "budget": ["budget_manage"],
        "reports": ["report_view"],
        "accounts": ["account_manage"],
        "settings": ["settings_manage"]
    }
    
    for feature_key, permission_keys in feature_permission_map.items():
        feature = features[feature_key]
        for permission_key in permission_keys:
            permission = permissions[permission_key]
            feature.required_permissions.append(permission)
    
    db.flush()
    return features

def _create_menus(db: Session, features: dict) -> None:
    """创建基本菜单"""
    logger.info("Creating menus...")
    
    # 创建主菜单
    menus = {
        "dashboard": MenuConfig(
            menu_key="dashboard",
            is_visible=True,
            custom_order=1,
            type=MenuType.FEATURE,
            group=MenuGroup.MAIN,
            name="概览",
            icon="LayoutDashboard"
        ),
        "transactions": MenuConfig(
            menu_key="transactions",
            is_visible=True,
            custom_order=2,
            type=MenuType.FEATURE,
            group=MenuGroup.MAIN,
            name="交易",
            icon="Receipt"
        ),
        "budget": MenuConfig(
            menu_key="budget",
            is_visible=True,
            custom_order=3,
            type=MenuType.FEATURE,
            group=MenuGroup.MAIN,
            name="预算",
            icon="PiggyBank"
        ),
        "reports": MenuConfig(
            menu_key="reports",
            is_visible=True,
            custom_order=4,
            type=MenuType.FEATURE,
            group=MenuGroup.MAIN,
            name="报表",
            icon="BarChart"
        ),
        "accounts": MenuConfig(
            menu_key="accounts",
            is_visible=True,
            custom_order=5,
            type=MenuType.FEATURE,
            group=MenuGroup.MAIN,
            name="账户",
            icon="Wallet"
        ),
        "settings": MenuConfig(
            menu_key="settings",
            is_visible=True,
            custom_order=6,
            type=MenuType.SETTING,
            group=MenuGroup.SYSTEM,
            name="设置",
            icon="Settings"
        )
    }
    
    # 添加菜单
    for menu in menus.values():
        db.add(menu)
    
    db.flush()
    
    # 创建子菜单
    sub_menus = [
        # 账户子菜单
        MenuConfig(
            menu_key="bank-accounts",
            is_visible=True,
            type=MenuType.FEATURE,
            group=MenuGroup.MAIN,
            name="银行账户",
            icon="Building2",
            parent_id=menus["accounts"].id
        ),
        MenuConfig(
            menu_key="investment-accounts",
            is_visible=True,
            type=MenuType.FEATURE,
            group=MenuGroup.MAIN,
            name="投资账户",
            icon="TrendingUp",
            parent_id=menus["accounts"].id
        ),
        MenuConfig(
            menu_key="loan-accounts",
            is_visible=True,
            type=MenuType.FEATURE,
            group=MenuGroup.MAIN,
            name="贷款账户",
            icon="HandCoins",
            parent_id=menus["accounts"].id
        ),
        MenuConfig(
            menu_key="other-accounts",
            is_visible=True,
            type=MenuType.FEATURE,
            group=MenuGroup.MAIN,
            name="其他账户",
            icon="CircleDollarSign",
            parent_id=menus["accounts"].id
        )
    ]
    
    for sub_menu in sub_menus:
        db.add(sub_menu)
    
    db.flush()
    
    # 关联功能
    menu_feature_map = {
        "dashboard": ["dashboard"],
        "transactions": ["transactions"],
        "budget": ["budget"],
        "reports": ["reports"],
        "accounts": ["accounts"],
        "settings": ["settings"]
    }
    
    for menu_key, feature_keys in menu_feature_map.items():
        menu = menus[menu_key]
        for feature_key in feature_keys:
            feature = features[feature_key]
            menu.required_features.append(feature)
    
    # 子菜单关联功能
    for sub_menu in sub_menus:
        sub_menu.required_features.append(features["accounts"])
    
    db.flush()
