"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Search } from "lucide-react"
import { Button } from "./ui/button"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import { useMarketSerach } from "@/features/market/hook"

const SymbolSearch = () => {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query.trim()), 500)
        return () => clearTimeout(timer)
    }, [query])

    const { data, error, isLoading } = useMarketSerach(debouncedQuery)

    const trimmed = query.trim()
    const tooShort = trimmed.length < 3
    // couvre aussi le délai du debounce, pour ne pas afficher "aucun résultat" trop tôt
    const isSearching = !tooShort && (trimmed !== debouncedQuery || isLoading)

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className="w-70 justify-start gap-2 px-3 font-normal text-muted-foreground"
            >
                <Search className="size-4" />
                <span className="flex-1 text-left">Rechercher un symbole…</span>
            </Button>

            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                title="Rechercher un symbole"
                description="Actions, ETF, cryptos et indices."
            >
                <Command>
                    <CommandInput
                        placeholder="Rechercher un symbole…"
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {tooShort && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Saisis au moins 3 caractères.
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
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!tooShort && !isSearching && error && (
                            <div className="flex flex-col items-center gap-2 py-6 text-center">
                                <AlertCircle className="size-5 text-destructive" />
                                <p className="text-sm font-medium">La recherche a échoué</p>
                                <p className="text-xs text-muted-foreground">
                                    Vérifie ta connexion puis réessaie dans un instant.
                                </p>
                            </div>
                        )}

                        {!tooShort && !isSearching && !error && data?.length === 0 && (
                            <CommandEmpty>Aucun résultat pour « {trimmed} ».</CommandEmpty>
                        )}

                        {!tooShort && !isSearching && !error && data && data.length > 0 && (
                            <CommandGroup heading="Résultats">
                                {data.map((item) => (
                                    <CommandItem
                                        key={`${item.symbol}-${item.exchange}`}
                                        value={`${item.symbol}-${item.exchange}`}
                                        className="cursor-pointer gap-3 py-2"
                                        onSelect={() => {
                                            router.push(`/app/market/${encodeURIComponent(item.symbol)}`)
                                            setOpen(false)
                                        }}
                                    >
                                        <Avatar className="size-8">
                                            <AvatarImage src={item.logoUrl} alt={item.symbol} />
                                            <AvatarFallback className="text-xs">{item.symbol[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">{item.symbol}</p>
                                            <p className="truncate text-xs text-muted-foreground">{item.name}</p>
                                        </div>
                                        <span className="w-12 text-right text-xs text-muted-foreground">
                                            {item.exchange}
                                        </span>
                                        <div className="flex w-16 justify-end">
                                            <Badge variant="default">test</Badge>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    )
}

export default SymbolSearch