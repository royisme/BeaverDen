// components/layout/app-header.tsx
import React from 'react'
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BreadcrumbNav } from "@/components/layouts/app-breadcrumb-nav"
import { useNavigationStore } from '@/stores/navigationStore'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const breadcrumbs = useNavigationStore((state) => state.breadcrumbs)

  return (
    <header className="flex h-16 shrink-0 items-center border-b">
      <div className="flex items-center gap-2 px-3">
        {/* <SidebarTrigger /> */}
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <div className="ml-auto flex items-center gap-4 px-4">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
