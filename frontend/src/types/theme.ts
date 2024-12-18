import { Theme } from "./enums"

export interface ThemeColors {
  primary: string
  secondary: string
  accent1: string
  accent2: string
  accent3: string
}

export interface ThemeConfig {
  name: Theme
  colors: ThemeColors
}

export interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleDarkMode: () => void
  isDarkMode: boolean
}