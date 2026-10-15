import tabs from "@/constants/sidebar";

export function findActive(pathname: string) {
    return tabs
        .flatMap((group) => group.tabs.map((tab) => ({ ...tab, group: group.name })))
        .filter((tab) => pathname === tab.url || pathname.startsWith(tab.url + "/"))
        .sort((a, b) => b.url.length - a.url.length)[0]
}