import type { User } from "better-auth"
import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { NavUser } from "@/components/nav-user"
import { SidebarNav } from "@/components/sidebar-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { sidebarSections } from "@/constants/sidebar"
import { routes } from "@/lib/routes"

interface AppSidebarProps {
    user: User
    isAdmin: boolean // affiche les sections `adminOnly` ; l'accès reste vérifié par le layout `(admin)`
}

/** Sidebar repliable de l'app : marque, sections du menu visibles pour le rôle, profil et choix du thème. */
export function AppSidebar({ user, isAdmin }: AppSidebarProps) {
    const sections = sidebarSections.filter((section) => !section.adminOnly || isAdmin)

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href={routes.dashboard} />}>
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <GalleryVerticalEnd className="size-4" />
                            </div>
                            <span className="font-medium">MarketFlow</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {sections.map((section) => (
                    <SidebarNav key={section.name} section={section} />
                ))}
            </SidebarContent>
            <SidebarFooter className="flex-row items-center group-data-[collapsible=icon]:flex-col">
                <div className="min-w-0 flex-1">
                    <NavUser user={user} />
                </div>
                <ThemeToggle />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
