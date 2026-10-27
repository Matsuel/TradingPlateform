// lib/format.ts
const fr = "fr-FR"

export const formatPrice = (v: number, currency = "USD") =>
    new Intl.NumberFormat(fr, { style: "currency", currency }).format(v)

export const formatChange = new Intl.NumberFormat(fr, {
    minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "always",
}).format

export const formatVolume = new Intl.NumberFormat(fr, {
    notation: "compact", maximumFractionDigits: 2,
}).format

export const formatDate = (d: string | Date) =>
    new Intl.DateTimeFormat(fr, { dateStyle: "short", timeStyle: "short" }).format(new Date(d))
export const formatDay = (d: string | Date) =>
    new Intl.DateTimeFormat(fr, { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(d))
