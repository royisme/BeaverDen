# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.db.session import get_session
# from app.services.finance_service import FinanceService
# from app.core.auth_jwt import AuthJWT
# from app.models.user import User
# from app.api.v1.endpoints.api_models import FinanceAccountCreate, FinanceAccountUpdate, FinanceTransactionCreate, FinanceTransactionUpdate, BaseResponse
# from typing import List
# from datetime import datetime
# from pydantic import Optional
# from enum import Enum

# class TransactionType(str, Enum):
#     income = "income"
#     expense = "expense"

# router = APIRouter()

# @router.get("/accounts", response_model=BaseResponse[List[dict]])
# async def get_accounts(
#     Authorize: AuthJWT = Depends(AuthJWT),
#     session: Session = Depends(get_session)
# ):
#     Authorize.jwt_required()
#     current_user_id = Authorize.get_jwt_subject()
#     user = session.query(User).filter(User.id == current_user_id).first()
#     finance_service = FinanceService(session)
#     accounts = finance_service.get_accounts(user)
#     return BaseResponse(data=[account.to_dict() for account in accounts])

# @router.post("/accounts", response_model=BaseResponse[dict])
# async def create_account(
#     account_data: FinanceAccountCreate,
#     Authorize: AuthJWT = Depends(AuthJWT),
#     session: Session = Depends(get_session)
# ):
#     Authorize.jwt_required()
#     current_user_id = Authorize.get_jwt_subject()
#     user = session.query(User).filter(User.id == current_user_id).first()
#     finance_service = FinanceService(session)
#     account = finance_service.create_account(account_data, user)
#     return BaseResponse(data=account.to_dict())

# @router.put("/accounts/{account_id}", response_model=BaseResponse[dict])
# async def update_account(
#     account_id: str,
#     account_data: FinanceAccountUpdate,
#     Authorize: AuthJWT = Depends(AuthJWT),
#     session: Session = Depends(get_session)
# ):
#     Authorize.jwt_required()
#     current_user_id = Authorize.get_jwt_subject()
#     user = session.query(User).filter(User.id == current_user_id).first()
#     finance_service = FinanceService(session)
#     account = finance_service.update_account(account_id, account_data, user)
#     return BaseResponse(data=account.to_dict())

# @router.delete("/accounts/{account_id}")
# async def delete_account(
#     account_id: str,
#     Authorize: AuthJWT = Depends(AuthJWT),
#     session: Session = Depends(get_session)
# ):
#     Authorize.jwt_required()
#     current_user_id = Authorize.get_jwt_subject()
#     user = session.query(User).filter(User.id == current_user_id).first()
#     finance_service = FinanceService(session)
#     finance_service.delete_account(account_id, user)
#     return BaseResponse(message="Account deleted successfully")

# @router.get("/accounts/{account_id}/transactions", response_model=BaseResponse[List[dict]])
# async def get_transactions(
#     account_id: str,
#     Authorize: AuthJWT = Depends(AuthJWT),
#     session: Session = Depends(get_session)
# ):
#     Authorize.jwt_required()
#     current_user_id = Authorize.get_jwt_subject()
#     user = session.query(User).filter(User.id == current_user_id).first()
#     finance_service = FinanceService(session)
#     transactions = finance_service.get_transactions(account_id, user)
#     return BaseResponse(data=[transaction.to_dict() for transaction in transactions])

# @router.post("/accounts/{account_id}/transactions", response_model=BaseResponse[dict])
# async def create_transaction(
#     account_id: str,
#     transaction_data: FinanceTransactionCreate,
#     Authorize: AuthJWT = Depends(AuthJWT),
#     session: Session = Depends(get_session)
# ):
#     Authorize.jwt_required()
#     current_user_id = Authorize.get_jwt_subject()
#     user = session.query(User).filter(User.id == current_user_id).first()
#     finance_service = FinanceService(session)
#     transaction_data.account_id = account_id
#     transaction = finance_service.create_transaction(transaction_data, user)
#     return BaseResponse(data=transaction.to_dict())

