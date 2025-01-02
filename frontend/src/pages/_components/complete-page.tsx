// src/pages/_components/complete-page.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUserStore } from '@/stores/user.store'
import { CheckCircle2, Loader2 } from 'lucide-react'

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
  const { registrationState } = useUserStore();

  const getHeaderContent = () => {
    switch (registrationState.status) {
      case 'registering':
        return {
          title: 'Creating Your Account',
          description: 'Please wait while we set up your account...'
        };
      case 'success':
        return {
          title: 'Account Created Successfully',
          description: 'Your account is ready to use!'
        };
      case 'error':
        return {
          title: 'Registration Failed',
          description: 'There was a problem creating your account.'
        };
      default:
        return {
          title: 'Review & Complete',
          description: 'Ready to create your account?'
        };
    }
  };

  const { title, description } = getHeaderContent();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {registrationState.status === 'registering' && (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p>Setting up your account...</p>
          </div>
        )}

        {registrationState.status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              {registrationState.error || 'Failed to create account'}
            </AlertDescription>
          </Alert>
        )}

        {registrationState.status === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <p>Your account has been created successfully!</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {registrationState.status === 'idle' && (
            <>
              <Button
                variant="outline"
                onClick={onBack}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={onExit}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
        
        {registrationState.status === 'idle' && (
          <Button onClick={onFinish}>
            Create Account
          </Button>
        )}

        {registrationState.status === 'success' && (
          <Button onClick={onFinish} className="w-full">
            Continue to Dashboard
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}