"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { Command, CommandDialog, CommandInput, CommandList } from "@/components/ui/command"
import { useMarketSearch } from "@/features/market/hook"
import type { MarketData } from "@/features/market/types"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { SearchResults, searchState } from "./symbol-search-results"

// Attente après la dernière frappe avant d'interroger la recherche
const SEARCH_DEBOUNCE_MS = 500

interface SymbolPickerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (item: MarketData) => void
    exclude?: string[] // symboles masqués des résultats (déjà choisis)
    title?: string
}

/**
 * Dialogue de recherche de symbole (≥ `MIN_SEARCH_LENGTH` caractères, débouncée) : squelettes pendant la recherche,
 * erreur, aucun résultat, puis résultats hors `exclude`. Choisir un résultat appelle `onSelect` et ferme le dialogue.
 */
export function SymbolPicker({ open, onOpenChange, onSelect, exclude = [], title }: SymbolPickerProps) {
    const t = useTranslations("components.symbolPicker")
    const heading = title ?? t("title")
    const [query, setQuery] = useState("")
    const trimmed = query.trim()
    const debouncedQuery = useDebouncedValue(trimmed, SEARCH_DEBOUNCE_MS)
    const search = useMarketSearch(debouncedQuery)
    const state = searchState(trimmed, debouncedQuery, search, exclude)

    const close = () => {
        onOpenChange(false)
        setQuery("")
    }

    return (
        <CommandDialog
            open={open}
            onOpenChange={(next) => (next ? onOpenChange(true) : close())}
            title={heading}
            description={t("description")}
        >
            <Command shouldFilter={false}>
                <CommandInput placeholder={`${heading}…`} value={query} onValueChange={setQuery} />
                <CommandList>
                    <SearchResults
                        state={state}
                        query={trimmed}
                        onPick={(item) => {
                            onSelect(item)
                            close()
                        }}
                    />
                </CommandList>
            </Command>
        </CommandDialog>
    )
}
