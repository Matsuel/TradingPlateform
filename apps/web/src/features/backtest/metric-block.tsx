import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type MetricRow = { label: string; values: ReactNode[] }

interface MetricBlockProps {
    title: string
    description?: string
    columns: string[] // un en-tête par colonne de valeurs ; la première est mise en avant
    rows: MetricRow[]
    note?: ReactNode
    className?: string
}

/**
 * Carte d'indicateurs en liste : une ligne par métrique, une colonne de valeurs par série (ex. portefeuille puis benchmark).
 * La première colonne est en gras, les suivantes en retrait. Les valeurs arrivent déjà formatées.
 */
export function MetricBlock({ title, description, columns, rows, note, className }: MetricBlockProps) {
    return (
        <Card className={cn("gap-4", className)}>
            <CardHeader>
                <CardTitle className="text-body-semibold">{title}</CardTitle>
                {description && <CardDescription className="text-small">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="pb-2.5 text-left font-normal"><span className="sr-only">Indicateur</span></th>
                            {columns.map((c) => (
                                <th key={c} className="pb-2.5 pl-2 text-right text-small font-medium text-muted-foreground">{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({ label, values }) => (
                            <tr key={label}>
                                <th scope="row" className="py-2.5 text-left font-normal">{label}</th>
                                {values.map((v, i) => (
                                    <td key={columns[i]} className={cn("py-2.5 pl-2 text-right whitespace-nowrap", i === 0 ? "font-semibold" : "text-muted-foreground")}>
                                        {v}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {note && <p className="mt-3 text-small text-muted-foreground">{note}</p>}
            </CardContent>
        </Card>
    )
}
