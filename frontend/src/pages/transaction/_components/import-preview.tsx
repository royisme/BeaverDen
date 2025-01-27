import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ImportBatch, ProcessedTransaction, TransactionCategory } from '@/types/transaction/transaction.type';
import { cn } from '@/lib/utils';

interface ImportPreviewProps {
  batch: ImportBatch;
  transactions: Array<{
    id: string;
    rowNumber: number;
    processedData: ProcessedTransaction;
  }>;
  onConfirm: (selectedRows: number[]) => void;
  onCancel: () => void;
}

export function ImportPreview({ batch, transactions, onConfirm, onCancel }: ImportPreviewProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedRows(checked ? transactions.map(t => t.rowNumber) : []);
  };

  const handleSelectRow = (rowNumber: number, checked: boolean) => {
    setSelectedRows(prev =>
      checked
        ? [...prev, rowNumber]
        : prev.filter(r => r !== rowNumber)
    );
    setSelectAll(false);
  };

  const getCategoryBadge = (category: TransactionCategory) => {
    const categoryMap: Record<TransactionCategory, { color: string; label: string }> = {
      [TransactionCategory.TRANSFER]: { color: 'bg-purple-100 text-purple-800', label: 'Transfer' },
      [TransactionCategory.PAYMENT]: { color: 'bg-blue-100 text-blue-800', label: 'Payment' },
      [TransactionCategory.BILL_PAYMENT]: { color: 'bg-yellow-100 text-yellow-800', label: 'Bill Payment' },
      [TransactionCategory.UTILITY]: { color: 'bg-orange-100 text-orange-800', label: 'Utility' },
      [TransactionCategory.GROCERY]: { color: 'bg-green-100 text-green-800', label: 'Grocery' },
      [TransactionCategory.DINING]: { color: 'bg-red-100 text-red-800', label: 'Dining' },
      [TransactionCategory.SHOPPING]: { color: 'bg-pink-100 text-pink-800', label: 'Shopping' },
      [TransactionCategory.GAS]: { color: 'bg-gray-100 text-gray-800', label: 'Gas' },
      [TransactionCategory.ENTERTAINMENT]: { color: 'bg-indigo-100 text-indigo-800', label: 'Entertainment' },
      [TransactionCategory.PAYROLL]: { color: 'bg-teal-100 text-teal-800', label: 'Payroll' },
      [TransactionCategory.OTHER]: { color: 'bg-gray-100 text-gray-800', label: 'Other' },
    };

    const { color, label } = categoryMap[category] || categoryMap[TransactionCategory.OTHER];
    return <Badge className={color}>{label}</Badge>;
  };

  const formatAmount = (amount: string, direction: 'inflow' | 'outflow'): string => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Import Preview</h3>
          <p className="text-sm text-gray-500">
            File: {batch.fileName} | Status: {batch.status} | Records: {batch.processedCount}
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            Import ({selectedRows.length})
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Card/Account</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((trans) => (
              <TableRow key={trans.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(trans.rowNumber)}
                    onCheckedChange={(checked) => handleSelectRow(trans.rowNumber, !!checked)}
                  />
                </TableCell>
                <TableCell>{formatDate(trans.processedData.transactionDate)}</TableCell>
                <TableCell>{trans.processedData.description}</TableCell>
                <TableCell>
                  <span className={cn(
                    trans.processedData.direction === 'inflow' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {trans.processedData.direction === 'inflow' ? '+' : '-'}
                    {formatAmount(trans.processedData.amount, trans.processedData.direction)}
                  </span>
                </TableCell>
                <TableCell>{getCategoryBadge(trans.processedData.category)}</TableCell>
                <TableCell>
                  {trans.processedData.cardLast4
                    ? `**** ${trans.processedData.cardLast4}`
                    : trans.processedData.accountNumber}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
