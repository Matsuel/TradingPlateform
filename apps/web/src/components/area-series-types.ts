import type { GlossaryKey } from "@/constants/glossary"

/** Un point daté ; une série absente ce jour-là (`null`, `undefined`) n'a pas de point et rien dans l'infobulle. */
// Index élargi à `string` : TypeScript impose que `date` respecte la signature d'index
export type ChartPoint = { date: string; [series: string]: number | string | null | undefined }

export type ChartSeries = {
    key: string // clé de la valeur dans chaque `ChartPoint`
    label: string // nom dans l'infobulle quand il y a plusieurs séries
    color: string // couleur CSS, ex. "var(--chart-1)" ou `trendStyles[trend].color`
    fill?: boolean // aire remplie jusqu'à zéro (une seule série remplie, sinon elles se masquent)
    dashed?: boolean // trait en pointillés, plus fin (série de référence : benchmark)
    hint?: GlossaryKey // aide ouverte par le libellé dans `ChartLegend`
}

/** Série de référence (benchmark, investissement unique) : grise, en pointillés. */
export const referenceSeries = (series: Pick<ChartSeries, "key" | "label" | "hint">): ChartSeries => ({
    ...series,
    color: "var(--muted-foreground)",
    dashed: true,
})

/** Point mis en évidence (ex. la pire valeur) : pastille sur la série `key` à la date `date`, avec son libellé. */
export type ChartMarker = { date: string; key: string; label: string }

export type ChartDateFormat = {
    tick: (date: string) => string // graduations de l'axe X
    tooltip: (date: string) => string // date en tête de l'infobulle
}

export type ChartValueFormat = {
    tooltip: (value: number) => string // valeurs de l'infobulle, ex. montant dans la devise
    axis?: (value: number) => string // axe Y ; par défaut nombre sans unité
}
