'use client'
import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/user.store'
import WelcomePage from './_components/welcome-page'
import SetupWizard from './_components/setup-wizard'
import CompletePage from './_components/complete-page'

// 引导流程的步骤
type FlowStep = 'welcome' | 'setup' | 'complete'

export default function OnboardingFlow() {
  const { currentUser, isConfigured, initializeUser } = useUserStore()
  const [currentStep, setCurrentStep] = useState<FlowStep>('welcome')

  // 当组件加载时，检查初始化状态
  useEffect(() => {
    if (!currentUser && !isConfigured) {
      initializeUser().catch(error => {
        console.error('Failed to initialize user:', error)
        // 这里可以添加错误处理UI
      })
    }
  }, [currentUser, isConfigured, initializeUser])

  // 处理步骤导航
  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('setup')
        break
      case 'setup':
        setCurrentStep('complete')
        break
      case 'complete':
        // 完成引导流程后，这里可以重定向到主应用
        window.location.href = '/dashboard'
        break
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'setup':
        setCurrentStep('welcome')
        break
      case 'complete':
        setCurrentStep('setup')
        break
      // welcome 页面不需要返回
    }
  }

  // 如果用户已完成配置，直接重定向到主应用
  useEffect(() => {
    if (isConfigured) {
      window.location.href = '/dashboard'
    }
  }, [isConfigured])

  // 如果还在初始化中，显示加载状态
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Initializing your experience...</p>
        </div>
      </div>
    )
  }

  // 渲染当前步骤
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomePage 
            onNext={handleNext}
          />
        )
      case 'setup':
        return (
          <SetupWizard
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 'complete':
        return (
          <CompletePage
            onFinish={handleNext}
          />
        )
      default:
        return null
    }
  }

  // 使用渐变背景，确保整个流程视觉上的连贯性
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto">
        {/* 使用简单的淡入淡出动画进行页面切换 */}
        <div className="transition-opacity duration-300 ease-in-out">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}