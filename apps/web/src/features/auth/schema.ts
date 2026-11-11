import type { useTranslations } from "next-intl"
import { z } from "zod"

// Règles de better-auth côté core-backend (emailAndPassword par défaut : 8 à 128 caractères)
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

type ValidationTranslator = ReturnType<typeof useTranslations<"auth.validation">>

/** Schémas des formulaires d'authentification, messages d'erreur dans la langue de `t` (`auth.validation`). */
export function createLoginSchema(t: ValidationTranslator) {
    return z.object({
        email: z.email(t("invalidEmail")),
        password: z.string().min(1, t("required")),
    })
}

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>

export function createRegisterSchema(t: ValidationTranslator) {
    return z.object({
        name: z.string().trim().min(1, t("required")),
        email: z.email(t("invalidEmail")),
        password: z
            .string()
            .min(PASSWORD_MIN_LENGTH, t("minLength", { count: PASSWORD_MIN_LENGTH }))
            .max(PASSWORD_MAX_LENGTH, t("maxLength", { count: PASSWORD_MAX_LENGTH })),
    })
}

export type RegisterValues = z.infer<ReturnType<typeof createRegisterSchema>>
