// components/layout/app-breadcrumb-nav.tsx
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem as BItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItem {
  title: string
  path?: string
  isActive?: boolean
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          if (isLast || !item.path) {
            return (
              <BItem key={item.title}>
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              </BItem>
            )
          }

          return (
            <BItem key={item.title}>
              <BreadcrumbLink href={item.path}>
                {item.title}
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </BItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
