from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Numeric, Enum, Text, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.base import Base
from app.models.enums import (
    Currency, 
    FinanceAccountType, 
    FinanceAccountCardType, 
    FinanceBankName, 
    FinanceAccountStatus
)
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class FinanceAccount(Base):
    __tablename__ = "finance_account"

    account_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bank_name: Mapped[FinanceBankName] = mapped_column(Enum(FinanceBankName), nullable=False)
    account_type: Mapped[FinanceAccountType] = mapped_column(Enum(FinanceAccountType), nullable=False)
    currency: Mapped[Currency] = mapped_column(Enum(Currency), nullable=False)
    balance: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    card_type: Mapped[FinanceAccountCardType] = mapped_column(Enum(FinanceAccountCardType), nullable=True)
    account_number: Mapped[str] = mapped_column(String(255), nullable=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("user.id"), nullable=False)
    status: Mapped[FinanceAccountStatus] = mapped_column(
        Enum(FinanceAccountStatus),
        default=FinanceAccountStatus.ACTIVE,
        nullable=False
    )
    
    user: Mapped["User"] = relationship("User", back_populates="finance_accounts")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        foreign_keys="Transaction.account_id",
        back_populates="account",
        cascade="all, delete-orphan"
    )
    linked_transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        foreign_keys="Transaction.linked_account_id",
        back_populates="linked_account"
    )
    import_batches: Mapped[list["ImportBatch"]] = relationship(
        "ImportBatch",
        back_populates="account",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "accountName": self.account_name,
            "bankName": self.bank_name.value,
            "accountType": self.account_type.value,
            "currency": self.currency.value,
            "balance": float(self.balance),
            "cardType": self.card_type.value if self.card_type else None,
            "accountNumber": self.account_number,
            "userId": self.user_id,
            "status": self.status.value
        }

class Budget(Base):
    __tablename__ = "budget"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("user.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    period_type: Mapped[str] = mapped_column(String(50), nullable=False)  # monthly, weekly, yearly
    category: Mapped[str] = mapped_column(String(255), nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    user: Mapped["User"] = relationship("User", back_populates="budgets")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "userId": self.user_id,
            "amount": float(self.amount),
            "periodType": self.period_type,
            "category": self.category,
            "startDate": self.start_date.isoformat() if self.start_date else None,
            "endDate": self.end_date.isoformat() if self.end_date else None
        }