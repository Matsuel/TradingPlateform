import type { Column } from "@/components/data-table/data-table"
import { ChangeCell, SymbolCell } from "@/components/data-table/cells"
import { Badge } from "@/components/ui/badge"
import { formatDay, formatDayRange, formatPrice, LOCALE } from "@/lib/format"
import { BACKTEST_CURRENCY, statusBadges, strategyLabels, tradeSideBadges } from "./constants"
import type { Backtest, Holding, Trade } from "./types"
import { getExecution, getExecutionDuration } from "./utils"
import Dash from "@/components/custom/Dash"

// Cours d'achat sans devise : « 268,50 »
const formatTradePrice = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format

// Titres fractionnaires (DCA) : jusqu'à 6 décimales
const formatQuantity = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 6 }).format

export const backtestColumns: Column<Backtest>[] = [
    { header: "Nom", cell: (b) => <span className="text-body-medium">{b.name}</span> },
    { header: "Stratégie", cell: (b) => strategyLabels[b.investmentMode] },
    { header: "Symboles", cell: (b) => `${b.allocations.length} symbole${b.allocations.length > 1 ? "s" : ""}` },
    { header: "Période", cell: (b) => formatDayRange(b.startDate, b.endDate) },
    {
        header: "Rendement",
        className: "text-right",
        cell: (b) => {
            const value = getExecution(b)?.result?.totalReturn
            return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
        },
    },
    {
        header: "Statut",
        className: "text-center",
        cell: (b) => {
            const e = getExecution(b)
            if (!e) return <Dash />
            const { label, variant } = statusBadges[e.status]
            return <Badge variant={variant}>{label}</Badge>
        },
    },
    { header: "Durée", className: "text-right", cell: (b) => {
        const e = getExecution(b)
        return (e && getExecutionDuration(e)) ?? <Dash />
    } },
]

export const tradeColumns: Column<Trade>[] = [
    { header: "Date", cell: (t) => formatDay(t.date) },
    { header: "Symbole", cell: (t) => <SymbolCell symbol={t.symbol} /> },
    {
        header: "Côté",
        cell: (t) => {
            // Résultats antérieurs au rebalancement : uniquement des achats, sans side (D10)
            const { label, variant } = tradeSideBadges[t.side ?? "BUY"]
            return <Badge variant={variant}>{label}</Badge>
        },
    },
    {
        header: "Prix d'achat",
        className: "text-right",
        cell: (t) => formatTradePrice(t.price),
    },
    {
        header: "Quantité",
        className: "text-right",
        cell: (t) => (t.quantity == null ? <Dash /> : formatQuantity(t.quantity)),
    },
    {
        header: "Montant",
        className: "text-right",
        cell: (t) => (t.amount == null ? <Dash /> : formatPrice(t.amount, BACKTEST_CURRENCY)),
    },
    {
        header: "Frais",
        className: "text-right",
        cell: (t) => (t.fee == null ? <Dash /> : formatPrice(t.fee, BACKTEST_CURRENCY)),
    },
]

export const holdingColumns: Column<Holding>[] = [
    { header: "Symbole", cell: (h) => <SymbolCell symbol={h.symbol} /> },
    { header: "Quantité", className: "text-right", cell: (h) => formatQuantity(h.quantity) },
    { header: "Valeur", className: "text-right", cell: (h) => formatPrice(h.value, BACKTEST_CURRENCY) },
]
