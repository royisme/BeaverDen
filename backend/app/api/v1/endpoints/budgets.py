from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_session
from app.core.auth_jwt import get_current_user
from app.services.budget_service import BudgetService
from app.models.user import User
from app.schemas.finance import (
    Budget as BudgetSchema,
    BudgetCreate,
    BudgetUpdate
)

router = APIRouter()

@router.post("/budgets/", response_model=BudgetSchema)
async def create_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """创建预算"""
    budget_service = BudgetService(session)
    budget = budget_service.create_budget(current_user, budget_in)
    return budget

@router.get("/budgets/", response_model=List[BudgetSchema])
async def list_budgets(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100
):
    """获取预算列表"""
    budget_service = BudgetService(session)
    return budget_service.get_budgets(current_user, skip, limit)

@router.get("/budgets/{budget_id}", response_model=BudgetSchema)
async def get_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取预算详情"""
    budget_service = BudgetService(session)
    budget = budget_service.get_budget(current_user, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.put("/budgets/{budget_id}", response_model=BudgetSchema)
async def update_budget(
    budget_id: str,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新预算"""
    budget_service = BudgetService(session)
    budget = budget_service.update_budget(current_user, budget_id, budget_in)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.delete("/budgets/{budget_id}")
async def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """删除预算"""
    budget_service = BudgetService(session)
    budget = budget_service.delete_budget(current_user, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"message": "Budget deleted successfully"}
