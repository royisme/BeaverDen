import logging
from typing import Dict
from sqlalchemy.orm import Session
from app.models.user import User,UserPreferences
from app.models.enums import Language, Currency, Theme
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_preferences(self, user: User) -> UserPreferences:
        """获取用户设置"""
        if not user.preferences:
            raise HTTPException(status_code=404, detail="User settings not found")
        return user.preferences

    def update_user_preferences(self, user: User, settings: Dict) -> UserPreferences:
        """更新用户设置"""
        if not user.preferences:
            raise HTTPException(status_code=404, detail="User settings not found")

        try:
            if 'language' in settings:
                user.preferences.language = Language(settings['language'])
            if 'currency' in settings:
                user.preferences.currency = Currency(settings['currency'])
            if 'theme' in settings:
                user.preferences.theme = Theme(settings['theme'])
            if 'login_expire_days' in settings:
                user.preferences.login_expire_days = settings['login_expire_days']
            if 'require_password_on_launch' in settings:
                user.preferences.require_password_on_launch = settings['require_password_on_launch']
            if 'notification_enabled' in settings:
                user.preferences.notification_enabled = settings['notification_enabled']

            self.db.commit()
            self.db.refresh(user.preferences) # 刷新对象
            return user.preferences
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating user settings: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update user settings")
        
    def update_user_avatar(self, user: User, avatar_path: str) -> None:
        """更新用户头像"""
        user.avatar_path = avatar_path
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_user_nickname(self, user: User, nickname: str) -> None:
        """更新用户昵称"""
        user.nickname = nickname
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_user_email(self, user: User, email: str) -> None:
        """更新用户邮箱"""
        user.email = email
        self.db.commit()
        self.db.refresh(user)
        return user
