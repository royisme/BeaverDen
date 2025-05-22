import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from datetime import datetime

# Assuming your FastAPI app instance is accessible for TestClient
# If your app is created in main.py: from app.main import app
# For this example, I'll mock the app and necessary dependencies
from fastapi import FastAPI, Depends, APIRouter
from app.models.user import User
from app.schemas.common import BaseResponse
from app.services.transaction_service import TransactionService
from app.api.v1.endpoints.reports import router as reports_router # import your actual router

# Create a minimal app for testing
app = FastAPI()

# Mock get_current_user
async def mock_get_current_user():
    return User(id="test_user_id", email="test@example.com", is_active=True)

# Mock get_session
async def mock_get_session():
    return MagicMock()

# Override dependencies for the test app
app.dependency_overrides[reports_router.dependencies[0].dependency] = mock_get_current_user # Assuming get_current_user is the first dep
app.dependency_overrides[reports_router.dependencies[1].dependency] = mock_get_session # Assuming get_session is the second

app.include_router(reports_router, prefix="/api/v1/reports") # Make sure prefix matches your actual app

client = TestClient(app)

class TestReportsApiMonthlySummary(unittest.TestCase):

    @patch("app.api.v1.endpoints.reports.TransactionService")
    def test_get_monthly_summary_success_year_only(self, MockTransactionService):
        mock_service_instance = MockTransactionService.return_value
        mock_summary_data = [
            {"month": "2023-01", "total_expense": 100.0, "total_income": 200.0, "net_change": 100.0},
            {"month": "2023-02", "total_expense": 50.0, "total_income": 0.0, "net_change": -50.0}
        ]
        mock_service_instance.get_monthly_summary.return_value = mock_summary_data

        response = client.get("/api/v1/reports/monthly-summary?year=2023")

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(response_data["data"], mock_summary_data)
        mock_service_instance.get_monthly_summary.assert_called_once_with(
            user=unittest.mock.ANY, # User object from mock_get_current_user
            year=2023,
            month=None,
            account_id=None
        )

    @patch("app.api.v1.endpoints.reports.TransactionService")
    def test_get_monthly_summary_success_year_and_month(self, MockTransactionService):
        mock_service_instance = MockTransactionService.return_value
        mock_summary_data = [
            {"month": "2023-01", "total_expense": 100.0, "total_income": 200.0, "net_change": 100.0}
        ]
        mock_service_instance.get_monthly_summary.return_value = mock_summary_data

        response = client.get("/api/v1/reports/monthly-summary?year=2023&month=1")
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data["data"], mock_summary_data)
        mock_service_instance.get_monthly_summary.assert_called_once_with(
            user=unittest.mock.ANY,
            year=2023,
            month=1,
            account_id=None
        )

    @patch("app.api.v1.endpoints.reports.TransactionService")
    def test_get_monthly_summary_success_year_month_account(self, MockTransactionService):
        mock_service_instance = MockTransactionService.return_value
        mock_summary_data = [
            {"month": "2023-01", "total_expense": 70.0, "total_income": 150.0, "net_change": 80.0}
        ]
        mock_service_instance.get_monthly_summary.return_value = mock_summary_data

        response = client.get("/api/v1/reports/monthly-summary?year=2023&month=1&account_id=acc123")
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data["data"], mock_summary_data)
        mock_service_instance.get_monthly_summary.assert_called_once_with(
            user=unittest.mock.ANY,
            year=2023,
            month=1,
            account_id="acc123"
        )

    @patch("app.api.v1.endpoints.reports.TransactionService")
    def test_get_monthly_summary_empty_data(self, MockTransactionService):
        mock_service_instance = MockTransactionService.return_value
        mock_service_instance.get_monthly_summary.return_value = []

        response = client.get("/api/v1/reports/monthly-summary?year=2024")
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data["data"], [])

    def test_get_monthly_summary_invalid_year(self):
        # FastAPI should handle validation for query parameters if defined in schema/endpoint
        # e.g. year: int = Query(..., gt=1900, lt=2100)
        # For this test, we assume year must be provided.
        response = client.get("/api/v1/reports/monthly-summary") # No year
        self.assertEqual(response.status_code, 422) # Unprocessable Entity for missing required query param

    def test_get_monthly_summary_invalid_month(self):
        response = client.get("/api/v1/reports/monthly-summary?year=2023&month=13") # Invalid month
        self.assertEqual(response.status_code, 422) # Assuming month Query has ge=1, le=12

    # To test authentication, you would typically remove the dependency override for get_current_user
    # and expect a 401 or 403 if no valid token is provided.
    # This requires more setup for the TestClient (e.g., headers with a mock token).
    # For now, the current setup assumes authentication passes due to the override.

# Note: To run this test file directly, you might need:
if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)

