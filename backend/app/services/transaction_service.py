import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from fastapi import HTTPException

from app.models.finance import (
    FinanceAccount,
)
from app.models.transaction import (
    Transaction,
    TransactionCategory,
    ImportBatch,
    RawTransaction
)
from app.models.enums import TransactionType, TransactionStatus
from app.models.user import User
from app.services.category_matcher import CategoryMatcher

logger = logging.getLogger(__name__)

class TransactionService:
    def __init__(self, db: Session):
        self.db = db
        self.category_matcher = CategoryMatcher(db)

    def get_monthly_summary(
        self,
        user: User,
        year: int,
        month: Optional[int] = None,
        account_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """获取月度收支汇总"""
        # Base query to filter by user and year
        query = self.db.query(
            func.strftime("%Y-%m", Transaction.transaction_date).label("month_year"),
            Transaction.type,
            func.sum(Transaction.amount).label("total_amount")
        ).join(
            FinanceAccount,
            Transaction.account_id == FinanceAccount.id
        ).filter(
            FinanceAccount.user_id == user.id,
            func.strftime("%Y", Transaction.transaction_date) == str(year)
        )

        # Optional filters
        if month:
            query = query.filter(func.strftime("%m", Transaction.transaction_date) == f"{month:02d}")
        if account_id:
            query = query.filter(Transaction.account_id == account_id)

        # Group by month and transaction type
        query = query.group_by("month_year", Transaction.type)
        
        # Order by month
        query = query.order_by("month_year")

        results = query.all()

        # Process results into the desired format
        summary_dict: Dict[str, Dict[str, Any]] = {}
        for r_month_year, r_type, r_total_amount in results:
            if r_month_year not in summary_dict:
                summary_dict[r_month_year] = {
                    "month": r_month_year,
                    "total_expense": 0.0,
                    "total_income": 0.0,
                    "net_change": 0.0,
                }
            
            amount = float(r_total_amount) if r_total_amount else 0.0
            if r_type == TransactionType.EXPENSE:
                summary_dict[r_month_year]["total_expense"] += amount
            elif r_type == TransactionType.INCOME:
                summary_dict[r_month_year]["total_income"] += amount
        
        # Calculate net_change and convert to list
        final_summary = []
        for month_data in summary_dict.values():
            month_data["net_change"] = month_data["total_income"] - month_data["total_expense"]
            final_summary.append(month_data)
            
        return final_summary

    def create_transaction(
        self,
        user: User,
        account_id: str,
        transaction_data: Dict[str, Any]
    ) -> Transaction:
        """创建新交易"""
        # 验证账户所有权
        account = self.db.query(FinanceAccount).filter(
            FinanceAccount.id == account_id,
            FinanceAccount.user_id == user.id
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        # 如果是转账，验证目标账户
        if transaction_data.get("type") in [TransactionType.TRANSFER_OUT, TransactionType.TRANSFER_IN]:
            transfer_account_id = transaction_data.get("transfer_account_id")
            if not transfer_account_id:
                raise HTTPException(status_code=400, detail="Transfer account is required")

            transfer_account = self.db.query(FinanceAccount).filter(
                FinanceAccount.id == transfer_account_id,
                FinanceAccount.user_id == user.id
            ).first()
            if not transfer_account:
                raise HTTPException(status_code=404, detail="Transfer account not found")

        try:
            # 如果没有指定分类，尝试自动分类
            if 'category_id' not in transaction_data or not transaction_data['category_id']:
                description = transaction_data.get('description', '')
                merchant = transaction_data.get('merchant', '')

                # 使用 CategoryMatcher 进行自动分类
                category_id = self.category_matcher.match_category(user, description, merchant)
                if category_id:
                    transaction_data['category_id'] = category_id

            # 创建交易记录
            transaction = Transaction(**transaction_data)
            self.db.add(transaction)

            # 更新账户余额
            self._update_account_balance(account, transaction)

            # 如果是转账，创建对应的转入/转出记录
            if transaction.type in [TransactionType.TRANSFER_OUT, TransactionType.TRANSFER_IN]:
                self._create_transfer_pair(transaction, account, transfer_account)

            self.db.commit()
            self.db.refresh(transaction)
            return transaction

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating transaction: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create transaction")

    def get_transaction(self, user: User, transaction_id: str) -> Transaction:
        """获取单个交易详情"""
        transaction = self.db.query(Transaction).join(
            FinanceAccount,
            Transaction.account_id == FinanceAccount.id
        ).filter(
            Transaction.id == transaction_id,
            FinanceAccount.user_id == user.id
        ).first()

        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction

    def list_transactions(
        self,
        user: User,
        skip: int = 0,
        limit: int = 50,
        account_id: Optional[str] = None,
        category_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        transaction_type: Optional[TransactionType] = None,
        status: Optional[TransactionStatus] = None,
        search_term: Optional[str] = None
    ) -> List[Transaction]:
        """获取交易列表"""
        # 使用明确的 join 条件
        query = self.db.query(Transaction).join(
            FinanceAccount,
            Transaction.account_id == FinanceAccount.id
        ).filter(
            FinanceAccount.user_id == user.id
        )

        # 应用过滤条件
        if account_id:
            query = query.filter(Transaction.account_id == account_id)
        if category_id:
            query = query.filter(Transaction.category_id == category_id)
        if start_date:
            query = query.filter(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.filter(Transaction.transaction_date <= end_date)
        if transaction_type:
            query = query.filter(Transaction.type == transaction_type)
        if status:
            query = query.filter(Transaction.status == status)
        if search_term:
            search = f"%{search_term}%"
            query = query.filter(
                or_(
                    Transaction.description.ilike(search),
                    Transaction.merchant.ilike(search),
                    Transaction.notes.ilike(search)
                )
            )

        # 按日期降序排序
        query = query.order_by(Transaction.transaction_date.desc())

        return query.offset(skip).limit(limit).all()

    def update_transaction(
        self,
        user: User,
        transaction_id: str,
        update_data: Dict[str, Any]
    ) -> Transaction:
        """更新交易信息"""
        transaction = self.get_transaction(user, transaction_id)

        # 保存原始金额用于余额调整
        original_amount = transaction.amount
        original_type = transaction.type

        try:
            # 更新交易字段
            for field, value in update_data.items():
                setattr(transaction, field, value)

            # 如果金额或类型发生变化，需要调整账户余额
            if (original_amount != transaction.amount or
                original_type != transaction.type):
                self._adjust_account_balance(
                    transaction.account,
                    original_amount,
                    original_type,
                    transaction.amount,
                    transaction.type
                )

            self.db.commit()
            self.db.refresh(transaction)
            return transaction

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating transaction: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update transaction")

    def delete_transaction(self, user: User, transaction_id: str) -> None:
        """删除交易"""
        transaction = self.get_transaction(user, transaction_id)

        try:
            # 恢复账户余额
            if transaction.type == TransactionType.EXPENSE:
                transaction.account.balance += transaction.amount
            elif transaction.type == TransactionType.INCOME:
                transaction.account.balance -= transaction.amount
            elif transaction.type in [TransactionType.TRANSFER_OUT, TransactionType.TRANSFER_IN]:
                # 删除关联的转账记录
                if transaction.transfer_transaction:
                    self.db.delete(transaction.transfer_transaction)

            self.db.delete(transaction)
            self.db.commit()

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting transaction: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to delete transaction")

    def get_category_summary(
        self,
        user: User,
        start_date: datetime,
        end_date: datetime,
        account_id: Optional[str] = None,
        transaction_type: Optional[TransactionType] = None
    ) -> List[Dict]:
        """获取分类汇总"""
        query = self.db.query(
            TransactionCategory.id.label("category_id"),
            TransactionCategory.name.label("category_name"),
            func.sum(Transaction.amount).label("total_amount"),
            func.count(Transaction.id).label("count")
        ).join(
            Transaction,
            TransactionCategory.id == Transaction.category_id
        ).join(
            FinanceAccount
        ).filter(
            FinanceAccount.user_id == user.id,
            Transaction.transaction_date.between(start_date, end_date)
        ).group_by(
            TransactionCategory.id,
            TransactionCategory.name
        )

        if account_id:
            query = query.filter(Transaction.account_id == account_id)
        if transaction_type:
            query = query.filter(Transaction.type == transaction_type)

        results = query.all()
        return [
            {
                "category_id": result.category_id,
                "category_name": result.category_name,
                "total_amount": float(result.total_amount),
                "count": result.count
            }
            for result in results
        ]

    def _update_account_balance(
        self,
        account: FinanceAccount,
        transaction: Transaction
    ) -> None:
        """更新账户余额"""
        if transaction.type == TransactionType.EXPENSE:
            account.balance -= transaction.amount
        elif transaction.type == TransactionType.INCOME:
            account.balance += transaction.amount
        elif transaction.type == TransactionType.TRANSFER_OUT:
            account.balance -= transaction.amount
        elif transaction.type == TransactionType.TRANSFER_IN:
            account.balance += transaction.amount

    def _create_transfer_pair(
        self,
        transaction: Transaction,
        from_account: FinanceAccount,
        to_account: FinanceAccount
    ) -> None:
        """创建转账配对记录"""
        if transaction.type == TransactionType.TRANSFER_OUT:
            # 创建转入记录
            transfer_in = Transaction(
                account_id=to_account.id,
                transaction_date=transaction.transaction_date,
                amount=transaction.amount,
                type=TransactionType.TRANSFER_IN,
                description=transaction.description,
                transfer_account_id=from_account.id,
                transfer_transaction_id=transaction.id
            )
            self.db.add(transfer_in)
            transaction.transfer_transaction_id = transfer_in.id

            # 更新账户余额
            to_account.balance += transaction.amount

        elif transaction.type == TransactionType.TRANSFER_IN:
            # 创建转出记录
            transfer_out = Transaction(
                account_id=to_account.id,
                transaction_date=transaction.transaction_date,
                amount=transaction.amount,
                type=TransactionType.TRANSFER_OUT,
                description=transaction.description,
                transfer_account_id=from_account.id,
                transfer_transaction_id=transaction.id
            )
            self.db.add(transfer_out)
            transaction.transfer_transaction_id = transfer_out.id

            # 更新账户余额
            to_account.balance -= transaction.amount

    def _adjust_account_balance(
        self,
        account: FinanceAccount,
        old_amount: float,
        old_type: TransactionType,
        new_amount: float,
        new_type: TransactionType
    ) -> None:
        """调整账户余额"""
        # 先恢复原始状态
        if old_type == TransactionType.EXPENSE:
            account.balance += old_amount
        elif old_type == TransactionType.INCOME:
            account.balance -= old_amount
        elif old_type == TransactionType.TRANSFER_OUT:
            account.balance += old_amount
        elif old_type == TransactionType.TRANSFER_IN:
            account.balance -= old_amount

        # 应用新的变化
        if new_type == TransactionType.EXPENSE:
            account.balance -= new_amount
        elif new_type == TransactionType.INCOME:
            account.balance += new_amount
        elif new_type == TransactionType.TRANSFER_OUT:
            account.balance -= new_amount
        elif new_type == TransactionType.TRANSFER_IN:
            account.balance += new_amount
