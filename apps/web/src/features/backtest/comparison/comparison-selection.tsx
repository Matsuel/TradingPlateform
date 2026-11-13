"use client"

import { useTranslations } from "next-intl"
import { OptionSelect, type SelectOption } from "@/components/option-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { COMPARABLE_LIMIT, comparisonSideColors } from "../constants"
import { useBacktests } from "../hook"

function BacktestSelect({
    id,
    label,
    dotClassName,
    value,
    options,
    onChange,
}: {
    id: string
    label: string
    dotClassName: string
    value: string
    options: SelectOption[]
    onChange: (value: string) => void
}) {
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Label htmlFor={id} className="gap-1.5">
                <span className={cn("size-2 rounded-full", dotClassName)} />
                {label}
            </Label>
            <OptionSelect id={id} value={value} options={options} onChange={onChange} />
        </div>
    )
}

/**
 * Carte de sélection de la comparaison (maquette 14) : backtests A et B parmi ceux de l'utilisateur qui ont un résultat
 * terminé, même relancés depuis (les `COMPARABLE_LIMIT` plus récents), et « Échanger ». Un backtest choisi d'un côté n'est pas proposé de l'autre.
 * `a`, `b` : ids, `""` si non choisi ; `onChange` reçoit la nouvelle paire.
 */
export function ComparisonSelection({
    a,
    b,
    onChange,
}: {
    a: string
    b: string
    onChange: (a: string, b: string) => void
}) {
    const t = useTranslations("backtest.compare.selection")
    const { data } = useBacktests({ page: 1, pageSize: COMPARABLE_LIMIT, status: [], hasResult: true })
    const options = (data?.data ?? []).map((t) => ({
        value: t.id,
        label: `${t.name} · ${t.allocations.map((x) => x.symbol).join(" / ")}`,
    }))

    return (
        <Card>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <BacktestSelect
                        id="backtest-a"
                        label={t("a")}
                        dotClassName={comparisonSideColors.a.className}
                        value={a}
                        options={options.filter((o) => o.value !== b)}
                        onChange={(v) => onChange(v, b)}
                    />
                    <Button variant="ghost" onClick={() => onChange(b, a)} disabled={!a && !b}>
                        {t("swap")}
                    </Button>
                    <BacktestSelect
                        id="backtest-b"
                        label={t("b")}
                        dotClassName={comparisonSideColors.b.className}
                        value={b}
                        options={options.filter((o) => o.value !== a)}
                        onChange={(v) => onChange(a, v)}
                    />
                </div>
                <p className="text-small text-muted-foreground">{t("hint")}</p>
            </CardContent>
        </Card>
    )
}
