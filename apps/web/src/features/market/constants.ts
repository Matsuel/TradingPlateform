import type { Period } from "./types"

// Devise d'affichage des cours : Yahoo ne les convertit pas
export const MARKET_CURRENCY = "USD"

// Longueur minimale d'une recherche de symbole
export const MIN_SEARCH_LENGTH = 3

// Périodes du graphique, dans l'ordre des onglets ; libellé `market.periods.<période>`, pas des points `market.intervals.<période>`
export const periods = ["1d", "1w", "1m", "1y", "max"] as const satisfies readonly Period[]
