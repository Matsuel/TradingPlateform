export const LOCALE = "fr-FR"

export const formatPrice = (v: number, currency: string) =>
    new Intl.NumberFormat(LOCALE, { style: "currency", currency }).format(v)

export const formatChange = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "always",
}).format

// Ratio en fraction (0,342) affiché en variation signée (+34,20 %)
export const formatRatio = (ratio: number) => `${formatChange(ratio * 100)} %`

export const formatNumber = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format

export const formatVolume = new Intl.NumberFormat(LOCALE, {
    notation: "compact", maximumFractionDigits: 2,
}).format

export const formatDate = (d: string | Date) =>
    new Intl.DateTimeFormat(LOCALE, { dateStyle: "short", timeStyle: "short" }).format(new Date(d))
export const formatDay = (d: string | Date) =>
    new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(d))
export const formatDayRange = (start: string | Date, end: string | Date) =>
    `${formatDay(start)} – ${formatDay(end)}`
