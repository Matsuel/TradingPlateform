import { ArrowRight, ChartCandlestick, FlaskConical, Wallet } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { routes } from "@/lib/routes"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("home")
    return { title: t("metaTitle"), description: t("metaDescription") }
}

const features = [
    { key: "market", icon: <ChartCandlestick /> },
    { key: "backtests", icon: <FlaskConical /> },
    { key: "portfolio", icon: <Wallet /> },
] as const

export default function HomePage() {
    const t = useTranslations("home")

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-24 md:py-32">
            <section className="flex max-w-2xl flex-col items-center gap-6 text-center">
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">MarketFlow</h1>
                <p className="text-lg text-muted-foreground">{t("intro")}</p>
                <Button
                    size="lg"
                    className="h-11 px-5 text-base"
                    nativeButton={false}
                    render={<Link href={routes.dashboard} />}
                >
                    {t("cta")}
                    <ArrowRight data-icon="inline-end" />
                </Button>
            </section>

            <section className="mt-20 grid w-full max-w-5xl gap-4 md:grid-cols-3">
                {features.map((feature) => (
                    <Card key={feature.key}>
                        <CardHeader>
                            <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted [&_svg]:size-5">
                                {feature.icon}
                            </div>
                            <CardTitle>{t(`features.${feature.key}.title`)}</CardTitle>
                            <CardDescription>{t(`features.${feature.key}.description`)}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </section>

            <p className="mt-16 max-w-xl text-center text-small text-muted-foreground">{t("disclaimer")}</p>
        </main>
    )
}
