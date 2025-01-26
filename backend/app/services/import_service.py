from typing import List, Dict, Optional, Tuple
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.models.user import User
from app.models.finance import FinanceAccount
from app.models.transaction import (
    ImportBatch,
    RawTransaction,
    Transaction
)
from app.models.enums import BankStatementFormat, TransactionDirection
from app.services.bank_parsers import ParserFactory, BankStatementParser


class ImportService:
    def __init__(self, db: Session):
        self.db = db

    async def create_import_batch(
        self,
        user: User,
        account_id: str,
        file: UploadFile,
        source: Optional[BankStatementFormat] = None,
        mapping: Optional[Dict[str, str]] = None
    ) -> ImportBatch:
        """创建导入批次"""
        # 读取文件内容
        content = await file.read()
        content_str = content.decode('utf-8')

        # 如果没有指定格式，尝试猜测
        if not source:
            source = ParserFactory.guess_format(content_str)
            if not source:
                raise HTTPException(status_code=400, detail="无法识别的文件格式")

        # 获取解析器
        parser = ParserFactory.get_parser(source)
        if not parser:
            raise HTTPException(status_code=400, detail="不支持的文件格式")

        # 创建导入批次
        batch = ImportBatch(
            id=str(uuid.uuid4()),
            user_id=user.id,
            account_id=account_id,
            statement_format=source,
            file_name=file.filename,
            file_content=content_str,
            status="pending"
        )
        self.db.add(batch)

        try:
            # 解析文件内容
            transactions = parser.parse(content_str)
            
            # 创建原始交易记录
            for i, trans_data in enumerate(transactions):
                raw_trans = RawTransaction(
                    import_batch_id=batch.id,
                    row_number=i + 1,
                    raw_data=trans_data,
                    status="pending"
                )
                self.db.add(raw_trans)
            
            batch.processed_count = len(transactions)
            self.db.commit()
            return batch
            
        except Exception as e:
            self.db.rollback()
            batch.status = "error"
            batch.error_message = str(e)
            self.db.add(batch)
            self.db.commit()
            raise HTTPException(status_code=400, detail=str(e))

    def get_import_batch(self, user: User, batch_id: str) -> ImportBatch:
        """获取导入批次详情"""
        batch = self.db.query(ImportBatch).filter(
            ImportBatch.id == batch_id,
            ImportBatch.user_id == user.id
        ).first()
        
        if not batch:
            raise HTTPException(status_code=404, detail="Import batch not found")
        
        return batch

    def process_import_batch(
        self,
        user: User,
        batch_id: str,
        auto_create: bool = False
    ) -> Tuple[ImportBatch, List[Dict]]:
        """处理导入批次"""
        batch = self.get_import_batch(user, batch_id)
        
        if batch.status not in ["pending", "error"]:
            raise HTTPException(status_code=400, detail="Batch already processed")
        
        try:
            # 获取账户信息
            account = self.db.query(FinanceAccount).filter(
                FinanceAccount.id == batch.account_id
            ).first()
            if not account:
                raise HTTPException(status_code=404, detail="Account not found")
            
            # 获取解析器
            parser = ParserFactory.get_parser(batch.statement_format)
            if not parser:
                raise HTTPException(status_code=400, detail="Unsupported format")
            
            # 处理每个原始交易
            results = []
            for raw_trans in batch.raw_transactions:
                try:
                    # 解析交易数据
                    processed_data = parser.process_transaction(
                        raw_trans.raw_data,
                        account
                    )
                    raw_trans.processed_data = processed_data
                    raw_trans.status = "processed"
                    
                    if auto_create:
                        # 自动创建交易记录
                        transaction = Transaction(
                            user_id=user.id,
                            account_id=account.id,
                            import_batch_id=batch.id,
                            raw_transaction_id=raw_trans.id,
                            **processed_data
                        )
                        self.db.add(transaction)
                        raw_trans.transaction_id = transaction.id
                    
                    results.append({
                        "id": raw_trans.id,
                        "rowNumber": raw_trans.row_number,
                        "rawData": raw_trans.raw_data,
                        "processedData": processed_data,
                        "status": "success"
                    })
                    
                except Exception as e:
                    raw_trans.status = "error"
                    raw_trans.error_message = str(e)
                    results.append({
                        "id": raw_trans.id,
                        "rowNumber": raw_trans.row_number,
                        "rawData": raw_trans.raw_data,
                        "error": str(e),
                        "status": "error"
                    })
            
            batch.status = "processed"
            self.db.commit()
            return batch, results
            
        except Exception as e:
            self.db.rollback()
            batch.status = "error"
            batch.error_message = str(e)
            self.db.add(batch)
            self.db.commit()
            raise HTTPException(status_code=400, detail=str(e))

    def confirm_import_batch(
        self,
        user: User,
        batch_id: str,
        selected_rows: Optional[List[int]] = None
    ) -> ImportBatch:
        """确认导入批次"""
        batch = self.get_import_batch(user, batch_id)
        
        if batch.status != "processed":
            raise HTTPException(status_code=400, detail="Batch not processed")
        
        try:
            query = self.db.query(RawTransaction).filter(
                RawTransaction.import_batch_id == batch_id
            )
            
            if selected_rows:
                query = query.filter(RawTransaction.row_number.in_(selected_rows))
            
            raw_transactions = query.all()
            
            for raw_trans in raw_transactions:
                if raw_trans.status != "processed":
                    continue
                
                # 创建交易记录
                transaction = Transaction(
                    user_id=user.id,
                    account_id=batch.account_id,
                    import_batch_id=batch.id,
                    raw_transaction_id=raw_trans.id,
                    **raw_trans.processed_data
                )
                self.db.add(transaction)
                raw_trans.transaction_id = transaction.id
            
            batch.status = "completed"
            self.db.commit()
            return batch
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    def list_import_batches(
        self,
        user: User,
        account_id: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[ImportBatch]:
        """获取导入批次列表"""
        query = self.db.query(ImportBatch).filter(
            ImportBatch.user_id == user.id
        )
        
        if account_id:
            query = query.filter(ImportBatch.account_id == account_id)
        if status:
            query = query.filter(ImportBatch.status == status)
            
        return query.offset(skip).limit(limit).all()
