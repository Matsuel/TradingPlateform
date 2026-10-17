import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatChange } from "@/lib/format"

export function SymbolCell({ symbol, name, logoUrl }: { symbol: string; name: string; logoUrl?: string }) {
    return (
        <div className="flex items-center gap-3">
            <Avatar className="size-10">
                <AvatarImage src={logoUrl} alt={`${name} logo`} />
                <AvatarFallback>{symbol.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-body-medium">{symbol}</span>
                <span className="text-small text-muted-foreground">{name}</span>
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