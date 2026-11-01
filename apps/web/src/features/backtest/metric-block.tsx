import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// badge : signal affiché après le libellé (ex. « diffère »)
export type MetricRow = { label: ReactNode; badge?: ReactNode; values: ReactNode[] }

interface MetricBlockProps {
    title: string
    description?: string
    columns: ReactNode[] // un en-tête par colonne de valeurs, dans un ordre fixe
    rows: MetricRow[]
    strong?: number // nombre de premières colonnes en gras, les suivantes en retrait
    rowHeader?: string // en-tête visible de la colonne des libellés ; absent = « Indicateur » pour les lecteurs d'écran
    note?: ReactNode
    className?: string
}

/**
 * Carte d'indicateurs en liste : une ligne par métrique, une colonne de valeurs par série (ex. portefeuille puis benchmark).
 * Les `strong` premières colonnes (une par défaut) sont en gras, les suivantes en retrait. Les valeurs arrivent déjà formatées.
 */
export function MetricBlock({ title, description, columns, rows, strong = 1, rowHeader, note, className }: MetricBlockProps) {
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
                            <th className="pb-2.5 text-left text-small font-medium text-muted-foreground">
                                {rowHeader ?? <span className="sr-only">Indicateur</span>}
                            </th>
                            {columns.map((c, i) => (
                                <th key={i} className="pb-2.5 pl-2 text-right text-small font-medium text-muted-foreground">{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({ label, badge, values }, i) => (
                            // Lignes fixes, jamais réordonnées : l'index suffit comme clé
                            <tr key={i}>
                                <th scope="row" className="py-2.5 text-left font-normal">
                                    {badge ? <span className="flex items-center gap-2">{label}{badge}</span> : label}
                                </th>
                                {values.map((v, j) => (
                                    <td key={j} className={cn("py-2.5 pl-2 text-right whitespace-nowrap", j < strong ? "font-semibold" : "text-muted-foreground")}>
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
