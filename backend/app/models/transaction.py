from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Numeric, Enum, JSON, ARRAY, Float, Integer, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List
from app.models.base import Base
from app.models.enums import (
    Currency,
    TransactionType,
    TransactionStatus,
    BankStatementFormat,
    SystemTransactionCategory,
    TransactionDirection
)
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class TransactionCategory(Base):
    """交易分类"""
    __tablename__ = "transaction_category"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String)
    parent_id: Mapped[str] = mapped_column(String(36), ForeignKey("transaction_category.id"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("user.id", ondelete="CASCADE"))
    icon: Mapped[str] = mapped_column(String(255))
    color: Mapped[str] = mapped_column(String(7))
    system_category: Mapped[SystemTransactionCategory] = mapped_column(Enum(SystemTransactionCategory), nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    rules: Mapped[List["CategoryRule"]] = relationship("CategoryRule", back_populates="category")

    user: Mapped["User"] = relationship("User", back_populates="categories")
    parent: Mapped["TransactionCategory"] = relationship(
        "TransactionCategory",
        remote_side="TransactionCategory.id",
        back_populates="children"
    )
    children: Mapped[List["TransactionCategory"]] = relationship(
        "TransactionCategory",
        back_populates="parent"
    )
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="category")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "parent_id": self.parent_id,
            "user_id": self.user_id,
            "icon": self.icon,
            "color": self.color,
            "system_category": self.system_category.value if self.system_category else None,
            "is_system": self.is_system,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

class Transaction(Base):
    """交易记录"""
    __tablename__ = "transaction"

    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(String, ForeignKey("finance_account.id", ondelete="CASCADE"), nullable=False)
    linked_account_id = Column(String, ForeignKey("finance_account.id", ondelete="SET NULL"))
    linked_transaction_id = Column(String, ForeignKey("transaction.id", ondelete="SET NULL"))
    transaction_date = Column(DateTime, nullable=False)
    posted_date = Column(DateTime)
    amount = Column(Float, nullable=False)
    currency = Column(Enum(Currency), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    category_id = Column(String, ForeignKey("transaction_category.id", ondelete="SET NULL"))
    merchant = Column(String)
    description = Column(String, nullable=False)
    notes = Column(String)
    tags = Column(JSON)
    status = Column(Enum(TransactionStatus), nullable=False, default=TransactionStatus.PENDING)
    import_batch_id = Column(String, ForeignKey("import_batch.id", ondelete="SET NULL"))
    raw_transaction_id = Column(String, ForeignKey("raw_transaction.id", ondelete="SET NULL"))
    transaction_metadata = Column(JSON)

    user: Mapped["User"] = relationship("User", back_populates="transactions")
    account = relationship("FinanceAccount", foreign_keys=[account_id], back_populates="transactions")
    linked_account = relationship("FinanceAccount", foreign_keys=[linked_account_id], back_populates="linked_transactions")
    linked_transaction = relationship("Transaction", remote_side="Transaction.id")
    category = relationship("TransactionCategory", back_populates="transactions")
    import_batch = relationship("ImportBatch", back_populates="transactions")
    raw_transaction = relationship("RawTransaction",
        foreign_keys="RawTransaction.transaction_id",
        back_populates="transaction",
        uselist=False
    )

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "account_id": self.account_id,
            "linked_account_id": self.linked_account_id,
            "linked_transaction_id": self.linked_transaction_id,
            "transaction_date": self.transaction_date.isoformat() if self.transaction_date else None,
            "posted_date": self.posted_date.isoformat() if self.posted_date else None,
            "amount": float(self.amount),
            "currency": self.currency.value,
            "type": self.type.value,
            "category_id": self.category_id,
            "merchant": self.merchant,
            "description": self.description,
            "notes": self.notes,
            "tags": self.tags,
            "status": self.status.value,
            "import_batch_id": self.import_batch_id,
            "raw_transaction_id": self.raw_transaction_id,
            "transaction_metadata": self.transaction_metadata,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

class ImportBatch(Base):
    """导入批次"""
    __tablename__ = "import_batch"

    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(String, ForeignKey("finance_account.id", ondelete="CASCADE"), nullable=False)
    statement_format = Column(Enum(BankStatementFormat), nullable=False)
    file_name = Column(String, nullable=False)
    file_content = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    error_message = Column(String)
    processed_count = Column(Integer, default=0)

    user = relationship("User", back_populates="import_batches")
    account = relationship("FinanceAccount", back_populates="import_batches")
    raw_transactions: Mapped[list["RawTransaction"]] = relationship(
        "RawTransaction",
        back_populates="import_batch",
        cascade="all, delete-orphan"
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        back_populates="import_batch"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "accountId": self.account_id,
            "statementFormat": self.statement_format.value,
            "fileName": self.file_name,
            "status": self.status,
            "errorMessage": self.error_message,
            "processedCount": self.processed_count,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat()
        }

class RawTransaction(Base):
    """原始交易记录"""
    __tablename__ = "raw_transaction"

    import_batch_id = Column(String, ForeignKey("import_batch.id", ondelete="CASCADE"), nullable=False)
    row_number = Column(Integer, nullable=False)
    raw_data = Column(JSON, nullable=False)
    processed_data = Column(JSON)
    status = Column(String, nullable=False, default="pending")
    error_message = Column(String)
    transaction_id = Column(String, ForeignKey("transaction.id", ondelete="SET NULL"))

    import_batch: Mapped["ImportBatch"] = relationship("ImportBatch", back_populates="raw_transactions")
    transaction: Mapped["Transaction"] = relationship("Transaction",
        foreign_keys=[transaction_id],
        back_populates="raw_transaction"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "importBatchId": self.import_batch_id,
            "rowNumber": self.row_number,
            "rawData": self.raw_data,
            "processedData": self.processed_data,
            "status": self.status,
            "errorMessage": self.error_message,
            "transactionId": self.transaction_id,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat()
        }