export type Trend = "up" | "down" | "neutral"

/**
 * Sens d'une variation pour la colorer : `up` si elle est favorable (hausse, ou baisse quand `higherIsBetter` est faux),
 * `down` sinon, `neutral` à zéro.
 */
export const trendOf = (change: number, higherIsBetter = true): Trend =>
    change === 0 ? "neutral" : change > 0 === higherIsBetter ? "up" : "down"

/** Rendu d'une tendance : couleur CSS (courbes), classe de texte, variant de `Badge`. */
export const trendStyles = {
    up: { color: "var(--success)", text: "text-success", badge: "success" },
    down: { color: "var(--destructive)", text: "text-destructive", badge: "destructive" },
    neutral: { color: "var(--muted-foreground)", text: "", badge: "outline" },
} as const satisfies Record<Trend, { color: string; text: string; badge: "success" | "destructive" | "outline" }>
