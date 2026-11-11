import { expect, test } from "bun:test"
import en from "./en.json"
import fr from "./fr.json"

// Clés d'un dictionnaire sous forme de chemins (`backtest.status.PENDING`)
const keysOf = (value: object, prefix = ""): string[] =>
    Object.entries(value).flatMap(([key, child]) =>
        typeof child === "object" && child !== null ? keysOf(child, `${prefix}${key}.`) : [`${prefix}${key}`],
    )

// Une clé absente d'une langue s'affiche brute à l'écran : les deux dictionnaires portent exactement les mêmes clés
test("fr.json et en.json ont les mêmes clés", () => {
    const frKeys = new Set(keysOf(fr))
    const enKeys = new Set(keysOf(en))

    expect([...frKeys].filter((key) => !enKeys.has(key))).toEqual([])
    expect([...enKeys].filter((key) => !frKeys.has(key))).toEqual([])
})
