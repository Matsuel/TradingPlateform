import { AppSheet } from "@/components/app-sheet"
import { Button } from "@/components/ui/button"
import { QuickBacktestForm } from "@/features/backtest/quick-backtest-form"

/** Bouton « Tester » du détail d'un symbole : ouvre le test rapide (`QuickBacktestForm`) dans un panneau latéral. */
export function SymbolSheet({ symbol }: { symbol: string }) {
    return (
        <AppSheet title={`Test rapide · ${symbol}`} trigger={<Button size="lg">Tester</Button>}>
            <div className="flex flex-1 flex-col px-4 pb-4">
                <QuickBacktestForm symbol={symbol} />
            </div>
        </AppSheet>
    )
}
