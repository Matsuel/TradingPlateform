import { type RenderHookResult, renderHook } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"
import en from "../messages/en.json"
import fr from "../messages/fr.json"

const dictionaries = { fr, en }

/** Rend un hook dans le provider next-intl de la langue demandée (dictionnaires réels). */
export function renderHookIn<T>(locale: "fr" | "en", hook: () => T): RenderHookResult<T, unknown> {
    const wrapper = ({ children }: { children: ReactNode }) => (
        <NextIntlClientProvider locale={locale} messages={dictionaries[locale]}>
            {children}
        </NextIntlClientProvider>
    )
    return renderHook(hook, { wrapper })
}
