# app/models/user.py
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from passlib.context import CryptContext
import enum

from app.models.base import Base

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AccountStatus(enum.Enum):
    """用户账户状态"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"

class User(Base):
    """用户模型"""
    
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
    is_first_login: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # 关系定义
    settings: Mapped["UserSettings"] = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    sessions: Mapped[List["UserSession"]] = relationship(
        "UserSession",
        back_populates="user",
        cascade="all, delete-orphan"
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
        self.last_login_at = datetime.utcnow()
        if self.is_first_login:
            self.is_first_login = False
    
    # 辅助方法
    def to_dict(self) -> dict:
        """转换为字典（重写基类方法以排除敏感信息）"""
        d = super().to_dict()
        d.pop("password_hash", None)  # 移除密码哈希
        return d

    def __repr__(self) -> str:
        """字符串表示"""
        return f"<User {self.username}>"