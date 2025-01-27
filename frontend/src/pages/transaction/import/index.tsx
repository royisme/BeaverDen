import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ImportForm } from '@/pages/transaction/_components/import-form';
import { ImportBatchList } from '@/pages/transaction/_components/import-batch-list';
import { ImportPreview } from '@/pages/transaction/_components/import-preview';
import { useFinanceStore } from '@/stores/finance.store';
import {
  createImportBatch,
  listImportBatches,
  processImportBatch,
  confirmImportBatch,
} from '@/api/transaction.api';
import { ImportBatch, ImportBatchResult } from '@/types/transaction/transaction.type';

export default function ImportPage() {
  const { accounts } = useFinanceStore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ImportBatchResult | null>(null);
  const [, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const data = await listImportBatches();
      setBatches(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch import records',
        description: 'Please try again later',
      });
    }
  };

  const handleImport = async (values: {
    accountId: string;
    statementFormat?: string;
    file: File;
  }) => {
    setIsLoading(true);
    try {
      const batch = await createImportBatch(
        values.file,
        values.accountId,
        values.statementFormat
      );
      const result = await processImportBatch(batch.id);
      setSelectedBatch(result);
      await fetchBatches();
      setIsFormOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to import',
        description: 'Please check the file format',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBatch = async (batch: ImportBatch) => {
    setIsLoading(true);
    try {
      const result = await processImportBatch(batch.id);
      setSelectedBatch(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to get import details',
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async (selectedRows: number[]) => {
    if (!selectedBatch) return;

    setIsLoading(true);
    try {
      await confirmImportBatch(selectedBatch.batch.id, selectedRows);
      toast({
        title: 'Imported successfully',
        description: `Imported ${selectedRows.length} transactions`,
      });
      setSelectedBatch(null);
      await fetchBatches();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to import',
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Import Transactions</h2>
          <p className="text-gray-500">Import transactions from bank statement</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>Import New Records</Button>
      </div>

      {selectedBatch ? (
        <ImportPreview
          batch={selectedBatch.batch}
          transactions={selectedBatch.results}
          onConfirm={handleConfirmImport}
          onCancel={() => setSelectedBatch(null)}
        />
      ) : (
        <ImportBatchList
          batches={batches}
          onViewBatch={handleViewBatch}
        />
      )}

      <ImportForm
        accounts={accounts}
        onSubmit={handleImport}
        onClose={() => setIsFormOpen(false)}
        open={isFormOpen}
      />
    </div>
  );
}
