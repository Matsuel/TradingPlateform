export const LOCALES = ["fr", "en"] as const

export type Locale = (typeof LOCALES)[number]

// Nom de chaque langue dans sa propre langue : affiché tel quel, quelle que soit la langue active
export const LOCALE_LABELS: Record<Locale, string> = { fr: "Français", en: "English" }

export const DEFAULT_LOCALE: Locale = "fr"

// Préférence d'affichage portée par un cookie : aucune route n'est préfixée par la langue
export const LOCALE_COOKIE = "locale"
