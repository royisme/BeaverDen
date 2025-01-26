import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FinanceTransaction } from '@/types/finance';
import { formatDate, formatMoney } from '@/lib/utils';
import { Edit2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransactionListProps {
  transactions: FinanceTransaction[];
  isLoading: boolean;
}

export function TransactionList({
  transactions,
  isLoading,
}: TransactionListProps) {
  const navigate = useNavigate();

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { color: string; label: string }> = {
      expense: { color: 'bg-red-100 text-red-800', label: 'Expense' },
      income: { color: 'bg-green-100 text-green-800', label: 'Income' },
      transfer_out: { color: 'bg-blue-100 text-blue-800', label: 'Transfer Out' },
      transfer_in: { color: 'bg-blue-100 text-blue-800', label: 'Transfer In' },
      refund: { color: 'bg-yellow-100 text-yellow-800', label: 'Refund' },
      adjustment: { color: 'bg-purple-100 text-purple-800', label: 'Adjustment' },
    };

    const { color, label } = typeMap[type.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: type };
    return <Badge className={color}>{label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
      recurring: { color: 'bg-purple-100 text-purple-800', label: 'Recurring' },
      cleared: { color: 'bg-blue-100 text-blue-800', label: 'Cleared' },
    };

    const { color, label } = statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={color}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell>{getTypeBadge(transaction.type)}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{formatMoney(transaction.amount, transaction.currency)}</TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/app/transaction/${transaction.id}/edit`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
