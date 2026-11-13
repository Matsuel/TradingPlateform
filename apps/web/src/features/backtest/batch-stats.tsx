import { useTranslations } from "next-intl"
import { Dash } from "@/components/dash"
import { InfoHint } from "@/components/info-hint"
import { StatCard } from "@/components/stat-card"
import { useFormatters } from "@/lib/format"
import type { BacktestBatch } from "./types"

/**
 * Quatre cartes de synthèse d'un lot (maquette 32) : CAGR médian, pire départ, pire fenêtre de 3 ans, part de fenêtres
 * négatives. Valeurs de `summary` telles que reçues ; tirets tant qu'aucun départ n'est terminé.
 */
export function BatchStats({ batch }: { batch: BacktestBatch }) {
    const f = useFormatters()
    const t = useTranslations("backtest.batch.stats")
    const { summary, rows, endDate } = batch
    const window = summary?.window

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                label={<InfoHint entry="medianCagr">{t("medianCagr")}</InfoHint>}
                value={summary?.medianCagr == null ? <Dash /> : f.formatPercent(summary.medianCagr)}
                delta={t("starts", { count: rows.length })}
                caption={
                    summary?.cagrSpread == null
                        ? undefined
                        : t("spread", { value: f.formatSharpe(summary.cagrSpread * 100) })
                }
            />
            <StatCard
                label={<InfoHint entry="worstStart">{t("worstStart")}</InfoHint>}
                value={summary?.worstStart ? f.formatPercent(summary.worstStart.cagr) : <Dash />}
                delta={summary?.worstStart && new Date(summary.worstStart.startDate).getFullYear()}
                trend="down"
                caption={
                    summary?.worstStart &&
                    t("worstStartPeriod", { from: f.formatDay(summary.worstStart.startDate), to: f.formatDay(endDate) })
                }
            />
            <StatCard
                label={<InfoHint entry="worstWindow">{t("worstWindow", { years: window?.years ?? 3 })}</InfoHint>}
                value={window ? f.formatPercent(window.worst) : <Dash />}
                delta={window && t("perYear")}
                trend="down"
                caption={window && t("entry", { date: f.formatDay(window.worstDate) })}
            />
            <StatCard
                label={<InfoHint entry="negativeWindows">{t("negativeWindows")}</InfoHint>}
                value={window ? f.formatRate(window.negativeShare) : <Dash />}
                delta={window && t("years", { count: window.years })}
                caption={window && t("windowCount", { count: window.count })}
            />
        </div>
    )
}
