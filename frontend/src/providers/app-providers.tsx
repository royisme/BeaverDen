import { ThemeProvider } from "@/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PropsWithChildren } from "react"

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}