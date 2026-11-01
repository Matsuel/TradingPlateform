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

type SearchState =
    | { kind: "tooShort" }
    | { kind: "searching" }
    | { kind: "error" }
    | { kind: "empty" }
    | { kind: "results"; results: MarketData[] }

// Un seul état affiché ; « searching » couvre aussi le délai du debounce, pour ne pas annoncer « aucun résultat » trop tôt
function searchState(
    query: string,
    debouncedQuery: string,
    search: { data?: MarketData[]; error: Error | null; isLoading: boolean },
    exclude: string[],
): SearchState {
    if (query.length < MIN_SEARCH_LENGTH) return { kind: "tooShort" }
    if (query !== debouncedQuery || search.isLoading) return { kind: "searching" }
    if (search.error) return { kind: "error" }
    const results = (search.data ?? []).filter((item) => !exclude.includes(item.symbol))
    return results.length === 0 ? { kind: "empty" } : { kind: "results", results }
}

function SearchSkeleton() {
    return (
        <div className="space-y-1 p-2">
            {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                </div>
            ))}
        </div>
    )
}

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
export function SymbolPicker({
    open,
    onOpenChange,
    onSelect,
    exclude = [],
    title = "Rechercher un symbole",
}: SymbolPickerProps) {
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
            title={title}
            description="Actions, ETF, cryptos et indices."
        >
            <Command shouldFilter={false}>
                <CommandInput placeholder={`${title}…`} value={query} onValueChange={setQuery} />
                <CommandList>
                    {state.kind === "tooShort" && (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Saisis au moins {MIN_SEARCH_LENGTH} caractères.
                        </p>
                    )}
                    {state.kind === "searching" && <SearchSkeleton />}
                    {state.kind === "error" && (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <AlertCircle className="size-5 text-destructive" />
                            <p className="text-sm font-medium">La recherche a échoué</p>
                        </div>
                    )}
                    {state.kind === "empty" && <CommandEmpty>Aucun résultat pour « {trimmed} ».</CommandEmpty>}
                    {state.kind === "results" && (
                        <CommandGroup heading="Résultats">
                            {state.results.map((item) => (
                                <CommandItem
                                    key={`${item.symbol}-${item.exchange}`}
                                    value={`${item.symbol}-${item.exchange}`}
                                    className="cursor-pointer gap-3 py-2"
                                    onSelect={() => {
                                        onSelect(item)
                                        close()
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
