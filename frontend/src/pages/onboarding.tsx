// src/pages/onboarding.tsx
import { useState, useEffect } from 'react'
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
  const { registerUser, registrationState } = useUserStore()
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

  // 监听注册状态变化
  useEffect(() => {
    if (registrationState.status === 'success') {
      // 注册成功后自动跳转到仪表板
      navigate('/dashboard')
    } else if (registrationState.status === 'error' && registrationState.error) {
      // 显示错误提示
      toast({
        title: "Registration failed",
        description: registrationState.error,
        variant: "destructive",
      })
    }
  }, [registrationState, navigate, toast])

  const handleExit = () => {
    // 如果正在注册，不允许退出
    if (registrationState.status === 'registering') {
      return;
    }
    navigate('/landing')
  }

  const handleWelcomeComplete = (data: {
    username: string;
    email: string;
    password: string;
    preferences: { language: Language }
  }) => {
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
    // 如果已经在注册中，防止重复提交
    if (registrationState.status === 'registering') {
      return;
    }

    try {
      const { username, email, password, preferences } = onboardingData
      await registerUser(username, password, email, preferences)
      // 注意：成功后的导航已经移到 useEffect 中处理
    } catch (error) {
      // 错误处理已经移到 useEffect 中
      console.error('Registration error:', error)
    }
  }

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
            // 传递注册状态给完成页面
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