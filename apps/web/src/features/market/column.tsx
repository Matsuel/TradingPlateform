import type { Column } from "@/components/data-table/data-table"
import { ChangeCell, SymbolCell } from "@/components/data-table/cells"
import { Sparkline } from "@/components/sparkline"
import { formatPrice, formatVolume } from "@/lib/format"
import { MARKET_CURRENCY } from "./constants"
import type { MarketAsset } from "./types"

export const marketColumns: Column<MarketAsset>[] = [
    { header: "Symbole", cell: (a) => <SymbolCell symbol={a.symbol} name={a.name} logoUrl={a.logoUrl} /> },
    { header: "Prix", cell: (a) => formatPrice(a.price, MARKET_CURRENCY) },
    { header: "Variation 24 h", cell: (a) => <ChangeCell value={a.change24h} /> },
    { header: "Volume 24 h", cell: (a) => formatVolume(a.volume24h) },
    { header: "Tendance", cell: (a) => <Sparkline data={a.history} positive={a.change24h >= 0} /> },
]
