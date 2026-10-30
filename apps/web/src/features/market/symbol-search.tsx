"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SymbolPicker } from "@/components/symbol-picker"
import { prefix } from "@/lib/path"

export function SymbolSearch() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

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

            <SymbolPicker
                open={open}
                onOpenChange={setOpen}
                onSelect={(item) => router.push(`${prefix}/market/${encodeURIComponent(item.symbol)}`)}
            />
        </>
    )
}
