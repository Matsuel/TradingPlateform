import PageLayout from "@/components/PageLayout"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Table,
    TableBody, TableCell, TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import type { MarketAsset } from "../../../../types/market"
import { Sparkline } from "@/components/sparkline"

const assets: MarketAsset[] = [
{"symbol":"AAPL","name":"Apple Inc.","price":342,"change24h":-0.279914,"volume24h":39605715,"history":[{"date":"2026-10-15T13:30:00.000Z","price":344.8949890136719},{"date":"2026-10-15T14:30:00.000Z","price":344},{"date":"2026-10-15T15:30:00.000Z","price":343.7799987792969},{"date":"2026-10-15T16:30:00.000Z","price":344.4549865722656},{"date":"2026-10-15T17:30:00.000Z","price":341.9700012207031},{"date":"2026-10-15T18:30:00.000Z","price":342.95001220703125},{"date":"2026-10-15T19:30:00.000Z","price":341.9100036621094},{"date":"2026-10-15T20:00:00.000Z","price":341.8691},{"date":"2026-10-15T21:00:00.000Z","price":342.2},{"date":"2026-10-15T22:00:00.000Z","price":341.5},{"date":"2026-10-15T23:00:00.000Z","price":340.6719},{"date":"2026-10-16T08:00:00.000Z","price":342.15},{"date":"2026-10-16T09:00:00.000Z","price":341.9},{"date":"2026-10-16T10:00:00.000Z","price":342.3},{"date":"2026-10-16T11:00:00.000Z","price":343.2},{"date":"2026-10-16T12:00:00.000Z","price":348.46},{"date":"2026-10-16T13:00:00.000Z","price":347.3},{"date":"2026-10-16T13:25:30.000Z","price":347.23}],"logoUrl":"https://img.logo.dev/ticker/AAPL?token=pk_RtLWfBNsRd26AxstB9I6tg&size=64"},{"symbol":"MSFT","name":"Microsoft Corporation","price":539.44,"change24h":1.0774,"volume24h":23481292,"history":[{"date":"2026-10-15T13:30:00.000Z","price":534.77001953125},{"date":"2026-10-15T14:30:00.000Z","price":537.6702880859375},{"date":"2026-10-15T15:30:00.000Z","price":539.5593872070312},{"date":"2026-10-15T16:30:00.000Z","price":538.989990234375},{"date":"2026-10-15T17:30:00.000Z","price":539.0700073242188},{"date":"2026-10-15T18:30:00.000Z","price":540.8499755859375},{"date":"2026-10-15T19:30:00.000Z","price":539.3300170898438},{"date":"2026-10-15T20:00:00.000Z","price":537.54},{"date":"2026-10-15T21:00:00.000Z","price":538.1829},{"date":"2026-10-15T22:00:00.000Z","price":537.4},{"date":"2026-10-15T23:00:00.000Z","price":536.65},{"date":"2026-10-16T08:00:00.000Z","price":540.7},{"date":"2026-10-16T09:00:00.000Z","price":539.8248},{"date":"2026-10-16T10:00:00.000Z","price":540.7},{"date":"2026-10-16T11:00:00.000Z","price":541.46},{"date":"2026-10-16T12:00:00.000Z","price":540.0171},{"date":"2026-10-16T13:00:00.000Z","price":539.8265},{"date":"2026-10-16T13:25:23.000Z","price":540.7114}],"logoUrl":"https://img.logo.dev/ticker/MSFT?token=pk_RtLWfBNsRd26AxstB9I6tg&size=64"}
]

const changeFormatter = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
})

const volumeFormatter = new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 2,
})

const MarketPage = () => {
    return (
        <PageLayout
            title="Marché"
            description="Prix en temps réel via la plateforme Yahoo finance"
        >
            <div className="w-full h-auto flex flex-row justify-between items-center">

                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">Tous</TabsTrigger>
                        <TabsTrigger value="favorites">Favoris</TabsTrigger>
                        <TabsTrigger value="cryptos">Cryptos</TabsTrigger>
                        <TabsTrigger value="stablecoins">Stablecoins</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Input
                    className="w-70 focus-visible:ring-0"
                    placeholder="Rechercher un symbole…"
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Symbole</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Variation 24 h</TableHead>
                        <TableHead>Volume 24 h</TableHead>
                        <TableHead>Tendance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assets.map((asset) => {
                        const positive = asset.change24h >= 0

                        return (
                            <TableRow key={asset.name}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-10">
                                            <AvatarImage src={asset.logoUrl} alt={`${asset.name} logo`} />
                                            <AvatarFallback>{asset.symbol.slice(0, 1)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-base font-medium">{asset.symbol}</span>
                                            <span className="text-sm text-muted-foreground">{asset.name}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {asset.price}
                                </TableCell>
                                <TableCell>
                                    <span className={positive ? "text-green-600" : "text-red-600"}>
                                        {changeFormatter.format(asset.change24h)} %
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {volumeFormatter.format(asset.volume24h)}
                                </TableCell>
                                <TableCell>
                                    <Sparkline
                                        data={asset.history}
                                        positive={positive}
                                    />
                                </TableCell>

                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </PageLayout>
    )
}

export default MarketPage