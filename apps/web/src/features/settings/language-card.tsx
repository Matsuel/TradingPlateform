"use client"

import { useLocale, useTranslations } from "next-intl"
import { useId, useTransition } from "react"
import { OptionSelect } from "@/components/option-select"
import { Label } from "@/components/ui/label"
import { setLocale } from "@/i18n/actions"
import { LOCALE_LABELS, LOCALES } from "@/i18n/config"
import { SettingsCard } from "./settings-card"

const options = LOCALES.map((locale) => ({ value: locale, label: LOCALE_LABELS[locale] }))

/** Carte « Langue et région » des paramètres : le choix écrit le cookie `locale` et rend la page dans la langue choisie. */
export function LanguageCard() {
    const t = useTranslations("settings.language")
    const locale = useLocale()
    const id = useId()
    const [, startTransition] = useTransition()

    return (
        <SettingsCard title={t("title")} description={t("description")}>
            <div className="grid gap-2">
                <Label htmlFor={id}>{t("label")}</Label>
                <OptionSelect
                    id={id}
                    value={locale}
                    options={options}
                    onChange={(value) => startTransition(() => setLocale(value))}
                />
            </div>
        </SettingsCard>
    )
}
