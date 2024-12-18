'use client'
import { useState } from 'react'
import { useUserStore } from '@/stores/user.store'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

// 定义设置向导的步骤类型
type SetupStep = 'currency' | 'theme'

interface SetupWizardProps {
  onBack: () => void;
  onNext: () => void;
}

export default function SetupWizard({ onBack, onNext }: SetupWizardProps) {
  const { currentUser, updatePreferences, isLoading } = useUserStore()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<SetupStep>('currency')

  // 如果没有用户数据，不应该显示设置向导
  if (!currentUser) {
    return null
  }

  // 根据用户语言选择显示内容
  const content = {
    en: {
      title: "Basic Setup",
      description: "Let's personalize your experience",
      currency: {
        title: "Currency Preference",
        description: "Choose your primary currency for transactions",
        label: "Select Currency",
        cad: "Canadian Dollar (CAD)",
        usd: "US Dollar (USD)"
      },
      theme: {
        title: "Visual Theme",
        description: "Choose how Beaveden looks",
        label: "Select Theme",
        fresh: "Fresh Green",
        natural: "Natural Green",
        ocean: "Ocean Blue",
        sunset: "Sunset Orange"
      },
      back: "Back",
      next: "Next",
      finish: "Complete Setup",
      errors: {
        update: "Failed to save your preferences"
      }
    },
    zh: {
      title: "基本设置",
      description: "让我们个性化您的体验",
      currency: {
        title: "货币偏好",
        description: "选择您的主要交易货币",
        label: "选择货币",
        cad: "加拿大元 (CAD)",
        usd: "美元 (USD)"
      },
      theme: {
        title: "视觉主题",
        description: "选择Beaveden的外观",
        label: "选择主题",
        fresh: "清新绿",
        natural: "自然绿",
        ocean: "海洋蓝",
        sunset: "日落橙"
      },
      back: "返回",
      next: "下一步",
      finish: "完成设置",
      errors: {
        update: "保存偏好设置失败"
      }
    }
  }

  const t = content[currentUser.preferences.language]

  // 处理偏好设置的更新
  const handlePreferenceUpdate = async (key: keyof typeof currentUser.preferences, value: string) => {
    try {
      await updatePreferences({ [key]: value })
    } catch (error) {
      toast({
        title: "Error",
        description: t.errors.update,
        variant: "destructive",
      })
    }
  }

  // 处理步骤导航
  const handleNext = () => {
    if (currentStep === 'currency') {
      setCurrentStep('theme')
    } else {
      onNext()
    }
  }

  const handleBack = () => {
    if (currentStep === 'currency') {
      onBack()
    } else {
      setCurrentStep('currency')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {/* 进度指示器 */}
          <div className="flex items-center gap-2 mb-2">
            <div 
              className={`h-2 flex-1 rounded-full ${
                currentStep === 'currency' ? 'bg-primary' : 'bg-primary/30'
              }`}
            />
            <div 
              className={`h-2 flex-1 rounded-full ${
                currentStep === 'theme' ? 'bg-primary' : 'bg-primary/30'
              }`}
            />
          </div>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 'currency' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t.currency.title}</h3>
              <p className="text-muted-foreground">{t.currency.description}</p>
              <Select
                value={currentUser.preferences.currency}
                onValueChange={(value) => handlePreferenceUpdate('currency', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.currency.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAD">{t.currency.cad}</SelectItem>
                  <SelectItem value="USD">{t.currency.usd}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t.theme.title}</h3>
              <p className="text-muted-foreground">{t.theme.description}</p>
              <div className="grid grid-cols-2 gap-4">
                {(['fresh', 'natural', 'ocean', 'sunset'] as const).map((theme) => (
                  <button
                    key={theme}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentUser.preferences.theme === theme 
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handlePreferenceUpdate('theme', theme)}
                    disabled={isLoading}
                  >
                    <div className={`h-20 rounded-md bg-${theme}-primary mb-2`} />
                    <div className="flex items-center justify-between">
                      <span>{t.theme[theme]}</span>
                      {currentUser.preferences.theme === theme && (
                        <CheckCircle2 className="text-primary h-5 w-5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2" />
            {t.back}
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={isLoading}
          >
            {currentStep === 'currency' ? t.next : t.finish}
            <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}