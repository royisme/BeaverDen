from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_session
from app.services.finance_service import FinanceService
from app.core.auth_jwt import AuthJWT
from app.models.user import User
from app.api.v1.endpoints.api_models import FinanceAccountCreate, FinanceAccountUpdate, FinanceTransactionCreate, FinanceTransactionUpdate, BaseResponse
from typing import List

router = APIRouter()

@router.get("/accounts", response_model=BaseResponse[List[dict]])
async def get_accounts(
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session)
):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    user = session.query(User).filter(User.id == current_user_id).first()
    finance_service = FinanceService(session)
    accounts = finance_service.get_accounts(user)
    return BaseResponse(data=[account.to_dict() for account in accounts])

@router.post("/accounts", response_model=BaseResponse[dict])
async def create_account(
    account_data: FinanceAccountCreate,
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session)
):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    user = session.query(User).filter(User.id == current_user_id).first()
    finance_service = FinanceService(session)
    account = finance_service.create_account(account_data, user)
    return BaseResponse(data=account.to_dict())

@router.put("/accounts/{account_id}", response_model=BaseResponse[dict])
async def update_account(
    account_id: str,
    account_data: FinanceAccountUpdate,
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session)
):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    user = session.query(User).filter(User.id == current_user_id).first()
    finance_service = FinanceService(session)
    account = finance_service.update_account(account_id, account_data, user)
    return BaseResponse(data=account.to_dict())

@router.delete("/accounts/{account_id}")
async def delete_account(
    account_id: str,
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session)
):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    user = session.query(User).filter(User.id == current_user_id).first()
    finance_service = FinanceService(session)
    finance_service.delete_account(account_id, user)
    return BaseResponse(message="Account deleted successfully")

@router.get("/accounts/{account_id}/transactions", response_model=BaseResponse[List[dict]])
async def get_transactions(
    account_id: str,
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session)
):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    user = session.query(User).filter(User.id == current_user_id).first()
    finance_service = FinanceService(session)
    transactions = finance_service.get_transactions(account_id, user)
    return BaseResponse(data=[transaction.to_dict() for transaction in transactions])

@router.post("/accounts/{account_id}/transactions", response_model=BaseResponse[dict])
async def create_transaction(
    account_id: str,
    transaction_data: FinanceTransactionCreate,
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session)
):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    user = session.query(User).filter(User.id == current_user_id).first()
    finance_service = FinanceService(session)
    transaction_data.account_id = account_id
    transaction = finance_service.create_transaction(transaction_data, user)
    return BaseResponse(data=transaction.to_dict())

@router.put("/transactions/{transaction_id}", response_model=BaseResponse[dict])
async def update_transaction(
    transaction_id: str,
    transaction_data: FinanceTransactionUpdate,
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session)
):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    user = session.query(User).filter(User.id == current_user_id).first()
    finance_service = FinanceService(session)
    transaction = finance_service.update_transaction(transaction_id, transaction_data, user)
    return BaseResponse(data=transaction.to_dict())

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session)
):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    user = session.query(User).filter(User.id == current_user_id).first()
    finance_service = FinanceService(session)
    finance_service.delete_transaction(transaction_id, user)
    return BaseResponse(message="Transaction deleted successfully") 