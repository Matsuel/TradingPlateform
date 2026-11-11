import { cookies } from "next/headers"
import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "./config"

// Langue de la requête : cookie `locale` s'il désigne une langue connue, sinon la langue par défaut
export default getRequestConfig(async () => {
    const requested = (await cookies()).get(LOCALE_COOKIE)?.value
    const locale = hasLocale(LOCALES, requested) ? requested : DEFAULT_LOCALE

    return { locale, messages: (await import(`../../messages/${locale}.json`)).default }
})
