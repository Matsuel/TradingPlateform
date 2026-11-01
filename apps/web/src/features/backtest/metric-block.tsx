import type { ReactNode } from "react"
import { type HintDetail, InfoHint } from "@/components/info-hint"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GlossaryKey } from "@/constants/glossary"
import { cn } from "@/lib/utils"

// En-tête d'une colonne de valeurs ; `hint` : entrée du glossaire ouverte par l'en-tête (ex. « Écart »)
export type MetricColumn = { label: string; hint?: GlossaryKey }

// hint : entrée du glossaire ouverte par le libellé ; details : lignes ajoutées au panneau après les valeurs des colonnes ;
// badge : signal affiché après le libellé (ex. « diffère »)
export type MetricRow = {
    label: string
    hint?: GlossaryKey
    details?: HintDetail[]
    badge?: ReactNode
    values: ReactNode[]
}

const headClassName = "pb-2.5 text-small font-medium text-muted-foreground"

// Une ligne : libellé (avec son aide, qui rappelle la valeur de chaque colonne puis `details`), badge, valeurs
function MetricBlockRow({
    row,
    columns,
    boldColumns,
}: {
    row: MetricRow
    columns: MetricColumn[]
    boldColumns: number
}) {
    const { label, hint, details = [], badge, values } = row
    const shown = [...columns.map((c, i) => ({ label: c.label, value: values[i] })), ...details]

    return (
        <tr>
            <th scope="row" className="py-2.5 text-left font-normal">
                <span className="flex items-center gap-2">
                    <InfoHint entry={hint} details={shown}>
                        {label}
                    </InfoHint>
                    {badge}
                </span>
            </th>
            {values.map((value, i) => (
                <td
                    key={columns[i].label}
                    className={cn(
                        "py-2.5 pl-2 text-right whitespace-nowrap",
                        i < boldColumns ? "font-semibold" : "text-muted-foreground",
                    )}
                >
                    {value}
                </td>
            ))}
        </tr>
    )
}

interface MetricBlockProps {
    title: string
    description?: string
    columns: MetricColumn[] // un en-tête par colonne de valeurs
    rows: MetricRow[]
    boldColumns?: number // nombre de premières colonnes en gras, les suivantes en retrait
    rowHeader?: string // en-tête visible de la colonne des libellés ; absent = « Indicateur » pour les lecteurs d'écran
    note?: ReactNode
}

/**
 * Carte d'indicateurs en liste : une ligne par métrique, une colonne de valeurs par série (ex. portefeuille puis benchmark).
 * Les `boldColumns` premières colonnes (une par défaut) sont en gras, les suivantes en retrait. Les valeurs arrivent déjà
 * formatées.
 */
export function MetricBlock({ title, description, columns, rows, boldColumns = 1, rowHeader, note }: MetricBlockProps) {
    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">{title}</CardTitle>
                {description && <CardDescription className="text-small">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={cn(headClassName, "text-left")}>
                                {rowHeader ?? <span className="sr-only">Indicateur</span>}
                            </th>
                            {columns.map((c) => (
                                <th key={c.label} className={cn(headClassName, "pl-2 text-right")}>
                                    <InfoHint entry={c.hint}>{c.label}</InfoHint>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <MetricBlockRow key={row.label} row={row} columns={columns} boldColumns={boldColumns} />
                        ))}
                    </tbody>
                </table>
                {note && <p className="mt-3 text-small text-muted-foreground">{note}</p>}
            </CardContent>
        </Card>
    )
}
