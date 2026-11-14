import { expect, test } from "bun:test"
import { API_ERROR_CODES } from "@azimut/contracts"
import { createTranslator } from "next-intl"
import en from "../messages/en.json"
import fr from "../messages/fr.json"
import { GLOSSARY } from "../src/constants/glossary"
import type { Locale } from "../src/i18n/config"

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

// Un code renvoyé par l'API sans traduction afficherait le message générique : chaque code a sa phrase dans les deux langues
test("chaque code d'erreur de l'API a une traduction, sans clé en trop", () => {
    for (const dictionary of [fr, en]) {
        const codes = new Set<string>(Object.values(API_ERROR_CODES))
        const missing = [...codes].filter((code) => !(code in dictionary.errors))
        const orphans = Object.keys(dictionary.errors).filter((key) => key !== "generic" && !codes.has(key))
        expect(missing).toEqual([])
        expect(orphans).toEqual([])
    }
})

const dictionaries = { fr, en }
const REQUIRED_FIELDS = ["title", "purpose", "computation", "unit"]
const SHARED_PLACEHOLDERS = ["moneyUnit", "marketMoneyUnit", "twr"]

// Textes de chaque entrée du glossaire dans une langue : `glossary.<clé>.<champ>` (`shared` mis à part)
const glossaryEntries = (dictionary: typeof fr) =>
    Object.entries(dictionary.glossary).filter(([key]) => key !== "shared")

// `GLOSSARY` porte les sources, le dictionnaire les textes : une entrée sans l'autre s'afficherait vide ou brute
test.each(Object.entries(dictionaries))(
    "glossaire %s : une entrée de texte par clé de GLOSSARY",
    (_lang, dictionary) => {
        expect(
            glossaryEntries(dictionary)
                .map(([key]) => key)
                .sort(),
        ).toEqual(Object.keys(GLOSSARY).sort())
    },
)

test.each(Object.entries(dictionaries))(
    "glossaire %s : champs obligatoires et phrases partagées",
    (_lang, dictionary) => {
        for (const [key, texts] of glossaryEntries(dictionary)) {
            for (const field of REQUIRED_FIELDS) expect(texts, `${key}.${field}`).toHaveProperty(field)
            for (const text of Object.values(texts)) {
                const placeholders = [...String(text).matchAll(/\{(\w+)\}/g)].map((match) => match[1])
                for (const name of placeholders) expect(SHARED_PLACEHOLDERS, `${key} : {${name}}`).toContain(name)
            }
        }
        // Une phrase partagée est du texte brut : elle ne s'insère pas elle-même
        for (const text of Object.values(dictionary.glossary.shared)) expect(text).not.toMatch(/[{}]/)
    },
)

// La même phrase partagée est insérée dans les deux langues : FR et EN n'en oublient aucune
test("glossaire : mêmes phrases partagées insérées en FR et EN", () => {
    const used = (dictionary: typeof fr) =>
        glossaryEntries(dictionary).map(([key, texts]) => [
            key,
            JSON.stringify(texts)
                .match(/\{\w+\}/g)
                ?.sort(),
        ])
    expect(used(en)).toEqual(used(fr))
})

// Chaque texte se formate sans erreur ICU et sans paramètre laissé brut
test.each(Object.entries(dictionaries))("glossaire %s : textes formatés sans erreur", (locale, dictionary) => {
    const t = createTranslator({ locale: locale as Locale, messages: dictionary as never })
    const shared = Object.fromEntries(SHARED_PLACEHOLDERS.map((name) => [name, t(`glossary.shared.${name}` as never)]))
    for (const [key, texts] of glossaryEntries(dictionary)) {
        for (const field of Object.keys(texts)) {
            expect(t(`glossary.${key}.${field}` as never, shared as never), `${key}.${field}`).not.toMatch(/[{}]/)
        }
    }
})
