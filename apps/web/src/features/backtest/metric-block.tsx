import type { ReactNode } from "react"
import { type HintDetail, InfoHint } from "@/components/info-hint"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { GlossaryKey } from "@/constants/glossary"

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
        <TableRow variant="plain">
            <TableHead scope="row" variant="row" className="px-0 py-2.5">
                <span className="flex items-center gap-2">
                    <InfoHint entry={hint} details={shown}>
                        {label}
                    </InfoHint>
                    {badge}
                </span>
            </TableHead>
            {values.map((value, i) => (
                <TableCell
                    key={columns[i].label}
                    variant={i < boldColumns ? "strong" : "muted"}
                    className="py-2.5 pr-0 pl-2 text-right"
                >
                    {value}
                </TableCell>
            ))}
        </TableRow>
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
        <Card size="compact">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow variant="static">
                            <TableHead variant="caption" className="px-0 pb-2.5">
                                {rowHeader ?? <span className="sr-only">Indicateur</span>}
                            </TableHead>
                            {columns.map((c) => (
                                <TableHead key={c.label} variant="caption" className="pr-0 pb-2.5 pl-2 text-right">
                                    <InfoHint entry={c.hint}>{c.label}</InfoHint>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <MetricBlockRow key={row.label} row={row} columns={columns} boldColumns={boldColumns} />
                        ))}
                    </TableBody>
                </Table>
                {note && <p className="mt-3 text-small text-muted-foreground">{note}</p>}
            </CardContent>
        </Card>
    )
}
