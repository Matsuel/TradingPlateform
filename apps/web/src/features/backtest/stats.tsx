import { Dash } from "@/components/dash"
import { InfoHint } from "@/components/info-hint"
import { StatCard } from "@/components/stat-card"
import { useFormatters } from "@/lib/format"
import type { BacktestListStats } from "./types"

/** Compteurs et taux de la liste, calculés par le backend ; `stats` undefined pendant le chargement. */
export function BacktestStats({ stats }: { stats: BacktestListStats | undefined }) {
    const { formatRate } = useFormatters()
    const completedRate = stats && formatRate(stats.completedRate)
    const failedRate = stats && formatRate(stats.failedRate)

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Backtests au total" value={stats?.total ?? <Dash />} caption="Depuis la création" />
            <StatCard label="En cours" value={stats?.active ?? <Dash />} caption="Backtests actifs" />
            <StatCard
                label="Terminés"
                value={stats?.completed ?? <Dash />}
                caption={
                    <InfoHint entry="completedRate" value={completedRate}>
                        Taux de réussite
                    </InfoHint>
                }
                delta={completedRate}
                trend="up"
            />
            <StatCard
                label="Échoués"
                value={stats?.failed ?? <Dash />}
                caption={
                    <InfoHint entry="failedRate" value={failedRate}>
                        Runs en erreur
                    </InfoHint>
                }
                delta={failedRate}
                trend="down"
            />
        </div>
    )
}
