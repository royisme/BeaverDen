import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function ReportsPage() {
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-4">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold">{t('reports.title')}</h1>
        <p className="text-muted-foreground">{t('reports.description')}</p>
      </div>

      {/* 时间范围选择 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.timeRange.label')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={t('reports.timeRange.month')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t('reports.timeRange.week')}</SelectItem>
              <SelectItem value="month">{t('reports.timeRange.month')}</SelectItem>
              <SelectItem value="quarter">{t('reports.timeRange.quarter')}</SelectItem>
              <SelectItem value="year">{t('reports.timeRange.year')}</SelectItem>
              <SelectItem value="custom">{t('reports.timeRange.custom')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 收支概览 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.sections.overview.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Label>{t('reports.sections.overview.comingSoon')}</Label>
          </div>
        </CardContent>
      </Card>

      {/* 支出分类 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.sections.categories.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Label>{t('reports.sections.categories.comingSoon')}</Label>
          </div>
        </CardContent>
      </Card>

      {/* 趋势分析 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.sections.trends.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Label>{t('reports.sections.trends.comingSoon')}</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
