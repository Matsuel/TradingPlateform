"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { SidebarSection } from "@/constants/sidebar"
import { findActiveTab } from "@/lib/navigation"

/** Une section du menu : titre, puis un lien par onglet ; sidebar repliée, l'icône seule avec le nom en infobulle. */
export function SidebarNav({ section }: { section: SidebarSection }) {
    const t = useTranslations("navigation")
    const active = findActiveTab(usePathname())

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t(`sections.${section.key}`)}</SidebarGroupLabel>
            <SidebarMenu>
                {section.tabs.map((tab) => (
                    <SidebarMenuItem key={tab.url}>
                        <SidebarMenuButton
                            isActive={active?.url === tab.url}
                            tooltip={t(`tabs.${tab.key}`)}
                            render={<Link href={tab.url} />}
                        >
                            {tab.icon}
                            <span>{t(`tabs.${tab.key}`)}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
