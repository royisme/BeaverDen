# app/models/base.py
from datetime import datetime, timezone
import uuid
from typing import Any, TypeVar
from sqlalchemy.orm import  Mapped, mapped_column, DeclarativeBase
from sqlalchemy import DateTime, String, event
T = TypeVar('T')

class Base(DeclarativeBase):
    """Base class for all models"""
    
    # Primary key using UUID
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    
    # Timestamp fields
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert model instance to dictionary"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    @classmethod
    def from_dict(cls: type[T], data: dict[str, Any]) -> T:
        """Create model instance from dictionary"""
        return cls(**{
            k: v for k, v in data.items()
            if k in cls.__table__.columns.keys()
        })

# Register event listeners
@event.listens_for(Base, 'before_update', propagate=True)
def timestamp_before_update(mapper, connection, target):
    """Update timestamp before update"""
    target.updated_at = datetime.now(timezone.utc)