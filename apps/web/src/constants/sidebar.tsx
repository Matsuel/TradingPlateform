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
import type { ReactNode } from "react"
import { routes } from "@/lib/routes"

export type SidebarTab = { name: string; url: string; icon: ReactNode }

export type SidebarSection = { name: string; adminOnly: boolean; tabs: SidebarTab[] }

// Sections du menu, dans l'ordre de la roadmap : marché, Strategy Lab, analyses (mois 6 à 9), administration
export const sidebarSections: SidebarSection[] = [
    {
        name: "Vue d’ensemble",
        adminOnly: false,
        tabs: [
            { name: "Dashboard", url: routes.dashboard, icon: <LayoutDashboard /> },
            { name: "Notifications", url: routes.notifications, icon: <Bell /> },
        ],
    },
    {
        name: "Marché",
        adminOnly: false,
        tabs: [{ name: "Marché", url: routes.market, icon: <ChartCandlestick /> }],
    },
    {
        name: "Strategy Lab",
        adminOnly: false,
        tabs: [
            { name: "Backtests", url: routes.backtests, icon: <FlaskConical /> },
            { name: "Nouveau backtest", url: routes.newBacktest, icon: <Plus /> },
            { name: "Comparaison", url: routes.compare, icon: <GitCompareArrows /> },
            { name: "Paper trading", url: routes.paperTrading, icon: <TrendingUp /> },
        ],
    },
    {
        name: "Analyse",
        adminOnly: false,
        tabs: [
            { name: "Risque", url: routes.risk, icon: <ShieldAlert /> },
            { name: "Projection", url: routes.projection, icon: <Sparkles /> },
            { name: "Optimisation", url: routes.optimization, icon: <BrainCircuit /> },
            { name: "Rapports", url: routes.reports, icon: <FileText /> },
        ],
    },
    {
        name: "Administration",
        adminOnly: true,
        tabs: [
            { name: "Monitoring", url: routes.monitoring, icon: <Activity /> },
            { name: "Utilisateurs", url: routes.users, icon: <Users /> },
            { name: "Données de référence", url: routes.referenceData, icon: <Database /> },
        ],
    },
]
