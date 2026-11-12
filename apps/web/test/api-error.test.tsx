import { expect, test } from "bun:test"
import { ApiError } from "../src/lib/api"
import { useApiErrorMessages } from "../src/lib/api-error"
import { renderHookIn } from "./render"

test("un code connu est traduit dans la langue active", () => {
    const error = new ApiError(404, "Not Found", { error: "Backtest not found", code: "BACKTEST_NOT_FOUND" })

    expect(renderHookIn("fr", useApiErrorMessages).result.current.errorMessage(error)).toBe("Backtest introuvable.")
    expect(renderHookIn("en", useApiErrorMessages).result.current.errorMessage(error)).toBe("Backtest not found.")
})

test("un code inconnu, l'absence de code ou une erreur réseau donnent le message générique", () => {
    const { errorMessage } = renderHookIn("en", useApiErrorMessages).result.current

    expect(errorMessage(new ApiError(500, "x", { code: "CODE_QUI_N_EXISTE_PAS" }))).toBe(
        "Something went wrong. Try again in a moment.",
    )
    expect(errorMessage(new ApiError(502, "x", null))).toBe("Something went wrong. Try again in a moment.")
    expect(errorMessage(new TypeError("fetch failed"))).toBe("Something went wrong. Try again in a moment.")
})

test("issueMessage traduit le code d'une issue de validation, null donne le générique", () => {
    const { issueMessage } = renderHookIn("fr", useApiErrorMessages).result.current

    expect(issueMessage("END_BEFORE_START")).toBe("La date de fin doit être postérieure à la date de début.")
    expect(issueMessage(null)).toBe("Une erreur est survenue. Réessayez dans un instant.")
})
