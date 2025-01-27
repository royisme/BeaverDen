import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FinanceAccount } from '@/types/finance/finance.type';
import {
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} from '@/api/finance.api';
import { BaseResponse } from '@/types/base-response';

export const useFinanceAccounts = () => {
  const queryClient = useQueryClient();

  // 获取账户列表
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<BaseResponse<FinanceAccount[]>>({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });

  // 创建账户
  const createMutation = useMutation({
    mutationFn: addAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  // 更新账户
  const updateMutation = useMutation({
    mutationFn: updateAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  // 删除账户
  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  return {
    accounts: response?.data || [],
    isLoading,
    error,
    createAccount: createMutation.mutate,
    updateAccount: updateMutation.mutate,
    deleteAccount: deleteMutation.mutate,
    createMutationResult: createMutation,
    updateMutationResult: updateMutation,
    deleteMutationResult: deleteMutation,
  };
};
