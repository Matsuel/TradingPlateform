import { z } from "zod"

// Règles de better-auth côté core-backend (emailAndPassword par défaut : 8 à 128 caractères)
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

const email = z.email("Email invalide")

export const loginSchema = z.object({
    email,
    password: z.string().min(1, "Requis"),
})

export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Requis"),
    email,
    password: z
        .string()
        .min(PASSWORD_MIN_LENGTH, `Au moins ${PASSWORD_MIN_LENGTH} caractères`)
        .max(PASSWORD_MAX_LENGTH, `Au plus ${PASSWORD_MAX_LENGTH} caractères`),
})

export type RegisterValues = z.infer<typeof registerSchema>
