"use server"

import { cookies } from "next/headers"
import { hasLocale } from "next-intl"
import { LOCALE_COOKIE, LOCALES } from "./config"

// Durée du cookie de langue, en secondes (un an)
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** Enregistre la langue dans le cookie `locale` ; Next rend alors la page courante dans cette langue. Valeur inconnue ignorée. */
export async function setLocale(locale: string) {
    if (!hasLocale(LOCALES, locale)) return
    const cookieStore = await cookies()
    cookieStore.set(LOCALE_COOKIE, locale, { path: "/", maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: "lax" })
}
