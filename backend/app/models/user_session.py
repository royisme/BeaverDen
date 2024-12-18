from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class UserSession(Base):
    """user session model"""
    
    # session info
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("user.id", ondelete="CASCADE")
    )
    device_id: Mapped[str] = mapped_column(String(255), nullable=False)
    device_name: Mapped[Optional[str]] = mapped_column(String(255))
    device_type: Mapped[Optional[str]] = mapped_column(String(50))
    
    # token info
    token: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    token_expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # status info
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # relationship
    user: Mapped["User"] = relationship("User", back_populates="sessions")
    
    @property
    def is_expired(self) -> bool:
        """check if session is expired"""
        return datetime.utcnow() > self.token_expires_at
    
    def deactivate(self) -> None:
        """deactivate session"""
        self.is_active = False
    
    def __repr__(self) -> str:
        return f"<UserSession {self.id} for user {self.user_id}>"