from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.db.session import get_session
from app.core.auth_jwt import get_current_user
from app.services.transaction_service import TransactionService
from app.services.budget_service import BudgetService
from app.models.user import User
from app.models.enums import TransactionType
from app.schemas.finance import ReportSummary, BudgetUsage
from app.api.v1.endpoints.api_models import BaseResponse

router = APIRouter()

@router.get("/summary", response_model=BaseResponse[ReportSummary])
async def get_summary_report(
    start_date: datetime,
    end_date: datetime,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    account_id: Optional[str] = None,
    transaction_type: Optional[TransactionType] = None
):
    """获取交易汇总报表
    
    按分类汇总交易金额，返回每个分类的总金额、交易笔数和占比
    """
    transaction_service = TransactionService(session)
    summary = transaction_service.get_category_summary(
        current_user,
        start_date,
        end_date,
        account_id=account_id,
        transaction_type=transaction_type
    )
    
    # 计算总金额
    total_amount = sum(item["total_amount"] for item in summary)
    
    # 计算每个分类的占比
    for item in summary:
        item["percentage"] = (abs(item["total_amount"]) / abs(total_amount)) * 100 if total_amount != 0 else 0
    
    return BaseResponse(data={
        "total": abs(total_amount),
        "items": summary,
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    })

@router.get("/budget-usage/{budget_id}", response_model=BaseResponse[BudgetUsage])
async def get_budget_usage(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取预算使用情况
    
    计算指定预算在当前周期内的使用情况，包括已用金额、剩余金额、使用百分比等
    """
    budget_service = BudgetService(session)
    usage = budget_service.get_budget_usage(current_user, budget_id)
    return BaseResponse(data=usage)

@router.get("/budget-usage", response_model=BaseResponse[List[BudgetUsage]])
async def get_all_budgets_usage(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取所有预算的使用情况
    
    计算用户所有预算在当前周期内的使用情况
    """
    budget_service = BudgetService(session)
    budgets = budget_service.get_budgets(current_user)
    
    usage_list = []
    for budget in budgets:
        try:
            usage = budget_service.get_budget_usage(current_user, budget.id)
            usage_list.append(usage)
        except Exception as e:
            # 如果某个预算计算出错，跳过并继续
            continue
    
    return BaseResponse(data=usage_list)

@router.get("/monthly-summary", response_model=BaseResponse[List[Dict[str, Any]]])
async def get_monthly_summary_report(
    year: int,
    month: Optional[int] = Query(None, ge=1, le=12),
    account_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取月度收支汇总报表
    
    按月份汇总用户的收入和支出。
    可以按年份、月份和账户进行筛选。
    """
    transaction_service = TransactionService(session)
    summary = transaction_service.get_monthly_summary(
        user=current_user,
        year=year,
        month=month,
        account_id=account_id
    )
    return BaseResponse(data=summary)
