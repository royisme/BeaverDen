from sqlalchemy.orm import Session
from app.models.finance import FinanceAccount
from app.models.transaction import Transaction
from app.models.user import User
from app.api.v1.endpoints.api_models import (
    FinanceAccountCreate, FinanceAccountUpdate,
    TransactionCreate, TransactionUpdate
)
from fastapi import HTTPException

class FinanceService:
    def __init__(self, db: Session):
        self.db = db

    def get_accounts(self, user: User):
        return self.db.query(FinanceAccount).filter(FinanceAccount.user_id == user.id).all()

    def create_account(self, account_data: FinanceAccountCreate, user: User) -> FinanceAccount:
        account = FinanceAccount(
            **account_data.dict(),
            user_id=user.id
        )
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)
        return account

    def update_account(self, account_id: str, account_data: FinanceAccountUpdate, user: User) -> FinanceAccount:
        account = self.db.query(FinanceAccount).filter(
            FinanceAccount.id == account_id,
            FinanceAccount.user_id == user.id
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        for field, value in account_data.dict(exclude_unset=True).items():
            setattr(account, field, value)

        self.db.commit()
        self.db.refresh(account)
        return account

    def delete_account(self, account_id: str, user: User) -> None:
        account = self.db.query(FinanceAccount).filter(
            FinanceAccount.id == account_id,
            FinanceAccount.user_id == user.id
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        self.db.delete(account)
        self.db.commit()

    def get_transactions(self, account_id: str, user: User):
        account = self.db.query(FinanceAccount).filter(
            FinanceAccount.id == account_id,
            FinanceAccount.user_id == user.id
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        return self.db.query(Transaction).filter(Transaction.account_id == account_id).all()

    def create_transaction(self, transaction_data: TransactionCreate, user: User) -> Transaction:
        account = self.db.query(FinanceAccount).filter(
            FinanceAccount.id == transaction_data.account_id,
            FinanceAccount.user_id == user.id
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        transaction = Transaction(
            **transaction_data.dict()
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def update_transaction(self, transaction_id: str, transaction_data: TransactionUpdate, user: User) -> Transaction:
        transaction = self.db.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        account = self.db.query(FinanceAccount).filter(
            FinanceAccount.id == transaction.account_id,
            FinanceAccount.user_id == user.id
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        for field, value in transaction_data.dict(exclude_unset=True).items():
            setattr(transaction, field, value)

        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def delete_transaction(self, transaction_id: str, user: User) -> None:
        transaction = self.db.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        account = self.db.query(FinanceAccount).filter(
            FinanceAccount.id == transaction.account_id,
            FinanceAccount.user_id == user.id
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        self.db.delete(transaction)
        self.db.commit() 