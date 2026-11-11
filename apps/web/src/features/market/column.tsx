import { Dash } from "@/components/dash"
import { ChangeCell, SymbolCell } from "@/components/data-table/cells"
import type { Column } from "@/components/data-table/data-table"
import { InfoHint } from "@/components/info-hint"
import { Sparkline } from "@/components/sparkline"
import { useFormatters } from "@/lib/format"
import { trendOf } from "@/lib/trend"
import { MARKET_CURRENCY } from "./constants"
import type { MarketAsset } from "./types"

export function useMarketColumns(): Column<MarketAsset>[] {
    const { formatPrice, formatVolume } = useFormatters()

    return [
        { header: "Symbole", cell: (a) => <SymbolCell symbol={a.symbol} name={a.name} logoUrl={a.logoUrl} /> },
        {
            header: <InfoHint entry="price">Prix</InfoHint>,
            cell: (a) => (a.price == null ? <Dash /> : formatPrice(a.price, MARKET_CURRENCY)),
        },
        {
            header: <InfoHint entry="change24h">Variation 24 h</InfoHint>,
            cell: (a) => (a.change24h == null ? <Dash /> : <ChangeCell value={a.change24h} />),
        },
        {
            header: <InfoHint entry="volume24h">Volume 24 h</InfoHint>,
            cell: (a) => (a.volume24h == null ? <Dash /> : formatVolume(a.volume24h)),
        },
        // Sans variation connue, la couleur de la tendance n'aurait pas de sens
        {
            header: <InfoHint entry="trend">Tendance</InfoHint>,
            cell: (a) => (a.change24h == null ? <Dash /> : <Sparkline data={a.history} trend={trendOf(a.change24h)} />),
        },
    ]
}
