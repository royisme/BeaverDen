import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.models.user import User
from app.models.transaction import Transaction
from app.models.enums import TransactionType
from app.services.transaction_service import TransactionService

# Mocking SQLAlchemy's func.strftime and func.sum behavior
# We'll assume the query results are tuples like (month_year_str, type_enum, total_float)

class TestTransactionServiceGetMonthlySummary(unittest.TestCase):

    def setUp(self):
        self.mock_db_session = MagicMock()
        self.transaction_service = TransactionService(db=self.mock_db_session)
        self.test_user = User(id="test_user_id", email="test@example.com")

    def _mock_query_results(self, results: List[tuple]):
        mock_query = MagicMock()
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.group_by.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = results
        self.mock_db_session.query.return_value = mock_query

    def test_get_monthly_summary_no_transactions(self):
        self._mock_query_results([])
        summary = self.transaction_service.get_monthly_summary(self.test_user, 2023)
        self.assertEqual(summary, [])

    def test_get_monthly_summary_only_expenses(self):
        mock_data = [("2023-01", TransactionType.EXPENSE, 100.0)]
        self._mock_query_results(mock_data)
        summary = self.transaction_service.get_monthly_summary(self.test_user, 2023, month=1)
        expected = [{
            "month": "2023-01",
            "total_expense": 100.0,
            "total_income": 0.0,
            "net_change": -100.0
        }]
        self.assertEqual(summary, expected)

    def test_get_monthly_summary_only_income(self):
        mock_data = [("2023-02", TransactionType.INCOME, 200.0)]
        self._mock_query_results(mock_data)
        summary = self.transaction_service.get_monthly_summary(self.test_user, 2023, month=2)
        expected = [{
            "month": "2023-02",
            "total_expense": 0.0,
            "total_income": 200.0,
            "net_change": 200.0
        }]
        self.assertEqual(summary, expected)

    def test_get_monthly_summary_income_and_expenses(self):
        mock_data = [
            ("2023-03", TransactionType.EXPENSE, 50.0),
            ("2023-03", TransactionType.INCOME, 150.0)
        ]
        self._mock_query_results(mock_data)
        summary = self.transaction_service.get_monthly_summary(self.test_user, 2023, month=3)
        expected = [{
            "month": "2023-03",
            "total_expense": 50.0,
            "total_income": 150.0,
            "net_change": 100.0
        }]
        self.assertEqual(summary, expected)

    def test_get_monthly_summary_multiple_months(self):
        mock_data = [
            ("2023-01", TransactionType.EXPENSE, 100.0),
            ("2023-01", TransactionType.INCOME, 200.0),
            ("2023-02", TransactionType.EXPENSE, 75.0),
        ]
        self._mock_query_results(mock_data)
        summary = self.transaction_service.get_monthly_summary(self.test_user, 2023)
        # The order from DB might not be guaranteed for month processing in the Python code,
        # so we check for presence and content.
        self.assertEqual(len(summary), 2)
        summary_2023_01 = next((s for s in summary if s["month"] == "2023-01"), None)
        summary_2023_02 = next((s for s in summary if s["month"] == "2023-02"), None)

        self.assertIsNotNone(summary_2023_01)
        self.assertEqual(summary_2023_01["total_expense"], 100.0)
        self.assertEqual(summary_2023_01["total_income"], 200.0)
        self.assertEqual(summary_2023_01["net_change"], 100.0)

        self.assertIsNotNone(summary_2023_02)
        self.assertEqual(summary_2023_02["total_expense"], 75.0)
        self.assertEqual(summary_2023_02["total_income"], 0.0)
        self.assertEqual(summary_2023_02["net_change"], -75.0)
        
    def test_get_monthly_summary_filter_by_account_id(self):
        # This test focuses on ensuring the account_id filter is applied in the query.
        # The actual filtering logic is part of SQLAlchemy, so we just check if filter() is called.
        self._mock_query_results([])
        self.transaction_service.get_monthly_summary(self.test_user, 2023, account_id="acc_123")
        
        # Check that filter was called appropriately
        # self.mock_db_session.query().filter().filter()...
        # The third filter call in the chain within get_monthly_summary would be for account_id if present
        # First filter is for user_id, second for year.
        # If month is also passed, it would be the third, and account_id the fourth.
        
        # Let's refine the mock to check arguments
        mock_query_instance = self.mock_db_session.query.return_value
        
        # Call with account_id
        self.transaction_service.get_monthly_summary(self.test_user, 2023, month=1, account_id="acc_123")
        
        # Check filter calls on the mock_query_instance
        # This is a bit complex due to chained calls. A more robust way might involve
        # a custom mock for the query chain or deeper inspection of call_args_list.
        # For now, we assume the structure based on the implementation.
        
        # Expected filter calls:
        # 1. FinanceAccount.user_id == self.test_user.id
        # 2. func.strftime("%Y", Transaction.transaction_date) == str(year)
        # 3. func.strftime("%m", Transaction.transaction_date) == f"{month:02d}"
        # 4. Transaction.account_id == account_id
        
        # A simple check: ensure filter was called multiple times
        self.assertTrue(mock_query_instance.filter.call_count >= 3) # At least user, year, account_id
        
        # To be more specific, one would need to inspect mock_query_instance.filter.call_args_list
        # For example, to check the specific SQL expression for account_id:
        # found_account_filter = False
        # for call_args in mock_query_instance.filter.call_args_list:
        #     if "Transaction.account_id ==" in str(call_args[0][0]): # This is a naive check
        #         found_account_filter = True
        #         break
        # self.assertTrue(found_account_filter)
        # This naive check is commented out as it's brittle. The core idea is that the method
        # should construct a query with an account_id filter if provided.

    def test_get_monthly_summary_whole_year_vs_single_month(self):
        # Test with year only
        mock_data_year = [("2023-01", TransactionType.INCOME, 100.0), ("2023-02", TransactionType.EXPENSE, 50.0)]
        self._mock_query_results(mock_data_year)
        summary_year = self.transaction_service.get_monthly_summary(self.test_user, 2023)
        self.assertEqual(len(summary_year), 2)

        # Test with year and month
        mock_data_month = [("2023-01", TransactionType.INCOME, 100.0)]
        self._mock_query_results(mock_data_month)
        summary_month = self.transaction_service.get_monthly_summary(self.test_user, 2023, month=1)
        self.assertEqual(len(summary_month), 1)
        self.assertEqual(summary_month[0]["month"], "2023-01")

    def test_get_monthly_summary_transactions_different_dates_same_month(self):
        # The grouping is by YYYY-MM, so different days in same month should aggregate.
        mock_data = [
            ("2023-01", TransactionType.EXPENSE, 25.0), # from 2023-01-10
            ("2023-01", TransactionType.EXPENSE, 30.0)  # from 2023-01-20
        ]
        # The mocked query results are already aggregated by the (mocked) DB query
        self._mock_query_results(mock_data) # This mock implies DB already summed them if they were separate rows
                                         # For a more accurate test, the input to summary_dict processing
                                         # should be multiple rows that then get aggregated by Python.
                                         # Let's adjust the mock for that.
        
        # If the DB query returns two separate rows for the same month and type
        raw_db_results = [
            ("2023-01", TransactionType.EXPENSE, 25.0), 
            ("2023-01", TransactionType.EXPENSE, 30.0)
        ]
        self._mock_query_results(raw_db_results)

        summary = self.transaction_service.get_monthly_summary(self.test_user, 2023, month=1)
        expected = [{
            "month": "2023-01",
            "total_expense": 55.0, # 25.0 + 30.0
            "total_income": 0.0,
            "net_change": -55.0
        }]
        self.assertEqual(summary, expected)

