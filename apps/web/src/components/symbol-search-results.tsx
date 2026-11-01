"use client"

import { AlertCircle } from "lucide-react"
import { SymbolCell } from "@/components/data-table/cells"
import { CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton"
import { MIN_SEARCH_LENGTH } from "@/features/market/constants"
import type { MarketData } from "@/features/market/types"

export type SearchState =
    | { kind: "tooShort" }
    | { kind: "searching" }
    | { kind: "error" }
    | { kind: "empty" }
    | { kind: "results"; results: MarketData[] }

// Un seul état affiché ; « searching » couvre aussi le délai du debounce, pour ne pas annoncer « aucun résultat » trop tôt
export function searchState(
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

// Contenu de la liste pour chaque état de la recherche
export function SearchResults({
    state,
    query,
    onPick,
}: {
    state: SearchState
    query: string
    onPick: (item: MarketData) => void
}) {
    switch (state.kind) {
        case "tooShort":
            return (
                <p className="py-6 text-center text-sm text-muted-foreground">
                    Saisis au moins {MIN_SEARCH_LENGTH} caractères.
                </p>
            )
        case "searching":
            return <SearchSkeleton />
        case "error":
            return (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <AlertCircle className="size-5 text-destructive" />
                    <p className="text-sm font-medium">La recherche a échoué</p>
                </div>
            )
        case "empty":
            return <CommandEmpty>Aucun résultat pour « {query} ».</CommandEmpty>
        case "results":
            return (
                <CommandGroup heading="Résultats">
                    {state.results.map((item) => (
                        <CommandItem
                            key={`${item.symbol}-${item.exchange}`}
                            value={`${item.symbol}-${item.exchange}`}
                            className="cursor-pointer gap-3 py-2"
                            onSelect={() => onPick(item)}
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
            )
    }
}
