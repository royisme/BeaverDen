import { useState } from 'react'
import { Language } from '@/types/enums'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapleIcon } from "@/components/icons/maple-leaf"
import { useToast } from "@/hooks/use-toast"

interface WelcomePageProps {
  onNext: (data: {
    username: string
    email: string
    password: string
    preferences: { language: Language }
  }) => void
  onExit: () => void
}

export default function WelcomePage({ onNext, onExit }: WelcomePageProps) {
  const { toast } = useToast()
  const [language, setLanguage] = useState<Language>(Language.EN)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const content = {
    en: {
      welcome: "Welcome to Beaveden",
      description: "Your Canadian Personal Finance Manager",
      languageLabel: "Choose Your Language",
      startButton: "Continue",
      intro: "Manage your finances with ease, tailored for life in Canada.",
      features: [
        "Easy expense and income tracking in CAD/USD",
        "Canadian tax planning assistance",
        "Financial insights for newcomers",
        "Learn about Canadian banking system"
      ],
      form: {
        username: "Username",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password"
      },
      errors: {
        required: "All fields are required",
        passwordMatch: "Passwords do not match",
        emailFormat: "Invalid email format"
      }
    },
    zh: {
      welcome: "欢迎使用 Beaveden",
      description: "您的加拿大个人财务管理助手",
      languageLabel: "选择语言",
      startButton: "继续",
      intro: "轻松管理您的财务，专为加拿大生活设计。",
      features: [
        "轻松追踪加元/美元的收支",
        "加拿大税务规划助手",
        "为新移民提供财务洞察",
        "了解加拿大银行系统"
      ],
      form: {
        username: "用户名",
        email: "邮箱",
        password: "密码",
        confirmPassword: "确认密码"
      },
      errors: {
        required: "请填写所有字段",
        passwordMatch: "两次输入的密码不匹配",
        emailFormat: "邮箱格式不正确"
      }
    }
  }

  const t = content[language]

  const validateForm = () => {
    // 检查所有字段是否填写
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: t.errors.required,
        variant: "destructive",
      })
      return false
    }

    // 检查密码匹配
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: t.errors.passwordMatch,
        variant: "destructive",
      })
      return false
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: t.errors.emailFormat,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleContinue = () => {
    if (!validateForm()) return

    const { confirmPassword, ...userData } = formData
    onNext({
      ...userData,
      preferences: { language }
    })
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl dark:bg-gray-800/90 backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-4xl font-bold flex items-center gap-3">
              <MapleIcon className="h-10 w-10 text-red-600" />  
              {t.welcome}
            </CardTitle>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
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
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">{t.form.username}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    username: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t.form.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t.form.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t.form.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button 
              variant="destructive"
              onClick={onExit}
            >
              Cancel
            </Button>
            <Button onClick={handleContinue}>
              {t.startButton}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Your data stays local first, with optional cloud sync
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}