"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"

import { FormSection, TextField } from "@/components/form"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { routes } from "@/lib/routes"
import { useRegister } from "./hook"
import { type RegisterValues, registerSchema } from "./schema"

export function RegisterForm() {
    const router = useRouter()
    const { mutateAsync, error } = useRegister()
    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "" },
    })

    const onSubmit = async (values: RegisterValues) => {
        await mutateAsync(values)
        router.push(routes.dashboard)
        router.refresh() // relit la session côté serveur
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FormSection title="Créer un compte" description="Renseignez vos informations pour créer votre compte">
                    <TextField name="name" label="Nom" />
                    <TextField name="email" label="Email" type="email" />
                    <TextField name="password" label="Mot de passe" type="password" />

                    {error && <FieldError>{error.message}</FieldError>}

                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        Créer le compte
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Déjà un compte ?{" "}
                        <Link href={routes.login} className="underline">
                            Se connecter
                        </Link>
                    </p>
                </FormSection>
            </form>
        </FormProvider>
    )
}
