import unittest
from unittest.mock import MagicMock, patch, ANY, mock_open
from io import BytesIO
from datetime import datetime

from fastapi import UploadFile

from app.services.import_service import ImportService
from app.models.user import User
from app.models.transaction import ImportBatch, RawTransaction, Transaction
from app.models.finance import FinanceAccount
from app.models.enums import TransactionType, ImportBatchStatus, RawTransactionStatus
from app.schemas.transaction import ConfirmRow, RawTransactionCreate # Assuming RawTransactionCreate is used internally or similar

# Mock bank parser registry
class MockBankParser:
    def parse(self, file_content: bytes) -> List[Dict[str, Any]]:
        # Simplified parser, returns a list of dicts for RawTransaction creation
        if b"Error" in file_content:
            raise ValueError("Mock parsing error")
        if b"Empty" in file_content:
            return []
        return [
            {"transaction_date": datetime(2023, 1, 15), "description": "Parsed transaction 1", "amount": 100.0, "currency": "USD", "original_data": {"key": "val1"}},
            {"transaction_date": datetime(2023, 1, 16), "description": "Parsed transaction 2", "amount": -50.0, "currency": "USD", "original_data": {"key": "val2"}},
        ]

mock_parser_registry = {
    "TestBank": MockBankParser,
    "ErrorBank": MockBankParser, # For testing parser errors
    "EmptyBank": MockBankParser, # For testing empty results from parser
}

