import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.menu import MenuConfig, Feature, MenuType, MenuGroup
from app.models.user import User
from app.models.enums import SubscriptionTier

logger = logging.getLogger(__name__)

class MenuService:
    """菜单服务，负责菜单的加载和权限控制"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_menus(self, user: User) -> List[Dict[str, Any]]:
        """
        获取用户可访问的菜单
        
        Args:
            user: 当前用户
            
        Returns:
            List[Dict[str, Any]]: 菜单列表
        """
        try:
            # 获取所有可见菜单
            menus = self.db.query(MenuConfig).filter(
                MenuConfig.is_visible == True,
                MenuConfig.parent_id == None  # 只获取顶级菜单
            ).options(
                joinedload(MenuConfig.required_features),
                joinedload(MenuConfig.children).joinedload(MenuConfig.required_features)
            ).order_by(
                MenuConfig.order
            ).all()
            
            # 过滤用户有权限访问的菜单
            accessible_menus = []
            for menu in menus:
                if self._is_menu_accessible(menu, user):
                    menu_dict = self._menu_to_dict(menu)
                    
                    # 处理子菜单
                    if menu.children:
                        accessible_children = []
                        for child in menu.children:
                            if self._is_menu_accessible(child, user):
                                accessible_children.append(self._menu_to_dict(child))
                        
                        if accessible_children:
                            menu_dict["children"] = accessible_children
                    
                    accessible_menus.append(menu_dict)
            
            return accessible_menus
            
        except Exception as e:
            logger.error(f"Error getting user menus: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to load menus"
            )
    
    def get_menu_groups(self, user: User) -> List[Dict[str, Any]]:
        """
        获取按组分类的菜单
        
        Args:
            user: 当前用户
            
        Returns:
            List[Dict[str, Any]]: 菜单组列表
        """
        try:
            # 获取用户可访问的菜单
            menus = self.get_user_menus(user)
            
            # 按组分类
            groups = {}
            for menu in menus:
                group = menu.get("group", MenuGroup.MAIN.value)
                if group not in groups:
                    groups[group] = {
                        "id": group,
                        "title": self._get_group_title(group),
                        "type": group,
                        "items": []
                    }
                groups[group]["items"].append(menu)
            
            return list(groups.values())
            
        except Exception as e:
            logger.error(f"Error getting menu groups: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to load menu groups"
            )
    
    def _is_menu_accessible(self, menu: MenuConfig, user: User) -> bool:
        """
        检查用户是否有权限访问菜单
        
        Args:
            menu: 菜单配置
            user: 当前用户
            
        Returns:
            bool: 是否有权限访问
        """
        # 如果菜单不可见，则不可访问
        if not menu.is_visible:
            return False
        
        # 如果菜单没有关联功能，则默认可访问
        if not menu.required_features:
            return True
        
        # 检查用户是否有权限访问菜单关联的所有功能
        for feature in menu.required_features:
            # 如果功能未激活，则不可访问
            if not feature.is_active:
                return False
            
            # 检查用户订阅级别是否满足要求
            # 这里假设用户订阅级别存储在用户设置中
            user_tier = SubscriptionTier.FREE  # 默认为免费版
            if user.settings and hasattr(user.settings, "subscription_tier"):
                user_tier = user.settings.subscription_tier
            
            # 如果用户订阅级别低于功能要求，则不可访问
            if self._get_tier_level(user_tier) < self._get_tier_level(feature.subscription_tier):
                return False
        
        return True
    
    def _get_tier_level(self, tier: SubscriptionTier) -> int:
        """
        获取订阅级别的数值
        
        Args:
            tier: 订阅级别
            
        Returns:
            int: 订阅级别的数值
        """
        tier_levels = {
            SubscriptionTier.FREE: 0,
            SubscriptionTier.STANDARD: 1,
            SubscriptionTier.PREMIUM: 2
        }
        return tier_levels.get(tier, 0)
    
    def _menu_to_dict(self, menu: MenuConfig) -> Dict[str, Any]:
        """
        将菜单对象转换为字典
        
        Args:
            menu: 菜单对象
            
        Returns:
            Dict[str, Any]: 菜单字典
        """
        # 构建面包屑信息
        breadcrumb = {
            "title": menu.name
        }
        
        # 如果有父菜单，添加父菜单路径
        if menu.parent:
            breadcrumb["parent"] = f"/{menu.parent.menu_key}"
        
        return {
            "id": menu.id,
            "menu_key": menu.menu_key,
            "is_visible": menu.is_visible,
            "custom_order": menu.custom_order,
            "type": menu.type.value,
            "group": menu.group.value,
            "name": menu.name,
            "icon": menu.icon or "",
            "required_features": [
                {
                    "id": feature.id,
                    "feature_key": feature.feature_key,
                    "subscription_tier": feature.subscription_tier.value,
                    "is_active": feature.is_active,
                    "module_key": feature.module_key,
                    "custom_config": feature.custom_config
                }
                for feature in menu.required_features
            ],
            "breadcrumb": breadcrumb
        }
    
    def _get_group_title(self, group: str) -> str:
        """
        获取菜单组的显示标题
        
        Args:
            group: 菜单组标识
            
        Returns:
            str: 菜单组标题
        """
        titles = {
            MenuGroup.MAIN.value: "主菜单",
            MenuGroup.SYSTEM.value: "系统菜单"
        }
        return titles.get(group, group.capitalize())
