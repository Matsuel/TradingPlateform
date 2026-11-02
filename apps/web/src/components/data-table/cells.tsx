import { cva, type VariantProps } from "class-variance-authority"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatChange } from "@/lib/format"
import { trendOf, trendStyles } from "@/lib/trend"
import { cn } from "@/lib/utils"

const symbolVariants = cva("flex items-center", {
    variants: {
        size: {
            md: "gap-3", // 12 px, comme dans les tableaux Figma
            lg: "gap-4", // 16 px, comme l'en-tête du détail
        },
    },
    defaultVariants: { size: "md" },
})

const parts = {
    md: {
        avatar: "size-8", // 32 px
        fallback: "text-small-medium",
        symbol: "text-body-medium", // 14/20 medium
        name: "text-small", // 12/16
    },
    lg: {
        avatar: "size-12", // 48 px
        fallback: "text-h3",
        symbol: "text-h2", // 24/32 semibold
        name: "text-body", // 14/20
    },
} as const

type SymbolCellProps = VariantProps<typeof symbolVariants> & {
    symbol: string
    name?: string
    logoUrl?: string
    className?: string
}

/** Logo (initiale à défaut), symbole et nom d'un actif ; `size` `md` en tableau, `lg` en en-tête de page. Nom tronqué s'il déborde. */
export function SymbolCell({ symbol, name, logoUrl, size = "md", className }: SymbolCellProps) {
    const p = parts[size ?? "md"]

    return (
        <div className={cn(symbolVariants({ size }), className)}>
            <Avatar className={p.avatar}>
                <AvatarImage src={logoUrl} alt={`${name ?? symbol} logo`} />
                <AvatarFallback className={cn(p.fallback, "text-muted-foreground")}>
                    {symbol.slice(0, 1)}
                </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
                <span className={p.symbol}>{symbol}</span>
                {name && <span className={cn(p.name, "truncate text-muted-foreground")}>{name}</span>}
            </div>
        </div>
    )
}

/** Variation déjà en pourcent (`1.5` → « +1,50 % »), verte en hausse, rouge en baisse, neutre à zéro. */
export function ChangeCell({ value }: { value: number }) {
    return <span className={trendStyles[trendOf(value)].text}>{formatChange(value)} %</span>
}
