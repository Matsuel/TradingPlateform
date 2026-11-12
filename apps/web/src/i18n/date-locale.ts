import type { Locale as DateFnsLocale } from "date-fns"
import { enUS, fr } from "date-fns/locale"
import type { Locale } from "./config"

// Locale date-fns de chaque langue de l'interface (calendrier du `DateField`)
export const dateFnsLocales: Record<Locale, DateFnsLocale> = { fr, en: enUS }
