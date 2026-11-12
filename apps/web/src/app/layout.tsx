import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import { ThemeProvider } from "next-themes"
import { cn } from "@/lib/utils"
import { QueryProvider } from "@/provider/query"
import "./globals.css"

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] })

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("metadata")
    return {
        title: { default: "MarketFlow", template: "%s · MarketFlow" },
        description: t("description"),
    }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang={await getLocale()}
            suppressHydrationWarning
            className={cn("h-full font-sans antialiased", geistSans.variable, geistMono.variable)}
        >
            <body className="flex min-h-full flex-col">
                <NextIntlClientProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <QueryProvider>{children}</QueryProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
