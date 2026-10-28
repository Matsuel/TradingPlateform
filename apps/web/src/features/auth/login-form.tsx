"use client";

import { useRouter } from "next/navigation";
import Form from "@/components/OldForm";
import { authClient } from "@/lib/auth";
import { prefix } from "@/lib/path";

type Inputs = {
    email: string;
    password: string;
};

export function LoginForm() {
    const router = useRouter();

    const onSubmit = async ({ email, password }: Inputs) => {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) return error.message ?? "Invalid credentials";
        router.push(prefix);
        router.refresh();
    }

    return (
        <Form<Inputs>
            title="Login to your account"
            description="Enter your email below to login to your account"
            inputs={[
                { name: "email", label: "Email", type: "email"},
                { name: "password", label: "Password", type: "password" },
            ]}
            submitText="Login"
            submittingText="Logging in..."
            onSubmit={onSubmit}
        />
    );
}
