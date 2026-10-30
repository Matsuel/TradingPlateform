import AppSheet from "@/components/app-sheet/app-sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuickBacktestForm } from "@/features/backtest/quick-backtest-form"

export function SymbolSheet({ symbol }: { symbol: string }) {
    return (
        <AppSheet title={symbol} trigger={<Button size="lg">Acheter</Button>}>
            <Tabs defaultValue="trade" className="flex-1 px-4 pb-4">
                <TabsList className="w-full">
                    <TabsTrigger value="trade">Trade</TabsTrigger>
                    <TabsTrigger value="test">Test</TabsTrigger>
                </TabsList>
                <TabsContent value="trade" />
                <TabsContent value="test" className="flex flex-col pt-2">
                    <QuickBacktestForm symbol={symbol} />
                </TabsContent>
            </Tabs>
        </AppSheet>
    )
}
