import { expect, test } from "bun:test"
import { AuthError } from "../src/features/auth/api"
import { useAuthErrorMessage } from "../src/features/auth/hook"
import { renderHookIn } from "./render"

test("un code better-auth connu est traduit", () => {
    const message = renderHookIn("fr", useAuthErrorMessage).result.current

    expect(
        message(new AuthError({ code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid email or password" }), "repli"),
    ).toBe("Email ou mot de passe incorrect.")
})

test("un code inconnu, sans code ou une erreur réseau retombent sur le libellé du formulaire", () => {
    const message = renderHookIn("en", useAuthErrorMessage).result.current

    expect(message(new AuthError({ code: "AUTRE", message: "x" }), "Sign-in failed")).toBe("Sign-in failed")
    expect(message(new AuthError({}), "Sign-in failed")).toBe("Sign-in failed")
    expect(message(new TypeError("fetch failed"), "Sign-in failed")).toBe("Sign-in failed")
})
