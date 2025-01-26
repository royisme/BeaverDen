// components/layout/app-header.tsx
import React from 'react'
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { BreadcrumbNav } from "@/components/layouts/app-breadcrumb-nav"
import { useNavigationStore } from '@/stores/navigationStore'
import { ThemeSwitcher } from '@/components/shared/theme-switcher'
import { LanguageSwitcher } from '@/components/shared/language-switcher'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const breadcrumbs = useNavigationStore((state) => state.breadcrumbs)

  return (
    <header className="flex px-2 py-4 bg-secondary border-b-2 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-6 mt-4  py-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      <div className="ml-auto flex items-center gap-4 px-6 mt-4">

        <LanguageSwitcher />
        <ThemeSwitcher />

      </div>
    </header>
  )
}
