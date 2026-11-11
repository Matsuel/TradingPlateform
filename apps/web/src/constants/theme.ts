// Valeurs de next-themes, aussi clés des libellés (`theme.<valeur>` dans les dictionnaires)
export const themes = ["light", "dark", "system"] as const

export type Theme = (typeof themes)[number]
