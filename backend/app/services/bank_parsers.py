from abc import ABC, abstractmethod
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Optional
import csv
from io import StringIO

from app.models.enums import (
    BankStatementFormat, TransactionType, Currency, TransactionStatus
)
from app.models.transaction import TransactionCategory

class BankStatementParser(ABC):
    """银行对账单解析器基类"""
    
    @abstractmethod
    def parse(self, content: str) -> List[Dict]:
        """解析对账单内容"""
        pass

    @abstractmethod
    def get_statement_format(self) -> BankStatementFormat:
        """获取对账单格式"""
        pass


class CIBCCreditParser(BankStatementParser):
    """CIBC信用卡对账单解析器"""
    
    def get_statement_format(self) -> BankStatementFormat:
        return BankStatementFormat.CIBC_CREDIT
    
    def parse(self, content: str) -> List[Dict]:
        results = []
        reader = csv.reader(StringIO(content))
        
        for row in reader:
            if len(row) != 5:  # 日期,描述,支出,收入,卡号
                continue
                
            date_str, description, debit, credit, card = row
            
            # 解析日期
            try:
                transaction_date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                continue
                
            # 解析金额
            try:
                if debit:
                    amount = abs(Decimal(debit.replace(",", "")))
                    type = TransactionType.EXPENSE
                elif credit:
                    amount = abs(Decimal(credit.replace(",", "")))
                    type = TransactionType.INCOME if "PAYMENT" not in description.upper() else TransactionType.TRANSFER
                else:
                    continue
            except (ValueError, decimal.InvalidOperation):
                continue
                
            # 清理描述（去除多余的引号）
            description = description.strip('"')
            
            # 构建原始数据
            raw_data = {
                "date": date_str,
                "description": description,
                "debit": debit,
                "credit": credit,
                "card": card
            }
            
            # 构建处理后的数据
            processed_data = {
                "transaction_date": transaction_date.isoformat(),
                "posted_date": None,  # CIBC不提供过账日期
                "amount": float(amount),
                "currency": Currency.CAD.value,
                "type": type.value,
                "category": self._guess_category(description),
                "merchant": self._extract_merchant(description),
                "description": description,
                "notes": None,
                "tags": [],
                "status": TransactionStatus.PENDING.value,
                "metadata": {
                    "card_last_4": card[-4:] if card else None,
                    "original_amount": debit or credit,
                }
            }
            
            results.append({
                "raw_data": raw_data,
                "processed_data": processed_data
            })
            
        return results
    
    def _guess_category(self, description: str) -> str:
        """根据描述猜测交易类别"""
        description = description.upper()
        
        # 收入类别
        if "PAYMENT" in description:
            return TransactionCategory.TRANSFER.value
        elif "REFUND" in description:
            return TransactionCategory.REFUND.value
            
        # 支出类别
        if "COSTCO" in description:
            return TransactionCategory.FOOD.value if "WHOLESALE" in description else TransactionCategory.TRANSPORTATION.value
        elif any(store in description for store in ["T&T", "FOOD BASICS", "WALMART", "SOBEYS"]):
            return TransactionCategory.FOOD.value
        elif "LCBO" in description or "RESTAURANT" in description:
            return TransactionCategory.ENTERTAINMENT.value
        elif "GAS" in description or "ESSO" in description or "SHELL" in description:
            return TransactionCategory.TRANSPORTATION.value
        elif "INSURANCE" in description:
            return TransactionCategory.INSURANCE.value
        elif "MEDICAL" in description or "PHARMACY" in description:
            return TransactionCategory.HEALTHCARE.value
        elif "AMAZON" in description or "SHOPPING" in description:
            return TransactionCategory.SHOPPING.value
        
        return TransactionCategory.OTHER.value
    
    def _extract_merchant(self, description: str) -> Optional[str]:
        """从描述中提取商家名称"""
        # 移除通用前缀和后缀
        parts = description.split()
        if len(parts) > 1:
            return parts[0]  # 通常第一个词是商家名称
        return None