class TestReportsApiCategorySummary(unittest.TestCase):

    @patch("app.api.v1.endpoints.reports.TransactionService")
    def test_get_category_summary_success(self, MockTransactionService):
        mock_service_instance = MockTransactionService.return_value
        mock_summary_items = [
            {"category_id": "cat1", "category_name": "Food", "total_amount": 150.0, "count": 5, "percentage": 0.0}, # Percentage is calculated in API
            {"category_id": "cat2", "category_name": "Transport", "total_amount": 100.0, "count": 3, "percentage": 0.0}
        ]
        # The service returns items without percentage, API calculates it.
        mock_service_instance.get_category_summary.return_value = [
            {"category_id": "cat1", "category_name": "Food", "total_amount": 150.0, "count": 5},
            {"category_id": "cat2", "category_name": "Transport", "total_amount": 100.0, "count": 3}
        ]

        start_date = "2023-01-01T00:00:00"
        end_date = "2023-01-31T23:59:59"
        response = client.get(f"/api/v1/reports/summary?start_date={start_date}&end_date={end_date}")

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        
        expected_total = 150.0 + 100.0 # Sum of absolute amounts
        self.assertEqual(response_data["data"]["total"], expected_total)
        
        # Check percentages (example)
        # For Food: (150 / 250) * 100 = 60%
        # For Transport: (100 / 250) * 100 = 40%
        returned_items = response_data["data"]["items"]
        self.assertEqual(len(returned_items), 2)
        
        item_food = next(item for item in returned_items if item["category_id"] == "cat1")
        item_transport = next(item for item in returned_items if item["category_id"] == "cat2")

        self.assertAlmostEqual(item_food["percentage"], 60.0)
        self.assertAlmostEqual(item_transport["percentage"], 40.0)

        mock_service_instance.get_category_summary.assert_called_once_with(
            user=unittest.mock.ANY,
            start_date=datetime.fromisoformat(start_date),
            end_date=datetime.fromisoformat(end_date),
            account_id=None,
            transaction_type=None
        )

    @patch("app.api.v1.endpoints.reports.TransactionService")
    def test_get_category_summary_with_filters(self, MockTransactionService):
        mock_service_instance = MockTransactionService.return_value
        mock_service_instance.get_category_summary.return_value = [
            {"category_id": "cat1", "category_name": "Food", "total_amount": 120.0, "count": 3}
        ]
        
        start_date = "2023-02-01T00:00:00"
        end_date = "2023-02-28T23:59:59"
        account_id = "acc_test"
        transaction_type = "EXPENSE" # Assuming TransactionType.EXPENSE.value

        response = client.get(
            f"/api/v1/reports/summary?start_date={start_date}&end_date={end_date}&account_id={account_id}&transaction_type={transaction_type}"
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(response_data["data"]["total"], 120.0)
        self.assertEqual(response_data["data"]["items"][0]["category_name"], "Food")
        self.assertAlmostEqual(response_data["data"]["items"][0]["percentage"], 100.0)


        # Need to convert transaction_type string to Enum for assertion if service expects Enum
        from app.models.enums import TransactionType as EnumTransactionType
        mock_service_instance.get_category_summary.assert_called_once_with(
            user=unittest.mock.ANY,
            start_date=datetime.fromisoformat(start_date),
            end_date=datetime.fromisoformat(end_date),
            account_id=account_id,
            transaction_type=EnumTransactionType.EXPENSE 
        )

    @patch("app.api.v1.endpoints.reports.TransactionService")
    def test_get_category_summary_empty_data(self, MockTransactionService):
        mock_service_instance = MockTransactionService.return_value
        mock_service_instance.get_category_summary.return_value = []

        start_date = "2023-03-01T00:00:00"
        end_date = "2023-03-31T23:59:59"
        response = client.get(f"/api/v1/reports/summary?start_date={start_date}&end_date={end_date}")
        
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(response_data["data"]["total"], 0)
        self.assertEqual(response_data["data"]["items"], [])

    def test_get_category_summary_missing_dates(self):
        response = client.get("/api/v1/reports/summary") # Missing start_date and end_date
        self.assertEqual(response.status_code, 422) # Unprocessable Entity

    # Authentication test (conceptual, actual implementation depends on auth setup)
    # @patch("app.api.v1.endpoints.reports.TransactionService")
    # def test_get_category_summary_unauthenticated(self, MockTransactionService):
    #     # This requires removing the get_current_user override for this specific test
    #     # or configuring TestClient to not use the overridden dependency.
    #     # For simplicity, this is a placeholder.
    #     # A common way is to set client.headers for a token, or have a separate client instance.
    #     
    #     # Assuming default client has no auth:
    #     # temp_client = TestClient(app_without_auth_override) 
    #     # response = temp_client.get("/api/v1/reports/summary?start_date=...&end_date=...")
    #     # self.assertEqual(response.status_code, 401) # or 403
    #     pass

# Note: To run this test file directly, you might need:
if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
