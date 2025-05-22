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
    const categoryMap: Record<string, { color: string; label: string }> = {
      // Income
      [TransactionCategory.INCOME]: { color: 'bg-green-100 text-green-800', label: 'Income' },
      [TransactionCategory.INCOME_SALARY]: { color: 'bg-green-100 text-green-800', label: 'Salary' },
      [TransactionCategory.INCOME_BONUS]: { color: 'bg-green-100 text-green-800', label: 'Bonus' },
      [TransactionCategory.INCOME_INVESTMENT]: { color: 'bg-green-100 text-green-800', label: 'Investment Income' },
      [TransactionCategory.INCOME_REFUND]: { color: 'bg-green-100 text-green-800', label: 'Refund' },
      [TransactionCategory.INCOME_OTHER]: { color: 'bg-green-100 text-green-800', label: 'Other Income' },
      
      // Transport
      [TransactionCategory.TRANSPORT]: { color: 'bg-blue-100 text-blue-800', label: 'Transport' },
      [TransactionCategory.TRANSPORT_FUEL]: { color: 'bg-blue-100 text-blue-800', label: 'Fuel' },
      [TransactionCategory.TRANSPORT_PARKING]: { color: 'bg-blue-100 text-blue-800', label: 'Parking' },
      [TransactionCategory.TRANSPORT_PUBLIC]: { color: 'bg-blue-100 text-blue-800', label: 'Public Transport' },
      [TransactionCategory.TRANSPORT_TAXI]: { color: 'bg-blue-100 text-blue-800', label: 'Taxi' },
      [TransactionCategory.TRANSPORT_MAINTENANCE]: { color: 'bg-blue-100 text-blue-800', label: 'Maintenance' },
      
      // Dining
      [TransactionCategory.DINING]: { color: 'bg-orange-100 text-orange-800', label: 'Dining' },
      [TransactionCategory.DINING_RESTAURANT]: { color: 'bg-orange-100 text-orange-800', label: 'Restaurant' },
      [TransactionCategory.DINING_TAKEOUT]: { color: 'bg-orange-100 text-orange-800', label: 'Takeout' },
      [TransactionCategory.DINING_CAFE]: { color: 'bg-orange-100 text-orange-800', label: 'Cafe' },
      
      // Shopping
      [TransactionCategory.SHOPPING]: { color: 'bg-purple-100 text-purple-800', label: 'Shopping' },
      [TransactionCategory.SHOPPING_GROCERY]: { color: 'bg-purple-100 text-purple-800', label: 'Grocery' },
      [TransactionCategory.SHOPPING_CLOTHES]: { color: 'bg-purple-100 text-purple-800', label: 'Clothes' },
      [TransactionCategory.SHOPPING_DIGITAL]: { color: 'bg-purple-100 text-purple-800', label: 'Digital' },
      [TransactionCategory.SHOPPING_FURNITURE]: { color: 'bg-purple-100 text-purple-800', label: 'Furniture' },
      
      // Housing
      [TransactionCategory.HOUSING]: { color: 'bg-yellow-100 text-yellow-800', label: 'Housing' },
      [TransactionCategory.HOUSING_RENT]: { color: 'bg-yellow-100 text-yellow-800', label: 'Rent' },
      [TransactionCategory.HOUSING_MORTGAGE]: { color: 'bg-yellow-100 text-yellow-800', label: 'Mortgage' },
      [TransactionCategory.HOUSING_UTILITIES]: { color: 'bg-yellow-100 text-yellow-800', label: 'Utilities' },
      [TransactionCategory.HOUSING_PROPERTY]: { color: 'bg-yellow-100 text-yellow-800', label: 'Property' },
      
      // Entertainment
      [TransactionCategory.ENTERTAINMENT]: { color: 'bg-pink-100 text-pink-800', label: 'Entertainment' },
      [TransactionCategory.ENTERTAINMENT_MOVIE]: { color: 'bg-pink-100 text-pink-800', label: 'Movie' },
      [TransactionCategory.ENTERTAINMENT_GAME]: { color: 'bg-pink-100 text-pink-800', label: 'Game' },
      [TransactionCategory.ENTERTAINMENT_SPORTS]: { color: 'bg-pink-100 text-pink-800', label: 'Sports' },
      
      // Healthcare
      [TransactionCategory.HEALTHCARE]: { color: 'bg-red-100 text-red-800', label: 'Healthcare' },
      [TransactionCategory.HEALTHCARE_MEDICAL]: { color: 'bg-red-100 text-red-800', label: 'Medical' },
      [TransactionCategory.HEALTHCARE_INSURANCE]: { color: 'bg-red-100 text-red-800', label: 'Insurance' },
      
      // Education
      [TransactionCategory.EDUCATION]: { color: 'bg-indigo-100 text-indigo-800', label: 'Education' },
      [TransactionCategory.EDUCATION_TUITION]: { color: 'bg-indigo-100 text-indigo-800', label: 'Tuition' },
      [TransactionCategory.EDUCATION_BOOKS]: { color: 'bg-indigo-100 text-indigo-800', label: 'Books' },
      [TransactionCategory.EDUCATION_COURSE]: { color: 'bg-indigo-100 text-indigo-800', label: 'Course' },
      
      // Transfer
      [TransactionCategory.TRANSFER]: { color: 'bg-gray-100 text-gray-800', label: 'Transfer' },
      [TransactionCategory.TRANSFER_IN]: { color: 'bg-gray-100 text-gray-800', label: 'Transfer In' },
      [TransactionCategory.TRANSFER_OUT]: { color: 'bg-gray-100 text-gray-800', label: 'Transfer Out' },
      
      // Other
      [TransactionCategory.OTHER]: { color: 'bg-gray-100 text-gray-800', label: 'Other' }
    };

    const { color, label } = categoryMap[category] || { color: 'bg-gray-100 text-gray-800', label: category };
    return <Badge className={cn(color)}>{label}</Badge>;
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
