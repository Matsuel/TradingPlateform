export const LOCALE = "fr-FR"

export const formatPrice = (v: number, currency: string) =>
    new Intl.NumberFormat(LOCALE, { style: "currency", currency }).format(v)

export const formatChange = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "always",
}).format

// Ratio en fraction (0,342) affiché en variation signée (+34,20 %)
export const formatRatio = (ratio: number) => `${formatChange(ratio * 100)} %`

// Taux en fraction (0,3846) affiché sans signe, arrondi à l'unité (38 %)
export const formatRate = new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 0 }).format

// Taux en fraction affiché sans signe, jusqu'à 2 décimales (0,001 → 0,1 % ; 0,1532 → 15,32 %) : formatRate arrondit à l'unité
export const formatPercent = new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 2 }).format

export const formatVolume = new Intl.NumberFormat(LOCALE, {
    notation: "compact", maximumFractionDigits: 2,
}).format

export const formatDate = (d: string | Date) =>
    new Intl.DateTimeFormat(LOCALE, { dateStyle: "short", timeStyle: "short" }).format(new Date(d))
export const formatDay = (d: string | Date) =>
    new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
export const formatDayRange = (start: string | Date, end: string | Date) =>
    `${formatDay(start)} – ${formatDay(end)}`
export const formatMonthTick = (d: string | Date) =>
    new Intl.DateTimeFormat(LOCALE, { month: "short", year: "2-digit" }).format(new Date(d))
export const formatMediumDate = (d: string | Date) =>
    new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(new Date(d))

// Mois moyen du calendrier grégorien, pour convertir des jours calendaires en mois
const DAYS_PER_MONTH = 365.25 / 12

/** Durée en jours calendaires : en jours sous deux mois (« 45 jours »), sinon en mois arrondis (« 14 mois »). */
export const formatDuration = (days: number) =>
    days < 2 * DAYS_PER_MONTH ? `${days} ${days > 1 ? "jours" : "jour"}` : `${Math.round(days / DAYS_PER_MONTH)} mois`
