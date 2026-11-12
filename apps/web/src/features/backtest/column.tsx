import { useTranslations } from "next-intl"
import { Dash } from "@/components/dash"
import { ChangeCell, SymbolCell } from "@/components/data-table/cells"
import type { Column } from "@/components/data-table/data-table"
import { InfoHint } from "@/components/info-hint"
import { Badge } from "@/components/ui/badge"
import { useFormatters } from "@/lib/format"
import { BACKTEST_CURRENCY, tradeSideVariants } from "./constants"
import { StatusBadge } from "./status-badge"
import type { Backtest, BacktestResult, Holding, Trade } from "./types"
import { formatAllocation, getExecution, getExecutionDuration } from "./utils"

// Titres fractionnaires (DCA) : jusqu'à 6 décimales
const useFormatQuantity = () => new Intl.NumberFormat(useFormatters().locale, { maximumFractionDigits: 6 }).format

export function useBacktestColumns(): Column<Backtest>[] {
    const f = useFormatters()
    const t = useTranslations("backtest")

    return [
        { header: t("columns.name"), cell: (b) => <span className="text-body-medium">{b.name}</span> },
        { header: t("columns.strategy"), cell: (b) => t(`strategy.${b.investmentMode}`) },
        {
            header: t("columns.allocation"),
            cell: (b) => {
                const allocation = formatAllocation(f, b.allocations)
                return (
                    <span className="block max-w-56 truncate" title={allocation}>
                        {allocation}
                    </span>
                )
            },
        },
        { header: t("columns.period"), cell: (b) => f.formatDayRange(b.startDate, b.endDate) },
        {
            header: <InfoHint entry="totalReturn">{t("columns.return")}</InfoHint>,
            className: "text-right",
            cell: (b) => {
                const value = getExecution(b)?.result?.totalReturn
                return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
            },
        },
        {
            header: <InfoHint entry="cagr">{t("columns.cagr")}</InfoHint>,
            className: "text-right",
            cell: (b) => {
                // Dernière exécution non terminée ou résultat antérieur aux métriques : pas de CAGR
                const value = getExecution(b)?.result?.cagr
                return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
            },
        },
        {
            header: t("columns.status"),
            className: "text-center",
            cell: (b) => {
                const e = getExecution(b)
                if (!e) return <Dash />
                return <StatusBadge status={e.status} />
            },
        },
        {
            header: <InfoHint entry="executionDuration">{t("columns.duration")}</InfoHint>,
            className: "text-right",
            cell: (b) => {
                const e = getExecution(b)
                return (e && getExecutionDuration(t, e)) ?? <Dash />
            },
        },
    ]
}

export function useTradeColumns(): Column<Trade>[] {
    const { formatDay, formatPrice, formatSharpe } = useFormatters()
    const t = useTranslations("backtest")
    const formatQuantity = useFormatQuantity()

    return [
        { header: t("columns.date"), cell: (trade) => formatDay(trade.date) },
        { header: t("columns.symbol"), cell: (trade) => <SymbolCell symbol={trade.symbol} /> },
        {
            header: <InfoHint entry="tradeSide">{t("columns.side")}</InfoHint>,
            cell: (trade) => {
                // Résultats antérieurs au rebalancement : uniquement des achats, sans side (D10)
                const side = trade.side ?? "BUY"
                return <Badge variant={tradeSideVariants[side]}>{t(`tradeSide.${side}`)}</Badge>
            },
        },
        {
            header: <InfoHint entry="tradePrice">{t("columns.price")}</InfoHint>,
            className: "text-right",
            // Cours de l'ordre sans devise, 2 décimales comme le Sharpe : « 268,50 »
            cell: (trade) => formatSharpe(trade.price),
        },
        {
            header: <InfoHint entry="tradeQuantity">{t("columns.quantity")}</InfoHint>,
            className: "text-right",
            cell: (trade) => (trade.quantity == null ? <Dash /> : formatQuantity(trade.quantity)),
        },
        {
            header: <InfoHint entry="tradeAmount">{t("columns.amount")}</InfoHint>,
            className: "text-right",
            cell: (trade) => (trade.amount == null ? <Dash /> : formatPrice(trade.amount, BACKTEST_CURRENCY)),
        },
        {
            header: <InfoHint entry="tradeFee">{t("columns.fees")}</InfoHint>,
            className: "text-right",
            cell: (trade) => (trade.fee == null ? <Dash /> : formatPrice(trade.fee, BACKTEST_CURRENCY)),
        },
    ]
}

export function useDividendColumns(): Column<NonNullable<BacktestResult["dividendEvents"]>[number]>[] {
    const { formatDay, formatPrice } = useFormatters()
    const t = useTranslations("backtest.dividends.table")
    const formatQuantity = useFormatQuantity()

    return [
        { header: t("exDate"), cell: (event) => formatDay(event.date) },
        { header: t("symbol"), cell: (event) => <SymbolCell symbol={event.symbol} /> },
        {
            header: <InfoHint entry="dividendAmount">{t("amount")}</InfoHint>,
            className: "text-right",
            cell: (event) => formatPrice(event.amount, BACKTEST_CURRENCY),
        },
        {
            header: <InfoHint entry="dividendQuantity">{t("quantity")}</InfoHint>,
            className: "text-right",
            cell: (event) => formatQuantity(event.quantity),
        },
    ]
}

export function useHoldingColumns(): Column<Holding>[] {
    const { formatPrice } = useFormatters()
    const t = useTranslations("backtest")
    const formatQuantity = useFormatQuantity()

    return [
        { header: t("columns.symbol"), cell: (h) => <SymbolCell symbol={h.symbol} /> },
        {
            header: <InfoHint entry="holdingQuantity">{t("columns.quantity")}</InfoHint>,
            className: "text-right",
            cell: (h) => formatQuantity(h.quantity),
        },
        {
            header: <InfoHint entry="holdingValue">{t("columns.value")}</InfoHint>,
            className: "text-right",
            cell: (h) => formatPrice(h.value, BACKTEST_CURRENCY),
        },
    ]
}
