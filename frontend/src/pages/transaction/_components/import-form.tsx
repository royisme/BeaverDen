import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BankStatementFormat, FinanceAccount } from '@/types/finance';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  accountId: z.string({
    required_error: 'Please select an account',
  }),
  statementFormat: z.nativeEnum(BankStatementFormat).optional(),
  file: z.instanceof(File, {
    message: 'Please select a file',
  }),
});

type ImportFormValues = z.infer<typeof formSchema>;

interface ImportFormProps {
  accounts: FinanceAccount[];
  onSubmit: (values: ImportFormValues) => void;
  onClose: () => void;
  open: boolean;
}

export function ImportForm({ accounts, onSubmit, onClose, open }: ImportFormProps) {
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = (data: ImportFormValues) => {
    onSubmit(data);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      form.setValue('file', file);
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('file', file, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Import transactions from your bank statement file.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="statementFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statement Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(BankStatementFormat).map((format) => (
                        <SelectItem key={format} value={format}>
                          {format.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>Statement File</FormLabel>
                  <FormControl>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        dragActive ? 'border-primary bg-primary/5' : 'border-input'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          {value?.name || 'Drag and drop your file here, or click to select'}
                        </p>
                      </div>
                      <input
                        id="file-input"
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        {...field}
                        ref={field.ref}
                        onChange={(e) => {
                          field.onChange(e);
                          handleFileChange(e);
                        }}
                        value=""
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Import</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
