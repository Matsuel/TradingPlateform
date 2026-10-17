"use client"
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
import { Sparkline } from "@/components/sparkline"
import { useDefaultAssets } from "@/hooks/market"

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

    const {
        data: assets,
        isPending,
        isError,
        error,
        refetch,
    } = useDefaultAssets();

    if (isPending) {
        return <p>Chargement des marchés...</p>;
    }

    if (isError) {
        return (
            <div>
                <p>Impossible de récupérer les données.</p>
                <p>{error.message}</p>

                <button onClick={() => refetch()}>
                    Réessayer
                </button>
            </div>
        );
    }

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