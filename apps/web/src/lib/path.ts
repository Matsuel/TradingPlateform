import tabs from "@/constants/sidebar";

export function findActive(pathname: string) {
    return tabs
        .flatMap((group) => group.tabs.map((tab) => ({ ...tab, group: group.name })))
        .filter((tab) => pathname === tab.url || pathname.startsWith(tab.url + "/"))
        .sort((a, b) => b.url.length - a.url.length)[0]
}

export function getActive(pathname: string) {
    for (const group of tabs) {
        const tab = group.tabs.find((t) => pathname === t.url || pathname.startsWith(t.url + "/"))
        if (tab) return { parent: group.name, name: tab.name, url: tab.url }
    }
    return { parent: null, name: null, url: null }
}