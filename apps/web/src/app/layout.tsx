import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { cn } from "@/lib/utils"
import { QueryProvider } from "@/provider/query"
import "./globals.css"

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] })

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
    title: { default: "MarketFlow", template: "%s · MarketFlow" },
    description: "Laboratoire de portefeuille simulé : backtests, risque et optimisation, sans argent réel.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="fr" suppressHydrationWarning className={cn("h-full font-sans antialiased", geistSans.variable, geistMono.variable)}>
            <body className="flex min-h-full flex-col">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <QueryProvider>{children}</QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