# @router.put("/transactions/{transaction_id}", response_model=BaseResponse[dict])
# async def update_transaction(
#     transaction_id: str,
#     transaction_data: FinanceTransactionUpdate,
#     Authorize: AuthJWT = Depends(AuthJWT),
#     session: Session = Depends(get_session)
# ):
#     Authorize.jwt_required()
#     current_user_id = Authorize.get_jwt_subject()
#     user = session.query(User).filter(User.id == current_user_id).first()
#     finance_service = FinanceService(session)
#     transaction = finance_service.update_transaction(transaction_id, transaction_data, user)
#     return BaseResponse(data=transaction.to_dict())

# @router.delete("/transactions/{transaction_id}")
# async def delete_transaction(
#     transaction_id: str,
#     Authorize: AuthJWT = Depends(AuthJWT),
#     session: Session = Depends(get_session)
# ):
#     Authorize.jwt_required()
#     current_user_id = Authorize.get_jwt_subject()
#     user = session.query(User).filter(User.id == current_user_id).first()
#     finance_service = FinanceService(session)
#     finance_service.delete_transaction(transaction_id, user)
#     return BaseResponse(message="Transaction deleted successfully")

# # Transaction routes
# from app.services.transaction_service import TransactionService
# from app.api.v1.endpoints.api_models import TransactionCreate, TransactionUpdate, TransactionResponse, CategorySummary, TransactionFilter

# @router.post("/transactions/", response_model=TransactionResponse)
# async def create_transaction(
#     *,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT),
#     transaction_in: TransactionCreate
# ):
#     """创建新交易"""
#     transaction_service = TransactionService(db)
#     return transaction_service.create_transaction(
#         user=current_user,
#         account_id=transaction_in.account_id,
#         transaction_data=transaction_in.model_dump()
#     )

# @router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
# async def get_transaction(
#     transaction_id: str,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """获取交易详情"""
#     transaction_service = TransactionService(db)
#     return transaction_service.get_transaction(current_user, transaction_id)

# @router.get("/transactions/", response_model=List[TransactionResponse])
# async def list_transactions(
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT),
#     filter_params: TransactionFilter = Depends(),
#     skip: int = 0,
#     limit: int = 50
# ):
#     """获取交易列表"""
#     transaction_service = TransactionService(db)
#     return transaction_service.list_transactions(
#         user=current_user,
#         skip=skip,
#         limit=limit,
#         **filter_params.model_dump()
#     )

# @router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
# async def update_transaction(
#     transaction_id: str,
#     transaction_in: TransactionUpdate,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """更新交易信息"""
#     transaction_service = TransactionService(db)
#     return transaction_service.update_transaction(
#         user=current_user,
#         transaction_id=transaction_id,
#         update_data=transaction_in.model_dump(exclude_unset=True)
#     )

# @router.delete("/transactions/{transaction_id}")
# async def delete_transaction(
#     transaction_id: str,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """删除交易"""
#     transaction_service = TransactionService(db)
#     transaction_service.delete_transaction(current_user, transaction_id)
#     return {"status": "success"}

# @router.get("/transactions/summary/by-category", response_model=List[CategorySummary])
# async def get_category_summary(
#     start_date: datetime,
#     end_date: datetime,
#     account_id: Optional[str] = None,
#     transaction_type: Optional[TransactionType] = None,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """获取分类汇总"""
#     transaction_service = TransactionService(db)
#     return transaction_service.get_category_summary(
#         user=current_user,
#         start_date=start_date,
#         end_date=end_date,
#         account_id=account_id,
#         transaction_type=transaction_type
#     )

# # Category routes
# from app.services.category_service import CategoryService
# from app.api.v1.endpoints.api_models import CategoryCreate, CategoryUpdate, CategoryResponse

# @router.post("/categories/", response_model=CategoryResponse)
# async def create_category(
#     *,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT),
#     category_in: CategoryCreate
# ):
#     """创建新分类"""
#     category_service = CategoryService(db)
#     return category_service.create_category(
#         user=current_user,
#         category_data=category_in.model_dump()
#     )

# @router.get("/categories/{category_id}", response_model=CategoryResponse)
# async def get_category(
#     category_id: str,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """获取分类详情"""
#     category_service = CategoryService(db)
#     return category_service.get_category(current_user, category_id)

