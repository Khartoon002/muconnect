"use client"

import { SessionProvider } from "next-auth/react"
import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "system",
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeCtx)
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => {
    const stored = localStorage.getItem("mconnect-theme") as Theme | null
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const apply = (dark: boolean) => root.classList.toggle("dark", dark)

    if (theme === "dark") {
      apply(true)
    } else if (theme === "light") {
      apply(false)
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      apply(mq.matches)
      const handler = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
    localStorage.setItem("mconnect-theme", theme)
  }, [theme])

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  )
}
