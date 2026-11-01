"use client"

import type { MouseEvent, ReactNode } from "react"
import AppSheet from "@/components/app-sheet/app-sheet"
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

/**
 * Libellé souligné en pointillés qui ouvre l'explication d'une donnée du glossaire dans un panneau à droite (maquettes 15 et 15.1).
 * `value` : valeur déjà formatée par l'écran, rappelée dans le panneau, jamais recalculée.
 * Le clic n'atteint pas le parent (ligne cliquable, formulaire).
 */
export function InfoHint({ entry, value, children }: { entry: GlossaryKey; value?: ReactNode; children: ReactNode }) {
    const { title, purpose, computation, formula, unit, readingTip, source }: GlossaryEntry = GLOSSARY[entry]

    return (
        <span onClick={stopPropagation} className="contents">
            <AppSheet
                title={title}
                className="sm:max-w-md"
                trigger={
                    <button
                        type="button"
                        aria-haspopup="dialog"
                        className="cursor-help text-left underline decoration-muted-foreground decoration-dotted underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                    >
                        {children}
                    </button>
                }
            >
                <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-6 text-body text-muted-foreground">
                    {value != null && (
                        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted px-4 py-3">
                            <span>Valeur affichée</span>
                            <span className="text-body-semibold text-foreground">{value}</span>
                        </div>
                    )}
                    <HintSection title="À quoi ça sert">
                        <p>{purpose}</p>
                    </HintSection>
                    <HintSection title="Comment c’est calculé">
                        <p>{computation}</p>
                        {formula && (
                            <pre className="rounded-lg bg-muted px-4 py-3 font-mono text-small whitespace-pre-wrap text-foreground">{formula}</pre>
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
