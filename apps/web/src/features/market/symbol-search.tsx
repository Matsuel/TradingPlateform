"use client"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { SymbolPicker } from "@/components/symbol-picker"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"

export function SymbolSearch() {
    const t = useTranslations("market.search")
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
                <span className="flex-1 text-left">{t("placeholder")}</span>
            </Button>

            <SymbolPicker
                open={open}
                onOpenChange={setOpen}
                onSelect={(item) => router.push(routes.symbol(item.symbol))}
            />
        </>
    )
}
