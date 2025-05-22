from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.category_rule import MatchType, MatchField

class CategoryRuleBase(BaseModel):
    category_id: str = Field(..., description="分类ID")
    field: str = Field(..., description="匹配字段 (description 或 merchant)")
    pattern: str = Field(..., description="匹配模式")
    match_type: str = Field(..., description="匹配类型 (exact, contains, regex)")
    is_active: bool = Field(True, description="是否启用")
    priority: int = Field(0, description="优先级 (数字越大优先级越高)")

class CategoryRuleCreate(CategoryRuleBase):
    pass

class CategoryRuleUpdate(BaseModel):
    category_id: Optional[str] = None
    field: Optional[str] = None
    pattern: Optional[str] = None
    match_type: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None

class CategoryRuleResponse(CategoryRuleBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
