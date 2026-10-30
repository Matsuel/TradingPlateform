import { cva, type VariantProps } from "class-variance-authority"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatChange } from "@/lib/format"

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
        avatar: "size-8",                 // 32 px
        fallback: "text-small-medium",
        symbol: "text-body-medium",       // 14/20 medium
        name: "text-small",               // 12/16
    },
    lg: {
        avatar: "size-12",                // 48 px
        fallback: "text-h3",
        symbol: "text-h2",                // 24/32 semibold
        name: "text-body",                // 14/20
    },
} as const

type SymbolCellProps = VariantProps<typeof symbolVariants> & {
    symbol: string
    name?: string
    logoUrl?: string
    className?: string
}

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
            <div className="flex flex-col">
                <span className={p.symbol}>{symbol}</span>
                {name && <span className={cn(p.name, "text-muted-foreground")}>{name}</span>}
            </div>
        </div>
    )
}

export function ChangeCell({ value }: { value: number }) {
    return (
        <span className={value >= 0 ? "text-green-600" : "text-destructive"}>
            {formatChange(value)} %
        </span>
    )
}