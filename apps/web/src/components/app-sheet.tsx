import type { ReactElement, ReactNode } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface AppSheetProps {
    trigger: ReactElement // élément qui ouvre le panneau, rendu tel quel (bouton, libellé)
    title: ReactNode
    description?: ReactNode
    children?: ReactNode
    className?: string
    open?: boolean // contrôlé avec `onOpenChange` ; absent, le panneau gère son état
    onOpenChange?: (open: boolean) => void
}

/** Panneau latéral droit avec titre et description, ouvert par `trigger`. */
export function AppSheet({ trigger, title, description, children, className, open, onOpenChange }: AppSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger render={trigger} />
            <SheetContent side="right" className={className}>
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                {children}
            </SheetContent>
        </Sheet>
    )
}
