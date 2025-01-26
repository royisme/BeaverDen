import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OtherAccountsPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">其他账户</h1>
          <p className="text-gray-500">管理其他类型的资产账户</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => navigate('/app/accounts/other/new')}>
            <Plus className="h-4 w-4 mr-2" />
            添加其他账户
          </Button>
        </div>
      </div>

      {/* TODO: 添加其他账户列表和相关功能 */}
      <div className="grid gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground">其他账户管理功能即将推出...</p>
        </div>
      </div>
    </div>
  );
}
