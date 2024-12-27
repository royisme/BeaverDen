import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapleIcon } from '@/components/icons/maple-leaf'

export default function LandingPage() {
  const navigate = useNavigate()
  const handleCreateAccount = () => {
    // 添加 console.log 来调试导航
    console.log('Navigating to onboarding...');
    navigate('/onboarding');
  };
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
      <div className="w-full max-w-[420px] px-4">
        {/* Logo and App Name */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <MapleIcon className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Beaveden</h1>
          <p className="text-lg text-muted-foreground">
            Your Finance Partner in Canada
          </p>
        </div>

        {/* Main Actions */}
        <Card className="p-6 shadow-lg bg-card/50 backdrop-blur-sm">
          <div className="space-y-4">
            <Button 
              className="w-full h-12 text-lg"
              onClick={handleCreateAccount}
            >
              Create Account
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-lg"
              onClick={() => navigate('/login', { replace: false })}
            >
              Sign In
            </Button>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your data stays secure with local-first storage
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl" />
      </div>
    </div>
  )
}