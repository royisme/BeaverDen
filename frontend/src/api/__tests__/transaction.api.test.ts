import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createImportBatch,
  listImportBatches,
  processImportBatch,
  confirmImportBatch,
  getImportBatch, // Though not in primary list, good to test if used/related
} from '../transaction.api';
import { getApiClient } from '@/lib/api-client';
import { ImportBatch, ImportBatchResult } from '@/types/transaction/transaction.type';

// Mock the apiClient
vi.mock('@/lib/api-client', () => ({
  getApiClient: vi.fn().mockResolvedValue({
    getClient: vi.fn().mockReturnValue({
      get: vi.fn(),
      post: vi.fn(),
    }),
  }),
}));

describe('transaction.api (Import Functions)', () => {
  let mockApiClient: any;
  let mockGet: any;
  let mockPost: any;

  beforeEach(async () => {
    mockApiClient = await getApiClient();
    const clientInstance = mockApiClient.getClient();
    mockGet = clientInstance.get;
    mockPost = clientInstance.post;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createImportBatch', () => {
    const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });
    const mockAccountId = 'acc123';
    const mockBatchResponse: ImportBatch = {
      id: 'batch_1',
      fileName: 'test.csv',
      status: 'uploaded',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Add other fields as per ImportBatch type if necessary
    };

    it('should create import batch successfully with accountId only', async () => {
      mockPost.mockResolvedValueOnce(mockBatchResponse);
      const result = await createImportBatch(mockFile, mockAccountId);

      expect(mockPost).toHaveBeenCalledWith(
        '/transactions/import',
        expect.any(FormData), // Check that FormData is passed
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      // Verify FormData content
      const formData = mockPost.mock.calls[0][1] as FormData;
      expect(formData.get('file')).toEqual(mockFile);
      expect(formData.get('accountId')).toEqual(mockAccountId);
      expect(formData.has('statementFormat')).toBe(false);

      expect(result).toEqual(mockBatchResponse);
    });

    it('should create import batch successfully with accountId and statementFormat', async () => {
      mockPost.mockResolvedValueOnce(mockBatchResponse);
      const statementFormat = 'CSV_GENERIC';
      await createImportBatch(mockFile, mockAccountId, statementFormat);

      expect(mockPost).toHaveBeenCalledWith(
        '/transactions/import',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const formData = mockPost.mock.calls[0][1] as FormData;
      expect(formData.get('statementFormat')).toEqual(statementFormat);
    });

    it('should handle API error for createImportBatch', async () => {
      const error = new Error('Upload Failed');
      mockPost.mockRejectedValueOnce(error);

      await expect(createImportBatch(mockFile, mockAccountId)).rejects.toThrow('Upload Failed');
    });
  });

  describe('listImportBatches', () => {
    const mockBatchesResponse: ImportBatch[] = [
      { id: 'batch_1', fileName: 'file1.csv', status: 'uploaded', created_at: '', updated_at: '' },
      { id: 'batch_2', fileName: 'file2.ofx', status: 'processed', created_at: '', updated_at: '' },
    ];

    it('should list import batches without parameters', async () => {
      mockGet.mockResolvedValueOnce(mockBatchesResponse);
      const result = await listImportBatches();

      expect(mockGet).toHaveBeenCalledWith('/transactions/import', { params: undefined });
      expect(result).toEqual(mockBatchesResponse);
    });

    it('should list import batches with parameters', async () => {
      mockGet.mockResolvedValueOnce([mockBatchesResponse[0]]);
      const params = { accountId: 'acc123', status: 'uploaded' };
      const result = await listImportBatches(params);

      expect(mockGet).toHaveBeenCalledWith('/transactions/import', { params });
      expect(result).toEqual([mockBatchesResponse[0]]);
    });

    it('should handle API error for listImportBatches', async () => {
      const error = new Error('List Fetch Failed');
      mockGet.mockRejectedValueOnce(error);

      await expect(listImportBatches()).rejects.toThrow('List Fetch Failed');
    });
  });

  describe('processImportBatch', () => {
    const batchId = 'batch_process_1';
    const mockResult: ImportBatchResult = { // Assuming ImportBatchResult structure
      batch: { id: batchId, fileName: 'f.csv', status: 'processed', created_at: '', updated_at: ''},
      rawTransactions: [], 
    };

    it('should process import batch successfully with autoCreate false by default', async () => {
      mockPost.mockResolvedValueOnce(mockResult);
      const result = await processImportBatch(batchId);

      expect(mockPost).toHaveBeenCalledWith(`/transactions/import/${batchId}/process`, { autoCreate: false });
      expect(result).toEqual(mockResult);
    });

    it('should process import batch successfully with autoCreate true', async () => {
      mockPost.mockResolvedValueOnce(mockResult);
      const result = await processImportBatch(batchId, true);

      expect(mockPost).toHaveBeenCalledWith(`/transactions/import/${batchId}/process`, { autoCreate: true });
      expect(result).toEqual(mockResult);
    });

    it('should handle API error for processImportBatch', async () => {
      const error = new Error('Processing Failed');
      mockPost.mockRejectedValueOnce(error);

      await expect(processImportBatch(batchId)).rejects.toThrow('Processing Failed');
    });
  });

  describe('confirmImportBatch', () => {
    const batchId = 'batch_confirm_1';
     const mockResult: ImportBatchResult = { // Assuming ImportBatchResult structure
      batch: { id: batchId, fileName: 'f.csv', status: 'confirmed', created_at: '', updated_at: ''},
      rawTransactions: [], 
      confirmedTransactions: [],
    };

    it('should confirm import batch successfully without selectedRows (confirm all)', async () => {
      mockPost.mockResolvedValueOnce(mockResult);
      const result = await confirmImportBatch(batchId);

      expect(mockPost).toHaveBeenCalledWith(`/transactions/import/${batchId}/confirm`, { selectedRows: undefined });
      expect(result).toEqual(mockResult);
    });

    it('should confirm import batch successfully with selectedRows', async () => {
      mockPost.mockResolvedValueOnce(mockResult);
      const selectedRows = [1, 2, 3];
      const result = await confirmImportBatch(batchId, selectedRows);

      expect(mockPost).toHaveBeenCalledWith(`/transactions/import/${batchId}/confirm`, { selectedRows });
      expect(result).toEqual(mockResult);
    });

    it('should handle API error for confirmImportBatch', async () => {
      const error = new Error('Confirmation Failed');
      mockPost.mockRejectedValueOnce(error);

      await expect(confirmImportBatch(batchId)).rejects.toThrow('Confirmation Failed');
    });
  });
  
  // Optional: Test for getImportBatch if it's deemed critical or used by UI
  describe('getImportBatch', () => {
    const batchId = 'batch_get_1';
    const mockBatch: ImportBatch = { id: batchId, fileName: 'get.csv', status: 'processed', created_at: '', updated_at: '' };

    it('should get import batch successfully', async () => {
      mockGet.mockResolvedValueOnce(mockBatch);
      const result = await getImportBatch(batchId);
      expect(mockGet).toHaveBeenCalledWith(`/transactions/import/${batchId}`);
      expect(result).toEqual(mockBatch);
    });

    it('should handle API error for getImportBatch', async () => {
      const error = new Error('Get Batch Failed');
      mockGet.mockRejectedValueOnce(error);
      await expect(getImportBatch(batchId)).rejects.toThrow('Get Batch Failed');
    });
  });

});

if (import.meta.vitest) {
  import.meta.vitest.run();
}
