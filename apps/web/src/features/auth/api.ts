import { signIn, signUp } from "@/lib/auth";
import type { LoginValues, RegisterValues } from "./schema";

// Les routes /api/auth passent par le client better-auth (cookies de session), pas par apiFetch.
// Une erreur better-auth est relancée pour que les mutations TanStack la portent.
export async function login(values: LoginValues): Promise<void> {
    const { error } = await signIn.email(values);
    if (error) throw new Error(error.message ?? "Identifiants invalides");
}

export async function register(values: RegisterValues): Promise<void> {
    const { error } = await signUp.email(values);
    if (error) throw new Error(error.message ?? "Inscription impossible");
}
