'use client'
import { useUserStore } from '@/stores/user.store'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { MapIcon as Maple } from 'lucide-react'
import { useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Language } from '@/types/enums'
interface WelcomePageProps {
  onNext: () => void;  // 用于通知父组件进行页面切换的回调函数
}

export default function WelcomePage({ onNext }: WelcomePageProps) {
  const { currentUser, initializeUser, updatePreferences, error } = useUserStore()
  const { toast } = useToast()

  // 如果还没有初始化用户，则进行初始化
  useEffect(() => {
    if (!currentUser) {
      initializeUser().catch((err) => {
        toast({
          title: "Initialization failed",
          description: err.message,
          variant: "destructive",
        })
      })
    }
  }, [currentUser, initializeUser, toast])

  // 根据当前用户的语言选择显示内容
  const content = {
    en: {
      welcome: "Welcome to Beaveden",
      description: "Your Canadian Personal Finance Manager",
      languageLabel: "Choose Your Language",
      startButton: "Get Started",
      intro: "Manage your finances with ease, tailored for life in Canada.",
      features: [
        "Easy expense and income tracking in CAD/USD",
        "Canadian tax planning assistance",
        "Financial insights for newcomers",
        "Learn about Canadian banking system"
      ]
    },
    zh: {
      welcome: "欢迎使用 Beaveden",
      description: "您的加拿大个人财务管理助手",
      languageLabel: "选择语言",
      startButton: "开始使用",
      intro: "轻松管理您的财务，专为加拿大生活设计。",
      features: [
        "轻松追踪加元/美元的收支",
        "加拿大税务规划助手",
        "为新移民提供财务洞察",
        "了解加拿大银行系统"
      ]
    }
  }

  const t = content[currentUser?.preferences.language || 'en']

  const handleLanguageChange = async (language: 'en' | 'zh') => {
    try {
      await updatePreferences({ language: language as Language })
    } catch (err) {
      toast({
        title: "Failed to update language",
        description: "Your preference was not saved. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStart = () => {
    // 将控制权交回给 OnboardingFlow 处理页面切换
    if (currentUser) {
      onNext();
    }

  }

  // 如果还在初始化中，显示加载状态
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <CardHeader className="text-center">
            <CardTitle>Initializing...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-4xl font-bold flex items-center gap-3">
              <Maple className="h-10 w-10 text-red-600" />
              {t.welcome}
            </CardTitle>
            <Select
              value={currentUser.preferences.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t.languageLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription className="text-xl">{t.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed">{t.intro}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <span className="text-primary">•</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            className="w-full text-lg h-14 mt-4" 
            onClick={handleStart}
            size="lg"
          >
            {t.startButton}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}