class RBCCheckingParser(BankStatementParser):
    """RBC支票账户对账单解析器"""
    
    def get_statement_format(self) -> BankStatementFormat:
        return BankStatementFormat.RBC_CHECKING
    
    def parse(self, content: str) -> List[Dict]:
        results = []
        reader = csv.DictReader(StringIO(content))
        
        for row in reader:
            # 解析日期
            try:
                transaction_date = datetime.strptime(row["Transaction Date"], "%m/%d/%Y")
                posted_date = datetime.strptime(row["Posting Date"], "%m/%d/%Y") if "Posting Date" in row else None
            except ValueError:
                continue
                
            # 合并描述
            description = f"{row['Description 1']}"
            if row.get("Description 2", "").strip():
                description += f" - {row['Description 2']}"
                
            # 解析金额和类型
            try:
                amount = abs(Decimal(row["CAD$"].replace(",", "")))
                if "DEPOSIT" in description.upper() or "CREDIT" in description.upper():
                    type = TransactionType.INCOME
                elif "TRANSFER" in description.upper():
                    type = TransactionType.TRANSFER
                else:
                    type = TransactionType.EXPENSE
            except (ValueError, decimal.InvalidOperation):
                continue
                
            # 构建原始数据
            raw_data = dict(row)
            
            # 构建处理后的数据
            processed_data = {
                "transaction_date": transaction_date.isoformat(),
                "posted_date": posted_date.isoformat() if posted_date else None,
                "amount": float(amount),
                "currency": Currency.CAD.value,
                "type": type.value,
                "category": self._guess_category(description),
                "merchant": self._extract_merchant(description),
                "description": description,
                "notes": None,
                "tags": [],
                "status": TransactionStatus.PENDING.value,
                "metadata": {
                    "account_number": f"****{row['Account Number'][-4:]}" if row.get("Account Number") else None,
                    "balance": row.get("Balance", None),
                }
            }
            
            results.append({
                "raw_data": raw_data,
                "processed_data": processed_data
            })
            
        return results
    
    def _guess_category(self, description: str) -> str:
        """根据描述猜测交易类别"""
        description = description.upper()
        
        # 收入类别
        if "PAYROLL" in description or "SALARY" in description:
            return TransactionCategory.SALARY.value
        elif "INTEREST" in description:
            return TransactionCategory.INTEREST.value
        elif "REFUND" in description:
            return TransactionCategory.REFUND.value
            
        # 支出类别
        if "MORTGAGE" in description or "RENT" in description:
            return TransactionCategory.HOUSING.value
        elif "INSURANCE" in description:
            return TransactionCategory.INSURANCE.value
        elif "HYDRO" in description or "WATER" in description or "GAS" in description:
            return TransactionCategory.UTILITIES.value
        elif "TRANSFER" in description or "E-TRANSFER" in description:
            return TransactionCategory.TRANSFER.value
        elif "INVESTMENT" in description or "TFSA" in description or "RSP" in description:
            return TransactionCategory.INVESTMENT.value
        elif "DONATION" in description or "CHARITY" in description:
            return TransactionCategory.CHARITY.value
        
        return TransactionCategory.OTHER.value
    
    def _extract_merchant(self, description: str) -> Optional[str]:
        """从描述中提取商家名称"""
        parts = description.split('-')
        if len(parts) > 1:
            return parts[0].strip()
        return None


class ParserFactory:
    """解析器工厂"""
    
    _parsers = {
        BankStatementFormat.CIBC_CREDIT: CIBCCreditParser(),
        BankStatementFormat.RBC_CHECKING: RBCCheckingParser()
    }
    
    @classmethod
    def get_parser(cls, format: BankStatementFormat) -> Optional[BankStatementParser]:
        """获取指定格式的解析器"""
        return cls._parsers.get(format)
    
    @classmethod
    def guess_format(cls, content: str) -> Optional[BankStatementFormat]:
        """根据内容猜测格式"""
        # 读取第一行
        first_line = content.split('\n')[0].strip()
        
        # RBC格式有固定的标题行
        if first_line.startswith('"Account Type","Account Number"'):
            return BankStatementFormat.RBC_CHECKING
            
        # CIBC格式是日期开头的数据行
        try:
            datetime.strptime(first_line.split(',')[0], "%Y-%m-%d")
            return BankStatementFormat.CIBC_CREDIT
        except (ValueError, IndexError):
            pass
            
        return None
