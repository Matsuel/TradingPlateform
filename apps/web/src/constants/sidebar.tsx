import { Activity, ChartCandlestick, FlaskConical, LayoutDashboard, ListOrdered, Plus, Wallet } from "lucide-react"

const tabs = {
    trading: {
        name: "Trading",
        tabs: [
            {
                name: "Dashboard",
                url: "/dashboard",
                icon: (
                    <LayoutDashboard />
                )
            },
            {
                name: "Marché",
                url: "/market",
                icon: (
                    <ChartCandlestick />
                )
            },
            {
                name: "Portefeuille",
                url: "/portfolio",
                icon: (
                    <Wallet />
                )
            },
            {
                name: "Ordres",
                url: "/orders",
                icon: (
                    <ListOrdered />
                )
            }
        ]
    },
    backtest: {
        name: "Experimentation",
        tabs: [
            {
                name: "Backtests",
                url: "/backtest",
                icon: (
                    <FlaskConical />
                )
            },
            {
                name: "Nouveau backtest",
                url: "/newbacktest",
                icon: (
                    <Plus />
                )
            }
        ]
    },
    advanced: {
        name: "Avancée",
        tabs: [
            {
                name: "Surveillance",
                url: "/monitoring",
                icon: (
                    <Activity />
                )
            }
        ]
    }
}

export default tabs