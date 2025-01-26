import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation('settings');

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-gray-500">{t('description')}</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">{t('tabs.account')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('tabs.preferences')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">{t('sections.account.title')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{t('sections.account.username')}</p>
                <p className="text-muted-foreground">{t('sections.account.comingSoon')}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t('sections.account.email')}</p>
                <p className="text-muted-foreground">{t('sections.account.comingSoon')}</p>
              </div>
              <Button variant="outline">{t('sections.account.updateButton')}</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">{t('sections.preferences.title')}</h3>
            <p className="text-muted-foreground">{t('sections.preferences.comingSoon')}</p>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">{t('sections.notifications.title')}</h3>
            <p className="text-muted-foreground">{t('sections.notifications.comingSoon')}</p>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">{t('sections.security.title')}</h3>
            <p className="text-muted-foreground">{t('sections.security.comingSoon')}</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
