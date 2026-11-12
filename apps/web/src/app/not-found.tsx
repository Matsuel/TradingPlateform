import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"

export default function NotFoundPage() {
    const t = useTranslations("notFound")

    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-[112px] font-bold text-border">404</h1>
                <h2 className="text-h2">{t("title")}</h2>
                <p className="text-body text-muted-foreground">{t("description")}</p>
                <div className="flex flex-row gap-3">
                    <Button size="lg" nativeButton={false} render={<Link href={routes.dashboard} />}>
                        {t("backToDashboard")}
                    </Button>
                    <Button size="lg" variant="outline" nativeButton={false} render={<Link href={routes.market} />}>
                        {t("viewMarket")}
                    </Button>
                </div>
            </div>
        </div>
    )
}
