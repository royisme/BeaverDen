// src/components/shared/app-initializer.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/app.store';
import { useUserStore } from '@/stores/user.store';
import { useSessionStore } from '@/stores/session.store';

export function AppInitializer() {
  const navigate = useNavigate();
  // const location = useLocation();
  
  const { isInitializing, error, initializeApp, clearError, isInitialized } = useAppStore();
  // const { loadLocalUser } = useUserStore();
  // const { validateSession } = useSessionStore();
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApp(); // 只调用一次初始化
        console.log("initializeApp is called");
        // 根据 redirectPath 进行导航
        const { redirectPath } = useAppStore.getState();
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        }
      } catch (err) {
        console.error('App initialization failed:', err);
      }
    };
    if (!isInitialized) {
      initialize();
    }
  }, [initializeApp, navigate]);

  // 加载状态
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-xl">
          <AlertTitle>Failed to Load</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => {
                clearError();
                initializeApp();
              }}
              className="mt-4 text-sm font-medium underline hover:text-primary"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 正常情况下不渲染任何内容
  return null;
}