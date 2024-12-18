# backend/app/db/base.py
from datetime import datetime
import uuid
from typing import Any
from sqlalchemy.ext.declarative import declared_attr, declarative_base
from sqlalchemy.orm import DeclarativeMeta, Mapped, mapped_column
from sqlalchemy import DateTime, String, event
from sqlalchemy.ext.asyncio import AsyncAttrs

class BaseClass:
    """Base class for all models"""
    
    # Primary key using UUID
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    
    # Automatic table name generation
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
    
    # Timestamp fields
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert model instance to dictionary"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Any:
        """Create model instance from dictionary"""
        return cls(**{
            k: v for k, v in data.items() 
            if k in cls.__table__.columns.keys()
        })

# Create declarative base class with BaseClass
Base = declarative_base(cls=(BaseClass, AsyncAttrs))

# Register event listeners
@event.listens_for(Base, 'before_update', propagate=True)
def timestamp_before_update(mapper, connection, target):
    """Update timestamp before update"""
    target.updated_at = datetime.utcnow()

# Import all models here to ensure they are registered with Base
from app.models.user import User  # 这里会在后续实现
from app.models.user_settings import UserSettings
from app.models.user_session import UserSession
from app.models.menu import Permission, Feature, MenuConfig, FeaturePermission, MenuRequiredFeature

# Make sure all models are imported
__all__ = ['Base', 'User', 'UserSettings', 'UserSession', 'Permission', 'Feature', 'MenuConfig', 'FeaturePermission', 'MenuRequiredFeature']
