import { useTranslations } from "next-intl"
import { Dash } from "@/components/dash"
import { InfoHint } from "@/components/info-hint"
import { StatCard } from "@/components/stat-card"
import { useFormatters } from "@/lib/format"
import type { BacktestListStats } from "./types"

/** Compteurs et taux de la liste, calculés par le backend ; `stats` undefined pendant le chargement. */
export function BacktestStats({ stats }: { stats: BacktestListStats | undefined }) {
    const { formatRate } = useFormatters()
    const t = useTranslations("backtest.stats")
    const completedRate = stats && formatRate(stats.completedRate)
    const failedRate = stats && formatRate(stats.failedRate)

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label={t("total")} value={stats?.total ?? <Dash />} caption={t("sinceCreation")} />
            <StatCard label={t("active")} value={stats?.active ?? <Dash />} caption={t("activeCaption")} />
            <StatCard
                label={t("completed")}
                value={stats?.completed ?? <Dash />}
                caption={
                    <InfoHint entry="completedRate" value={completedRate}>
                        {t("successRate")}
                    </InfoHint>
                }
                delta={completedRate}
                trend="up"
            />
            <StatCard
                label={t("failed")}
                value={stats?.failed ?? <Dash />}
                caption={
                    <InfoHint entry="failedRate" value={failedRate}>
                        {t("failedRuns")}
                    </InfoHint>
                }
                delta={failedRate}
                trend="down"
            />
        </div>
    )
}
