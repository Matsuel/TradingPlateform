"use client"

import type { MouseEvent, ReactNode } from "react"
import { AppSheet } from "@/components/app-sheet"
import { Button } from "@/components/ui/button"
import { GLOSSARY, type GlossaryEntry, type GlossaryKey } from "@/constants/glossary"

function HintSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-body-semibold text-foreground">{title}</h3>
            {children}
        </section>
    )
}

// Les événements d'un portail React remontent l'arbre des composants : sans cet arrêt, un clic dans le panneau
// déclencherait l'action du parent (ligne de tableau cliquable, libellé de champ)
const stopPropagation = (e: MouseEvent) => e.stopPropagation()

// Ligne du bloc de valeurs du panneau (ex. « Creux atteint le », ou une colonne d'un tableau : « Portefeuille »)
export type HintDetail = { label: string; value: ReactNode }

interface InfoHintProps {
    entry?: GlossaryKey // absent : libellé rendu tel quel, sans aide
    value?: ReactNode
    details?: HintDetail[]
    children: ReactNode
}

/**
 * Libellé souligné en pointillés qui ouvre l'explication d'une donnée du glossaire dans un panneau à droite (maquettes 15 et 15.1).
 * `value` (« Valeur affichée ») puis `details` : valeurs déjà formatées par l'écran, rappelées dans le panneau, jamais recalculées.
 * Le clic n'atteint pas le parent (ligne cliquable, formulaire). Sans `entry`, rend `children` seul.
 */
export function InfoHint({ entry, value, details = [], children }: InfoHintProps) {
    if (!entry) return children
    const shown = value == null ? details : [{ label: "Valeur affichée", value }, ...details]
    const { title, purpose, computation, formula, unit, readingTip, source }: GlossaryEntry = GLOSSARY[entry]

    return (
        <span onClick={stopPropagation} className="contents">
            <AppSheet
                title={title}
                className="sm:max-w-md"
                trigger={
                    <Button type="button" variant="hint" size="inline" aria-haspopup="dialog">
                        {children}
                    </Button>
                }
            >
                <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-6 text-body text-muted-foreground">
                    {shown.length > 0 && (
                        <dl className="flex flex-col gap-2 rounded-lg bg-muted px-4 py-3">
                            {shown.map((d) => (
                                <div key={d.label} className="flex items-start justify-between gap-4">
                                    <dt>{d.label}</dt>
                                    <dd className="text-right text-body-semibold text-foreground">{d.value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                    <HintSection title="À quoi ça sert">
                        <p>{purpose}</p>
                    </HintSection>
                    <HintSection title="Comment c’est calculé">
                        <p>{computation}</p>
                        {formula && (
                            <pre className="rounded-lg bg-muted px-4 py-3 font-mono text-small whitespace-pre-wrap text-foreground">
                                {formula}
                            </pre>
                        )}
                    </HintSection>
                    <HintSection title="Unité">
                        <p>{unit}</p>
                    </HintSection>
                    {readingTip && (
                        <HintSection title="Comment le lire">
                            <p>{readingTip}</p>
                        </HintSection>
                    )}
                    <p className="text-small">Source : {source}</p>
                </div>
            </AppSheet>
        </span>
    )
}
