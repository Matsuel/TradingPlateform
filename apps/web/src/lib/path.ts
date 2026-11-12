import tabs, { prefix } from "@/constants/sidebar";

export { prefix }

// Pages publiques d'authentification (proxy.ts garde ses littéraux : son matcher doit être statique)
export const authPaths = {
    login: "/login",
    register: "/register",
} as const

// Libellés des pages absentes de la sidebar, par URL
const pageLabels: Record<string, string> = {
    [`${prefix}/settings`]: "Paramètres",
}

// Libellé d'un segment dynamique (id) sous ces URL ; ailleurs le segment s'affiche tel quel (symbole)
const detailLabels: Record<string, string> = {
    [`${prefix}/backtest`]: "Détail",
}

export type Crumb = { name: string; url: string }

const allTabs = tabs.flatMap((group) => group.tabs.map((tab) => ({ ...tab, group: group.name })))

function isMatch(pathname: string, url: string) {
    if (url === prefix) return pathname === url // la racine ne matche qu'exactement
    return pathname === url || pathname.startsWith(url + "/")
}

export function findActive(pathname: string) {
    return allTabs
        .filter((tab) => isMatch(pathname, tab.url))
        .sort((a, b) => b.url.length - a.url.length)[0]
}

function labelOf(url: string, parentUrl: string, segment: string) {
    return allTabs.find((tab) => tab.url === url)?.name
        ?? pageLabels[url]
        ?? detailLabels[parentUrl]
        ?? decodeURIComponent(segment)
}

// Un crumb par segment sous `prefix` ; la racine seule donne le Dashboard
export function getBreadcrumbs(pathname: string): Crumb[] {
    const segments = pathname.slice(prefix.length).split("/").filter(Boolean)
    if (segments.length === 0) return [{ name: labelOf(prefix, "", ""), url: prefix }]

    return segments.map((segment, index) => {
        const parentUrl = [prefix, ...segments.slice(0, index)].join("/")
        const url = `${parentUrl}/${segment}`
        return { name: labelOf(url, parentUrl, segment), url }
    })
}
