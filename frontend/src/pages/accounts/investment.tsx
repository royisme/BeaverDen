import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function InvestmentAccountsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('accounts');

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('investmentAccounts.title')}</h1>
          <p className="text-gray-500">{t('investmentAccounts.description')}</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => navigate('/app/accounts/investment/new')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('investmentAccounts.addAccount')}
          </Button>
        </div>
      </div>

      {/* TODO: 添加投资账户列表和相关功能 */}
      <div className="grid gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground">{t('investmentAccounts.comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
