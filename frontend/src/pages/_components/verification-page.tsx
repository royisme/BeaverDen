// src/pages/_components/verification-page.tsx
import { OnboardingData } from '@/types/user'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, User } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface VerificationPageProps {
  data: OnboardingData;
  onComplete: (data: OnboardingData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function VerificationPage({
  data,
  onComplete,
  onBack,
  isLoading = false
}: VerificationPageProps) {
  const content = {
    en: {
      title: "Verify Your Information",
      description: "Please review your information before completing the setup",
      account: "Account Information",
      preferences: "Your Preferences",
      buttons: {
        back: "Back",
        continue: "Continue"
      },
      fields: {
        username: "Username",
        email: "Email",
        language: "Language",
        currency: "Currency",
        theme: "Theme"
      }
    },
    zh: {
      title: "确认您的信息",
      description: "请在完成设置前检查以下信息",
      account: "账户信息",
      preferences: "偏好设置",
      buttons: {
        back: "返回",
        continue: "继续"
      },
      fields: {
        username: "用户名",
        email: "邮箱",
        language: "语言",
        currency: "货币",
        theme: "主题"
      }
    }
  }

  const t = content[data.preferences.language]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 flex-1 rounded-full bg-primary/30" />
            <div className="h-2 flex-1 rounded-full bg-primary/30" />
            <div className="h-2 flex-1 rounded-full bg-primary" />
            <div className="h-2 flex-1 rounded-full bg-primary/30" />
          </div>
          <div className="flex items-center space-x-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.account}</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.fields.username}
                  </p>
                  <p>{data.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.fields.email}
                  </p>
                  <p>{data.email}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.preferences}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.fields.language}
                </p>
                <p className="capitalize">{data.preferences.language}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.fields.currency}
                </p>
                <p>{data.preferences.currency}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.fields.theme}
                </p>
                <p className="capitalize">{data.preferences.theme}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.buttons.back}
          </Button>

          <Button
            onClick={() => onComplete(data)}
            disabled={isLoading}
          >
            {t.buttons.continue}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}