import {
    Activity,
    Bell,
    BrainCircuit,
    ChartCandlestick,
    Database,
    FileText,
    FlaskConical,
    GitCompareArrows,
    LayoutDashboard,
    Plus,
    ShieldAlert,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react"
import type { Messages } from "next-intl"
import type { ReactNode } from "react"
import { routes } from "@/lib/routes"

// `key` : clé du libellé dans les dictionnaires (`navigation.tabs.<key>`, `navigation.sections.<key>`)
export type SidebarTab = { key: keyof Messages["navigation"]["tabs"]; url: string; icon: ReactNode }

export type SidebarSection = {
    key: keyof Messages["navigation"]["sections"]
    adminOnly: boolean
    tabs: SidebarTab[]
}

// Sections du menu, dans l'ordre de la roadmap : marché, Strategy Lab, analyses (mois 6 à 9), administration
export const sidebarSections: SidebarSection[] = [
    {
        key: "overview",
        adminOnly: false,
        tabs: [
            { key: "dashboard", url: routes.dashboard, icon: <LayoutDashboard /> },
            { key: "notifications", url: routes.notifications, icon: <Bell /> },
        ],
    },
    {
        key: "market",
        adminOnly: false,
        tabs: [{ key: "market", url: routes.market, icon: <ChartCandlestick /> }],
    },
    {
        key: "strategyLab",
        adminOnly: false,
        tabs: [
            { key: "backtests", url: routes.backtests, icon: <FlaskConical /> },
            { key: "newBacktest", url: routes.newBacktest, icon: <Plus /> },
            { key: "compare", url: routes.compare, icon: <GitCompareArrows /> },
            { key: "paperTrading", url: routes.paperTrading, icon: <TrendingUp /> },
        ],
    },
    {
        key: "analysis",
        adminOnly: false,
        tabs: [
            { key: "risk", url: routes.risk, icon: <ShieldAlert /> },
            { key: "projection", url: routes.projection, icon: <Sparkles /> },
            { key: "optimization", url: routes.optimization, icon: <BrainCircuit /> },
            { key: "reports", url: routes.reports, icon: <FileText /> },
        ],
    },
    {
        key: "administration",
        adminOnly: true,
        tabs: [
            { key: "monitoring", url: routes.monitoring, icon: <Activity /> },
            { key: "users", url: routes.users, icon: <Users /> },
            { key: "referenceData", url: routes.referenceData, icon: <Database /> },
        ],
    },
]
