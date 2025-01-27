import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FinanceTransaction, TransactionFormData } from '@/types/transaction/transaction.type';
import {
  fetchTransactions,
  fetchTransaction,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/api/transaction.api';
import { BaseResponse } from '@/types/base-response';

// 将表单数据转换为API需要的格式
const transformFormData = (data: TransactionFormData): Omit<FinanceTransaction, 'id'> => {
  return {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {},
  };
};

export const useTransactions = () => {
  const queryClient = useQueryClient();

  // 获取交易列表
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<BaseResponse<FinanceTransaction[]>>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const data = await fetchTransactions();
      return { status: 200, data, message: 'Success' };
    },
    staleTime: 5000, // 5 seconds
  });

  // 获取单个交易
  const useTransaction = (id: string) => {
    return useQuery<BaseResponse<FinanceTransaction>>({
      queryKey: ['transaction', id],
      queryFn: async () => {
        const data = await fetchTransaction(id);
        return { status: 200, data, message: 'Success' };
      },
      staleTime: 5000,
    });
  };

  // 创建交易
  const createMutation = useMutation({
    mutationFn: (data: TransactionFormData) => addTransaction(transformFormData(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // 更新交易
  const updateMutation = useMutation({
    mutationFn: (data: FinanceTransaction) => updateTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // 删除交易
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    transactions: response?.data || [],
    isLoading,
    error,
    useTransaction,
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
  };
};
