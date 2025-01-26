import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function BudgetPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('budget');

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-gray-500">{t('description')}</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => navigate('/app/budget/new')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('createBudget')}
          </Button>
        </div>
      </div>

      {/* TODO: 添加预算列表和统计信息 */}
      <div className="grid gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground">{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