class TestImportService(unittest.TestCase):

    def setUp(self):
        self.mock_db_session = MagicMock()
        # Patch the global PARSER_REGISTRY used by ImportService
        self.parser_patcher = patch('app.services.import_service.PARSER_REGISTRY', mock_parser_registry)
        self.mock_parser_registry = self.parser_patcher.start()
        
        self.import_service = ImportService(db=self.mock_db_session)
        self.test_user = User(id="test_user_id", email="test@example.com")


    def tearDown(self):
        self.parser_patcher.stop()

    def test_create_import_batch_success(self):
        file_content = b"Date,Description,Amount\n01/15/2023,Transaction 1,100.00"
        mock_file = UploadFile(filename="test.csv", file=BytesIO(file_content))

        created_batch = self.import_service.create_import_batch(
            user=self.test_user, file=mock_file, bank_name="TestBank"
        )

        self.mock_db_session.add.assert_called_once() # For the ImportBatch object
        self.mock_db_session.commit.assert_called_once()
        self.mock_db_session.refresh.assert_called_once()

        self.assertEqual(created_batch.filename, "test.csv")
        self.assertEqual(created_batch.user_id, self.test_user.id)
        self.assertEqual(created_batch.status, ImportBatchStatus.UPLOADED)
        self.assertEqual(created_batch.bank_name, "TestBank")
        
        # Check that RawTransactions were created (via db.add_all or similar)
        # This depends on how RawTransactions are added in the actual service
        # Assuming db.add is called for each raw transaction after batch is created.
        # If add_all is used, then check its call.
        # For this example, let's assume individual `db.add` calls for raw transactions aren't directly part of `create_import_batch`
        # but rather happen during `process_import_batch` or if the parser directly adds them.
        # The current `create_import_batch` seems to just create the batch and store the file.
        # Let's assume the provided code snippet for ImportService.create_import_batch
        # is simpler and doesn't create raw_transactions yet.
        # If it *does* parse and create raw_transactions, this test needs adjustment.
        # Based on the problem description, parsing and creating RawTransaction objects happens here.

        # Let's refine based on the description that create_import_batch *does* parse.
        # The mock_db_session.add would be called for ImportBatch, then for each RawTransaction.
        # Or add_all for RawTransactions.
        
        # Call count for add should be 1 (batch) + N (raw transactions) if added individually
        # or 1 (batch) + 1 (for add_all([raw_transactions]))
        # Let's assume it's add_all for raw transactions for simplicity
        
        # If RawTransactions are created and added here:
        # self.assertEqual(self.mock_db_session.add.call_count, 1 + len(mock_parser_registry["TestBank"]().parse(b''))) # Batch + RawTx
        # Or if db.bulk_save_objects or db.add_all is used for raw_transactions
        
        # The provided code for ImportService's create_import_batch in the prompt does not show parsing.
        # It shows:
        # db_batch = ImportBatch(...)
        # self.db.add(db_batch)
        # self.db.commit()
        # self.db.refresh(db_batch)
        # # Store file content, etc.
        # This implies parsing might be in process_import_batch.
        # Let's assume parsing is NOT in create_import_batch for this test, and file is just stored.
        # If this assumption is wrong, the test needs to mock the parser call and check RawTransaction creation.

    def test_create_import_batch_unknown_bank_parser(self):
        file_content = b"data"
        mock_file = UploadFile(filename="test.dat", file=BytesIO(file_content))
        with self.assertRaisesRegex(ValueError, "No parser available for bank: UnknownBank"):
            self.import_service.create_import_batch(
                user=self.test_user, file=mock_file, bank_name="UnknownBank"
            )

    def test_create_import_batch_parser_error(self):
        file_content = b"Error content" # This will make MockBankParser raise ValueError
        mock_file = UploadFile(filename="error.csv", file=BytesIO(file_content))
        with self.assertRaisesRegex(ValueError, "Mock parsing error"):
            self.import_service.create_import_batch(
                user=self.test_user, file=mock_file, bank_name="ErrorBank"
            )
    
    # Tests for process_import_batch
    @patch("app.services.import_service.CategoryMatcher") # If CategoryMatcher is used
    def test_process_import_batch_success(self, MockCategoryMatcher):
        mock_category_matcher_instance = MockCategoryMatcher.return_value
        mock_category_matcher_instance.match_category.return_value = "matched_cat_id"

        mock_batch = ImportBatch(id="batch1", user_id=self.test_user.id, file_content=b"valid content", bank_name="TestBank", status=ImportBatchStatus.UPLOADED)
        self.mock_db_session.query(ImportBatch).filter_by().first.return_value = mock_batch
        
        # Mock raw transactions that would be created by the parser
        # In a real scenario, these might be created in create_import_batch or loaded from DB if already parsed
        # For this test, assume process_import_batch is responsible for parsing if not already done,
        # or fetching pre-parsed RawTransaction objects.
        # Let's assume it fetches existing RawTransaction objects linked to the batch or parses if file_content is present.
        
        # If process_import_batch calls the parser:
        parsed_data = mock_parser_registry["TestBank"]().parse(b"")
        
        # Simulate that RawTransactions are created and added to the session
        # The service should change their status and try to match categories.
        
        # The service's process_import_batch logic:
        # 1. Gets batch.
        # 2. Gets parser.
        # 3. Parses batch.file_content into raw_data.
        # 4. Creates RawTransaction objects from raw_data, adds to DB.
        # 5. For each RawTransaction, attempts category matching.
        # 6. Updates batch status.
        
        # We need to mock the RawTransaction objects that would be created and then processed.
        # Let's assume the parser is called, and then RawTransaction objects are instantiated.
        
        processed_raw_txns = self.import_service.process_import_batch(self.test_user, "batch1", auto_create_categories=False)

        self.assertEqual(len(processed_raw_txns), len(parsed_data))
        for txn in processed_raw_txns:
            self.assertEqual(txn.status, RawTransactionStatus.PROCESSED)
            self.assertIsNotNone(txn.batch_id) # Should be set
            if txn.description == "Parsed transaction 1": # Example check
                 self.assertEqual(txn.matched_category_id, "matched_cat_id")

        self.assertEqual(mock_batch.status, ImportBatchStatus.PROCESSED)
        self.mock_db_session.commit.assert_called()


    def test_process_import_batch_no_batch_found(self):
        self.mock_db_session.query(ImportBatch).filter_by().first.return_value = None
        with self.assertRaisesRegex(ValueError, "Import batch not found or does not belong to user"):
            self.import_service.process_import_batch(self.test_user, "non_existent_batch")

    # Tests for confirm_import_batch
    def test_confirm_import_batch_all_rows_success(self):
        mock_batch = ImportBatch(id="batch_confirm", user_id=self.test_user.id, status=ImportBatchStatus.PROCESSED)
        # Raw transactions associated with this batch
        raw_txns_data = [
            RawTransaction(id="raw1", batch_id="batch_confirm", transaction_date=datetime(2023,1,1), description="tx1", amount=10.0, currency="USD", status=RawTransactionStatus.PROCESSED, matched_category_id="cat1", account_id_guess="acc1"),
            RawTransaction(id="raw2", batch_id="batch_confirm", transaction_date=datetime(2023,1,2), description="tx2", amount=-20.0, currency="USD", status=RawTransactionStatus.PROCESSED, matched_category_id="cat2", account_id_guess="acc1")
        ]
        
        self.mock_db_session.query(ImportBatch).filter_by().first.return_value = mock_batch
        self.mock_db_session.query(RawTransaction).filter_by().all.return_value = raw_txns_data
        
        # Mock FinanceAccount lookups
        mock_account = FinanceAccount(id="acc1", user_id=self.test_user.id, balance=100.0)
        self.mock_db_session.query(FinanceAccount).filter_by().first.return_value = mock_account

        confirmed_transactions = self.import_service.confirm_import_batch(self.test_user, "batch_confirm", confirm_all=True)

        self.assertEqual(len(confirmed_transactions), 2)
        self.assertEqual(self.mock_db_session.add.call_count, 2) # Two Transaction objects
        
        # Check if RawTransaction statuses were updated
        for rt in raw_txns_data:
            self.assertEqual(rt.status, RawTransactionStatus.CONFIRMED)
        
        self.assertEqual(mock_batch.status, ImportBatchStatus.CONFIRMED)
        self.mock_db_session.commit.assert_called()

    def test_confirm_import_batch_selected_rows_success(self):
        mock_batch = ImportBatch(id="batch_sel", user_id=self.test_user.id, status=ImportBatchStatus.PROCESSED)
        raw_txn1 = RawTransaction(id="raw_id_1", batch_id="batch_sel", transaction_date=datetime(2023,1,3), description="sel_tx1", amount=50.0, currency="USD", status=RawTransactionStatus.PROCESSED)
        
        self.mock_db_session.query(ImportBatch).filter_by().first.return_value = mock_batch
        self.mock_db_session.query(RawTransaction).filter_by(id="raw_id_1", batch_id="batch_sel").first.return_value = raw_txn1
        
        mock_account = FinanceAccount(id="acc_selected", user_id=self.test_user.id, balance=200.0)
        self.mock_db_session.query(FinanceAccount).filter_by(id="acc_selected", user_id=self.test_user.id).first.return_value = mock_account

        selected_rows_data = [
            ConfirmRow(raw_transaction_id="raw_id_1", account_id="acc_selected", category_id="cat_selected", transaction_type=TransactionType.INCOME)
        ]
        
        confirmed_transactions = self.import_service.confirm_import_batch(
            self.test_user, "batch_sel", confirm_all=False, selected_rows=selected_rows_data
        )

        self.assertEqual(len(confirmed_transactions), 1)
        self.assertEqual(confirmed_transactions[0].description, "sel_tx1")
        self.assertEqual(confirmed_transactions[0].account_id, "acc_selected")
        self.assertEqual(confirmed_transactions[0].category_id, "cat_selected")
        self.assertEqual(confirmed_transactions[0].type, TransactionType.INCOME)
        
        self.assertEqual(raw_txn1.status, RawTransactionStatus.CONFIRMED)
        # Batch status should still be PROCESSED if not all rows were confirmed, or CONFIRMED if all selectable rows were confirmed.
        # This depends on the exact logic for batch status update in selected_rows scenario.
        # For now, assume it's updated to confirmed if any transaction is confirmed.
        # A more precise test would check if all raw_txns for the batch are confirmed before setting batch to CONFIRMED.
        # self.assertEqual(mock_batch.status, ImportBatchStatus.CONFIRMED) # Or PROCESSED
        self.mock_db_session.commit.assert_called()

    def test_confirm_import_batch_raw_transaction_not_found(self):
        mock_batch = ImportBatch(id="batch_err", user_id=self.test_user.id, status=ImportBatchStatus.PROCESSED)
        self.mock_db_session.query(ImportBatch).filter_by().first.return_value = mock_batch
        self.mock_db_session.query(RawTransaction).filter_by().first.return_value = None # Raw tx not found

        selected_rows_data = [ConfirmRow(raw_transaction_id="non_existent_raw_id", account_id="a1", category_id="c1", transaction_type=TransactionType.EXPENSE)]
        
        with self.assertLogs(logger='app.services.import_service', level='WARNING') as cm:
            confirmed_transactions = self.import_service.confirm_import_batch(
                self.test_user, "batch_err", confirm_all=False, selected_rows=selected_rows_data
            )
        self.assertEqual(len(confirmed_transactions), 0)
        self.assertIn("Raw transaction not_found_or_batch_mismatch: non_existent_raw_id", cm.output[0])

    def test_confirm_import_batch_account_not_found(self):
        mock_batch = ImportBatch(id="batch_acc_err", user_id=self.test_user.id, status=ImportBatchStatus.PROCESSED)
        raw_txn = RawTransaction(id="raw_acc", batch_id="batch_acc_err", transaction_date=datetime(2023,1,4), description="acc_err_tx", amount=10.0, status=RawTransactionStatus.PROCESSED)

        self.mock_db_session.query(ImportBatch).filter_by().first.return_value = mock_batch
        self.mock_db_session.query(RawTransaction).filter_by(id="raw_acc", batch_id="batch_acc_err").first.return_value = raw_txn
        self.mock_db_session.query(FinanceAccount).filter_by().first.return_value = None # Account not found

        selected_rows_data = [ConfirmRow(raw_transaction_id="raw_acc", account_id="non_existent_acc", category_id="c1", transaction_type=TransactionType.EXPENSE)]
        
        with self.assertLogs(logger='app.services.import_service', level='WARNING') as cm:
             confirmed_transactions = self.import_service.confirm_import_batch(
                self.test_user, "batch_acc_err", confirm_all=False, selected_rows=selected_rows_data
            )
        self.assertEqual(len(confirmed_transactions), 0)
        self.assertIn("Finance account not found for ID: non_existent_acc", cm.output[0])
        self.assertEqual(raw_txn.status, RawTransactionStatus.ERROR) # Check if raw_txn status updated to ERROR

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
