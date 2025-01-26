import pytest
from datetime import datetime
from app.models.enums import (
    BankStatementFormat,
    TransactionType,
    TransactionCategory,
    Currency,
)
from app.services.finance import BankStatementParser

class TestBankStatementParser:
    def test_parse_cibc_credit_statement(self):
        """Test parsing CIBC credit card statement"""
        sample_data = '''2025-01-15,"LCBO/RAO #702 WATERLOO, ON",102.15,,5268********3949
2025-01-14,"T&T SUPERMARKET #028 WATERLOO, ON",85.74,,5268********3949
2025-01-13,"COSTCO WHOLESALE W1248 WATERLOO, ON",135.67,,5268********3949
2025-01-08,PAYMENT THANK YOU/PAIEMEN T MERCI,,550.00,5268********3949'''

        parser = BankStatementParser()
        transactions = parser.parse(sample_data, BankStatementFormat.CIBC_CREDIT)

        assert len(transactions) == 4
        
        # Test expense transaction
        t1 = transactions[0]
        assert t1["transaction_date"] == datetime(2025, 1, 15)
        assert t1["amount"] == -102.15  # Negative for expense
        assert t1["merchant"] == "LCBO/RAO #702"
        assert t1["description"] == "LCBO/RAO #702 WATERLOO, ON"
        assert t1["type"] == TransactionType.EXPENSE
        assert t1["currency"] == Currency.CAD
        assert t1["category"] == TransactionCategory.SHOPPING

        # Test payment transaction
        t4 = transactions[3]
        assert t4["transaction_date"] == datetime(2025, 1, 8)
        assert t4["amount"] == 550.00  # Positive for payment
        assert t4["merchant"] == "PAYMENT"
        assert t4["description"] == "PAYMENT THANK YOU/PAIEMEN T MERCI"
        assert t4["type"] == TransactionType.PAYMENT
        assert t4["currency"] == Currency.CAD
        assert t4["category"] == TransactionCategory.PAYMENT

    def test_parse_rbc_checking_statement(self):
        """Test parsing RBC checking account statement"""
        sample_data = '''"Account Type","Account Number","Transaction Date","Cheque Number","Description 1","Description 2","CAD$","USD$"
Chequing,09037-5103486,3/26/2024,,"Transfer","WWW TRANSFER - 0653 ",-1000.00,,
Chequing,09037-5103486,3/27/2024,,"BILL PAYMENT","VIRGIN PLUS ",-38.42,,
Chequing,09037-5103486,5/24/2024,,"PAYROLL DEPOSIT","CONESTOGA COLLE ",715.29,,'''

        parser = BankStatementParser()
        transactions = parser.parse(sample_data, BankStatementFormat.RBC_CHECKING)

        assert len(transactions) == 3

        # Test transfer transaction
        t1 = transactions[0]
        assert t1["transaction_date"] == datetime(2024, 3, 26)
        assert t1["amount"] == -1000.00
        assert t1["merchant"] == "Transfer"
        assert t1["description"] == "WWW TRANSFER - 0653"
        assert t1["type"] == TransactionType.TRANSFER_OUT
        assert t1["currency"] == Currency.CAD
        assert t1["category_id"] == TransactionCategory.TRANSFER.id

        # Test bill payment
        t2 = transactions[1]
        assert t2["transaction_date"] == datetime(2024, 3, 27)
        assert t2["amount"] == -38.42
        assert t2["merchant"] == "VIRGIN PLUS"
        assert t2["description"] == "VIRGIN PLUS"
        assert t2["type"] == TransactionType.EXPENSE
        assert t2["currency"] == Currency.CAD
        assert t2["category_id"] == TransactionCategory.BILL_PAYMENT.id

        # Test payroll deposit
        t3 = transactions[2]
        assert t3["transaction_date"] == datetime(2024, 5, 24)
        assert t3["amount"] == 715.29
        assert t3["merchant"] == "CONESTOGA COLLE"
        assert t3["description"] == "PAYROLL DEPOSIT CONESTOGA COLLE"
        assert t3["type"] == TransactionType.INCOME
        assert t3["currency"] == Currency.CAD
        assert t3["category_id"] == TransactionCategory.PAYROLL.id

    def test_invalid_format(self):
        """Test handling of invalid statement format"""
        sample_data = "invalid,data,format"
        parser = BankStatementParser()
        
        with pytest.raises(ValueError, match="Invalid bank statement format"):
            parser.parse(sample_data, "invalid_format")

    def test_empty_statement(self):
        """Test handling of empty statement"""
        parser = BankStatementParser()
        
        with pytest.raises(ValueError, match="Empty bank statement"):
            parser.parse("", BankStatementFormat.CIBC_CREDIT)

    def test_malformed_statement(self):
        """Test handling of malformed statement"""
        # Missing required fields
        malformed_cibc = '''2025-01-15,"LCBO/RAO #702 WATERLOO, ON"'''
        parser = BankStatementParser()
        
        with pytest.raises(ValueError, match="Malformed transaction data"):
            parser.parse(malformed_cibc, BankStatementFormat.CIBC_CREDIT)
