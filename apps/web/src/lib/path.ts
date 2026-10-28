import tabs, { prefix } from "@/constants/sidebar";

export { prefix }

// Pages publiques d'authentification (proxy.ts garde ses littéraux : son matcher doit être statique)
export const authPaths = {
    login: "/login",
    register: "/register",
} as const

function isMatch(pathname: string, url: string) {
    if (url === prefix) return pathname === url // la racine ne matche qu'exactement
    return pathname === url || pathname.startsWith(url + "/")
}

export function findActive(pathname: string) {
    return tabs
        .flatMap((group) => group.tabs.map((tab) => ({ ...tab, group: group.name })))
        .filter((tab) => isMatch(pathname, tab.url))
        .sort((a, b) => b.url.length - a.url.length)[0]
}

export function getActive(pathname: string) {
    const active = findActive(pathname)
    if (!active) return { parent: null, name: null, url: null }
    return { parent: active.group, name: active.name, url: active.url }
}