import type { ChartSeries } from "@/components/area-series-chart"
import { InfoHint } from "@/components/info-hint"

/** Légende d'un graphique (maquette 15.1) : un trait de la couleur de chaque série (pointillé si `dashed`), son libellé et son aide. */
export function ChartLegend({ series }: { series: ChartSeries[] }) {
    return (
        <ul className="flex flex-wrap items-center gap-4 text-small text-muted-foreground">
            {series.map((s) => (
                <li key={s.key} className="flex items-center gap-1.5">
                    <span
                        aria-hidden
                        className={s.dashed ? "w-3 border-t-2 border-dashed" : "h-0.5 w-3 rounded-xs"}
                        style={s.dashed ? { borderColor: s.color } : { backgroundColor: s.color }}
                    />
                    <InfoHint entry={s.hint}>{s.label}</InfoHint>
                </li>
            ))}
        </ul>
    )
}
