import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ImportBatch } from '@/types/finance';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ImportBatchListProps {
  batches: ImportBatch[];
  onViewBatch: (batch: ImportBatch) => void;
}

export function ImportBatchList({ batches, onViewBatch }: ImportBatchListProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'completed' },
      error: { color: 'bg-red-100 text-red-800', label: 'error' },
    };

    const { color, label } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={color}>{label}</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>fileName</TableHead>
            <TableHead>account</TableHead>
            <TableHead>status</TableHead>
            <TableHead>processed</TableHead>
            <TableHead>createdAt</TableHead>
            <TableHead>action</TableHead>
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
