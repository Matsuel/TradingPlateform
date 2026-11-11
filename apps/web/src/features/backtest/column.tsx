import { Dash } from "@/components/dash"
import { ChangeCell, SymbolCell } from "@/components/data-table/cells"
import type { Column } from "@/components/data-table/data-table"
import { InfoHint } from "@/components/info-hint"
import { Badge } from "@/components/ui/badge"
import { useFormatters } from "@/lib/format"
import { BACKTEST_CURRENCY, strategyLabels, tradeSideBadges } from "./constants"
import { StatusBadge } from "./status-badge"
import type { Backtest, Holding, Trade } from "./types"
import { formatAllocation, getExecution, getExecutionDuration } from "./utils"

// Titres fractionnaires (DCA) : jusqu'à 6 décimales
const useFormatQuantity = () => new Intl.NumberFormat(useFormatters().locale, { maximumFractionDigits: 6 }).format

export function useBacktestColumns(): Column<Backtest>[] {
    const f = useFormatters()

    return [
        { header: "Nom", cell: (b) => <span className="text-body-medium">{b.name}</span> },
        { header: "Stratégie", cell: (b) => strategyLabels[b.investmentMode] },
        {
            header: "Allocation",
            cell: (b) => {
                const allocation = formatAllocation(f, b.allocations)
                return (
                    <span className="block max-w-56 truncate" title={allocation}>
                        {allocation}
                    </span>
                )
            },
        },
        { header: "Période", cell: (b) => f.formatDayRange(b.startDate, b.endDate) },
        {
            header: <InfoHint entry="totalReturn">Rendement</InfoHint>,
            className: "text-right",
            cell: (b) => {
                const value = getExecution(b)?.result?.totalReturn
                return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
            },
        },
        {
            header: <InfoHint entry="cagr">CAGR</InfoHint>,
            className: "text-right",
            cell: (b) => {
                // Dernière exécution non terminée ou résultat antérieur aux métriques : pas de CAGR
                const value = getExecution(b)?.result?.cagr
                return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
            },
        },
        {
            header: "Statut",
            className: "text-center",
            cell: (b) => {
                const e = getExecution(b)
                if (!e) return <Dash />
                return <StatusBadge status={e.status} />
            },
        },
        {
            header: <InfoHint entry="executionDuration">Durée</InfoHint>,
            className: "text-right",
            cell: (b) => {
                const e = getExecution(b)
                return (e && getExecutionDuration(e)) ?? <Dash />
            },
        },
    ]
}

export function useTradeColumns(): Column<Trade>[] {
    const { formatDay, formatPrice, formatSharpe } = useFormatters()
    const formatQuantity = useFormatQuantity()

    return [
        { header: "Date", cell: (t) => formatDay(t.date) },
        { header: "Symbole", cell: (t) => <SymbolCell symbol={t.symbol} /> },
        {
            header: <InfoHint entry="tradeSide">Côté</InfoHint>,
            cell: (t) => {
                // Résultats antérieurs au rebalancement : uniquement des achats, sans side (D10)
                const { label, variant } = tradeSideBadges[t.side ?? "BUY"]
                return <Badge variant={variant}>{label}</Badge>
            },
        },
        {
            header: <InfoHint entry="tradePrice">Prix</InfoHint>,
            className: "text-right",
            // Cours de l'ordre sans devise, 2 décimales comme le Sharpe : « 268,50 »
            cell: (t) => formatSharpe(t.price),
        },
        {
            header: <InfoHint entry="tradeQuantity">Quantité</InfoHint>,
            className: "text-right",
            cell: (t) => (t.quantity == null ? <Dash /> : formatQuantity(t.quantity)),
        },
        {
            header: <InfoHint entry="tradeAmount">Montant</InfoHint>,
            className: "text-right",
            cell: (t) => (t.amount == null ? <Dash /> : formatPrice(t.amount, BACKTEST_CURRENCY)),
        },
        {
            header: <InfoHint entry="tradeFee">Frais</InfoHint>,
            className: "text-right",
            cell: (t) => (t.fee == null ? <Dash /> : formatPrice(t.fee, BACKTEST_CURRENCY)),
        },
    ]
}

export function useHoldingColumns(): Column<Holding>[] {
    const { formatPrice } = useFormatters()
    const formatQuantity = useFormatQuantity()

    return [
        { header: "Symbole", cell: (h) => <SymbolCell symbol={h.symbol} /> },
        {
            header: <InfoHint entry="holdingQuantity">Quantité</InfoHint>,
            className: "text-right",
            cell: (h) => formatQuantity(h.quantity),
        },
        {
            header: <InfoHint entry="holdingValue">Valeur</InfoHint>,
            className: "text-right",
            cell: (h) => formatPrice(h.value, BACKTEST_CURRENCY),
        },
    ]
}
