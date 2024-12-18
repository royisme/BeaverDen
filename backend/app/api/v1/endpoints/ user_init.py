from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.user import User
from app.models.user_settings import UserSettings, Language, Currency, Theme
from app.db.seed.seed_config import SeedConfig
from typing import Dict, Optional
from pydantic import BaseModel
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class UserInitStatus(BaseModel):
    """系统初始化状态响应模型"""
    is_first_start: bool
    has_local_user: bool
    initialized: bool

class InitialUserSettings(BaseModel):
    """用户初始设置请求模型"""
    language: Language
    currency: Currency
    theme: Theme
    device_name: Optional[str] = None
    device_id: str

class UserInitResponse(BaseModel):
    """用户初始化响应模型"""
    user_id: str
    settings_id: str
    initialized: bool
    
@router.get("/init/status", response_model=UserInitStatus)
async def check_init_status(
    session: AsyncSession = Depends(get_session)
) -> Dict:
    """
    检查系统的初始化状态
    - 检查是否首次启动
    - 检查是否已有本地用户
    - 检查系统是否已完成初始化
    """
    try:
        # 检查是否有任何用户
        result = await session.execute(
            "SELECT COUNT(*) FROM user"
        )
        user_count = result.scalar()
        
        return {
            "is_first_start": user_count == 0,
            "has_local_user": user_count > 0,
            "initialized": user_count > 0
        }
    except Exception as e:
        logger.error(f"Error checking init status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check initialization status")

@router.post("/init/user", response_model=UserInitResponse)
async def initialize_local_user(
    settings: InitialUserSettings,
    session: AsyncSession = Depends(get_session)
) -> Dict:
    """
    创建本地用户并初始化配置
    - 创建新用户记录
    - 初始化用户设置
    - 设置默认权限和功能
    """
    try:
        # 生成唯一用户ID
        user_id = str(uuid.uuid4())
        
        # 创建本地用户
        new_user = User(
            id=user_id,
            username=f"local_user_{user_id[:8]}",  # 创建一个基于ID的用户名
            device_id=settings.device_id,
            is_first_login=True
        )
        new_user.set_password("local_user")  # 设置默认密码
        session.add(new_user)
        
        # 创建用户设置
        user_settings = UserSettings(
            id=str(uuid.uuid4()),
            user_id=user_id,
            language=settings.language,
            currency=settings.currency,
            theme=settings.theme,
            login_expire_days=7,  # 默认值
            require_password_on_launch=False,  # 默认值
            notification_enabled=True  # 默认值
        )
        session.add(user_settings)
        
        # 提交事务
        await session.commit()
        
        return {
            "user_id": user_id,
            "settings_id": user_settings.id,
            "initialized": True
        }
        
    except Exception as e:
        await session.rollback()
        logger.error(f"Error initializing user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initialize user")

@router.put("/init/settings/{user_id}")
async def update_user_settings(
    user_id: str,
    settings: InitialUserSettings,
    session: AsyncSession = Depends(get_session)
) -> Dict:
    """
    更新用户的基本设置
    - 更新语言设置
    - 更新货币设置
    - 更新主题设置
    """
    try:
        # 查找用户设置
        result = await session.execute(
            "SELECT * FROM usersettings WHERE user_id = :user_id",
            {"user_id": user_id}
        )
        user_settings = result.first()
        
        if not user_settings:
            raise HTTPException(status_code=404, detail="User settings not found")
            
        # 更新设置
        await session.execute(
            """
            UPDATE usersettings 
            SET language = :language,
                currency = :currency,
                theme = :theme
            WHERE user_id = :user_id
            """,
            {
                "language": settings.language.value,
                "currency": settings.currency.value,
                "theme": settings.theme.value,
                "user_id": user_id
            }
        )
        
        await session.commit()
        
        return {"status": "success", "message": "Settings updated successfully"}
        
    except Exception as e:
        await session.rollback()
        logger.error(f"Error updating user settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update settings")