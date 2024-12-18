from typing import Optional
import enum
from sqlalchemy import String, Boolean, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class Language(enum.Enum):
    """supported languages"""
    EN = "en"
    ZH = "zh"

class Currency(enum.Enum):
    """supported currencies"""
    CAD = "CAD"
    USD = "USD"

class Theme(enum.Enum):
    """supported themes"""
    DEFAULT = "default"
    NATURAL = "natural"
    OCEAN = "ocean"
    SUNSET = "sunset"

class UserSettings(Base):
    """user settings model"""
    
    # foreign key relationship
    user_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("user.id", ondelete="CASCADE"),
        unique=True
    )
    
    # 基本设置
    language: Mapped[Language] = mapped_column(
        SQLEnum(Language),
        default=Language.EN
    )
    currency: Mapped[Currency] = mapped_column(
        SQLEnum(Currency),
        default=Currency.CAD
    )
    theme: Mapped[Theme] = mapped_column(
        SQLEnum(Theme),
        default=Theme.DEFAULT
    )
    
    # 登录设置
    login_expire_days: Mapped[int] = mapped_column(Integer, default=7)
    require_password_on_launch: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # 通知设置
    notification_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # 关系
    user: Mapped["User"] = relationship("User", back_populates="settings")
    
    def __repr__(self) -> str:
        return f"<UserSettings for user {self.user_id}>"