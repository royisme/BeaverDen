import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';
import { Header } from './app-header';
import { useUserStore } from '@/stores/user.store';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { fetchMenuGroups } from '@/api/menu.api';
import { Loader2 } from 'lucide-react';

export function AppContent() {
  const { currentUser } = useUserStore();
  const [menuGroups, setMenuGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);
        const data = await fetchMenuGroups();
        setMenuGroups(data);
      } catch (error) {
        console.error('Failed to load menus:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <div className="flex-shrink-0">
          {currentUser && (
            <AppSidebar
              menuGroups={menuGroups}
              user={currentUser}
            />
          )}
        </div>
        <div className="flex-1 flex flex-col min-h-0 w-0">
          <SidebarInset className="flex-1 flex flex-col min-h-0">
            <Header
              title={`Good morning, ${currentUser?.username || 'Guest'}`}
              subtitle="Welcome back"
            />
            <main className="flex-1 overflow-auto">
              <div className="h-full">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
