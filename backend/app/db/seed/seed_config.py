from typing import Dict, Any, List
from app.models.user_settings import Language, Currency, Theme
from app.models.menu import Permission, Feature, MenuConfig, SubscriptionTier
class SeedConfig:
    """all of the seed data for the database"""
    
    @staticmethod
    def get_permissions() -> List[Dict[str, str]]:
        """system permission configuration"""
        return [
            {
                "permission_key": "basic_access",
                "description": "basic system access permission"
            },
            {
                "permission_key": "transaction_manage",
                "description": "transaction management permission"
            },
            {
                "permission_key": "budget_manage",
                "description": "budget management permission"
            },
            {
                "permission_key": "account_manage",
                "description": "account management permission"
            },
            {
                "permission_key": "report_access",
                "description": "report access permission"
            }
        ]
    
    @staticmethod
    def get_features() -> List[Dict[str, Any]]:
        """feature configuration"""
        return [
            {
                "feature_key": "basic_transaction",
                "subscription_tier": SubscriptionTier.FREE,
                "is_active": True,
                "custom_config": {
                    "max_transactions": 1000,
                    "max_categories": 20
                },
                "required_permissions": ["basic_access", "transaction_manage"]
            },
            {
                "feature_key": "basic_budget",
                "subscription_tier": SubscriptionTier.FREE,
                "is_active": True,
                "custom_config": {
                    "max_budgets": 5
                },
                "required_permissions": ["basic_access", "budget_manage"]
            },
            {
                "feature_key": "account_management",
                "subscription_tier": SubscriptionTier.FREE,
                "is_active": True,
                "custom_config": {
                    "max_accounts": 3
                },
                "required_permissions": ["basic_access", "account_manage"]
            },
            {
                "feature_key": "advanced_reporting",
                "subscription_tier": SubscriptionTier.PREMIUM,
                "is_active": True,
                "custom_config": {
                    "export_formats": ["pdf", "excel", "csv"]
                },
                "required_permissions": ["basic_access", "report_access"]
            }
        ]
    
    @staticmethod
    def get_menus() -> List[Dict[str, Any]]:
        """menu configuration"""
        return [
            {
                "menu_key": "dashboard",
                "is_visible": True,
                "custom_order": 1,
                "required_features": ["basic_transaction"]
            },
            {
                "menu_key": "accounts",
                "is_visible": True,
                "custom_order": 2,
                "required_features": ["account_management"]
            },
            {
                "menu_key": "transactions",
                "is_visible": True,
                "custom_order": 3,
                "required_features": ["basic_transaction"]
            },
            {
                "menu_key": "budget",
                "is_visible": True,
                "custom_order": 4,
                "required_features": ["basic_budget"]
            },
            {
                "menu_key": "reports",
                "is_visible": True,
                "custom_order": 5,
                "required_features": ["advanced_reporting"]
            }
        ]
    
    @staticmethod
    def get_default_user_settings() -> Dict[str, Any]:
        """default user settings"""
        return {
            "language": Language.EN,
            "currency": Currency.CAD,
            "theme": Theme.DEFAULT,
            "login_expire_days": 7,
            "require_password_on_launch": False,
            "notification_enabled": True
        }
