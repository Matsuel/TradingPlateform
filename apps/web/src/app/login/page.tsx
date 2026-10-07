"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isLoading },
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = async (data) => {

        const { error } = await authClient.signIn.email({ email: data.email, password: data.password });

        if (error) {
            return;
        }
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className={cn("flex flex-col gap-6")}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Login to your account</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                            {...register("email", { required: "Email is required" })}
                                        />
                                        {errors.email && (
                                            <FieldError>{errors.email.message}</FieldError>
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            {...register("password", { required: "Password is required" })}
                                        />
                                        {errors.password && (
                                            <FieldError>{errors.password.message}</FieldError>
                                        )}
                                    </Field>
                                    <Field>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? "Logging in..." : "Login"}
                                        </Button>
                                        <Button variant="outline" type="button">
                                            Login with Google
                                        </Button>
                                        <FieldDescription className="text-center">
                                            Don&apos;t have an account? <a href="#">Sign up</a>
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}