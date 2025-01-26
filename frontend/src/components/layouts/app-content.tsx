import { Outlet } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';
import { Header } from './app-header';
import { menuGroups } from '@/mock/menuData';
import { useUserStore } from '@/stores/user.store';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppContent() {
  const { currentUser } = useUserStore();

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
