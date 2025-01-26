// src/components/shared/app-initializer.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useUserStore } from '@/stores/user.store';

export function AppInitializer() {
  const navigate = useNavigate();
  const { currentUser, isLoading, error, loadLocalUser } = useUserStore();

  // 只在组件挂载时加载一次用户数据
  useEffect(() => {
    console.log('[AppInitializer] Loading user data');
    loadLocalUser().catch(err => {
      console.error('[AppInitializer] Failed to load user:', err);
    });
  }, []); // 空依赖数组，只在组件挂载时运行

  // 监听用户状态变化，处理导航
  useEffect(() => {
    if (!isLoading) {
      console.log('[AppInitializer] User state updated, currentUser:', currentUser);
      if (currentUser) {
        navigate('/dashboard');
      } else {
        navigate('/landing');
      }
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return null;
}