# @router.get("/categories/", response_model=List[CategoryResponse])
# async def list_categories(
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT),
#     parent_id: Optional[str] = None,
#     include_system: bool = True
# ):
#     """获取分类列表"""
#     category_service = CategoryService(db)
#     return category_service.list_categories(
#         user=current_user,
#         parent_id=parent_id,
#         include_system=include_system
#     )

# @router.get("/categories/tree", response_model=List[dict])
# async def get_category_tree(
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT),
#     include_system: bool = True
# ):
#     """获取分类树"""
#     category_service = CategoryService(db)
#     return category_service.get_category_tree(
#         user=current_user,
#         include_system=include_system
#     )

# @router.put("/categories/{category_id}", response_model=CategoryResponse)
# async def update_category(
#     category_id: str,
#     category_in: CategoryUpdate,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """更新分类"""
#     category_service = CategoryService(db)
#     return category_service.update_category(
#         user=current_user,
#         category_id=category_id,
#         update_data=category_in.model_dump(exclude_unset=True)
#     )

# @router.delete("/categories/{category_id}")
# async def delete_category(
#     category_id: str,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """删除分类"""
#     category_service = CategoryService(db)
#     category_service.delete_category(current_user, category_id)
#     return {"status": "success"}

# # Import routes
# from app.services.import_service import ImportService
# from fastapi import UploadFile, File, Form
# from typing import Dict, List, Optional
# from app.api.v1.endpoints.api_models import ImportBatchCreate, ImportBatchResponse, ImportBatchFilter, ImportBatchConfirm

# @router.post("/transactions/import", response_model=ImportBatchResponse)
# async def create_import_batch(
#     file: UploadFile = File(...),
#     account_id: str = Form(...),
#     statement_format: Optional[str] = Form(None),
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """创建导入批次
    
#     上传银行对账单文件，创建导入批次。支持自动识别文件格式。
#     """
#     import_service = ImportService(db)
#     return await import_service.create_import_batch(
#         user=current_user,
#         account_id=account_id,
#         file=file,
#         source=statement_format
#     )

# @router.get("/transactions/import/{batch_id}", response_model=ImportBatchResponse)
# async def get_import_batch(
#     batch_id: str,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """获取导入批次详情"""
#     import_service = ImportService(db)
#     return import_service.get_import_batch(current_user, batch_id)

# @router.get("/transactions/import", response_model=List[ImportBatchResponse])
# async def list_import_batches(
#     account_id: Optional[str] = None,
#     status: Optional[str] = None,
#     skip: int = 0,
#     limit: int = 50,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """获取导入批次列表
    
#     支持按账户和状态筛选，支持分页。
#     """
#     import_service = ImportService(db)
#     return import_service.list_import_batches(
#         user=current_user,
#         account_id=account_id,
#         status=status,
#         skip=skip,
#         limit=limit
#     )

# @router.post("/transactions/import/{batch_id}/process")
# async def process_import_batch(
#     batch_id: str,
#     auto_create: bool = False,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """处理导入批次
    
#     处理原始交易数据，如果 auto_create 为 true，则自动创建交易记录。
#     否则返回处理后的数据供用户预览。
#     """
#     import_service = ImportService(db)
#     batch, results = import_service.process_import_batch(
#         user=current_user,
#         batch_id=batch_id,
#         auto_create=auto_create
#     )
#     return {
#         "batch": batch,
#         "results": results
#     }

# @router.post("/transactions/import/{batch_id}/confirm", response_model=List[TransactionResponse])
# async def confirm_import_batch(
#     batch_id: str,
#     selected_rows: Optional[List[int]] = None,
#     db: Session = Depends(get_session),
#     current_user: User = Depends(AuthJWT)
# ):
#     """确认导入批次
    
#     确认导入选中的交易记录。如果不提供 selected_rows，则导入所有记录。
#     """
#     import_service = ImportService(db)
#     return import_service.confirm_import_batch(
#         user=current_user,
#         batch_id=batch_id,
#         selected_rows=selected_rows
#     )