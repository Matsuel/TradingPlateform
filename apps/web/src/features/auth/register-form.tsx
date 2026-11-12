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
import { useAuthErrorMessage, useRegister } from "./hook"
import { createRegisterSchema, type RegisterValues } from "./schema"

export function RegisterForm() {
    const t = useTranslations("auth")
    const router = useRouter()
    const authErrorMessage = useAuthErrorMessage()
    const { mutateAsync, error } = useRegister()
    const form = useForm<RegisterValues>({
        resolver: zodResolver(createRegisterSchema(useTranslations("auth.validation"))),
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
                <FormSection title={t("register.title")} description={t("register.description")}>
                    <TextField name="name" label={t("fields.name")} />
                    <TextField name="email" label={t("fields.email")} type="email" />
                    <TextField name="password" label={t("fields.password")} type="password" />

                    {error && <FieldError>{authErrorMessage(error, t("register.failed"))}</FieldError>}

                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {t("register.submit")}
                    </Button>
                    <p className="text-center text-body text-muted-foreground">
                        {t("register.hasAccount")}{" "}
                        <Link href={routes.login} className="underline">
                            {t("register.login")}
                        </Link>
                    </p>
                </FormSection>
            </form>
        </FormProvider>
    )
}
