"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"

import { FormSection, TextField } from "@/components/form"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { routes } from "@/lib/routes"
import { useLogin } from "./hook"
import { type LoginValues, loginSchema } from "./schema"

/** Formulaire de connexion ; `redirectTo` : page ouverte après succès, déjà validée par `safeRedirect`. */
export function LoginForm({ redirectTo }: { redirectTo: string }) {
    const router = useRouter()
    const { mutateAsync, error } = useLogin()
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    const onSubmit = async (values: LoginValues) => {
        await mutateAsync(values)
        router.push(redirectTo)
        router.refresh() // relit la session côté serveur
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FormSection title="Connexion" description="Connectez-vous avec votre email et votre mot de passe">
                    <TextField name="email" label="Email" type="email" />
                    <TextField name="password" label="Mot de passe" type="password" />

                    {error && <FieldError>{error.message}</FieldError>}

                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        Se connecter
                    </Button>
                    <p className="text-center text-body text-muted-foreground">
                        Pas encore de compte ?{" "}
                        <Link href={routes.register} className="underline">
                            Créer un compte
                        </Link>
                    </p>
                </FormSection>
            </form>
        </FormProvider>
    )
}
