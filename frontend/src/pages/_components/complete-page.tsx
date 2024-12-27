import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import confetti from 'canvas-confetti'
import { Language } from '@/types/enums'

interface CompletePageProps {
  onFinish: () => Promise<void>;
  onBack: () => void;
  onExit: () => void;
}

export default function CompletePage({ 
  onFinish,
  onBack,
  onExit
}: CompletePageProps) {
  const { toast } = useToast()

  const handleFinish = async () => {
    try {
      await onFinish()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete setup",
        variant: "destructive",
      })
    }
  }

  // 页面加载时的庆祝动画
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C5E063', '#9BC088', '#65945E']
    })
  }, [])

  const content = {
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
    backButton: "Back",
    cancelButton: "Cancel"
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <CheckCircle2 className="h-12 w-12 text-primary animate-bounce" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -right-2 -top-2 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl">{content.title}</CardTitle>
          <CardDescription className="text-xl">{content.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="bg-primary/10 p-6 rounded-lg space-y-6">
            <h3 className="font-semibold text-lg">{content.nextSteps}</h3>
            <div className="grid gap-4">
              {content.steps.map((step, index) => (
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
            <p className="text-sm">{content.tip}</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex gap-2">

          </div>
          <Button 
            onClick={handleFinish}
            className="group"
          >
            {content.startButton}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}