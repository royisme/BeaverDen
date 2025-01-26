import { create } from 'zustand';
import { FinanceAccount,  } from '@/types/finance';
import { fetchAccounts, addAccount, updateAccount, deleteAccount } from '@/api/finance.api';

interface FinanceState {
  accounts: FinanceAccount[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Omit<FinanceAccount, 'id'>) => Promise<void>;
  updateAccount: (account: FinanceAccount) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  accounts: [],
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await fetchAccounts();
      set({ accounts });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch accounts',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addAccount: async (account) => {
    set({ isLoading: true, error: null });
    try {
      const newAccount = await addAccount(account);
      set((state) => ({ accounts: [...state.accounts, newAccount] }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add account',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAccount: async (account) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAccount = await updateAccount(account);
      set((state) => ({
        accounts: state.accounts.map((a) => (a.id === account.id ? updatedAccount : a)),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update account',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteAccount(id);
      set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete account',
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
