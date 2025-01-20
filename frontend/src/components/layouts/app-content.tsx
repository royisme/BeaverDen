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
      {currentUser && (
        <AppSidebar 
          menuGroups={menuGroups}
          user={currentUser}
        />
      )}
      <SidebarInset>
        <Header 
          title={`Good morning, ${currentUser?.username || 'Guest'}`} 
          subtitle="Welcome back" 
        />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
