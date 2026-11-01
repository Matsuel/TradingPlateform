"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import type { SidebarSection } from "@/constants/sidebar"
import { findActiveTab } from "@/lib/navigation"

/** Une section du menu : titre, puis un lien par onglet ; sidebar repliée, l'icône seule avec le nom en infobulle. */
export function SidebarNav({ section }: { section: SidebarSection }) {
    const active = findActiveTab(usePathname())

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{section.name}</SidebarGroupLabel>
            <SidebarMenu>
                {section.tabs.map((tab) => (
                    <SidebarMenuItem key={tab.url}>
                        <SidebarMenuButton
                            isActive={active?.url === tab.url}
                            tooltip={tab.name}
                            render={<Link href={tab.url} />}
                        >
                            {tab.icon}
                            <span>{tab.name}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
