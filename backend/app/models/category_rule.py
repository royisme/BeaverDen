from sqlalchemy import Column, String, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional
from app.models.base import Base
import enum

class MatchType(str, enum.Enum):
    """Match type for category rules"""
    EXACT = "exact"
    CONTAINS = "contains"
    REGEX = "regex"

class MatchField(str, enum.Enum):
    """Field to match against"""
    DESCRIPTION = "description"
    MERCHANT = "merchant"

class CategoryRule(Base):
    """User-defined rules for automatic transaction categorization"""
    __tablename__ = "category_rule"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("transaction_category.id", ondelete="CASCADE"), nullable=False)
    field: Mapped[MatchField] = mapped_column(Enum(MatchField), nullable=False)
    pattern: Mapped[str] = mapped_column(String(255), nullable=False)
    match_type: Mapped[MatchType] = mapped_column(Enum(MatchType), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(default=0)  # Higher priority rules are checked first
    
    # Relationships
    user = relationship("User", back_populates="category_rules")
    category = relationship("TransactionCategory", back_populates="rules")
    
    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "categoryId": self.category_id,
            "field": self.field.value,
            "pattern": self.pattern,
            "matchType": self.match_type.value,
            "isActive": self.is_active,
            "priority": self.priority,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }
