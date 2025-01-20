import { Button } from '@/components/ui/button';
import React from 'react';
import {  Outlet, useNavigate } from 'react-router-dom';

export default function FinancePage() {
  const navigate = useNavigate();
  console.log("FinancePage is rendered");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">我的账户</h1>  
        <Button onClick={() => navigate('/app/finance/account')}>
          我的账户
        </Button>
      </div>
    </div>
    );
}
