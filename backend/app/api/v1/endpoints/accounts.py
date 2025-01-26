from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_session
from app.core.auth_jwt import get_current_user
from app.services.finance_service import FinanceService
from app.models.user import User
from app.api.v1.endpoints.api_models import (
    FinanceAccountCreate,
    FinanceAccountUpdate,
    BaseResponse
)

import logging

logger = logging.getLogger('app.api.accounts')

router = APIRouter()

@router.get("/accounts", response_model=BaseResponse[List[dict]])
async def get_accounts(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取用户的所有账户"""
    logger.info(f"Getting accounts for user {current_user.id}")
    logger.debug("Request reached get_accounts endpoint")
    try:
        finance_service = FinanceService(session)
        accounts = finance_service.get_accounts(current_user)
        logger.info(f"Found {len(accounts)} accounts for user {current_user.id}")
        return BaseResponse(data=[account.to_dict() for account in accounts])
    except Exception as e:
        logger.error(f"Error getting accounts: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving accounts")

@router.post("/accounts", response_model=BaseResponse[dict])
async def create_account(
    account_data: FinanceAccountCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """创建新账户"""
    logger.info(f"Creating new account for user {current_user.id}")
    logger.debug("Request reached create_account endpoint")
    try:
        finance_service = FinanceService(session)
        account = finance_service.create_account(account_data, current_user)
        if not account:
            raise HTTPException(status_code=400, detail="Failed to create account")
        logger.info(f"Account created successfully for user {current_user.id}")
        return BaseResponse(data=account.to_dict())
    except Exception as e:
        logger.error(f"Error creating account: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating account")

@router.put("/accounts/{account_id}", response_model=BaseResponse[dict])
async def update_account(
    account_id: str,
    account_data: FinanceAccountUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新账户信息"""
    logger.info(f"Updating account {account_id} for user {current_user.id}")
    logger.debug("Request reached update_account endpoint")
    try:
        finance_service = FinanceService(session)
        account = finance_service.update_account(account_id, account_data, current_user)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        logger.info(f"Account updated successfully for user {current_user.id}")
        return BaseResponse(data=account.to_dict())
    except Exception as e:
        logger.error(f"Error updating account: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating account")

@router.delete("/accounts/{account_id}", response_model=BaseResponse[dict])
async def delete_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """删除账户"""
    logger.info(f"Deleting account {account_id} for user {current_user.id}")
    logger.debug("Request reached delete_account endpoint")
    try:
        finance_service = FinanceService(session)
        success = finance_service.delete_account(account_id, current_user)
        if not success:
            raise HTTPException(status_code=404, detail="Account not found")
        logger.info(f"Account deleted successfully for user {current_user.id}")
        return BaseResponse(message="Account deleted successfully")
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting account")
