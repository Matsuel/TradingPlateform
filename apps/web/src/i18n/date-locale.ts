import { enUS, fr } from "date-fns/locale"
import type { Locale } from "./config"

// Locale date-fns de chaque langue de l'interface (calendrier du `DateField`)
export const dateFnsLocales: Record<Locale, typeof fr> = { fr, en: enUS }
