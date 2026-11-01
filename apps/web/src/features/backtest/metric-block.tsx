import type { ReactNode } from "react"
import { type HintDetail, InfoHint } from "@/components/info-hint"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GlossaryKey } from "@/constants/glossary"
import { cn } from "@/lib/utils"

// hint : entrée du glossaire ouverte par le libellé ; details : lignes ajoutées au panneau après les valeurs des colonnes ;
// badge : signal affiché après le libellé (ex. « diffère »)
export type MetricRow = {
    label: string
    hint?: GlossaryKey
    details?: HintDetail[]
    badge?: ReactNode
    values: ReactNode[]
}

interface MetricBlockProps {
    title: string
    description?: string
    columns: string[] // un en-tête par colonne de valeurs
    columnHints?: Partial<Record<string, GlossaryKey>> // entrée du glossaire d'un en-tête, par libellé (ex. « Écart »)
    rows: MetricRow[]
    strong?: number // nombre de premières colonnes en gras, les suivantes en retrait
    rowHeader?: string // en-tête visible de la colonne des libellés ; absent = « Indicateur » pour les lecteurs d'écran
    note?: ReactNode
    className?: string
}

/**
 * Carte d'indicateurs en liste : une ligne par métrique, une colonne de valeurs par série (ex. portefeuille puis benchmark).
 * Les `strong` premières colonnes (une par défaut) sont en gras, les suivantes en retrait. Les valeurs arrivent déjà formatées.
 * Une ligne à `hint` a un libellé `InfoHint` dont le panneau rappelle la valeur de chaque colonne puis ses `details`.
 */
export function MetricBlock({
    title,
    description,
    columns,
    columnHints = {},
    rows,
    strong = 1,
    rowHeader,
    note,
    className,
}: MetricBlockProps) {
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
                            {columns.map((c) => (
                                <th
                                    key={c}
                                    className="pb-2.5 pl-2 text-right text-small font-medium text-muted-foreground"
                                >
                                    <InfoHint entry={columnHints[c]}>{c}</InfoHint>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({ label, hint, details = [], badge, values }) => {
                            // Panneau d'aide : la valeur de chaque colonne, puis les détails propres à la ligne
                            const hinted = (
                                <InfoHint
                                    entry={hint}
                                    details={[...columns.map((c, i) => ({ label: c, value: values[i] })), ...details]}
                                >
                                    {label}
                                </InfoHint>
                            )
                            return (
                                <tr key={label}>
                                    <th scope="row" className="py-2.5 text-left font-normal">
                                        {badge ? (
                                            <span className="flex items-center gap-2">
                                                {hinted}
                                                {badge}
                                            </span>
                                        ) : (
                                            hinted
                                        )}
                                    </th>
                                    {values.map((v, i) => (
                                        <td
                                            key={columns[i]}
                                            className={cn(
                                                "py-2.5 pl-2 text-right whitespace-nowrap",
                                                i < strong ? "font-semibold" : "text-muted-foreground",
                                            )}
                                        >
                                            {v}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {note && <p className="mt-3 text-small text-muted-foreground">{note}</p>}
            </CardContent>
        </Card>
    )
}
