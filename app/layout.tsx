import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RECOIL AI — Roblox Development Intelligence Platform",
  description:
    "AI-powered coding assistant, debugger, and mentor built specifically for Roblox developers. Generate Luau scripts, fix bugs, learn best practices.",
  keywords: [
    "Roblox",
    "AI",
    "Luau",
    "Lua",
    "coding assistant",
    "game development",
    "scripting",
  ],
  openGraph: {
    title: "RECOIL AI — Roblox Development Intelligence Platform",
    description:
      "AI-powered coding assistant built specifically for Roblox developers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
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
