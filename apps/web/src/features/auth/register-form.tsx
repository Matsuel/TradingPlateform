"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { FormSection, TextField } from "@/components/form"
import { Button } from "@/components/ui/button"
import { authPaths, prefix } from "@/lib/path"
import { useRegister } from "./hook"
import { registerSchema, type RegisterValues } from "./schema"

export function RegisterForm() {
    const router = useRouter()
    const { mutateAsync, error } = useRegister()
    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "" },
    })

    const onSubmit = async (values: RegisterValues) => {
        await mutateAsync(values)
        router.push(prefix)
        router.refresh() // relit la session côté serveur
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FormSection title="Créer un compte" description="Renseignez vos informations pour créer votre compte">
                    <TextField name="name" label="Nom" />
                    <TextField name="email" label="Email" type="email" />
                    <TextField name="password" label="Mot de passe" type="password" />

                    {error && <p className="text-sm text-destructive">{error.message}</p>}

                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        Créer le compte
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Déjà un compte ? <Link href={authPaths.login} className="underline">Se connecter</Link>
                    </p>
                </FormSection>
            </form>
        </FormProvider>
    )
}
