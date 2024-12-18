'use client'
import { useEffect } from 'react'
import { useUserStore } from '@/stores/user.store'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import confetti from 'canvas-confetti'

interface CompletePageProps {
  onFinish: () => void;
}

export default function CompletePage({ onFinish }: CompletePageProps) {
  const { currentUser, completeInitialSetup, isLoading } = useUserStore()
  const { toast } = useToast()

  // 如果没有用户数据，不应该显示完成页面
  if (!currentUser) {
    return null
  }

  const content = {
    en: {
      title: "You're All Set!",
      description: "Your financial journey in Canada starts now",
      nextSteps: "Here's what you can do next:",
      steps: [
        {
          title: "Set up your accounts",
          description: "Add your bank accounts and credit cards"
        },
        {
          title: "Track your expenses",
          description: "Start recording your daily spending"
        },
        {
          title: "Create a budget",
          description: "Plan your monthly income and expenses"
        },
        {
          title: "Explore insights",
          description: "Learn about your spending patterns"
        }
      ],
      tip: "💡 Pro tip: Start with one account and gradually add more as you get comfortable",
      startButton: "Start Using Beaveden",
      errors: {
        completion: "Failed to complete setup"
      }
    },
    zh: {
      title: "设置完成！",
      description: "您的加拿大理财之旅现在开始",
      nextSteps: "接下来您可以：",
      steps: [
        {
          title: "设置账户",
          description: "添加您的银行账户和信用卡"
        },
        {
          title: "记录支出",
          description: "开始记录日常开销"
        },
        {
          title: "创建预算",
          description: "规划月度收支"
        },
        {
          title: "探索分析",
          description: "了解您的消费模式"
        }
      ],
      tip: "💡 小贴士：从一个账户开始，随着熟悉度提升再添加更多",
      startButton: "开始使用 Beaveden",
      errors: {
        completion: "完成设置失败"
      }
    }
  }

  const t = content[currentUser.preferences.language]

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C5E063', '#9BC088', '#65945E']
    })
  }

  // 页面加载时的庆祝动画
  useEffect(() => {
    launchConfetti()
  }, [])

  const handleStart = async () => {
    try {
      await completeInitialSetup()
      launchConfetti()
      onFinish()
    } catch (error) {
      toast({
        title: "Error",
        description: t.errors.completion,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <CheckCircle2 className="h-16 w-16 text-primary animate-bounce" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -right-2 -top-2 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl">{t.title}</CardTitle>
          <CardDescription className="text-xl">{t.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="bg-primary/10 p-6 rounded-lg space-y-6">
            <h3 className="font-semibold text-lg">{t.nextSteps}</h3>
            <div className="grid gap-4">
              {t.steps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/10 p-4 rounded-lg">
            <p className="text-sm">{t.tip}</p>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            className="w-full h-14 text-lg group"
            onClick={handleStart}
            disabled={isLoading}
          >
            {t.startButton}
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}