from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.enums import Currency, RecurringPeriod

class BudgetBase(BaseModel):
    name: str = Field(..., description="预算名称")
    amount: float = Field(..., description="预算金额")
    period_type: str = Field(..., description="周期类型 (monthly, weekly, yearly)")
    category: Optional[str] = Field(None, description="分类ID")
    start_date: Optional[datetime] = Field(None, description="开始日期")
    end_date: Optional[datetime] = Field(None, description="结束日期")

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    period_type: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class Budget(BudgetBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BudgetUsagePeriod(BaseModel):
    start_date: str
    end_date: str
    current_period: str

class BudgetUsageStats(BaseModel):
    total_spent: float
    remaining: float
    percentage_used: float
    is_over_budget: bool

class BudgetUsage(BaseModel):
    budget: Dict[str, Any]
    period: BudgetUsagePeriod
    usage: BudgetUsageStats

class ReportSummaryItem(BaseModel):
    category_id: str
    category_name: str
    total_amount: float
    count: int
    percentage: float

class ReportSummary(BaseModel):
    total: float
    items: List[ReportSummaryItem]
    period: Dict[str, str]
