from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Numeric, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.base import Base
from app.models.enums import Currency, FinanceAccountType, FinanceAccountCardType, FinanceBankName, FinanceAccountStatus

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
    user: Mapped["User"] = relationship(backref="finance_accounts")

    transactions: Mapped[list["FinanceTransaction"]] = relationship(
        "FinanceTransaction",
        backref="account",
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

class FinanceTransaction(Base):
    __tablename__ = "finance_transaction"

    account_id: Mapped[str] = mapped_column(String(36), ForeignKey("finance_account.id"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    category: Mapped[str] = mapped_column(String(255), nullable=True)
    merchant: Mapped[str] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "accountId": self.account_id,
            "date": self.date.isoformat(),
            "amount": float(self.amount),
            "category": self.category,
            "merchant": self.merchant,
            "description": self.description,
            "type": self.type
        } 