import { expect, test } from "bun:test"
import { addYears } from "@azimut/utils"

const day = (iso: string) => new Date(`${iso}T00:00:00Z`)
const iso = (date: Date) => date.toISOString().slice(0, 10)

test("addYears ajoute des années civiles en UTC", () => {
    expect(iso(addYears(day("2020-06-15"), 3))).toBe("2023-06-15")
    expect(iso(addYears(day("2020-06-15"), -1))).toBe("2019-06-15")
})

test("addYears : un 29 février retombe le 1er mars hors année bissextile", () => {
    expect(iso(addYears(day("2020-02-29"), 1))).toBe("2021-03-01")
    expect(iso(addYears(day("2020-02-29"), 4))).toBe("2024-02-29")
})

test("addYears écarte l'heure", () => {
    expect(addYears(new Date("2020-06-15T17:30:00Z"), 1).toISOString()).toBe("2021-06-15T00:00:00.000Z")
})

// Ancienne version chaîne du moteur : le résultat doit rester identique
const legacy = (date: string, years: number) => {
    const shifted = new Date(date)
    shifted.setUTCFullYear(shifted.getUTCFullYear() + years)
    return shifted.toISOString().slice(0, 10)
}

test("addYears donne les mêmes jours que l'ancienne version chaîne, 29 février compris", () => {
    for (const date of ["2020-02-29", "2024-02-29", "2019-12-31", "2021-01-01", "2000-02-29", "2023-03-01"]) {
        for (const years of [1, 3, 5]) {
            expect(iso(addYears(new Date(date), years))).toBe(legacy(date, years))
        }
    }
})
