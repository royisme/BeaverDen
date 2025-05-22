import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ImportBatch, ImportBatchStatus } from '@/types/transaction/transaction.type';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImportBatchListProps {
  batches: ImportBatch[];
  onViewBatch: (batch: ImportBatch) => void;
}

export function ImportBatchList({ batches, onViewBatch }: ImportBatchListProps) {
  const getStatusBadge = (status: ImportBatchStatus) => {
    const statusMap: Record<ImportBatchStatus, { color: string; label: string }> = {
      [ImportBatchStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      [ImportBatchStatus.PROCESSING]: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      [ImportBatchStatus.COMPLETED]: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      [ImportBatchStatus.ERROR]: { color: 'bg-red-100 text-red-800', label: 'Error' },
    };

    const { color, label } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={cn(color)}>{label}</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Processed</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell>{batch.fileName}</TableCell>
              <TableCell>{batch.accountId}</TableCell>
              <TableCell>{getStatusBadge(batch.status)}</TableCell>
              <TableCell>{batch.processedCount}</TableCell>
              <TableCell>{formatDate(batch.createdAt)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewBatch(batch)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
