# app/models/user.py
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Text, Enum as SQLEnum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from passlib.context import CryptContext


from app.models.base import Base

from app.models.enums import AccountStatus, Language, Currency, Theme
# 密码加密上下文
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


class User(Base):
    """用户模型"""
    __tablename__ = "user"
    # 基本信息字段
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    nickname: Mapped[Optional[str]] = mapped_column(String(50))
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    avatar_path: Mapped[Optional[str]] = mapped_column(Text)
    
    # 状态字段
    account_status: Mapped[AccountStatus] = mapped_column(
        SQLEnum(AccountStatus),
        default=AccountStatus.ACTIVE,
        nullable=False
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    session: Mapped[List["UserSession"]] = relationship(
        "UserSession",
        uselist=True,
        cascade="all, delete-orphan",
        back_populates="user"
    )

    preferences: Mapped["UserPreferences"] = relationship(
        "UserPreferences",
        uselist=False,
        cascade="all, delete-orphan",
        back_populates="user"
    )

    
    settings: Mapped["UserSettings"] = relationship(  # 添加 UserSettings 关系
        "UserSettings",
        uselist=False,
        cascade="all, delete-orphan",
        back_populates="user"
    )


    
    # 密码处理方法
    def set_password(self, password: str) -> None:
        """设置用户密码"""
        self.password_hash = pwd_context.hash(password)
    
    def verify_password(self, password: str) -> bool:
        """验证用户密码"""
        return pwd_context.verify(password, self.password_hash)
    
    # 状态检查方法
    @property
    def is_active(self) -> bool:
        """检查用户是否处于活跃状态"""
        return self.account_status == AccountStatus.ACTIVE
    
    def activate(self) -> None:
        """激活用户账户"""
        self.account_status = AccountStatus.ACTIVE
    
    def suspend(self) -> None:
        """暂停用户账户"""
        self.account_status = AccountStatus.SUSPENDED
    
    def soft_delete(self) -> None:
        """软删除用户账户"""
        self.account_status = AccountStatus.DELETED
    
    # 登录相关方法
    def update_last_login(self) -> None:
        """更新最后登录时间"""
        self.last_login_at = datetime.now(timezone.utc)

    
    # 新增方法
    def update_nickname(self, nickname: str) -> None:
        """更新用户昵称"""
        self.nickname = nickname

    def update_avatar_path(self, avatar_path: str) -> None:
        """更新用户头像路径"""
        self.avatar_path = avatar_path

    
    # 辅助方法
    def to_dict(self) -> dict:
        """转换为字典（重写基类方法以排除敏感信息）"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "nickname": self.nickname,
            "avatarPath": self.avatar_path,
            "accountStatus": self.account_status.value,
            "lastLoginAt": self.last_login_at.isoformat() if self.last_login_at else None,
            "preferences": self.preferences.to_dict() if self.preferences else None,
            "settings": self.settings.to_dict() if self.settings else None
        }

    def __repr__(self) -> str:
        """字符串表示"""
        return f"<User {self.username}>"
    
class UserSession(Base):
    """用户会话模型，存储会话和设备信息"""
    __tablename__ = "user_session"
    
    # 用户关联
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("user.id", ondelete="CASCADE")
    )

    
    # 基本设备信息
    device_id: Mapped[str] = mapped_column(String(255), nullable=False)
    device_name: Mapped[Optional[str]] = mapped_column(String(255))
    device_type: Mapped[Optional[str]] = mapped_column(String(50))
    
    # 扩展设备信息
    os: Mapped[Optional[str]] = mapped_column(
        String(255),
        comment="操作系统信息"
    )
    model: Mapped[Optional[str]] = mapped_column(
        String(255),
        comment="设备型号信息"
    )
    manufacturer: Mapped[Optional[str]] = mapped_column(
        String(255),
        comment="设备制造商"
    )
    ip: Mapped[Optional[str]] = mapped_column(
        String(45),  # IPv6 地址最长45字符
        comment="最后已知IP地址"
    )
    
    # 会话信息
    token: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    token_expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc)
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # 关系
    user: Mapped["User"] = relationship("User", back_populates="session")
    
    # # 辅助方法
    # def update_device_info(self, device_info: dict) -> None:
    #     """更新设备信息"""
    #     for field, value in device_info.items():
    #         setattr(self, field, value)
    #     self.last_active_at = datetime.now(timezone.utc)
    

    @property
    def is_expired(self) -> bool:
        """检查会话是否过期"""
        return datetime.now(timezone.utc) > self.token_expires_at
    
    def deactivate(self) -> None:
        """停用会话"""
        self.is_active = False
    
    def update_device_info(self, device_info: dict) -> None:
        """更新设备信息
        
        Args:
            device_info: 包含设备信息字段的字典
        """
        updateable_fields = {
            'deviceId': 'device_id',
            'deviceName': 'device_name',
            'deviceType': 'device_type',
            'os': 'os',
            'model': 'model',
            'manufacturer': 'manufacturer',
            'ip': 'ip'
        }

        for field, value in updateable_fields.items():
            if field in device_info:
                setattr(self, value, device_info[field])
        self.last_active_at = datetime.now(timezone.utc)
    
    def __repr__(self) -> str:
        return f"<UserSession {self.id} for user {self.user_id} on device {self.device_name or self.device_id}>"

class UserSettings(Base):
    """用户设置模型 (核心账户管理)"""
    __tablename__ = "user_settings"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("user.id", ondelete="CASCADE"),
        unique=True
    )
    user: Mapped["User"] = relationship(back_populates="settings")

    # 账户安全设置
    is_two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否启用两步验证")
    security_question_set: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否设置了安全问题")

    # 通知设置 (全局)
    email_notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, comment="是否启用邮件通知")

    # 其他核心账户设置
    account_locked: Mapped[bool] = mapped_column(Boolean, default=False, comment="账户是否被锁定")
    last_password_reset_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, comment="上次密码重置时间")

    user: Mapped["User"] = relationship(back_populates="settings")

    def to_dict(self) -> dict:
        return {
            "isTwoFactorEnabled": self.is_two_factor_enabled,
            "securityQuestionSet": self.security_question_set,
            "emailNotificationsEnabled": self.email_notifications_enabled,
            "accountLocked": self.account_locked,
            "lastPasswordResetAt": self.last_password_reset_at.isoformat() if self.last_password_reset_at else None,
        }
    
    def __repr__(self) -> str:
        return f"<UserSettings for user {self.user_id}>"
    
class UserPreferences(Base):
    """user preferences model"""
    __tablename__ = "user_preferences"

    # foreign key relationship
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("user.id", ondelete="CASCADE"),
        unique=True
    )
    user: Mapped["User"] = relationship(back_populates="preferences")

    # 基本设置 (偏好)
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
        default=Theme.FRESH
    )

    # 登录设置 (偏好)
    login_expire_days: Mapped[int] = mapped_column(Integer, default=7)
    require_password_on_launch: Mapped[bool] = mapped_column(Boolean, default=False)

    # 通知设置 (偏好)
    notification_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<UserPreferences for user {self.user_id}>"

    def to_dict(self) -> dict:
        return {
            "language": self.language.value,
            "currency": self.currency.value,
            "theme": self.theme.value,
            "loginExpireDays": self.login_expire_days,
            "requirePasswordOnLaunch": self.require_password_on_launch,
            "notificationEnabled": self.notification_enabled
        }