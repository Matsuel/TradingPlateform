import { type SidebarTab, sidebarSections } from "@/constants/sidebar"
import { prefix } from "@/lib/routes"

export type ActiveTab = SidebarTab & { section: string }

const tabs: ActiveTab[] = sidebarSections.flatMap((section) =>
    section.tabs.map((tab) => ({ ...tab, section: section.name })),
)

// Le dashboard (racine) ne matche qu'exactement ; un autre onglet matche aussi ses sous-pages (détail d'un backtest)
const matches = (pathname: string, url: string) =>
    url === prefix ? pathname === url : pathname === url || pathname.startsWith(`${url}/`)

/**
 * Onglet de la sidebar qui correspond à `pathname`, avec le nom de sa section : le plus long préfixe d'URL gagne
 * (`/app/backtest/new` désigne « Nouveau backtest », pas « Backtests »). `undefined` hors du menu (paramètres).
 */
export function findActiveTab(pathname: string): ActiveTab | undefined {
    return tabs.filter((tab) => matches(pathname, tab.url)).sort((a, b) => b.url.length - a.url.length)[0]
}
