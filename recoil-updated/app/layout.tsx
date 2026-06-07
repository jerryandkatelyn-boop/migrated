import type { Metadata } from "next";
import { Exo_2, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { Toaster } from "@/components/ui/sonner";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RECOIL AI — Roblox Development Intelligence Platform",
  description:
    "AI-powered coding assistant, debugger, and mentor built specifically for Roblox developers. Generate Luau scripts, fix bugs, learn best practices.",
  keywords: ["Roblox", "AI", "Luau", "Lua", "coding assistant", "game development", "scripting"],
  openGraph: {
    title: "RECOIL AI — Roblox Development Intelligence Platform",
    description: "AI-powered coding assistant built specifically for Roblox developers.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${exo2.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
          storageKey="recoil-theme"
        >
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
