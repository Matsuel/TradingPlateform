"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { type Theme, themes } from "@/constants/theme"
import { cn } from "@/lib/utils"
import { SettingsCard } from "./settings-card"

// Couleurs fixes : l'aperçu montre le thème qu'il représente, pas le thème actif
const halves = {
    light: { surface: "bg-white", bar: "bg-zinc-200" },
    dark: { surface: "bg-zinc-950", bar: "bg-zinc-800" },
}

const previews: Record<Theme, (keyof typeof halves)[]> = {
    light: ["light"],
    dark: ["dark"],
    system: ["light", "dark"],
}

// Miniature d'un thème : une moitié par mode (deux pour « système »), encadrée quand le thème est actif
function ThemePreview({ theme, active }: { theme: Theme; active: boolean }) {
    return (
        <span
            className={cn(
                "flex h-22 w-full overflow-hidden rounded-md border",
                active ? "border-2 border-foreground" : "border-border",
            )}
        >
            {previews[theme].map((half) => (
                <span key={half} className={cn("flex h-full flex-1 flex-col gap-1.5 p-3", halves[half].surface)}>
                    <span className={cn("h-2 w-14 max-w-full rounded-sm", halves[half].bar)} />
                    <span className={cn("h-2 w-9 max-w-full rounded-sm", halves[half].bar)} />
                    <span className={cn("h-2 w-18 max-w-full rounded-sm", halves[half].bar)} />
                </span>
            ))}
        </span>
    )
}

const subscribe = () => () => {}

/** Carte « Thème » des paramètres : trois aperçus (clair, sombre, système), appliqués au clic via next-themes. */
export function ThemeCard() {
    const t = useTranslations()
    const { theme, setTheme } = useTheme()
    // Le thème vient du navigateur : sans ce garde, le rendu serveur (aucun actif) et le premier rendu client divergent
    const hydrated = useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    )
    const current = hydrated ? theme : undefined

    return (
        <SettingsCard title={t("settings.theme.title")} description={t("settings.theme.description")}>
            <div className="grid gap-4 sm:grid-cols-3">
                {themes.map((value) => (
                    <Button
                        key={value}
                        variant="tile"
                        size="inline"
                        aria-pressed={current === value}
                        onClick={() => setTheme(value)}
                        className="w-full flex-col items-start gap-2"
                    >
                        <ThemePreview theme={value} active={current === value} />
                        {t(`theme.${value}`)}
                    </Button>
                ))}
            </div>
        </SettingsCard>
    )
}
