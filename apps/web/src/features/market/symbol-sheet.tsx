import { useTranslations } from "next-intl"
import { AppSheet } from "@/components/app-sheet"
import { Button } from "@/components/ui/button"
import { QuickBacktestForm } from "@/features/backtest/quick-backtest-form"

/** Bouton « Tester » du détail d'un symbole : ouvre le test rapide (`QuickBacktestForm`) dans un panneau latéral. */
export function SymbolSheet({ symbol }: { symbol: string }) {
    const t = useTranslations("market.sheet")

    return (
        <AppSheet title={t("title", { symbol })} trigger={<Button size="lg">{t("trigger")}</Button>}>
            <div className="flex flex-1 flex-col px-4 pb-4">
                <QuickBacktestForm symbol={symbol} />
            </div>
        </AppSheet>
    )
}
