import logging
from typing import Dict
from sqlalchemy.orm import Session
from app.models.menu import Permission, Feature, MenuConfig
from app.db.seed.seed_config import SeedConfig

logger = logging.getLogger(__name__)

class DatabaseSeeder:
    """database initialization manager"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self._permission_cache: Dict[str, Permission] = {}
        self._feature_cache: Dict[str, Feature] = {}
    
    def seed_all(self) -> None:
        """execute all initialization operations"""
        try:
            self._seed_permissions()
            self._seed_features()
            self._seed_menus()
            self.db.commit()
            logger.info("Database seeding completed successfully")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Database seeding failed: {str(e)}")
            raise
    
    def _seed_permissions(self) -> None:
        """initialize permission data"""
        for perm_data in SeedConfig.get_permissions():
            if not self.db.query(Permission).filter_by(
                permission_key=perm_data["permission_key"]
            ).first():
                permission = Permission(**perm_data)
                self.db.add(permission)
                self._permission_cache[permission.permission_key] = permission
        
        self.db.flush()
        logger.info("Permissions seeded")
    
    def _seed_features(self) -> None:
        """initialize feature data"""
        for feature_data in SeedConfig.get_features():
            required_permissions = feature_data.pop("required_permissions")
            
            if not self.db.query(Feature).filter_by(
                feature_key=feature_data["feature_key"]
            ).first():
                feature = Feature(**feature_data)
                # 添加关联的权限
                for perm_key in required_permissions:
                    permission = self._permission_cache.get(perm_key)
                    if permission:
                        feature.required_permissions.append(permission)
                
                self.db.add(feature)
                self._feature_cache[feature.feature_key] = feature
        
        self.db.flush()
        logger.info("Features seeded")
    
    def _seed_menus(self) -> None:
        """initialize menu configuration"""
        for menu_data in SeedConfig.get_menus():
            required_features = menu_data.pop("required_features")
            
            if not self.db.query(MenuConfig).filter_by(
                menu_key=menu_data["menu_key"]
            ).first():
                menu = MenuConfig(**menu_data)
                # 添加关联的功能特性
                for feature_key in required_features:
                    feature = self._feature_cache.get(feature_key)
                    if feature:
                        menu.required_features.append(feature)
                
                self.db.add(menu)
        
        logger.info("Menus seeded")
    
    def create_user_settings(self, user_id: str) -> None:
        """create default settings for new users"""
        from app.models.user_settings import UserSettings
        settings = UserSettings(
            user_id=user_id,
            **SeedConfig.get_default_user_settings()
        )
        self.db.add(settings)
        self.db.flush()
        logger.info(f"Created default settings for user {user_id}")