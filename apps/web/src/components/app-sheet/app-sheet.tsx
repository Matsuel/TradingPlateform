import { ReactElement, ReactNode } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"

interface AppSheetProps {
    trigger: ReactElement
    title: ReactNode
    description?: ReactNode
    children?: ReactNode
    className?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}


const AppSheet = ({
    trigger,
    title,
    description,
    children,
    className,
    open,
    onOpenChange
}: AppSheetProps) => {
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

export default AppSheet