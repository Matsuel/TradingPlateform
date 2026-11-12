"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { FormProvider, useForm } from "react-hook-form"

import { FormSection, TextField } from "@/components/form"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { routes } from "@/lib/routes"
import { useAuthErrorMessage, useLogin } from "./hook"
import { createLoginSchema, type LoginValues } from "./schema"

/** Formulaire de connexion ; `redirectTo` : page ouverte après succès, déjà validée par `safeRedirect`. */
export function LoginForm({ redirectTo }: { redirectTo: string }) {
    const t = useTranslations("auth")
    const router = useRouter()
    const authErrorMessage = useAuthErrorMessage()
    const { mutateAsync, error } = useLogin()
    const form = useForm<LoginValues>({
        resolver: zodResolver(createLoginSchema(useTranslations("auth.validation"))),
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
                <FormSection title={t("login.title")} description={t("login.description")}>
                    <TextField name="email" label={t("fields.email")} type="email" />
                    <TextField name="password" label={t("fields.password")} type="password" />

                    {error && <FieldError>{authErrorMessage(error, t("login.failed"))}</FieldError>}

                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {t("login.submit")}
                    </Button>
                    <p className="text-center text-body text-muted-foreground">
                        {t("login.noAccount")}{" "}
                        <Link href={routes.register} className="underline">
                            {t("login.createAccount")}
                        </Link>
                    </p>
                </FormSection>
            </form>
        </FormProvider>
    )
}
