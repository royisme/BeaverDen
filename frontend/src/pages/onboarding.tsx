import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Language, Currency, Theme, FlowStep } from '@/types/enums'
import { OnboardingData } from '@/types/user'
import WelcomePage from '@/pages/_components/welcome-page'
import SetupWizard from '@/pages/_components/setup-wizard'
import CompletePage from '@/pages/_components/complete-page'
import { useUserStore } from '@/stores/user.store'
import { useToast } from "@/hooks/use-toast"

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { registerUser } = useUserStore()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<FlowStep>('welcome')
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    username: '',
    email: '',
    password: '',
    preferences: {
      language: Language.EN,
      currency: Currency.CAD,
      theme: Theme.FRESH
    }
  })

  // 处理用户退出
  const handleExit = () => {
    // 直接返回登录页，不保存任何数据
    navigate('/landing')
  }

  // 处理每个步骤的完成
  const handleWelcomeComplete = (data: {
    username: string;
    email: string;
    password: string;
    preferences: { language: Language }
  }) => {
    // 合并初始偏好设置和用户选择的语言
    setOnboardingData(prev => ({
      ...prev,
      username: data.username,
      email: data.email,
      password: data.password,
      preferences: {
        ...prev.preferences,
        language: data.preferences.language
      }
    }))
    setCurrentStep('setup')
  }

  const handleSetupComplete = (preferences: { currency: Currency; theme: Theme }) => {
    setOnboardingData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...preferences,
        lastModified: new Date()
      }
    }))
    setCurrentStep('complete')
  }

  const handleFinalSubmit = async () => {
    try {
      const { username, email, password, preferences } = onboardingData
      // 注册用户
      console.log('Starting user registration:', username, email, password, preferences)  
      await registerUser(username, password, email, preferences)
      // 注册成功后跳转到仪表板
      navigate('/dashboard')
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      })
    }
  }

  // 渲染当前步骤
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomePage
            onNext={handleWelcomeComplete}
            onExit={handleExit}
          />
        )
      case 'setup':
        return (
          <SetupWizard
            initialPreferences={onboardingData.preferences}
            onNext={handleSetupComplete}
            onBack={() => setCurrentStep('welcome')}
            onExit={handleExit}
          />
        )
      case 'complete':
        return (
          <CompletePage
            onFinish={handleFinalSubmit}
            onBack={() => setCurrentStep('setup')}
            onExit={handleExit}
          />
        )
      default:
        return null
    }
  }

  return (
    <div id="onboarding-page" className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div id="onboarding-container" className="container mx-auto">
        <div id="onboarding-content" className="transition-opacity duration-300 ease-in-out">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}