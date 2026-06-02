import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { Providers } from "./providers"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "M-Connect", template: "%s | M-Connect" },
  description: "University student portal — courses, results, fees, and more",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
}

const themeScript = `
try {
  const t = localStorage.getItem('mconnect-theme');
  const dark = t === 'dark' || (!t || t === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
} catch(e) {}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
