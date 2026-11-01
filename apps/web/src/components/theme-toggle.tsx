"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const themes = [
    { value: "light", label: "Clair" },
    { value: "dark", label: "Sombre" },
    { value: "system", label: "Système" },
]

/** Bouton de choix du thème (clair, sombre, système) via next-themes. */
export function ThemeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
                <Sun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Changer de thème</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {themes.map((theme) => (
                    <DropdownMenuItem key={theme.value} onClick={() => setTheme(theme.value)}>
                        {theme.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
