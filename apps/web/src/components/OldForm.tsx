// components/form.tsx
"use client";

import type { ReactNode } from "react";
import {
    get,
    useForm,
    type FieldValues,
    type Path,
    type SubmitHandler,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export interface FormInput<T extends FieldValues> {
    name: Path<T>;
    label: string;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
}

interface FormProps<T extends FieldValues> {
    title: string;
    description?: string;
    inputs: FormInput<T>[];
    submitText: string;
    submittingText?: string;
    onSubmit: (data: T) => Promise<string | void> | string | void;
    footer?: ReactNode;
}

const Form = <T extends FieldValues>({
    title,
    description,
    inputs,
    submitText,
    submittingText = "Loading...",
    onSubmit,
    footer,
}: FormProps<T>) => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<T>();

    const submit: SubmitHandler<T> = async (data) => {
        try {
            const error = await onSubmit(data);
            if (error) setError("root.server", { message: error });
        } catch (e) {
            setError("root.server", {
                message: e instanceof Error ? e.message : "Something went wrong",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <FieldGroup>
                        {inputs.map(({ name, label, type = "text", placeholder, autoComplete }) => {
                            const message = get(errors, name)?.message as string | undefined;
                            return (
                                <Field key={name}>
                                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                                    <Input
                                        id={name}
                                        type={type}
                                        placeholder={placeholder}
                                        autoComplete={autoComplete}
                                        {...register(name, { required: `${label} is required` })}
                                    />
                                    {message && <FieldError>{message}</FieldError>}
                                </Field>
                            );
                        })}

                        {errors.root?.server && (
                            <FieldError>{errors.root.server.message}</FieldError>
                        )}

                        <Field>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? submittingText : submitText}
                            </Button>
                            {footer}
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
};

export default Form;