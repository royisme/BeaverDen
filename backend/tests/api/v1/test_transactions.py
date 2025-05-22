import unittest
from unittest.mock import patch, MagicMock, ANY
from fastapi.testclient import TestClient
from fastapi import FastAPI, Depends, UploadFile, File, Form
from typing import List, Optional
import io

from app.models.user import User
from app.schemas.common import BaseResponse
from app.services.import_service import ImportService
from app.api.v1.endpoints.transactions import router as transactions_router # import your actual router
from app.schemas.transaction import ImportBatchRead, RawTransactionRead, TransactionRead # Import relevant schemas

# Create a minimal app for testing
app = FastAPI()

# Mock get_current_user
async def mock_get_current_user():
    return User(id="test_user_id", email="test@example.com", is_active=True)

# Mock get_session
async def mock_get_session():
    return MagicMock()

# Override dependencies for the test app
# Assuming get_current_user and get_session are the first two dependencies for the router
app.dependency_overrides[transactions_router.dependencies[0].dependency] = mock_get_current_user
app.dependency_overrides[transactions_router.dependencies[1].dependency] = mock_get_session

app.include_router(transactions_router, prefix="/api/v1") # Assuming /api/v1 prefix from your app structure

client = TestClient(app)

class TestTransactionImportApi(unittest.TestCase):

    @patch("app.api.v1.endpoints.transactions.ImportService")
    def test_upload_transactions_success(self, MockImportService):
        mock_service_instance = MockImportService.return_value
        mock_batch_data = {"id": "batch_123", "filename": "test.csv", "status": "uploaded", "raw_transactions": []}
        mock_service_instance.create_import_batch.return_value = ImportBatchRead(**mock_batch_data)

        file_content = b"col1,col2\nval1,val2"
        files = {"file": ("test.csv", io.BytesIO(file_content), "text/csv")}
        
        response = client.post("/api/v1/transactions/import", files=files, data={"bank_name": "Test Bank"})

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(response_data["data"]["id"], "batch_123")
        self.assertEqual(response_data["data"]["filename"], "test.csv")
        mock_service_instance.create_import_batch.assert_called_once_with(
            user=ANY,
            file=ANY, # FastAPI UploadFile instance
            bank_name="Test Bank"
        )
        # Check if the file argument has the correct filename
        self.assertEqual(mock_service_instance.create_import_batch.call_args[1]['file'].filename, "test.csv")


    @patch("app.api.v1.endpoints.transactions.ImportService")
    def test_get_import_batch_success(self, MockImportService):
        mock_service_instance = MockImportService.return_value
        mock_batch_data = {"id": "batch_xyz", "filename": "import.ofx", "status": "processed", "raw_transactions": []}
        mock_service_instance.get_import_batch.return_value = ImportBatchRead(**mock_batch_data)

        response = client.get("/api/v1/transactions/import/batch_xyz")
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(response_data["data"]["id"], "batch_xyz")
        mock_service_instance.get_import_batch.assert_called_once_with(user=ANY, batch_id="batch_xyz")

    @patch("app.api.v1.endpoints.transactions.ImportService")
    def test_process_import_batch_success(self, MockImportService):
        mock_service_instance = MockImportService.return_value
        mock_processed_data = [
            {"id": "raw1", "description": "Transaction 1", "amount": 100.0, "matched_category_id": "cat1"},
            {"id": "raw2", "description": "Transaction 2", "amount": -50.0, "matched_category_id": None}
        ]
        # Ensure the mock returns objects that can be serialized by Pydantic models if you use response_model
        mock_service_instance.process_import_batch.return_value = [RawTransactionRead(**d, transaction_date="2023-01-01", original_data={}, batch_id="b1", status="processed") for d in mock_processed_data]


        response = client.post("/api/v1/transactions/import/batch_abc/process?auto_create_categories=true")
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(len(response_data["data"]), 2)
        self.assertEqual(response_data["data"][0]["description"], "Transaction 1")
        mock_service_instance.process_import_batch.assert_called_once_with(
            user=ANY,
            batch_id="batch_abc",
            auto_create_categories=True
        )

    @patch("app.api.v1.endpoints.transactions.ImportService")
    def test_confirm_import_batch_success_all_rows(self, MockImportService):
        mock_service_instance = MockImportService.return_value
        # Assume confirm_import_batch returns a list of created TransactionRead objects
        mock_confirmed_transactions = [
            {"id": "txn1", "description": "Confirmed Txn 1", "amount": 100.0, "account_id": "acc1"},
        ]
        mock_service_instance.confirm_import_batch.return_value = [
            TransactionRead(**d, transaction_date="2023-01-01", type="income", category_id="cat1", currency="USD") for d in mock_confirmed_transactions
        ]

        response = client.post("/api/v1/transactions/import/batch_def/confirm", json={"confirm_all": True})
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(len(response_data["data"]), 1)
        self.assertEqual(response_data["data"][0]["description"], "Confirmed Txn 1")
        mock_service_instance.confirm_import_batch.assert_called_once_with(
            user=ANY,
            batch_id="batch_def",
            confirm_all=True,
            selected_rows=None # or empty list, depending on your Pydantic model default
        )

    @patch("app.api.v1.endpoints.transactions.ImportService")
    def test_confirm_import_batch_success_selected_rows(self, MockImportService):
        mock_service_instance = MockImportService.return_value
        mock_confirmed_transactions = [
             {"id": "txn2", "description": "Selected Txn 2", "amount": -75.0, "account_id": "acc2"},
        ]
        mock_service_instance.confirm_import_batch.return_value = [
            TransactionRead(**d, transaction_date="2023-01-02", type="expense", category_id="cat2", currency="USD") for d in mock_confirmed_transactions
        ]
        
        selected_data = {
            "confirm_all": False,
            "selected_rows": [
                {"raw_transaction_id": "raw_id_1", "account_id": "acc2", "category_id": "cat2", "transaction_type": "expense"}
            ]
        }
        response = client.post("/api/v1/transactions/import/batch_ghi/confirm", json=selected_data)
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(response_data["data"][0]["description"], "Selected Txn 2")
        
        # Check the structure of selected_rows passed to the service
        # It should be a list of ConfirmRow objects (or dicts if service handles conversion)
        # The Pydantic model ConfirmRow has fields: raw_transaction_id, account_id, category_id, transaction_type
        expected_selected_rows_arg = [
            unittest.mock.ANY # Each element should match ConfirmRow schema
        ]
        
        # More specific check on the argument:
        args, kwargs = mock_service_instance.confirm_import_batch.call_args
        actual_selected_rows = kwargs['selected_rows']
        self.assertEqual(len(actual_selected_rows), 1)
        self.assertEqual(actual_selected_rows[0].raw_transaction_id, "raw_id_1")
        self.assertEqual(actual_selected_rows[0].account_id, "acc2")


    def test_upload_transactions_no_file(self):
        response = client.post("/api/v1/transactions/import", data={"bank_name": "Test Bank"}) # No file
        self.assertEqual(response.status_code, 422) # Unprocessable Entity for missing file

    # Conceptual: Test for invalid file type (requires more setup on server side or mock)
    # def test_upload_transactions_invalid_file_type(self, MockImportService):
    #     mock_service_instance = MockImportService.return_value
    #     mock_service_instance.create_import_batch.side_effect = ValueError("Invalid file type")
    #     files = {"file": ("test.txt", io.BytesIO(b"not a csv"), "text/plain")}
    #     response = client.post("/api/v1/transactions/import", files=files, data={"bank_name": "Test Bank"})
    #     self.assertEqual(response.status_code, 400) # Or other appropriate error code

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
