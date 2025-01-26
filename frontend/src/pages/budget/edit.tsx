import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditBudgetPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('budget.editBudget')}</CardTitle>
          <CardDescription>{t('budget.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TODO: Add form fields for editing a budget */}
          <div className="space-y-2">
            <Label>{t('common.status.comingSoon')}</Label>
            <Input disabled />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/app/budget')}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button disabled>
              {t('common.actions.save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
