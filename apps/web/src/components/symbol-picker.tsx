"use client"

import { AlertCircle } from "lucide-react"
import { useState } from "react"

import { SymbolCell } from "@/components/data-table/cells"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton"
import { MIN_SEARCH_LENGTH } from "@/features/market/constants"
import { useMarketSearch } from "@/features/market/hook"
import type { MarketData } from "@/features/market/types"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

// Attente après la dernière frappe avant d'interroger la recherche
const SEARCH_DEBOUNCE_MS = 500

/**
 * Dialogue de recherche de symbole (≥ `MIN_SEARCH_LENGTH` caractères, débouncée) : squelettes pendant la recherche,
 * erreur, aucun résultat, puis résultats hors `exclude`. Choisir un résultat appelle `onSelect` et ferme le dialogue.
 */
export function SymbolPicker({
    open,
    onOpenChange,
    onSelect,
    exclude = [],
    title = "Rechercher un symbole",
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (item: MarketData) => void
    /** symboles à masquer des résultats (déjà choisis) */
    exclude?: string[]
    title?: string
}) {
    const [query, setQuery] = useState("")
    const trimmed = query.trim()
    const debouncedQuery = useDebouncedValue(trimmed, SEARCH_DEBOUNCE_MS)
    const { data, error, isLoading } = useMarketSearch(debouncedQuery)

    const tooShort = trimmed.length < MIN_SEARCH_LENGTH
    // couvre aussi le délai du debounce, pour ne pas afficher "aucun résultat" trop tôt
    const isSearching = !tooShort && (trimmed !== debouncedQuery || isLoading)
    const results = data?.filter((item) => !exclude.includes(item.symbol))

    return (
        <CommandDialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next)
                if (!next) setQuery("")
            }}
            title={title}
            description="Actions, ETF, cryptos et indices."
        >
            <Command shouldFilter={false}>
                <CommandInput placeholder={title + "…"} value={query} onValueChange={setQuery} />
                <CommandList>
                    {tooShort && (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Saisis au moins {MIN_SEARCH_LENGTH} caractères.
                        </p>
                    )}

                    {!tooShort && isSearching && (
                        <div className="space-y-1 p-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-2 py-2">
                                    <Skeleton className="size-8 rounded-full" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3.5 w-20" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!tooShort && !isSearching && error && (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <AlertCircle className="size-5 text-destructive" />
                            <p className="text-sm font-medium">La recherche a échoué</p>
                        </div>
                    )}

                    {!tooShort && !isSearching && !error && results?.length === 0 && (
                        <CommandEmpty>Aucun résultat pour « {trimmed} ».</CommandEmpty>
                    )}

                    {!tooShort && !isSearching && !error && results && results.length > 0 && (
                        <CommandGroup heading="Résultats">
                            {results.map((item) => (
                                <CommandItem
                                    key={`${item.symbol}-${item.exchange}`}
                                    value={`${item.symbol}-${item.exchange}`}
                                    className="cursor-pointer gap-3 py-2"
                                    onSelect={() => {
                                        onSelect(item)
                                        onOpenChange(false)
                                        setQuery("")
                                    }}
                                >
                                    <SymbolCell
                                        symbol={item.symbol}
                                        name={item.name}
                                        logoUrl={item.logoUrl}
                                        className="min-w-0 flex-1"
                                    />
                                    <span className="text-right text-xs text-muted-foreground">{item.exchange}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    )
}
