
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useThemeStore } from "@/stores/theme.store"
import { Theme } from "@/types/enums"

const themes: { value: Theme; label: string; }[] = [
  { value: Theme.FRESH, label: "Fresh Green" },
  { value: Theme.NATURAL, label: "Natural Green" },
  { value: Theme.OCEAN, label: "Ocean Blue" },
  { value: Theme.SUNSET, label: "Sunset Orange" },
]

export function ThemeSwitcher() {
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useThemeStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {isDarkMode ? (
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={theme === t.value ? "bg-accent" : ""}
          >
            {t.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={toggleDarkMode}>
          Toggle {isDarkMode ? "Light" : "Dark"} Mode
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}