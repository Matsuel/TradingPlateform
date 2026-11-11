"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { findActiveTab } from "@/lib/navigation"

/**
 * En-tête de l'app : bouton de la sidebar et fil d'Ariane « section › onglet » de la page courante.
 * Sur une sous-page (détail d'un backtest), l'onglet devient un lien vers sa liste ; hors du menu, pas de fil.
 */
export function AppHeader() {
    const t = useTranslations("navigation")
    const pathname = usePathname()
    const tab = findActiveTab(pathname)

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            {tab && (
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">{t(`sections.${tab.section}`)}</BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            {pathname === tab.url ? (
                                <BreadcrumbPage>{t(`tabs.${tab.key}`)}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink render={<Link href={tab.url} />}>{t(`tabs.${tab.key}`)}</BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </header>
    )
}