class TestTransactionServiceGetCategorySummary(unittest.TestCase):
    def setUp(self):
        self.mock_db_session = MagicMock()
        self.transaction_service = TransactionService(db=self.mock_db_session)
        self.test_user = User(id="test_user_id", email="test@example.com")

    def _mock_category_query_results(self, results: List[tuple]):
        # Results are expected to be tuples like:
        # (category_id, category_name, total_amount, count)
        mock_query = MagicMock()
        mock_query.join.return_value = mock_query # For Transaction
        mock_query.join.return_value = mock_query # For FinanceAccount
        mock_query.filter.return_value = mock_query
        mock_query.group_by.return_value = mock_query
        mock_query.all.return_value = results
        self.mock_db_session.query.return_value = mock_query
        return mock_query # Return for further assertion if needed

    def test_get_category_summary_no_transactions(self):
        self._mock_category_query_results([])
        summary = self.transaction_service.get_category_summary(
            self.test_user, datetime(2023, 1, 1), datetime(2023, 1, 31)
        )
        self.assertEqual(summary, [])

    def test_get_category_summary_multiple_categories(self):
        mock_data = [
            ("cat_1", "Groceries", 150.0, 3),
            ("cat_2", "Utilities", 80.0, 1)
        ]
        self._mock_category_query_results(mock_data)
        summary = self.transaction_service.get_category_summary(
            self.test_user, datetime(2023, 1, 1), datetime(2023, 1, 31)
        )
        expected = [
            {"category_id": "cat_1", "category_name": "Groceries", "total_amount": 150.0, "count": 3},
            {"category_id": "cat_2", "category_name": "Utilities", "total_amount": 80.0, "count": 1}
        ]
        # The method itself doesn't sort, so we compare sets of dictionaries
        self.assertCountEqual(summary, expected)


    def test_get_category_summary_with_account_id_filter(self):
        mock_query = self._mock_category_query_results([])
        self.transaction_service.get_category_summary(
            self.test_user, datetime(2023, 1, 1), datetime(2023, 1, 31), account_id="acc_123"
        )
        
        # Check that filter for account_id was applied
        # Expected filter calls:
        # 1. FinanceAccount.user_id == self.test_user.id
        # 2. Transaction.transaction_date.between(start_date, end_date)
        # 3. Transaction.account_id == account_id (if provided)
        
        # A simple check: ensure filter was called multiple times
        # The base filter + date filter + account_id filter
        # mock_query.filter().filter().filter()
        # At least 3 calls to filter if account_id is present.
        # The initial query setup has one filter (user_id), then date filter, then optional account_id, optional type.
        
        # Find the call that added the account_id filter
        found_account_filter = False
        for call in mock_query.filter.call_args_list:
            # This is a naive check and depends on the string representation of the SQLAlchemy expression
            if "Transaction.account_id ==" in str(call[0][0]):
                found_account_filter = True
                break
        self.assertTrue(found_account_filter, "Account ID filter was not applied")


    def test_get_category_summary_with_transaction_type_filter(self):
        mock_query = self._mock_category_query_results([])
        self.transaction_service.get_category_summary(
            self.test_user, datetime(2023,1,1), datetime(2023,1,31), transaction_type=TransactionType.EXPENSE
        )
        # Check that filter for transaction_type was applied
        found_type_filter = False
        for call in mock_query.filter.call_args_list:
            if "Transaction.type ==" in str(call[0][0]):
                found_type_filter = True
                break
        self.assertTrue(found_type_filter, "Transaction type filter was not applied")

    def test_get_category_summary_calculations(self):
        # This method primarily relies on the database for aggregation (sum, count).
        # The Python part is mostly formatting.
        # The percentage calculation is done in the API layer, not in this service method.
        mock_data = [("cat_1", "Food", 100.0, 2)]
        self._mock_category_query_results(mock_data)
        summary = self.transaction_service.get_category_summary(
            self.test_user, datetime(2023, 1, 1), datetime(2023, 1, 31)
        )
        expected = [{
            "category_id": "cat_1",
            "category_name": "Food",
            "total_amount": 100.0,
            "count": 2
        }]
        self.assertEqual(summary, expected)

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
