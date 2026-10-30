"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { FormSection, TextField } from "@/components/form"
import { Button } from "@/components/ui/button"
import { authPaths, prefix } from "@/lib/path"
import { useLogin } from "./hook"
import { loginSchema, type LoginValues } from "./schema"

export function LoginForm() {
    const router = useRouter()
    const { mutateAsync, error } = useLogin()
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    const onSubmit = async (values: LoginValues) => {
        await mutateAsync(values)
        router.push(prefix)
        router.refresh() // relit la session côté serveur
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FormSection title="Connexion" description="Connectez-vous avec votre email et votre mot de passe">
                    <TextField name="email" label="Email" type="email" />
                    <TextField name="password" label="Mot de passe" type="password" />

                    {error && <p className="text-sm text-destructive">{error.message}</p>}

                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        Se connecter
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Pas encore de compte ? <Link href={authPaths.register} className="underline">Créer un compte</Link>
                    </p>
                </FormSection>
            </form>
        </FormProvider>
    )
}
