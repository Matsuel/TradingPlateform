import { Activity, ChartCandlestick, FlaskConical, LayoutDashboard, ListOrdered, Plus, User, Wallet } from "lucide-react"

export const prefix = "/app";

const tabs = [
    {
        name: "Trading",
        adminOnly: false,
        tabs: [
            {
                name: "Dashboard",
                url: `${prefix}`,
                icon: (
                    <LayoutDashboard />
                )
            },
            {
                name: "Marché",
                url: `${prefix}/market`,
                icon: (
                    <ChartCandlestick />
                )
            },
            {
                name: "Portefeuille",
                url: `${prefix}/portfolio`,
                icon: (
                    <Wallet />
                )
            },
            {
                name: "Ordres",
                url: `${prefix}/orders`,
                icon: (
                    <ListOrdered />
                )
            }
        ]
    },
    {
        name: "Experimentation",
        adminOnly: false,
        tabs: [
            {
                name: "Backtests",
                url: `${prefix}/backtest`,
                icon: (
                    <FlaskConical />
                )
            },
            {
                name: "Nouveau backtest",
                url: `${prefix}/backtest/new`,
                icon: (
                    <Plus />
                )
            }
        ]
    },
    {
        name: "Avancée",
        adminOnly: true,
        tabs: [
            {
                name: "Surveillance",
                url: `${prefix}/monitoring`,
                icon: (
                    <Activity />
                )
            },
            {
                name: "Utilisateurs",
                url: `${prefix}/users`,
                icon: (
                    <User />
                )
            }
        ]
    }
]

export default tabs