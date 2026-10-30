import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChartCandlestick, FlaskConical, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prefix } from "@/lib/path";

export const metadata: Metadata = {
    title: "MarketFlow — Simulateur de marché",
    description: "Explorez les marchés, testez vos stratégies et gérez un portefeuille virtuel, sans argent réel.",
};

const features = [
    {
        title: "Marché",
        description: "Recherchez un symbole, consultez son cours et son historique de prix sur graphique.",
        icon: <ChartCandlestick />,
    },
    {
        title: "Backtests",
        description: "Rejouez une stratégie (achat unique ou DCA mensuel) sur l’historique et mesurez rendement et drawdown.",
        icon: <FlaskConical />,
    },
    {
        title: "Portefeuille virtuel",
        description: "Bientôt : passez des ordres avec un solde fictif et suivez vos positions en temps réel.",
        icon: <Wallet />,
    },
];

export default function Home() {
    return (
        <main className="flex flex-1 flex-col items-center px-6 py-24 md:py-32">
            <section className="flex max-w-2xl flex-col items-center gap-6 text-center">
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                    MarketFlow
                </h1>
                <p className="text-lg text-muted-foreground">
                    Une plateforme de marché financier simulée pour apprendre à investir sans risque :
                    explorez les cours, testez vos stratégies sur le passé et entraînez-vous avec un portefeuille virtuel.
                </p>
                <Link href={prefix}>
                    <Button size={"lg"} className="h-11 px-5 text-base">
                        Accéder à l’app
                        <ArrowRight data-icon="inline-end" />
                    </Button>
                </Link>
            </section>

            <section className="mt-20 grid w-full max-w-5xl gap-4 md:grid-cols-3">
                {features.map((feature) => (
                    <Card key={feature.title}>
                        <CardHeader>
                            <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted [&_svg]:size-5">
                                {feature.icon}
                            </div>
                            <CardTitle>{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </section>

            <p className="mt-16 max-w-xl text-center text-small text-muted-foreground">
                Projet pédagogique : aucune transaction réelle, aucun conseil financier.
            </p>
        </main>
    );
}
