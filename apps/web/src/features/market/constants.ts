import type { Period } from "./types"

// Devise d'affichage des cours : Yahoo ne les convertit pas
export const MARKET_CURRENCY = "USD"

// Longueur minimale d'une recherche de symbole
export const MIN_SEARCH_LENGTH = 3

export const periodOptions: { value: Period; label: string; interval: string }[] = [
    { value: "1d", label: "1J", interval: "5 min" },
    { value: "1w", label: "1S", interval: "1 h" },
    { value: "1m", label: "1M", interval: "1 jour" },
    { value: "1y", label: "1A", interval: "1 semaine" },
    { value: "max", label: "Max", interval: "1 mois" },
]
