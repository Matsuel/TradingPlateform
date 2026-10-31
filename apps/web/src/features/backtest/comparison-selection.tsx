"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { COMPARABLE_LIMIT, comparisonSideColors } from "./constants"
import { useBacktests } from "./hook"

const PLACEHOLDER = "Sélectionner…"

type Option = { value: string; label: string }

function BacktestSelect({ id, label, dotClassName, value, options, onChange }: {
    id: string
    label: string
    dotClassName: string
    value: string
    options: Option[]
    onChange: (value: string) => void
}) {
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor={id} className="flex items-center gap-1.5 text-small font-medium">
                <span className={cn("size-2 rounded-full", dotClassName)} />
                {label}
            </label>
            <Select value={value || null} onValueChange={(v) => onChange(v ?? "")}>
                <SelectTrigger id={id} className="w-full">
                    <SelectValue placeholder={PLACEHOLDER}>
                        {(v: string | null) => options.find((o) => o.value === v)?.label ?? PLACEHOLDER}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                            {o.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

/**
 * Carte de sélection de la comparaison (maquette 19 v2) : backtests A et B parmi ceux de l'utilisateur qui ont un résultat
 * terminé, même relancés depuis (les `COMPARABLE_LIMIT` plus récents), et « Échanger ». Un backtest choisi d'un côté n'est pas proposé de l'autre.
 * `a`, `b` : ids, `""` si non choisi ; `onChange` reçoit la nouvelle paire.
 */
export function ComparisonSelection({ a, b, onChange }: { a: string; b: string; onChange: (a: string, b: string) => void }) {
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
                        label="Backtest A"
                        dotClassName={comparisonSideColors.a.className}
                        value={a}
                        options={options.filter((o) => o.value !== b)}
                        onChange={(v) => onChange(v, b)}
                    />
                    <Button variant="ghost" onClick={() => onChange(b, a)} disabled={!a && !b}>Échanger</Button>
                    <BacktestSelect
                        id="backtest-b"
                        label="Backtest B"
                        dotClassName={comparisonSideColors.b.className}
                        value={b}
                        options={options.filter((o) => o.value !== a)}
                        onChange={(v) => onChange(a, v)}
                    />
                </div>
                <p className="text-small text-muted-foreground">
                    Seuls vos backtests terminés sont proposés. Le lien de la page garde la sélection.
                </p>
            </CardContent>
        </Card>
    )
}
