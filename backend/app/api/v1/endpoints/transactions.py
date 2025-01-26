from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.core.auth_jwt import get_current_user
from app.services.transaction_service import TransactionService
from app.services.category_service import CategoryService
from app.services.import_service import ImportService
from app.models.user import User
from app.api.v1.endpoints.api_models import (
    TransactionCreate,
    TransactionUpdate,
    CategoryCreate,
    CategoryUpdate,
    TransactionFilter,
    BaseResponse
)

router = APIRouter()

# Transaction endpoints
@router.post("/", response_model=BaseResponse[dict])
async def create_transaction(
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """创建新交易"""
    transaction_service = TransactionService(session)
    transaction = transaction_service.create_transaction(
        current_user,
        transaction_in.account_id,
        transaction_in.dict()
    )
    return BaseResponse(data=transaction.to_dict())

@router.get("/", response_model=BaseResponse[List[dict]])
async def list_transactions(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    filter_params: TransactionFilter = Depends()
):
    """获取交易列表"""
    transaction_service = TransactionService(session)
    transactions = transaction_service.list_transactions(
        user=current_user,
        skip=filter_params.skip,
        limit=filter_params.limit,
        account_id=filter_params.account_id,
        category_id=filter_params.category_id,
        start_date=filter_params.start_date,
        end_date=filter_params.end_date,
        transaction_type=filter_params.type,
        status=filter_params.status,
        search_term=filter_params.search_term
    )
    return BaseResponse(data=[t.to_dict() for t in transactions])

@router.get("/{transaction_id}", response_model=BaseResponse[dict])
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取交易详情"""
    transaction_service = TransactionService(session)
    transaction = transaction_service.get_transaction(current_user, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return BaseResponse(data=transaction.to_dict())

@router.put("/{transaction_id}", response_model=BaseResponse[dict])
async def update_transaction(
    transaction_id: str,
    transaction_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新交易"""
    transaction_service = TransactionService(session)
    transaction = transaction_service.update_transaction(
        current_user,
        transaction_id,
        transaction_in.dict(exclude_unset=True)
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return BaseResponse(data=transaction.to_dict())

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """删除交易"""
    transaction_service = TransactionService(session)
    success = transaction_service.delete_transaction(current_user, transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return BaseResponse(message="Transaction deleted successfully")

# Category endpoints
@router.post("/categories", response_model=BaseResponse[dict])
async def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """创建新分类"""
    category_service = CategoryService(session)
    category = category_service.create_category(current_user, category_in)
    return BaseResponse(data=category.to_dict())

@router.get("/categories", response_model=BaseResponse[List[dict]])
async def list_categories(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    parent_id: Optional[str] = None,
    include_system: bool = True
):
    """获取分类列表"""
    category_service = CategoryService(session)
    categories = category_service.get_categories(
        current_user,
        parent_id=parent_id,
        include_system=include_system
    )
    return BaseResponse(data=[c.to_dict() for c in categories])

@router.get("/categories/{category_id}", response_model=BaseResponse[dict])
async def get_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取分类详情"""
    category_service = CategoryService(session)
    category = category_service.get_category(current_user, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return BaseResponse(data=category.to_dict())

@router.put("/categories/{category_id}", response_model=BaseResponse[dict])
async def update_category(
    category_id: str,
    category_in: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新分类"""
    category_service = CategoryService(session)
    category = category_service.update_category(
        current_user,
        category_id,
        category_in.dict(exclude_unset=True)
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return BaseResponse(data=category.to_dict())

@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """删除分类"""
    category_service = CategoryService(session)
    success = category_service.delete_category(current_user, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return BaseResponse(message="Category deleted successfully")

# Import endpoints
@router.post("/import", response_model=BaseResponse[dict])
async def create_import_batch(
    file: UploadFile = File(...),
    account_id: str = Form(...),
    statement_format: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """创建导入批次"""
    import_service = ImportService(session)
    batch = await import_service.create_import_batch(
        current_user,
        file,
        account_id,
        statement_format
    )
    return BaseResponse(data=batch.to_dict())

@router.get("/import/{batch_id}", response_model=BaseResponse[dict])
async def get_import_batch(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取导入批次详情"""
    import_service = ImportService(session)
    batch = import_service.get_import_batch(current_user, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Import batch not found")
    return BaseResponse(data=batch.to_dict())

@router.post("/import/{batch_id}/process", response_model=BaseResponse[dict])
async def process_import_batch(
    batch_id: str,
    auto_create: bool = False,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """处理导入批次"""
    import_service = ImportService(session)
    batch = import_service.process_import_batch(current_user, batch_id, auto_create)
    if not batch:
        raise HTTPException(status_code=404, detail="Import batch not found")
    return BaseResponse(data=batch.to_dict())

@router.post("/import/{batch_id}/confirm", response_model=BaseResponse[dict])
async def confirm_import_batch(
    batch_id: str,
    selected_rows: Optional[List[int]] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """确认导入批次"""
    import_service = ImportService(session)
    batch = import_service.confirm_import_batch(current_user, batch_id, selected_rows)
    if not batch:
        raise HTTPException(status_code=404, detail="Import batch not found")
    return BaseResponse(data=batch.to_dict())

# Analytics endpoints
@router.get("/analytics/category-summary", response_model=BaseResponse[dict])
async def get_category_summary(
    start_date: datetime,
    end_date: datetime,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    account_id: Optional[str] = None,
    transaction_type: Optional[str] = None
):
    """获取分类汇总统计"""
    transaction_service = TransactionService(session)
    summary = transaction_service.get_category_summary(
        current_user,
        start_date,
        end_date,
        account_id=account_id,
        transaction_type=transaction_type
    )
    return BaseResponse(data=summary)