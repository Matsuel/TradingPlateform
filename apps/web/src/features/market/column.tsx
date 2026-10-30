import type { Column } from "@/components/data-table/data-table"
import { ChangeCell, SymbolCell } from "@/components/data-table/cells"
import Dash from "@/components/custom/Dash"
import { Sparkline } from "@/components/sparkline"
import { formatPrice, formatVolume } from "@/lib/format"
import { MARKET_CURRENCY } from "./constants"
import type { MarketAsset } from "./types"

export const marketColumns: Column<MarketAsset>[] = [
    { header: "Symbole", cell: (a) => <SymbolCell symbol={a.symbol} name={a.name} logoUrl={a.logoUrl} /> },
    { header: "Prix", cell: (a) => (a.price == null ? <Dash /> : formatPrice(a.price, MARKET_CURRENCY)) },
    { header: "Variation 24 h", cell: (a) => (a.change24h == null ? <Dash /> : <ChangeCell value={a.change24h} />) },
    { header: "Volume 24 h", cell: (a) => (a.volume24h == null ? <Dash /> : formatVolume(a.volume24h)) },
    // Sans variation connue, la couleur de la tendance n'aurait pas de sens
    { header: "Tendance", cell: (a) => (a.change24h == null ? <Dash /> : <Sparkline data={a.history} positive={a.change24h >= 0} />) },
]
