// Préfixe des pages connectées ; proxy.ts garde son matcher en littéral, que Next exige statique
export const prefix = "/app"

/** URL de chaque page : seule source des chemins, pour les liens, redirections et la sidebar. */
export const routes = {
    home: "/",
    login: "/login",
    register: "/register",
    dashboard: prefix,
    notifications: `${prefix}/notifications`,
    market: `${prefix}/market`,
    symbol: (symbol: string) => `${prefix}/market/${encodeURIComponent(symbol)}`,
    backtests: `${prefix}/backtest`,
    newBacktest: `${prefix}/backtest/new`,
    backtest: (id: string) => `${prefix}/backtest/${id}`,
    compare: `${prefix}/backtest/compare`,
    compareIds: (a: string, b: string) => `${prefix}/backtest/compare?ids=${a},${b}`,
    paperTrading: `${prefix}/paper-trading`,
    risk: `${prefix}/risk`,
    projection: `${prefix}/projection`,
    optimization: `${prefix}/optimization`,
    reports: `${prefix}/reports`,
    monitoring: `${prefix}/monitoring`,
    users: `${prefix}/users`,
    referenceData: `${prefix}/reference-data`,
    settings: `${prefix}/settings`,
} as const

/**
 * Destination après connexion : `redirect` s'il désigne une page de l'app (chemin interne commençant par `prefix`),
 * sinon le dashboard. Refuse les URL absolues et `//hôte`, pour ne jamais rediriger hors du site.
 */
export function safeRedirect(redirect: string | undefined): string {
    if (!redirect?.startsWith(prefix) || redirect.startsWith("//")) return routes.dashboard
    return redirect
}
