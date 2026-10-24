import { Activity, ChartCandlestick, FlaskConical, LayoutDashboard, ListOrdered, Plus, Wallet } from "lucide-react"

const prefix = "/app";

const tabs = [
    {
        name: "Trading",
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
        tabs: [
            {
                name: "Surveillance",
                url: `${prefix}/monitoring`,
                icon: (
                    <Activity />
                )
            }
        ]
    }
]

export default tabs