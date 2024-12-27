// src/pages/_components/setup-wizard.tsx
import { useState } from 'react'
import { Currency, Theme } from '@/types/enums'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SetupWizardProps {
  initialPreferences: {
    currency: Currency;
    theme: Theme;
  };
  onNext: (preferences: { currency: Currency; theme: Theme }) => void;
  onBack: () => void;
  onExit: () => void;
}

type SetupStep = 'currency' | 'theme'

export default function SetupWizard({ 
  initialPreferences,
  onNext,
  onBack,
  onExit
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('currency')
  const [preferences, setPreferences] = useState(initialPreferences)

  const content = {
    common: {
      back: "Back",
      next: "Next",
      finish: "Complete Setup",
      cancel: "Cancel"
    },
    currency: {
      title: "Currency Preference",
      description: "Choose your primary currency for transactions",
      label: "Select Currency",
      options: {
        [Currency.CAD]: "Canadian Dollar (CAD)",
        [Currency.USD]: "US Dollar (USD)"
      }
    },
    theme: {
      title: "Visual Theme",
      description: "Choose how Beaveden looks",
      label: "Select Theme",
      options: {
        [Theme.FRESH]: "Fresh Green",
        [Theme.NATURAL]: "Natural Green",
        [Theme.OCEAN]: "Ocean Blue",
        [Theme.SUNSET]: "Sunset Orange"
      }
    }
  }

  const handleNext = () => {
    if (currentStep === 'currency') {
      setCurrentStep('theme')
    } else {
      onNext(preferences)
    }
  }

  const handleBack = () => {
    if (currentStep === 'currency') {
      onBack()
    } else {
      setCurrentStep('currency')
    }
  }

  const ThemePreview = ({ theme, isSelected }: { theme: Theme; isSelected: boolean }) => {
    const themeConfig = {
      [Theme.FRESH]: {
        name: "Fresh Green",
        colors: {
          primary: "bg-fresh-primary",
          secondary: "bg-fresh-secondary",
          accent1: "bg-fresh-accent1",
          accent2: "bg-fresh-accent2"
        }
      },
      [Theme.NATURAL]: {
        name: "Natural Green",
        colors: {
          primary: "bg-natural-primary",
          secondary: "bg-natural-secondary",
          accent1: "bg-natural-accent1",
          accent2: "bg-natural-accent2"
        }
      },
      [Theme.OCEAN]: {
        name: "Ocean Blue",
        colors: {
          primary: "bg-ocean-primary",
          secondary: "bg-ocean-secondary",
          accent1: "bg-ocean-accent1",
          accent2: "bg-ocean-accent2"
        }
      },
      [Theme.SUNSET]: {
        name: "Sunset Orange",
        colors: {
          primary: "bg-sunset-primary",
          secondary: "bg-sunset-secondary",
          accent1: "bg-sunset-accent1",
          accent2: "bg-sunset-accent2"
        }
      }
    }[theme];

    return (
      <button
        onClick={() => setPreferences(prev => ({ ...prev, theme }))}
        className={cn(
          "w-full p-4 rounded-lg border-2 transition-all",
          isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
        )}
      >
        <div className="space-y-2">
          {/* Theme color preview */}
          <div className="flex gap-2 h-20">
            <div className={cn("flex-1 rounded-md", themeConfig.colors.primary)} />
            <div className={cn("flex-1 rounded-md", themeConfig.colors.secondary)} />
          </div>
          <div className="flex gap-2 h-10">
            <div className={cn("flex-1 rounded-md", themeConfig.colors.accent1)} />
            <div className={cn("flex-1 rounded-md", themeConfig.colors.accent2)} />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium">{themeConfig.name}</span>
          {isSelected && <CheckCircle2 className="text-primary h-5 w-5" />}
        </div>
      </button>
    );
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div 
              className={cn(
                "h-2 flex-1 rounded-full",
                currentStep === 'currency' ? 'bg-primary' : 'bg-primary/30'
              )}
            />
            <div 
              className={cn(
                "h-2 flex-1 rounded-full",
                currentStep === 'theme' ? 'bg-primary' : 'bg-primary/30'
              )}
            />
          </div>
          <CardTitle>
            {currentStep === 'currency' ? content.currency.title : content.theme.title}
          </CardTitle>
          <CardDescription>
            {currentStep === 'currency' ? content.currency.description : content.theme.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 'currency' ? (
            <div className="space-y-4">
              <Select
                value={preferences.currency}
                onValueChange={(value: Currency) => 
                  setPreferences(prev => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={content.currency.label} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(content.currency.options).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {Object.values(Theme).map((theme) => (
                <ThemePreview
                  key={theme}
                  theme={theme}
                  isSelected={preferences.theme === theme}
                />
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {content.common.back}
            </Button>
            <Button
              variant="destructive"
              onClick={onExit}
            >
              {content.common.cancel}
            </Button>
          </div>
          <Button onClick={handleNext}>
            {currentStep === 'currency' ? content.common.next : content.common.finish}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}