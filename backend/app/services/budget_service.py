import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from fastapi import HTTPException
import uuid

from app.models.finance import Budget
from app.models.transaction import Transaction, TransactionCategory
from app.models.user import User
from app.schemas.finance import BudgetCreate, BudgetUpdate

logger = logging.getLogger(__name__)

class BudgetService:
    def __init__(self, db: Session):
        self.db = db

    def create_budget(self, user: User, budget_data: BudgetCreate) -> Budget:
        """创建预算"""
        try:
            # 创建预算记录
            budget = Budget(
                id=str(uuid.uuid4()),
                user_id=user.id,
                name=budget_data.name,
                amount=budget_data.amount,
                period_type=budget_data.period_type,
                category=budget_data.category,
                start_date=budget_data.start_date,
                end_date=budget_data.end_date
            )
            self.db.add(budget)
            self.db.commit()
            self.db.refresh(budget)
            return budget
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating budget: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create budget")

    def get_budgets(self, user: User, skip: int = 0, limit: int = 100) -> List[Budget]:
        """获取预算列表"""
        return self.db.query(Budget).filter(
            Budget.user_id == user.id
        ).offset(skip).limit(limit).all()

    def get_budget(self, user: User, budget_id: str) -> Optional[Budget]:
        """获取预算详情"""
        return self.db.query(Budget).filter(
            Budget.id == budget_id,
            Budget.user_id == user.id
        ).first()

    def update_budget(self, user: User, budget_id: str, budget_data: BudgetUpdate) -> Optional[Budget]:
        """更新预算"""
        budget = self.get_budget(user, budget_id)
        if not budget:
            return None
        
        try:
            # 更新预算字段
            for field, value in budget_data.dict(exclude_unset=True).items():
                setattr(budget, field, value)
            
            self.db.commit()
            self.db.refresh(budget)
            return budget
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating budget: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update budget")

    def delete_budget(self, user: User, budget_id: str) -> Optional[Budget]:
        """删除预算"""
        budget = self.get_budget(user, budget_id)
        if not budget:
            return None
        
        try:
            self.db.delete(budget)
            self.db.commit()
            return budget
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting budget: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to delete budget")

    def get_budget_usage(self, user: User, budget_id: str) -> Dict[str, Any]:
        """获取预算使用情况"""
        budget = self.get_budget(user, budget_id)
        if not budget:
            raise HTTPException(status_code=404, detail="Budget not found")
        
        # 计算预算周期的开始和结束日期
        start_date, end_date = self._get_budget_period_dates(budget)
        
        # 查询该周期内的相关交易
        transactions_query = self.db.query(
            func.sum(Transaction.amount).label("total_amount")
        ).filter(
            Transaction.user_id == user.id,
            Transaction.transaction_date.between(start_date, end_date)
        )
        
        # 如果预算指定了分类，则按分类筛选
        if budget.category:
            transactions_query = transactions_query.filter(
                Transaction.category_id == budget.category
            )
        
        # 执行查询
        result = transactions_query.first()
        total_spent = abs(float(result.total_amount or 0))
        
        # 计算预算使用情况
        budget_amount = float(budget.amount)
        remaining = budget_amount - total_spent
        percentage_used = (total_spent / budget_amount) * 100 if budget_amount > 0 else 0
        is_over_budget = total_spent > budget_amount
        
        return {
            "budget": budget.to_dict(),
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "current_period": self._get_period_display(budget.period_type, start_date, end_date)
            },
            "usage": {
                "total_spent": total_spent,
                "remaining": remaining,
                "percentage_used": percentage_used,
                "is_over_budget": is_over_budget
            }
        }

    def _get_budget_period_dates(self, budget: Budget) -> tuple[datetime, datetime]:
        """根据预算周期类型计算当前周期的开始和结束日期"""
        today = datetime.now().date()
        
        if budget.period_type == "monthly":
            # 当月的第一天和最后一天
            start_date = datetime(today.year, today.month, 1)
            if today.month == 12:
                end_date = datetime(today.year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = datetime(today.year, today.month + 1, 1) - timedelta(days=1)
        
        elif budget.period_type == "weekly":
            # 当前周的第一天和最后一天（周一到周日）
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
            start_date = datetime.combine(start_date, datetime.min.time())
            end_date = datetime.combine(end_date, datetime.max.time())
        
        elif budget.period_type == "yearly":
            # 当年的第一天和最后一天
            start_date = datetime(today.year, 1, 1)
            end_date = datetime(today.year, 12, 31)
        
        else:
            # 默认使用预算的开始和结束日期
            start_date = budget.start_date or datetime.now()
            end_date = budget.end_date or (start_date + timedelta(days=30))
        
        return start_date, end_date

    def _get_period_display(self, period_type: str, start_date: datetime, end_date: datetime) -> str:
        """获取周期的显示文本"""
        if period_type == "monthly":
            return start_date.strftime("%B %Y")
        elif period_type == "weekly":
            return f"{start_date.strftime('%b %d')} - {end_date.strftime('%b %d, %Y')}"
        elif period_type == "yearly":
            return str(start_date.year)
        else:
            return f"{start_date.strftime('%b %d')} - {end_date.strftime('%b %d, %Y')}"
