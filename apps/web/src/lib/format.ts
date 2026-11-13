import { useLocale } from "next-intl"

// Mois moyen du calendrier grégorien, pour convertir des jours calendaires en mois
const DAYS_PER_MONTH = 365.25 / 12

function createFormatters(locale: string) {
    const number = (options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options).format
    const date = (options: Intl.DateTimeFormatOptions) => {
        const format = new Intl.DateTimeFormat(locale, options)
        return (d: string | Date) => format.format(new Date(d))
    }
    const currencies = new Map<string, Intl.NumberFormat>()
    const currencyFormat = (currency: string) => {
        const format = currencies.get(currency) ?? new Intl.NumberFormat(locale, { style: "currency", currency })
        currencies.set(currency, format)
        return format
    }

    const formatDay = date({ day: "2-digit", month: "2-digit", year: "numeric" })
    const formatDays = number({ style: "unit", unit: "day", unitDisplay: "long" })
    const formatYears = number({ style: "unit", unit: "year", unitDisplay: "long", maximumFractionDigits: 1 })
    const formatMonths = number({ style: "unit", unit: "month", unitDisplay: "long", maximumFractionDigits: 0 })

    return {
        /** Langue active, pour un formatter propre à un seul composant (`new Intl.NumberFormat(locale, …)`). */
        locale,
        /** Montant dans la devise de la donnée : seul le format suit la langue (`1 234,50 €`, `€1,234.50`). */
        formatPrice: (v: number, currency: string) => currencyFormat(currency).format(v),
        /** Nombre signé à 2 décimales, sans unité (`+1,25`). */
        formatChange: number({ minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "always" }),
        /** Ratio en fraction (0,342) affiché en variation signée (`+34,20 %`). */
        formatRatio: number({
            style: "percent",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            signDisplay: "always",
        }),
        /** Taux en fraction (0,3846) affiché sans signe, arrondi à l'unité (`38 %`). */
        formatRate: number({ style: "percent", maximumFractionDigits: 0 }),
        /** Taux en fraction affiché sans signe, jusqu'à 2 décimales (0,001 → `0,1 %` ; 0,1532 → `15,32 %`). */
        formatPercent: number({ style: "percent", maximumFractionDigits: 2 }),
        /** Ratio de Sharpe, sans unité, 2 décimales (`1,25`). */
        formatSharpe: number({ minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        /** Quantité de titres, fractionnaires inclus (DCA) : jusqu'à 6 décimales. */
        formatQuantity: number({ maximumFractionDigits: 6 }),
        formatVolume: number({ notation: "compact", maximumFractionDigits: 2 }),
        formatDate: date({ dateStyle: "short", timeStyle: "short" }),
        formatDay,
        formatDayRange: (start: string | Date, end: string | Date) => `${formatDay(start)} – ${formatDay(end)}`,
        formatMonthTick: date({ month: "short", year: "2-digit" }),
        formatMediumDate: date({ dateStyle: "medium" }),
        /** Durée en jours calendaires : en jours sous deux mois (« 45 jours »), sinon en mois arrondis (« 14 mois »). */
        formatDuration: (days: number) =>
            days < 2 * DAYS_PER_MONTH ? formatDays(days) : formatMonths(days / DAYS_PER_MONTH),
        /** Durée en années, 1 décimale au plus (`10,5 ans`). */
        formatYears,
        /** Symbole d'une devise ISO pour un libellé : `currencySymbol("EUR")` → « € ». */
        currencySymbol: (currency: string) =>
            currencyFormat(currency)
                .formatToParts(0)
                .find((p) => p.type === "currency")?.value ?? currency,
    }
}

export type Formatters = ReturnType<typeof createFormatters>

// Un jeu de formatters par langue : les `Intl.*Format` sont coûteux à construire
const formattersByLocale = new Map<string, Formatters>()

/**
 * Formatters de nombres, devises et dates dans la langue active (cookie `locale`). Un helper hors composant les reçoit
 * en premier argument (`formatAmount(f, v)`).
 */
export function useFormatters(): Formatters {
    const locale = useLocale()
    const formatters = formattersByLocale.get(locale) ?? createFormatters(locale)
    formattersByLocale.set(locale, formatters)
    return formatters
}
