import type { Locale } from "@/i18n/config"
import type messages from "../messages/fr.json"

// Clés de traduction et locale typées : `t("clé.absente")` échoue à la compilation
declare module "next-intl" {
    interface AppConfig {
        Locale: Locale
        Messages: typeof messages
    }
}
