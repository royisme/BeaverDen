from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_session
from app.core.auth_jwt import get_current_user
from app.services.category_rule_service import CategoryRuleService
from app.models.user import User
from app.api.v1.endpoints.api_models import BaseResponse
from app.schemas.category_rule import (
    CategoryRuleCreate,
    CategoryRuleUpdate,
    CategoryRuleResponse
)

router = APIRouter()

@router.post("/", response_model=BaseResponse[CategoryRuleResponse])
async def create_category_rule(
    rule_in: CategoryRuleCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """创建新的分类规则"""
    rule_service = CategoryRuleService(session)
    rule = rule_service.create_rule(current_user, rule_in.dict())
    return BaseResponse(data=rule.to_dict())

@router.get("/", response_model=BaseResponse[List[CategoryRuleResponse]])
async def list_category_rules(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100
):
    """获取分类规则列表"""
    rule_service = CategoryRuleService(session)
    rules = rule_service.get_rules(current_user, skip, limit)
    return BaseResponse(data=[rule.to_dict() for rule in rules])

@router.get("/{rule_id}", response_model=BaseResponse[CategoryRuleResponse])
async def get_category_rule(
    rule_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取分类规则详情"""
    rule_service = CategoryRuleService(session)
    rule = rule_service.get_rule(current_user, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Category rule not found")
    return BaseResponse(data=rule.to_dict())

@router.put("/{rule_id}", response_model=BaseResponse[CategoryRuleResponse])
async def update_category_rule(
    rule_id: str,
    rule_in: CategoryRuleUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新分类规则"""
    rule_service = CategoryRuleService(session)
    rule = rule_service.update_rule(current_user, rule_id, rule_in.dict(exclude_unset=True))
    if not rule:
        raise HTTPException(status_code=404, detail="Category rule not found")
    return BaseResponse(data=rule.to_dict())

@router.delete("/{rule_id}", response_model=BaseResponse)
async def delete_category_rule(
    rule_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """删除分类规则"""
    rule_service = CategoryRuleService(session)
    success = rule_service.delete_rule(current_user, rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category rule not found")
    return BaseResponse(message="Category rule deleted successfully")
