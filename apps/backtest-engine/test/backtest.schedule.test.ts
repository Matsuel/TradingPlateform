import { expect, test } from "bun:test"
import { businessDays, estimateSchedule } from "@trading-plateform/utils"

const day = (iso: string) => new Date(`${iso}T00:00:00Z`)

test("businessDays exclut les week-ends et la date de fin", () => {
    // Ven 5 → lun 8 janvier 2024 (fin exclue) : seul le vendredi
    expect(businessDays(day("2024-01-05"), day("2024-01-08"))).toEqual(["2024-01-05"])
    // Samedi et dimanche seuls : aucun jour
    expect(businessDays(day("2024-01-06"), day("2024-01-08"))).toEqual([])
})

test("investissement unique : un seul versement, rebalancements par période hors la première", () => {
    const monthly = estimateSchedule(day("2024-01-01"), day("2024-04-01"), "LUMP_SUM", "MONTHLY")
    expect(monthly).toEqual({ contributionCount: 1, rebalanceCount: 2 })

    expect(estimateSchedule(day("2024-01-01"), day("2024-04-01"), "LUMP_SUM", "QUARTERLY").rebalanceCount).toBe(0)
    expect(estimateSchedule(day("2024-01-01"), day("2024-04-01"), "LUMP_SUM", "NONE").rebalanceCount).toBe(0)
})

test("versements récurrents : un par mois entamé", () => {
    expect(estimateSchedule(day("2024-01-01"), day("2024-04-01"), "RECURRING", "NONE").contributionCount).toBe(3)
    // Période de 10 jours à cheval sur deux mois : deux versements
    expect(estimateSchedule(day("2024-01-29"), day("2024-02-09"), "RECURRING", "NONE").contributionCount).toBe(2)
})

test("période sans jour ouvré : aucun versement", () => {
    expect(estimateSchedule(day("2024-01-06"), day("2024-01-08"), "LUMP_SUM", "NONE")).toEqual({ contributionCount: 0, rebalanceCount: 0 })
})
